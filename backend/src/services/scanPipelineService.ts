import { calculateIndex, FORMULA_VERSION } from '@dermis/domain/server';
import { randomUUID } from 'node:crypto';

import type { SkinAnalyzer } from '../adapters/SkinAnalyzer';
import type { PhotoStorage } from '../adapters/PhotoStorage';
import { HttpError } from '../http/HttpError';
import type { ProfileRepository } from '../repositories/profileTypes';
import type { ScanRecordRow, ScanRepository } from '../repositories/scanTypes';
import type { QuotaService } from './quotaService';
import { decodeAndValidateImage } from './validateScanImage';

export type CreateScanInput = {
  userId: string;
  idempotencyKey: string;
  imageBase64: string;
  contentType: string;
};

export type ScanPipelineService = {
  createScan: (input: CreateScanInput) => Promise<{
    scan: ScanRecordRow;
    replayed: boolean;
  }>;
  /** Newest first. */
  listScans: (userId: string) => Promise<ScanRecordRow[]>;
  /** Deletes all scans for the user. Returns how many were removed. */
  deleteAllScans: (userId: string) => Promise<number>;
};

export type FaceAnalysisConsentGate = {
  requireFaceAnalysisConsent: (userId: string) => Promise<void>;
};

export type ScanPipelineDeps = {
  scans: ScanRepository;
  profiles: ProfileRepository;
  quota: QuotaService;
  analyzer: SkinAnalyzer & { model: string; promptVersion: string };
  photos: PhotoStorage;
  /** Required before analyze — refuses without current face_analysis consent. */
  consent: FaceAnalysisConsentGate;
  /** Kill switch — when true, refuse new scans. */
  disabled?: boolean;
};

/**
 * Auth is handled by the HTTP layer. Pipeline:
 * idempotency → consent → quota check → validate → store photo → analyze →
 * consume+insert → delete photo.
 */
export function createScanPipelineService(deps: ScanPipelineDeps): ScanPipelineService {
  return {
    async createScan(input) {
      if (deps.disabled) {
        throw new HttpError(503, 'scan_pipeline_disabled');
      }

      const existing = await deps.scans.findByIdempotencyKey(input.userId, input.idempotencyKey);
      if (existing) {
        return { scan: existing, replayed: true };
      }

      await deps.consent.requireFaceAnalysisConsent(input.userId);

      // Fail fast before spending Gemini time/tokens.
      const quota = await deps.quota.getStatus(input.userId);
      if (quota.remaining <= 0) {
        throw new HttpError(402, quota.plan === 'pro' ? 'daily_limit' : 'free_limit');
      }

      const bytes = decodeAndValidateImage(input.imageBase64, input.contentType);
      const photoPath = await deps.photos.store({
        userId: input.userId,
        bytes,
        contentType: input.contentType,
      });

      try {
        return await runAnalyzeAndPersist(deps, {
          input,
          bytes,
          contentType: input.contentType,
          photoPath,
        });
      } catch (error) {
        await deps.photos.delete(photoPath);
        throw mapPipelineError(error);
      }
    },
    async listScans(userId) {
      const rows = await deps.scans.listByUserId(userId);
      return rows.slice().sort((a, b) => b.takenAt.localeCompare(a.takenAt));
    },
    async deleteAllScans(userId) {
      return deps.scans.deleteAllForUser(userId);
    },
  };
}

async function runAnalyzeAndPersist(
  deps: ScanPipelineDeps,
  ctx: {
    input: CreateScanInput;
    bytes: Uint8Array;
    contentType: string;
    photoPath: string;
  },
): Promise<{ scan: ScanRecordRow; replayed: boolean }> {
  const analysis = await analyzeOrThrow(deps, ctx);
  // Trust faceClear only — models sometimes set a leftover faceIssue with faceClear=true.
  // Never persist unclear faces — reject before quota consume / insert.
  if (!analysis.faceClear) {
    const code = faceIssueToErrorCode(
      analysis.faceIssue && analysis.faceIssue !== 'none' ? analysis.faceIssue : 'face_not_clear',
    );
    const detail = sanitizeFaceGuidance(analysis.faceGuidance);
    throw new HttpError(422, code, detail);
  }

  const profile = await deps.profiles.findByUserId(ctx.input.userId);
  const priorities = profile?.priorityConcerns ?? [];
  const index = calculateIndex({ scores: analysis.concerns, priorities });

  const consumed = await deps.quota.consume(ctx.input.userId);
  if (!consumed.allowed) {
    throw new HttpError(402, consumed.reason);
  }

  return persistScanAfterQuota(deps, ctx, analysis, index);
}

async function analyzeOrThrow(
  deps: ScanPipelineDeps,
  ctx: { input: CreateScanInput; bytes: Uint8Array; contentType: string },
) {
  try {
    return await deps.analyzer.analyze({
      userId: ctx.input.userId,
      imageBytes: ctx.bytes,
      contentType: ctx.contentType,
    });
  } catch (error) {
    throw mapAnalyzerError(error);
  }
}

async function persistScanAfterQuota(
  deps: ScanPipelineDeps,
  ctx: { input: CreateScanInput; photoPath: string },
  analysis: Awaited<ReturnType<ScanPipelineDeps['analyzer']['analyze']>>,
  index: ReturnType<typeof calculateIndex>,
): Promise<{ scan: ScanRecordRow; replayed: boolean }> {
  try {
    const scan = await deps.scans.insert({
      id: randomUUID(),
      userId: ctx.input.userId,
      takenAt: new Date().toISOString(),
      indexScore: index.index,
      concerns: analysis.concerns,
      zones: analysis.zones,
      weights: index.weights,
      formulaVersion: FORMULA_VERSION,
      model: deps.analyzer.model,
      promptVersion: deps.analyzer.promptVersion,
      idempotencyKey: ctx.input.idempotencyKey,
    });
    await deps.photos.delete(ctx.photoPath);
    return { scan, replayed: false };
  } catch (error) {
    try {
      await deps.quota.refund(ctx.input.userId);
    } catch {
      // Live Supabase refund is not implemented yet — do not mask the insert error.
    }
    throw error;
  }
}

function mapAnalyzerError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }
  const message = error instanceof Error ? error.message : '';
  if (message.includes('AbortError') || message.includes('abort')) {
    return new HttpError(504, 'analyzer_timeout');
  }
  if (message.startsWith('gemini_http_')) {
    return new HttpError(502, 'analyzer_unavailable');
  }
  return new HttpError(502, 'analyzer_failed');
}

function mapPipelineError(error: unknown): unknown {
  if (error instanceof HttpError) {
    return error;
  }
  if (error instanceof Error) {
    if (error.message === 'quota_consume_failed' || error.message === 'quota_consume_invalid_response') {
      return new HttpError(502, 'quota_unavailable');
    }
    if (error.message.startsWith('gemini_') || error.name === 'ZodError') {
      return new HttpError(502, 'analyzer_failed');
    }
  }
  return error;
}

function faceIssueToErrorCode(issue: string | undefined): string {
  switch (issue) {
    case 'no_face':
      return 'no_face';
    case 'multiple_faces':
      return 'multiple_faces';
    case 'too_far':
      return 'face_too_far';
    case 'too_close':
      return 'face_too_close';
    case 'blurry':
      return 'face_blurry';
    case 'poor_lighting':
      return 'face_poor_lighting';
    case 'obstructed':
      return 'face_obstructed';
    case 'glasses':
      return 'face_glasses';
    case 'not_front_facing':
      return 'face_not_front';
    default:
      return 'face_not_clear';
  }
}

/** Keep model tips short and safe for toast UI. */
function sanitizeFaceGuidance(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  if (trimmed.length < 8) {
    return undefined;
  }
  return trimmed.slice(0, 160);
}

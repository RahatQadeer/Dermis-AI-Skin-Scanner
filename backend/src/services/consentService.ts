import { consentGrantInputSchema } from '@dermis/domain/server';

import { FACE_ANALYSIS_CONSENT_VERSION, REQUIRED_SCAN_CONSENT_TYPE } from '../constants/consent';
import { HttpError } from '../http/HttpError';
import type {
  ConsentRecordRow,
  ConsentRepository,
  ConsentType,
} from '../repositories/consentTypes';

export type ConsentDto = {
  id: string;
  type: ConsentType;
  version: string;
  grantedAt: string;
  revokedAt: string | null;
};

export type ConsentStatusDto = {
  faceAnalysis: {
    requiredVersion: string;
    granted: boolean;
    activeVersion: string | null;
  };
};

export type ConsentService = {
  list: (userId: string) => Promise<ConsentDto[]>;
  status: (userId: string) => Promise<ConsentStatusDto>;
  applyGrant: (userId: string, body: unknown) => Promise<ConsentDto>;
  /** Throws 403 if current face-analysis consent is missing or outdated. */
  requireFaceAnalysisConsent: (userId: string) => Promise<void>;
};

export function createConsentService(repo: ConsentRepository): ConsentService {
  return {
    async list(userId) {
      const rows = await repo.listByUserId(userId);
      return rows.map(toDto);
    },
    async status(userId) {
      const active = await repo.findActive(userId, REQUIRED_SCAN_CONSENT_TYPE);
      const granted = active?.version === FACE_ANALYSIS_CONSENT_VERSION;
      return {
        faceAnalysis: {
          requiredVersion: FACE_ANALYSIS_CONSENT_VERSION,
          granted,
          activeVersion: active?.version ?? null,
        },
      };
    },
    async applyGrant(userId, body) {
      const parsed = consentGrantInputSchema.safeParse(body);
      if (!parsed.success) {
        throw new HttpError(400, 'invalid_consent');
      }
      const { type, version, granted } = parsed.data;
      if (!granted) {
        const revoked = await repo.revokeActive(userId, type);
        if (!revoked) {
          throw new HttpError(404, 'consent_not_found');
        }
        return toDto(revoked);
      }
      return grant(repo, userId, type, version);
    },
    async requireFaceAnalysisConsent(userId) {
      const active = await repo.findActive(userId, REQUIRED_SCAN_CONSENT_TYPE);
      if (!active || active.version !== FACE_ANALYSIS_CONSENT_VERSION) {
        throw new HttpError(403, 'consent_required');
      }
    },
  };
}

async function grant(
  repo: ConsentRepository,
  userId: string,
  type: ConsentType,
  version: string,
): Promise<ConsentDto> {
  const existing = await repo.findActive(userId, type);
  if (existing?.version === version) {
    return toDto(existing);
  }
  if (existing) {
    await repo.revokeActive(userId, type);
  }
  const row = await repo.insertGrant({ userId, type, version });
  return toDto(row);
}

function toDto(row: ConsentRecordRow): ConsentDto {
  return {
    id: row.id,
    type: row.type,
    version: row.version,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
  };
}

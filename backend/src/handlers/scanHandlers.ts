import { HttpError } from '../http/HttpError';
import { json } from '../http/respond';
import { createScanBodySchema } from '../schemas/createScan';
import type { ScanPipelineService } from '../services/scanPipelineService';
import type { ScanRecordRow } from '../repositories/scanTypes';

export async function handleCreateScan(
  service: ScanPipelineService,
  userId: string,
  body: unknown,
): Promise<Response> {
  const parsed = createScanBodySchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, 'invalid_body');
  }

  const result = await service.createScan({
    userId,
    ...parsed.data,
  });

  return json(
    {
      scan: toScanDto(result.scan),
      replayed: result.replayed,
    },
    result.replayed ? 200 : 201,
  );
}

export async function handleListScans(
  service: ScanPipelineService,
  userId: string,
): Promise<Response> {
  const scans = await service.listScans(userId);
  return json({ scans: scans.map(toScanDto) });
}

export async function handleDeleteAllScans(
  service: ScanPipelineService,
  userId: string,
): Promise<Response> {
  const deleted = await service.deleteAllScans(userId);
  return json({ deleted });
}

function toScanDto(scan: ScanRecordRow) {
  return {
    id: scan.id,
    userId: scan.userId,
    takenAt: scan.takenAt,
    indexScore: scan.indexScore,
    concerns: scan.concerns,
    zones: scan.zones,
    weights: scan.weights,
    formulaVersion: scan.formulaVersion,
    model: scan.model,
    promptVersion: scan.promptVersion,
    idempotencyKey: scan.idempotencyKey,
    createdAt: scan.createdAt,
  };
}

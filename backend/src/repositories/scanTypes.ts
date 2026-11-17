import type { ConcernScores, ConcernWeights, ZoneScores } from '@dermis/domain/server';

export type ScanRecordRow = {
  id: string;
  userId: string;
  /** Face series that produced this scan (Progress "New face" dividers). */
  faceEnrollmentId: string | null;
  takenAt: string;
  indexScore: number;
  concerns: ConcernScores;
  zones: ZoneScores;
  weights: ConcernWeights;
  formulaVersion: string;
  model: string;
  promptVersion: string;
  idempotencyKey: string;
  createdAt: string;
};

export type ScanInsert = Omit<ScanRecordRow, 'id' | 'createdAt'> & {
  id?: string;
};

export type ScanRepository = {
  findByIdempotencyKey: (userId: string, idempotencyKey: string) => Promise<ScanRecordRow | null>;
  insert: (row: ScanInsert) => Promise<ScanRecordRow>;
  deleteById: (id: string) => Promise<void>;
  listByUserId: (userId: string) => Promise<ScanRecordRow[]>;
  deleteAllForUser: (userId: string) => Promise<number>;
};

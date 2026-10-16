export type ConsentType = 'face_analysis' | 'data_sharing' | 'terms';

export type ConsentRecordRow = {
  id: string;
  userId: string;
  type: ConsentType;
  version: string;
  grantedAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type ConsentGrantInput = {
  userId: string;
  type: ConsentType;
  version: string;
};

export type ConsentRepository = {
  listByUserId: (userId: string) => Promise<ConsentRecordRow[]>;
  findActive: (userId: string, type: ConsentType) => Promise<ConsentRecordRow | null>;
  insertGrant: (input: ConsentGrantInput) => Promise<ConsentRecordRow>;
  revokeActive: (userId: string, type: ConsentType) => Promise<ConsentRecordRow | null>;
  deleteAllForUser: (userId: string) => Promise<void>;
};

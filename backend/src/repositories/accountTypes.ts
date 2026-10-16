export type AccountExportPayload = {
  exportedAt: string;
  userId: string;
  email: string | null;
  profile: unknown;
  settings: unknown;
  entitlement: unknown;
  quota: unknown;
  scans: unknown[];
  routineSteps: unknown[];
  consents: unknown[];
};

export type AccountDataPort = {
  exportForUser: (userId: string, email: string | null) => Promise<AccountExportPayload | null>;
  /** Hard-delete all associated app data. Returns false if nothing to delete. */
  purgeUserData: (userId: string) => Promise<boolean>;
  findUserIdByEmail: (email: string) => Promise<string | null>;
};

export type AuthAdminPort = {
  deleteAuthUser: (userId: string) => Promise<void>;
};

export type DeletionRequestRecord = {
  id: string;
  email: string;
  createdAt: string;
  status: 'completed' | 'not_found';
};

export type DeletionRequestStore = {
  enqueue: (
    email: string,
    status: DeletionRequestRecord['status'],
  ) => Promise<DeletionRequestRecord>;
};

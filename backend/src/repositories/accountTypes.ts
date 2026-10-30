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
  /** Daily routine check-offs. */
  routineCompletions?: unknown[];
  consents: unknown[];
  /** Face-identity reference (embedding + model version), when enrolled. */
  faceReference?: unknown;
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

/**
 * Public (signed-out) deletion requests. Ownership of the email is NOT proven
 * by the web form, so a request is only recorded — the account is deleted
 * after the owner confirms from that inbox (or deletes in-app while signed in).
 */
export type DeletionRequestRecord = {
  id: string;
  email: string;
  userId: string | null;
  createdAt: string;
  status: 'pending_verification' | 'not_found';
};

export type DeletionRequestStore = {
  enqueue: (input: {
    email: string;
    userId: string | null;
    status: DeletionRequestRecord['status'];
  }) => Promise<DeletionRequestRecord>;
  /** Any request for this email created at/after `sinceIso` (form spam guard). */
  hasRecent: (email: string, sinceIso: string) => Promise<boolean>;
};

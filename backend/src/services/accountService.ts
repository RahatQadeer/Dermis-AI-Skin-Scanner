import { HttpError } from '../http/HttpError';
import type {
  AccountDataPort,
  AccountExportPayload,
  AuthAdminPort,
  DeletionRequestStore,
} from '../repositories/accountTypes';

export const ACCOUNT_DELETE_CONFIRMATION = 'DELETE' as const;
export const PUBLIC_DELETE_CONFIRMATION = 'DELETE MY ACCOUNT' as const;

export type AccountService = {
  exportData: (userId: string, email: string | null) => Promise<AccountExportPayload>;
  deleteAccount: (userId: string, confirmation: string) => Promise<void>;
  requestPublicDeletion: (email: string, confirmation: string) => Promise<{ accepted: true }>;
};

export type AccountServiceDeps = {
  data: AccountDataPort;
  authAdmin: AuthAdminPort;
  deletionRequests: DeletionRequestStore;
};

export function createAccountService(deps: AccountServiceDeps): AccountService {
  return {
    async exportData(userId, email) {
      const payload = await deps.data.exportForUser(userId, email);
      if (!payload) {
        throw new HttpError(404, 'account_not_found');
      }
      return payload;
    },
    async deleteAccount(userId, confirmation) {
      if (confirmation !== ACCOUNT_DELETE_CONFIRMATION) {
        throw new HttpError(400, 'invalid_confirmation');
      }
      await deps.data.purgeUserData(userId);
      await deps.authAdmin.deleteAuthUser(userId);
    },
    async requestPublicDeletion(email, confirmation) {
      if (confirmation !== PUBLIC_DELETE_CONFIRMATION) {
        throw new HttpError(400, 'invalid_confirmation');
      }
      const normalized = email.trim().toLowerCase();
      if (!isPlausibleEmail(normalized)) {
        throw new HttpError(400, 'invalid_email');
      }
      const userId = await deps.data.findUserIdByEmail(normalized);
      if (!userId) {
        await deps.deletionRequests.enqueue(normalized, 'not_found');
        return { accepted: true as const };
      }
      await deps.data.purgeUserData(userId);
      await deps.authAdmin.deleteAuthUser(userId);
      await deps.deletionRequests.enqueue(normalized, 'completed');
      return { accepted: true as const };
    },
  };
}

function isPlausibleEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

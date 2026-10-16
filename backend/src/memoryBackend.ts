import { createMemoryPhotoStorage } from './adapters/memoryPhotoStorage';
import { resolveSkinAnalyzer } from './adapters/resolveSkinAnalyzer';
import { createMemoryAuthPort } from './auth/memoryAuthPort';
import type { AppDeps } from './http/createApp';
import {
  createMemoryAccountDataPort,
  createMemoryAuthAdmin,
  createMemoryDeletionRequestStore,
  registerMemoryEmail,
} from './repositories/memoryAccountRepository';
import { createMemoryConsentRepository } from './repositories/memoryConsentRepository';
import {
  createMemoryEntitlementRepository,
  createMemoryWebhookEventRepository,
} from './repositories/memoryEntitlementRepository';
import { createMemoryProfileRepository } from './repositories/memoryProfileRepository';
import { createMemoryQuotaRepository } from './repositories/memoryQuotaRepository';
import { createMemoryRoutineRepository } from './repositories/memoryRoutineRepository';
import { createMemoryScanRepository } from './repositories/memoryScanRepository';
import { createAccountService } from './services/accountService';
import { createConsentService } from './services/consentService';
import { createEntitlementService } from './services/entitlementService';
import { createProfileService } from './services/profileService';
import { createQuotaService } from './services/quotaService';
import { createRoutineService } from './services/routineService';
import { createScanPipelineService } from './services/scanPipelineService';
import { createSettingsService } from './services/settingsService';

export type MemoryEnv = {
  revenueCatWebhookSecret?: string;
  revenueCatProEntitlementId?: string;
  scanPipelineDisabled?: boolean;
  geminiApiKey?: string;
  geminiModel?: string;
  preferFakeAnalyzer?: boolean;
};

export function buildMemoryBackendDeps(env: MemoryEnv = {}): AppDeps {
  const stores = createMemoryStores();
  const services = createMemoryServices(stores, env);
  return {
    auth: createMemoryAuthPort({ deletedUserIds: stores.deletedAuthUsers }),
    profilesFor: () => services.profiles,
    quotaFor: () => services.quota,
    scanPipelineFor: () => services.pipeline,
    routineSettingsFor: () => ({ routine: services.routine, settings: services.settings }),
    accountFor: ({ userId, accessToken }) => {
      maybeRegisterEmail(stores.emailIndex, userId, accessToken);
      return services.account;
    },
    consentsFor: () => services.consents,
    publicAccount: services.account,
    revenueCatWebhook: {
      webhookSecret: resolveMemoryWebhookSecret(env.revenueCatWebhookSecret),
      entitlements: services.entitlements,
    },
    // Memory stack is local-only — allow paywall Subscribe without App Store.
    devEntitlements: services.entitlements,
  };
}

const DEV_WEBHOOK_SECRET = 'dev-revenuecat-webhook-secret';

/** Memory stack may use a known local default; never in production. */
export function resolveMemoryWebhookSecret(secret?: string): string {
  const value = secret?.trim() ? secret.trim() : DEV_WEBHOOK_SECRET;
  if (value === DEV_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error(
      'REVENUECAT_WEBHOOK_SECRET is required when NODE_ENV=production (refusing default memory webhook secret)',
    );
  }
  return value;
}

function createMemoryStores() {
  return {
    profileRepo: createMemoryProfileRepository(),
    entitlementRepo: createMemoryEntitlementRepository(),
    quotaRepo: createMemoryQuotaRepository(),
    scanRepo: createMemoryScanRepository(),
    routineRepo: createMemoryRoutineRepository(),
    consentRepo: createMemoryConsentRepository(),
    emailIndex: new Map<string, string>(),
    deletedAuthUsers: new Set<string>(),
  };
}

function createMemoryServices(stores: ReturnType<typeof createMemoryStores>, env: MemoryEnv) {
  const profiles = createProfileService(stores.profileRepo);
  const quota = createQuotaService(stores.quotaRepo);
  const consents = createConsentService(stores.consentRepo);
  const entitlements = createEntitlementService({
    entitlements: stores.entitlementRepo,
    webhookEvents: createMemoryWebhookEventRepository(),
    proEntitlementId: env.revenueCatProEntitlementId,
  });
  const pipeline = createScanPipelineService({
    scans: stores.scanRepo,
    profiles: stores.profileRepo,
    quota,
    consent: consents,
    analyzer: resolveSkinAnalyzer({
      geminiApiKey: env.geminiApiKey,
      geminiModel: env.geminiModel,
      preferFake: env.preferFakeAnalyzer ?? !env.geminiApiKey,
    }),
    photos: createMemoryPhotoStorage(),
    disabled: env.scanPipelineDisabled,
  });
  const account = createAccountService({
    data: createMemoryAccountDataPort({
      profiles: stores.profileRepo,
      entitlements: stores.entitlementRepo,
      quota: stores.quotaRepo,
      scans: stores.scanRepo,
      routine: stores.routineRepo,
      consents: stores.consentRepo,
      emailIndex: stores.emailIndex,
    }),
    authAdmin: createMemoryAuthAdmin(stores.deletedAuthUsers),
    deletionRequests: createMemoryDeletionRequestStore(),
  });
  return {
    profiles,
    quota,
    entitlements,
    pipeline,
    routine: createRoutineService(stores.routineRepo),
    settings: createSettingsService(stores.profileRepo),
    account,
    consents,
  };
}

function maybeRegisterEmail(
  emailIndex: Map<string, string>,
  userId: string,
  accessToken: string,
): void {
  if (!accessToken.startsWith('user:')) {
    return;
  }
  const email = accessToken.slice('user:'.length).split(':')[1];
  if (email) {
    registerMemoryEmail(emailIndex, email, userId);
  }
}

import type { AuthPort } from './auth/AuthPort';
import { createSupabaseAuthPort } from './auth/supabaseAuthPort';
import { createSupabaseCredentialsPort } from './auth/supabaseCredentials';
import { createApp, type AppDeps } from './http/createApp';
import { buildMemoryBackendDeps } from './memoryBackend';
import { createMemoryPhotoStorage } from './adapters/memoryPhotoStorage';
import { resolveSkinAnalyzer } from './adapters/resolveSkinAnalyzer';
import { createMemoryDeletionRequestStore } from './repositories/memoryAccountRepository';
import { createMemoryQuotaRepository } from './repositories/memoryQuotaRepository';
import { createMemoryRoutineRepository } from './repositories/memoryRoutineRepository';
import { createMemoryScanRepository } from './repositories/memoryScanRepository';
import { createRoutineService } from './services/routineService';
import { createScanPipelineService } from './services/scanPipelineService';
import { createSettingsService } from './services/settingsService';
import {
  createSupabaseAccountDataPort,
  createSupabaseAuthAdmin,
} from './repositories/supabaseAccountRepository';
import { createSupabaseConsentRepository } from './repositories/supabaseConsentRepository';
import { createSupabaseEntitlementRepository } from './repositories/supabaseEntitlementRepository';
import { createSupabaseProfileRepository } from './repositories/supabaseProfileRepository';
import { createSupabaseQuotaRepository } from './repositories/supabaseQuotaRepository';
import { createSupabaseWebhookEventRepository } from './repositories/supabaseWebhookEventRepository';
import { createAccountService } from './services/accountService';
import { createConsentService } from './services/consentService';
import { createEntitlementService } from './services/entitlementService';
import { createProfileService } from './services/profileService';
import { createQuotaService } from './services/quotaService';
import type { BackendEnv } from './backendEnv';

type LiveStores = {
  scans: ReturnType<typeof createMemoryScanRepository>;
  routine: ReturnType<typeof createMemoryRoutineRepository>;
  quota: ReturnType<typeof createQuotaService>;
};

export function createBackendFromEnv(
  env: BackendEnv,
): (request: Request) => Promise<Response> {
  if (env.useMemory || !env.supabaseUrl || !env.supabaseAnonKey) {
    return createMemoryOrHybridBackend(env);
  }
  return createLiveSupabaseBackend(env);
}

function createMemoryOrHybridBackend(
  env: BackendEnv,
): (request: Request) => Promise<Response> {
  const deps = buildMemoryBackendDeps(env);
  if (env.supabaseUrl && env.supabaseAnonKey) {
    deps.credentials = createSupabaseCredentialsPort({
      supabaseUrl: env.supabaseUrl,
      anonKey: env.supabaseAnonKey,
      serviceRoleKey: env.supabaseServiceRoleKey,
    });
  }
  return createApp(deps);
}

function createLiveSupabaseBackend(
  env: BackendEnv,
): (request: Request) => Promise<Response> {
  const auth: AuthPort = createSupabaseAuthPort({
    supabaseUrl: env.supabaseUrl!,
    anonKey: env.supabaseAnonKey!,
  });
  const stores: LiveStores = {
    scans: createMemoryScanRepository(),
    routine: createMemoryRoutineRepository(),
    quota: createQuotaService(createMemoryQuotaRepository()),
  };
  const deps = buildLiveDeps(env, auth, stores);
  if (env.supabaseServiceRoleKey) {
    wireServiceRoleFeatures(deps, env);
  }
  return createApp(deps);
}

function buildLiveDeps(env: BackendEnv, auth: AuthPort, stores: LiveStores): AppDeps {
  const url = env.supabaseUrl!;
  const anon = env.supabaseAnonKey!;
  return {
    auth,
    credentials: createSupabaseCredentialsPort({
      supabaseUrl: url,
      anonKey: anon,
      serviceRoleKey: env.supabaseServiceRoleKey,
    }),
    profilesFor: ({ accessToken }) =>
      createProfileService(
        createSupabaseProfileRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    consentsFor: ({ accessToken }) =>
      createConsentService(
        createSupabaseConsentRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    routineSettingsFor: ({ accessToken }) => ({
      routine: createRoutineService(stores.routine),
      settings: createSettingsService(
        createSupabaseProfileRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    }),
    quotaFor: () => stores.quota,
    scanPipelineFor: ({ accessToken }) =>
      liveScanPipeline({ env, url, anon, stores, accessToken }),
  };
}

function liveScanPipeline(opts: {
  env: BackendEnv;
  url: string;
  anon: string;
  stores: LiveStores;
  accessToken: string;
}) {
  const { env, url, anon, stores, accessToken } = opts;
  return createScanPipelineService({
    scans: stores.scans,
    profiles: createSupabaseProfileRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
    quota: stores.quota,
    consent: createConsentService(
      createSupabaseConsentRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
    ),
    analyzer: resolveSkinAnalyzer({
      geminiApiKey: env.geminiApiKey,
      geminiModel: env.geminiModel,
      preferFake: env.preferFakeAnalyzer ?? !env.geminiApiKey,
    }),
    photos: createMemoryPhotoStorage(),
    disabled: env.scanPipelineDisabled,
  });
}

function wireServiceRoleFeatures(deps: AppDeps, env: BackendEnv): void {
  const quota = createQuotaService(
    createSupabaseQuotaRepository({
      supabaseUrl: env.supabaseUrl!,
      serviceRoleKey: env.supabaseServiceRoleKey!,
    }),
  );
  deps.quotaFor = () => quota;

  const entitlements = createEntitlementService({
    entitlements: createSupabaseEntitlementRepository({
      supabaseUrl: env.supabaseUrl!,
      serviceRoleKey: env.supabaseServiceRoleKey!,
    }),
    webhookEvents: createSupabaseWebhookEventRepository({
      supabaseUrl: env.supabaseUrl!,
      serviceRoleKey: env.supabaseServiceRoleKey!,
    }),
    proEntitlementId: env.revenueCatProEntitlementId,
  });

  if (env.revenueCatWebhookSecret) {
    deps.revenueCatWebhook = {
      webhookSecret: env.revenueCatWebhookSecret,
      entitlements,
    };
  }

  if (shouldExposeDevEntitlements(env)) {
    deps.devEntitlements = entitlements;
  }

  const account = createAccountService({
    data: createSupabaseAccountDataPort({
      supabaseUrl: env.supabaseUrl!,
      serviceRoleKey: env.supabaseServiceRoleKey!,
    }),
    authAdmin: createSupabaseAuthAdmin({
      supabaseUrl: env.supabaseUrl!,
      serviceRoleKey: env.supabaseServiceRoleKey!,
    }),
    deletionRequests: createMemoryDeletionRequestStore(),
  });
  deps.accountFor = () => account;
  deps.publicAccount = account;
}

function shouldExposeDevEntitlements(env: BackendEnv): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return env.allowDevEntitlement === true || env.useMemory === true;
}

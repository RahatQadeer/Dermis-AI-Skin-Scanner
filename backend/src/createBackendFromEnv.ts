import { isProductionRuntime } from '@dermis/domain/server';

import type { AuthPort } from './auth/AuthPort';
import { createSupabaseAuthPort } from './auth/supabaseAuthPort';
import { createSupabaseCredentialsPort } from './auth/supabaseCredentials';
import { createApp, type AppDeps } from './http/createApp';
import { buildMemoryBackendDeps } from './memoryBackend';
import { createMemoryPhotoStorage } from './adapters/memoryPhotoStorage';
import { resolveSkinAnalyzer } from './adapters/resolveSkinAnalyzer';
import { createMemoryQuotaRepository } from './repositories/memoryQuotaRepository';
import { createMemoryRoutineRepository } from './repositories/memoryRoutineRepository';
import { createMemoryScanRepository } from './repositories/memoryScanRepository';
import type { ScanRepository } from './repositories/scanTypes';
import { createRoutineService } from './services/routineService';
import { createScanPipelineService } from './services/scanPipelineService';
import { createSettingsService } from './services/settingsService';
import {
  createSupabaseAccountDataPort,
  createSupabaseAuthAdmin,
} from './repositories/supabaseAccountRepository';
import { createSupabaseDeletionRequestStore } from './repositories/supabaseDeletionRequestRepository';
import { createSupabaseConsentRepository } from './repositories/supabaseConsentRepository';
import { createSupabaseEntitlementRepository } from './repositories/supabaseEntitlementRepository';
import { createSupabaseFaceReferenceRepository } from './repositories/supabaseFaceReferenceRepository';
import { createSupabaseProfileRepository } from './repositories/supabaseProfileRepository';
import { createSupabaseQuotaRepository } from './repositories/supabaseQuotaRepository';
import { createSupabaseScanRepository } from './repositories/supabaseScanRepository';
import { createSupabaseWebhookEventRepository } from './repositories/supabaseWebhookEventRepository';
import { createAccountService } from './services/accountService';
import { createConsentService } from './services/consentService';
import { createEntitlementService } from './services/entitlementService';
import { createFaceReferenceService } from './services/faceReferenceService';
import { createProfileService } from './services/profileService';
import { createQuotaService } from './services/quotaService';
import type { BackendEnv } from './backendEnv';

type LiveStores = {
  scans: ScanRepository;
  routine: ReturnType<typeof createMemoryRoutineRepository>;
  quota: ReturnType<typeof createQuotaService>;
};

export function createBackendFromEnv(env: BackendEnv): (request: Request) => Promise<Response> {
  if (env.useMemory || !env.supabaseUrl || !env.supabaseAnonKey) {
    // The memory stack accepts unsigned dev tokens (`user:<id>:<email>`) —
    // never let a missing Supabase setting silently select it in production.
    if (isProductionRuntime()) {
      throw new Error(
        'Refusing to start: memory backend selected in production (set SUPABASE_URL and SUPABASE_ANON_KEY, and unset DERMIS_BACKEND_MEMORY).',
      );
    }
    return createMemoryOrHybridBackend(env);
  }
  return createLiveSupabaseBackend(env);
}

function createMemoryOrHybridBackend(env: BackendEnv): (request: Request) => Promise<Response> {
  const deps = buildMemoryBackendDeps(env);
  if (env.supabaseUrl && env.supabaseAnonKey) {
    deps.credentials = createSupabaseCredentialsPort({
      supabaseUrl: env.supabaseUrl,
      anonKey: env.supabaseAnonKey,
    });
  }
  return createApp(deps);
}

function createLiveSupabaseBackend(env: BackendEnv): (request: Request) => Promise<Response> {
  const auth: AuthPort = createSupabaseAuthPort({
    supabaseUrl: env.supabaseUrl!,
    anonKey: env.supabaseAnonKey!,
  });
  const stores: LiveStores = {
    scans: resolveScanRepository(env),
    routine: createMemoryRoutineRepository(),
    quota: resolveQuotaService(env),
  };
  const deps = buildLiveDeps(env, auth, stores);
  if (env.supabaseServiceRoleKey) {
    wireServiceRoleFeatures(deps, env, stores);
  }
  return createApp(deps);
}

function resolveQuotaService(env: BackendEnv): ReturnType<typeof createQuotaService> {
  if (env.supabaseUrl && env.supabaseServiceRoleKey) {
    return createQuotaService(
      createSupabaseQuotaRepository({
        supabaseUrl: env.supabaseUrl,
        serviceRoleKey: env.supabaseServiceRoleKey,
      }),
    );
  }
  return createQuotaService(createMemoryQuotaRepository());
}

function resolveScanRepository(env: BackendEnv): ScanRepository {
  if (env.supabaseUrl && env.supabaseServiceRoleKey) {
    return createSupabaseScanRepository({
      supabaseUrl: env.supabaseUrl,
      serviceRoleKey: env.supabaseServiceRoleKey,
    });
  }
  // Without service role, RLS blocks inserts — memory only (lost on restart).
  return createMemoryScanRepository();
}

function buildLiveDeps(env: BackendEnv, auth: AuthPort, stores: LiveStores): AppDeps {
  const url = env.supabaseUrl!;
  const anon = env.supabaseAnonKey!;
  return {
    auth,
    credentials: createSupabaseCredentialsPort({
      supabaseUrl: url,
      anonKey: anon,
    }),
    profilesFor: ({ accessToken }) =>
      createProfileService(
        createSupabaseProfileRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    consentsFor: ({ accessToken }) =>
      createConsentService(
        createSupabaseConsentRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    faceReferencesFor: ({ accessToken }) =>
      createFaceReferenceService(
        createSupabaseFaceReferenceRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    routineSettingsFor: ({ accessToken }) => ({
      routine: createRoutineService(stores.routine),
      settings: createSettingsService(
        createSupabaseProfileRepository({ supabaseUrl: url, anonKey: anon, accessToken }),
      ),
    }),
    quotaFor: () => stores.quota,
    scanPipelineFor: ({ accessToken }) => liveScanPipeline({ env, url, anon, stores, accessToken }),
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
    // Never persist fake-analyzer scores as real scans in production: without a
    // Gemini key the pipeline refuses (503) instead.
    disabled:
      env.scanPipelineDisabled ||
      (isProductionRuntime() && (env.preferFakeAnalyzer === true || !env.geminiApiKey)),
  });
}

function wireServiceRoleFeatures(deps: AppDeps, env: BackendEnv, stores: LiveStores): void {
  // Keep HTTP quota + scan pipeline on the same Supabase-backed service.
  stores.quota = resolveQuotaService(env);
  deps.quotaFor = () => stores.quota;
  wireEntitlementsAndAccount(deps, env);
}

function wireEntitlementsAndAccount(deps: AppDeps, env: BackendEnv): void {
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
    deletionRequests: createSupabaseDeletionRequestStore({
      supabaseUrl: env.supabaseUrl!,
      serviceRoleKey: env.supabaseServiceRoleKey!,
    }),
  });
  deps.accountFor = () => account;
  deps.publicAccount = account;
}

function shouldExposeDevEntitlements(env: BackendEnv): boolean {
  // The dev grant writes a permanent plan='pro' row for the caller — never
  // reachable in production, whatever DERMIS_ALLOW_DEV_ENTITLEMENT says.
  if (isProductionRuntime()) {
    return false;
  }
  return env.allowDevEntitlement === true || env.useMemory === true;
}

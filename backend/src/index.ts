import { createApp } from './http/createApp';
import { buildMemoryBackendDeps } from './memoryBackend';
import type { BackendEnv } from './backendEnv';
import { readEnv } from './backendEnv';
import { createBackendFromEnv as createBackendFromEnvImpl } from './createBackendFromEnv';

export type { AuthenticatedUser, AuthPort } from './auth/AuthPort';
export type {
  AccountServiceFactory,
  AppDeps,
  ProfileServiceFactory,
  QuotaServiceFactory,
  RoutineSettingsFactory,
  ScanPipelineFactory,
} from './http/createApp';
export { createApp } from './http/createApp';
export { createFakeSkinAnalyzer } from './adapters/fakeSkinAnalyzer';
export { createGeminiSkinAnalyzer } from './adapters/geminiSkinAnalyzer';
export { resolveSkinAnalyzer } from './adapters/resolveSkinAnalyzer';
export { createMemoryPhotoStorage } from './adapters/memoryPhotoStorage';
export { createMemoryScanRepository } from './repositories/memoryScanRepository';
export { createMemoryRoutineRepository } from './repositories/memoryRoutineRepository';
export { createScanPipelineService } from './services/scanPipelineService';
export { createRoutineService } from './services/routineService';
export { createSettingsService } from './services/settingsService';
export { createAccountService } from './services/accountService';
export { createConsentService } from './services/consentService';
export { FACE_ANALYSIS_CONSENT_VERSION } from './constants/consent';
export { createMemoryConsentRepository } from './repositories/memoryConsentRepository';
export { createSupabaseConsentRepository } from './repositories/supabaseConsentRepository';
export { createMemoryAuthPort } from './auth/memoryAuthPort';
export { createSupabaseAuthPort } from './auth/supabaseAuthPort';
export { createMemoryProfileRepository } from './repositories/memoryProfileRepository';
export { createSupabaseProfileRepository } from './repositories/supabaseProfileRepository';
export { createMemoryQuotaRepository } from './repositories/memoryQuotaRepository';
export { createSupabaseQuotaRepository } from './repositories/supabaseQuotaRepository';
export { createProfileService } from './services/profileService';
export { createQuotaService } from './services/quotaService';
export { createEntitlementService } from './services/entitlementService';
export {
  createMemoryEntitlementRepository,
  createMemoryWebhookEventRepository,
} from './repositories/memoryEntitlementRepository';
export {
  createMemoryAccountDataPort,
  createMemoryAuthAdmin,
  createMemoryDeletionRequestStore,
  registerMemoryEmail,
} from './repositories/memoryAccountRepository';
export {
  createSupabaseAccountDataPort,
  createSupabaseAuthAdmin,
} from './repositories/supabaseAccountRepository';

export type { BackendEnv } from './backendEnv';

/** In-memory stack; uses Gemini when GEMINI_API_KEY is set unless preferFakeAnalyzer. */
export function createMemoryBackend(
  env: Pick<
    BackendEnv,
    | 'revenueCatWebhookSecret'
    | 'revenueCatProEntitlementId'
    | 'scanPipelineDisabled'
    | 'geminiApiKey'
    | 'geminiModel'
    | 'preferFakeAnalyzer'
  > = {},
): (request: Request) => Promise<Response> {
  return createApp(buildMemoryBackendDeps(env));
}

/**
 * Live Supabase auth + PostgREST + quota RPC + RevenueCat webhook.
 * Scan pipeline stays memory-backed until a Supabase scan repository ships.
 * Falls back to memory when env is incomplete or `useMemory` is set.
 */
export function createBackendFromEnv(
  env: BackendEnv = readEnv(),
): (request: Request) => Promise<Response> {
  return createBackendFromEnvImpl(env);
}

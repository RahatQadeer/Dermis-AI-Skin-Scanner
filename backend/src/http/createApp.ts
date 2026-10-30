import type { AuthPort } from '../auth/AuthPort';
import type { AuthCredentialsPort } from '../auth/supabaseCredentials';
import type { RevenueCatWebhookDeps } from '../handlers/revenueCatWebhookHandler';
import type { AccountService } from '../services/accountService';
import type { ConsentService } from '../services/consentService';
import type { EntitlementService } from '../services/entitlementService';
import type { FaceReferenceService } from '../services/faceReferenceService';
import type { ProfileService } from '../services/profileService';
import type { QuotaService } from '../services/quotaService';
import type { ScanPipelineService } from '../services/scanPipelineService';
import { errorResponse } from './respond';
import type { RoutineSettingsDeps } from './routineRoutes';
import { dispatchAuthed, matchPublicRoute } from './createAppRoutes';

export type ProfileServiceFactory = (ctx: {
  userId: string;
  accessToken: string;
}) => ProfileService;

export type QuotaServiceFactory = (ctx: { userId: string; accessToken: string }) => QuotaService;

export type ScanPipelineFactory = (ctx: {
  userId: string;
  accessToken: string;
}) => ScanPipelineService;

export type RoutineSettingsFactory = (ctx: {
  userId: string;
  accessToken: string;
}) => RoutineSettingsDeps;

export type AccountServiceFactory = (ctx: {
  userId: string;
  accessToken: string;
}) => AccountService;

export type ConsentServiceFactory = (ctx: {
  userId: string;
  accessToken: string;
}) => ConsentService;

export type FaceReferenceServiceFactory = (ctx: {
  userId: string;
  accessToken: string;
}) => FaceReferenceService;

export type AppDeps = {
  auth: AuthPort;
  profilesFor: ProfileServiceFactory;
  quotaFor?: QuotaServiceFactory;
  scanPipelineFor?: ScanPipelineFactory;
  routineSettingsFor?: RoutineSettingsFactory;
  accountFor?: AccountServiceFactory;
  consentsFor?: ConsentServiceFactory;
  faceReferencesFor?: FaceReferenceServiceFactory;
  /** Shared account service for public deletion (no user context). */
  publicAccount?: AccountService;
  revenueCatWebhook?: RevenueCatWebhookDeps;
  /**
   * Local unlock for Pro when store billing is not configured.
   * Only wire when memory backend or DERMIS_ALLOW_DEV_ENTITLEMENT=1 (never production).
   */
  devEntitlements?: EntitlementService;
  /** Email/password via Supabase GoTrue (public routes). */
  credentials?: AuthCredentialsPort;
};

export function createApp(deps: AppDeps): (request: Request) => Promise<Response> {
  return async (request) => {
    try {
      return await route(request, deps);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

async function route(request: Request, deps: AppDeps): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const method = request.method.toUpperCase();

  const early = matchPublicRoute(method, path, request, deps);
  if (early) {
    return await early;
  }

  return dispatchAuthed(request, method, path, deps);
}

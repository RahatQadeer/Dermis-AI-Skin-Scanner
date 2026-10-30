import { requireUser } from '../auth/requireUser';
import {
  handleDeleteAccount,
  handleExportAccount,
  handlePublicDeletionRequest,
} from '../handlers/accountHandlers';
import {
  handleAppleSignIn,
  handleGoogleSignIn,
  handleRefresh,
  handleSignIn,
  handleSignUp,
} from '../handlers/authCredentialHandlers';
import { handleAuthMe } from '../handlers/authHandlers';
import {
  handleConsentStatus,
  handleGrantConsent,
  handleListConsents,
} from '../handlers/consentHandlers';
import {
  handleGetFaceReference,
  handleRegisterFaceReference,
} from '../handlers/faceReferenceHandlers';
import {
  handleCreateProfile,
  handleDeleteProfile,
  handleGetProfile,
  handlePatchProfile,
} from '../handlers/profileHandlers';
import { handleGetQuota } from '../handlers/quotaHandlers';
import { handleDevGrantPro } from '../handlers/devEntitlementHandlers';
import { handleRevenueCatWebhook } from '../handlers/revenueCatWebhookHandler';
import { handleCreateScan, handleDeleteAllScans, handleListScans } from '../handlers/scanHandlers';
import { DELETE_ACCOUNT_HTML } from './deleteAccountPage';
import { json } from './respond';
import { routeRoutineAndSettings } from './routineRoutes';
import type { AppDeps } from './createApp';
import { readJsonBody } from './readJsonBody';

type RouteHandler = (request: Request, deps: AppDeps) => Promise<Response> | Response;

const PUBLIC_ROUTES: Record<string, RouteHandler> = {
  'GET /': () => json({ ok: true, service: 'dermis-api', health: '/health' }),
  'GET /health': () => json({ ok: true }),
  'GET /delete-account': () =>
    new Response(DELETE_ACCOUNT_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
  'POST /v1/public/deletion-requests': handlePublicDeletion,
  'POST /v1/webhooks/revenuecat': handleWebhook,
  'POST /v1/auth/sign-up': handlePublicSignUp,
  'POST /v1/auth/sign-in': handlePublicSignIn,
  'POST /v1/auth/google': handlePublicGoogle,
  'POST /v1/auth/apple': handlePublicApple,
  'POST /v1/auth/refresh': handlePublicRefresh,
};

export async function dispatchAuthed(
  request: Request,
  method: string,
  path: string,
  deps: AppDeps,
): Promise<Response> {
  if (method === 'GET' && path === '/v1/auth/me') {
    const { user } = await requireUser(request, deps.auth);
    return handleAuthMe(user);
  }
  const handled = await matchAuthedFeature(request, method, path, deps);
  return handled ?? json({ error: 'not_found' }, 404);
}

export function matchPublicRoute(
  method: string,
  path: string,
  request: Request,
  deps: AppDeps,
): Promise<Response> | Response | null {
  const handler = PUBLIC_ROUTES[`${method} ${path}`];
  return handler ? handler(request, deps) : null;
}

async function matchAuthedFeature(
  request: Request,
  method: string,
  path: string,
  deps: AppDeps,
): Promise<Response | null> {
  const core = await matchCoreAuthed(request, method, path, deps);
  if (core) {
    return core;
  }
  if (path.startsWith('/v1/routine') || path === '/v1/settings') {
    return handleRoutineSettings(request, method, path, deps);
  }
  return null;
}

async function matchCoreAuthed(
  request: Request,
  method: string,
  path: string,
  deps: AppDeps,
): Promise<Response | null> {
  const key = `${method} ${path}`;
  const byKey = CORE_ROUTES[key];
  if (byKey) {
    return byKey(request, deps);
  }
  if (path === '/v1/scans' && (method === 'GET' || method === 'POST' || method === 'DELETE')) {
    return handleScanRoute(request, method, deps);
  }
  if (path === '/v1/profile') {
    return handleProfileRoute(request, method, deps);
  }
  if (path === '/v1/face-reference' && (method === 'GET' || method === 'POST')) {
    return handleFaceReferenceRoute(request, method, deps);
  }
  return null;
}

async function handleFaceReferenceRoute(
  request: Request,
  method: string,
  deps: AppDeps,
): Promise<Response> {
  if (!deps.faceReferencesFor) {
    return json({ error: 'face_reference_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const service = deps.faceReferencesFor({ userId: user.id, accessToken });
  if (method === 'GET') {
    return handleGetFaceReference(service, user.id);
  }
  return handleRegisterFaceReference(service, user.id, await readJsonBody(request));
}

const CORE_ROUTES: Record<string, RouteHandler> = {
  'GET /v1/quota': handleQuotaRoute,
  'GET /v1/account/export': (request, deps) =>
    handleAccountRoute(request, 'GET', '/v1/account/export', deps),
  'DELETE /v1/account': (request, deps) =>
    handleAccountRoute(request, 'DELETE', '/v1/account', deps),
  'GET /v1/consents': (request, deps) => handleConsentRoute(request, deps, 'GET', '/v1/consents'),
  'GET /v1/consents/status': (request, deps) =>
    handleConsentRoute(request, deps, 'GET', '/v1/consents/status'),
  'POST /v1/consents': (request, deps) => handleConsentRoute(request, deps, 'POST', '/v1/consents'),
  'POST /v1/dev/entitlements/pro': handleDevEntitlementRoute,
};

async function handleDevEntitlementRoute(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.devEntitlements) {
    return json({ error: 'dev_entitlement_disabled' }, 403);
  }
  const { user } = await requireUser(request, deps.auth);
  return handleDevGrantPro(deps.devEntitlements, user.id);
}

async function handleConsentRoute(
  request: Request,
  deps: AppDeps,
  method: string,
  path: string,
): Promise<Response> {
  if (!deps.consentsFor) {
    return json({ error: 'consent_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const consents = deps.consentsFor({ userId: user.id, accessToken });
  if (method === 'GET' && path === '/v1/consents') {
    return handleListConsents(consents, user.id);
  }
  if (method === 'GET' && path === '/v1/consents/status') {
    return handleConsentStatus(consents, user.id);
  }
  if (method === 'POST' && path === '/v1/consents') {
    return handleGrantConsent(consents, user.id, await readJsonBody(request));
  }
  return json({ error: 'method_not_allowed' }, 405);
}

async function handlePublicSignUp(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  return handleSignUp(deps.credentials, await readJsonBody(request));
}

async function handlePublicSignIn(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  return handleSignIn(deps.credentials, await readJsonBody(request));
}

async function handlePublicGoogle(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  return handleGoogleSignIn(deps.credentials, await readJsonBody(request));
}

async function handlePublicApple(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  return handleAppleSignIn(deps.credentials, await readJsonBody(request));
}

async function handlePublicRefresh(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.credentials) {
    return json({ error: 'auth_credentials_not_configured' }, 503);
  }
  return handleRefresh(deps.credentials, await readJsonBody(request));
}

async function handlePublicDeletion(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.publicAccount) {
    return json({ error: 'account_deletion_not_configured' }, 503);
  }
  return handlePublicDeletionRequest(deps.publicAccount, await readJsonBody(request));
}

async function handleAccountRoute(
  request: Request,
  method: string,
  path: string,
  deps: AppDeps,
): Promise<Response> {
  if (!deps.accountFor) {
    return json({ error: 'account_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const account = deps.accountFor({ userId: user.id, accessToken });
  if (method === 'GET' && path === '/v1/account/export') {
    return handleExportAccount(account, user.id, user.email);
  }
  if (method === 'DELETE' && path === '/v1/account') {
    return handleDeleteAccount(account, user.id, await readJsonBody(request));
  }
  return json({ error: 'method_not_allowed' }, 405);
}

async function handleWebhook(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.revenueCatWebhook) {
    return json({ error: 'webhook_not_configured' }, 503);
  }
  return handleRevenueCatWebhook(request, deps.revenueCatWebhook);
}

async function handleQuotaRoute(request: Request, deps: AppDeps): Promise<Response> {
  if (!deps.quotaFor) {
    return json({ error: 'quota_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const quota = deps.quotaFor({ userId: user.id, accessToken });
  return handleGetQuota(quota, user.id);
}

async function handleScanRoute(request: Request, method: string, deps: AppDeps): Promise<Response> {
  if (!deps.scanPipelineFor) {
    return json({ error: 'scan_pipeline_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const pipeline = deps.scanPipelineFor({ userId: user.id, accessToken });
  if (method === 'GET') {
    return handleListScans(pipeline, user.id);
  }
  if (method === 'DELETE') {
    return handleDeleteAllScans(pipeline, user.id);
  }
  return handleCreateScan(pipeline, user.id, await readJsonBody(request));
}

async function handleRoutineSettings(
  request: Request,
  method: string,
  path: string,
  deps: AppDeps,
): Promise<Response> {
  if (!deps.routineSettingsFor) {
    return json({ error: 'routine_not_configured' }, 503);
  }
  const { user, accessToken } = await requireUser(request, deps.auth);
  const bundle = deps.routineSettingsFor({ userId: user.id, accessToken });
  const handled = await routeRoutineAndSettings({
    request,
    method,
    path,
    userId: user.id,
    deps: bundle,
  });
  return handled ?? json({ error: 'not_found' }, 404);
}

async function handleProfileRoute(
  request: Request,
  method: string,
  deps: AppDeps,
): Promise<Response> {
  const { user, accessToken } = await requireUser(request, deps.auth);
  const profiles = deps.profilesFor({ userId: user.id, accessToken });

  if (method === 'GET') {
    return handleGetProfile(profiles, user.id);
  }
  if (method === 'POST') {
    return handleCreateProfile(profiles, user.id, await readJsonBody(request));
  }
  if (method === 'PATCH') {
    return handlePatchProfile(profiles, user.id, await readJsonBody(request));
  }
  if (method === 'DELETE') {
    return handleDeleteProfile(profiles, user.id);
  }

  return json({ error: 'method_not_allowed' }, 405);
}

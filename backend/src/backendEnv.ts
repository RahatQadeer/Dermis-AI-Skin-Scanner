export type BackendEnv = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  revenueCatWebhookSecret?: string;
  revenueCatProEntitlementId?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  preferFakeAnalyzer?: boolean;
  scanPipelineDisabled?: boolean;
  useMemory?: boolean;
  /** When true, POST /v1/dev/entitlements/pro unlocks Pro (allowed on preview hosts). */
  allowDevEntitlement?: boolean;
};

export function readEnv(): BackendEnv {
  return {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    revenueCatWebhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET,
    revenueCatProEntitlementId: process.env.REVENUECAT_PRO_ENTITLEMENT_ID,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL,
    preferFakeAnalyzer: process.env.DERMIS_FAKE_ANALYZER === '1',
    scanPipelineDisabled: process.env.SCAN_PIPELINE_DISABLED === '1',
    useMemory: process.env.DERMIS_BACKEND_MEMORY === '1',
    allowDevEntitlement: process.env.DERMIS_ALLOW_DEV_ENTITLEMENT === '1',
  };
}

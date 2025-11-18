/**
 * Feature Flags System
 * Allows enabling/disabling features without code changes
 */

export interface FeatureFlags {
  // Analytics
  enableAnalytics: boolean;
  enableGoogleAnalytics: boolean;
  enableMetaPixel: boolean;
  enableLinkedInInsight: boolean;

  // CMS
  enableCMS: boolean;
  enableBlog: boolean;
  enableCaseStudies: boolean;
  enableNewsletter: boolean;

  // AI Features
  enableAI: boolean;
  enableAIAutoApprove: boolean;
  enableAIAnomalyDetection: boolean;
  enableAIDocumentExtraction: boolean;
  enableAIPayrollErrorDetection: boolean;

  // External Services
  enableSupabase: boolean;
  enableRedis: boolean;
  enableEmail: boolean;
  enableSentry: boolean;

  // Forms
  enableTrialSignup: boolean;
  enableDemoRequest: boolean;
  enableContactForm: boolean;

  // Development
  enableDevTools: boolean;
  enableDebugMode: boolean;
}

/**
 * Default feature flags (can be overridden by env variables)
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // Analytics - disabled by default, enable in production
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableGoogleAnalytics: process.env.NEXT_PUBLIC_GA_ID !== undefined,
  enableMetaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID !== undefined,
  enableLinkedInInsight: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID !== undefined,

  // CMS - enabled by default
  enableCMS: process.env.NEXT_PUBLIC_ENABLE_CMS !== 'false',
  enableBlog: true,
  enableCaseStudies: true,
  enableNewsletter: true,

  // AI Features
  enableAI: process.env.OPENAI_API_KEY !== undefined,
  enableAIAutoApprove: process.env.NEXT_PUBLIC_ENABLE_AI_AUTO_APPROVE === 'true',
  enableAIAnomalyDetection: process.env.NEXT_PUBLIC_ENABLE_AI_ANOMALY_DETECTION === 'true',
  enableAIDocumentExtraction:
    process.env.NEXT_PUBLIC_ENABLE_AI_DOCUMENT_EXTRACTION === 'true',
  enableAIPayrollErrorDetection:
    process.env.NEXT_PUBLIC_ENABLE_AI_PAYROLL_ERROR_DETECTION === 'true',

  // External Services
  enableSupabase: process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined,
  enableRedis: process.env.UPSTASH_REDIS_REST_URL !== undefined,
  enableEmail: process.env.EMAIL_API_KEY !== undefined,
  enableSentry: process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined,

  // Forms - enabled by default
  enableTrialSignup: true,
  enableDemoRequest: true,
  enableContactForm: true,

  // Development
  enableDevTools: process.env.NODE_ENV === 'development',
  enableDebugMode: process.env.NODE_ENV === 'development',
};

/**
 * Get all feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...DEFAULT_FLAGS };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Guard function to conditionally execute code based on feature flag
 */
export async function withFeatureFlag<T>(
  feature: keyof FeatureFlags,
  fn: () => T | Promise<T>,
  fallback?: T
): Promise<T | null> {
  if (!isFeatureEnabled(feature)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Feature Flag] ${feature} is disabled`);
    }
    return fallback ?? null;
  }

  try {
    return await fn();
  } catch (error) {
    console.error(`[Feature Flag] ${feature} execution failed:`, error);
    return fallback ?? null;
  }
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return isFeatureEnabled(feature);
}

/**
 * Component wrapper for feature-flagged components
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isEnabled = isFeatureEnabled(feature);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Get feature flags for client-side (safe to expose)
 */
export function getPublicFeatureFlags() {
  const flags = getFeatureFlags();

  return {
    enableAnalytics: flags.enableAnalytics,
    enableCMS: flags.enableCMS,
    enableBlog: flags.enableBlog,
    enableCaseStudies: flags.enableCaseStudies,
    enableNewsletter: flags.enableNewsletter,
    enableTrialSignup: flags.enableTrialSignup,
    enableDemoRequest: flags.enableDemoRequest,
    enableContactForm: flags.enableContactForm,
    enableAI: flags.enableAI,
  };
}

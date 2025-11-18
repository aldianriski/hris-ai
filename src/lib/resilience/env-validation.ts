/**
 * Environment Variable Validation
 * Validates required environment variables on app startup
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Required environment variables (app won't work without these)
 */
const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
];

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_GA_ID',
  'EMAIL_API_KEY',
  'EMAIL_FROM',
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];

    if (!value) {
      missing.push(varName);
      errors.push(`Missing required environment variable: ${varName}`);
    } else {
      // Validate format for specific variables
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
        errors.push(`${varName} must start with https://`);
      }

      if (varName === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
        errors.push(`${varName} must be a valid PostgreSQL connection string`);
      }
    }
  }

  // Check recommended variables
  for (const varName of RECOMMENDED_VARS) {
    const value = process.env[varName];

    if (!value) {
      warnings.push(`Recommended environment variable not set: ${varName}`);
    }
  }

  // Additional validations
  if (process.env.NODE_ENV === 'production') {
    // In production, we should have these set
    if (!process.env.NEXT_PUBLIC_GA_ID) {
      warnings.push('Analytics not configured: NEXT_PUBLIC_GA_ID missing');
    }

    if (!process.env.EMAIL_API_KEY) {
      warnings.push('Email service not configured: EMAIL_API_KEY missing');
    }

    if (!process.env.SENTRY_DSN) {
      warnings.push('Error tracking not configured: SENTRY_DSN missing');
    }
  }

  return {
    valid: errors.length === 0,
    missing,
    warnings,
    errors,
  };
}

/**
 * Get safe environment info (without exposing secrets)
 */
export function getSafeEnvInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnalytics: !!process.env.NEXT_PUBLIC_GA_ID,
    hasEmail: !!process.env.EMAIL_API_KEY,
    hasSentry: !!process.env.SENTRY_DSN,
    hasRedis: !!process.env.UPSTASH_REDIS_REST_URL,
  };
}

/**
 * Log environment validation results
 */
export function logEnvValidation() {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach((error) => console.error(`  - ${error}`));
  } else {
    console.log('✅ Environment validation passed');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  return result;
}

/**
 * Throw error if environment is invalid (use in server startup)
 */
export function requireValidEnvironment() {
  const result = validateEnvironment();

  if (!result.valid) {
    const errorMessage = `Invalid environment configuration:\n${result.errors.join('\n')}`;
    throw new Error(errorMessage);
  }

  return result;
}

/**
 * Check if feature dependencies are met
 */
export function checkFeatureDependencies(feature: string): boolean {
  const dependencies: Record<string, string[]> = {
    analytics: ['NEXT_PUBLIC_GA_ID'],
    email: ['EMAIL_API_KEY', 'EMAIL_FROM'],
    ai: ['OPENAI_API_KEY'],
    cache: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    monitoring: ['SENTRY_DSN'],
  };

  const required = dependencies[feature];
  if (!required) return true;

  return required.every((varName) => !!process.env[varName]);
}

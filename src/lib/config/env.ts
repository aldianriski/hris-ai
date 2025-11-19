import { z } from 'zod';

/**
 * Environment variable schema validation
 * Validates all required environment variables at application startup
 */
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Security - MFA Encryption
  MFA_ENCRYPTION_KEY: z
    .string()
    .length(64, 'MFA_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    .regex(/^[0-9a-f]{64}$/i, 'MFA_ENCRYPTION_KEY must be a valid hex string')
    .describe('Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'),

  // AI/OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_VISION_MODEL: z.string().optional().default('gpt-4o'),

  // Redis Cache (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),

  // Monitoring (Sentry)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('NEXT_PUBLIC_SENTRY_DSN must be a valid URL').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Email Service
  EMAIL_PROVIDER: z.enum(['resend', 'sendgrid', 'mock']).default('mock'),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email').optional(),
  EMAIL_FROM_NAME: z.string().optional(),

  // Job Queue (Inngest)
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_AUTO_APPROVE: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default('false'),
  NEXT_PUBLIC_ENABLE_AI_ANOMALY_DETECTION: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default('false'),
  NEXT_PUBLIC_ENABLE_AI_DOCUMENT_EXTRACTION: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default('false'),
  NEXT_PUBLIC_ENABLE_AI_PAYROLL_ERROR_DETECTION: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default('false'),

  // AI Configuration
  AI_AUTO_APPROVE_CONFIDENCE_THRESHOLD: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(1))
    .optional()
    .default('0.85'),
  AI_ANOMALY_CONFIDENCE_THRESHOLD: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(1))
    .optional()
    .default('0.80'),

  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_LINKEDIN_PARTNER_ID: z.string().optional(),

  // OAuth Integrations (optional)
  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ZOOM_CLIENT_ID: z.string().optional(),
  ZOOM_CLIENT_SECRET: z.string().optional(),
});

/**
 * Validated environment variables
 * This will throw an error at application startup if required variables are missing or invalid
 */
export const env = envSchema.parse(process.env);

/**
 * Get the base app URL
 * In production, this must be set. In development, defaults to localhost
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXT_PUBLIC_APP_URL environment variable is required in production. ' +
          'Set it to your application domain (e.g., https://app.talixa.com)'
      );
    }
    // Development fallback
    return 'http://localhost:3000';
  }

  return url;
}

/**
 * Type-safe access to environment variables
 */
export type Env = z.infer<typeof envSchema>;

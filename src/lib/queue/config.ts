/**
 * Job Queue Configuration
 * Inngest settings and constants
 */

/**
 * Job retry configuration
 */
export const JOB_RETRY_CONFIG = {
  DEFAULT_RETRIES: 3,
  EMAIL_RETRIES: 3,
  PAYROLL_RETRIES: 2,
  INTEGRATION_RETRIES: 2,
  WORKFLOW_RETRIES: 2,
} as const;

/**
 * Job timeout configuration (in milliseconds)
 */
export const JOB_TIMEOUT_CONFIG = {
  EMAIL: 30000, // 30 seconds
  PAYROLL: 600000, // 10 minutes
  INTEGRATION: 60000, // 1 minute
  WORKFLOW: 300000, // 5 minutes
  CLEANUP: 600000, // 10 minutes
} as const;

/**
 * Job concurrency limits
 */
export const JOB_CONCURRENCY_CONFIG = {
  EMAIL_BATCH: 10, // Send max 10 emails concurrently
  PAYROLL: 1, // Process one payroll at a time per company
  INTEGRATION: 5, // Refresh max 5 integrations concurrently
} as const;

/**
 * Cleanup schedules (cron expressions)
 */
export const CLEANUP_SCHEDULES = {
  EXPIRED_TOKENS: '0 2 * * *', // Daily at 2 AM
  ARCHIVE_LOGS: '0 3 1 * *', // Monthly on 1st at 3 AM
  FAILED_JOBS: '0 4 * * 0', // Weekly on Sunday at 4 AM
  TOKEN_REFRESH: '*/5 * * * *', // Every 5 minutes
} as const;

/**
 * Check if Inngest is configured
 */
export function isInngestConfigured(): boolean {
  return !!(
    process.env.INNGEST_EVENT_KEY ||
    process.env.NODE_ENV === 'development'
  );
}

/**
 * Get Inngest dashboard URL
 */
export function getInngestDashboardUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8288';
  }

  return 'https://app.inngest.com';
}

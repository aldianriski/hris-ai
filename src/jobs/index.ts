/**
 * Job Functions Index
 * Export all Inngest job functions
 */

// Payroll jobs
export { processPayrollJob } from './payroll';

// Email jobs
export { sendEmailJob, sendBatchEmailsJob } from './email';

// Integration jobs
export { refreshTokensJob, scheduledTokenRefreshJob } from './integrations';

// Workflow jobs
export { executeWorkflowJob } from './workflow';

// Cleanup jobs
export {
  cleanupExpiredTokensJob,
  archiveOldLogsJob,
  cleanupFailedJobsJob,
} from './cleanup';

// Notification jobs
export { sendNotificationJob } from './notifications';

// Cache jobs
export { cacheWarmingJob } from './cache';

/**
 * All job functions array
 * Used by Inngest API endpoint
 */
import { processPayrollJob } from './payroll';
import { sendEmailJob, sendBatchEmailsJob } from './email';
import { refreshTokensJob, scheduledTokenRefreshJob } from './integrations';
import { executeWorkflowJob } from './workflow';
import {
  cleanupExpiredTokensJob,
  archiveOldLogsJob,
  cleanupFailedJobsJob,
} from './cleanup';
import { sendNotificationJob } from './notifications';
import { cacheWarmingJob } from './cache';

export const allJobs = [
  // Payroll
  processPayrollJob,

  // Email
  sendEmailJob,
  sendBatchEmailsJob,

  // Integrations
  refreshTokensJob,
  scheduledTokenRefreshJob,

  // Workflows
  executeWorkflowJob,

  // Notifications
  sendNotificationJob,

  // Cache
  cacheWarmingJob,

  // Cleanup
  cleanupExpiredTokensJob,
  archiveOldLogsJob,
  cleanupFailedJobsJob,
];

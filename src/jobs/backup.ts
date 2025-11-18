/**
 * Backup Jobs
 * Inngest jobs for automated database backups
 */

import { inngest } from '@/lib/queue/client';
import {
  createFullBackup,
  createIncrementalBackup,
  cleanOldBackups,
  verifyBackup,
  listBackups,
} from '@/lib/backup/service';
import { captureError } from '@/lib/monitoring/sentry';
import { logger } from '@/lib/monitoring/logger';

/**
 * Daily Full Backup Job
 * Runs daily at 2 AM
 */
export const dailyFullBackup = inngest.createFunction(
  { id: 'backup-daily-full', name: 'Daily Full Database Backup' },
  { cron: '0 2 * * *' }, // Daily at 2 AM
  async ({ step }) => {
    return await step.run('create-full-backup', async () => {
      try {
        logger.info('Starting daily full backup');

        const metadata = await createFullBackup();

        logger.info('Daily full backup completed', {
          backupId: metadata.id,
          size: metadata.size,
          tables: metadata.tables.length,
        });

        // Verify backup
        await step.run('verify-backup', async () => {
          const verification = await verifyBackup(metadata.id);

          if (!verification.valid) {
            logger.error('Backup verification failed', {
              backupId: metadata.id,
              errors: verification.errors,
            });
            throw new Error(`Backup verification failed: ${verification.errors.join(', ')}`);
          }

          logger.info('Backup verification succeeded', { backupId: metadata.id });
        });

        // Clean old backups
        await step.run('clean-old-backups', async () => {
          const result = await cleanOldBackups();

          logger.info('Old backups cleaned', {
            deleted: result.deleted,
            errors: result.errors.length,
          });

          if (result.errors.length > 0) {
            logger.warn('Some backups failed to delete', { errors: result.errors });
          }
        });

        return { success: true, backupId: metadata.id };
      } catch (error) {
        logger.error('Daily full backup failed', { error });
        captureError(error, { context: 'daily-full-backup' });
        throw error;
      }
    });
  }
);

/**
 * Incremental Backup Job
 * Runs every 6 hours
 */
export const incrementalBackup = inngest.createFunction(
  { id: 'backup-incremental', name: 'Incremental Database Backup' },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ step }) => {
    return await step.run('create-incremental-backup', async () => {
      try {
        logger.info('Starting incremental backup');

        // Get last backup timestamp
        const backups = await listBackups();
        const lastBackup = backups[0];

        if (!lastBackup) {
          logger.warn('No previous backup found, skipping incremental backup');
          return { success: false, reason: 'no-previous-backup' };
        }

        const metadata = await createIncrementalBackup(lastBackup.timestamp);

        logger.info('Incremental backup completed', {
          backupId: metadata.id,
          size: metadata.size,
          tables: metadata.tables.length,
          since: lastBackup.timestamp,
        });

        // Verify backup
        await step.run('verify-backup', async () => {
          const verification = await verifyBackup(metadata.id);

          if (!verification.valid) {
            logger.error('Backup verification failed', {
              backupId: metadata.id,
              errors: verification.errors,
            });
            throw new Error(`Backup verification failed: ${verification.errors.join(', ')}`);
          }

          logger.info('Backup verification succeeded', { backupId: metadata.id });
        });

        return { success: true, backupId: metadata.id };
      } catch (error) {
        logger.error('Incremental backup failed', { error });
        captureError(error, { context: 'incremental-backup' });
        throw error;
      }
    });
  }
);

/**
 * Weekly Backup Verification Job
 * Runs every Sunday at 3 AM
 */
export const weeklyBackupVerification = inngest.createFunction(
  { id: 'backup-weekly-verification', name: 'Weekly Backup Verification' },
  { cron: '0 3 * * 0' }, // Sunday at 3 AM
  async ({ step }) => {
    return await step.run('verify-all-backups', async () => {
      try {
        logger.info('Starting weekly backup verification');

        const backups = await listBackups();
        const results = {
          total: backups.length,
          valid: 0,
          invalid: 0,
          errors: [] as string[],
        };

        for (const backup of backups) {
          const verification = await verifyBackup(backup.id);

          if (verification.valid) {
            results.valid++;
          } else {
            results.invalid++;
            results.errors.push(`${backup.id}: ${verification.errors.join(', ')}`);
          }
        }

        logger.info('Weekly backup verification completed', results);

        if (results.invalid > 0) {
          logger.error('Some backups are invalid', { invalidCount: results.invalid });
          captureError(new Error('Invalid backups detected'), {
            context: 'weekly-backup-verification',
            invalid: results.invalid,
            errors: results.errors,
          });
        }

        return results;
      } catch (error) {
        logger.error('Weekly backup verification failed', { error });
        captureError(error, { context: 'weekly-backup-verification' });
        throw error;
      }
    });
  }
);

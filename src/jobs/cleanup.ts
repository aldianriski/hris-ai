/**
 * Cleanup Jobs
 * Handles periodic cleanup tasks
 */

import { inngest } from '@/lib/queue/client';
import { createClient } from '@/lib/supabase/server';

/**
 * Clean up expired sessions and tokens
 */
export const cleanupExpiredTokensJob = inngest.createFunction(
  {
    id: 'cleanup-expired-tokens',
    name: 'Cleanup Expired Tokens',
  },
  // Run daily at 2 AM
  { cron: '0 2 * * *' },
  async ({ step }) => {
    const results = {
      sessions: 0,
      tokens: 0,
      invitations: 0,
      tempFiles: 0,
    };

    // Step 1: Clean up expired sessions
    results.sessions = await step.run('cleanup-sessions', async () => {
      const supabase = await createClient();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error, count } = await supabase
        .from('sessions')
        .delete()
        .lt('expires_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Failed to cleanup sessions:', error);
        return 0;
      }

      return count || 0;
    });

    // Step 2: Clean up expired password reset tokens
    results.tokens = await step.run('cleanup-reset-tokens', async () => {
      const supabase = await createClient();

      const { error, count } = await supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Failed to cleanup reset tokens:', error);
        return 0;
      }

      return count || 0;
    });

    // Step 3: Clean up expired invitations
    results.invitations = await step.run('cleanup-invitations', async () => {
      const supabase = await createClient();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error, count } = await supabase
        .from('employee_invitations')
        .delete()
        .eq('status', 'pending')
        .lt('created_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Failed to cleanup invitations:', error);
        return 0;
      }

      return count || 0;
    });

    // Step 4: Clean up temporary files (older than 24 hours)
    results.tempFiles = await step.run('cleanup-temp-files', async () => {
      const supabase = await createClient();

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // List files in temp bucket
      const { data: files } = await supabase.storage
        .from('temp')
        .list('', {
          limit: 1000,
        });

      if (!files || files.length === 0) {
        return 0;
      }

      // Filter files older than 24 hours
      const oldFiles = files.filter((file) => {
        const fileDate = new Date(file.created_at);
        return fileDate < oneDayAgo;
      });

      if (oldFiles.length === 0) {
        return 0;
      }

      // Delete old files
      const filePaths = oldFiles.map((f) => f.name);
      const { error } = await supabase.storage
        .from('temp')
        .remove(filePaths);

      if (error) {
        console.error('Failed to cleanup temp files:', error);
        return 0;
      }

      return oldFiles.length;
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      cleaned: results,
    };
  }
);

/**
 * Archive old audit logs
 */
export const archiveOldLogsJob = inngest.createFunction(
  {
    id: 'archive-old-logs',
    name: 'Archive Old Audit Logs',
  },
  // Run monthly on the 1st at 3 AM
  { cron: '0 3 1 * *' },
  async ({ step }) => {
    const archivedCount = await step.run('archive-logs', async () => {
      const supabase = await createClient();

      // Archive logs older than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Get old logs
      const { data: oldLogs, error: fetchError } = await supabase
        .from('audit_logs')
        .select('*')
        .lt('created_at', oneYearAgo.toISOString())
        .limit(10000);

      if (fetchError || !oldLogs || oldLogs.length === 0) {
        return 0;
      }

      // Move to archive table (if exists)
      const { error: archiveError } = await supabase
        .from('audit_logs_archive')
        .insert(oldLogs);

      if (archiveError) {
        console.error('Failed to archive logs:', archiveError);
        return 0;
      }

      // Delete from main table
      const { error: deleteError } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', oneYearAgo.toISOString());

      if (deleteError) {
        console.error('Failed to delete archived logs:', deleteError);
        return 0;
      }

      return oldLogs.length;
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      archivedCount,
    };
  }
);

/**
 * Clean up failed job executions
 */
export const cleanupFailedJobsJob = inngest.createFunction(
  {
    id: 'cleanup-failed-jobs',
    name: 'Cleanup Failed Jobs',
  },
  // Run weekly on Sunday at 4 AM
  { cron: '0 4 * * 0' },
  async ({ step }) => {
    const cleanedCount = await step.run('cleanup-failed-jobs', async () => {
      const supabase = await createClient();

      // Delete failed workflow executions older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error, count } = await supabase
        .from('workflow_executions')
        .delete()
        .eq('status', 'failed')
        .lt('executed_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Failed to cleanup failed jobs:', error);
        return 0;
      }

      return count || 0;
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      cleanedCount,
    };
  }
);

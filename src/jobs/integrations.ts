/**
 * Integration Maintenance Jobs
 * Handles token refresh and cleanup
 */

import { inngest } from '@/lib/queue/client';
import { refreshIntegrationTokens, refreshAllExpiringTokens } from '@/lib/integrations/token-refresh';

/**
 * Refresh tokens for a specific integration
 */
export const refreshTokensJob = inngest.createFunction(
  {
    id: 'refresh-integration-tokens',
    name: 'Refresh Integration Tokens',
    retries: 2,
  },
  { event: 'integrations/refresh-tokens' },
  async ({ event, step }) => {
    const { integrationId, companyId } = event.data;

    if (integrationId) {
      // Refresh specific integration
      const result = await step.run('refresh-single-integration', async () => {
        return await refreshIntegrationTokens(integrationId);
      });

      if (!result.success) {
        throw new Error(`Failed to refresh integration ${integrationId}: ${result.error}`);
      }

      return {
        success: true,
        integrationId,
        updated: result.updated,
      };
    } else {
      // Refresh all expiring tokens
      const result = await step.run('refresh-all-expiring', async () => {
        return await refreshAllExpiringTokens();
      });

      if (!result.success) {
        throw new Error('Failed to refresh tokens');
      }

      return {
        success: true,
        refreshed: result.refreshed,
        failed: result.failed,
        errors: result.errors,
      };
    }
  }
);

/**
 * Scheduled job to refresh expiring tokens every 5 minutes
 */
export const scheduledTokenRefreshJob = inngest.createFunction(
  {
    id: 'scheduled-token-refresh',
    name: 'Scheduled Token Refresh',
  },
  // Run every 5 minutes
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    const result = await step.run('refresh-expiring-tokens', async () => {
      return await refreshAllExpiringTokens();
    });

    if (result.failed > 0) {
      console.warn('Some integrations failed to refresh:', result.errors);
    }

    return {
      success: true,
      refreshed: result.refreshed,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    };
  }
);

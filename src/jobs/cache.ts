/**
 * Cache Warming Job
 * Scheduled job to pre-populate cache with frequently accessed data
 */

import { inngest } from '@/lib/queue/client';
import { scheduledCacheWarming } from '@/lib/cache/warming';

/**
 * Cache warming job (runs every 30 minutes)
 */
export const cacheWarmingJob = inngest.createFunction(
  {
    id: 'cache-warming',
    name: 'Cache Warming',
    retries: 1,
  },
  { cron: '*/30 * * * *' }, // Every 30 minutes
  async ({ event, step }) => {
    console.log('[Cache Warming] Starting scheduled cache warming');

    await step.run('warm-cache', async () => {
      await scheduledCacheWarming();
    });

    return { success: true, message: 'Cache warming completed' };
  }
);

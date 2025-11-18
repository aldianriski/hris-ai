/**
 * Redis Client Configuration
 * Using Upstash Redis for serverless caching
 */

import { Redis } from '@upstash/redis';

// Singleton Redis client
let redis: Redis | null = null;

/**
 * Get Redis client instance
 * Creates a singleton connection to avoid multiple instances
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
      );
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

/**
 * Check if Redis is available
 * Useful for graceful degradation if Redis is down
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('[Redis] Connection check failed:', error);
    return false;
  }
}

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  /** 5 minutes - Short-lived data that changes frequently */
  SHORT: 5 * 60,

  /** 15 minutes - Medium-lived data */
  MEDIUM: 15 * 60,

  /** 1 hour - Long-lived data that doesn't change often */
  LONG: 60 * 60,

  /** 24 hours - Static data */
  DAY: 24 * 60 * 60,

  /** 7 days - Very static data */
  WEEK: 7 * 24 * 60 * 60,
} as const;

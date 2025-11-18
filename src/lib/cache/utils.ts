/**
 * Cache Utility Functions
 * Helper functions for common caching operations
 */

import { getRedisClient, isRedisAvailable, CacheTTL } from './redis';

/**
 * Get cached data or fetch from source
 * Implements cache-aside pattern with automatic fallback
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  try {
    // Check if Redis is available
    const available = await isRedisAvailable();
    if (!available) {
      console.warn('[Cache] Redis unavailable, fetching directly');
      return await fetchFn();
    }

    const redis = getRedisClient();

    // Try to get from cache
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      console.log(`[Cache] HIT: ${key}`);
      return cached;
    }

    console.log(`[Cache] MISS: ${key}`);

    // Fetch from source
    const data = await fetchFn();

    // Store in cache (fire and forget to avoid blocking)
    redis.set(key, data, { ex: ttl }).catch((error) => {
      console.error(`[Cache] Failed to set ${key}:`, error);
    });

    return data;
  } catch (error) {
    console.error(`[Cache] Error for ${key}:`, error);
    // Fallback to direct fetch on error
    return await fetchFn();
  }
}

/**
 * Set data in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CacheTTL.MEDIUM
): Promise<void> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      console.warn('[Cache] Redis unavailable, skipping set');
      return;
    }

    const redis = getRedisClient();
    await redis.set(key, value, { ex: ttl });
    console.log(`[Cache] SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`[Cache] Failed to set ${key}:`, error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      return;
    }

    const redis = getRedisClient();
    await redis.del(key);
    console.log(`[Cache] DEL: ${key}`);
  } catch (error) {
    console.error(`[Cache] Failed to delete ${key}:`, error);
  }
}

/**
 * Delete multiple cached keys by pattern
 * WARNING: Use with caution, can be slow with many keys
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      return 0;
    }

    const redis = getRedisClient();

    // Upstash Redis doesn't support SCAN, so we'll use a different approach
    // We'll track invalidation patterns separately
    console.log(`[Cache] Pattern invalidation: ${pattern}`);

    // For Upstash, we need to maintain a set of keys per pattern
    const setKey = `_pattern:${pattern}`;
    const keysResult = await redis.smembers<string>(setKey);
    // Ensure we have an array (smembers should return string[])
    const keys = Array.isArray(keysResult) ? keysResult : [];

    if (keys.length === 0) {
      return 0;
    }

    // Delete all keys in the set
    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.del(key));
    await pipeline.exec();

    // Clear the pattern set
    await redis.del(setKey);

    console.log(`[Cache] Deleted ${keys.length} keys matching ${pattern}`);
    return keys.length;
  } catch (error) {
    console.error(`[Cache] Failed to delete pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Track a key in a pattern set for later invalidation
 */
export async function trackKeyInPattern(
  key: string,
  pattern: string
): Promise<void> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      return;
    }

    const redis = getRedisClient();
    const setKey = `_pattern:${pattern}`;
    await redis.sadd(setKey, key);
  } catch (error) {
    console.error(`[Cache] Failed to track key ${key} in pattern ${pattern}:`, error);
  }
}

/**
 * Get multiple cached values
 */
export async function multiGetCache<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      return keys.map(() => null);
    }

    const redis = getRedisClient();
    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.get<T>(key));

    const results = await pipeline.exec();
    return results as (T | null)[];
  } catch (error) {
    console.error('[Cache] Multi-get failed:', error);
    return keys.map(() => null);
  }
}

/**
 * Increment a counter in cache
 */
export async function incrementCache(
  key: string,
  amount: number = 1
): Promise<number> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      return 0;
    }

    const redis = getRedisClient();
    return await redis.incrby(key, amount);
  } catch (error) {
    console.error(`[Cache] Failed to increment ${key}:`, error);
    return 0;
  }
}

/**
 * Check if a key exists in cache
 */
export async function existsInCache(key: string): Promise<boolean> {
  try {
    const available = await isRedisAvailable();
    if (!available) {
      return false;
    }

    const redis = getRedisClient();
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`[Cache] Failed to check existence of ${key}:`, error);
    return false;
  }
}

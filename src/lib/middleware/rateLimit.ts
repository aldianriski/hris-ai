/**
 * Rate Limiting Middleware
 * Implements rate limiting using Redis or in-memory storage
 */

import { NextRequest } from 'next/server';
import { rateLimitResponse } from '../api/response';
import { getClientIp } from './auth';

// In-memory store for development (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

/**
 * Clean up expired entries from in-memory store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000);
}

/**
 * Rate limit middleware
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<void> {
  const { maxRequests, windowMs, keyPrefix = 'ratelimit' } = config;

  // Generate rate limit key based on IP and endpoint
  const ip = getClientIp(request);
  const endpoint = new URL(request.url).pathname;
  const key = `${keyPrefix}:${endpoint}:${ip}`;

  const now = Date.now();

  // TODO: Use Redis in production
  // For now, use in-memory store
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  // Increment count
  record.count++;

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    throw rateLimitResponse(retryAfter);
  }

  rateLimitStore.set(key, record);
}

/**
 * Standard rate limit for most endpoints (100 requests per minute)
 */
export async function standardRateLimit(request: NextRequest): Promise<void> {
  return rateLimit(request, {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'standard',
  });
}

/**
 * Strict rate limit for sensitive endpoints (10 requests per minute)
 */
export async function strictRateLimit(request: NextRequest): Promise<void> {
  return rateLimit(request, {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'strict',
  });
}

/**
 * Auth rate limit for login attempts (5 attempts per 15 minutes)
 */
export async function authRateLimit(request: NextRequest): Promise<void> {
  return rateLimit(request, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'auth',
  });
}

/**
 * MFA verification rate limit (5 attempts per 15 minutes)
 */
export async function mfaRateLimit(request: NextRequest): Promise<void> {
  return rateLimit(request, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'mfa',
  });
}

/**
 * API key rate limit (5000 requests per hour)
 */
export async function apiKeyRateLimit(request: NextRequest): Promise<void> {
  return rateLimit(request, {
    maxRequests: 5000,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'apikey',
  });
}

/**
 * Upload rate limit (10 uploads per minute)
 */
export async function uploadRateLimit(request: NextRequest): Promise<void> {
  return rateLimit(request, {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'upload',
  });
}

// ============================================
// Redis-based rate limiting (for production)
// ============================================

/**
 * Redis rate limiter using Upstash Redis
 * Uncomment and use this in production with UPSTASH_REDIS_REST_URL env var
 */
/*
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function redisRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<void> {
  const { maxRequests, windowMs, keyPrefix = 'ratelimit' } = config;

  const ip = getClientIp(request);
  const endpoint = new URL(request.url).pathname;
  const key = `${keyPrefix}:${endpoint}:${ip}`;

  const now = Date.now();
  const windowStart = now - windowMs;

  // Use Redis sorted set to track requests in time window
  const multi = redis.multi();
  
  // Remove old entries
  multi.zremrangebyscore(key, 0, windowStart);
  
  // Count current requests
  multi.zcard(key);
  
  // Add current request
  multi.zadd(key, { score: now, member: `${now}` });
  
  // Set expiry
  multi.expire(key, Math.ceil(windowMs / 1000));

  const results = await multi.exec();
  const count = results[1] as number;

  if (count >= maxRequests) {
    const retryAfter = Math.ceil(windowMs / 1000);
    throw rateLimitResponse(retryAfter);
  }
}
*/

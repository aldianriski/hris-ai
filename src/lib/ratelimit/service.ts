/**
 * Rate Limit Service
 * Upstash Rate Limit integration for API protection
 */

import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from '@/lib/cache/redis';

/**
 * Create a rate limiter with specified limits
 */
export function createRateLimiter(options: {
  requests: number;
  window: string;
  prefix?: string;
}) {
  const redis = getRedisClient();
  const { requests, window, prefix = 'ratelimit' } = options;

  // Parse window string (e.g., "15m", "1h", "1d")
  const windowMs = parseWindow(window);

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowMs} ms`),
    prefix,
    analytics: true,
  });
}

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
  const value = parseInt(window.slice(0, -1));
  const unit = window.slice(-1);

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid window unit: ${unit}`);
  }
}

/**
 * Default rate limiters for common use cases
 */
export const rateLimiters = {
  // Authentication
  login: createRateLimiter({
    requests: 5,
    window: '15m',
    prefix: 'ratelimit:auth:login',
  }),

  register: createRateLimiter({
    requests: 3,
    window: '1h',
    prefix: 'ratelimit:auth:register',
  }),

  passwordReset: createRateLimiter({
    requests: 3,
    window: '1h',
    prefix: 'ratelimit:auth:password-reset',
  }),

  // API tiers
  free: createRateLimiter({
    requests: 100,
    window: '1h',
    prefix: 'ratelimit:tier:free',
  }),

  pro: createRateLimiter({
    requests: 500,
    window: '1h',
    prefix: 'ratelimit:tier:pro',
  }),

  enterprise: createRateLimiter({
    requests: 2000,
    window: '1h',
    prefix: 'ratelimit:tier:enterprise',
  }),

  // Public endpoints
  public: createRateLimiter({
    requests: 50,
    window: '1h',
    prefix: 'ratelimit:public',
  }),

  // Operations
  fileUpload: createRateLimiter({
    requests: 20,
    window: '1h',
    prefix: 'ratelimit:operation:file-upload',
  }),

  pdfGeneration: createRateLimiter({
    requests: 50,
    window: '1h',
    prefix: 'ratelimit:operation:pdf-generation',
  }),

  emailSend: createRateLimiter({
    requests: 30,
    window: '1h',
    prefix: 'ratelimit:operation:email-send',
  }),

  pushNotification: createRateLimiter({
    requests: 100,
    window: '1h',
    prefix: 'ratelimit:operation:push-notification',
  }),

  // Admin
  admin: createRateLimiter({
    requests: 1000,
    window: '1h',
    prefix: 'ratelimit:admin',
  }),

  // Webhook
  webhook: createRateLimiter({
    requests: 200,
    window: '1h',
    prefix: 'ratelimit:webhook',
  }),
};

/**
 * Rate limit result type
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

/**
 * Check rate limit for identifier
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    pending: result.pending,
  };
}

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

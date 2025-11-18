/**
 * Rate Limit Middleware
 * Middleware for Next.js API routes to enforce rate limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import {
  checkRateLimit,
  getIdentifier,
  createRateLimitHeaders,
  rateLimiters,
} from './service';
import { errorResponse } from '@/lib/api/response';
import { logger } from '@/lib/monitoring/logger';

/**
 * Rate limit middleware options
 */
export interface RateLimitOptions {
  limiter?: Ratelimit;
  limiterKey?: keyof typeof rateLimiters;
  getUserId?: (request: NextRequest) => Promise<string | undefined>;
  onLimitReached?: (identifier: string, request: NextRequest) => void;
}

/**
 * Apply rate limiting to API route
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // Get rate limiter
      const limiter = options.limiter || (options.limiterKey && rateLimiters[options.limiterKey]) || rateLimiters.public;

      // Get identifier
      const userId = options.getUserId ? await options.getUserId(request) : undefined;
      const identifier = getIdentifier(request, userId);

      // Check rate limit
      const result = await checkRateLimit(limiter, identifier);

      // Add rate limit headers
      const headers = createRateLimitHeaders(result);

      // If rate limit exceeded
      if (!result.success) {
        logger.warn('Rate limit exceeded', {
          identifier,
          url: request.url,
          method: request.method,
        });

        // Call custom handler if provided
        if (options.onLimitReached) {
          options.onLimitReached(identifier, request);
        }

        return NextResponse.json(
          errorResponse('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_EXCEEDED'),
          {
            status: 429,
            headers,
          }
        );
      }

      // Call handler with rate limit headers
      const response = await handler(request);

      // Add rate limit headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      logger.error('Rate limit middleware error', { error });

      // Continue without rate limiting if error occurs
      return handler(request);
    }
  };
}

/**
 * Create rate limit middleware for specific limiter
 */
export function createRateLimitMiddleware(
  limiterKey: keyof typeof rateLimiters,
  getUserId?: (request: NextRequest) => Promise<string | undefined>
) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return withRateLimit(handler, { limiterKey, getUserId });
  };
}

/**
 * Pre-configured middleware for common use cases
 */
export const rateLimitMiddleware = {
  // Authentication endpoints
  login: createRateLimitMiddleware('login'),
  register: createRateLimitMiddleware('register'),
  passwordReset: createRateLimitMiddleware('passwordReset'),

  // API tiers
  free: createRateLimitMiddleware('free'),
  pro: createRateLimitMiddleware('pro'),
  enterprise: createRateLimitMiddleware('enterprise'),

  // Public endpoints
  public: createRateLimitMiddleware('public'),

  // Operations
  fileUpload: createRateLimitMiddleware('fileUpload'),
  pdfGeneration: createRateLimitMiddleware('pdfGeneration'),
  emailSend: createRateLimitMiddleware('emailSend'),
  pushNotification: createRateLimitMiddleware('pushNotification'),

  // Admin
  admin: createRateLimitMiddleware('admin'),

  // Webhook
  webhook: createRateLimitMiddleware('webhook'),
};

/**
 * Utility: Get user tier from database
 */
export async function getUserTier(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
  // TODO: Implement user tier lookup from database
  // For now, default to free
  return 'free';
}

/**
 * Dynamic tier-based rate limiting
 */
export async function withTierRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  getUserId: (request: NextRequest) => Promise<string | undefined>
): Promise<(request: NextRequest) => Promise<NextResponse>> {
  return async (request: NextRequest) => {
    const userId = await getUserId(request);

    if (!userId) {
      // Use public rate limit for unauthenticated requests
      return withRateLimit(handler, { limiterKey: 'public' })(request);
    }

    // Get user tier and apply appropriate rate limit
    const tier = await getUserTier(userId);
    const limiterKey = tier as keyof typeof rateLimiters;

    return withRateLimit(handler, { limiterKey, getUserId })(request);
  };
}

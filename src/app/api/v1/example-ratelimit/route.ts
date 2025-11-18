/**
 * Example: Rate Limited API Route
 * Demonstrates how to use rate limiting middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimitMiddleware } from '@/lib/ratelimit/middleware';
import { rateLimiters } from '@/lib/ratelimit/service';
import { successResponse } from '@/lib/api/response';

/**
 * Example 1: Using pre-configured middleware
 * Simple public endpoint with standard rate limiting
 */
async function handlePublicEndpoint(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    successResponse({
      message: 'This endpoint is rate limited to 50 requests per hour per IP',
      timestamp: new Date().toISOString(),
    })
  );
}

// Apply public rate limiting (50 requests/hour per IP)
export const GET = rateLimitMiddleware.public(handlePublicEndpoint);

/**
 * Example 2: Custom rate limit configuration
 */
async function handleCustomEndpoint(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    successResponse({
      message: 'This endpoint has custom rate limiting',
      timestamp: new Date().toISOString(),
    })
  );
}

// Apply custom rate limiting (10 requests per 5 minutes)
export const POST = withRateLimit(handleCustomEndpoint, {
  limiter: rateLimiters.fileUpload,
  onLimitReached: (identifier, request) => {
    console.log(`Rate limit exceeded for ${identifier} on ${request.url}`);
  },
});

/**
 * Example 3: User-specific rate limiting
 */
async function handleUserEndpoint(request: NextRequest): Promise<NextResponse> {
  // Your business logic here
  return NextResponse.json(
    successResponse({
      message: 'This endpoint is rate limited per user',
      timestamp: new Date().toISOString(),
    })
  );
}

// Apply user-specific rate limiting
export const PUT = withRateLimit(handleUserEndpoint, {
  limiterKey: 'pro',
  getUserId: async (request) => {
    // Extract user ID from auth header, session, etc.
    const authHeader = request.headers.get('authorization');
    // ... authentication logic ...
    return 'user-id-123'; // Return user ID or undefined
  },
});

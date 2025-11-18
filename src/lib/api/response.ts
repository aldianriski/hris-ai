/**
 * API Response Utilities
 * Helper functions for creating consistent API responses
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, ApiMeta, HttpStatus, ErrorCode } from './types';

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  status: HttpStatus = 200,
  meta?: ApiMeta
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: ErrorCode | string,
  message: string,
  status: HttpStatus = 400,
  details?: Record<string, any>
): NextResponse<ApiResponse> {
  const error: ApiError = {
    code,
    message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  const response: ApiResponse = {
    success: false,
    error,
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return errorResponse(
    'VAL_2001',
    'Validation failed',
    422,
    { errors }
  );
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return errorResponse(
    'AUTH_1001',
    message,
    401
  );
}

/**
 * Create a forbidden error response
 */
export function forbiddenResponse(
  message: string = 'Access forbidden'
): NextResponse<ApiResponse> {
  return errorResponse(
    'AUTH_1004',
    message,
    403
  );
}

/**
 * Create a not found error response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiResponse> {
  return errorResponse(
    'RES_3001',
    `${resource} not found`,
    404
  );
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<ApiResponse> {
  const headers: Record<string, string> = {};
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString();
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_5001',
        message: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        ...(retryAfter && { details: { retryAfter } }),
      },
    },
    {
      status: 429,
      headers,
    }
  );
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(
  message: string = 'Internal server error',
  details?: Record<string, any>
): NextResponse<ApiResponse> {
  return errorResponse(
    'SRV_9001',
    message,
    500,
    details
  );
}

/**
 * Create a paginated response with metadata
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return successResponse(data, 200, {
    page,
    limit,
    total,
    totalPages,
    hasMore,
  });
}

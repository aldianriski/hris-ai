/**
 * Error Handling Middleware
 * Centralized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { serverErrorResponse, validationErrorResponse, errorResponse } from '../api/response';
import type { ErrorCode, HttpStatus } from '../api/types';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode | string,
    public message: string,
    public status: HttpStatus = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Wrap async API route handlers with error handling
 */
export function withErrorHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Handle different types of errors
 */
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!validationErrors[path]) {
        validationErrors[path] = [];
      }
      validationErrors[path].push(err.message);
    });

    return validationErrorResponse(validationErrors);
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return errorResponse(
      error.code,
      error.message,
      error.status,
      error.details
    );
  }

  // NextResponse errors (from auth middleware)
  if (error instanceof NextResponse) {
    return error;
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: string };
    
    // Handle specific Supabase error codes
    if (supabaseError.code === '23505') {
      return errorResponse(
        'RES_3002',
        'Resource already exists',
        409,
        { details: supabaseError.details }
      );
    }

    if (supabaseError.code === '23503') {
      return errorResponse(
        'VAL_2002',
        'Invalid reference',
        400,
        { details: supabaseError.details }
      );
    }

    return errorResponse(
      'SRV_9002',
      'Database error',
      500,
      {
        code: supabaseError.code,
        details: supabaseError.message,
      }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const isDev = process.env.NODE_ENV === 'development';
    
    return serverErrorResponse(
      'An unexpected error occurred',
      isDev ? { error: error.message, stack: error.stack } : undefined
    );
  }

  // Unknown errors
  return serverErrorResponse('An unknown error occurred');
}

/**
 * Log error to external service (e.g., Sentry)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  // TODO: Integrate with Sentry or other logging service
  console.error('Error logged:', {
    error,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Sentry Error Tracking Utilities
 * Helper functions for error tracking and monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capture an error to Sentry
 */
export function captureError(
  error: Error | unknown,
  context?: Record<string, any>
): string {
  if (context) {
    Sentry.setContext('additional', context);
  }

  const eventId = Sentry.captureException(error);

  console.error('[Error Tracking]', error, context);

  return eventId;
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): string {
  if (context) {
    Sentry.setContext('additional', context);
  }

  const eventId = Sentry.captureMessage(message, level);

  console.log(`[${level.toUpperCase()}]`, message, context);

  return eventId;
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb (for debugging context)
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category: category || 'default',
    level: level || 'info',
    data,
  });
}

/**
 * Set tag for filtering errors
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set multiple tags
 */
export function setTags(tags: Record<string, string>): void {
  Sentry.setTags(tags);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Transaction | undefined {
  return Sentry.startTransaction({ name, op });
}

/**
 * Wrap a function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    context?: Record<string, any>;
    rethrow?: boolean;
  }
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, options?.context);
          if (options?.rethrow) {
            throw error;
          }
        });
      }

      return result;
    } catch (error) {
      captureError(error, options?.context);
      if (options?.rethrow) {
        throw error;
      }
    }
  }) as T;
}

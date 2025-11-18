/**
 * Error Logger Utility
 * Centralized error logging with support for multiple backends
 * (Console, Sentry, custom logging service)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: ErrorContext;
  timestamp: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Log debug information
   */
  debug(message: string, context?: ErrorContext) {
    if (this.isDevelopment) {
      this.log({
        level: 'debug',
        message,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: ErrorContext) {
    this.log({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log warnings
   */
  warn(message: string, error?: Error, context?: ErrorContext) {
    this.log({
      level: 'warn',
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error, context?: ErrorContext) {
    this.log({
      level: 'error',
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    });

    // In production, send to error tracking service
    // this.sendToSentry(entry);
  }

  /**
   * Log fatal errors
   */
  fatal(message: string, error: Error, context?: ErrorContext) {
    this.log({
      level: 'fatal',
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    });

    // In production, send to error tracking service and alert
    // this.sendToSentry(entry);
    // this.sendAlert(entry);
  }

  /**
   * Core logging function
   */
  private log(entry: LogEntry) {
    const { level, message, error, context, timestamp } = entry;

    // Console output with colors
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[level];

    // Format output
    const prefix = `${color}[${level.toUpperCase()}]${reset}`;
    const timePrefix = `${timestamp}`;

    console.log(`${timePrefix} ${prefix} ${message}`);

    if (context && Object.keys(context).length > 0) {
      console.log(`${prefix} Context:`, context);
    }

    if (error) {
      console.log(`${prefix} Error:`, error);
      if (error.stack) {
        console.log(`${prefix} Stack:`, error.stack);
      }
    }

    // In production, write to structured logging service
    if (!this.isDevelopment) {
      this.writeToLogService(entry);
    }
  }

  /**
   * Write to external logging service (stub for future implementation)
   */
  private writeToLogService(entry: LogEntry) {
    // TODO: Implement integration with logging service
    // Examples: Datadog, New Relic, CloudWatch, Logtail
    //
    // await fetch('https://logging-service.com/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });
  }

  /**
   * Send to Sentry (stub for future implementation)
   */
  private sendToSentry(entry: LogEntry) {
    // TODO: Implement Sentry integration
    // Sentry.captureException(entry.error, {
    //   level: entry.level,
    //   extra: entry.context,
    // });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

/**
 * Helper function to create API error responses with logging
 */
export function createErrorResponse(
  message: string,
  status: number,
  error?: Error,
  context?: ErrorContext
) {
  // Log the error
  if (status >= 500) {
    logger.error(message, error, context);
  } else if (status >= 400) {
    logger.warn(message, error, context);
  }

  // Return response object
  return {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Wrapper for async route handlers with automatic error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  context?: ErrorContext
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error(
        'Unhandled error in route handler',
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error;
    }
  }) as T;
}

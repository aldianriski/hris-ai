/**
 * Logging Utilities
 * Structured logging for better observability (Axiom-compatible)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

/**
 * Structured logger class
 */
class Logger {
  private serviceName: string;
  private environment: string;

  constructor(serviceName: string = 'hris-api') {
    this.serviceName = serviceName;
    this.environment = process.env.NODE_ENV || 'development';
  }

  private formatLog(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      environment: this.environment,
      message,
      ...metadata,
    };

    return JSON.stringify(logEntry);
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, don't log debug messages
    if (this.environment === 'production' && level === 'debug') {
      return false;
    }
    return true;
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLog('debug', message, metadata));
    }
  }

  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('info')) {
      console.info(this.formatLog('info', message, metadata));
    }
  }

  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, metadata));
    }
  }

  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error
        ? {
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.name,
          }
        : { error };

      console.error(
        this.formatLog('error', message, {
          ...metadata,
          ...errorData,
        })
      );
    }
  }

  /**
   * Log HTTP request
   */
  httpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    metadata?: LogMetadata
  ): void {
    this.info(`${method} ${path} ${statusCode}`, {
      type: 'http_request',
      method,
      path,
      statusCode,
      durationMs: duration,
      ...metadata,
    });
  }

  /**
   * Log database query
   */
  dbQuery(
    query: string,
    duration: number,
    metadata?: LogMetadata
  ): void {
    this.debug('Database query executed', {
      type: 'db_query',
      query,
      durationMs: duration,
      ...metadata,
    });
  }

  /**
   * Log job execution
   */
  jobExecution(
    jobName: string,
    status: 'started' | 'completed' | 'failed',
    duration?: number,
    metadata?: LogMetadata
  ): void {
    this.info(`Job ${jobName} ${status}`, {
      type: 'job_execution',
      jobName,
      status,
      durationMs: duration,
      ...metadata,
    });
  }

  /**
   * Log security event
   */
  securityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: LogMetadata
  ): void {
    this.warn(`Security event: ${event}`, {
      type: 'security_event',
      event,
      severity,
      ...metadata,
    });
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a custom logger with a specific service name
 */
export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName);
}

/**
 * Quick logging functions
 */
export const log = {
  debug: (message: string, metadata?: LogMetadata) => logger.debug(message, metadata),
  info: (message: string, metadata?: LogMetadata) => logger.info(message, metadata),
  warn: (message: string, metadata?: LogMetadata) => logger.warn(message, metadata),
  error: (message: string, error?: Error | unknown, metadata?: LogMetadata) =>
    logger.error(message, error, metadata),
};

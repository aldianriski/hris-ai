/**
 * Sentry Server Configuration
 * This file configures error tracking for server-side errors
 */

import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    environment: process.env.NODE_ENV,

    // Ignore certain errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'cancelled',
    ],

    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Sentry] Would send event:', event);
        return null;
      }
      return event;
    },
  });
}

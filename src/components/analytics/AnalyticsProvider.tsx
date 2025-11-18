'use client';

import { GoogleAnalytics } from './GoogleAnalytics';
import { MetaPixel } from './MetaPixel';
import { LinkedInInsight } from './LinkedInInsight';
import { ErrorBoundary } from '@/lib/resilience/error-boundary';
import { isFeatureEnabled } from '@/lib/resilience/feature-flags';

/**
 * Analytics Provider - Load all tracking scripts
 * Add this to your root layout
 *
 * Note: All analytics are wrapped in error boundaries to prevent
 * app crashes if analytics services fail
 */
export function AnalyticsProvider() {
  // Only load analytics in production and if enabled
  const isProduction = process.env.NODE_ENV === 'production';
  const analyticsEnabled = isFeatureEnabled('enableAnalytics');

  if (!isProduction || !analyticsEnabled) {
    return null;
  }

  return (
    <>
      {/* Each analytics service has its own error boundary */}
      {/* If one fails, others continue working */}

      <ErrorBoundary silent>
        <GoogleAnalytics />
      </ErrorBoundary>

      <ErrorBoundary silent>
        <MetaPixel />
      </ErrorBoundary>

      <ErrorBoundary silent>
        <LinkedInInsight />
      </ErrorBoundary>
    </>
  );
}

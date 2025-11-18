'use client';

import { GoogleAnalytics } from './GoogleAnalytics';
import { MetaPixel } from './MetaPixel';
import { LinkedInInsight } from './LinkedInInsight';

/**
 * Analytics Provider - Load all tracking scripts
 * Add this to your root layout
 */
export function AnalyticsProvider() {
  // Only load analytics in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return null;
  }

  return (
    <>
      <GoogleAnalytics />
      <MetaPixel />
      <LinkedInInsight />
    </>
  );
}

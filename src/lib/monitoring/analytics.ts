/**
 * Vercel Analytics Integration
 * Simple wrapper for Vercel Analytics
 */

'use client';

import { Analytics } from '@vercel/analytics/react';

/**
 * Vercel Analytics Component
 * Add this to your root layout
 */
export { Analytics };

/**
 * Track custom events
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', name, properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string): void {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('pageview', { path });
  }
}

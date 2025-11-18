/**
 * Safe Analytics Tracking
 * Wraps analytics calls with error handling
 * App continues working even if analytics fails
 */

import { isFeatureEnabled } from '@/lib/resilience/feature-flags';

/**
 * Safe wrapper for any tracking function
 */
async function safeTrack(
  fn: () => void | Promise<void>,
  serviceName: string
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${serviceName}] Tracking failed:`, error);
    }
    // Don't throw - just log and continue
  }
}

/**
 * Safe page view tracking
 */
export async function safeTrackPageView(url: string, title: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackPageView } = await import('./events');
    await safeTrack(() => trackPageView(url, title), 'PageView');
  } catch (error) {
    // Import or execution failed - silently continue
  }
}

/**
 * Safe lead capture tracking
 */
export async function safeTrackLeadCapture({
  leadType,
  email,
  company,
  value,
}: {
  leadType: 'trial' | 'demo' | 'contact' | 'newsletter';
  email: string;
  company?: string;
  value?: number;
}) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackLeadCapture } = await import('./events');
    await safeTrack(
      () => trackLeadCapture({ leadType, email, company, value }),
      'LeadCapture'
    );
  } catch (error) {
    // Silently fail
  }
}

/**
 * Safe trial signup tracking
 */
export async function safeTrackTrialSignup(email: string, company: string, plan: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackTrialSignup } = await import('./events');
    await safeTrack(() => trackTrialSignup(email, company, plan), 'TrialSignup');
  } catch (error) {
    // Silently fail
  }
}

/**
 * Safe demo request tracking
 */
export async function safeTrackDemoRequest(email: string, company: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackDemoRequest } = await import('./events');
    await safeTrack(() => trackDemoRequest(email, company), 'DemoRequest');
  } catch (error) {
    // Silently fail
  }
}

/**
 * Safe newsletter signup tracking
 */
export async function safeTrackNewsletterSignup(email: string, source: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackNewsletterSignup } = await import('./events');
    await safeTrack(() => trackNewsletterSignup(email, source), 'NewsletterSignup');
  } catch (error) {
    // Silently fail
  }
}

/**
 * Safe contact form tracking
 */
export async function safeTrackContactForm(email: string, subject: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackContactForm } = await import('./events');
    await safeTrack(() => trackContactForm(email, subject), 'ContactForm');
  } catch (error) {
    // Silently fail
  }
}

/**
 * Safe button click tracking
 */
export async function safeTrackButtonClick(buttonLabel: string, buttonLocation: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackButtonClick } = await import('./events');
    await safeTrack(() => trackButtonClick(buttonLabel, buttonLocation), 'ButtonClick');
  } catch (error) {
    // Silently fail
  }
}

/**
 * Safe pricing view tracking
 */
export async function safeTrackPricingView(plan?: string) {
  if (!isFeatureEnabled('enableAnalytics')) {
    return;
  }

  try {
    const { trackPricingView } = await import('./events');
    await safeTrack(() => trackPricingView(plan), 'PricingView');
  } catch (error) {
    // Silently fail
  }
}

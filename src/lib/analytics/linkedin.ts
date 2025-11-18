/**
 * LinkedIn Insight Tag Integration
 * https://www.linkedin.com/help/lms/answer/a427660
 */

declare global {
  interface Window {
    _linkedin_data_partner_ids?: string[];
    lintrk?: (type: string, data?: any) => void;
  }
}

export const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '';

/**
 * Initialize LinkedIn Insight Tag
 */
export function initLinkedInInsight() {
  if (!LINKEDIN_PARTNER_ID) {
    console.warn('LinkedIn Insight: Partner ID not found');
    return;
  }

  if (typeof window === 'undefined') return;

  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
}

/**
 * Track LinkedIn conversion
 */
export function trackLinkedInConversion(conversionId?: string) {
  if (!window.lintrk) return;

  if (conversionId) {
    window.lintrk('track', { conversion_id: conversionId });
  } else {
    window.lintrk('track', {});
  }
}

/**
 * Track LinkedIn lead generation
 */
export function trackLinkedInLead() {
  trackLinkedInConversion('lead_generation');
}

/**
 * Track LinkedIn demo request
 */
export function trackLinkedInDemo() {
  trackLinkedInConversion('demo_request');
}

/**
 * Track LinkedIn trial signup
 */
export function trackLinkedInTrial() {
  trackLinkedInConversion('trial_signup');
}

/**
 * Track LinkedIn subscription
 */
export function trackLinkedInSubscription() {
  trackLinkedInConversion('subscription');
}

/**
 * Track LinkedIn custom event
 */
export function trackLinkedInCustom(eventData: Record<string, any>) {
  if (!window.lintrk) return;
  window.lintrk('track', eventData);
}

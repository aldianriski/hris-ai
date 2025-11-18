/**
 * Unified analytics event tracking
 * Tracks events across all platforms (GA4, Meta, LinkedIn, Internal DB)
 */

import { trackEvent as trackGA, trackLead as trackGALead } from './google';
import {
  trackMetaLead,
  trackMetaContact,
  trackMetaDemoRequest,
  trackMetaSubscribe,
  trackMetaViewContent,
  trackMetaCustomEvent,
} from './meta';
import {
  trackLinkedInLead,
  trackLinkedInDemo,
  trackLinkedInTrial,
} from './linkedin';

/**
 * Track to internal database via API
 */
async function trackInternal(eventType: string, eventData: Record<string, any> = {}) {
  try {
    await fetch('/api/v1/cms/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData,
      }),
    });
  } catch (error) {
    console.error('Failed to track internal analytics:', error);
  }
}

/**
 * Track page view across all platforms
 */
export function trackPageView(url: string, title: string) {
  // Internal DB
  trackInternal('page_view', { url, title });
}

/**
 * Track lead capture (from any form)
 */
export async function trackLeadCapture({
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
  // Google Analytics
  trackGALead(leadType, value);

  // Meta Pixel
  trackMetaLead(value);

  // LinkedIn
  trackLinkedInLead();

  // Internal DB
  await trackInternal('lead_capture', {
    lead_type: leadType,
    email,
    company,
    value,
  });
}

/**
 * Track trial signup specifically
 */
export async function trackTrialSignup(email: string, company: string, plan: string) {
  // Google Analytics
  trackGALead('trial', 25000);

  // Meta Pixel
  trackMetaCustomEvent('StartTrial', { content_name: plan });

  // LinkedIn
  trackLinkedInTrial();

  // Internal DB
  await trackInternal('trial_signup', {
    email,
    company,
    plan,
  });
}

/**
 * Track demo request
 */
export async function trackDemoRequest(email: string, company: string) {
  // Google Analytics
  trackGALead('demo');

  // Meta Pixel
  trackMetaDemoRequest();

  // LinkedIn
  trackLinkedInDemo();

  // Internal DB
  await trackInternal('demo_request', {
    email,
    company,
  });
}

/**
 * Track newsletter subscription
 */
export async function trackNewsletterSignup(email: string, source: string) {
  // Google Analytics
  trackGALead('newsletter');

  // Meta Pixel
  trackMetaSubscribe();

  // Internal DB
  await trackInternal('newsletter_signup', {
    email,
    source,
  });
}

/**
 * Track contact form submission
 */
export async function trackContactForm(email: string, subject: string) {
  // Google Analytics
  trackGALead('contact');

  // Meta Pixel
  trackMetaContact();

  // Internal DB
  await trackInternal('form_submit', {
    form_name: 'contact',
    email,
    subject,
  });
}

/**
 * Track button clicks
 */
export async function trackButtonClick(buttonLabel: string, buttonLocation: string) {
  // Google Analytics
  trackGA({
    action: 'button_click',
    category: 'engagement',
    label: `${buttonLabel} - ${buttonLocation}`,
  });

  // Internal DB
  await trackInternal('button_click', {
    button_label: buttonLabel,
    button_location: buttonLocation,
  });
}

/**
 * Track pricing page view
 */
export async function trackPricingView(plan?: string) {
  // Google Analytics
  trackGA({
    action: 'view_pricing',
    category: 'engagement',
    label: plan,
  });

  // Meta Pixel
  trackMetaViewContent({
    contentName: `Pricing - ${plan || 'All Plans'}`,
    contentCategory: 'Pricing',
  });

  // Internal DB
  await trackInternal('pricing_view', {
    plan: plan,
  });
}

/**
 * Track video play
 */
export async function trackVideoPlay(videoTitle: string, videoUrl: string) {
  // Google Analytics
  trackGA({
    action: 'video_play',
    category: 'engagement',
    label: videoTitle,
  });

  // Internal DB
  await trackInternal('video_play', {
    video_title: videoTitle,
    video_url: videoUrl,
  });
}

/**
 * Track file download
 */
export async function trackDownload(fileName: string, fileUrl: string) {
  // Google Analytics
  trackGA({
    action: 'file_download',
    category: 'engagement',
    label: fileName,
  });

  // Internal DB
  await trackInternal('download', {
    file_name: fileName,
    file_url: fileUrl,
  });
}

/**
 * Track search
 */
export async function trackSearch(searchTerm: string, resultsCount: number) {
  // Internal DB
  await trackInternal('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * Track CTA click (Call-to-Action)
 */
export async function trackCTAClick(ctaLabel: string, ctaLocation: string, ctaUrl: string) {
  await trackButtonClick(`CTA: ${ctaLabel}`, ctaLocation);
}

/**
 * Track outbound link click
 */
export async function trackOutboundLink(url: string, linkText: string) {
  // Google Analytics
  trackGA({
    action: 'outbound_link',
    category: 'engagement',
    label: `${linkText} -> ${url}`,
  });

  // Internal DB
  await trackInternal('outbound_link', {
    url,
    link_text: linkText,
  });
}

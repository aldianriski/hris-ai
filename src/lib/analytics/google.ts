/**
 * Google Analytics 4 (GA4) Integration
 * https://developers.google.com/analytics/devguides/collection/ga4
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      ...args: any[]
    ) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

/**
 * Initialize Google Analytics
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4: Measurement ID not found');
    return;
  }

  // gtag.js is loaded via GoogleAnalytics component
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send page views manually
  });
}

/**
 * Track page views
 */
export function trackPageView(url: string) {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Track custom events
 */
export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (!window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Track conversions (goals)
 */
export function trackConversion(conversionLabel: string, value?: number) {
  if (!window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: `${GA_MEASUREMENT_ID}/${conversionLabel}`,
    value: value,
  });
}

/**
 * Track form submissions
 */
export function trackFormSubmit(formName: string) {
  trackEvent({
    action: 'form_submit',
    category: 'engagement',
    label: formName,
  });
}

/**
 * Track button clicks
 */
export function trackButtonClick(buttonLabel: string, buttonLocation: string) {
  trackEvent({
    action: 'button_click',
    category: 'engagement',
    label: `${buttonLabel} - ${buttonLocation}`,
  });
}

/**
 * Track lead generation
 */
export function trackLead(leadType: 'trial' | 'demo' | 'contact' | 'newsletter', value?: number) {
  trackEvent({
    action: 'generate_lead',
    category: 'conversion',
    label: leadType,
    value: value,
  });

  // Also track as conversion
  trackConversion('lead_generation', value);
}

/**
 * Track pricing page visit
 */
export function trackPricingView(plan?: string) {
  trackEvent({
    action: 'view_pricing',
    category: 'engagement',
    label: plan,
  });
}

/**
 * Track video plays
 */
export function trackVideoPlay(videoTitle: string) {
  trackEvent({
    action: 'video_play',
    category: 'engagement',
    label: videoTitle,
  });
}

/**
 * Track file downloads
 */
export function trackDownload(fileName: string) {
  trackEvent({
    action: 'file_download',
    category: 'engagement',
    label: fileName,
  });
}

/**
 * Track search queries
 */
export function trackSearch(searchTerm: string) {
  if (!window.gtag) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (!window.gtag) return;

  window.gtag('set', 'user_properties', properties);
}

/**
 * Track e-commerce events (for subscription purchases)
 */
export function trackPurchase({
  transactionId,
  value,
  currency = 'IDR',
  items,
}: {
  transactionId: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}) {
  if (!window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
}

/**
 * Track add to cart (for subscription selection)
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}) {
  if (!window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: 'IDR',
    value: item.price * item.quantity,
    items: [item],
  });
}

/**
 * Track checkout begin (when user starts trial/signup)
 */
export function trackBeginCheckout(items: any[]) {
  if (!window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    items: items,
  });
}

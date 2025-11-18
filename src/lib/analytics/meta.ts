/**
 * Meta Pixel (Facebook/Instagram) Integration
 * https://developers.facebook.com/docs/meta-pixel
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/**
 * Initialize Meta Pixel
 */
export function initMetaPixel() {
  if (!META_PIXEL_ID) {
    console.warn('Meta Pixel: Pixel ID not found');
    return;
  }

  if (typeof window === 'undefined' || window.fbq) return;

  const fbq: any = function () {
    fbq.callMethod
      ? fbq.callMethod.apply(fbq, arguments)
      : fbq.queue.push(arguments);
  };

  if (!window.fbq) window.fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

/**
 * Track page views
 */
export function trackMetaPageView() {
  if (!window.fbq) return;
  window.fbq('track', 'PageView');
}

/**
 * Track standard events
 */
export function trackMetaEvent(eventName: string, parameters?: Record<string, any>) {
  if (!window.fbq) return;
  window.fbq('track', eventName, parameters);
}

/**
 * Track custom events
 */
export function trackMetaCustomEvent(eventName: string, parameters?: Record<string, any>) {
  if (!window.fbq) return;
  window.fbq('trackCustom', eventName, parameters);
}

/**
 * Track lead generation
 */
export function trackMetaLead(value?: number, currency: string = 'IDR') {
  trackMetaEvent('Lead', {
    value: value,
    currency: currency,
  });
}

/**
 * Track contact form submission
 */
export function trackMetaContact() {
  trackMetaEvent('Contact');
}

/**
 * Track trial signup
 */
export function trackMetaStartTrial(value?: number) {
  trackMetaEvent('StartTrial', {
    value: value,
    currency: 'IDR',
  });
}

/**
 * Track demo request
 */
export function trackMetaDemoRequest() {
  trackMetaCustomEvent('DemoRequest');
}

/**
 * Track newsletter subscription
 */
export function trackMetaSubscribe() {
  trackMetaEvent('Subscribe');
}

/**
 * Track complete registration
 */
export function trackMetaCompleteRegistration(value?: number) {
  trackMetaEvent('CompleteRegistration', {
    value: value,
    currency: 'IDR',
  });
}

/**
 * Track purchase/subscription
 */
export function trackMetaPurchase({
  value,
  currency = 'IDR',
  contentName,
  contentCategory,
}: {
  value: number;
  currency?: string;
  contentName: string;
  contentCategory: string;
}) {
  trackMetaEvent('Purchase', {
    value: value,
    currency: currency,
    content_name: contentName,
    content_category: contentCategory,
  });
}

/**
 * Track add to cart (plan selection)
 */
export function trackMetaAddToCart({
  value,
  contentName,
  contentCategory,
}: {
  value: number;
  contentName: string;
  contentCategory: string;
}) {
  trackMetaEvent('AddToCart', {
    value: value,
    currency: 'IDR',
    content_name: contentName,
    content_category: contentCategory,
  });
}

/**
 * Track view content (pricing page)
 */
export function trackMetaViewContent({
  contentName,
  contentCategory,
  value,
}: {
  contentName: string;
  contentCategory: string;
  value?: number;
}) {
  trackMetaEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
    value: value,
    currency: 'IDR',
  });
}

/**
 * Track search
 */
export function trackMetaSearch(searchString: string) {
  trackMetaEvent('Search', {
    search_string: searchString,
  });
}

/**
 * Track initiate checkout
 */
export function trackMetaInitiateCheckout(value: number, contentName: string) {
  trackMetaEvent('InitiateCheckout', {
    value: value,
    currency: 'IDR',
    content_name: contentName,
  });
}

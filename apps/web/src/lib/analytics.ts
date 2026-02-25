/**
 * Lightweight analytics tracking utility.
 * Phase 1: Logs events to console. In future phases, this will send
 * events to a backend analytics service (Mixpanel, PostHog, etc.).
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'chip_click'
  | 'chat_start'
  | 'chat_message_sent'
  | 'kundli_generated'
  | 'diagnosis_viewed'
  | 'paywall_shown'
  | 'payment_started'
  | 'payment_completed'
  | 'report_viewed'
  | 'report_downloaded'
  | 'remedy_marked_done'
  | 'referral_shared'
  | 'language_toggled'
  | 'login_started'
  | 'login_completed'
  | 'tab_switched';

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Track an analytics event with optional properties.
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  const payload = {
    event,
    properties: properties || {},
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  if (IS_DEV) {
    console.log('[Analytics]', payload.event, payload.properties);
  }

  // Queue event in localStorage for batch sending (future)
  if (typeof window !== 'undefined') {
    try {
      const queue = JSON.parse(localStorage.getItem('upaya_analytics_queue') || '[]');
      queue.push(payload);
      // Keep max 100 events in queue
      if (queue.length > 100) queue.shift();
      localStorage.setItem('upaya_analytics_queue', JSON.stringify(queue));
    } catch {
      // Silently fail if storage is unavailable
    }
  }
}

/**
 * Track a page view.
 */
export function trackPageView(pageName: string, properties?: EventProperties): void {
  trackEvent('page_view', { page: pageName, ...properties });
}

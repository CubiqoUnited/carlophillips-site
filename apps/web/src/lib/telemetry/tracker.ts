/**
 * CARLOPHILLIPS Telemetry & Analytics Engine
 * Tracks user engagement, bounce signals, video retention, gallery exploration, and purchase funnel.
 */

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'navigation' | 'video' | 'gallery' | 'commerce' | 'dwell';
  name: string;
  data?: Record<string, any>;
}

const STORAGE_KEY = 'cp_telemetry_events_v1';

export function trackEvent(
  type: TelemetryEvent['type'],
  name: string,
  data?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  const event: TelemetryEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    name,
    data,
  };

  // Dispatch to GA4 dataLayer if available
  if ((window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: type,
      ...data,
    });
  }

  // Dispatch to Microsoft Clarity if available
  if ((window as any).clarity) {
    (window as any).clarity('event', name);
  }

  // Persist locally for Admin analytics dashboard
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const events: TelemetryEvent[] = raw ? JSON.parse(raw) : [];
    events.push(event);
    // Keep last 100 events
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-100)));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function getRecordedEvents(): TelemetryEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

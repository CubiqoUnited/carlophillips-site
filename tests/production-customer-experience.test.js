import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createAnalyticsEvent } from '../lib/analytics/event-contract.js';
import { canLoadAnalytics, emitGaEvent, initializeGa, isValidGaMeasurementId } from '../lib/analytics/browser-loader.js';
import robots from '../app/robots.js';
import sitemap from '../app/sitemap.js';

describe('production customer experience authority', () => {
  it('has exactly one tracked robots implementation', () => {
    expect(existsSync('app/robots.js')).toBe(true);
    expect(existsSync('public/robots.txt')).toBe(false);
  });

  it('keeps non-production environments uncrawlable', () => {
    expect(robots()).toEqual({ rules: [{ userAgent: '*', disallow: '/' }] });
  });

  it('uses deterministic sitemap evidence and excludes unreleased products', () => {
    const entries = sitemap();
    expect(entries.every((entry) => entry.lastModified.toISOString() === '2026-08-14T00:00:00.000Z')).toBe(true);
    expect(entries.some((entry) => entry.url.includes('/products/'))).toBe(false);
  });

  it('keeps draft policy content out of the sitemap', () => {
    expect(sitemap().some((entry) => /\/(privacy|terms|cookie-policy)$/.test(entry.url))).toBe(false);
  });

  it('publishes all technical policy surfaces', () => {
    for (const route of ['privacy', 'terms', 'cookie-policy']) expect(existsSync(`app/${route}/page.js`)).toBe(true);
  });

  it('connects privacy-preserving public observability without restoring a consent banner', () => {
    expect(existsSync('components/privacy/consent-preferences.jsx')).toBe(false);
    const layout = readFileSync('app/layout.js', 'utf8');
    const observability = readFileSync('components/analytics/site-observability.jsx', 'utf8');
    expect(layout).toContain('NEXT_PUBLIC_VERCEL_OBSERVABILITY_ENABLED');
    expect(layout).toContain('SiteObservability');
    expect(observability).toContain("pathname?.startsWith('/admin')");
    expect(observability).toContain('url.origin');
    expect(observability).toContain('url.pathname');
    expect(observability).toContain('<Analytics');
    expect(observability).toContain('<SpeedInsights');
  });

  it('validates GA IDs and stays silent before every independent gate passes', () => {
    expect(isValidGaMeasurementId('G-ABC1234567')).toBe(true);
    for (const value of ['', 'UA-123-4', 'G-ABC;alert(1)', 'G-short']) expect(isValidGaMeasurementId(value)).toBe(false);
    expect(canLoadAnalytics({ approved: false, consent: 'accepted', measurementId: 'G-ABC1234567' })).toBe(false);
    expect(canLoadAnalytics({ approved: true, consent: 'rejected', measurementId: 'G-ABC1234567' })).toBe(false);
    expect(canLoadAnalytics({ approved: true, consent: 'accepted', measurementId: 'invalid' })).toBe(false);
    expect(canLoadAnalytics({ approved: true, consent: 'accepted', measurementId: 'G-ABC1234567' })).toBe(true);
  });

  it('initializes after provider readiness and emits an approved passive event deterministically', () => {
    const fakeWindow = {};
    const event = createAnalyticsEvent('page_view', { route_group: 'product', email: 'removed@example.com' });
    expect(emitGaEvent(fakeWindow, event)).toBe(false);
    initializeGa(fakeWindow, 'G-ABC1234567');
    expect(fakeWindow.dataLayer[1]).toEqual(['config', 'G-ABC1234567', expect.objectContaining({ send_page_view: false })]);
    expect(emitGaEvent(fakeWindow, event)).toBe(true);
    expect(fakeWindow.dataLayer[2]).toEqual(['event', 'page_view', { route_group: 'product' }]);
  });

  it('rejects unsafe analytics properties and unsupported events', () => {
    expect(createAnalyticsEvent('product_view', { route_group: 'product', raw_product_id: 'gid://secret', email: 'person@example.com' }))
      .toEqual({ name: 'product_view', properties: { route_group: 'product' } });
    expect(() => createAnalyticsEvent('checkout_identity')).toThrow('Unsupported analytics event');
  });
});

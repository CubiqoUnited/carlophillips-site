import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('storefront design system', () => {
  it('defines and consumes the CARLOPHILLIPS foundation tokens', () => {
    const styles = readFileSync('app/globals.css', 'utf8');
    const home = readFileSync('components/storefront/home-storefront.jsx', 'utf8');

    for (const token of [
      '--cp-color-canvas',
      '--cp-color-ink',
      '--cp-color-rule',
      '--cp-color-overlay',
      '--cp-font-sans',
      '--cp-content-max',
      '--cp-page-gutter',
      '--cp-header-height',
      '--cp-label-tracking',
      '--cp-duration-standard',
      '--cp-control-size',
    ]) {
      expect(styles).toContain(token);
    }

    expect(home).toContain('cp-page-shell');
    expect(home).toContain('cp-display');
    expect(home).toContain('cp-scroll-cue');
    expect(home).toContain('var(--cp-header-height)');
    expect(home).toContain('cp-media-dialog');
    expect(styles).toContain('scroll-snap-type: x mandatory');
  });

  it('keeps the customer-facing route metadata provider-neutral', () => {
    const sources = [
      readFileSync('app/layout.js', 'utf8'),
      readFileSync('app/shop/page.js', 'utf8'),
      readFileSync('app/products/[handle]/page.js', 'utf8'),
    ].join('\n');

    expect(sources).not.toMatch(/description:\s*['"][^'"\n]*shopify/i);
  });
});

import { createHash } from 'node:crypto';
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
      '--cp-color-backdrop',
      '--cp-font-sans',
      '--cp-content-max',
      '--cp-page-gutter',
      '--cp-header-height',
      '--cp-label-tracking',
      '--cp-duration-standard',
      '--cp-control-size',
      '--cp-media-panel-inset',
      '--cp-product-copy-width',
    ]) {
      expect(styles).toContain(token);
    }

    expect(home).toContain('cp-page-shell');
    expect(home).toContain('cp-display');
    expect(home).toContain('cp-scroll-cue');
    expect(home).toContain('cp-scroll-cue-control');
    expect(home).toContain('cp-product-title');
    expect(home).toContain('cp-product-review');
    expect(home).toContain('cp-product-layout');
    expect(home).toContain('cp-product-fact-label');
    expect(home).toContain('cp-product-fact-value');
    expect(home).toContain('cp-product-media-button');
    expect(home).toContain('cp-product-media-button-corner');
    expect(home).toContain('cp-media-jump');
    expect(home).toContain('var(--cp-header-height)');
    expect(home).toContain('cp-media-dialog');
    expect(home).toContain('cp-media-panel');
    expect(home).toContain("displayName: 'ONE'");
    expect(styles).toContain('-webkit-line-clamp: 3');
    expect(styles).toContain('padding-top: calc(var(--cp-header-height) + 9rem)');
    expect(styles).toContain('@media (min-width: 520px)');
    expect(styles).toContain('padding-top: var(--cp-header-height)');
    expect(styles).toContain('scroll-snap-type: x mandatory');
    expect(styles).toContain('@keyframes cp-campaign-drift');
    expect(styles).toContain('.cp-campaign-image,');
    expect(home).not.toContain('HomeReleaseStage');
  });

  it('uses the exact Product Owner supplied runway image', () => {
    const digest = createHash('sha256')
      .update(readFileSync('public/campaigns/lofoten-runway-hero.png'))
      .digest('hex');

    expect(digest).toBe('2c42ff8fab50819522e7a6a8e48a51083e39b0e4fdbc41df13568446426ac338');
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

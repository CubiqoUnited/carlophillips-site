import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('storefront design system', () => {
  it('defines and consumes the CARLOPHILLIPS foundation tokens', () => {
    const styles = readFileSync('app/globals.css', 'utf8');
    const home = readFileSync('components/storefront/home-storefront.jsx', 'utf8');

    for (const token of [
      '--cp-black',
      '--cp-white',
      '--cp-color-canvas',
      '--cp-color-ink',
      '--cp-color-copy-strong',
      '--cp-color-copy-soft',
      '--cp-color-rule',
      '--cp-color-rule-focus',
      '--cp-color-overlay',
      '--cp-color-backdrop',
      '--cp-font-sans',
      '--cp-font-editorial',
      '--cp-size-body-large',
      '--cp-tracking-action',
      '--cp-space-24',
      '--cp-content-max',
      '--cp-content-wide',
      '--cp-page-gutter',
      '--cp-section-space',
      '--cp-header-height',
      '--cp-label-tracking',
      '--cp-shadow-dialog',
      '--cp-scrim-campaign',
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

  it('keeps every active customer surface semantic-token led', () => {
    const customerFiles = [
      'components/storefront/home-storefront.jsx',
      'components/storefront/storefront-header.jsx',
      'components/commerce/catalog-state.jsx',
      'components/commerce/bag-state.jsx',
      'components/commerce/product-detail.jsx',
      'components/commerce/shopify-checkout-form.jsx',
      'app/concept-preview/page.js',
    ];

    for (const file of customerFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} contains a raw visual colour utility`).not.toMatch(
        /(?:bg|text|border|from|via|to)-(?:black|white)(?:\/\d+)?|(?:bg|text|border)-\[#[0-9a-f]+\]/i
      );
      expect(source, `${file} contains a one-off tracking value`).not.toMatch(/tracking-\[[^\]]+\]/);
      expect(source, `${file} contains a raw CSS colour`).not.toMatch(/rgba?\(/);
    }

    const sharedHeader = readFileSync('components/storefront/storefront-header.jsx', 'utf8');
    const catalog = readFileSync('components/commerce/catalog-state.jsx', 'utf8');
    const bag = readFileSync('components/commerce/bag-state.jsx', 'utf8');
    const product = readFileSync('components/commerce/product-detail.jsx', 'utf8');
    const concept = readFileSync('app/concept-preview/page.js', 'utf8');

    expect(sharedHeader).toContain('cp-commerce-header');
    expect(catalog).toContain('StorefrontHeader');
    expect(bag).toContain('StorefrontHeader');
    expect(product).toContain('StorefrontHeader');
    expect(concept).toContain('cp-concept-page');
    expect(concept).toContain("robots: { index: false, follow: false }");
    expect(concept).toContain('Draft only');
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

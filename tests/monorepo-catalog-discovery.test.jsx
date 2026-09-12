import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommerceCatalogState } from '../apps/web/src/components/commerce/catalog-state';

function product(overrides) {
  return {
    source: 'shopify',
    sourceLabel: 'Shopify',
    commerceAllowed: true,
    reason: 'CURRENT_SHOPIFY_PRODUCT_AVAILABLE',
    id: overrides.handle,
    price: 128,
    currency: 'USD',
    description: '',
    tagline: '',
    story: '',
    truthHeading: '',
    commerceExplanation: '',
    colors: ['black'],
    sizes: ['s', 'm', 'l'],
    variantPresentation: null,
    availableForSale: true,
    vendor: 'Apliiq',
    media: [],
    mediaReview: null,
    details: [],
    ...overrides,
  };
}

describe('active Shopify catalog discovery', () => {
  it('derives truthful categories and navigation from current products', () => {
    const html = renderToStaticMarkup(
      <CommerceCatalogState
        pageLabel="Shop"
        decision={{
          schemaVersion: 'cp.catalog-decision.v1',
          environment: 'preview',
          status: 'available',
          source: 'shopify',
          candidateCount: 2,
          visibleCount: 2,
          excludedCount: 0,
          commerceAllowed: true,
          reason: 'CATALOG_ITEMS_AVAILABLE',
          excludedReasons: [],
          products: [
            product({
              handle: 'carlophillips-signature-hoodie',
              title: 'CARLOPHILLIPS Signature Hoodie',
              productType: 'hoodie',
            }),
            product({
              handle: 'carlophillips-rapid-logo-tee',
              title: 'CARLOPHILLIPS Rapid Logo Tee',
              productType: 'tshirts',
              price: 13.34,
            }),
          ],
        }}
      />
    );

    expect(html).toContain('ALL CATEGORIES');
    expect(html).toContain('ALL HOODIES');
    expect(html).toContain('ALL TSHIRTS');
    expect(html.match(/>1 piece</g)).toHaveLength(2);
    expect(html).toContain('aria-label="Discovery position"');
    expect(html).not.toContain('JACKETS');
  });

  it('opens shop as a closeable overlay on the canonical Discovery surface', () => {
    const shopSource = readFileSync('apps/web/src/app/shop/page.tsx', 'utf8');
    const boundarySource = readFileSync(
      'apps/web/src/components/commerce/catalog-boundary.tsx',
      'utf8'
    );

    expect(shopSource).toContain('discoveryOverlay');
    expect(boundarySource).toContain('<HomeStorefront');
    expect(boundarySource).toContain('overlay');
  });

  it('renders the category grid in the initial shop overlay viewport', () => {
    const html = renderToStaticMarkup(
      <CommerceCatalogState
        overlay
        decision={{
          schemaVersion: 'cp.catalog-decision.v1',
          environment: 'preview',
          status: 'available',
          source: 'shopify',
          candidateCount: 2,
          visibleCount: 2,
          excludedCount: 0,
          commerceAllowed: true,
          reason: 'CATALOG_ITEMS_AVAILABLE',
          excludedReasons: [],
          products: [
            product({
              handle: 'carlophillips-rapid-logo-tee',
              title: 'CARLOPHILLIPS Rapid Logo Tee',
              productType: 'tshirts',
              price: 13.34,
            }),
            product({
              handle: 'carlophillips-signature-hoodie',
              title: 'CARLOPHILLIPS Signature Hoodie',
              productType: 'hoodie',
            }),
          ],
        }}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('CATEGORIES / 2 groups');
    expect(html).toContain('<strong>TSHIRTS</strong><small>1 piece</small>');
    expect(html).toContain('<strong>HOODIES</strong><small>1 piece</small>');
  });

  it('keeps category selection inside the overlay product grid', () => {
    const source = readFileSync(
      'apps/web/src/components/commerce/catalog-state.tsx',
      'utf8'
    );

    expect(source).toContain('setActiveCategory(category.key)');
    expect(source).toContain('visibleProducts.map((product)');
  });

  it('opens a selected card as that Shopify product in Discovery', () => {
    const catalogSource = readFileSync(
      'apps/web/src/components/commerce/catalog-state.tsx',
      'utf8'
    );
    const boundarySource = readFileSync(
      'apps/web/src/components/commerce/catalog-boundary.tsx',
      'utf8'
    );

    expect(catalogSource).toContain(
      '`/shop?product=${encodeURIComponent(product.handle)}`'
    );
    expect(boundarySource).toContain('summarizeCatalog(decision, productHandle)');
    expect(boundarySource).toContain('discoveryOnly');
  });

  it('uses the compact three-column desktop and two-column mobile grids', () => {
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );

    expect(styles).toMatch(
      /\.cp-catalog-overlay \.cp-discovery-category-grid,[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/
    );
    expect(styles).toMatch(
      /@media \(max-width: 48rem\)[\s\S]*\.cp-catalog-overlay \.cp-discovery-category-grid,[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/
    );
  });

  it('matches the approved Discovery menu information architecture', () => {
    const source = readFileSync(
      'apps/web/src/components/editorial/WorkbookReplica.tsx',
      'utf8'
    );

    expect(source).toContain('id="menu-discovery">DISCOVERY');
    expect(source).toContain('ALL CATEGORIES');
    expect(source).toContain('ALL {category.label}');
    expect(source).toContain('CONTACT');
    expect(source).toContain('PRIVATE LIST');
    expect(source).not.toContain('>HOME<');
    expect(source).not.toContain('>AFTERCARE<');
    expect(source).not.toContain('>ACCOUNT<');
  });
});

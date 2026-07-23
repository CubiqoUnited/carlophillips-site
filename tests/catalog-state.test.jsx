import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommerceCatalogState } from '../components/commerce/catalog-state.jsx';

describe('catalog presentation', () => {
  it('renders truthful visible and withheld counts with review-only navigation', () => {
    const html = renderToStaticMarkup(<CommerceCatalogState pageLabel="Shop" decision={{
      schemaVersion: 'cp.catalog-decision.v1',
      environment: 'local',
      status: 'available',
      source: 'fixture',
      candidateCount: 2,
      visibleCount: 1,
      excludedCount: 1,
      commerceAllowed: false,
      reason: 'CATALOG_ITEMS_AVAILABLE',
      excludedReasons: ['LOCAL_FIXTURE_NOT_FOUND'],
      products: [{
        handle: 'visible-product',
        title: 'Visible fixture',
        price: 20,
        currency: 'USD',
        sourceLabel: 'Local fixture review — not Shopify live data',
        media: [],
      }],
    }} />);

    expect(html).toContain('1 release candidate');
    expect(html).toContain('Candidate records</dt><dd class="mt-3 text-white/70">2');
    expect(html).toContain('Visible here</dt><dd class="mt-3 text-white/70">1');
    expect(html).toContain('Withheld</dt><dd class="mt-3 text-white/70">1');
    expect(html).toContain('Local fixture review — not Shopify live data');
    expect(html).toContain('Review product');
    expect(html).toContain('purchasing disabled');
    expect(html).not.toContain('Add to bag');
  });

  it('renders an empty state without denied product payloads', () => {
    const html = renderToStaticMarkup(<CommerceCatalogState decision={{
      schemaVersion: 'cp.catalog-decision.v1',
      environment: 'production',
      status: 'unavailable',
      source: 'unavailable',
      candidateCount: 1,
      visibleCount: 0,
      excludedCount: 1,
      commerceAllowed: false,
      reason: 'NO_RELEASE_ELIGIBLE_PRODUCTS',
      excludedReasons: ['PRODUCT_RELEASE_NOT_RELEASED'],
      products: [],
    }} />);

    expect(html).toContain('No release-eligible products.');
    expect(html).toContain('No denied or unavailable product data has been substituted.');
    expect(html).toContain('Visible here</dt><dd class="mt-3 text-white/70">0');
    expect(html).not.toContain('PRODUCT_RELEASE_NOT_RELEASED');
    expect(html).not.toContain('/products/');
  });
});

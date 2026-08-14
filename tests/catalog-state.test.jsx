import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommerceCatalogState } from '../apps/web/src/components/commerce/catalog-state.tsx';

describe('catalog presentation', () => {
  it('renders truthful visible and withheld counts with review-only navigation', () => {
    const html = renderToStaticMarkup(
      <CommerceCatalogState
        pageLabel="Shop"
        decision={{
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
          products: [
            {
              handle: 'visible-product',
              title: 'Visible fixture',
              price: 20,
              currency: 'USD',
              sourceLabel: 'Local fixture review — not Shopify live data',
              media: [],
            },
          ],
        }}
      />
    );

    expect(html).toContain('1 preview piece');
    expect(html).toMatch(/Candidate records<\/dt><dd[^>]*>2/);
    expect(html).toMatch(/Visible here<\/dt><dd[^>]*>1/);
    expect(html).toMatch(/Withheld<\/dt><dd[^>]*>1/);
    expect(html).toContain('Local presentation fixture');
    expect(html).toContain('Preview product');
    expect(html).toContain('cannot be purchased');
    expect(html).not.toContain('Add to bag');
    expect(html.toLowerCase()).not.toContain('shopify');
  });

  it('renders an empty state without denied product payloads', () => {
    const html = renderToStaticMarkup(
      <CommerceCatalogState
        decision={{
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
        }}
      />
    );

    expect(html).toContain('Coming soon.');
    expect(html).toContain('The next release is being prepared. Return soon.');
    expect(html).toMatch(/Visible here<\/dt><dd[^>]*>0/);
    expect(html).not.toContain('PRODUCT_RELEASE_NOT_RELEASED');
    expect(html).not.toContain('/products/');
  });

  it('renders a live collection without internal release counters or status jargon', () => {
    const html = renderToStaticMarkup(
      <CommerceCatalogState
        decision={{
          schemaVersion: 'cp.catalog-decision.v1',
          environment: 'preview',
          status: 'available',
          source: 'shopify',
          candidateCount: 1,
          visibleCount: 1,
          excludedCount: 0,
          commerceAllowed: true,
          reason: 'CATALOG_ITEMS_AVAILABLE',
          excludedReasons: [],
          products: [
            {
              handle: 'signature-hoodie',
              title: 'Signature Hoodie',
              price: 128,
              currency: 'USD',
              commerceAllowed: true,
              media: [],
            },
          ],
        }}
      />
    );
    expect(html).toContain('The Collection');
    expect(html).toContain('Signature Series / 001');
    expect(html).toContain('View product');
    expect(html).not.toContain('Candidate records');
    expect(html).not.toContain('release candidate');
    expect(html).not.toContain('Shopify checkout available');
    expect(html.toLowerCase()).not.toContain('shopify');
    expect(html).toContain('data-commerce-source="store"');
  });
});

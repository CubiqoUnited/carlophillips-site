import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomeStorefront, { HomeReleaseStage } from '../components/storefront/home-storefront.jsx';

const availableSummary = {
  schemaVersion: 'cp.home-catalog-summary.v1',
  environment: 'local',
  status: 'available',
  candidateCount: 1,
  visibleCount: 1,
  excludedCount: 0,
  commerceAllowed: false,
  message: '1 local non-commerce fixture is available for review.',
  primaryProduct: {
    title: 'CARLOPHILLIPS Signature Hoodie',
    href: '/products/carlophillips-signature-hoodie',
    sourceLabel: 'Local fixture review — not Shopify live data',
    commerceAllowed: false,
  },
};

describe('home release composition', () => {
  it('renders registry-derived counts and the eligible PDP review link', () => {
    const html = renderToStaticMarkup(<HomeReleaseStage summary={availableSummary} />);
    expect(html).toContain('Candidates</span><strong');
    expect(html).toContain('>1</strong>');
    expect(html).toContain('Visible</span><strong');
    expect(html).toContain('Withheld</span><strong');
    expect(html).toContain('CARLOPHILLIPS Signature Hoodie');
    expect(html).toContain('href="/products/carlophillips-signature-hoodie"');
    expect(html).toContain('Review product');
    expect(html).not.toContain('Add to bag');
  });

  it('withholds the PDP link and payload when no item is eligible', () => {
    const summary = {
      ...availableSummary,
      status: 'unavailable',
      visibleCount: 0,
      excludedCount: 1,
      message: 'No release-eligible products are visible. 1 candidate is withheld.',
      primaryProduct: null,
    };
    const html = renderToStaticMarkup(<HomeReleaseStage summary={summary} />);
    expect(html).toContain('The product remains behind its release gate.');
    expect(html).toContain('Visible</span><strong');
    expect(html).not.toContain('/products/');
    expect(html).not.toContain('Signature Hoodie');
    expect(html).toContain('href="/collections"');
  });

  it('derives the hero catalog CTA from the same visible count', () => {
    const available = renderToStaticMarkup(<HomeStorefront catalogSummary={availableSummary} />);
    const unavailable = renderToStaticMarkup(<HomeStorefront catalogSummary={{
      ...availableSummary,
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      primaryProduct: null,
    }} />);
    expect(available).toContain('Review 1 product');
    expect(unavailable).toContain('View release state');
    expect(unavailable).not.toContain('/products/');
  });

  it('keeps the archived board explicitly separate from product and media truth', () => {
    const html = renderToStaticMarkup(<HomeStorefront catalogSummary={availableSummary} />);
    expect(html).toContain('Visual-system reference · not product or media proof');
    expect(html).toContain('Nothing shown here grants purchase, publication, or fulfillment authority.');
    expect(html).not.toContain('Add to bag');
    expect(html).not.toContain('Shop Now');
  });
});

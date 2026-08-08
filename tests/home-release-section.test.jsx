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
    heroMedia: {
      url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      alt: 'Signature Hoodie front candidate',
      label: 'Modelize product portrait · generated candidate · approval pending',
    },
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
    expect(html).toContain('View product');
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
    expect(html).toContain('The next piece is taking shape.');
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
    expect(available).toContain('Preview the collection');
    expect(available).toContain('%2Fproducts%2Fsignature-hoodie%2Fcandidates%2Fmodelize%2Feditorial-02.jpg');
    expect(available).toContain('Modelize product portrait · generated candidate · approval pending');
    expect(unavailable).toContain('Explore the collection');
    expect(unavailable).not.toContain('/products/');
    expect(unavailable).not.toContain('editorial-02.jpg');
  });

  it('keeps the archived board separate when no release-eligible hero media exists', () => {
    const html = renderToStaticMarkup(<HomeStorefront catalogSummary={{
      ...availableSummary,
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      primaryProduct: null,
    }} />);
    expect(html).toContain('Collection preview');
    expect(html).toContain('A considered study in form, material and everyday utility.');
    expect(html).not.toContain('Add to bag');
    expect(html).not.toContain('Shop Now');
  });

  it('renders live product copy without internal release jargon', () => {
    const html = renderToStaticMarkup(<HomeStorefront catalogSummary={{
      ...availableSummary,
      environment: 'preview',
      commerceAllowed: true,
      primaryProduct: { ...availableSummary.primaryProduct, commerceAllowed: true },
    }} />);
    expect(html).toContain('Discover the Signature Hoodie');
    expect(html).toContain('Signature Series');
    expect(html).toContain('Available now / Black / XS–5XL');
    expect(html).not.toContain('release gate');
    expect(html).not.toContain('Candidates</span>');
    expect(html).not.toContain('Withheld</span>');
  });
});

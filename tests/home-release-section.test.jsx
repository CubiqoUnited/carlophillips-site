import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HomePage, HomeReleaseSection } from '../components/editorial/app-shell.jsx';

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
    const html = renderToStaticMarkup(<HomeReleaseSection summary={availableSummary} />);
    expect(html).toContain('Candidates</dt><dd class="mt-3 text-white/70">1');
    expect(html).toContain('Visible</dt><dd class="mt-3 text-white/70">1');
    expect(html).toContain('Withheld</dt><dd class="mt-3 text-white/70">0');
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
    const html = renderToStaticMarkup(<HomeReleaseSection summary={summary} />);
    expect(html).toContain('The current candidate remains withheld.');
    expect(html).toContain('Visible</dt><dd class="mt-3 text-white/70">0');
    expect(html).not.toContain('/products/');
    expect(html).not.toContain('Signature Hoodie');
    expect(html).toContain('href="/shop"');
  });

  it('derives the hero catalog CTA from the same visible count', () => {
    const available = renderToStaticMarkup(<HomePage catalogSummary={availableSummary} />);
    const unavailable = renderToStaticMarkup(<HomePage catalogSummary={{
      ...availableSummary,
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      primaryProduct: null,
    }} />);
    expect(available).toContain('Review 1 release candidate');
    expect(unavailable).toContain('View release state');
    expect(unavailable).not.toContain('/products/');
  });
});

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
    expect(available).toContain('View the Signature Hoodie');
    expect(available).toContain('%2Fcampaigns%2Flofoten-runway-hero.jpg');
    expect(available).toContain('At the<br/>edge of life.');
    expect(available).toContain('Discover the Signature Hoodie');
    expect(available).toContain('Scroll down');
    expect(available).toContain('Runway 001 / Lofoten');
    expect(available).toContain('%2Fproducts%2Fsignature-hoodie%2Fcandidates%2Fmoda%2Fmodel-front-full.jpg');
    expect(available).toContain('Private product preview');
    expect(available).not.toContain('Modelize product portrait · generated candidate · approval pending');
    expect(unavailable).toContain('Explore the collection');
    expect(unavailable).toContain('%2Fcampaigns%2Flofoten-runway-hero.jpg');
    expect(unavailable).not.toContain('/products/');
    expect(unavailable).not.toContain('editorial-02.jpg');
  });

  it('places the brand campaign before the gated Hoodie runway and category rail', () => {
    const html = renderToStaticMarkup(<HomeStorefront catalogSummary={availableSummary} />);
    const campaignIndex = html.indexOf('aria-label="CARLOPHILLIPS runway campaign"');
    const productIndex = html.indexOf('aria-label="Signature Hoodie runway"');
    const categoriesIndex = html.indexOf('aria-label="Product categories"');

    expect(campaignIndex).toBeGreaterThan(-1);
    expect(productIndex).toBeGreaterThan(campaignIndex);
    expect(categoriesIndex).toBeGreaterThan(productIndex);
    expect(html).toContain('href="#signature-runway"');
    expect(html).toContain('aria-label="Scroll down to discover the Signature Hoodie"');
    expect(html).toContain('id="signature-runway"');
    expect(html).toContain('CARLOPHILLIPS / At the edge of life');
    expect(html).not.toContain('No restocks');
    expect(html).not.toContain('Join the list');
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
    expect(html).toContain('View the Signature Hoodie');
    expect(html).toContain('Signature Series');
    expect(html).toContain('Available now / Black / XS–5XL');
    expect(html).toContain('Signature Series / Runway 001');
    expect(html).toContain('Heavyweight black fleece. Quiet signature detail. Built for every day.');
    expect(html).toContain('%2Fproducts%2Fsignature-hoodie%2Fcandidates%2Fmoda%2Fmodel-front-full.jpg');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('>Hoodies</a>');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('>Shirts</span>');
    expect(html).toContain('>Bottoms</span>');
    expect(html).not.toContain('release gate');
    expect(html).not.toContain('Candidates</span>');
    expect(html).not.toContain('Withheld</span>');
    expect(html.toLowerCase()).not.toContain('shopify');
  });

  it('keeps runway product media and active categories behind product visibility eligibility', () => {
    const html = renderToStaticMarkup(<HomeStorefront catalogSummary={{
      ...availableSummary,
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      commerceAllowed: false,
      primaryProduct: null,
    }} />);
    expect(html).not.toContain('/products/signature-hoodie/candidates/moda/');
    expect(html).toContain('%2Fcampaigns%2Flofoten-runway-hero.jpg');
    expect(html).not.toContain('Signature Series / Runway 001');
    expect(html).not.toContain('aria-current="page"');
    expect(html).toContain('aria-disabled="true"');
  });
});

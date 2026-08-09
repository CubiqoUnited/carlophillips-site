import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomeStorefront, {
  buildHomeGalleryMedia,
  ProductMediaOverlay,
} from '../components/storefront/home-storefront.jsx';

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
    description: 'Heavyweight black pullover hoodie with restrained CP chest embroidery. Built as a premium core layer with structured fleece, a soft interior, and minimal front-chest branding.',
    href: '/products/carlophillips-signature-hoodie',
    sourceLabel: 'Local fixture review — not Shopify live data',
    commerceAllowed: false,
    heroMedia: {
      url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      alt: 'Signature Hoodie front candidate',
      label: 'Modelize product portrait · generated candidate · approval pending',
    },
    media: [{
      type: 'image',
      url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      previewUrl: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      alt: 'Signature Hoodie front candidate',
      label: 'Product front',
    }],
  },
};

describe('home release composition', () => {
  it('derives the hero catalog CTA from the same visible count', () => {
    const available = renderToStaticMarkup(<HomeStorefront catalogSummary={availableSummary} />);
    const unavailable = renderToStaticMarkup(<HomeStorefront catalogSummary={{
      ...availableSummary,
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      primaryProduct: null,
    }} />);
    expect(available).toContain('Explore media');
    expect(available).toContain('09 views');
    expect(available).toContain('data-media-trigger="signature-hoodie"');
    expect(available).toContain('aria-haspopup="dialog"');
    expect(available).toContain('aria-controls="product-media-overlay"');
    expect(available).toContain('%2Fcampaigns%2Flofoten-runway-hero.png');
    expect(available).toContain('At the<br/>edge of life.');
    expect(available).toContain('Scroll and explore');
    expect(available).toContain('cp-scroll-cue-control');
    expect(available).toContain('Runway 001 / Lofoten');
    expect(available).toContain('%2Fproducts%2Fsignature-hoodie%2Fcandidates%2Fmoda%2Fmodel-front-full.jpg');
    expect(available).toContain('Private product preview');
    expect(available).not.toContain('Modelize product portrait · generated candidate · approval pending');
    expect(available).not.toContain('View the Signature Hoodie');
    expect(unavailable).toContain('Explore the collection');
    expect(unavailable).toContain('%2Fcampaigns%2Flofoten-runway-hero.png');
    expect(unavailable).not.toContain('/products/');
    expect(unavailable).not.toContain('editorial-02.jpg');
    expect(unavailable).not.toContain('data-media-trigger="signature-hoodie"');
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
    expect(html).toContain('>ONE</h2>');
    expect(html).not.toContain('No restocks');
    expect(html).not.toContain('Join the list');
    expect(html).not.toContain('Current collection');
    expect(html).not.toContain('Available now / Black / XS–5XL');
    expect(html).not.toContain('Candidates</span>');
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
    expect(html).toContain('Explore media');
    expect(html).toContain('Signature Series');
    expect(html).toContain('Signature Series / 001');
    expect(html).toContain('Heavyweight black pullover hoodie with restrained CP chest embroidery.');
    expect(html).not.toContain('Built as a premium core layer');
    expect(html).toContain('aria-label="Product attributes"');
    expect(html).toContain('>Color</span><span class="cp-product-fact-value">Black</span>');
    expect(html).toContain('>Material</span><span class="cp-product-fact-value">Structured fleece</span>');
    expect(html).toContain('>Feel</span><span class="cp-product-fact-value">Heavyweight, soft interior</span>');
    expect(html).not.toContain('>XS–5XL</span>');
    expect(html).toContain('cp-product-layout');
    expect(html).toContain('lucide-expand');
    expect(html).not.toContain('lucide-arrow-right h-4 w-4');
    expect(html).not.toContain('Available now / Black / XS–5XL');
    expect(html).toContain('%2Fproducts%2Fsignature-hoodie%2Fcandidates%2Fmoda%2Fmodel-front-full.jpg');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('>Hoodies</a>');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('>Shirts</span>');
    expect(html).toContain('>Bottoms</span>');
    expect(html).not.toContain('release gate');
    expect(html).not.toContain('Current collection');
    expect(html).not.toContain('Candidates</span>');
    expect(html).not.toContain('Withheld</span>');
    expect(html.toLowerCase()).not.toContain('shopify');
    expect(html).toContain('cp-product-media-button-corner');
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
    expect(html).toContain('%2Fcampaigns%2Flofoten-runway-hero.png');
    expect(html).not.toContain('Signature Series / Runway 001');
    expect(html).not.toContain('aria-current="page"');
    expect(html).toContain('aria-disabled="true"');
  });

  it('builds a swipe gallery from eligible media without exposing preview studies in production', () => {
    const localMedia = buildHomeGalleryMedia(availableSummary);
    const productionMedia = buildHomeGalleryMedia({ ...availableSummary, environment: 'production' });

    expect(localMedia.length).toBeGreaterThan(productionMedia.length);
    expect(localMedia[0]).toMatchObject({
      src: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      disclosure: 'Product view',
    });
    expect(localMedia.some(item => item.src.includes('model-front-full.jpg'))).toBe(true);
    expect(productionMedia).toHaveLength(1);
    expect(productionMedia[0].src).toContain('editorial-02.jpg');
  });

  it('deduplicates eligible gallery URLs and emits no gallery for a denied product', () => {
    const duplicated = {
      ...availableSummary,
      primaryProduct: {
        ...availableSummary.primaryProduct,
        media: [
          availableSummary.primaryProduct.media[0],
          availableSummary.primaryProduct.media[0],
        ],
      },
    };
    const denied = {
      ...availableSummary,
      visibleCount: 0,
      excludedCount: 1,
      primaryProduct: null,
    };

    const gallery = buildHomeGalleryMedia(duplicated);
    expect(gallery.filter(item => item.src.includes('editorial-02.jpg'))).toHaveLength(1);
    expect(buildHomeGalleryMedia(denied)).toEqual([]);
  });

  it('renders an accessible in-page gallery with swipe and directional controls', () => {
    const media = buildHomeGalleryMedia(availableSummary);
    const openHtml = renderToStaticMarkup(
      <ProductMediaOverlay media={media} onClose={() => {}} open title="Signature Hoodie" />
    );
    const closedHtml = renderToStaticMarkup(
      <ProductMediaOverlay media={media} onClose={() => {}} open={false} title="Signature Hoodie" />
    );

    expect(openHtml).toContain('id="product-media-overlay"');
    expect(openHtml).toContain('role="dialog"');
    expect(openHtml).toContain('aria-modal="true"');
    expect(openHtml).toContain('aria-label="Previous product image"');
    expect(openHtml).toContain('aria-label="Next product image"');
    expect(openHtml).toContain('aria-label="Close product media viewer"');
    expect(openHtml).toContain('01 / 09');
    expect(openHtml).toContain('cp-media-track');
    expect(openHtml).toContain('cp-media-panel');
    expect(openHtml).toContain('aria-label="Jump to motion study"');
    expect(openHtml).toContain('>Motion study</button>');
    expect(openHtml).not.toContain('href="/products/');
    expect(closedHtml).toBe('');
  });
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomeStorefront, {
  buildHomeGalleryMedia,
  isPreviewRunwayReference,
  ProductMediaOverlay,
} from '../components/storefront/home-storefront.jsx';
import { OrderPanel } from '../components/storefront/discovery-section.jsx';
import { CartDrawer } from '../components/commerce/cart-drawer.jsx';
import { SizeGuideDrawer } from '../components/commerce/size-guide.jsx';
import { evaluateMediaReadiness, MEDIA_READINESS_SLOTS } from '../lib/media/media-readiness.js';
import { emptyBag, addLine } from '../lib/commerce/client-bag.js';
import { offeredVariants } from '../components/commerce/shopify-checkout-form.jsx';
import observation from '../releases/cp-signature-hoodie-2026-001/shopify-product-observation.json';
import { createVariantPresentation } from '../lib/commerce/variant-presentation-policy.js';

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
    sourceLabel: 'Local fixture review — not live store data',
    commerceAllowed: false,
    heroMedia: {
      url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      alt: 'Signature Hoodie front candidate',
      label: 'Modelize product portrait · generated candidate · approval pending',
    },
    media: [
      {
        type: 'image',
        url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
        previewUrl: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
        alt: 'Signature Hoodie front candidate',
        label: 'Product front',
      },
      {
        type: 'image',
        url: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
        previewUrl: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
        alt: 'Signature Hoodie editorial candidate',
        label: 'Product editorial',
      },
      {
        type: 'image',
        url: 'https://cdn.shopify.com/s/files/recorded-signature-hoodie-front.jpg',
        previewUrl: 'https://cdn.shopify.com/s/files/recorded-signature-hoodie-front.jpg',
        alt: 'Recorded Signature Hoodie front candidate',
        label: 'Recorded product front',
      },
      {
        type: 'image',
        url: '/products/signature-hoodie/candidates/ai-assisted/back-flatlay-hypothesis.png',
        previewUrl: '/products/signature-hoodie/candidates/ai-assisted/back-flatlay-hypothesis.png',
        alt: 'AI-assisted Signature Hoodie back flat-lay hypothesis',
        label: 'Back flat-lay hypothesis',
      },
    ],
  },
};

describe('home release composition (Screen Inventory Review Workbook)', () => {
  const readyProbe = relativePath => {
    if (!relativePath) return { exists: false };
    if (relativePath.endsWith('.mp4')) return { exists: true, bytes: 2_000_000, isoMedia: true };
    if (relativePath.includes('lofoten')) return { exists: true, bytes: 120_000 };
    if (relativePath.includes('posters/')) return { exists: true, bytes: 15_000 };
    return { exists: false };
  };
  const readiness = evaluateMediaReadiness({ probe: readyProbe, slots: MEDIA_READINESS_SLOTS });
  const render = summary => renderToStaticMarkup(
    <HomeStorefront catalogSummary={summary} mediaReadiness={readiness} />
  );

  it('renders the landing pre-morph over the hero, with ENTER into discovery', () => {
    const html = render(availableSummary);

    expect(html).toContain('data-landing-state="pre-morph"');
    expect(html).toContain('aria-label="CARLOPHILLIPS runway campaign"');
    expect(html).toContain('At the<br/>edge of life.');
    expect(html).toContain('Lofoten · Norway');
    expect(html).toContain('Runway 001 / Lofoten');
    expect(html).toContain('aria-controls="signature-runway"');
    expect(html).toContain('>Enter</span>');
    expect(html).toContain('Join the list');
  });

  it('places the landing before discovery and keeps the header contract', () => {
    const html = render(availableSummary);
    const landingIndex = html.indexOf('aria-label="CARLOPHILLIPS runway campaign"');
    const discoveryIndex = html.indexOf('aria-label="Signature Hoodie runway"');

    expect(landingIndex).toBeGreaterThan(-1);
    expect(discoveryIndex).toBeGreaterThan(landingIndex);
    expect(html).toContain('id="signature-runway"');
    expect(html).toContain('aria-label="Open navigation"');
    expect(html).toContain('aria-label="Bag"');
    expect(html).not.toContain('aria-label="Product categories"');
    expect(html).not.toContain('>Hoodies</a>');
  });

  it('composes discovery as copy, 4:5 stage and the gallery/order stack', () => {
    const html = render(availableSummary);

    expect(html).toContain('Signature Series / 001');
    expect(html).toContain('>ONE</h2>');
    expect(html).toContain('Heavyweight black pullover hoodie with restrained CP chest embroidery.');
    expect(html).not.toContain('Built as a premium core layer');
    expect(html).toContain('cp-discovery-chips');
    for (const fact of ['Color', 'Material', 'Feel']) {
      expect(html).toContain(`<summary class="cp-discovery-chip-summary">${fact}</summary>`);
    }
    expect(html).toContain('View gallery');
    expect(html).toContain('14 images');
    expect(html).toContain('data-media-trigger="signature-hoodie"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-controls="product-media-overlay"');
    expect(html).toContain('All categories');
    expect(html).toContain('All hoodies');
    expect(html).toContain('cp-discovery-thumbs');
  });

  it('offers the three declared clips as dashes and withholds the unprovisioned 360 slot', () => {
    const html = render(availableSummary);

    expect(html).toContain('aria-label="Discovery videos"');
    expect(html).toContain('aria-label="Show Runway motion"');
    expect(html).toContain('aria-label="Show Fit &amp; silhouette"');
    expect(html).toContain('aria-label="360 showcase is not yet available"');
    expect(html).toContain('data-ready-clips="2"');
    expect(html).toContain('/media/signature-hoodie/videos/runway-motion-final.mp4');
    expect(html).toContain('nofullscreen');
    expect(html).not.toContain('lucide-expand');
  });

  it('raises the Video unavailable widget when no clip clears the readiness gate', () => {
    const withheld = evaluateMediaReadiness({ probe: () => ({ exists: false }), slots: MEDIA_READINESS_SLOTS });
    const html = renderToStaticMarkup(
      <HomeStorefront catalogSummary={availableSummary} mediaReadiness={withheld} />
    );

    expect(html).toContain('data-exception-state="video-unavailable"');
    expect(html).toContain('The selected product video could not be loaded.');
    expect(html).toContain('Product details and gallery remain available.');
    expect(html).toContain('>ONE</h2>');
    expect(html).toContain('View gallery');
  });

  it('keeps runway product media behind product visibility eligibility', () => {
    const html = render({
      ...availableSummary,
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      commerceAllowed: false,
      primaryProduct: null,
    });

    expect(html).not.toContain('/products/signature-hoodie/candidates/moda/');
    expect(html).not.toContain('data-media-trigger="signature-hoodie"');
    expect(html).not.toContain('editorial-02.jpg');
    expect(html).toContain('A considered study in form, material and everyday utility.');
    expect(html).not.toContain('Add to bag');
  });

  it('renders live product copy without internal release jargon', () => {
    const html = render({
      ...availableSummary,
      environment: 'preview',
      commerceAllowed: true,
      primaryProduct: { ...availableSummary.primaryProduct, commerceAllowed: true },
    });

    expect(html).toContain('Signature Series / 001');
    expect(html).not.toContain('release gate');
    expect(html).not.toContain('Current collection');
    expect(html).not.toContain('Candidates</span>');
    expect(html).not.toContain('Withheld</span>');
    // Provider neutrality applies to customer copy. Asset hosts inside src/href attributes are
    // transport, not copy, so they are excluded before the check.
    expect(html.replace(/(?:src|href|srcset|imagesrcset)="[^"]*"/gi, '')).not.toMatch(/shopify/i);
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
    expect(html).toContain('href="/cookie-policy"');
    expect(html).toContain('href="/contact"');
    expect(html).toContain('href="/private-list"');
  });

  it('restores the Preview-only visual reference without commerce authority', () => {
    const previewDenied = {
      ...availableSummary,
      environment: 'preview',
      status: 'denied',
      visibleCount: 0,
      excludedCount: 1,
      commerceAllowed: false,
      primaryProduct: null,
    };
    const html = render(previewDenied);

    expect(isPreviewRunwayReference(previewDenied)).toBe(true);
    expect(isPreviewRunwayReference({ ...previewDenied, environment: 'production' })).toBe(false);
    expect(html).toContain('data-media-trigger="signature-hoodie"');
    expect(html).toContain('14 images');
    expect(html).not.toContain('href="/products/carlophillips-signature-hoodie"');
    expect(buildHomeGalleryMedia(previewDenied)).toHaveLength(14);
    expect(buildHomeGalleryMedia(previewDenied).filter(item => item.type === 'video')).toHaveLength(2);
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
    expect(productionMedia).toHaveLength(4);
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
    const denied = { ...availableSummary, visibleCount: 0, excludedCount: 1, primaryProduct: null };

    expect(buildHomeGalleryMedia(duplicated).filter(item => item.src.includes('editorial-02.jpg'))).toHaveLength(1);
    expect(buildHomeGalleryMedia(denied)).toEqual([]);
  });

  it('renders the overlay gallery furniture from screens 05 and 06', () => {
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
    expect(openHtml).toContain('01 / 14');
    expect(openHtml).toContain('cp-media-dashes');
    expect(openHtml).toContain('aria-label="Gallery categories"');
    expect(openHtml).toContain('>Same-model</button>');
    expect(openHtml).toContain('>Merchandise</button>');
    expect(openHtml).toContain('>Detail</button>');
    expect(openHtml).toContain('>2.5D viewer</button>');
    expect(openHtml).toContain('cp-media-track');
    expect(openHtml).toContain('cp-media-panel');
    expect(closedHtml).toBe('');
  });

  it('shows the Gallery unavailable widget when no approved media exists', () => {
    const html = renderToStaticMarkup(
      <ProductMediaOverlay media={[]} onClose={() => {}} open title="Signature Hoodie" />
    );
    expect(html).toContain('data-exception-state="gallery-unavailable"');
    expect(html).toContain('No approved gallery media is currently available');
    expect(html).toContain('Return to product');
  });

  it('renders the order panel, size guide and cart through the secure checkout endpoint', () => {
    const presentation = createVariantPresentation(observation);
    const variants = offeredVariants('carlophillips-signature-hoodie', presentation)
      .map(variant => ({ ...variant, sizeLabel: variant.selectedOptions.find(option => option.name.toLowerCase() === 'size').value.toUpperCase() }));
    const selected = variants[0];

    const orderHtml = renderToStaticMarkup(<OrderPanel
      description="Heavyweight black pullover hoodie."
      handle="carlophillips-signature-hoodie"
      onAddToBag={() => {}}
      onClose={() => {}}
      onOpenSizeGuide={() => {}}
      onSelect={() => {}}
      priceLabel="$128"
      selectedHash={selected.referenceHash}
      variants={variants}
    />);
    const guideHtml = renderToStaticMarkup(<SizeGuideDrawer onClose={() => {}} open />);
    const bag = addLine(emptyBag, {
      handle: 'carlophillips-signature-hoodie',
      referenceHash: selected.referenceHash,
      title: 'ONE',
      size: 'M',
      currency: 'EUR',
      unitPrice: 180,
      quantity: 1,
    });
    const cartHtml = renderToStaticMarkup(<CartDrawer
      bag={bag}
      onApplyDiscount={() => {}}
      onClose={() => {}}
      onContinue={() => {}}
      onQuantity={() => {}}
      onRemove={() => {}}
      open
    />);
    const emptyCartHtml = renderToStaticMarkup(<CartDrawer
      bag={emptyBag}
      onApplyDiscount={() => {}}
      onClose={() => {}}
      onContinue={() => {}}
      onQuantity={() => {}}
      onRemove={() => {}}
      open
    />);

    expect(variants.map(item => item.sizeLabel)).toEqual(['S', 'M', 'L']);
    expect(orderHtml).toContain('Add to bag');
    expect(orderHtml).toContain('Buy now');
    expect(orderHtml).toContain('Size guide');
    expect(orderHtml).toContain('Complimentary shipping &amp; returns');
    expect(orderHtml).toContain('action="/api/checkout"');
    expect(orderHtml).toContain(`value="${selected.referenceHash}"`);

    expect(guideHtml).toContain('Size guide');
    expect(guideHtml).toContain('48 cm');
    expect(guideHtml).toContain('72 cm');
    expect(guideHtml).toContain('Measurements are garment measurements.');

    expect(cartHtml).toContain('Your bag (1)');
    expect(cartHtml).toContain('Size M · Color: Black');
    expect(cartHtml).toContain('Remove');
    expect(cartHtml).toContain('Discount code');
    expect(cartHtml).toContain('Calculated at checkout');
    expect(cartHtml).toContain('Proceed to checkout');
    expect(cartHtml).toContain('Secure checkout · Taxes included');
    expect(cartHtml).toContain('Have a CP account or store credit?');

    expect(emptyCartHtml).toContain('data-exception-state="bag-empty"');
    expect(emptyCartHtml).toContain('Add a product to continue to checkout.');
    expect(emptyCartHtml).toContain('Continue shopping');
  });
});

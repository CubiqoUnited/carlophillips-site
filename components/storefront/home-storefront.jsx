'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../../lib/media/signature-hoodie-showcase.js';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { discoveryCategoryCards, discoveryProductCards } from '../../lib/commerce/discovery-catalog.js';
import { CatalogGridOverlay } from './catalog-overlays.jsx';
import { DiscoverySection } from './discovery-section.jsx';
import { LandingMorph } from './landing-morph.jsx';
import { MenuOverlay, SiteHeader } from './site-navigation.jsx';
import { AddedToBagWidget, CartDrawer } from '../commerce/cart-drawer.jsx';
import { SizeGuideDrawer } from '../commerce/size-guide.jsx';
import { useClientBag } from '../commerce/bag-store.jsx';
import { bagCount } from '../../lib/commerce/client-bag.js';
import { money, offeredVariants, sizeFor } from '../commerce/shopify-checkout-form.jsx';

export { ProductMediaOverlay, galleryCategoryFor } from './gallery-overlay.jsx';
import { ProductMediaOverlay } from './gallery-overlay.jsx';

/*
 * Screen Inventory Review Workbook — the customer storefront.
 *
 * The happy path lives on one route: Landing (01/02) morphs into Discovery (03/04), where the
 * gallery (05/06), category grid (07), product grid (08) and cart (09/23/24) all open as overlays
 * over a page that stays visible behind them. Checkout onward has its own routes because the
 * workbook gives them their own chrome.
 *
 * Media is never chosen here. `mediaReadiness` is decided on the server by the readiness gate; this
 * component only distributes the verdicts it is given.
 */

const fallbackSummary = {
  status: 'denied',
  candidateCount: 0,
  visibleCount: 0,
  excludedCount: 0,
  commerceAllowed: false,
  message: 'The catalog release state is unavailable.',
  primaryProduct: null,
};

const emptyReadiness = {
  landingHero: { decisions: [], renderable: false, motionAllowed: false },
  productVideo: { decisions: [], renderable: false, motionAllowed: false, readyClipCount: 0, declaredClipCount: 0 },
};

const signaturePreviewReferenceMedia = [
  ...SIGNATURE_HOODIE_SHOWCASE_MEDIA,
  {
    src: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
    alt: 'Editorial visualisation of the CARLOPHILLIPS Signature Hoodie in a dark studio setting',
    label: 'Editorial study / one',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'AI-assisted preview',
  },
  {
    src: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
    alt: 'Full-length editorial visualisation of the CARLOPHILLIPS Signature Hoodie',
    label: 'Editorial study / two',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'AI-assisted preview',
  },
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png',
    alt: 'Front on-model visual study of the CARLOPHILLIPS Signature Hoodie',
    label: 'On-body / front study',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'AI-assisted preview',
  },
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/back-flatlay-hypothesis.png',
    alt: 'Back flat-lay hypothesis of the CARLOPHILLIPS Signature Hoodie',
    label: 'Back flat-lay study',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'Unverified back visualisation',
  },
];

const signatureApprovedStagingVideos = [
  {
    type: 'video',
    src: '/media/signature-hoodie/videos/runway-motion-final.mp4',
    posterSrc: '/media/signature-hoodie/posters/runway-motion-final.jpg',
    previewUrl: '/media/signature-hoodie/posters/runway-motion-final.jpg',
    alt: 'AI editorial runway motion showing the black CARLOPHILLIPS Signature Hoodie in a concrete studio',
    label: 'Runway motion',
    disclosure: 'AI editorial · Staging approved',
    hideCaption: true,
  },
  {
    type: 'video',
    src: '/media/signature-hoodie/videos/fit-silhouette-final.mp4',
    posterSrc: '/media/signature-hoodie/posters/fit-silhouette-final.jpg',
    previewUrl: '/media/signature-hoodie/posters/fit-silhouette-final.jpg',
    alt: 'AI editorial fit and silhouette study of the black CARLOPHILLIPS Signature Hoodie in a concrete studio',
    label: 'Fit & silhouette',
    disclosure: 'AI editorial · Staging approved',
    hideCaption: true,
  },
];

const signatureHomepagePresentation = {
  displayName: 'ONE',
  description: 'Heavyweight black pullover hoodie with restrained CP chest embroidery.',
  facts: [
    { label: 'Color', value: 'Black' },
    { label: 'Material', value: 'Structured fleece' },
    { label: 'Feel', value: 'Heavyweight, soft interior' },
  ],
};

const bagLineImage = {
  src: '/products/signature-hoodie/candidates/moda/model-front-full.jpg',
  alt: 'CARLOPHILLIPS Signature Hoodie in black',
};

export function isPreviewRunwayReference(summary) {
  return summary?.environment === 'preview'
    && summary?.visibleCount === 0
    && summary?.commerceAllowed === false;
}

function firstSentence(value, fallback) {
  const sentence = value?.trim().match(/^[^.!?]+[.!?]?/)?.[0];
  return sentence || fallback;
}

export function buildHomeGalleryMedia(summary) {
  if (isPreviewRunwayReference(summary)) {
    return [
      ...signaturePreviewReferenceMedia.map(item => ({ ...item, type: 'image' })),
      ...signatureApprovedStagingVideos,
    ];
  }

  const product = summary?.primaryProduct;
  const signatureVisible = summary?.visibleCount > 0
    && product?.href === '/products/carlophillips-signature-hoodie';
  if (!signatureVisible) return [];

  const releaseMedia = (product.media || []).map(item => ({
    ...item,
    src: item.url,
    disclosure: 'Product view',
  }));
  const reviewMedia = summary.environment === 'production'
    ? []
    : [
        ...SIGNATURE_HOODIE_SHOWCASE_MEDIA.map(item => ({ ...item, type: 'image' })),
        ...signatureApprovedStagingVideos,
      ];
  const uniqueMedia = new Map();
  [...releaseMedia, ...reviewMedia].forEach(item => {
    const source = item.src || item.url;
    if (source && !uniqueMedia.has(source)) uniqueMedia.set(source, item);
  });
  return [...uniqueMedia.values()];
}

function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-footer-inner">
        <span>CARLOPHILLIPS</span>
        <nav className="cp-footer-nav" aria-label="Footer">
          <Link href="/shop">Shop</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/private-list">Private list</Link>
          <Link href="/bag">Bag</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookie-policy">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function HomeStorefront({ catalogSummary, mediaReadiness }) {
  const summary = catalogSummary || fallbackSummary;
  const readiness = mediaReadiness || emptyReadiness;
  const bagStore = useClientBag();

  const [entered, setEntered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedLine, setAddedLine] = useState(null);
  const [selectedHash, setSelectedHash] = useState('');

  const menuButtonRef = useRef(null);
  const galleryButtonRef = useRef(null);
  const wasMenuOpenRef = useRef(false);
  const wasMediaOpenRef = useRef(false);

  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);
  const heroDecision = readiness.landingHero.decisions.find(decision => decision.viewport === 'desktop')
    || readiness.landingHero.decisions[0]
    || null;
  const productClips = readiness.productVideo.decisions;
  const posterOnly = readiness.productVideo.readyClipCount === 0;

  const product = summary.primaryProduct;
  const releaseVariants = useMemo(() => offeredVariants(
    product?.handle || '',
    product?.variantPresentation
  ), [product?.handle, product?.variantPresentation]);
  const previewVariants = useMemo(() => ['S', 'M', 'L'].map(size => ({
    title: size,
    referenceHash: `preview-${size.toLowerCase()}`,
    availableForSale: true,
    price: { amount: '180', currency: 'EUR' },
    selectedOptions: [{ name: 'Size', value: size }],
  })), []);
  const activeVariants = useMemo(() => {
    const source = releaseVariants.length > 0 ? releaseVariants : previewVariants;
    return source.map(variant => ({ ...variant, sizeLabel: sizeFor(variant).toUpperCase() }));
  }, [previewVariants, releaseVariants]);

  const purchaseReady = activeVariants.length > 0;
  const priceLabel = Number(product?.price) > 0
    ? money(product.price, product.currency || 'USD')
    : activeVariants[0] ? money(activeVariants[0].price.amount, activeVariants[0].price.currency) : 'EUR 180';
  const description = firstSentence(product?.description, signatureHomepagePresentation.description);
  const runwayVisualReady = (summary.visibleCount > 0 && product?.href === '/products/carlophillips-signature-hoodie')
    || isPreviewRunwayReference(summary);

  const categoryCards = useMemo(() => discoveryCategoryCards(summary), [summary]);
  const productCards = useMemo(() => discoveryProductCards(summary, 'hoodies', product?.handle || null), [product?.handle, summary]);

  useEffect(() => {
    if (!selectedHash && activeVariants[0]) setSelectedHash(activeVariants[0].referenceHash);
  }, [activeVariants, selectedHash]);

  useEffect(() => {
    if (wasMenuOpenRef.current && !menuOpen) menuButtonRef.current?.focus();
    wasMenuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    if (wasMediaOpenRef.current && !mediaOpen) galleryButtonRef.current?.focus();
    wasMediaOpenRef.current = mediaOpen;
  }, [mediaOpen]);

  const openGallery = useCallback(index => {
    setMediaIndex(typeof index === 'number' ? index : 0);
    setMediaOpen(true);
  }, []);

  const handleEnter = useCallback(() => {
    setEntered(true);
    const target = document.getElementById('signature-runway');
    if (!target) return;
    const reducedMotion = window.matchMedia(designSystemRuntimeContract.media.reducedMotion).matches;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: reducedMotion
          ? designSystemRuntimeContract.behavior.instantScroll
          : designSystemRuntimeContract.behavior.smoothScroll,
        block: designSystemRuntimeContract.behavior.scrollBlockStart,
      });
    });
  }, []);

  const addToBag = useCallback(variant => {
    if (!variant) return;
    const line = {
      handle: product?.handle || 'carlophillips-signature-hoodie',
      referenceHash: variant.referenceHash,
      title: signatureHomepagePresentation.displayName,
      size: variant.sizeLabel || sizeFor(variant).toUpperCase(),
      color: 'Black',
      currency: variant.price.currency,
      unitPrice: Number(variant.price.amount),
      quantity: 1,
      imageUrl: bagLineImage.src,
      imageAlt: bagLineImage.alt,
    };
    bagStore.add(line);
    setAddedLine(line);
    setOrderOpen(false);
  }, [bagStore, product?.handle]);

  const overlayOpen = menuOpen || mediaOpen || categoriesOpen || productsOpen || cartOpen || sizeGuideOpen;

  return (
    <main id="main-content" className="cp-site">
      <div inert={overlayOpen ? true : undefined}>
        <SiteHeader
          bagCount={bagCount(bagStore.bag)}
          menuButtonRef={menuButtonRef}
          menuOpen={menuOpen}
          onBag={() => setCartOpen(true)}
          onJoinList={null}
          onMenu={() => setMenuOpen(true)}
          showJoinList={!entered}
        />
        <LandingMorph entered={entered} hero={heroDecision} onEnter={handleEnter} />
        <DiscoverySection
          activeMediaIndex={mediaIndex}
          description={runwayVisualReady ? description : 'A considered study in form, material and everyday utility.'}
          displayName={runwayVisualReady ? signatureHomepagePresentation.displayName : 'Form. Function.'}
          eyebrow={runwayVisualReady ? 'Signature Series / 001' : 'CARLOPHILLIPS / 001'}
          facts={signatureHomepagePresentation.facts}
          galleryButtonRef={galleryButtonRef}
          galleryMedia={galleryMedia}
          handle={product?.handle || 'carlophillips-signature-hoodie'}
          onAddToBag={addToBag}
          onCloseOrder={() => setOrderOpen(false)}
          onOpenCategories={() => setCategoriesOpen(true)}
          onOpenGallery={openGallery}
          onOpenOrder={() => setOrderOpen(true)}
          onOpenProducts={() => setProductsOpen(true)}
          onOpenSizeGuide={() => setSizeGuideOpen(true)}
          onSelectVariant={setSelectedHash}
          orderOpen={orderOpen}
          posterOnly={posterOnly}
          priceLabel={priceLabel}
          productClips={productClips}
          purchaseReady={purchaseReady}
          selectedHash={selectedHash}
          suspended={overlayOpen}
          variants={activeVariants}
        />
        <Footer />
      </div>

      {menuOpen && <MenuOverlay activeId="discovery" onClose={() => setMenuOpen(false)} />}

      <ProductMediaOverlay
        activeIndex={mediaIndex}
        interactive={!cartOpen}
        media={galleryMedia}
        onActiveIndex={setMediaIndex}
        onClose={() => setMediaOpen(false)}
        onOrder={purchaseReady ? () => {
          setMediaOpen(false);
          setOrderOpen(true);
        } : null}
        open={mediaOpen}
        priceLabel={priceLabel}
        title={product?.title || 'Signature Hoodie'}
      />

      <CatalogGridOverlay
        cards={categoryCards}
        labelledById="discovery-categories-title"
        meta={`${categoryCards.length} groups`}
        onClose={() => setCategoriesOpen(false)}
        onOrder={purchaseReady ? () => {
          setCategoriesOpen(false);
          setOrderOpen(true);
        } : null}
        open={categoriesOpen}
        priceLabel={priceLabel}
        title="Categories"
      />

      <CatalogGridOverlay
        cards={productCards}
        labelledById="discovery-products-title"
        meta={`${productCards.length} ${productCards.length === 1 ? 'item' : 'items'}`}
        onClose={() => setProductsOpen(false)}
        onOrder={purchaseReady ? () => {
          setProductsOpen(false);
          setOrderOpen(true);
        } : null}
        open={productsOpen}
        priceLabel={priceLabel}
        title="Hoodies"
      />

      <SizeGuideDrawer open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      <AddedToBagWidget
        line={addedLine}
        onContinue={() => setAddedLine(null)}
        onViewBag={() => {
          setAddedLine(null);
          setCartOpen(true);
        }}
        open={Boolean(addedLine)}
      />

      <CartDrawer
        bag={bagStore.bag}
        onApplyDiscount={bagStore.applyDiscount}
        onClose={() => setCartOpen(false)}
        onContinue={() => setCartOpen(false)}
        onQuantity={bagStore.setQuantity}
        onRemove={bagStore.remove}
        open={cartOpen}
      />
    </main>
  );
}

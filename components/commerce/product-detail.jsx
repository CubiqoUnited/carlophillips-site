import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../../lib/media/signature-hoodie-showcase.js';
import ShopifyCheckoutForm from './shopify-checkout-form';
import { StorefrontHeader } from '../storefront/storefront-header';

function formatPrice(value, currency) {
  if (!Number.isFinite(value) || value <= 0) return 'Price unavailable';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function titleCase(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
}

function releaseStatusCopy(reason) {
  if (reason === 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED') return 'Released / purchasing unavailable';
  if (reason === 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE') return 'Private product review';
  return 'Product review';
}

function ProductMedia({ item, featured }) {
  const frameClass = featured ? 'cp-product-media-featured' : 'cp-product-media-portrait';

  if (item.type === 'video' && item.url) {
    return <video controls preload="metadata" poster={item.previewUrl} className={`${frameClass} h-full w-full object-contain`} src={item.url} />;
  }

  if (item.type === 'external_video' && item.url) {
    return (
      <div className={`${frameClass} flex items-center justify-center p-8 text-center`}>
        <a href={item.url} rel="noreferrer" target="_blank" className="cp-action cp-action-outline">
          Open approved external video
        </a>
      </div>
    );
  }

  if (item.type === 'model_3d') {
    return (
      <div className={`${frameClass} cp-text-soft flex items-center justify-center p-8 text-center text-sm`}>
        A verified interactive 3D renderer is not active. Static fallback only.
      </div>
    );
  }

  return item.url ? (
    <div className={`${frameClass} relative`}>
      <Image src={item.url} alt={item.alt} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-contain object-center p-8 sm:p-12" />
    </div>
  ) : (
    <div className={`${frameClass} cp-text-muted flex items-center justify-center p-8 text-sm`}>Media unavailable</div>
  );
}

function ProductGallery({ media, mediaReview = null, customerFacing = false }) {
  if (media.length === 0) {
    return (
      <div className="cp-product-gallery-empty cp-surface-raised cp-text-muted flex flex-col items-center justify-center gap-4 p-10 text-center text-sm">
        <p>No approved product media was returned by the selected source.</p>
        {mediaReview && (
          <p data-media-review={mediaReview.status} className="cp-label-small max-w-xl font-mono">
            Media review incomplete — missing: {mediaReview.missingModalities.join(', ') || 'approved fallback'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="cp-product-gallery-grid cp-grid-rule grid lg:grid-cols-2">
        {media.map((item, index) => (
          <figure key={item.id} className={index === 0 ? 'cp-card-media-featured lg:col-span-2' : 'cp-card-media'}>
            <ProductMedia item={item} featured={index === 0} />
            <figcaption className="cp-label-small cp-surface-canvas cp-rule border-t px-5 py-4">
              {customerFacing ? `View ${String(index + 1).padStart(2, '0')}` : item.label}
            </figcaption>
          </figure>
        ))}
      </div>
      {mediaReview?.status === 'incomplete' && (
        <p data-media-review="incomplete" className="cp-label-small cp-surface-canvas cp-rule border-t px-5 py-4 font-mono">
          Private media review incomplete — missing: {mediaReview.missingModalities.join(', ') || 'approved fallback'}
        </p>
      )}
    </div>
  );
}

function EditorialStudy({ environment, handle }) {
  if (environment !== 'preview' || handle !== 'carlophillips-signature-hoodie') return null;

  return (
    <section data-editorial-study="ai-assisted-preview" aria-labelledby="editorial-study-title">
      <div className="cp-editorial-intro cp-rule storefront-panel flex items-end border-b px-[var(--cp-page-gutter)] py-16 lg:py-24">
        <div className="cp-shell-wide px-0">
          <p className="cp-label mb-8">Digital editorial study / 01</p>
          <h2 id="editorial-study-title" className="cp-heading-section max-w-6xl">
            A study in weight, form and restraint.
          </h2>
          <p className="cp-body mt-10 max-w-2xl">
            Digital campaign studies created from the Signature Hoodie reference images. Confirm construction, fit and fabric against the approved product views above; the back view is a visualisation, not a photographed garment.
          </p>
        </div>
      </div>
      {SIGNATURE_HOODIE_SHOWCASE_MEDIA.map((study, index) => (
        <figure
          key={study.src}
          data-motion-study={study.gifHref ? 'still-derived' : undefined}
          className="cp-editorial-study-frame cp-concept-card cp-rule storefront-panel relative overflow-hidden border-b"
        >
          <Image
            src={study.src}
            alt={study.alt}
            fill
            sizes="100vw"
            unoptimized={study.unoptimized}
            className={`${study.fit || 'object-cover'} ${study.position}`}
          />
          <div className="cp-editorial-scrim absolute inset-0" />
          <figcaption className="cp-label cp-text-copy absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-[var(--cp-page-gutter)] py-7 lg:py-10">
            <span>Signature Hoodie / {study.label} {String(index + 1).padStart(2, '0')}</span>
            {study.gifHref ? (
              <a href={study.gifHref} className="cp-text-soft text-right underline underline-offset-4">GIF format</a>
            ) : (
              <span className="cp-text-muted text-right">{study.disclosure || 'AI-assisted preview'}</span>
            )}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

function VariantPresentation({ presentation }) {
  if (!presentation?.combinations?.length) return null;

  return (
    <div className="cp-variant-list mt-10 pt-7" data-variant-presentation="review-only">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="cp-label-small">Observed variant combinations</p>
        <p className="cp-label-small cp-text-faint">Selection disabled</p>
      </div>
      <div className="grid gap-2">
        {presentation.combinations.map(combination => (
          <button
            key={combination.referenceHash}
            type="button"
            disabled
            data-variant-available={combination.availableForSale}
            className="cp-variant-item grid min-h-16 items-center gap-5 px-4 py-3 text-left disabled:cursor-not-allowed"
          >
            <span>
              <span className="cp-text-copy block text-xs">{combination.title}</span>
              <span className="cp-label-small mt-1 block">
                {combination.selectedOptions.map(option => `${option.name}: ${option.value}`).join(' · ')}
              </span>
            </span>
            <span className="cp-label-small cp-text-muted text-right">
              {formatPrice(Number(combination.price.amount), combination.price.currency)}
              <span className="cp-text-subtle mt-1 block">
                {combination.availableForSale ? 'Available in source' : 'Unavailable in source'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommerceProductUnavailable({ decision }) {
  return (
    <main id="main-content" className="cp-commerce-page">
      <StorefrontHeader fixed navigationAriaLabel="Product navigation" />
      <section className="cp-section flex min-h-screen items-center pt-28">
        <div className="cp-shell-medium px-0">
          <p className="cp-label mb-8">CARLOPHILLIPS</p>
          <h1 className="cp-heading-section max-w-5xl">This piece is currently unavailable.</h1>
          <p className="cp-body-large mt-10 max-w-2xl">
            Return to the collection to see what is available now.
          </p>
          <Link href="/shop" data-unavailable-reason="unavailable" className="cp-action cp-action-outline mt-10">
            Return to collection
          </Link>
        </div>
      </section>
    </main>
  );
}

export function CommerceProductDetail({
  product,
  releaseReason = 'RELEASE_DECISION_UNAVAILABLE',
  cartActivation = null,
  environment = null,
}) {
  const liveProduct = Boolean(cartActivation?.cartAllowed && product.commerceAllowed);
  const liveSizes = product.variantPresentation?.combinations
    ?.map(item => item.selectedOptions.find(option => option.name.toLowerCase() === 'size')?.value)
    .filter(Boolean)
    .sort((left, right) => {
      const order = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];
      return order.indexOf(left.toUpperCase()) - order.indexOf(right.toUpperCase());
    }) || [];
  const facts = [
    ['Source', product.sourceLabel],
    ['Status', releaseStatusCopy(releaseReason)],
    ['Availability', product.availableForSale ? 'Available' : 'Unavailable'],
    ['Maker', product.vendor],
    ['Category', product.productType],
  ];

  return (
    <main id="main-content" className="cp-commerce-page">
      <StorefrontHeader fixed navigationAriaLabel="Product navigation" />
      <section className="cp-commerce-detail grid border-b">
        <div className="cp-commerce-detail border-b lg:border-b-0 lg:border-r">
          <ProductGallery media={product.media} mediaReview={product.mediaReview} customerFacing={liveProduct} />
        </div>
        <div className="flex items-start px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="w-full max-w-3xl lg:sticky lg:top-32">
            <p className="cp-label mb-7">{liveProduct ? 'Signature Series / 001' : product.sourceLabel}</p>
            <h1 className="cp-heading-product max-w-3xl">{product.title}</h1>
            <p className="cp-text-copy mt-7 text-2xl font-light">{formatPrice(product.price, product.currency)}</p>
            <p className="cp-body-large mt-8 max-w-xl">{product.description || 'Product details are currently unavailable.'}</p>

            {cartActivation?.cartAllowed ? (
              <ShopifyCheckoutForm handle={product.handle} presentation={product.variantPresentation} />
            ) : (
              <VariantPresentation presentation={product.variantPresentation} />
            )}

            {product.colors.length > 0 && (
              <div className="cp-variant-list mt-10 pt-7">
                <p className="cp-label-small mb-3">Colors observed</p>
                <p className="cp-text-copy text-sm">{product.colors.join(', ')}</p>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-9">
                <p className="cp-label-small mb-4">Sizes observed</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {product.sizes.map(size => <button key={size} type="button" disabled className="cp-choice-disabled h-12 text-xs">{size}</button>)}
                </div>
              </div>
            )}

            {!cartActivation?.cartAllowed && (
              <button
                type="button"
                disabled
                data-cart-activation={cartActivation?.status || 'unavailable'}
                className="cp-action cp-action-outline mt-8 h-14 w-full opacity-60"
              >
                Purchasing disabled
              </button>
            )}
            {!liveProduct && <p className="cp-text-subtle mt-4 text-xs leading-relaxed">{product.commerceExplanation}</p>}
          </div>
        </div>
      </section>

      <section className="cp-section cp-rule storefront-panel border-b">
        <div className="cp-commerce-information-grid cp-shell-wide grid gap-14 px-0">
          <div>
            <p className="cp-label mb-8">{liveProduct ? 'The piece' : 'Product information'}</p>
            <h2 className="cp-heading-section max-w-3xl">{liveProduct ? 'Made to be lived in.' : product.truthHeading}</h2>
          </div>
          <div className="space-y-12">
            <p className="cp-text-soft max-w-3xl text-xl font-light leading-relaxed">{liveProduct ? product.description : product.story}</p>
            <div className="cp-grid-rule grid sm:grid-cols-2">
              {(liveProduct ? [
                ['Colour', titleCase(product.variantPresentation?.combinations?.[0]?.selectedOptions?.find(option => option.name.toLowerCase() === 'color')?.value || 'Black')],
                ['Sizes', liveSizes.join(' / ') || 'See selector'],
                ['Availability', product.availableForSale ? 'Available' : 'Unavailable'],
                ['Checkout', 'Secure encrypted checkout'],
              ] : facts).map(([label, value]) => (
                <div key={label} className="cp-card-panel min-h-32 p-6">
                  <p className="cp-label-small mb-6">{label}</p>
                  <p className="cp-text-strong text-base font-light">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EditorialStudy environment={environment} handle={product.handle} />
    </main>
  );
}

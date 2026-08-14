import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../../lib/media/signature-hoodie-showcase.js';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
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
    return <video controls preload="metadata" poster={item.previewUrl} className={`${frameClass} cp-product-media-asset cp-media-fit-contain`} src={item.url} />;
  }

  if (item.type === 'external_video' && item.url) {
    return (
      <div className={`${frameClass} cp-product-media-message`}>
        <a href={item.url} rel="noreferrer" target="_blank" className="cp-action cp-action-outline">
          Open approved external video
        </a>
      </div>
    );
  }

  if (item.type === 'model_3d') {
    return (
      <div className={`${frameClass} cp-text-soft cp-product-media-message`}>
        A verified interactive 3D renderer is not active. Static fallback only.
      </div>
    );
  }

  return item.url ? (
    <div className={`${frameClass} cp-product-media-frame`}>
      <Image src={item.url} alt={item.alt} fill sizes={designSystemRuntimeContract.imageSizes.productDetail} className="cp-product-media-image" />
    </div>
  ) : (
    <div className={`${frameClass} cp-text-muted cp-product-media-message`}>Media unavailable</div>
  );
}

function ProductGallery({ media, mediaReview = null, customerFacing = false }) {
  if (media.length === 0) {
    return (
      <div className="cp-product-gallery-empty cp-surface-raised cp-text-muted">
        <p>No approved product media was returned by the selected source.</p>
        {mediaReview && (
          <p data-media-review={mediaReview.status} className="cp-label-small cp-product-media-review">
            Media review incomplete — missing: {mediaReview.missingModalities.join(', ') || 'approved fallback'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="cp-product-gallery-grid cp-grid-rule">
        {media.map((item, index) => (
          <figure key={item.id} className={index === 0 ? 'cp-card-media-featured cp-product-gallery-featured' : 'cp-card-media'}>
            <ProductMedia item={item} featured={index === 0} />
            <figcaption className="cp-label-small cp-surface-canvas cp-product-gallery-caption">
              {customerFacing ? `View ${String(index + 1).padStart(2, '0')}` : item.label}
            </figcaption>
          </figure>
        ))}
      </div>
      {mediaReview?.status === 'incomplete' && (
        <p data-media-review="incomplete" className="cp-label-small cp-surface-canvas cp-product-gallery-caption cp-product-media-review">
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
      <div className="cp-editorial-intro cp-storefront-panel">
        <div className="cp-shell-wide cp-shell-flush">
          <p className="cp-label cp-editorial-eyebrow">Digital editorial study / 01</p>
          <h2 id="editorial-study-title" className="cp-heading-section cp-editorial-title">
            A study in weight, form and restraint.
          </h2>
          <p className="cp-body cp-editorial-copy">
            Digital campaign studies created from the Signature Hoodie reference images. Confirm construction, fit and fabric against the approved product views above; the back view is a visualisation, not a photographed garment.
          </p>
        </div>
      </div>
      {SIGNATURE_HOODIE_SHOWCASE_MEDIA.map((study, index) => (
        <figure
          key={study.src}
          data-motion-study={study.gifHref ? 'still-derived' : undefined}
          className="cp-editorial-study-frame cp-concept-card cp-storefront-panel"
        >
          <Image
            src={study.src}
            alt={study.alt}
            fill
            sizes={designSystemRuntimeContract.imageSizes.fullViewport}
            unoptimized={study.unoptimized}
            className={`${study.fit || 'cp-media-fit-cover'} ${study.position}`}
          />
          <div className="cp-editorial-scrim" />
          <figcaption className="cp-label cp-text-copy cp-editorial-caption">
            <span>Signature Hoodie / {study.label} {String(index + 1).padStart(2, '0')}</span>
            {study.gifHref ? (
              <a href={study.gifHref} className="cp-text-soft cp-editorial-link">GIF format</a>
            ) : (
              <span className="cp-text-muted cp-text-align-end">{study.disclosure || 'AI-assisted preview'}</span>
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
    <div className="cp-variant-list cp-variant-section" data-variant-presentation="review-only">
      <div className="cp-variant-heading">
        <p className="cp-label-small">Observed variant combinations</p>
        <p className="cp-label-small cp-text-faint">Selection disabled</p>
      </div>
      <div className="cp-variant-options">
        {presentation.combinations.map(combination => (
          <button
            key={combination.referenceHash}
            type="button"
            disabled
            data-variant-available={combination.availableForSale}
            className="cp-variant-item"
          >
            <span>
              <span className="cp-text-copy cp-variant-title">{combination.title}</span>
              <span className="cp-label-small cp-variant-detail">
                {combination.selectedOptions.map(option => `${option.name}: ${option.value}`).join(' · ')}
              </span>
            </span>
            <span className="cp-label-small cp-text-muted cp-text-align-end">
              {formatPrice(Number(combination.price.amount), combination.price.currency)}
              <span className="cp-text-subtle cp-variant-detail">
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
    <main id="main-content" className="cp-commerce-page cp-product-detail-page">
      <StorefrontHeader fixed navigationAriaLabel="Product navigation" />
      <section className="cp-product-unavailable cp-section">
        <div className="cp-shell-medium cp-shell-flush">
          <p className="cp-label cp-editorial-eyebrow">CARLOPHILLIPS</p>
          <h1 className="cp-heading-section cp-product-unavailable-title">This piece is currently unavailable.</h1>
          <p className="cp-body-large cp-product-unavailable-copy">
            Return to the collection to see what is available now.
          </p>
          <Link href="/shop" data-unavailable-reason="unavailable" className="cp-action cp-action-outline cp-product-unavailable-action">
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
    <main id="main-content" className="cp-commerce-page cp-product-detail-page">
      <StorefrontHeader fixed navigationAriaLabel="Product navigation" />
      <section className="cp-commerce-detail">
        <div className="cp-commerce-media-column">
          <ProductGallery media={product.media} mediaReview={product.mediaReview} customerFacing={liveProduct} />
        </div>
        <div className="cp-product-detail-copy-column">
          <div className="cp-product-detail-copy">
            <p className="cp-label cp-product-detail-eyebrow">{liveProduct ? 'Signature Series / 001' : product.sourceLabel}</p>
            <h1 className="cp-heading-product cp-product-detail-title">{product.title}</h1>
            <p className="cp-text-copy cp-product-detail-price">{formatPrice(product.price, product.currency)}</p>
            <p className="cp-body-large cp-product-detail-description">{product.description || 'Product details are currently unavailable.'}</p>

            {cartActivation?.cartAllowed ? (
              <ShopifyCheckoutForm handle={product.handle} presentation={product.variantPresentation} />
            ) : (
              <VariantPresentation presentation={product.variantPresentation} />
            )}

            {product.colors.length > 0 && (
              <div className="cp-variant-list cp-variant-section">
                <p className="cp-label-small cp-color-label">Colors observed</p>
                <p className="cp-text-copy cp-control-copy">{product.colors.join(', ')}</p>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="cp-size-section">
                <p className="cp-label-small cp-size-label">Sizes observed</p>
                <div className="cp-size-grid">
                  {product.sizes.map(size => <button key={size} type="button" disabled className="cp-choice-disabled">{size}</button>)}
                </div>
              </div>
            )}

            {!cartActivation?.cartAllowed && (
              <button
                type="button"
                disabled
                data-cart-activation={cartActivation?.status || 'unavailable'}
                className="cp-action cp-action-outline cp-purchasing-disabled"
              >
                Purchasing disabled
              </button>
            )}
            {!liveProduct && <p className="cp-text-subtle cp-commerce-explanation">{product.commerceExplanation}</p>}
          </div>
        </div>
      </section>

      <section className="cp-information-section cp-section cp-storefront-panel">
        <div className="cp-commerce-information-grid cp-shell-wide cp-shell-flush">
          <div>
            <p className="cp-label cp-editorial-eyebrow">{liveProduct ? 'The piece' : 'Product information'}</p>
            <h2 className="cp-heading-section cp-information-title">{liveProduct ? 'Made to be lived in.' : product.truthHeading}</h2>
          </div>
          <div className="cp-information-copy-column">
            <p className="cp-text-soft cp-information-copy">{liveProduct ? product.description : product.story}</p>
            <div className="cp-grid-rule cp-information-facts">
              {(liveProduct ? [
                ['Colour', titleCase(product.variantPresentation?.combinations?.[0]?.selectedOptions?.find(option => option.name.toLowerCase() === 'color')?.value || 'Black')],
                ['Sizes', liveSizes.join(' / ') || 'See selector'],
                ['Availability', product.availableForSale ? 'Available' : 'Unavailable'],
                ['Checkout', 'Secure encrypted checkout'],
              ] : facts).map(([label, value]) => (
                <div key={label} className="cp-card-panel cp-information-fact">
                  <p className="cp-label-small cp-information-fact-label">{label}</p>
                  <p className="cp-text-strong cp-information-fact-value">{value}</p>
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

import React from 'react';
import Link from 'next/link';
import ShopifyCheckoutForm from '../ProductForm';
import { ProductGallery } from '../ProductGallery';
import { ProductSequence } from '../Sequence';
import { StorefrontHeader } from '../../layout/StorefrontHeader';
import type {
  ProductDetailProps,
  ReleaseDecision,
  VariantPresentation as VariantPresentationData,
} from '@/types';

function formatPrice(value: number, currency: string): string {
  if (!Number.isFinite(value) || value <= 0) return 'Price unavailable';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function titleCase(value = ''): string {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : '';
}

function attributeEntries(product: ProductDetailProps['product']) {
  const entries = (product.details || []).flatMap((detail) => {
    if (Array.isArray(detail)) {
      const [label, value] = detail;
      return label && value ? [[String(label), String(value)]] : [];
    }
    return [];
  });

  if (entries.length > 0) return entries.slice(0, 3);

  return (product.colors || []).slice(0, 3).map((color) => ['Color', color]);
}

function VariantPresentation({
  presentation,
}: {
  presentation: VariantPresentationData | null;
}) {
  if (!presentation?.combinations?.length) return null;

  return (
    <div
      className="cp-variant-list mt-10 pt-7"
      data-variant-presentation="review-only"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="cp-label-small">Observed variant combinations</p>
        <p className="cp-label-small cp-text-faint">Selection disabled</p>
      </div>
      <div className="grid gap-2">
        {presentation.combinations.map((combination) => (
          <button
            key={combination.referenceHash}
            type="button"
            disabled
            data-variant-available={combination.availableForSale}
            className="cp-variant-item grid min-h-16 items-center gap-5 px-4 py-3 text-left disabled:cursor-not-allowed"
          >
            <span>
              <span className="cp-text-copy block text-xs">
                {combination.title}
              </span>
              <span className="cp-label-small mt-1 block">
                {combination.selectedOptions
                  .map((option) => `${option.name}: ${option.value}`)
                  .join(' · ')}
              </span>
            </span>
            <span className="cp-label-small cp-text-muted text-right">
              {formatPrice(
                Number(combination.price.amount),
                combination.price.currency
              )}
              <span className="cp-text-subtle mt-1 block">
                {combination.availableForSale
                  ? 'Available in source'
                  : 'Unavailable in source'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommerceProductUnavailable({
  decision: _decision,
}: {
  decision: ReleaseDecision;
}) {
  return (
    <main id="main-content" className="cp-commerce-page">
      <StorefrontHeader fixed navigationAriaLabel="Product navigation" />
      <section className="cp-section flex min-h-screen items-center pt-28">
        <div className="cp-shell-medium px-0">
          <p className="cp-label mb-8">CARLOPHILLIPS</p>
          <h1 className="cp-heading-section max-w-5xl">
            This piece is currently unavailable.
          </h1>
          <p className="cp-body-large mt-10 max-w-2xl">
            Return to the collection to see what is available now.
          </p>
          <Link
            href="/shop"
            data-unavailable-reason="unavailable"
            className="cp-action cp-action-outline mt-10"
          >
            Return to collection
          </Link>
        </div>
      </section>
    </main>
  );
}

export function CommerceProductDetail({
  product,
  releaseReason: _releaseReason = 'SHOPIFY_PRODUCT_UNAVAILABLE',
  cartActivation = null,
  environment = 'local',
  podpipeSequence = [],
}: ProductDetailProps) {
  const liveProduct = Boolean(
    cartActivation?.cartAllowed && cartActivation?.checkoutAllowed
  );
  const liveSizes =
    product.variantPresentation?.combinations
      ?.map(
        (item) =>
          item.selectedOptions.find(
            (option) => option.name.toLowerCase() === 'size'
          )?.value
      )
      .filter((size): size is string => Boolean(size))
      .sort((left, right) => {
        const order = [
          'XXS',
          'XS',
          'S',
          'M',
          'L',
          'XL',
          'XXL',
          'XXXL',
          '4XL',
          '5XL',
        ];
        return (
          order.indexOf(left.toUpperCase()) - order.indexOf(right.toUpperCase())
        );
      }) || [];
  const facts = [
    ['Source', product.source === 'shopify' ? 'Shopify' : product.sourceLabel],
    ['Status', product.availableForSale ? 'Available' : 'Unavailable'],
    ['Availability', product.availableForSale ? 'Available' : 'Unavailable'],
    ['Maker', product.vendor],
    ['Category', product.productType],
  ];
  const attributes = attributeEntries(product);
  const sizeGuide = attributes.find(
    ([label]) => label.toLowerCase() === 'size guide'
  )?.[1];

  return (
    <main id="main-content" className="cp-commerce-page">
      <StorefrontHeader fixed navigationAriaLabel="Product navigation" />
      <section className="cp-commerce-detail grid border-b">
        <div className="cp-commerce-gallery-column border-b lg:border-b-0 lg:border-r">
          <ProductGallery
            media={product.media}
            mediaReview={product.mediaReview}
            customerFacing={liveProduct}
            productTitle={product.title}
            productHref={`/product/${product.handle}`}
            productOnly
            purchaseLabel={`ADD TO BAG - ${formatPrice(product.price, product.currency)}`}
          />
        </div>
        <div className="cp-commerce-buy-column flex items-start px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="cp-commerce-buy-panel w-full max-w-3xl lg:sticky lg:top-32">
            <p className="cp-label mb-7">
              {product.tagline || product.productType || 'Product'}
            </p>
            <h1 className="cp-heading-product max-w-3xl">{product.title}</h1>
            <p className="cp-product-description cp-body-large mt-8 max-w-xl">
              {product.description ||
                'Product details are currently unavailable.'}
            </p>

            <p className="cp-product-price cp-text-copy mt-7 text-2xl font-light">
              {formatPrice(product.price, product.currency)}
            </p>

            {liveProduct && product.variantPresentation ? (
              <ShopifyCheckoutForm
                handle={product.handle}
                presentation={product.variantPresentation}
                environment={environment}
                sizeGuide={sizeGuide}
              />
            ) : (
              <VariantPresentation presentation={product.variantPresentation} />
            )}

            {!liveProduct && (
              <button
                type="button"
                disabled
                data-cart-activation={cartActivation?.status || 'unavailable'}
                className="cp-action cp-action-outline mt-8 h-14 w-full opacity-60"
              >
                Purchasing disabled
              </button>
            )}
            {!liveProduct && (
              <p className="cp-text-subtle mt-4 text-xs leading-relaxed">
                {product.commerceExplanation}
              </p>
            )}
          </div>
        </div>
      </section>

      <ProductSequence sequence={podpipeSequence} />

      <section className="cp-section cp-rule storefront-panel border-b">
        <div className="cp-commerce-information-grid cp-shell-wide grid gap-14 px-0">
          <div>
            <p className="cp-label mb-8">
              {liveProduct ? 'The piece' : 'Product information'}
            </p>
            <h2 className="cp-heading-section max-w-3xl">
              {liveProduct ? 'Made to be lived in.' : product.truthHeading}
            </h2>
          </div>
          <div className="space-y-12">
            <p className="cp-text-soft max-w-3xl text-xl font-light leading-relaxed">
              {liveProduct ? product.description : product.story}
            </p>
            <div className="cp-grid-rule grid sm:grid-cols-2">
              {(liveProduct
                ? [
                    [
                      'Colour',
                      titleCase(
                        product.variantPresentation?.combinations?.[0]?.selectedOptions?.find(
                          (option) => option.name.toLowerCase() === 'color'
                        )?.value || 'Black'
                      ),
                    ],
                    ['Sizes', liveSizes.join(' / ') || 'See selector'],
                    [
                      'Availability',
                      product.availableForSale ? 'Available' : 'Unavailable',
                    ],
                    ['Checkout', 'Secure encrypted checkout'],
                  ]
                : facts
              ).map(([label, value]) => (
                <div key={label} className="cp-card-panel min-h-32 p-6">
                  <p className="cp-label-small mb-6">{label}</p>
                  <p className="cp-text-strong text-base font-light">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

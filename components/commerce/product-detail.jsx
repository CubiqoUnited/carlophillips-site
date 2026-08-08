import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ShopifyCheckoutForm from './shopify-checkout-form';

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

function ProductMedia({ item, featured }) {
  const frameClass = featured ? 'aspect-[5/4] lg:aspect-[16/10]' : 'aspect-[4/5]';

  if (item.type === 'video' && item.url) {
    return <video controls preload="metadata" poster={item.previewUrl} className={`${frameClass} h-full w-full object-contain`} src={item.url} />;
  }

  if (item.type === 'external_video' && item.url) {
    return (
      <div className={`${frameClass} flex items-center justify-center p-8 text-center`}>
        <a href={item.url} rel="noreferrer" target="_blank" className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.2em]">
          Open approved external video
        </a>
      </div>
    );
  }

  if (item.type === 'model_3d') {
    return (
      <div className={`${frameClass} flex items-center justify-center p-8 text-center text-sm text-white/55`}>
        A verified interactive 3D renderer is not active. Static fallback only.
      </div>
    );
  }

  return item.url ? (
    <div className={`${frameClass} relative`}>
      <Image src={item.url} alt={item.alt} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-contain object-center p-8 sm:p-12" />
    </div>
  ) : (
    <div className={`${frameClass} flex items-center justify-center p-8 text-sm text-white/45`}>Media unavailable</div>
  );
}

function ProductGallery({ media, mediaReview = null, customerFacing = false }) {
  if (media.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#171714] p-10 text-center text-sm text-white/45">
        <p>No approved product media was returned by the selected source.</p>
        {mediaReview && (
          <p data-media-review={mediaReview.status} className="max-w-xl font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
            Media review incomplete — missing: {mediaReview.missingModalities.join(', ') || 'approved fallback'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-px bg-white/10 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        {media.map((item, index) => (
          <figure key={item.id} className={index === 0 ? 'bg-[#24231f] lg:col-span-2' : 'bg-[#171714]'}>
            <ProductMedia item={item} featured={index === 0} />
            <figcaption className="border-t border-white/10 bg-black px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-white/42">
              {customerFacing ? `View ${String(index + 1).padStart(2, '0')}` : item.label}
            </figcaption>
          </figure>
        ))}
      </div>
      {mediaReview?.status === 'incomplete' && (
        <p data-media-review="incomplete" className="border-t border-white/10 bg-black px-5 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white/38">
          Private media review incomplete — missing: {mediaReview.missingModalities.join(', ') || 'approved fallback'}
        </p>
      )}
    </div>
  );
}

const SIGNATURE_HOODIE_EDITORIAL_STUDY = [
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png',
    alt: 'AI-assisted on-model visualisation of the CARLOPHILLIPS Signature Hoodie in a dark studio',
    label: 'On-body study',
    position: 'object-center',
  },
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/material-embroidery-study.png',
    alt: 'AI-assisted macro visualisation of the CARLOPHILLIPS CP embroidery and black knit surface',
    label: 'Material / embroidery study',
    position: 'object-center',
  },
  {
    src: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
    alt: 'AI-assisted editorial visualisation of the CARLOPHILLIPS Signature Hoodie presented on a chair',
    label: 'Editorial still',
    position: 'object-center',
  },
  {
    src: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
    alt: 'AI-assisted flat-lay visualisation of the CARLOPHILLIPS Signature Hoodie',
    label: 'Product-alone study',
    position: 'object-center',
  },
];

function EditorialStudy({ environment, handle }) {
  if (environment !== 'preview' || handle !== 'carlophillips-signature-hoodie') return null;

  return (
    <section data-editorial-study="ai-assisted-preview" aria-labelledby="editorial-study-title">
      <div className="storefront-panel flex min-h-[72vh] items-end border-b border-white/10 px-5 py-16 sm:px-8 lg:min-h-screen lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-[1700px]">
          <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/38">Digital editorial study / 01</p>
          <h2 id="editorial-study-title" className="max-w-6xl text-5xl font-light leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-8xl xl:text-9xl">
            A study in weight, form and restraint.
          </h2>
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-white/48 sm:text-base">
            AI-assisted on-body, material and product visualisations created from the Signature Hoodie reference images. Confirm garment construction, fit and fabric against the Shopify product views above.
          </p>
        </div>
      </div>
      {SIGNATURE_HOODIE_EDITORIAL_STUDY.map((study, index) => (
        <figure key={study.src} className="storefront-panel relative min-h-[78vh] overflow-hidden border-b border-white/10 bg-[#111] lg:min-h-screen">
          <Image
            src={study.src}
            alt={study.alt}
            fill
            sizes="100vw"
            className={`object-cover ${study.position}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-5 py-7 text-[10px] uppercase tracking-[0.22em] text-white/70 sm:px-8 lg:px-12 lg:py-10">
            <span>Signature Hoodie / {study.label} {String(index + 1).padStart(2, '0')}</span>
            <span className="text-right text-white/45">AI-assisted preview</span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <Link href="/" className="text-xs tracking-[0.34em] text-white">CARLOPHILLIPS</Link>
        <nav className="flex gap-6 text-[10px] uppercase tracking-[0.22em] text-white/50" aria-label="Product navigation">
          <Link href="/shop" className="transition hover:text-white">Collection</Link>
          <Link href="/bag" className="transition hover:text-white">Bag</Link>
        </nav>
      </div>
    </header>
  );
}

function VariantPresentation({ presentation }) {
  if (!presentation?.combinations?.length) return null;

  return (
    <div className="mt-10 border-t border-white/10 pt-7" data-variant-presentation="review-only">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Observed variant combinations</p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/28">Selection disabled</p>
      </div>
      <div className="grid gap-2">
        {presentation.combinations.map(combination => (
          <button
            key={combination.referenceHash}
            type="button"
            disabled
            data-variant-available={combination.availableForSale}
            className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-5 border border-white/12 px-4 py-3 text-left text-white/52 disabled:cursor-not-allowed"
          >
            <span>
              <span className="block text-xs text-white/72">{combination.title}</span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-white/34">
                {combination.selectedOptions.map(option => `${option.name}: ${option.value}`).join(' · ')}
              </span>
            </span>
            <span className="text-right text-[10px] uppercase tracking-[0.14em]">
              {formatPrice(Number(combination.price.amount), combination.price.currency)}
              <span className="mt-1 block text-white/30">
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
    <main id="main-content" className="min-h-screen bg-black text-white">
      <Header />
      <section className="flex min-h-screen items-center px-5 pt-28 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[1500px]">
          <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">CARLOPHILLIPS</p>
          <h1 className="max-w-5xl text-6xl font-light leading-[0.9] tracking-[-0.065em] sm:text-8xl">This piece is currently unavailable.</h1>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-white/56">
            Return to the collection to see what is available now.
          </p>
          <Link href="/shop" data-unavailable-reason={decision.reason} className="mt-10 inline-flex border border-white/20 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white/70">
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
    ['Data source', product.sourceLabel],
    ['Release decision', releaseReason],
    ['Availability observed', product.availableForSale ? 'Available in source' : 'Unavailable or not observed'],
    ['Vendor observed', product.vendor],
    ['Product type', product.productType],
  ];

  return (
    <main id="main-content" className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Header />
      <section className="grid min-h-screen border-b border-white/10 pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:pt-20">
        <div className="border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
          <ProductGallery media={product.media} mediaReview={product.mediaReview} customerFacing={liveProduct} />
        </div>
        <div className="flex items-start px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="w-full max-w-3xl lg:sticky lg:top-32">
            <p className="mb-7 text-[10px] uppercase tracking-[0.28em] text-white/45">{liveProduct ? 'Signature Series / 001' : product.sourceLabel}</p>
            <h1 className="max-w-3xl text-4xl font-light leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl xl:text-7xl">{product.title}</h1>
            <p className="mt-7 text-2xl font-light text-white/72">{formatPrice(product.price, product.currency)}</p>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-white/58 sm:text-lg">{product.description || 'Product details are currently unavailable.'}</p>

            {cartActivation?.cartAllowed ? (
              <ShopifyCheckoutForm handle={product.handle} presentation={product.variantPresentation} />
            ) : (
              <VariantPresentation presentation={product.variantPresentation} />
            )}

            {product.colors.length > 0 && (
              <div className="mt-10 border-t border-white/10 pt-7">
                <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-white/35">Colors observed</p>
                <p className="text-sm text-white/72">{product.colors.join(', ')}</p>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-9">
                <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-white/35">Sizes observed</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {product.sizes.map(size => <button key={size} type="button" disabled className="h-12 border border-white/12 text-xs text-white/42">{size}</button>)}
                </div>
              </div>
            )}

            {!cartActivation?.cartAllowed && (
              <button
                type="button"
                disabled
                data-cart-activation={cartActivation?.status || 'unavailable'}
                className="mt-8 flex h-14 w-full items-center justify-center border border-white/18 text-[10px] uppercase tracking-[0.24em] text-white/44"
              >
                Purchasing disabled
              </button>
            )}
            {!liveProduct && <p className="mt-4 text-xs leading-relaxed text-white/35">{product.commerceExplanation}</p>}
          </div>
        </div>
      </section>

      <section className="storefront-panel border-b border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1700px] gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/38">{liveProduct ? 'The piece' : 'Product information'}</p>
            <h2 className="max-w-3xl text-5xl font-light leading-[0.95] tracking-[-0.055em] sm:text-7xl">{liveProduct ? 'Made to be lived in.' : product.truthHeading}</h2>
          </div>
          <div className="space-y-12">
            <p className="max-w-3xl text-xl font-light leading-relaxed text-white/58">{liveProduct ? product.description : product.story}</p>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {(liveProduct ? [
                ['Colour', titleCase(product.variantPresentation?.combinations?.[0]?.selectedOptions?.find(option => option.name.toLowerCase() === 'color')?.value || 'Black')],
                ['Sizes', liveSizes.join(' / ') || 'See selector'],
                ['Availability', product.availableForSale ? 'Available' : 'Unavailable'],
                ['Checkout', 'Securely through Shopify'],
              ] : facts).map(([label, value]) => (
                <div key={label} className="min-h-32 bg-[#050505] p-6">
                  <p className="mb-6 text-[10px] uppercase tracking-[0.24em] text-white/35">{label}</p>
                  <p className="text-base font-light text-white/78">{value}</p>
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

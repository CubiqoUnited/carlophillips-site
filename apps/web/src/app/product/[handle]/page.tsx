import { notFound } from 'next/navigation';
import {
  CommerceProductDetail,
  CommerceProductUnavailable,
} from '@/components/product/ProductInfo';
import {
  closedReleaseDecision,
  resolveCommerceDataMode,
} from '@/lib/commerce/product-gateway';
import { getProductPageDecision } from '@/lib/commerce/product-page-server';
import { toProductViewModel } from '@/lib/commerce/product-view-model';
import {
  canRenderDraftProductPreviews,
  canRenderProducts,
  getCommerceEnvironment,
} from '@/lib/config/product-visibility';
import { loadShopifyProduct } from '@/lib/providers/shopify/storefront-product-adapter';
import type {
  CommerceEnvironment,
  FixtureProduct,
  ProductPageResult,
  ProductViewModel,
  ReleaseDecision,
} from '@/types';

type CommerceDataMode = 'fixture' | 'shopify';

interface ProductPageDecisionInput {
  environment: CommerceEnvironment;
  mode: CommerceDataMode;
  handle: string;
  fixtureProduct: FixtureProduct | null;
  loadShopifyProduct: (handle: string) => Promise<unknown>;
}

const readCommerceEnvironment =
  getCommerceEnvironment as () => CommerceEnvironment;
const closeRelease = closedReleaseDecision as (
  environment: CommerceEnvironment
) => ReleaseDecision;
const selectCommerceMode = resolveCommerceDataMode as (input: {
  configuredMode: string | undefined;
  environment: CommerceEnvironment;
}) => CommerceDataMode;
const loadProductPageDecision = getProductPageDecision as (
  input: ProductPageDecisionInput
) => Promise<ProductPageResult>;
const normalizeProduct = toProductViewModel as (
  decision: ReleaseDecision
) => ProductViewModel | null;
const loadObservedShopifyProduct = loadShopifyProduct as (
  handle: string
) => Promise<unknown>;

export const dynamic = 'force-dynamic';

/**
 * KAN-22: reasons that mean "no such product", as distinct from "the product
 * exists but we cannot serve it right now". Only the former may 404 — a 404 on
 * an infrastructure fault would tell a crawler the catalogue shrank.
 */
const HANDLE_NOT_FOUND_REASONS = new Set([
  'SHOPIFY_PRODUCT_UNAVAILABLE',
  'LOCAL_FIXTURE_NOT_FOUND',
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const name = handle
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // KAN-22: never title a page with internal vocabulary, and never let an
  // arbitrary handle mint an indexable-looking title. Unknown handles 404
  // below; this metadata is only ever seen for a handle that resolves.
  return {
    title: `${name} | CARLOPHILLIPS`,
    description: `${name} from CARLOPHILLIPS.`,
    alternates: { canonical: `/product/${handle}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const environment = readCommerceEnvironment();

  if (!canRenderProducts()) {
    return <CommerceProductUnavailable decision={closeRelease(environment)} />;
  }

  const mode = selectCommerceMode({
    configuredMode: process.env.COMMERCE_DATA_MODE,
    environment,
  });
  let fixtureProduct: FixtureProduct | null = null;
  if (mode === 'fixture' && canRenderDraftProductPreviews()) {
    const fixtureModule = await import('@/fixtures/signature-hoodie-preview');
    fixtureProduct = fixtureModule.signatureHoodiePreview;
  }
  const { decision, cartActivation } = await loadProductPageDecision({
    environment,
    mode,
    handle,
    fixtureProduct,
    loadShopifyProduct: loadObservedShopifyProduct,
  });

  const product = normalizeProduct(decision);

  // KAN-22: an unknown handle is an honest 404, not a 200 saying "unavailable".
  if (HANDLE_NOT_FOUND_REASONS.has(decision.reason)) {
    notFound();
  }

  if (!product || !decision.visibilityAllowed) {
    return <CommerceProductUnavailable decision={decision} />;
  }

  // KAN-25: a price that does not resolve must not render a purchasable PDP.
  // Quoting $0 against a Shopify-authoritative price is a misrepresentation,
  // not a display glitch.
  if (product.price === null) {
    return (
      <CommerceProductUnavailable
        decision={{ ...decision, reason: 'PRODUCT_PRICE_UNRESOLVED' }}
      />
    );
  }

  return (
    <CommerceProductDetail
      product={product}
      releaseReason={decision.reason}
      cartActivation={cartActivation}
      environment={environment}
      podpipeSequence={[]}
    />
  );
}

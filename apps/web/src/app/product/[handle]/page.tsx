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

export const metadata = {
  title: 'Product Review | CARLOPHILLIPS',
  description: 'A private CARLOPHILLIPS product review surface.',
  robots: { index: false, follow: false },
};

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
  if (!product || !decision.visibilityAllowed) {
    return <CommerceProductUnavailable decision={decision} />;
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

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
import { getProductReleaseEvidence } from '@/lib/releases/product-release-registry';
import { getApprovedCampaignAsset } from '@/lib/media/campaign-registry';
import { projectPodpipeSequence } from '@/lib/media/sequences/podpipe';
import type {
  CartActivationSummary,
  CommerceEnvironment,
  FixtureProduct,
  ProductPageResult,
  ProductReleaseEvidence,
  ProductViewModel,
  ReleaseDecision,
} from '@/types';

type CommerceDataMode = 'fixture' | 'shopify';

interface ProductPageDecisionInput {
  environment: CommerceEnvironment;
  mode: CommerceDataMode;
  handle: string;
  fixtureProduct: FixtureProduct | null;
  releaseRecord?: ProductReleaseEvidence['releaseRecord'];
  mediaManifest?: ProductReleaseEvidence['mediaManifest'];
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
const loadReleaseEvidence = getProductReleaseEvidence as (
  handle: string
) => ProductReleaseEvidence | null;
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
  const releaseEvidence = loadReleaseEvidence(handle);
  const { decision, cartActivation } = await loadProductPageDecision({
    environment,
    mode,
    handle,
    fixtureProduct,
    ...releaseEvidence,
    loadShopifyProduct: loadObservedShopifyProduct,
  });

  const product = normalizeProduct(decision);
  if (!product || !decision.visibilityAllowed) {
    return <CommerceProductUnavailable decision={decision} />;
  }

  const reviewedCommerce =
    decision.source === 'shopify'
      ? {
          title: product.title,
          price: product.price,
          currency: product.currency,
          availableForSale: product.availableForSale,
          sizes:
            product.variantPresentation?.combinations
              ?.map(
                (combination) =>
                  combination.selectedOptions.find(
                    (option) => option.name.toLowerCase() === 'size'
                  )?.value
              )
              .filter((size): size is string => Boolean(size)) || [],
          sizeGuide: null,
          bagAllowed: Boolean(cartActivation?.cartAllowed),
          checkoutAllowed: false,
        }
      : null;
  const model3dRequirement = releaseEvidence?.mediaManifest?.requirements?.find(
    (requirement) => requirement.modality === 'model-3d-ar'
  );
  const podpipeSequence = projectPodpipeSequence({
    campaign: getApprovedCampaignAsset('at-edge-of-life-lofoten-runway-hero'),
    media: product.media,
    commerce: reviewedCommerce,
    fulfillment: null,
    model3dApplicable: model3dRequirement?.status !== 'infeasible-approved',
  });

  return (
    <CommerceProductDetail
      product={product}
      releaseReason={decision.reason}
      cartActivation={cartActivation}
      environment={environment}
      podpipeSequence={podpipeSequence}
    />
  );
}

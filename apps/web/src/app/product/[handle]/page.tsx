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
import {
  projectPodpipeSequence,
  type ReleaseBoundMediaItem,
} from '@repo/product-pipeline';
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
    loadShopifyProduct: loadObservedShopifyProduct,
  });

  const product = normalizeProduct(decision);
  if (!product || !decision.visibilityAllowed) {
    return <CommerceProductUnavailable decision={decision} />;
  }

  const releaseShopify = releaseEvidence?.releaseRecord.shopify;
  const releaseBinding =
    decision.source === 'shopify' &&
    releaseEvidence &&
    releaseShopify?.variantFingerprintStatus === 'observed' &&
    releaseShopify.commerceFactsFingerprintStatus === 'reviewed' &&
    releaseShopify.observationFingerprintStatus === 'reviewed' &&
    typeof releaseShopify.variantFingerprint === 'string' &&
    typeof releaseShopify.commerceFactsFingerprint === 'string' &&
    typeof releaseShopify.observationFingerprint === 'string' &&
    product.variantFingerprint === releaseShopify.variantFingerprint &&
    product.commerceFactsFingerprint ===
      releaseShopify.commerceFactsFingerprint &&
    product.observationFingerprint === releaseShopify.observationFingerprint
      ? {
          releaseId: releaseEvidence.releaseRecord.releaseId,
          handle,
          variantFingerprint: releaseShopify.variantFingerprint,
          commerceFactsFingerprint: releaseShopify.commerceFactsFingerprint,
          observationFingerprint: releaseShopify.observationFingerprint,
        }
      : null;
  const reviewedCommerce = releaseBinding
    ? {
        approvalStatus: 'reviewed' as const,
        sourceAuthority: 'reviewed-shopify-observation' as const,
        binding: releaseBinding,
        data: {
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
          checkoutAllowed: Boolean(cartActivation?.checkoutAllowed),
        },
      }
    : null;
  const model3dRequirement = releaseEvidence?.mediaManifest?.requirements?.find(
    (requirement) => requirement.modality === 'model-3d-ar'
  );
  const podpipeSequence = projectPodpipeSequence({
    campaign: getApprovedCampaignAsset('at-edge-of-life-lofoten-runway-hero'),
    media: product.media
      .filter(
        (item) =>
          item.approvalStatus === 'approved' &&
          item.sourceAuthority === 'product-release-media-registry'
      )
      .map((item) => item as unknown as ReleaseBoundMediaItem),
    releaseBinding,
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

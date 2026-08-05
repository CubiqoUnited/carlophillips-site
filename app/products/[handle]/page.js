import { CommerceProductDetail, CommerceProductUnavailable } from '@/components/commerce/product-detail';
import { closedReleaseDecision, resolveCommerceDataMode } from '@/lib/commerce/product-gateway';
import { getProductPageDecision } from '@/lib/commerce/product-page-server';
import { toProductViewModel } from '@/lib/commerce/product-view-model';
import { canRenderDraftProductPreviews, canRenderProducts, getCommerceEnvironment } from '@/lib/config/product-visibility';
import { loadShopifyProduct } from '@/lib/providers/shopify/storefront-product-adapter';
import { getProductReleaseEvidence } from '@/lib/releases/product-release-registry';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Signature Hoodie | CARLOPHILLIPS',
  description: 'Shop the CARLOPHILLIPS Signature Hoodie through secure Shopify checkout.',
};

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const environment = getCommerceEnvironment();

  if (!canRenderProducts()) {
    return <CommerceProductUnavailable decision={closedReleaseDecision(environment)} />;
  }

  const mode = resolveCommerceDataMode({
    configuredMode: process.env.COMMERCE_DATA_MODE,
    environment,
  });
  let fixtureProduct = null;
  if (mode === 'fixture' && canRenderDraftProductPreviews()) {
    const fixtureModule = await import('@/fixtures/signature-hoodie-preview');
    fixtureProduct = fixtureModule.signatureHoodiePreview;
  }
  const releaseEvidence = getProductReleaseEvidence(handle);
  const { decision, cartActivation } = await getProductPageDecision({
    environment,
    mode,
    handle,
    fixtureProduct,
    ...releaseEvidence,
    loadShopifyProduct,
  });

  const product = toProductViewModel(decision);
  if (!product || !decision.visibilityAllowed) {
    return <CommerceProductUnavailable decision={decision} />;
  }

  return (
    <CommerceProductDetail
      product={product}
      releaseReason={decision.reason}
      cartActivation={cartActivation}
    />
  );
}

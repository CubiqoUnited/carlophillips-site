import { CommerceProductDetail, CommerceProductUnavailable } from '@/components/commerce/product-detail';
import { closedReleaseDecision, getProductDecision, resolveCommerceDataMode } from '@/lib/commerce/product-gateway';
import { toProductViewModel } from '@/lib/commerce/product-view-model';
import { canRenderDraftProductPreviews, canRenderProducts, getCommerceEnvironment } from '@/lib/config/product-visibility';
import { loadShopifyProduct } from '@/lib/providers/shopify/storefront-product-adapter';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Product Release Review | CARLOPHILLIPS',
  description: 'A source-labeled CARLOPHILLIPS product review. Purchasing remains disabled until release approval.',
  robots: { index: false, follow: true },
};

export default async function ProductPage({ params }) {
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
  const decision = await getProductDecision({
    environment,
    mode,
    handle: params.handle,
    fixtureProduct,
    loadShopifyProduct,
  });

  const product = toProductViewModel(decision);
  if (!product || !decision.visibilityAllowed) {
    return <CommerceProductUnavailable decision={decision} />;
  }

  return <CommerceProductDetail product={product} />;
}

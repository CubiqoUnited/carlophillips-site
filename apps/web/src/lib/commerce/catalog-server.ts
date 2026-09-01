import 'server-only';
import { closedCatalogDecision, getCatalogDecision } from './catalog-gateway';
import { resolveCommerceDataMode } from './product-gateway';
import {
  canRenderDraftProductPreviews,
  canRenderProducts,
  getCommerceEnvironment,
} from '../config/product-visibility';
import {
  loadShopifyCatalog,
  loadShopifyProduct,
} from '../providers/shopify/storefront-product-adapter';
import type { CatalogDecision, RuntimeProduct } from './runtime-types';

export async function getServerCatalogDecision(): Promise<CatalogDecision> {
  const environment = getCommerceEnvironment();
  if (!canRenderProducts()) {
    return closedCatalogDecision(environment);
  }

  const mode = resolveCommerceDataMode({
    configuredMode: process.env.COMMERCE_DATA_MODE,
    environment,
  });
  let fixtureProducts: RuntimeProduct[] = [];
  let shopifyProducts: RuntimeProduct[] = [];
  if (mode === 'fixture' && canRenderDraftProductPreviews()) {
    const fixtureModule =
      await import('../../fixtures/signature-hoodie-preview');
    fixtureProducts = [fixtureModule.signatureHoodiePreview];
  } else {
    try {
      shopifyProducts = await loadShopifyCatalog();
    } catch {
      return closedCatalogDecision(environment);
    }
  }

  const candidateProducts =
    mode === 'fixture' ? fixtureProducts : shopifyProducts;
  const candidateHandles = candidateProducts.map((product) => product.handle);

  return getCatalogDecision({
    environment,
    mode,
    candidateHandles,
    fixtureProducts,
    loadShopifyProduct:
      mode === 'shopify'
        ? async (handle) =>
            shopifyProducts.find((product) => product.handle === handle) || null
        : loadShopifyProduct,
  });
}

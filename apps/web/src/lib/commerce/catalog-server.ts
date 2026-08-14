import 'server-only';
import { closedCatalogDecision, getCatalogDecision } from './catalog-gateway';
import { resolveCommerceDataMode } from './product-gateway';
import {
  canRenderDraftProductPreviews,
  canRenderProducts,
  getCommerceEnvironment,
} from '../config/product-visibility';
import { loadShopifyProduct } from '../providers/shopify/storefront-product-adapter';
import {
  getProductReleaseEvidence,
  listProductReleaseHandles,
} from '../releases/product-release-registry';
import type { CatalogDecision, RuntimeProduct } from './runtime-types';

export async function getServerCatalogDecision(): Promise<CatalogDecision> {
  const environment = getCommerceEnvironment();
  const candidateHandles = listProductReleaseHandles();

  if (!canRenderProducts()) {
    return closedCatalogDecision(environment, candidateHandles.length);
  }

  const mode = resolveCommerceDataMode({
    configuredMode: process.env.COMMERCE_DATA_MODE,
    environment,
  });
  let fixtureProducts: RuntimeProduct[] = [];
  if (mode === 'fixture' && canRenderDraftProductPreviews()) {
    const fixtureModule =
      await import('../../fixtures/signature-hoodie-preview');
    fixtureProducts = [fixtureModule.signatureHoodiePreview];
  }

  return getCatalogDecision({
    environment,
    mode,
    candidateHandles,
    fixtureProducts,
    getReleaseEvidence: getProductReleaseEvidence,
    loadShopifyProduct,
  });
}

import 'server-only';
import { closedCatalogDecision, getCatalogDecision } from './catalog-gateway.js';
import { resolveCommerceDataMode } from './product-gateway.js';
import {
  canRenderDraftProductPreviews,
  canRenderProducts,
  getCommerceEnvironment,
} from '../config/product-visibility.js';
import { loadShopifyProduct } from '../providers/shopify/storefront-product-adapter.js';
import {
  getProductReleaseEvidence,
  listProductReleaseHandles,
} from '../releases/product-release-registry.js';

export async function getServerCatalogDecision() {
  const environment = getCommerceEnvironment();
  const candidateHandles = listProductReleaseHandles();

  if (!canRenderProducts()) {
    return closedCatalogDecision(environment, candidateHandles.length);
  }

  const mode = resolveCommerceDataMode({
    configuredMode: process.env.COMMERCE_DATA_MODE,
    environment,
  });
  let fixtureProducts = [];
  if (mode === 'fixture' && canRenderDraftProductPreviews()) {
    const fixtureModule = await import('../../fixtures/signature-hoodie-preview.js');
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

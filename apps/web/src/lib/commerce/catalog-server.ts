import 'server-only';
import { closedCatalogDecision, getCatalogDecision } from './catalog-gateway';
import { resolveCommerceDataMode } from './product-gateway';
import {
  canRenderDraftProductPreviews,
  canRenderProducts,
  getCommerceEnvironment,
} from '../config/product-visibility';
import { loadShopifyProduct } from '../providers/shopify/storefront-product-adapter';
import type { CatalogDecision, RuntimeProduct } from './runtime-types';
import productOffer from '../../../../../config/shopify-product-offer.json';

export async function getServerCatalogDecision(): Promise<CatalogDecision> {
  const environment = getCommerceEnvironment();
  const candidateHandles = [productOffer.handle];

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
    loadShopifyProduct,
  });
}

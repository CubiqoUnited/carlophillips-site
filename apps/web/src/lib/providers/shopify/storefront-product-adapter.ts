import 'server-only';

import { createShopifyProductLoader } from './product-loader';
import { getCommerceEnvironment } from '../../config/product-visibility';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../../orchestration/capability-registry';
import type { ProductLoader } from '../../commerce/runtime-types';

class ProductReadCapabilityError extends Error {
  readonly code = 'SHOPIFY_PRODUCT_READ_CAPABILITY_UNVERIFIED';

  constructor(readonly blocker: unknown) {
    super('Shopify Storefront product-read capability is not verified');
  }
}

export async function loadShopifyProduct(
  handle: string
): ReturnType<ProductLoader> {
  const capabilityDecision = discoverCapability(
    getCapabilityRegistry(),
    'shopify-storefront-product-read',
    'product-read'
  );
  if (
    capabilityDecision.status !== 'ready' ||
    !capabilityDecision.evidenceRef
  ) {
    throw new ProductReadCapabilityError(capabilityDecision.blocker);
  }
  const loadProduct = createShopifyProductLoader({
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
    environment: getCommerceEnvironment(),
    capabilityEvidence: capabilityDecision.evidenceRef,
  });
  return loadProduct(handle);
}

import 'server-only';

import { createShopifyProductLoader } from './product-loader';
import { getCommerceEnvironment } from '../../config/product-visibility';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../../orchestration/capability-registry';
import type { ProductLoader } from '../../commerce/runtime-types';
import storefrontRuntime from '../../../../../../config/shopify-storefront-runtime.json';

class ProductReadCapabilityError extends Error {
  readonly code = 'SHOPIFY_PRODUCT_READ_CAPABILITY_UNVERIFIED';

  constructor(readonly blocker: unknown) {
    super('Shopify Storefront product-read capability is not verified');
  }
}

export async function loadShopifyProduct(
  handle: string
): ReturnType<ProductLoader> {
  const environment = getCommerceEnvironment();
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
    storeDomain:
      environment === 'preview'
        ? process.env.SHOPIFY_STAGING_STORE_DOMAIN
        : process.env.SHOPIFY_STORE_DOMAIN || storefrontRuntime.storeDomain,
    storefrontToken:
      environment === 'preview'
        ? process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN
        : process.env.SHOPIFY_STOREFRONT_TOKEN,
    environment,
    capabilityEvidence: capabilityDecision.evidenceRef,
    publicCurrency: storefrontRuntime.currency,
  });
  return loadProduct(handle);
}

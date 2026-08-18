import 'server-only';

import { createShopifyProductLoader } from './product-loader.js';
import { getCommerceEnvironment } from '../../config/product-visibility.js';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../../orchestration/capability-registry.js';

export async function loadShopifyProduct(handle) {
  const capabilityDecision = discoverCapability(
    getCapabilityRegistry(),
    'shopify-storefront-product-read',
    'product-read'
  );
  if (capabilityDecision.status !== 'ready' || !capabilityDecision.evidenceRef) {
    const error = new Error('Shopify Storefront product-read capability is not verified');
    error.code = 'SHOPIFY_PRODUCT_READ_CAPABILITY_UNVERIFIED';
    error.blocker = capabilityDecision.blocker;
    throw error;
  }
  const loadProduct = createShopifyProductLoader({
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
    environment: getCommerceEnvironment(),
    capabilityEvidence: capabilityDecision.evidenceRef,
  });
  return loadProduct(handle);
}

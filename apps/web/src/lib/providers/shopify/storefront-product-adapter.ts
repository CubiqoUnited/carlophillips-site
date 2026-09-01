import 'server-only';

import {
  createShopifyCatalogLoader,
  createShopifyProductLoader,
} from './product-loader';
import { getCommerceEnvironment } from '../../config/product-visibility';
import type { ProductLoader } from '../../commerce/runtime-types';
import storefrontRuntime from '../../../../../../config/shopify-storefront-runtime.json';

function storefrontConfig() {
  const environment = getCommerceEnvironment();
  return {
    environment,
    storeDomain:
      environment === 'preview'
        ? process.env.SHOPIFY_STAGING_STORE_DOMAIN
        : process.env.SHOPIFY_STORE_DOMAIN || storefrontRuntime.storeDomain,
    storefrontToken:
      environment === 'preview'
        ? process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN
        : process.env.SHOPIFY_STOREFRONT_TOKEN,
  };
}

export async function loadShopifyProduct(
  handle: string
): ReturnType<ProductLoader> {
  const config = storefrontConfig();
  const loadProduct = createShopifyProductLoader({
    ...config,
    capabilityEvidence: 'shopify-storefront-runtime',
  });
  return loadProduct(handle);
}

export async function loadShopifyCatalog() {
  const loadProducts = createShopifyCatalogLoader({
    ...storefrontConfig(),
    capabilityEvidence: 'shopify-storefront-runtime',
  });
  return loadProducts();
}

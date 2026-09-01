import 'server-only';

import {
  createShopifyCatalogLoader,
  createShopifyProductLoader,
} from './product-loader';
import { getCommerceEnvironment } from '../../config/product-visibility';
import { resolveShopifyStorefrontConfig } from '../../config/shopify-environment';
import type { ProductLoader } from '../../commerce/runtime-types';

function storefrontConfig() {
  const environment = getCommerceEnvironment();
  const config = resolveShopifyStorefrontConfig(environment);
  return {
    environment,
    storeDomain: config.storeDomain,
    storefrontToken: config.storefrontAccessToken,
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

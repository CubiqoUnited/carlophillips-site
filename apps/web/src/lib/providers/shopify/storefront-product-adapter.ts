import 'server-only';

import {
  createShopifyCatalogLoader,
  createShopifyProductLoader,
} from './product-loader';
import { toClientRuntimeProduct } from '../../commerce/client-payload-guard';
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
    storefrontTokenType: config.storefrontAccessTokenType,
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
  const product = await loadProduct(handle);
  // KAN-19: allowlist boundary. Nothing reaches a client component or an RSC
  // flight payload except the fields named in CLIENT_PRODUCT_FIELDS.
  return product ? toClientRuntimeProduct(product) : null;
}

export async function loadShopifyCatalog() {
  const loadProducts = createShopifyCatalogLoader({
    ...storefrontConfig(),
    capabilityEvidence: 'shopify-storefront-runtime',
  });
  const products = await loadProducts();
  return products.map(toClientRuntimeProduct);
}

import 'server-only';

import { createShopifyProductLoader } from './product-loader';

export async function loadShopifyProduct(handle) {
  const loadProduct = createShopifyProductLoader({
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
  });
  return loadProduct(handle);
}

import { normalizeProduct } from '../../shopify/normalize';
import { GET_PRODUCT_BY_HANDLE } from '../../shopify/queries';
import {
  attachObservationToProduct,
  createProductObservation,
} from '../../commerce/product-observation';

export function createShopifyProductLoader({
  storeDomain,
  storefrontToken,
  fetchImpl = fetch,
  apiVersion = '2024-01',
  environment = 'local',
  observedAt = () => new Date().toISOString(),
  capabilityEvidence = null,
}) {
  if (!storeDomain || !storefrontToken) {
    const error = new Error('Shopify Storefront API is not configured');
    error.code = 'SHOPIFY_NOT_CONFIGURED';
    throw error;
  }

  const normalizedDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return async function loadProduct(handle) {
    const response = await fetchImpl(`https://${normalizedDomain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query: GET_PRODUCT_BY_HANDLE, variables: { handle } }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = new Error(`Shopify Storefront API returned HTTP ${response.status}`);
      error.code = 'SHOPIFY_HTTP_ERROR';
      throw error;
    }

    const payload = await response.json();
    if (payload.errors?.length) {
      const error = new Error(payload.errors.map(item => item.message).join(', '));
      error.code = 'SHOPIFY_GRAPHQL_ERROR';
      throw error;
    }

    const product = normalizeProduct(payload.data?.product || null);
    if (!product) return null;

    const observation = createProductObservation({
      source: 'shopify',
      environment,
      observedAt: observedAt(),
      product,
      capabilityEvidence,
    });
    return attachObservationToProduct(product, observation);
  };
}

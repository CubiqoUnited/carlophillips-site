import { resolveProductSource } from './release-policy';

export const COMMERCE_DATA_MODES = Object.freeze({
  FIXTURE: 'fixture',
  SHOPIFY: 'shopify',
});

export function resolveCommerceDataMode({ configuredMode, environment }) {
  const mode = configuredMode || (environment === 'local' ? COMMERCE_DATA_MODES.FIXTURE : COMMERCE_DATA_MODES.SHOPIFY);

  if (!Object.values(COMMERCE_DATA_MODES).includes(mode)) {
    throw new Error(`Unsupported commerce data mode: ${mode}`);
  }

  return mode;
}

function unavailableDecision(environment, reason) {
  return {
    schemaVersion: 'cp.release-decision.v1',
    environment,
    status: 'unavailable',
    source: 'unavailable',
    visibilityAllowed: false,
    commerceAllowed: false,
    reason,
    product: null,
  };
}

export async function getProductDecision({
  environment,
  mode,
  handle,
  fixtureProduct = null,
  loadShopifyProduct,
}) {
  if (mode === COMMERCE_DATA_MODES.FIXTURE) {
    if (environment !== 'local') {
      return unavailableDecision(environment, 'FIXTURE_SOURCE_FORBIDDEN');
    }

    if (!fixtureProduct || fixtureProduct.handle !== handle) {
      return unavailableDecision(environment, 'LOCAL_FIXTURE_NOT_FOUND');
    }

    return resolveProductSource({ environment, fixtureProduct });
  }

  if (mode !== COMMERCE_DATA_MODES.SHOPIFY) {
    throw new Error(`Unsupported commerce data mode: ${mode}`);
  }

  if (typeof loadShopifyProduct !== 'function') {
    return unavailableDecision(environment, 'SHOPIFY_ADAPTER_NOT_CONFIGURED');
  }

  try {
    const shopifyProduct = await loadShopifyProduct(handle);
    if (!shopifyProduct) {
      return unavailableDecision(environment, 'SHOPIFY_PRODUCT_UNAVAILABLE');
    }

    return resolveProductSource({ environment, shopifyProduct });
  } catch (error) {
    return resolveProductSource({ environment, shopifyError: error });
  }
}

export function closedReleaseDecision(environment) {
  return {
    schemaVersion: 'cp.release-decision.v1',
    environment,
    status: 'denied',
    source: 'unavailable',
    visibilityAllowed: false,
    commerceAllowed: false,
    reason: 'PRODUCT_VISIBILITY_GATE_CLOSED',
    product: null,
  };
}

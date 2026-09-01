import { resolveProductSource } from './release-policy';
import { canUseFixtureData } from '../config/product-visibility';
import type {
  CommerceEnvironment,
  CommerceMode,
  ProductLoader,
  ReleaseDecision,
  RuntimeProduct,
} from './runtime-types';

export const COMMERCE_DATA_MODES = Object.freeze({
  FIXTURE: 'fixture',
  SHOPIFY: 'shopify',
});

export function resolveCommerceDataMode({
  configuredMode,
  environment,
}: {
  configuredMode?: string;
  environment: CommerceEnvironment;
}): CommerceMode {
  let mode = configuredMode;
  if (!mode) {
    if (environment === 'local' && canUseFixtureData(environment)) {
      mode = COMMERCE_DATA_MODES.FIXTURE;
    } else {
      mode = COMMERCE_DATA_MODES.SHOPIFY;
    }
  }

  if (
    mode !== COMMERCE_DATA_MODES.FIXTURE &&
    mode !== COMMERCE_DATA_MODES.SHOPIFY
  ) {
    throw new Error(`Unsupported commerce data mode: ${mode}`);
  }

  return mode as CommerceMode;
}

function unavailableDecision(
  environment: CommerceEnvironment,
  reason: string
): ReleaseDecision {
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
}: {
  environment: CommerceEnvironment;
  mode: CommerceMode;
  handle: string;
  fixtureProduct?: RuntimeProduct | null;
  loadShopifyProduct: ProductLoader;
}): Promise<ReleaseDecision> {
  if (mode === COMMERCE_DATA_MODES.FIXTURE) {
    if (!canUseFixtureData(environment)) {
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

    return resolveProductSource({
      environment,
      shopifyProduct,
    });
  } catch (error) {
    return resolveProductSource({ environment, shopifyError: error });
  }
}

export function closedReleaseDecision(
  environment: CommerceEnvironment
): ReleaseDecision {
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

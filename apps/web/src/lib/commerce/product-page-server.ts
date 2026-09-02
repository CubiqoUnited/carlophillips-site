import 'server-only';

import { assertRuntimePreflight } from '../config/runtime-preflight';
import { getProductDecision } from './product-gateway';
import type {
  CartActivationSummary,
  CommerceEnvironment,
  CommerceMode,
  ProductLoader,
  ReleaseDecision,
  RuntimeProduct,
} from './runtime-types';

interface ProductPageOptions {
  environment: CommerceEnvironment;
  mode: CommerceMode;
  handle: string;
  fixtureProduct?: RuntimeProduct | null;
  loadShopifyProduct: ProductLoader;
  activationApproval?: {
    status: string;
    owner: string;
    scope: string;
    releaseId: string;
    handle: string;
    environments: string[];
    evidence: string;
  } | null;
  checkoutApproval?: {
    status: string;
    owner: string;
    scope: string;
    releaseId: string;
    handle: string;
    environments: string[];
    evidence: string;
  } | null;
}

export async function getProductPageDecision(
  options: ProductPageOptions
): Promise<{
  decision: ReleaseDecision;
  cartActivation: CartActivationSummary;
}> {
  if (options.environment !== 'local') {
    assertRuntimePreflight(options.environment);
  }
  const decision = await getProductDecision({
    ...options,
    loadShopifyProduct: options.loadShopifyProduct,
  });
  const currentShopifyProduct =
    decision.source === 'shopify' &&
    decision.visibilityAllowed &&
    decision.product?.handle === options.handle
      ? decision.product
      : null;
  const sellable = Boolean(
    currentShopifyProduct?.availableForSale &&
    currentShopifyProduct.observedVariants?.some(
      (variant) => variant.availableForSale
    )
  );
  const cartEnabled = process.env.SHOPIFY_CART_UI_ENABLED !== 'false';
  const checkoutEnabled =
    options.environment !== 'production' ||
    process.env.SHOPIFY_CHECKOUT_ENABLED === 'true';
  const commerceEnabled = sellable && cartEnabled && checkoutEnabled;
  const cartActivation: CartActivationSummary = {
    schemaVersion: 'cp.cart-activation-decision.v1',
    status: commerceEnabled ? 'eligible' : 'disabled',
    cartAllowed: commerceEnabled,
    checkoutAllowed: commerceEnabled,
    reason: commerceEnabled
      ? 'CURRENT_SHOPIFY_PRODUCT_AVAILABLE'
      : sellable
        ? 'SHOPIFY_CART_SAFETY_DISABLED'
        : 'CURRENT_SHOPIFY_PRODUCT_UNAVAILABLE',
    checkoutReason: commerceEnabled
      ? 'SHOPIFY_HOSTED_CHECKOUT_AVAILABLE'
      : sellable
        ? 'SHOPIFY_CHECKOUT_SAFETY_DISABLED'
        : 'SHOPIFY_HOSTED_CHECKOUT_UNAVAILABLE',
    prerequisites: [],
  };
  return { decision, cartActivation };
}

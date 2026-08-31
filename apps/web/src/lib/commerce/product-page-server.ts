import 'server-only';

import { getProductDecision } from './product-gateway';
import type {
  CartActivationSummary,
  CommerceEnvironment,
  CommerceMode,
  ProductLoader,
  ReleaseDecision,
  RuntimeProduct,
} from './runtime-types';
import productOffer from '../../../../../config/shopify-product-offer.json';

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
  const decision = await getProductDecision({
    ...options,
    loadShopifyProduct: options.loadShopifyProduct,
  });
  const allowedSizes = new Set(productOffer.allowedSizes);
  const currentShopifyProduct =
    decision.source === 'shopify' &&
    decision.visibilityAllowed &&
    decision.product?.handle === productOffer.handle
      ? decision.product
      : null;
  const sellable = Boolean(
    currentShopifyProduct?.availableForSale &&
    currentShopifyProduct.observedVariants?.some((variant) => {
      const size = variant.selectedOptions.find(
        (option) => option.name.toLowerCase() === 'size'
      )?.value;
      return (
        variant.availableForSale && Boolean(size && allowedSizes.has(size))
      );
    })
  );
  const cartActivation: CartActivationSummary = {
    schemaVersion: 'cp.cart-activation-decision.v1',
    status: sellable ? 'eligible' : 'disabled',
    cartAllowed: sellable,
    checkoutAllowed: sellable,
    reason: sellable
      ? 'CURRENT_SHOPIFY_PRODUCT_AVAILABLE'
      : 'CURRENT_SHOPIFY_PRODUCT_UNAVAILABLE',
    checkoutReason: sellable
      ? 'SHOPIFY_HOSTED_CHECKOUT_AVAILABLE'
      : 'SHOPIFY_HOSTED_CHECKOUT_UNAVAILABLE',
    prerequisites: [],
  };
  return { decision, cartActivation };
}

import 'server-only';

import { getServerCartActivationDecision } from './cart-activation-server';
import { getProductDecision } from './product-gateway';
import { getServerVariantResolutionReadiness } from './variant-resolution-server';

export async function getProductPageDecision(options) {
  let rawProduct = null;
  const decision = await getProductDecision({
    ...options,
    loadShopifyProduct: async handle => {
      rawProduct = await options.loadShopifyProduct(handle);
      return rawProduct;
    },
  });
  const releaseRecord = options.releaseRecord || null;
  const resolver = rawProduct && releaseRecord
    ? getServerVariantResolutionReadiness({
      environment: options.environment,
      rawShopifyProduct: rawProduct,
      productDecision: decision,
      releaseRecord,
    })
    : null;
  const cart = getServerCartActivationDecision({
    environment: options.environment,
    productDecision: decision,
    releaseRecord,
    variantResolverDecision: resolver,
    activationApproval: options.activationApproval || null,
  });
  return { decision, cartActivation: cart.summary };
}

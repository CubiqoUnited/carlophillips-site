import 'server-only';

import { getServerCartActivationDecision } from './cart-activation-server';
import { getProductDecision } from './product-gateway';
import { getSingleProductLaunchApproval } from './single-product-launch-policy';
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
  const launch = getSingleProductLaunchApproval();
  const releaseRecord = decision.reason === 'SINGLE_PRODUCT_COMMERCE_LAUNCH_APPROVED' ? {
    state: 'released',
    shopify: {
      handle: launch.handle,
      variantFingerprintStatus: 'observed',
      variantFingerprint: launch.variantFingerprint,
      commerceFactsFingerprintStatus: 'reviewed',
      commerceFactsFingerprint: launch.commerceFactsFingerprint,
    },
  } : options.releaseRecord || null;
  const resolver = rawProduct && releaseRecord
    ? getServerVariantResolutionReadiness({
      environment: options.environment,
      rawShopifyProduct: rawProduct,
      productDecision: decision,
      releaseRecord,
    })
    : null;
  const activationApproval = decision.reason === 'SINGLE_PRODUCT_COMMERCE_LAUNCH_APPROVED' ? {
    status: 'approved',
    owner: launch.approvalOwner,
    scope: 'activate-customer-cart',
    evidence: launch.approvalEvidence,
  } : null;
  const cart = getServerCartActivationDecision({
    environment: options.environment,
    productDecision: decision,
    releaseRecord,
    variantResolverDecision: resolver,
    activationApproval,
  });
  return { decision, cartActivation: cart.summary };
}

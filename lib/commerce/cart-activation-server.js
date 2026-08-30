import 'server-only';

import {
  evaluateCartActivation,
  toCartActivationSummary,
} from './cart-activation-policy';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';
import { isExactProductionCommerceLaunchAuthorized } from './production-launch-policy.js';

export function getServerCartActivationDecision({
  environment,
  productDecision = null,
  releaseRecord = null,
  variantResolverDecision = null,
  activationApproval = null,
  checkoutApproval = null,
  productionLaunchAuthorization,
  productionCartWriteProof,
  productOfferConfig,
}) {
  const exactProductionLaunchAuthorized = Boolean(
    productDecision?.product?.handle &&
    releaseRecord &&
    isExactProductionCommerceLaunchAuthorized({
      environment,
      releaseRecord,
      productHandle: productDecision.product.handle,
      authorization: productionLaunchAuthorization,
      cartWriteProof: productionCartWriteProof,
      productOfferConfig,
    })
  );
  const capabilityDecision = discoverCapability(
    getCapabilityRegistry(),
    'shopify-storefront-cart',
    exactProductionLaunchAuthorized ? 'cart-write-test' : 'cart-write'
  );
  const decision = evaluateCartActivation({
    environment,
    productDecision,
    releaseRecord,
    capabilityDecision,
    variantResolverDecision,
    activationApproval,
    checkoutApproval,
    productionLaunchAuthorization,
    productionCartWriteProof,
    productOfferConfig,
  });

  return {
    decision,
    summary: toCartActivationSummary(decision),
  };
}

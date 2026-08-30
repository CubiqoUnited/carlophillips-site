import 'server-only';

import {
  evaluateCartActivation,
  toCartActivationSummary,
} from './cart-activation-policy';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';

export function getServerCartActivationDecision({
  environment,
  productDecision = null,
  releaseRecord = null,
  variantResolverDecision = null,
  activationApproval = null,
  checkoutApproval = null,
}) {
  const capabilityDecision = discoverCapability(
    getCapabilityRegistry(),
    'shopify-storefront-cart',
    'cart-write'
  );
  const decision = evaluateCartActivation({
    environment,
    productDecision,
    releaseRecord,
    capabilityDecision,
    variantResolverDecision,
    activationApproval,
    checkoutApproval,
  });

  return {
    decision,
    summary: toCartActivationSummary(decision),
  };
}

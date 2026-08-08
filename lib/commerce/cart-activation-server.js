import 'server-only';

import {
  evaluateCartActivation,
  toCartActivationSummary,
} from './cart-activation-policy';
import { discoverCapability, getCapabilityRegistry } from '../orchestration/capability-registry';

export function getServerCartActivationDecision({
  environment,
  productDecision = null,
  releaseRecord = null,
  variantResolverDecision = null,
  activationApproval = null,
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
    activationRequested: process.env.SHOPIFY_CART_UI_ENABLED === 'true',
  });

  return {
    decision,
    summary: toCartActivationSummary(decision),
  };
}

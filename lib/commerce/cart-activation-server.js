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
    variantResolverDecision: null,
    activationApproval: null,
    activationRequested: process.env.SHOPIFY_CART_UI_ENABLED === 'true',
  });

  return {
    decision,
    summary: toCartActivationSummary(decision),
  };
}

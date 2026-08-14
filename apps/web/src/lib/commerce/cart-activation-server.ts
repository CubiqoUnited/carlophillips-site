import 'server-only';

import {
  evaluateCartActivation,
  toCartActivationSummary,
} from './cart-activation-policy';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';
import type {
  CartActivationDecision,
  CartActivationSummary,
  CommerceEnvironment,
  ReleaseDecision,
  ReleaseRecord,
  VariantResolutionDecision,
} from './runtime-types';

export function getServerCartActivationDecision({
  environment,
  productDecision = null,
  releaseRecord = null,
  variantResolverDecision = null,
  activationApproval = null,
}: {
  environment: CommerceEnvironment;
  productDecision?: ReleaseDecision | null;
  releaseRecord?: ReleaseRecord | null;
  variantResolverDecision?: VariantResolutionDecision | null;
  activationApproval?: {
    status: string;
    owner: string;
    scope: string;
    evidence: string;
  } | null;
}): { decision: CartActivationDecision; summary: CartActivationSummary } {
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

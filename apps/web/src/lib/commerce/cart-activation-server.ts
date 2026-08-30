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

interface ReleaseAuthorization {
  status: string;
  owner: string;
  scope: string;
  releaseId: string;
  handle: string;
  environments: string[];
  evidence: string;
}

export function getServerCartActivationDecision({
  environment,
  productDecision = null,
  releaseRecord = null,
  variantResolverDecision = null,
  activationApproval = null,
  checkoutApproval = null,
}: {
  environment: CommerceEnvironment;
  productDecision?: ReleaseDecision | null;
  releaseRecord?: ReleaseRecord | null;
  variantResolverDecision?: VariantResolutionDecision | null;
  activationApproval?: ReleaseAuthorization | null;
  checkoutApproval?: ReleaseAuthorization | null;
}): { decision: CartActivationDecision; summary: CartActivationSummary } {
  const capabilityDecision = discoverCapability(
    getCapabilityRegistry(),
    'shopify-storefront-cart',
    environment === 'preview' ? 'cart-write-test' : 'cart-write'
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

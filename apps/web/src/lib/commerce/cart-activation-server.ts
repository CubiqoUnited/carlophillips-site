import 'server-only';

import {
  evaluateCartActivation,
  toCartActivationSummary,
} from './cart-activation-policy';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';
import {
  isExactProductionCommerceLaunchAuthorized,
  type ProductionCartWriteProof,
  type ProductionCommerceLaunchAuthorization,
} from './production-launch-policy';
import type { ProductOffer } from './product-offer-policy';
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
  productionLaunchAuthorization,
  productionCartWriteProof,
  productOfferConfig,
}: {
  environment: CommerceEnvironment;
  productDecision?: ReleaseDecision | null;
  releaseRecord?: ReleaseRecord | null;
  variantResolverDecision?: VariantResolutionDecision | null;
  activationApproval?: ReleaseAuthorization | null;
  checkoutApproval?: ReleaseAuthorization | null;
  productionLaunchAuthorization?: ProductionCommerceLaunchAuthorization | null;
  productionCartWriteProof?: ProductionCartWriteProof | null;
  productOfferConfig?: ProductOffer;
}): { decision: CartActivationDecision; summary: CartActivationSummary } {
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
    environment === 'preview' || exactProductionLaunchAuthorized
      ? 'cart-write-test'
      : 'cart-write'
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

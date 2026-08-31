import productionLaunchAuthorizationDocument from '../../../../../config/product-owner-production-launch-authorization.json';
import productOfferDocument from '../../../../../config/shopify-product-offer.json';
import storefrontRuntime from '../../../../../config/shopify-storefront-runtime.json';
import cartWriteProofDocument from '../../../../../evidence/shopify/cp-signature-hoodie-production-cart-write-2026-08-30.json';
import type { ProductOffer } from './product-offer-policy';
import type { CommerceEnvironment, ReleaseRecord } from './runtime-types';

export interface ProductionCommerceLaunchAuthorization {
  schemaVersion?: string;
  status?: string;
  owner?: string;
  releaseId?: string;
  handle?: string;
  candidateCommit?: string;
  approvedTargetFingerprint?: string;
  environments?: string[];
  scopes?: string[];
  evidence?: string;
  commerceActivation?: {
    status?: string;
    cartWriteEvidence?: string;
    allowedReferenceHashes?: string[];
    maximumQuantity?: number;
  };
}

export interface ProductionCartWriteProof {
  schemaVersion?: string;
  releaseId?: string;
  handle?: string;
  candidateCommit?: string;
  approvedTargetFingerprint?: string;
  environment?: string;
  request?: { referenceHash?: string; quantity?: number };
  response?: {
    status?: number;
    protocol?: string;
    trustedCheckoutHost?: string;
    redirectFollowed?: boolean;
    responseBodyBytes?: number;
  };
  negativeChecks?: {
    crossOrigin?: { status?: number; reason?: string };
    unapprovedReference?: { status?: number; reason?: string };
    unapprovedProofQuantity?: { status?: number; reason?: string };
  };
  customerDataProvided?: boolean;
  paymentAttempted?: boolean;
  orderSubmitted?: boolean;
  fulfillmentInvoked?: boolean;
  privateCheckoutUrlRetained?: boolean;
  evidenceBoundary?: string;
}

interface BoundReleaseApproval {
  status?: string;
  owner?: string;
  evidence?: {
    candidateCommit?: string;
    approvedTargetFingerprint?: string;
  } | null;
}

interface LegacyReleaseCandidate {
  gitCommit?: string | null;
  releaseEvidenceFingerprint?: string | null;
}

function sameReferences(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    new Set(left).size === left.length &&
    left.every((reference) => right.includes(reference))
  );
}

export function isExactProductionCommerceLaunchAuthorized({
  environment,
  releaseRecord,
  productHandle,
  referenceHash = null,
  quantity = null,
  authorization = productionLaunchAuthorizationDocument,
  cartWriteProof = cartWriteProofDocument,
  productOfferConfig = productOfferDocument,
}: {
  environment: CommerceEnvironment;
  releaseRecord: ReleaseRecord;
  productHandle: string;
  referenceHash?: string | null;
  quantity?: number | null;
  authorization?: ProductionCommerceLaunchAuthorization | null;
  cartWriteProof?: ProductionCartWriteProof | null;
  productOfferConfig?: ProductOffer;
}): boolean {
  // This policy remains only for legacy, non-customer tooling. The runtime type
  // intentionally no longer models the retired evidence binding, so keep the
  // compatibility read local to this legacy module.
  const legacyCandidate = releaseRecord.candidate as
    LegacyReleaseCandidate | undefined;
  const activation = authorization?.commerceActivation;
  const allowedReferences = activation?.allowedReferenceHashes || [];
  const offerReferences = productOfferConfig.allowedReferenceHashes || [];
  const trustedHosts = new Set([
    storefrontRuntime.storeDomain,
    ...storefrontRuntime.checkoutHosts,
  ]);
  const approvals = [
    releaseRecord.approvals?.product,
    releaseRecord.approvals?.media,
    releaseRecord.approvals?.fulfillment,
  ];
  const referenceReady =
    referenceHash === null || allowedReferences.includes(referenceHash);
  const quantityReady =
    quantity === null ||
    (Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= Number(activation?.maximumQuantity));

  return Boolean(
    environment === 'production' &&
    ['staged', 'approved'].includes(releaseRecord.state) &&
    authorization?.schemaVersion ===
      'cp.product-owner-production-launch-authorization.v1' &&
    authorization.status === 'approved' &&
    authorization.owner === 'Product Owner' &&
    authorization.releaseId === releaseRecord.releaseId &&
    authorization.handle === releaseRecord.shopify.handle &&
    authorization.handle === productHandle &&
    authorization.candidateCommit === legacyCandidate?.gitCommit &&
    authorization.approvedTargetFingerprint ===
      legacyCandidate?.releaseEvidenceFingerprint &&
    authorization.environments?.includes(environment) &&
    authorization.scopes?.includes('activate-exact-reviewed-offer') &&
    typeof authorization.evidence === 'string' &&
    authorization.evidence.trim().length > 0 &&
    activation?.status === 'approved' &&
    activation.cartWriteEvidence ===
      'evidence/shopify/cp-signature-hoodie-production-cart-write-2026-08-30.json' &&
    activation.maximumQuantity === 5 &&
    productOfferConfig.releaseId === releaseRecord.releaseId &&
    productOfferConfig.handle === productHandle &&
    sameReferences(allowedReferences, offerReferences) &&
    referenceReady &&
    quantityReady &&
    cartWriteProof?.schemaVersion === 'cp.shopify-cart-write-proof.v1' &&
    cartWriteProof.releaseId === releaseRecord.releaseId &&
    cartWriteProof.handle === productHandle &&
    cartWriteProof.candidateCommit === legacyCandidate?.gitCommit &&
    cartWriteProof.approvedTargetFingerprint ===
      legacyCandidate?.releaseEvidenceFingerprint &&
    cartWriteProof.environment === environment &&
    allowedReferences.includes(cartWriteProof.request?.referenceHash || '') &&
    cartWriteProof.request?.quantity === 1 &&
    cartWriteProof.response?.status === 303 &&
    cartWriteProof.response.protocol === 'https:' &&
    trustedHosts.has(cartWriteProof.response.trustedCheckoutHost || '') &&
    cartWriteProof.response.redirectFollowed === false &&
    cartWriteProof.response.responseBodyBytes === 0 &&
    cartWriteProof.negativeChecks?.crossOrigin?.status === 403 &&
    cartWriteProof.negativeChecks.crossOrigin.reason === 'ORIGIN_REJECTED' &&
    cartWriteProof.negativeChecks?.unapprovedReference?.status === 409 &&
    cartWriteProof.negativeChecks.unapprovedReference.reason ===
      'VARIANT_OUTSIDE_APPROVED_OFFER' &&
    cartWriteProof.customerDataProvided === false &&
    cartWriteProof.paymentAttempted === false &&
    cartWriteProof.orderSubmitted === false &&
    cartWriteProof.fulfillmentInvoked === false &&
    cartWriteProof.privateCheckoutUrlRetained === false &&
    typeof cartWriteProof.evidenceBoundary === 'string' &&
    cartWriteProof.evidenceBoundary.trim().length > 0 &&
    approvals.every((approval) => {
      const boundApproval = approval as BoundReleaseApproval | undefined;
      return (
        boundApproval?.status === 'approved' &&
        boundApproval.owner === 'Product Owner' &&
        boundApproval.evidence?.candidateCommit ===
          legacyCandidate?.gitCommit &&
        boundApproval.evidence?.approvedTargetFingerprint ===
          legacyCandidate?.releaseEvidenceFingerprint
      );
    })
  );
}

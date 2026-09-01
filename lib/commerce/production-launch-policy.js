import productionLaunchAuthorizationDocument from '../../config/product-owner-production-launch-authorization.json';
import productOfferDocument from '../../config/shopify-product-offer.json';
import storefrontRuntime from '../../config/shopify-storefront-runtime.json';
import cartWriteProofDocument from '../../evidence/shopify/cp-signature-hoodie-production-cart-write-2026-08-30.json';

function sameReferences(left, right) {
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
}) {
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
    authorization.candidateCommit === releaseRecord.candidate?.gitCommit &&
    authorization.approvedTargetFingerprint ===
      releaseRecord.candidate?.releaseEvidenceFingerprint &&
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
    cartWriteProof.candidateCommit === releaseRecord.candidate?.gitCommit &&
    cartWriteProof.approvedTargetFingerprint ===
      releaseRecord.candidate?.releaseEvidenceFingerprint &&
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
    approvals.every(
      (approval) =>
        approval?.status === 'approved' &&
        approval.owner === 'Product Owner' &&
        approval.evidence?.candidateCommit ===
          releaseRecord.candidate?.gitCommit &&
        approval.evidence?.approvedTargetFingerprint ===
          releaseRecord.candidate?.releaseEvidenceFingerprint
    )
  );
}

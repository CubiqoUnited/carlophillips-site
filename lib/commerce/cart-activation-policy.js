import { hasSellableReviewedVariant } from './variant-presentation-policy.js';

const RELEASED = 'released';

function prerequisite(code, satisfied, resumePoint, humanRequired = false) {
  return {
    code,
    status: satisfied ? 'satisfied' : (humanRequired ? 'human_required' : 'blocked'),
    resumePoint: satisfied ? null : resumePoint,
  };
}

/**
 * Evaluate customer-facing cart activation without performing a Shopify write.
 *
 * Cart eligibility and checkout eligibility are deliberately separate. Even
 * an eligible cart decision never authorizes checkout, payment, or an order.
 */
export function evaluateCartActivation({
  environment,
  productDecision,
  releaseRecord,
  capabilityDecision,
  variantResolverDecision = null,
  activationApproval = null,
  activationRequested = false,
  checkoutApproval = null,
}) {
  const shopifyProduct = productDecision?.source === 'shopify'
    && productDecision.visibilityAllowed === true
    && productDecision.product
    ? productDecision.product
    : null;
  const releaseMatches = Boolean(
    shopifyProduct
    && releaseRecord
    && releaseRecord.shopify?.handle === (shopifyProduct.handle || shopifyProduct.id)
  );
  const releaseReady = releaseMatches && releaseRecord.state === RELEASED;
  const fingerprintReady = releaseMatches
    && releaseRecord.shopify?.variantFingerprintStatus === 'observed'
    && typeof releaseRecord.shopify?.variantFingerprint === 'string'
    && shopifyProduct.variantFingerprint === releaseRecord.shopify.variantFingerprint;
  const sellableVariantReady = Boolean(
    shopifyProduct?.availableForSale
    && hasSellableReviewedVariant(shopifyProduct.variantPresentation, {
      expectedVariantFingerprint: releaseRecord?.shopify?.variantFingerprint,
      productVariantFingerprint: shopifyProduct.variantFingerprint,
      productCurrency: shopifyProduct.currency,
    })
  );
  const capabilityReady = capabilityDecision?.status === 'ready'
    && capabilityDecision.capability === 'shopify-storefront-cart'
    && capabilityDecision.adapter === 'shopify-storefront-cart'
    && capabilityDecision.callableSurface === 'shopify_storefront'
    && typeof capabilityDecision.evidenceRef === 'string'
    && capabilityDecision.evidenceRef.trim().length > 0;
  const variantResolverReady =
    variantResolverDecision?.schemaVersion === 'cp.variant-resolution-decision.v1'
    && variantResolverDecision.status === 'ready'
    && variantResolverDecision.capability === 'shopify-storefront-variant-resolver'
    && variantResolverDecision.adapter === 'server-only-shopify-variant-resolver'
    && variantResolverDecision.callableSurface === 'server_only'
    && variantResolverDecision.environment === environment
    && variantResolverDecision.productHandle === shopifyProduct?.handle
    && variantResolverDecision.variantFingerprint === releaseRecord?.shopify?.variantFingerprint
    && variantResolverDecision.variantFingerprint === shopifyProduct?.variantFingerprint
    && typeof variantResolverDecision.evidenceRef === 'string'
    && variantResolverDecision.evidenceRef.trim().length > 0
    && typeof variantResolverDecision.productReadEvidenceRef === 'string'
    && variantResolverDecision.productReadEvidenceRef.trim().length > 0
    && Number.isInteger(variantResolverDecision.mappedVariantCount)
    && variantResolverDecision.mappedVariantCount > 0
    && variantResolverDecision.mappingComplete === true
    && variantResolverDecision.rawReferenceExposed === false
    && variantResolverDecision.cartMutationAuthorized === false
    && variantResolverDecision.checkoutAuthorized === false
    && Array.isArray(variantResolverDecision.blockers)
    && variantResolverDecision.blockers.length === 0;
  const approvalReady = activationApproval?.status === 'approved'
    && activationApproval.owner === 'Product Owner'
    && activationApproval.scope === 'activate-customer-cart'
    && activationApproval.releaseId === releaseRecord?.releaseId
    && activationApproval.handle === shopifyProduct?.handle
    && Array.isArray(activationApproval.environments)
    && activationApproval.environments.includes(environment)
    && typeof activationApproval.evidence === 'string'
    && activationApproval.evidence.length > 0;

  const prerequisites = [
    prerequisite(
      'SHOPIFY_RELEASE_PRODUCT_REQUIRED',
      Boolean(shopifyProduct),
      'Resolve this handle through the server Commerce Gateway with a visible Shopify observation.'
    ),
    prerequisite(
      'RELEASED_PRODUCT_REQUIRED',
      releaseReady,
      'Advance the matching Product Release Record through its evidence-backed Released transition.'
    ),
    prerequisite(
      'OBSERVED_VARIANT_FINGERPRINT_REQUIRED',
      fingerprintReady,
      'Compute the current Shopify variant-identity fingerprint and prove it matches the Product Release Record.'
    ),
    prerequisite(
      'SELLABLE_REVIEWED_VARIANT_REQUIRED',
      sellableVariantReady,
      'Verify at least one available canonical variant combination through an authorized read-only observation.'
    ),
    prerequisite(
      'STOREFRONT_CART_WRITE_CAPABILITY_REQUIRED',
      capabilityReady,
      capabilityDecision?.blocker?.resumePoint
        || 'Verify the Storefront cart-write surface with no-order evidence and update the capability registry.',
      true
    ),
    prerequisite(
      'SERVER_VARIANT_RESOLVER_REQUIRED',
      variantResolverReady,
      'Bind an evidence-backed server-only resolver to this exact reviewed variant fingerprint; never expose or infer raw Shopify references.'
    ),
    prerequisite(
      'PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED',
      approvalReady,
      'Record explicit Product Owner approval scoped to activate-customer-cart with durable evidence.',
      true
    ),
    prerequisite(
      'SERVER_CART_UI_GATE_REQUIRED',
      activationRequested === true,
      'Set the server-only SHOPIFY_CART_UI_ENABLED gate only in the explicitly approved environment.'
    ),
  ];
  const firstUnmet = prerequisites.find(item => item.status !== 'satisfied');
  const fixtureOrLocal = environment === 'local' || productDecision?.source === 'fixture';
  const cartAllowed = !fixtureOrLocal && !firstUnmet;
  const checkoutApprovalReady = checkoutApproval?.status === 'approved'
    && checkoutApproval.owner === 'Product Owner'
    && checkoutApproval.scope === 'shopify-hosted-checkout-redirect'
    && checkoutApproval.releaseId === releaseRecord?.releaseId
    && checkoutApproval.handle === shopifyProduct?.handle
    && Array.isArray(checkoutApproval.environments)
    && checkoutApproval.environments.includes(environment)
    && typeof checkoutApproval.evidence === 'string'
    && checkoutApproval.evidence.trim().length > 0;
  const checkoutAllowed = cartAllowed
    && checkoutApprovalReady
    && environment === 'production';

  return {
    schemaVersion: 'cp.cart-activation-decision.v1',
    environment,
    status: fixtureOrLocal ? 'disabled' : (cartAllowed ? 'eligible' : 'blocked'),
    productHandle: shopifyProduct?.handle || shopifyProduct?.id || null,
    cartAllowed,
    checkoutAllowed,
    reason: fixtureOrLocal
      ? 'LOCAL_OR_FIXTURE_CART_UI_DISABLED'
      : (firstUnmet?.code || 'CUSTOMER_CART_ELIGIBLE'),
    checkoutReason: checkoutAllowed
      ? 'SHOPIFY_HOSTED_CHECKOUT_AUTHORIZED'
      : (!checkoutApprovalReady
        ? 'CHECKOUT_REQUIRES_SEPARATE_APPROVAL_AND_LIVE_PROOF'
        : 'CHECKOUT_ENVIRONMENT_GATE_DISABLED'),
    prerequisites,
  };
}

export function toCartActivationSummary(decision) {
  return {
    schemaVersion: decision.schemaVersion,
    status: decision.status,
    cartAllowed: decision.cartAllowed,
    checkoutAllowed: decision.checkoutAllowed,
    reason: decision.reason,
    checkoutReason: decision.checkoutReason,
    prerequisites: decision.prerequisites.map(({ code, status, resumePoint }) => ({
      code,
      status,
      resumePoint,
    })),
  };
}

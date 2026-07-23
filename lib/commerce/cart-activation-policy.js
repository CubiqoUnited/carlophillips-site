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
  activationApproval = null,
  activationRequested = false,
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
    && Object.values(shopifyProduct.shopifyVariants || {}).some(Boolean)
  );
  const capabilityReady = capabilityDecision?.status === 'ready';
  const approvalReady = activationApproval?.status === 'approved'
    && activationApproval.owner === 'Product Owner'
    && activationApproval.scope === 'activate-customer-cart'
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
      'SELLABLE_VARIANT_MAPPING_REQUIRED',
      sellableVariantReady,
      'Verify at least one available Shopify variant mapping through an authorized read-only observation.'
    ),
    prerequisite(
      'STOREFRONT_CART_WRITE_CAPABILITY_REQUIRED',
      capabilityReady,
      capabilityDecision?.blocker?.resumePoint
        || 'Verify the Storefront cart-write surface with no-order evidence and update the capability registry.',
      true
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

  return {
    schemaVersion: 'cp.cart-activation-decision.v1',
    environment,
    status: fixtureOrLocal ? 'disabled' : (cartAllowed ? 'eligible' : 'blocked'),
    productHandle: shopifyProduct?.handle || shopifyProduct?.id || null,
    cartAllowed,
    checkoutAllowed: false,
    reason: fixtureOrLocal
      ? 'LOCAL_OR_FIXTURE_CART_UI_DISABLED'
      : (firstUnmet?.code || 'CUSTOMER_CART_ELIGIBLE'),
    checkoutReason: 'CHECKOUT_REQUIRES_SEPARATE_APPROVAL_AND_LIVE_PROOF',
    prerequisites,
  };
}

export function toCartActivationSummary(decision) {
  return {
    schemaVersion: decision.schemaVersion,
    status: decision.status,
    cartAllowed: decision.cartAllowed,
    checkoutAllowed: false,
    reason: decision.reason,
    checkoutReason: decision.checkoutReason,
    prerequisites: decision.prerequisites.map(({ code, status, resumePoint }) => ({
      code,
      status,
      resumePoint,
    })),
  };
}

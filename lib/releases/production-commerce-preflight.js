import { evaluateProductReleaseEvidence } from './product-release-transition.js';

const COMMIT_PATTERN = /^[a-f0-9]{40}$/;

function blocker(code, detail) {
  return { code, detail };
}

function authorizationReady(authorization, { scope, releaseRecord }) {
  return Boolean(
    authorization?.status === 'approved'
    && authorization.owner === 'Product Owner'
    && authorization.scope === scope
    && authorization.releaseId === releaseRecord?.releaseId
    && authorization.handle === releaseRecord?.shopify?.handle
    && Array.isArray(authorization.environments)
    && authorization.environments.includes('production')
    && typeof authorization.evidence === 'string'
    && authorization.evidence.trim().length > 0
  );
}

function operationalCartCapability(registry) {
  const capability = registry?.capabilities?.find(
    item => item.capability === 'shopify-storefront-cart',
  );
  return Boolean(
    capability?.selectedAdapter === 'shopify-storefront-cart'
    && capability.accessState === 'write_verified'
    && capability.callableSurface === 'shopify_storefront'
    && capability.allowedOperations?.includes('cart-write')
    && typeof capability.evidenceRef === 'string'
    && capability.evidenceRef.trim().length > 0
    && Number.isFinite(Date.parse(capability.observedAt))
  );
}

/**
 * Prove that a checkout-enabled Production artifact may be staged.
 *
 * This is deliberately stricter than runtime UI gating: the exact immutable
 * release, complete release evidence, operational cart surface, and both
 * Product Owner authorizations must pass before CI can set checkout variables.
 */
export function evaluateProductionCommercePreflight({
  releaseRecord,
  mediaManifest,
  expectedSha,
  capabilityRegistry,
  cartAuthorization,
  checkoutAuthorization,
}) {
  const blockers = [];

  if (!COMMIT_PATTERN.test(expectedSha || '')) {
    blockers.push(blocker('EXPECTED_SHA_INVALID', 'Expected source SHA must be a full lowercase commit SHA.'));
  }
  if (releaseRecord?.state !== 'released') {
    blockers.push(blocker('PRODUCT_RELEASE_NOT_RELEASED', 'The canonical Product Release Record is not Released.'));
  }
  if (releaseRecord?.candidate?.gitCommit !== expectedSha) {
    blockers.push(blocker('RELEASE_CANDIDATE_SHA_MISMATCH', 'The release candidate commit does not equal the selected main SHA.'));
  }

  if (releaseRecord && mediaManifest) {
    const evidence = evaluateProductReleaseEvidence({
      record: releaseRecord,
      manifest: mediaManifest,
      targetState: 'released',
    });
    for (const item of evidence.blockers) {
      blockers.push(blocker(item.code, item.resumePoint));
    }
  } else {
    blockers.push(blocker('PRODUCT_RELEASE_EVIDENCE_REQUIRED', 'The release record and Media Registry manifest are required.'));
  }

  if (!operationalCartCapability(capabilityRegistry)) {
    const cartCapability = capabilityRegistry?.capabilities?.find(
      item => item.capability === 'shopify-storefront-cart',
    );
    blockers.push(blocker(
      'SHOPIFY_CART_CAPABILITY_NOT_READY',
      cartCapability?.blocker?.resumePoint || 'Operational cart-write evidence is required.',
    ));
  }

  if (!authorizationReady(cartAuthorization, {
    scope: 'activate-customer-cart',
    releaseRecord,
  })) {
    blockers.push(blocker(
      'PRODUCT_OWNER_CART_AUTHORIZATION_INVALID',
      'The exact release and Production environment require Product Owner cart activation approval.',
    ));
  }
  if (!authorizationReady(checkoutAuthorization, {
    scope: 'shopify-hosted-checkout-redirect',
    releaseRecord,
  })) {
    blockers.push(blocker(
      'PRODUCT_OWNER_CHECKOUT_AUTHORIZATION_INVALID',
      'The exact release and Production environment require Product Owner hosted-checkout approval.',
    ));
  }

  return {
    schemaVersion: 'cp.production-commerce-preflight.v1',
    releaseId: releaseRecord?.releaseId || null,
    expectedSha: COMMIT_PATTERN.test(expectedSha || '') ? expectedSha : null,
    ready: blockers.length === 0,
    checkoutEnabled: blockers.length === 0,
    safeFallbackCheckoutEnabled: false,
    blockers,
  };
}

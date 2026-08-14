import { describe, expect, it } from 'vitest';
import {
  discoverCapability,
  getCapabilityRegistry,
  validateCapabilityRegistry,
} from '../lib/orchestration/capability-registry';

describe('capability registry policy', () => {
  it('discovers a proven local orchestration operation', () => {
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'cross-lane-orchestration',
      'simulate-run'
    );
    expect(decision).toMatchObject({
      status: 'ready',
      adapter: 'cp-pipeline-run',
      callableSurface: 'local',
      reason: null,
    });
  });

  it('keeps the historical no-order Shopify cart test evidence-only', () => {
    const registry = getCapabilityRegistry();
    const operationalDecision = discoverCapability(
      registry,
      'shopify-storefront-cart',
      'cart-write'
    );
    expect(operationalDecision).toMatchObject({
      status: 'human_required',
      operationalAuthority: 'blocked',
      reason: 'CART_ACTIVATION_AUTHORITY_REQUIRED',
    });

    const testDecision = discoverCapability(
      registry,
      'shopify-storefront-cart',
      'cart-write-test'
    );
    expect(testDecision).toMatchObject({
      status: 'evidence_only',
      adapter: 'shopify-storefront-cart',
      callableSurface: 'shopify_storefront',
      evidenceRef: 'test_reports/cp-hoodie-production-activation-2026-08-04/report.md',
      technicalStatus: 'verified_test',
      operationalAuthority: 'blocked',
      reason: 'CART_ACTIVATION_AUTHORITY_REQUIRED',
    });
  });

  it('registers the current evidence-backed Storefront product read', () => {
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'shopify-storefront-product-read',
      'product-read'
    );
    expect(decision).toMatchObject({
      status: 'ready',
      adapter: 'shopify-storefront-product',
      callableSurface: 'shopify_storefront',
      evidenceRef: 'test_reports/cp-hoodie-production-activation-2026-08-04/storefront-observation.json',
      reason: null,
    });
  });

  it('registers only local evidence-only variant resolution, not Storefront mutation', () => {
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'shopify-storefront-variant-resolver',
      'resolve-reviewed-variant'
    );
    expect(decision).toMatchObject({
      status: 'ready',
      adapter: 'server-only-shopify-variant-resolver',
      callableSurface: 'local',
      evidenceRef: 'tests/variant-resolution-policy.test.js',
    });
    expect(discoverCapability(
      getCapabilityRegistry(),
      'shopify-storefront-variant-resolver',
      'cart-write'
    ).status).toBe('human_required');
  });

  it('registers the lifecycle reducer as local-only contract logic', () => {
    const registry = getCapabilityRegistry();
    expect(discoverCapability(
      registry,
      'sale-post-sale-lifecycle-core',
      'reduce-lifecycle'
    )).toMatchObject({
      status: 'ready',
      callableSurface: 'local',
      operationalAuthority: 'local_only',
    });
    expect(discoverCapability(
      registry,
      'sale-post-sale-lifecycle-core',
      'refund'
    )).toMatchObject({
      status: 'human_required',
      operationalAuthority: 'blocked',
    });
  });

  it('registers only local webhook verification, not provider ingress', () => {
    const registry = getCapabilityRegistry();
    expect(discoverCapability(
      registry,
      'shopify-webhook-verifier',
      'verify-signature-envelope'
    )).toMatchObject({
      status: 'ready',
      callableSurface: 'local',
      operationalAuthority: 'local_only',
    });
    expect(discoverCapability(
      registry,
      'provider-webhook-inbox',
      'receive-webhook'
    )).toMatchObject({
      status: 'unavailable',
      reason: 'WEBHOOK_INGRESS_AND_DURABILITY_NOT_IMPLEMENTED',
      operationalAuthority: 'blocked',
    });
  });

  it('registers only a local admin command policy, not a connector executor', () => {
    expect(discoverCapability(
      getCapabilityRegistry(),
      'admin-command-authorizer',
      'evaluate-reviewed-command'
    )).toMatchObject({
      status: 'ready',
      callableSurface: 'local',
      operationalAuthority: 'local_only',
    });
  });

  it('keeps provider-specific app workers registered but non-callable', () => {
    const registry = getCapabilityRegistry();
    for (const [capability, operation, reason] of [
      ['hoodie-fulfillment', 'read-mapping', 'APLIQ_PROVIDER_SIGN_IN_REQUIRED'],
      ['spin-360', 'create-spin', 'SPIN_SOURCE_AND_HEADLESS_PATH_UNPROVEN'],
      ['model-lifestyle-media', 'generate-media', 'MODELIZE_CREDITS_EXHAUSTED_AND_MEDIA_APPROVALS_MISSING'],
      ['shopify-local-automation', 'activate-flow', 'SHOPIFY_FLOW_INACTIVE_AND_ACTIVATION_UNAPPROVED'],
      ['pod-bulk-workflow', 'create-draft-job', 'MYDESIGNS_PERMISSION_AND_SELECTION_UNAPPROVED'],
      ['trend-research-input', 'read-trends', 'TREND_RESEARCH_SCOPE_AND_COST_UNAPPROVED'],
    ]) {
      expect(discoverCapability(registry, capability, operation)).toMatchObject({
        status: 'human_required',
        callableSurface: 'unverified',
        reason,
      });
    }
  });

  it('requires the exact operation even on a verified capability', () => {
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'cross-lane-orchestration',
      'publish'
    );
    expect(decision.status).toBe('human_required');
    expect(decision.reason).toBe('CAPABILITY_OPERATION_UNVERIFIED');
  });

  it('returns an exact blocker for an unregistered capability', () => {
    const decision = discoverCapability(getCapabilityRegistry(), 'unknown-worker', 'read');
    expect(decision).toMatchObject({
      status: 'unavailable',
      reason: 'CAPABILITY_NOT_REGISTERED',
      blocker: { code: 'CAPABILITY_NOT_REGISTERED' },
    });
  });

  it('detects duplicate capability entries', () => {
    const registry = getCapabilityRegistry();
    registry.capabilities.push(structuredClone(registry.capabilities[0]));
    expect(validateCapabilityRegistry(registry)).toContain(
      'duplicate capability shopify-storefront-product-read'
    );
  });

  it('requires durable evidence before external access can be marked verified', () => {
    const registry = getCapabilityRegistry();
    const productRead = registry.capabilities.find(
      item => item.capability === 'shopify-storefront-product-read'
    );
    productRead.accessState = 'read_only_verified';
    productRead.callableSurface = 'shopify_storefront';
    productRead.allowedOperations = ['product-read'];
    productRead.blocker = null;
    productRead.evidenceRef = null;
    productRead.observedAt = null;

    expect(validateCapabilityRegistry(registry)).toContain(
      'shopify-storefront-product-read has verified external access without evidenceRef'
    );
    expect(validateCapabilityRegistry(registry)).toContain(
      'shopify-storefront-product-read has verified external access without observedAt'
    );
    productRead.evidenceRef = 'evidence/shopify-storefront-read-001';
    productRead.observedAt = '2026-08-14';
    expect(validateCapabilityRegistry(registry)).not.toContain(
      'shopify-storefront-product-read has verified external access without evidenceRef'
    );
  });

  it('rejects any write-test entry that masquerades as operational authority', () => {
    const registry = getCapabilityRegistry();
    const cart = registry.capabilities.find(item => item.capability === 'shopify-storefront-cart');
    cart.allowedOperations = ['cart-write'];
    cart.requiresApproval = [];
    cart.blocker = null;
    expect(validateCapabilityRegistry(registry)).toEqual(expect.arrayContaining([
      'shopify-storefront-cart exposes a write test as an operational write',
      'shopify-storefront-cart lacks activation approvals for write-test evidence',
      'shopify-storefront-cart lacks an operational blocker for write-test evidence',
    ]));
  });
});

import { describe, expect, it } from 'vitest';
import {
  discoverCapability,
  getCapabilityRegistry,
  validateCapabilityRegistry,
} from '../apps/web/src/lib/orchestration/capability-registry';

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

  it('discovers the live no-order-verified Shopify cart surface', () => {
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'shopify-storefront-cart',
      'cart-write'
    );
    expect(decision).toMatchObject({
      status: 'ready',
      adapter: 'shopify-storefront-cart',
      callableSurface: 'shopify_storefront',
      evidenceRef:
        'test_reports/cp-hoodie-production-activation-2026-08-04/report.md',
      reason: null,
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
      evidenceRef:
        'test_reports/cp-hoodie-production-activation-2026-08-04/storefront-observation.json',
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
    expect(
      discoverCapability(
        getCapabilityRegistry(),
        'shopify-storefront-variant-resolver',
        'cart-write'
      ).status
    ).toBe('human_required');
  });

  it('keeps OTP-gated app workers registered but non-callable', () => {
    const registry = getCapabilityRegistry();
    for (const [capability, operation] of [
      ['pod-bulk-workflow', 'create-draft-job'],
      ['trend-research-input', 'read-trends'],
    ]) {
      expect(discoverCapability(registry, capability, operation)).toMatchObject(
        {
          status: 'human_required',
          callableSurface: 'unverified',
          reason: 'SHOPIFY_AUTHENTICATED_SESSION_REQUIRED',
        }
      );
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
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'unknown-worker',
      'read'
    );
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
      (item) => item.capability === 'shopify-storefront-product-read'
    );
    productRead.accessState = 'read_only_verified';
    productRead.callableSurface = 'shopify_storefront';
    productRead.allowedOperations = ['product-read'];
    productRead.blocker = null;
    productRead.evidenceRef = null;

    expect(validateCapabilityRegistry(registry)).toContain(
      'shopify-storefront-product-read has verified external access without evidenceRef'
    );
    productRead.evidenceRef = 'evidence/shopify-storefront-read-001';
    expect(validateCapabilityRegistry(registry)).not.toContain(
      'shopify-storefront-product-read has verified external access without evidenceRef'
    );
  });
});

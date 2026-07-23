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

  it('does not treat a selected Shopify adapter as verified cart access', () => {
    const decision = discoverCapability(
      getCapabilityRegistry(),
      'shopify-storefront-cart',
      'cart-write'
    );
    expect(decision).toMatchObject({
      status: 'human_required',
      adapter: 'shopify-storefront-cart',
      callableSurface: 'unverified',
      reason: 'SHOPIFY_AUTHENTICATED_SESSION_REQUIRED',
    });
  });

  it('keeps OTP-gated app workers registered but non-callable', () => {
    const registry = getCapabilityRegistry();
    for (const [capability, operation] of [
      ['pod-bulk-workflow', 'create-draft-job'],
      ['trend-research-input', 'read-trends'],
    ]) {
      expect(discoverCapability(registry, capability, operation)).toMatchObject({
        status: 'human_required',
        callableSurface: 'unverified',
        reason: 'SHOPIFY_AUTHENTICATED_SESSION_REQUIRED',
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
      'duplicate capability shopify-storefront-cart'
    );
  });
});

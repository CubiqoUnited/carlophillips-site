import { describe, expect, it } from 'vitest';
import release from '../releases/cp-signature-hoodie-2026-001/release.json';
import run from '../runs/cp-hoodie-local-sim-001/run.json';
import registry from '../config/capability-registry.json';
import readiness from '../config/end-to-end-capability-map.json';
import {
  classifyFreshness,
  deriveEvidenceReconciliation,
} from '../lib/admin/evidence-reconciliation';

describe('canonical evidence reconciliation', () => {
  const model = deriveEvidenceReconciliation({
    release,
    run,
    registry,
    readiness,
    asOfDate: '2026-08-14',
  });

  it('is deterministic and classifies mutable evidence against an explicit date', () => {
    expect(deriveEvidenceReconciliation({ release, run, registry, readiness, asOfDate: '2026-08-14' }))
      .toEqual(model);
    expect(classifyFreshness('2026-08-04', '2026-08-14')).toEqual({ status: 'stale', ageDays: 10 });
    expect(classifyFreshness(null, '2026-08-14')).toEqual({ status: 'not_recorded', ageDays: null });
  });

  it('supersedes the old login blocker without claiming the later evidence is current authority', () => {
    expect(model.records.find(record => record.id === 'shopify-session-access')).toMatchObject({
      classification: 'superseded',
      freshness: 'stale',
      operationalAuthority: 'blocked',
      issueCode: 'STALE_AUTH_BLOCKER_SUPERSEDED',
      conflict: true,
    });
    expect(model.runRows.find(item => item.id === 'shopify-live-readonly-audit')).toMatchObject({
      sourceStatus: 'human_required',
      evidenceState: 'superseded',
    });
  });

  it('keeps the no-order cart test historical, technical-only, and blocked', () => {
    expect(model.records.find(record => record.id === 'shopify-cart-test')).toMatchObject({
      classification: 'historical',
      freshness: 'stale',
      technicalAccess: 'No-order write test observed',
      operationalAuthority: 'blocked',
      issueCode: 'CART_ACTIVATION_AUTHORITY_REQUIRED',
    });
    expect(model.capabilityRows.find(item => item.id === 'shopify-storefront-cart')).toMatchObject({
      technicalAccess: 'write_test_verified',
      evidenceClass: 'historical',
      operationalAuthority: 'blocked',
      blockingDependency: 'CART_ACTIVATION_AUTHORITY_REQUIRED',
    });
  });

  it('keeps a Draft release unbound and never operationally ready', () => {
    expect(release.state).toBe('draft');
    expect(model.records.find(record => record.id === 'release-observation-binding')).toMatchObject({
      classification: 'missing',
      operationalAuthority: 'blocked',
      issueCode: 'CURRENT_OBSERVATION_NOT_RELEASE_BOUND',
      finding: '3 canonical Shopify fingerprints are missing from the Draft release.',
    });
    expect(model.status).not.toBe('ready');
  });

  it('reports static run history instead of inventing an append-only audit chain', () => {
    expect(model.records.find(record => record.id === 'operational-audit-chain')).toMatchObject({
      classification: 'conflicting',
      operationalAuthority: 'not_implemented',
      issueCode: 'DURABLE_AUDIT_STORE_UNSELECTED',
    });
    expect(model.audit).toEqual({
      source: 'historical_pipeline_run_projection',
      durable: false,
      hashChained: false,
      status: 'not_implemented',
      issueCode: 'DURABLE_AUDIT_STORE_UNSELECTED',
    });
  });

  it('projects no raw provider references, evidence paths, or identifiers', () => {
    const serialized = JSON.stringify(model);
    expect(serialized).not.toContain(release.shopify.productReference);
    expect(serialized).not.toContain(release.fulfillmentMappings[0].providerProductId);
    expect(serialized).not.toContain('evidenceRef');
    expect(serialized).not.toContain('idempotencyKey');
  });
});

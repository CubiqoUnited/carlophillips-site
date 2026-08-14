import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import release from '../releases/cp-signature-hoodie-2026-001/release.json';
import mediaManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import run from '../runs/cp-hoodie-local-sim-001/run.json';
import registry from '../config/capability-registry.json';
import authorities from '../config/production-authorities.json';
import readiness from '../config/end-to-end-capability-map.json';
import adminCommandSchema from '../contracts/admin-command.schema.json';
import operationalEventSchema from '../contracts/operational-event.schema.json';
import readinessSchema from '../contracts/end-to-end-capability-map.schema.json';
import { evaluateAdminAccess } from '../lib/admin/access-policy';
import { adminSections, deriveAdminControlPlane } from '../lib/admin/control-plane';

const validToken = 'cp-local-review-token-is-at-least-32-characters';
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

describe('local read-only admin access', () => {
  it('denies absent, disabled, short-token, malformed, and external requests', () => {
    const base = { authorization: `Bearer ${validToken}`, expectedToken: validToken, reviewEnabled: true, runtimeSurface: 'local' };
    expect(evaluateAdminAccess({ ...base, authorization: null }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, reviewEnabled: false }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, expectedToken: 'short' }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, authorization: `Basic ${validToken}` }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, runtimeSurface: 'vercel-preview' }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, runtimeSurface: 'vercel-production' }).allowed).toBe(false);
  });

  it('allows only the exact configured local bearer token', () => {
    expect(evaluateAdminAccess({ authorization: `Bearer ${validToken}`, expectedToken: validToken, reviewEnabled: true, runtimeSurface: 'local' }))
      .toEqual({ allowed: true, reason: 'local_read_only_review' });
    expect(evaluateAdminAccess({ authorization: `Bearer ${validToken}x`, expectedToken: validToken, reviewEnabled: true, runtimeSurface: 'local' }).allowed).toBe(false);
  });
});

describe('admin operational projection', () => {
  const model = deriveAdminControlPlane({ release, mediaManifest, run, registry, authorities, readiness });

  it('covers the complete protected information architecture', () => {
    expect(adminSections.map(section => section.id)).toEqual([
      'overview', 'drops', 'runs', 'products', 'media', 'releases', 'approvals', 'publication', 'orders', 'post-sale', 'analytics', 'capabilities', 'audit',
    ]);
  });

  it('validates the readiness index and reviewed command/event foundations', () => {
    expect(ajv.validate(readinessSchema, readiness), ajv.errorsText()).toBe(true);
    expect(new Set(readiness.stages.map(stage => stage.id)).size).toBe(readiness.stages.length);

    const command = {
      schemaVersion: 'cp.admin-command.v1',
      commandId: 'cmd-test-001',
      idempotencyKey: 'cmd-test-001:attempt-1',
      actor: { subject: 'operator-test', role: 'operator' },
      environment: 'preview',
      capability: 'shopify-storefront-product-read',
      operation: 'observe-product',
      target: { type: 'release', reference: 'cp-test-001', fingerprint: `sha256:${'a'.repeat(64)}` },
      authority: { approvalRefs: [], evidenceRefs: ['evidence/request-001'] },
      sideEffect: { kind: 'read', cost: null, currency: null, reversible: true, rollbackRef: null },
      status: 'pending',
      createdAt: '2026-08-14T16:00:00Z',
      expiresAt: '2026-08-14T17:00:00Z',
    };
    expect(ajv.validate(adminCommandSchema, command), ajv.errorsText()).toBe(true);

    const event = {
      schemaVersion: 'cp.operational-event.v1',
      eventId: 'evt-test-001',
      aggregateType: 'release',
      aggregateReference: 'cp-test-001',
      eventType: 'product-observation-requested',
      status: 'attempted',
      environment: 'preview',
      actor: { type: 'human', reference: 'operator-test' },
      occurredAt: '2026-08-14T16:00:00Z',
      recordedAt: '2026-08-14T16:00:01Z',
      commandId: 'cmd-test-001',
      evidenceRefs: ['evidence/request-001'],
      dataClassification: 'internal',
      previousEventHash: null,
      eventHash: `sha256:${'b'.repeat(64)}`,
    };
    expect(ajv.validate(operationalEventSchema, event), ajv.errorsText()).toBe(true);
  });

  it('reports canonical Draft truth and does not synthesize release readiness', () => {
    expect(model.release.state).toBe('draft');
    expect(model.meta.authoritative).toBe(false);
    expect(model.metrics.openStages).toBe(model.metrics.stages);
    expect(model.metrics.boundMedia).toBe(0);
    expect(model.blockers.find(blocker => blocker.stageId === 'cart-checkout')?.code).toBe('CHECKOUT_AUTHORITY_NOT_RELEASE_BOUND');
  });

  it('does not project raw Shopify or POD references', () => {
    const serialized = JSON.stringify(model);
    expect(serialized).not.toContain(release.shopify.productReference);
    expect(serialized).not.toContain(release.fulfillmentMappings[0].providerProductId);
    expect(serialized).not.toContain('idempotencyKey');
  });

  it('keeps every open stage actionable and owned', () => {
    for (const blocker of model.blockers) {
      expect(blocker.owner).toBeTruthy();
      expect(blocker.code).toBeTruthy();
      expect(blocker.humanAction).toBeTruthy();
      expect(blocker.resumePoint).toBeTruthy();
    }
  });

  it('keeps admin private, dynamic, read-only, and out of customer navigation', () => {
    const route = readFileSync('app/admin/[[...section]]/page.js', 'utf8');
    const layout = readFileSync('app/admin/layout.js', 'utf8');
    const component = readFileSync('components/admin/control-plane.jsx', 'utf8');
    const customerSources = [
      'app/page.js',
      'components/storefront/home-storefront.jsx',
      'components/storefront/storefront-header.jsx',
    ].map(path => readFileSync(path, 'utf8')).join('\n');

    expect(route).toContain("dynamic = 'force-dynamic'");
    expect(route.indexOf('requireLocalAdminAccess')).toBeLessThan(route.indexOf('loadAdminControlPlane'));
    expect(layout).toContain('index: false');
    expect(component).not.toMatch(/<button|<form|onClick|action=/);
    expect(customerSources).not.toContain('/admin');
  });
});

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
import { evaluateAdminAccess, resolveAdminRuntimeSurface } from '../lib/admin/access-policy';
import { adminSections, deriveAdminControlPlane } from '../lib/admin/control-plane';

const validToken = 'cp-local-review-token-is-at-least-32-characters';
const validOwnerToken = 'cp-product-owner-token-is-distinct-and-at-least-32-characters';
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

describe('local read-only admin access', () => {
  it('denies absent, disabled, short-token, malformed, and external requests', () => {
    const base = { authorization: `Bearer ${validToken}`, expectedToken: validToken, expectedProductOwnerToken: validOwnerToken, reviewEnabled: true, runtimeSurface: 'local' };
    expect(evaluateAdminAccess({ ...base, authorization: null }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, reviewEnabled: false }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, expectedToken: 'short' }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, authorization: `Basic ${validToken}` }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, runtimeSurface: 'vercel-preview' }).allowed).toBe(false);
    expect(evaluateAdminAccess({ ...base, runtimeSurface: 'vercel-production' }).allowed).toBe(false);
  });

  it('allows only the exact configured local bearer token', () => {
    const base = { expectedToken: validToken, expectedProductOwnerToken: validOwnerToken, reviewEnabled: true, runtimeSurface: 'local' };
    expect(evaluateAdminAccess({ ...base, authorization: `Bearer ${validToken}` }))
      .toEqual({ allowed: true, reason: 'local_read_only_review', role: 'reviewer' });
    expect(evaluateAdminAccess({ ...base, authorization: `Bearer ${validToken}x` }).allowed).toBe(false);
  });

  it('requires a distinct Product Owner credential and denies every non-local surface', () => {
    const base = { authorization: `Bearer ${validOwnerToken}`, expectedToken: validToken, expectedProductOwnerToken: validOwnerToken, reviewEnabled: true, runtimeSurface: 'local', requiredRole: 'product_owner' };
    expect(evaluateAdminAccess(base)).toEqual({ allowed: true, reason: 'local_product_owner_review', role: 'product_owner' });
    expect(evaluateAdminAccess({ ...base, authorization: `Bearer ${validToken}` })).toMatchObject({ allowed: false, reason: 'product_owner_required' });
    expect(evaluateAdminAccess({ ...base, expectedProductOwnerToken: validToken })).toMatchObject({ allowed: false, reason: 'role_tokens_must_be_distinct' });
    for (const runtimeSurface of ['vercel-preview', 'vercel-production', 'commerce-preview', 'commerce-production', 'commerce-unconfigured']) {
      expect(evaluateAdminAccess({ ...base, runtimeSurface }).allowed, runtimeSurface).toBe(false);
    }
    expect(resolveAdminRuntimeSurface({ vercelEnvironment: null, commerceEnvironment: 'production' })).toBe('commerce-production');
    expect(resolveAdminRuntimeSurface({ vercelEnvironment: 'preview', commerceEnvironment: 'local' })).toBe('vercel-preview');
  });
});

describe('admin operational projection', () => {
  const model = deriveAdminControlPlane({ release, mediaManifest, run, registry, authorities, readiness });

  it('covers the complete protected information architecture', () => {
    expect(adminSections.map(section => section.id)).toEqual([
      'overview', 'evidence', 'theme', 'drops', 'runs', 'products', 'media', 'releases', 'approvals', 'publication', 'orders', 'post-sale', 'analytics', 'capabilities', 'audit',
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
    expect(model.metrics.evidenceConflicts).toBeGreaterThan(0);
    expect(model.blockers.find(blocker => blocker.stageId === 'cart-checkout')?.code).toBe('CHECKOUT_AUTHORITY_NOT_RELEASE_BOUND');
  });

  it('labels audit and lifecycle projections without inventing durable operations', () => {
    expect(adminSections.find(section => section.id === 'audit')?.description)
      .toContain('durable hash-chained audit is not implemented');
    expect(model.audit).toMatchObject({ durable: false, hashChained: false, status: 'not_implemented' });
    expect(model.lifecycle.orders.title).toBe('No controlled order exists.');
    expect(model.lifecycle.postSale.title).toBe('No post-sale case exists.');
    expect(model.lifecycle.analytics.title).toBe('No approved analytics ledger exists.');
    expect(model.lifecycle).toMatchObject({
      authoritative: false,
      source: 'no_controlled_order_observed',
      orders: { rows: [] },
      postSale: { rows: [] },
      analytics: { rows: [] },
    });
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
    const editor = readFileSync('components/admin/theme-editor.jsx', 'utf8');
    const customerSources = [
      'app/page.js',
      'components/storefront/home-storefront.jsx',
      'components/storefront/storefront-header.jsx',
    ].map(path => readFileSync(path, 'utf8')).join('\n');

    expect(route).toContain("dynamic = 'force-dynamic'");
    expect(route.indexOf('requireLocalAdminAccess')).toBeLessThan(route.indexOf('loadAdminControlPlane'));
    expect(layout).toContain('index: false');
    expect(component).not.toMatch(/<button|<form|onClick|action=/);
    expect(component).toContain("section.id !== 'theme' || viewerRole === 'product_owner'");
    expect(route).toContain("activeSection === 'theme' ? 'product_owner' : null");
    expect(editor).toContain('Exactly four token values. No layout changes.');
    expect(editor).toContain('Save branch proposal');
    expect(editor).toContain('local, uncommitted repository proposal');
    expect(editor).toContain('THEME_REVISION_STALE');
    expect(customerSources).not.toContain('/admin');
  });
});

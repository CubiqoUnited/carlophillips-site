import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import registry from '../config/capability-registry.json';
import decisionSchema from '../contracts/admin-command-decision.schema.json';
import {
  evaluateAdminCommand,
  fingerprintAdminCommand,
} from '../lib/admin/command-policy';

const now = new Date('2026-08-14T16:00:00.000Z');
const fp = (character) => `sha256:${character.repeat(64)}`;
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validateDecision = ajv.compile(decisionSchema);

function command(overrides = {}) {
  return {
    schemaVersion: 'cp.admin-command.v1',
    commandId: 'cmd-local-policy-001',
    idempotencyKey: 'idem:local-policy:001',
    actor: { subject: 'subject:product-owner:001', role: 'product_owner' },
    environment: 'local',
    capability: 'admin-command-authorizer',
    operation: 'evaluate-reviewed-command',
    target: {
      type: 'release',
      reference: 'cp-release-reference-hidden',
      fingerprint: fp('a'),
    },
    authority: {
      approvalRefs: [],
      evidenceRefs: ['evidence:command-envelope:001'],
    },
    sideEffect: {
      kind: 'none',
      cost: null,
      currency: null,
      reversible: true,
      rollbackRef: null,
    },
    status: 'approved',
    createdAt: '2026-08-14T15:55:00.000Z',
    expiresAt: '2026-08-14T16:05:00.000Z',
    ...overrides,
  };
}

function context(candidate, overrides = {}) {
  const commandFingerprint = fingerprintAdminCommand(candidate);
  return {
    now,
    registry,
    identity: {
      authenticated: true,
      subject: candidate.actor.subject,
      role: candidate.actor.role,
      sessionFingerprint: fp('b'),
    },
    roleGrants: [
      {
        status: 'active',
        role: candidate.actor.role,
        capability: candidate.capability,
        operation: candidate.operation,
        environments: [candidate.environment],
        sideEffects: [candidate.sideEffect.kind],
        targetTypes: [candidate.target.type],
        grantFingerprint: fp('c'),
        expiresAt: '2026-08-14T16:10:00.000Z',
      },
    ],
    targetBinding: {
      type: candidate.target.type,
      fingerprint: candidate.target.fingerprint,
      environment: candidate.environment,
    },
    approvalRecords: [],
    idempotency: {
      status: 'fresh',
      idempotencyKey: candidate.idempotencyKey,
      commandFingerprint,
      claimFingerprint: fp('d'),
      expiresAt: '2026-08-14T16:10:00.000Z',
    },
    auditDecision: {
      status: 'ready',
      environment: candidate.environment,
      commandFingerprint,
      evidenceFingerprint: fp('e'),
      expiresAt: '2026-08-14T16:10:00.000Z',
    },
    connectorDecision: null,
    maxCost: null,
    ...overrides,
  };
}

function decisionFor(candidate, overrides = {}) {
  return evaluateAdminCommand(candidate, context(candidate, overrides));
}

describe('admin command policy', () => {
  it('authorizes only a fully bound local no-side-effect policy evaluation', () => {
    const candidate = command();
    const decision = decisionFor(candidate);
    expect(decision).toMatchObject({
      decision: 'authorized',
      reasonCodes: [],
      commandExecutionAuthorized: true,
      connectorInvocationPerformed: false,
      externalMutationPerformed: false,
      releaseAuthority: false,
      checkoutAuthority: false,
      refundAuthority: false,
      publicationAuthority: false,
    });
    expect(
      validateDecision(decision),
      ajv.errorsText(validateDecision.errors)
    ).toBe(true);
    expect(JSON.stringify(decision)).not.toContain(candidate.actor.subject);
    expect(JSON.stringify(decision)).not.toContain(candidate.target.reference);
  });

  it('is deterministic across object key order', () => {
    const first = command();
    const second = Object.fromEntries(Object.entries(first).reverse());
    expect(fingerprintAdminCommand(first)).toBe(
      fingerprintAdminCommand(second)
    );
  });

  it('denies malformed, pending, expired, premature, and overlong commands', () => {
    const invalid = evaluateAdminCommand(null, { now, registry });
    expect(invalid.reasonCodes).toContain('COMMAND_CONTRACT_INVALID');
    expect(
      validateDecision(invalid),
      ajv.errorsText(validateDecision.errors)
    ).toBe(true);

    for (const [candidate, code] of [
      [
        { ...command(), unreviewedPayload: { secret: 'must-not-pass' } },
        'COMMAND_CONTRACT_INVALID',
      ],
      [command({ status: 'pending' }), 'COMMAND_STATUS_NOT_APPROVED'],
      [command({ expiresAt: '2026-08-14T15:59:00.000Z' }), 'COMMAND_EXPIRED'],
      [
        command({ createdAt: '2026-08-14T16:01:00.000Z' }),
        'COMMAND_NOT_YET_VALID',
      ],
      [
        command({ expiresAt: '2026-08-14T17:01:00.000Z' }),
        'COMMAND_TTL_EXCEEDED',
      ],
    ]) {
      expect(decisionFor(candidate).reasonCodes).toContain(code);
    }
  });

  it('denies unauthenticated, mismatched, or ungranted actors', () => {
    const candidate = command();
    expect(decisionFor(candidate, { identity: null }).reasonCodes).toEqual(
      expect.arrayContaining([
        'IDENTITY_NOT_AUTHENTICATED',
        'ACTOR_IDENTITY_MISMATCH',
      ])
    );
    expect(
      decisionFor(candidate, {
        identity: {
          ...context(candidate).identity,
          subject: 'subject:someone-else',
        },
      }).reasonCodes
    ).toContain('ACTOR_IDENTITY_MISMATCH');
    expect(decisionFor(candidate, { roleGrants: [] }).reasonCodes).toContain(
      'ROLE_GRANT_MISSING'
    );
  });

  it('denies missing capability, unregistered operation, blocked capability, and write-test evidence', () => {
    const missing = command({ capability: 'not-registered' });
    expect(decisionFor(missing).reasonCodes).toContain(
      'CAPABILITY_NOT_REGISTERED'
    );

    const wrongOperation = command({ operation: 'invoke-connector' });
    expect(decisionFor(wrongOperation).reasonCodes).toContain(
      'OPERATION_NOT_ALLOWED'
    );

    const cart = command({
      environment: 'production',
      capability: 'shopify-storefront-cart',
      operation: 'cart-write-test',
      sideEffect: {
        kind: 'write',
        cost: null,
        currency: null,
        reversible: true,
        rollbackRef: 'rollback:test-cart',
      },
    });
    expect(decisionFor(cart).reasonCodes).toEqual(
      expect.arrayContaining([
        'CAPABILITY_BLOCKED',
        'CAPABILITY_NOT_OPERATIONAL',
        'CONNECTOR_NOT_READY',
      ])
    );
  });

  it('denies target, evidence, idempotency, and audit gaps independently', () => {
    const candidate = command();
    expect(
      decisionFor(candidate, { targetBinding: null }).reasonCodes
    ).toContain('TARGET_BINDING_MISMATCH');
    const noEvidence = command({
      authority: { approvalRefs: [], evidenceRefs: [] },
    });
    expect(decisionFor(noEvidence).reasonCodes).toContain('EVIDENCE_REQUIRED');
    expect(decisionFor(candidate, { idempotency: null }).reasonCodes).toContain(
      'IDEMPOTENCY_UNAVAILABLE'
    );
    expect(
      decisionFor(candidate, { idempotency: { status: 'replay' } }).reasonCodes
    ).toContain('IDEMPOTENCY_REPLAYED');
    expect(
      decisionFor(candidate, { idempotency: { status: 'conflict' } })
        .reasonCodes
    ).toContain('IDEMPOTENCY_CONFLICT');
    expect(
      decisionFor(candidate, { auditDecision: null }).reasonCodes
    ).toContain('AUDIT_NOT_READY');
  });

  it('requires a fresh exact connector decision for every non-local operation', () => {
    const read = command({
      environment: 'preview',
      capability: 'shopify-storefront-product-read',
      operation: 'product-read',
      sideEffect: {
        kind: 'read',
        cost: null,
        currency: null,
        reversible: true,
        rollbackRef: null,
      },
    });
    expect(decisionFor(read).reasonCodes).toContain('CONNECTOR_NOT_READY');
    const ready = {
      status: 'ready',
      capability: read.capability,
      operation: read.operation,
      environment: read.environment,
      callableSurface: 'shopify_storefront',
      targetFingerprint: read.target.fingerprint,
      evidenceFingerprint: fp('f'),
      expiresAt: '2026-08-14T16:10:00.000Z',
    };
    expect(
      decisionFor(read, { connectorDecision: ready }).reasonCodes
    ).not.toContain('CONNECTOR_NOT_READY');
  });

  it('requires exact capability approvals and rejects unmatched approval references', () => {
    const cart = command({
      environment: 'production',
      capability: 'shopify-storefront-cart',
      operation: 'cart-write-test',
      authority: {
        approvalRefs: ['approval:activation'],
        evidenceRefs: ['evidence:cart'],
      },
      sideEffect: {
        kind: 'write',
        cost: null,
        currency: null,
        reversible: true,
        rollbackRef: 'rollback:cart',
      },
    });
    expect(decisionFor(cart).reasonCodes).toEqual(
      expect.arrayContaining(['APPROVAL_REQUIRED', 'APPROVAL_INVALID'])
    );
  });

  it('enforces exact spend ceilings', () => {
    const spend = command({
      sideEffect: {
        kind: 'spend',
        cost: 120,
        currency: 'USD',
        reversible: false,
        rollbackRef: null,
      },
    });
    expect(decisionFor(spend, { maxCost: 100 }).reasonCodes).toEqual(
      expect.arrayContaining([
        'CAPABILITY_NOT_OPERATIONAL',
        'COST_BOUNDARY_INVALID',
      ])
    );
  });

  it('requires a rollback reference for write, publish, and Production mutations', () => {
    const write = command({
      sideEffect: {
        kind: 'write',
        cost: null,
        currency: null,
        reversible: false,
        rollbackRef: null,
      },
    });
    expect(decisionFor(write).reasonCodes).toContain('ROLLBACK_REQUIRED');
  });

  it('requires the Product Owner for production mutation even with a role grant', () => {
    const candidate = command({
      actor: { subject: 'subject:operator:001', role: 'operator' },
      environment: 'production',
      sideEffect: {
        kind: 'write',
        cost: null,
        currency: null,
        reversible: true,
        rollbackRef: 'rollback:001',
      },
    });
    expect(decisionFor(candidate).reasonCodes).toContain(
      'PRODUCTION_OWNER_REQUIRED'
    );
  });

  it('does not let approval or connector fixtures create upstream authority', () => {
    const decision = decisionFor(command(), {
      connectorDecision: { status: 'ready' },
      approvalRecords: [{ status: 'approved' }],
    });
    expect(decision).toMatchObject({
      releaseAuthority: false,
      checkoutAuthority: false,
      refundAuthority: false,
      publicationAuthority: false,
      connectorInvocationPerformed: false,
      externalMutationPerformed: false,
    });
  });
});

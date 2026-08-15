import { createHash } from 'node:crypto';

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const ID_PATTERN = /^[a-zA-Z0-9._:-]{8,160}$/;
const ENVIRONMENTS = new Set(['local', 'preview', 'production']);
const ROLES = new Set(['product_owner', 'operator', 'reviewer', 'analyst', 'support', 'auditor']);
const SIDE_EFFECTS = new Set(['none', 'read', 'write', 'spend', 'publish', 'production']);
const MUTATING_EFFECTS = new Set(['write', 'spend', 'publish', 'production']);
const ROLLBACK_EFFECTS = new Set(['write', 'publish', 'production']);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  }
  return value === undefined ? null : value;
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

export function fingerprintAdminCommand(command) {
  return sha256(JSON.stringify(canonicalize(command)));
}

function validDate(value) {
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

function plainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, required, optional = []) {
  if (!plainObject(value)) return false;
  const keys = Object.keys(value);
  return required.every(key => keys.includes(key))
    && keys.every(key => required.includes(key) || optional.includes(key));
}

function commandContractValid(command) {
  return plainObject(command)
    && exactKeys(command, [
      'schemaVersion', 'commandId', 'idempotencyKey', 'actor', 'environment',
      'capability', 'operation', 'target', 'authority', 'sideEffect', 'status',
      'createdAt', 'expiresAt',
    ])
    && command.schemaVersion === 'cp.admin-command.v1'
    && ID_PATTERN.test(command.commandId || '')
    && ID_PATTERN.test(command.idempotencyKey || '')
    && exactKeys(command.actor, ['subject', 'role'])
    && typeof command.actor.subject === 'string'
    && command.actor.subject.length >= 8
    && ROLES.has(command.actor.role)
    && ENVIRONMENTS.has(command.environment)
    && SLUG_PATTERN.test(command.capability || '')
    && SLUG_PATTERN.test(command.operation || '')
    && exactKeys(command.target, ['type', 'reference', 'fingerprint'])
    && SLUG_PATTERN.test(command.target.type || '')
    && typeof command.target.reference === 'string'
    && command.target.reference.length >= 1
    && FINGERPRINT_PATTERN.test(command.target.fingerprint || '')
    && exactKeys(command.authority, ['approvalRefs', 'evidenceRefs'])
    && Array.isArray(command.authority.approvalRefs)
    && Array.isArray(command.authority.evidenceRefs)
    && command.authority.approvalRefs.every(value => typeof value === 'string' && value.length >= 1)
    && command.authority.evidenceRefs.every(value => typeof value === 'string' && value.length >= 1)
    && new Set(command.authority.approvalRefs).size === command.authority.approvalRefs.length
    && exactKeys(command.sideEffect, ['kind', 'cost', 'reversible', 'rollbackRef'], ['currency'])
    && SIDE_EFFECTS.has(command.sideEffect.kind)
    && (command.sideEffect.cost === null
      || (typeof command.sideEffect.cost === 'number' && Number.isFinite(command.sideEffect.cost) && command.sideEffect.cost >= 0))
    && (command.sideEffect.currency === undefined
      || command.sideEffect.currency === null
      || (typeof command.sideEffect.currency === 'string' && /^[A-Z]{3}$/.test(command.sideEffect.currency)))
    && typeof command.sideEffect.reversible === 'boolean'
    && (command.sideEffect.rollbackRef === null
      || (typeof command.sideEffect.rollbackRef === 'string' && command.sideEffect.rollbackRef.length >= 1))
    && ['draft', 'pending', 'approved', 'rejected', 'expired', 'executing', 'succeeded', 'failed', 'rolled_back'].includes(command.status)
    && validDate(command.createdAt) !== null
    && validDate(command.expiresAt) !== null;
}

function exactRoleGrant(grants, command, nowMs) {
  return grants.some(grant => plainObject(grant)
    && grant.status === 'active'
    && grant.role === command.actor.role
    && grant.capability === command.capability
    && grant.operation === command.operation
    && Array.isArray(grant.environments)
    && grant.environments.includes(command.environment)
    && Array.isArray(grant.sideEffects)
    && grant.sideEffects.includes(command.sideEffect.kind)
    && Array.isArray(grant.targetTypes)
    && grant.targetTypes.includes(command.target.type)
    && FINGERPRINT_PATTERN.test(grant.grantFingerprint || '')
    && (validDate(grant.expiresAt) || 0) >= nowMs);
}

function approvalValid(record, kind, refs, command, nowMs) {
  return plainObject(record)
    && record.kind === kind
    && refs.has(record.reference)
    && record.status === 'approved'
    && record.environment === command.environment
    && record.targetFingerprint === command.target.fingerprint
    && FINGERPRINT_PATTERN.test(record.approvalFingerprint || '')
    && (validDate(record.expiresAt) || 0) >= nowMs;
}

function connectorReady(decision, command, capability, nowMs) {
  return plainObject(decision)
    && decision.status === 'ready'
    && decision.capability === command.capability
    && decision.operation === command.operation
    && decision.environment === command.environment
    && decision.callableSurface === capability.callableSurface
    && decision.targetFingerprint === command.target.fingerprint
    && FINGERPRINT_PATTERN.test(decision.evidenceFingerprint || '')
    && (validDate(decision.expiresAt) || 0) >= nowMs;
}

function auditReady(decision, command, commandFingerprint, nowMs) {
  return plainObject(decision)
    && decision.status === 'ready'
    && decision.environment === command.environment
    && decision.commandFingerprint === commandFingerprint
    && FINGERPRINT_PATTERN.test(decision.evidenceFingerprint || '')
    && (validDate(decision.expiresAt) || 0) >= nowMs;
}

function idempotencyReason(idempotency, command, commandFingerprint, nowMs) {
  if (!plainObject(idempotency) || idempotency.status === 'unavailable') return 'IDEMPOTENCY_UNAVAILABLE';
  if (idempotency.status === 'replay') return 'IDEMPOTENCY_REPLAYED';
  if (idempotency.status === 'conflict') return 'IDEMPOTENCY_CONFLICT';
  if (idempotency.status !== 'fresh'
    || idempotency.idempotencyKey !== command.idempotencyKey
    || idempotency.commandFingerprint !== commandFingerprint
    || !FINGERPRINT_PATTERN.test(idempotency.claimFingerprint || '')
    || (validDate(idempotency.expiresAt) || 0) < nowMs) {
    return 'IDEMPOTENCY_BINDING_MISMATCH';
  }
  return null;
}

function costBoundaryValid(command, maxCost) {
  const { kind, cost, currency } = command.sideEffect;
  if (kind === 'spend') {
    return typeof cost === 'number'
      && Number.isFinite(cost)
      && cost > 0
      && typeof currency === 'string'
      && /^[A-Z]{3}$/.test(currency)
      && typeof maxCost === 'number'
      && Number.isFinite(maxCost)
      && maxCost >= cost;
  }
  return cost === null && (currency === null || currency === undefined);
}

export function evaluateAdminCommand(commandInput, context = {}) {
  const command = plainObject(commandInput) ? commandInput : {};
  const commandFingerprint = fingerprintAdminCommand(command);
  const suppliedNow = context.now instanceof Date ? context.now : new Date(context.now || Date.now());
  const nowMs = Number.isFinite(suppliedNow.getTime()) ? suppliedNow.getTime() : Date.now();
  const reasons = [];
  const deny = (condition, code) => { if (condition && code && !reasons.includes(code)) reasons.push(code); };
  const contractValid = commandContractValid(command);
  deny(!contractValid, 'COMMAND_CONTRACT_INVALID');

  const environment = ENVIRONMENTS.has(command.environment) ? command.environment : 'local';
  const capabilityName = SLUG_PATTERN.test(command.capability || '') ? command.capability : 'invalid';
  const operation = SLUG_PATTERN.test(command.operation || '') ? command.operation : 'invalid';
  const targetFingerprint = FINGERPRINT_PATTERN.test(command.target?.fingerprint || '')
    ? command.target.fingerprint
    : sha256('invalid-target');
  const actorRole = ROLES.has(command.actor?.role) ? command.actor.role : 'reviewer';
  const sideEffectKind = SIDE_EFFECTS.has(command.sideEffect?.kind) ? command.sideEffect.kind : 'none';
  const createdAtMs = validDate(command.createdAt);
  const expiresAtMs = validDate(command.expiresAt);
  const expiresAt = expiresAtMs === null ? new Date(nowMs).toISOString() : new Date(expiresAtMs).toISOString();

  if (contractValid) {
    deny(command.status !== 'approved', 'COMMAND_STATUS_NOT_APPROVED');
    deny(createdAtMs > nowMs, 'COMMAND_NOT_YET_VALID');
    deny(expiresAtMs < nowMs, 'COMMAND_EXPIRED');
    deny(expiresAtMs <= createdAtMs, 'COMMAND_TIME_RANGE_INVALID');
    const maxTtlMs = ['none', 'read'].includes(sideEffectKind) ? 60 * 60 * 1000 : 15 * 60 * 1000;
    deny(expiresAtMs - createdAtMs > maxTtlMs, 'COMMAND_TTL_EXCEEDED');

    const identity = context.identity;
    deny(!plainObject(identity) || identity.authenticated !== true || !FINGERPRINT_PATTERN.test(identity.sessionFingerprint || ''), 'IDENTITY_NOT_AUTHENTICATED');
    deny(!plainObject(identity) || identity.subject !== command.actor.subject || identity.role !== command.actor.role, 'ACTOR_IDENTITY_MISMATCH');
    deny(!exactRoleGrant(context.roleGrants || [], command, nowMs), 'ROLE_GRANT_MISSING');

    const capability = context.registry?.capabilities?.find(item => item.capability === command.capability);
    deny(!capability, 'CAPABILITY_NOT_REGISTERED');
    if (capability) {
      deny(Boolean(capability.blocker), 'CAPABILITY_BLOCKED');
      deny(!capability.allowedOperations.includes(command.operation), 'OPERATION_NOT_ALLOWED');
      if (capability.callableSurface === 'local') {
        deny(capability.accessState !== 'local_verified' || command.environment !== 'local' || sideEffectKind !== 'none', 'CAPABILITY_NOT_OPERATIONAL');
      } else if (sideEffectKind === 'read') {
        deny(!['read_only_verified', 'write_verified'].includes(capability.accessState), 'CAPABILITY_NOT_OPERATIONAL');
      } else {
        deny(capability.accessState !== 'write_verified', 'CAPABILITY_NOT_OPERATIONAL');
      }

      const refs = new Set(command.authority.approvalRefs);
      const approvals = context.approvalRecords || [];
      for (const kind of capability.requiresApproval) {
        deny(!approvals.some(record => approvalValid(record, kind, refs, command, nowMs)), 'APPROVAL_REQUIRED');
      }
      deny([...refs].some(reference => !approvals.some(record => plainObject(record)
        && record.reference === reference
        && approvalValid(record, record.kind, refs, command, nowMs))), 'APPROVAL_INVALID');

      const requiresConnector = capability.callableSurface !== 'local' || sideEffectKind !== 'none';
      deny(requiresConnector && !connectorReady(context.connectorDecision, command, capability, nowMs), 'CONNECTOR_NOT_READY');
    }

    deny(!plainObject(context.targetBinding)
      || context.targetBinding.type !== command.target.type
      || context.targetBinding.fingerprint !== command.target.fingerprint
      || context.targetBinding.environment !== command.environment, 'TARGET_BINDING_MISMATCH');
    deny(command.authority.evidenceRefs.length === 0
      || new Set(command.authority.evidenceRefs).size !== command.authority.evidenceRefs.length, 'EVIDENCE_REQUIRED');
    const idempotencyCode = idempotencyReason(context.idempotency, command, commandFingerprint, nowMs);
    deny(Boolean(idempotencyCode), idempotencyCode);
    deny(!auditReady(context.auditDecision, command, commandFingerprint, nowMs), 'AUDIT_NOT_READY');
    deny(!costBoundaryValid(command, context.maxCost), 'COST_BOUNDARY_INVALID');
    deny(ROLLBACK_EFFECTS.has(sideEffectKind)
      && (!command.sideEffect.reversible || !command.sideEffect.rollbackRef), 'ROLLBACK_REQUIRED');
    deny(command.environment === 'production'
      && MUTATING_EFFECTS.has(sideEffectKind)
      && command.actor.role !== 'product_owner', 'PRODUCTION_OWNER_REQUIRED');
  }

  const authorized = reasons.length === 0;
  return {
    schemaVersion: 'cp.admin-command-decision.v1',
    policyVersion: 'cp.admin-command-policy.v1',
    commandFingerprint,
    decision: authorized ? 'authorized' : 'denied',
    reasonCodes: reasons,
    capability: capabilityName,
    operation,
    environment,
    targetFingerprint,
    actorRole,
    sideEffectKind,
    expiresAt,
    commandExecutionAuthorized: authorized,
    connectorInvocationPerformed: false,
    externalMutationPerformed: false,
    releaseAuthority: false,
    checkoutAuthority: false,
    refundAuthority: false,
    publicationAuthority: false,
  };
}

import { createHash } from 'node:crypto';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const EVENT_TYPES = new Set([
  'payment-authorized',
  'payment-failed',
  'order-accepted',
  'order-cancelled',
  'pod-handoff-accepted',
  'pod-handoff-rejected',
  'production-started',
  'shipment-dispatched',
  'shipment-delayed',
  'delivered',
  'support-opened',
  'support-resolved',
  'return-requested',
  'return-approved',
  'return-rejected',
  'return-received',
  'refund-issued-partial',
  'refund-issued-full',
  'review-eligible',
  'reconciled',
  'reconciliation-variance',
]);
const SOURCES = new Set([
  'commerce-gateway',
  'fulfillment-gateway',
  'carrier-gateway',
  'support-gateway',
  'reconciliation-engine',
  'operator',
]);
const DETAIL_KEYS = new Set([
  'reasonCode',
  'amount',
  'trackingReferenceHash',
  'supportCaseReferenceHash',
  'varianceType',
]);
const EVENT_KEYS = new Set([
  'schemaVersion',
  'eventId',
  'idempotencyKey',
  'sequence',
  'aggregateReferenceHash',
  'binding',
  'eventType',
  'source',
  'occurredAt',
  'recordedAt',
  'authority',
  'details',
  'dataClassification',
  'previousEventHash',
  'eventHash',
]);
const BINDING_KEYS = new Set(['releaseId', 'releaseFingerprint', 'variantFingerprint', 'environment']);
const AUTHORITY_KEYS = new Set(['releaseState', 'approvalFingerprints', 'checkoutAuthorizationFingerprint', 'refundAuthorizationFingerprint']);
const FORBIDDEN_KEY = /(name|email|address|phone|customer|raw|order-?id|provider-?id)/i;

function stableSerialize(value) {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function clone(value) {
  return structuredClone(value);
}

function validHash(value) {
  return typeof value === 'string' && HASH_PATTERN.test(value);
}

function last(array) {
  return array[array.length - 1] || null;
}

export class OrderLifecycleError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OrderLifecycleError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new OrderLifecycleError(code, message);
}

function requireExactKeys(value, allowed, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !allowed.has(key) || FORBIDDEN_KEY.test(key))) {
    fail(code, 'Lifecycle data contains an unknown, raw-reference, or PII-bearing field.');
  }
}

function validateBinding(binding) {
  requireExactKeys(binding, BINDING_KEYS, 'INVALID_LIFECYCLE_BINDING');
  if (!binding
    || typeof binding.releaseId !== 'string'
    || !validHash(binding.releaseFingerprint)
    || !validHash(binding.variantFingerprint)
    || !['preview', 'production'].includes(binding.environment)) {
    fail('INVALID_LIFECYCLE_BINDING', 'Lifecycle events require an exact release, variant, and environment binding.');
  }
}

function validateSanitizedDetails(details) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    fail('INVALID_EVENT_DETAILS', 'Lifecycle event details must be a sanitized object.');
  }
  for (const key of Object.keys(details)) {
    if (!DETAIL_KEYS.has(key) || FORBIDDEN_KEY.test(key)) {
      fail('PII_OR_RAW_REFERENCE_REJECTED', `Lifecycle detail ${key} is not permitted.`);
    }
  }
  if (details.reasonCode && !/^[A-Z0-9_]{3,96}$/.test(details.reasonCode)) {
    fail('INVALID_REASON_CODE', 'Reason codes must be bounded provider-neutral tokens.');
  }
  for (const key of ['trackingReferenceHash', 'supportCaseReferenceHash']) {
    if (details[key] !== undefined && !validHash(details[key])) {
      fail('RAW_REFERENCE_REJECTED', `${key} must be an opaque SHA-256 fingerprint.`);
    }
  }
  if (details.amount && (
    typeof details.amount !== 'object'
    || Array.isArray(details.amount)
    || Object.keys(details.amount).some(key => !['amount', 'currency'].includes(key))
    || !/^(0|[1-9][0-9]*)\.[0-9]{2}$/.test(details.amount.amount)
    || !/^[A-Z]{3}$/.test(details.amount.currency)
  )) {
    fail('INVALID_MONEY', 'Lifecycle money must use a decimal amount and ISO currency.');
  }
}

function validateAuthorityShape(authority) {
  requireExactKeys(authority, AUTHORITY_KEYS, 'INVALID_EVENT_AUTHORITY');
  if (!authority
    || !['draft', 'staged', 'approved', 'released'].includes(authority.releaseState)
    || !Array.isArray(authority.approvalFingerprints)
    || authority.approvalFingerprints.some(fingerprint => !validHash(fingerprint))
    || (authority.checkoutAuthorizationFingerprint !== null && !validHash(authority.checkoutAuthorizationFingerprint))
    || (authority.refundAuthorizationFingerprint !== null && !validHash(authority.refundAuthorizationFingerprint))) {
    fail('INVALID_EVENT_AUTHORITY', 'Lifecycle event authority must contain only validated fingerprints and release state.');
  }
}

function requireSaleAuthority(event) {
  if (event.binding.environment !== 'production') {
    fail('PRODUCTION_SALE_EVENT_REQUIRED', 'Payment and order events require the exact Production binding.');
  }
  if (event.authority.releaseState !== 'released') {
    fail('RELEASED_AUTHORITY_REQUIRED', 'Payment and order events require an observed Released authority state.');
  }
  if (!validHash(event.authority.checkoutAuthorizationFingerprint)) {
    fail('CHECKOUT_AUTHORIZATION_REQUIRED', 'Payment and order events require an exact checkout authorization fingerprint.');
  }
  if (!event.authority.approvalFingerprints.length) {
    fail('CONTROLLED_ORDER_APPROVAL_REQUIRED', 'Payment and order events require exact approval evidence.');
  }
}

function requireRefundAuthority(event) {
  if (event.binding.environment !== 'production'
    || event.authority.releaseState !== 'released'
    || !validHash(event.authority.refundAuthorizationFingerprint)
    || !event.authority.approvalFingerprints.length) {
    fail('REFUND_AUTHORIZATION_REQUIRED', 'Refund events require exact refund and approval fingerprints.');
  }
}

export function computeOrderLifecycleEventHash(event) {
  const payload = clone(event);
  delete payload.eventHash;
  return `sha256:${createHash('sha256').update(stableSerialize(payload)).digest('hex')}`;
}

export function buildOrderLifecycleEvent(input) {
  const event = {
    schemaVersion: 'cp.order-lifecycle-event.v1',
    dataClassification: 'sanitized_operational',
    ...clone(input),
  };
  event.eventHash = computeOrderLifecycleEventHash(event);
  return event;
}

export function createOrderLifecycle({ aggregateReferenceHash, binding }) {
  if (!validHash(aggregateReferenceHash)) {
    fail('INVALID_AGGREGATE_REFERENCE', 'Order lifecycle aggregates require an opaque SHA-256 reference.');
  }
  validateBinding(binding);
  return {
    schemaVersion: 'cp.order-lifecycle.v1',
    aggregateReferenceHash,
    binding: clone(binding),
    state: {
      payment: 'pending',
      order: 'absent',
      fulfillment: 'not_started',
      support: 'none',
      return: 'none',
      review: 'ineligible',
      reconciliation: 'pending',
    },
    events: [],
    lastEventHash: null,
  };
}

function requireState(condition, code, message) {
  if (!condition) fail(code, message);
}

function applyTransition(aggregate, event) {
  const state = aggregate.state;
  switch (event.eventType) {
    case 'payment-authorized':
      requireSaleAuthority(event);
      requireState(state.payment === 'pending', 'INVALID_PAYMENT_TRANSITION', 'Payment can be authorized only once from pending.');
      state.payment = 'authorized';
      break;
    case 'payment-failed':
      requireSaleAuthority(event);
      requireState(state.payment === 'pending', 'INVALID_PAYMENT_TRANSITION', 'Payment failure can be recorded only from pending.');
      state.payment = 'failed';
      break;
    case 'order-accepted':
      requireSaleAuthority(event);
      requireState(state.payment === 'authorized' && state.order === 'absent', 'ORDER_REQUIRES_AUTHORIZED_PAYMENT', 'Order acceptance requires one authorized payment.');
      state.order = 'accepted';
      break;
    case 'order-cancelled':
      requireState(state.order === 'accepted' && state.fulfillment !== 'delivered', 'INVALID_ORDER_CANCELLATION', 'Only an undelivered accepted order can be cancelled.');
      state.order = 'cancelled';
      break;
    case 'pod-handoff-accepted':
      requireState(state.order === 'accepted' && state.fulfillment === 'not_started', 'INVALID_POD_HANDOFF', 'POD handoff requires an accepted order.');
      state.fulfillment = 'accepted';
      break;
    case 'pod-handoff-rejected':
      requireState(state.order === 'accepted' && state.fulfillment === 'not_started', 'INVALID_POD_HANDOFF', 'POD rejection requires an accepted order.');
      state.fulfillment = 'rejected';
      break;
    case 'production-started':
      requireState(state.fulfillment === 'accepted', 'PRODUCTION_REQUIRES_POD_ACCEPTANCE', 'Production can start only after POD acceptance.');
      state.fulfillment = 'in_production';
      break;
    case 'shipment-dispatched':
      requireState(state.fulfillment === 'in_production' && validHash(event.details.trackingReferenceHash), 'SHIPMENT_REQUIRES_TRACKING', 'Shipment requires production completion and an opaque tracking fingerprint.');
      state.fulfillment = 'shipped';
      break;
    case 'shipment-delayed':
      requireState(['shipped', 'delayed'].includes(state.fulfillment), 'INVALID_SHIPMENT_DELAY', 'A delay requires a dispatched shipment.');
      state.fulfillment = 'delayed';
      break;
    case 'delivered':
      requireState(['shipped', 'delayed'].includes(state.fulfillment), 'DELIVERY_REQUIRES_SHIPMENT', 'Delivery requires a dispatched shipment.');
      state.fulfillment = 'delivered';
      break;
    case 'support-opened':
      requireState(state.order === 'accepted' && state.support === 'none' && validHash(event.details.supportCaseReferenceHash), 'INVALID_SUPPORT_OPEN', 'Support requires an accepted order and opaque case fingerprint.');
      state.support = 'open';
      break;
    case 'support-resolved':
      requireState(state.support === 'open', 'INVALID_SUPPORT_RESOLUTION', 'Support resolution requires an open case.');
      state.support = 'resolved';
      break;
    case 'return-requested':
      requireState(state.fulfillment === 'delivered' && state.return === 'none', 'RETURN_REQUIRES_DELIVERY', 'Return requests require a delivered order.');
      state.return = 'requested';
      state.review = 'ineligible';
      break;
    case 'return-approved':
      requireState(state.return === 'requested', 'INVALID_RETURN_DECISION', 'Return approval requires a pending return request.');
      state.return = 'approved';
      break;
    case 'return-rejected':
      requireState(state.return === 'requested', 'INVALID_RETURN_DECISION', 'Return rejection requires a pending return request.');
      state.return = 'rejected';
      break;
    case 'return-received':
      requireState(state.return === 'approved', 'INVALID_RETURN_RECEIPT', 'Return receipt requires an approved return.');
      state.return = 'received';
      break;
    case 'refund-issued-partial':
      requireRefundAuthority(event);
      requireState(state.return === 'received' && ['authorized', 'refunded_partial'].includes(state.payment), 'REFUND_REQUIRES_RECEIVED_RETURN', 'Refund requires a received return and refundable payment.');
      state.payment = 'refunded_partial';
      state.review = 'ineligible';
      break;
    case 'refund-issued-full':
      requireRefundAuthority(event);
      requireState(state.return === 'received' && ['authorized', 'refunded_partial'].includes(state.payment), 'REFUND_REQUIRES_RECEIVED_RETURN', 'Full refund requires a received return and refundable payment.');
      state.payment = 'refunded_full';
      state.review = 'ineligible';
      break;
    case 'review-eligible':
      requireState(state.fulfillment === 'delivered'
        && state.support !== 'open'
        && ['none', 'rejected'].includes(state.return)
        && !['refunded_partial', 'refunded_full'].includes(state.payment), 'REVIEW_ELIGIBILITY_GATES_FAILED', 'Review eligibility requires delivered, unrefunded, non-open support/return state.');
      state.review = 'eligible';
      break;
    case 'reconciled':
      requireState(state.order !== 'absent', 'RECONCILIATION_REQUIRES_ORDER', 'Reconciliation requires an observed order.');
      state.reconciliation = 'reconciled';
      break;
    case 'reconciliation-variance':
      requireState(state.order !== 'absent' && Boolean(event.details.varianceType), 'VARIANCE_REQUIRES_ORDER_AND_TYPE', 'A reconciliation variance requires an order and bounded variance type.');
      state.reconciliation = 'variance';
      break;
    default:
      fail('UNSUPPORTED_LIFECYCLE_EVENT', `Unsupported lifecycle event: ${event.eventType}`);
  }
}

function validateEventEnvelope(aggregate, event) {
  requireExactKeys(event, EVENT_KEYS, 'INVALID_EVENT_ENVELOPE');
  if (event.schemaVersion !== 'cp.order-lifecycle-event.v1'
    || !EVENT_TYPES.has(event.eventType)
    || !SOURCES.has(event.source)
    || event.dataClassification !== 'sanitized_operational') {
    fail('INVALID_EVENT_ENVELOPE', 'Lifecycle event envelope is invalid or unsupported.');
  }
  validateBinding(event.binding);
  validateAuthorityShape(event.authority);
  validateSanitizedDetails(event.details);
  if (event.aggregateReferenceHash !== aggregate.aggregateReferenceHash
    || stableSerialize(event.binding) !== stableSerialize(aggregate.binding)) {
    fail('CROSS_AGGREGATE_EVENT_REJECTED', 'Lifecycle event does not match the exact aggregate/release/variant/environment binding.');
  }
  if (!event.eventId || !event.idempotencyKey) {
    fail('EVENT_IDENTITY_REQUIRED', 'Lifecycle events require event and idempotency identities.');
  }
  if (event.sequence !== aggregate.events.length + 1) {
    fail('EVENT_SEQUENCE_REJECTED', 'Lifecycle event sequence is stale or out of order.');
  }
  if (event.previousEventHash !== aggregate.lastEventHash) {
    fail('EVENT_CHAIN_REJECTED', 'Lifecycle event does not extend the current hash chain.');
  }
  if (!validHash(event.eventHash) || event.eventHash !== computeOrderLifecycleEventHash(event)) {
    fail('EVENT_HASH_REJECTED', 'Lifecycle event hash is missing or invalid.');
  }
  const prior = last(aggregate.events);
  if (prior && (Date.parse(event.occurredAt) < Date.parse(prior.occurredAt)
    || Date.parse(event.recordedAt) < Date.parse(prior.recordedAt))) {
    fail('OUT_OF_ORDER_EVENT_REJECTED', 'Lifecycle event timestamps are older than the current chain.');
  }
  if (!Number.isFinite(Date.parse(event.occurredAt))
    || !Number.isFinite(Date.parse(event.recordedAt))
    || Date.parse(event.recordedAt) < Date.parse(event.occurredAt)) {
    fail('INVALID_EVENT_TIME', 'Lifecycle event timestamps are invalid.');
  }
}

export function recordOrderLifecycleEvent(aggregate, event) {
  const existing = aggregate.events.find(item => item.idempotencyKey === event.idempotencyKey);
  if (existing) {
    requireExactKeys(event, EVENT_KEYS, 'INVALID_EVENT_ENVELOPE');
    validateBinding(event.binding);
    validateAuthorityShape(event.authority);
    validateSanitizedDetails(event.details);
    if (!validHash(event.eventHash)
      || event.eventHash !== computeOrderLifecycleEventHash(event)
      || stableSerialize(existing) !== stableSerialize(event)) {
      fail('IDEMPOTENCY_CONFLICT', 'Idempotency key was replayed with a different event.');
    }
    return clone(aggregate);
  }
  if (aggregate.events.some(item => item.eventId === event.eventId)) {
    fail('EVENT_ID_CONFLICT', 'Event ID was reused with a different idempotency key.');
  }

  validateEventEnvelope(aggregate, event);
  const next = clone(aggregate);
  applyTransition(next, event);
  next.events.push(clone(event));
  next.lastEventHash = event.eventHash;
  return next;
}

function eventArea(eventType) {
  if (/^(support|return|refund|review)-/.test(eventType)) return 'postSale';
  if (/^reconcil/.test(eventType)) return 'analytics';
  return 'orders';
}

function projectRows(aggregate, area) {
  return (aggregate?.events || [])
    .filter(event => eventArea(event.eventType) === area)
    .map(event => ({
      id: `event-${event.sequence}`,
      sequence: event.sequence,
      event: event.eventType,
      source: event.source,
      recordedAt: event.recordedAt,
      classification: 'sanitized_operational',
    }));
}

export function deriveOrderLifecycleAdminProjection(aggregate = null) {
  const orderRows = projectRows(aggregate, 'orders');
  const postSaleRows = projectRows(aggregate, 'postSale');
  const analyticsRows = projectRows(aggregate, 'analytics');
  const orderStatus = aggregate
    ? (aggregate.state.fulfillment !== 'not_started'
      ? aggregate.state.fulfillment
      : (aggregate.state.order !== 'absent' ? aggregate.state.order : aggregate.state.payment))
    : null;
  const postSaleStatus = aggregate
    ? (aggregate.state.return !== 'none'
      ? aggregate.state.return
      : (aggregate.state.support !== 'none'
        ? aggregate.state.support
        : (aggregate.state.review === 'eligible' ? 'eligible' : aggregate.state.payment)))
    : null;
  return {
    authoritative: false,
    source: aggregate ? 'sanitized_hash_chain_projection' : 'no_controlled_order_observed',
    orders: {
      status: orderRows.length ? orderStatus : 'missing',
      title: orderRows.length ? 'Controlled order lifecycle projection' : 'No controlled order exists.',
      detail: orderRows.length
        ? `Payment ${aggregate.state.payment}; order ${aggregate.state.order}; fulfillment ${aggregate.state.fulfillment}.`
        : 'No release-bound payment, order, POD handoff, fulfillment, shipment, delivery, or reconciliation event has been ingested.',
      rows: orderRows,
    },
    postSale: {
      status: postSaleRows.length ? postSaleStatus : 'missing',
      title: postSaleRows.length ? 'Post-sale lifecycle projection' : 'No post-sale case exists.',
      detail: postSaleRows.length
        ? `Support ${aggregate.state.support}; return ${aggregate.state.return}; review ${aggregate.state.review}; payment ${aggregate.state.payment}.`
        : 'Support, return, refund, and review eligibility have no selected owner, controlled-order record, or exercised lifecycle.',
      rows: postSaleRows,
    },
    analytics: {
      status: analyticsRows.length ? aggregate.state.reconciliation : 'blocked',
      title: analyticsRows.length ? 'Reconciliation lifecycle projection' : 'No approved analytics ledger exists.',
      detail: analyticsRows.length
        ? `Reconciliation ${aggregate.state.reconciliation}; client events grant no commerce authority.`
        : 'Provider, consent-aware event dictionary, retention, access, and Shopify reconciliation are not approved or implemented.',
      rows: analyticsRows,
    },
  };
}

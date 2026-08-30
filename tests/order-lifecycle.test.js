import { describe, expect, it } from 'vitest';
import {
  buildOrderLifecycleEvent,
  createOrderLifecycle,
  deriveOrderLifecycleAdminProjection,
  recordOrderLifecycleEvent,
} from '../lib/operations/order-lifecycle';

const hash = (character) => `sha256:${character.repeat(64)}`;
const binding = {
  releaseId: 'cp-signature-hoodie-2026-001',
  releaseFingerprint: hash('a'),
  variantFingerprint: hash('b'),
  environment: 'production',
};
const authority = {
  releaseState: 'released',
  approvalFingerprints: [hash('c')],
  checkoutAuthorizationFingerprint: hash('d'),
  refundAuthorizationFingerprint: hash('e'),
};

function create(overrides = {}) {
  return createOrderLifecycle({
    aggregateReferenceHash: hash('f'),
    binding: { ...binding, ...overrides },
  });
}

function nextEvent(aggregate, eventType, overrides = {}) {
  const sequence = aggregate.events.length + 1;
  const second = String(sequence).padStart(2, '0');
  return buildOrderLifecycleEvent({
    eventId: `evt-lifecycle-${sequence}`,
    idempotencyKey: `lifecycle:${sequence}:${eventType}`,
    sequence,
    aggregateReferenceHash: aggregate.aggregateReferenceHash,
    binding: aggregate.binding,
    eventType,
    source: 'operator',
    occurredAt: `2026-08-14T16:00:${second}Z`,
    recordedAt: `2026-08-14T16:00:${second}Z`,
    authority,
    details: {},
    previousEventHash: aggregate.lastEventHash,
    ...overrides,
  });
}

function append(aggregate, eventType, overrides = {}) {
  return recordOrderLifecycleEvent(
    aggregate,
    nextEvent(aggregate, eventType, overrides)
  );
}

function acceptedOrder() {
  let aggregate = create();
  aggregate = append(aggregate, 'payment-authorized', {
    source: 'commerce-gateway',
  });
  return append(aggregate, 'order-accepted', { source: 'commerce-gateway' });
}

function deliveredOrder() {
  let aggregate = acceptedOrder();
  aggregate = append(aggregate, 'pod-handoff-accepted', {
    source: 'fulfillment-gateway',
  });
  aggregate = append(aggregate, 'production-started', {
    source: 'fulfillment-gateway',
  });
  aggregate = append(aggregate, 'shipment-dispatched', {
    source: 'carrier-gateway',
    details: { trackingReferenceHash: hash('1') },
  });
  return append(aggregate, 'delivered', { source: 'carrier-gateway' });
}

function expectCode(action, code) {
  expect(action).toThrow(expect.objectContaining({ code }));
}

describe('provider-neutral order lifecycle', () => {
  it('reduces authorized payment through delayed delivery, review eligibility, and reconciliation', () => {
    let aggregate = acceptedOrder();
    aggregate = append(aggregate, 'pod-handoff-accepted', {
      source: 'fulfillment-gateway',
    });
    aggregate = append(aggregate, 'production-started', {
      source: 'fulfillment-gateway',
    });
    aggregate = append(aggregate, 'shipment-dispatched', {
      source: 'carrier-gateway',
      details: { trackingReferenceHash: hash('1') },
    });
    aggregate = append(aggregate, 'shipment-delayed', {
      source: 'carrier-gateway',
      details: { reasonCode: 'CARRIER_DELAY' },
    });
    aggregate = append(aggregate, 'delivered', { source: 'carrier-gateway' });
    aggregate = append(aggregate, 'review-eligible', {
      source: 'support-gateway',
    });
    aggregate = append(aggregate, 'reconciled', {
      source: 'reconciliation-engine',
    });

    expect(aggregate.state).toEqual({
      payment: 'authorized',
      order: 'accepted',
      fulfillment: 'delivered',
      support: 'none',
      return: 'none',
      review: 'eligible',
      reconciliation: 'reconciled',
    });
    expect(
      aggregate.events.every(
        (event, index) =>
          event.sequence === index + 1 &&
          event.previousEventHash ===
            (index ? aggregate.events[index - 1].eventHash : null)
      )
    ).toBe(true);
  });

  it('suppresses an exact replay but rejects an idempotency conflict', () => {
    const initial = create();
    const event = nextEvent(initial, 'payment-authorized', {
      source: 'commerce-gateway',
    });
    const once = recordOrderLifecycleEvent(initial, event);
    expect(recordOrderLifecycleEvent(once, event)).toEqual(once);

    const conflict = buildOrderLifecycleEvent({
      ...event,
      eventId: 'evt-lifecycle-conflict',
    });
    expectCode(
      () => recordOrderLifecycleEvent(once, conflict),
      'IDEMPOTENCY_CONFLICT'
    );
    expectCode(
      () =>
        recordOrderLifecycleEvent(once, {
          ...event,
          customerEmail: 'person@example.test',
        }),
      'INVALID_EVENT_ENVELOPE'
    );
  });

  it('rejects tampering, stale sequence, broken chain, reused IDs, and out-of-order time', () => {
    const initial = create();
    const firstEvent = nextEvent(initial, 'payment-authorized', {
      source: 'commerce-gateway',
    });
    const once = recordOrderLifecycleEvent(initial, firstEvent);

    expectCode(
      () =>
        recordOrderLifecycleEvent(initial, {
          ...firstEvent,
          eventHash: hash('0'),
        }),
      'EVENT_HASH_REJECTED'
    );
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          once,
          nextEvent(once, 'order-accepted', { sequence: 1 })
        ),
      'EVENT_SEQUENCE_REJECTED'
    );
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          once,
          nextEvent(once, 'order-accepted', { previousEventHash: null })
        ),
      'EVENT_CHAIN_REJECTED'
    );
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          once,
          nextEvent(once, 'order-accepted', {
            eventId: firstEvent.eventId,
            idempotencyKey: 'lifecycle:2:reused-event-id',
          })
        ),
      'EVENT_ID_CONFLICT'
    );
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          once,
          nextEvent(once, 'order-accepted', {
            occurredAt: '2026-08-14T15:59:00Z',
            recordedAt: '2026-08-14T15:59:00Z',
          })
        ),
      'OUT_OF_ORDER_EVENT_REJECTED'
    );
  });

  it('rejects cross-release, cross-variant, and cross-environment events', () => {
    const aggregate = create();
    for (const eventBinding of [
      { ...binding, releaseFingerprint: hash('9') },
      { ...binding, variantFingerprint: hash('9') },
      { ...binding, environment: 'preview' },
    ]) {
      expectCode(
        () =>
          recordOrderLifecycleEvent(
            aggregate,
            nextEvent(aggregate, 'payment-authorized', {
              binding: eventBinding,
              source: 'commerce-gateway',
            })
          ),
        'CROSS_AGGREGATE_EVENT_REJECTED'
      );
    }
  });

  it('requires exact Released, Production, checkout, and controlled-order authority', () => {
    const preview = create({ environment: 'preview' });
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          preview,
          nextEvent(preview, 'payment-authorized', {
            source: 'commerce-gateway',
          })
        ),
      'PRODUCTION_SALE_EVENT_REQUIRED'
    );

    const aggregate = create();
    for (const [authorityOverride, code] of [
      [{ releaseState: 'draft' }, 'RELEASED_AUTHORITY_REQUIRED'],
      [
        { checkoutAuthorizationFingerprint: null },
        'CHECKOUT_AUTHORIZATION_REQUIRED',
      ],
      [{ approvalFingerprints: [] }, 'CONTROLLED_ORDER_APPROVAL_REQUIRED'],
    ]) {
      expectCode(
        () =>
          recordOrderLifecycleEvent(
            aggregate,
            nextEvent(aggregate, 'payment-authorized', {
              source: 'commerce-gateway',
              authority: { ...authority, ...authorityOverride },
            })
          ),
        code
      );
    }
  });

  it.each([
    'release-approved',
    'checkout-authorized',
    'refund-approved',
    'publication-released',
  ])(
    'cannot use lifecycle event %s to create upstream authority',
    (eventType) => {
      const aggregate = create();
      expectCode(
        () =>
          recordOrderLifecycleEvent(aggregate, nextEvent(aggregate, eventType)),
        'INVALID_EVENT_ENVELOPE'
      );
    }
  );

  it('rejects PII, raw references, arbitrary fields, and malformed money', () => {
    const aggregate = create();
    for (const details of [
      { customerEmail: 'person@example.test' },
      { trackingReferenceHash: 'raw-tracking-123' },
      { amount: { amount: '12.5', currency: 'USD' } },
      { amount: { amount: '12.50', currency: 'USD', customerName: 'person' } },
    ]) {
      expect(() =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'payment-authorized', {
            source: 'commerce-gateway',
            details,
          })
        )
      ).toThrow();
    }
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'payment-authorized', {
            source: 'commerce-gateway',
            customerName: 'person',
          })
        ),
      'INVALID_EVENT_ENVELOPE'
    );
  });

  it('records payment failure but blocks order acceptance', () => {
    let aggregate = create();
    aggregate = append(aggregate, 'payment-failed', {
      source: 'commerce-gateway',
      details: { reasonCode: 'PAYMENT_DECLINED' },
    });
    expect(aggregate.state.payment).toBe('failed');
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'order-accepted', { source: 'commerce-gateway' })
        ),
      'ORDER_REQUIRES_AUTHORIZED_PAYMENT'
    );
  });

  it('records POD rejection but blocks production', () => {
    let aggregate = acceptedOrder();
    aggregate = append(aggregate, 'pod-handoff-rejected', {
      source: 'fulfillment-gateway',
      details: { reasonCode: 'MAPPING_REJECTED' },
    });
    expect(aggregate.state.fulfillment).toBe('rejected');
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'production-started', {
            source: 'fulfillment-gateway',
          })
        ),
      'PRODUCTION_REQUIRES_POD_ACCEPTANCE'
    );
  });

  it('gates review eligibility while support is open', () => {
    let aggregate = deliveredOrder();
    aggregate = append(aggregate, 'support-opened', {
      source: 'support-gateway',
      details: {
        supportCaseReferenceHash: hash('2'),
        reasonCode: 'DELIVERY_QUESTION',
      },
    });
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'review-eligible', { source: 'support-gateway' })
        ),
      'REVIEW_ELIGIBILITY_GATES_FAILED'
    );
    aggregate = append(aggregate, 'support-resolved', {
      source: 'support-gateway',
    });
    aggregate = append(aggregate, 'review-eligible', {
      source: 'support-gateway',
    });
    expect(aggregate.state).toMatchObject({
      support: 'resolved',
      review: 'eligible',
    });
  });

  it('requires a received return and exact refund authority for partial/full refunds', () => {
    let aggregate = deliveredOrder();
    aggregate = append(aggregate, 'return-requested', {
      source: 'support-gateway',
    });
    aggregate = append(aggregate, 'return-approved', { source: 'operator' });
    aggregate = append(aggregate, 'return-received', {
      source: 'fulfillment-gateway',
    });

    expectCode(
      () =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'refund-issued-partial', {
            source: 'commerce-gateway',
            authority: { ...authority, refundAuthorizationFingerprint: null },
            details: { amount: { amount: '10.00', currency: 'USD' } },
          })
        ),
      'REFUND_AUTHORIZATION_REQUIRED'
    );

    aggregate = append(aggregate, 'refund-issued-partial', {
      source: 'commerce-gateway',
      details: { amount: { amount: '10.00', currency: 'USD' } },
    });
    aggregate = append(aggregate, 'refund-issued-full', {
      source: 'commerce-gateway',
      details: { amount: { amount: '128.00', currency: 'USD' } },
    });
    expect(aggregate.state).toMatchObject({
      payment: 'refunded_full',
      return: 'received',
      review: 'ineligible',
    });
    expectCode(
      () =>
        recordOrderLifecycleEvent(
          aggregate,
          nextEvent(aggregate, 'review-eligible', { source: 'support-gateway' })
        ),
      'REVIEW_ELIGIBILITY_GATES_FAILED'
    );
  });

  it('records bounded reconciliation variance without granting commerce authority', () => {
    let aggregate = acceptedOrder();
    aggregate = append(aggregate, 'reconciliation-variance', {
      source: 'reconciliation-engine',
      details: {
        varianceType: 'amount',
        amount: { amount: '1.00', currency: 'USD' },
      },
    });
    expect(aggregate.state.reconciliation).toBe('variance');
    expect(deriveOrderLifecycleAdminProjection(aggregate).authoritative).toBe(
      false
    );
  });

  it('derives truthful empty and populated admin projections without hashes or idempotency keys', () => {
    const empty = deriveOrderLifecycleAdminProjection();
    expect(empty).toMatchObject({
      authoritative: false,
      source: 'no_controlled_order_observed',
      orders: { title: 'No controlled order exists.', rows: [] },
      postSale: { title: 'No post-sale case exists.', rows: [] },
      analytics: { title: 'No approved analytics ledger exists.', rows: [] },
    });

    let aggregate = deliveredOrder();
    aggregate = append(aggregate, 'support-opened', {
      source: 'support-gateway',
      details: { supportCaseReferenceHash: hash('2') },
    });
    aggregate = append(aggregate, 'reconciled', {
      source: 'reconciliation-engine',
    });
    const projection = deriveOrderLifecycleAdminProjection(aggregate);
    expect(projection.orders.rows.length).toBeGreaterThan(0);
    expect(projection.postSale.rows).toHaveLength(1);
    expect(projection.postSale.status).toBe('open');
    expect(projection.analytics.rows).toHaveLength(1);
    expect(JSON.stringify(projection)).not.toMatch(
      /sha256:|idempotency|aggregateReference|releaseFingerprint|variantFingerprint/
    );
  });
});

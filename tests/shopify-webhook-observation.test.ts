import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createSanitizedWebhookObservation } from '../apps/web/src/lib/commerce/shopify-webhook-observation';

const base = {
  schemaVersion: 'cp.verified-shopify-webhook.v1' as const,
  authority: 'observation-only' as const,
  webhookId: 'delivery-12345678',
  topic: 'orders/paid',
  shop: 'cp-staging.myshopify.com',
  triggeredAt: '2026-09-03T12:00:00.000Z',
  observedAt: '2026-09-03T12:00:01.000Z',
  payloadHash: `sha256:${'a'.repeat(64)}` as const,
  payload: {
    id: 123456789,
    email: 'synthetic@example.invalid',
    shipping_address: { address1: 'must not persist' },
  },
};

describe('sanitized Shopify lifecycle observations', () => {
  it('binds a signed order event to opaque shop, delivery, and order references', () => {
    const observation = createSanitizedWebhookObservation(base);
    expect(observation).toMatchObject({
      schemaVersion: 'cp.shopify-webhook-event.v2',
      dataClassification: 'sanitized_operational',
      authority: 'observation-only',
      topic: 'orders/paid',
      signatureVerified: true,
      signatureAlgorithm: 'shopify-hmac-sha256',
      lifecycleMutationAuthorized: false,
      externalActionApplied: false,
    });
    expect(observation.orderReferenceHash).toBe(
      `sha256:${createHash('sha256')
        .update('cp-staging.myshopify.com\n123456789')
        .digest('hex')}`
    );
    const serialized = JSON.stringify(observation);
    expect(serialized).not.toMatch(
      /synthetic@example|shipping_address|must not persist|123456789|delivery-12345678|cp-staging\.myshopify/
    );
  });

  it('uses the parent order for refund and fulfillment topics', () => {
    for (const topic of ['refunds/create', 'fulfillments/create']) {
      const observation = createSanitizedWebhookObservation({
        ...base,
        topic,
        payload: { id: 222, order_id: 123456789 },
      });
      expect(observation.orderReferenceHash).toBe(
        createSanitizedWebhookObservation(base).orderReferenceHash
      );
    }
  });

  it('allows a signed health probe without inventing an order reference', () => {
    expect(
      createSanitizedWebhookObservation({
        ...base,
        topic: 'orders/updated',
        payload: { probe: 'cp-webhook-health-v1' },
      }).orderReferenceHash
    ).toBeNull();
  });
});

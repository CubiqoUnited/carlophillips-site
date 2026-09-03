import { createHash } from 'node:crypto';
import type { VerifiedShopifyWebhook } from '@repo/shopify';

type JsonObject = Record<string, unknown>;

function fingerprint(value: string) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}` as const;
}

function object(value: unknown): JsonObject | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function providerOrderReference(topic: string, payload: unknown) {
  const record = object(payload);
  if (!record) return null;
  const value = topic.startsWith('orders/') ? record.id : record.order_id;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const normalized = String(value);
  return /^[0-9]+$/.test(normalized) ? normalized : null;
}

export function createSanitizedWebhookObservation(
  verified: VerifiedShopifyWebhook
) {
  const orderReference = providerOrderReference(
    verified.topic,
    verified.payload
  );
  return {
    schemaVersion: 'cp.shopify-webhook-event.v2' as const,
    dataClassification: 'sanitized_operational' as const,
    source: 'shopify-webhook' as const,
    authority: 'observation-only' as const,
    topic: verified.topic,
    shopReferenceHash: fingerprint(verified.shop),
    deliveryReferenceHash: fingerprint(
      `${verified.shop}\n${verified.webhookId}`
    ),
    orderReferenceHash: orderReference
      ? fingerprint(`${verified.shop}\n${orderReference}`)
      : null,
    triggeredAt: verified.triggeredAt,
    observedAt: verified.observedAt,
    payloadHash: verified.payloadHash,
    signatureVerified: true as const,
    signatureAlgorithm: 'shopify-hmac-sha256' as const,
    lifecycleMutationAuthorized: false as const,
    externalActionApplied: false as const,
  };
}

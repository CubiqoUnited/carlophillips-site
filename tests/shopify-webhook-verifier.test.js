import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyShopifyWebhookEnvelope } from '../lib/operations/shopify-webhook-verifier';

const secret = 'test-only-webhook-secret-value-32-chars';
const rawBody = JSON.stringify({
  id: 'raw-order-id-must-not-return',
  email: 'private@example.test',
  status: 'observed',
});
const now = new Date('2026-08-14T16:00:00.000Z');

class MemoryIdempotencyStore {
  constructor() {
    this.claims = new Map();
  }

  async claim(deliveryFingerprint, expiresAt) {
    if (this.claims.has(deliveryFingerprint)) return false;
    this.claims.set(deliveryFingerprint, expiresAt);
    return true;
  }
}

function hmac(body = rawBody) {
  return createHmac('sha256', secret).update(body).digest('base64');
}

function headers(body = rawBody, overrides = {}) {
  return {
    'x-shopify-hmac-sha256': hmac(body),
    'x-shopify-topic': 'orders/updated',
    'x-shopify-shop-domain': 'cp-test.myshopify.com',
    'x-shopify-webhook-id': 'webhook-delivery-001',
    'x-shopify-triggered-at': '2026-08-14T15:59:30.000Z',
    ...overrides,
  };
}

function options(overrides = {}) {
  return {
    rawBody,
    headers: headers(),
    secret,
    allowedTopics: new Set(['orders/updated']),
    allowedShops: new Set(['cp-test.myshopify.com']),
    idempotencyStore: new MemoryIdempotencyStore(),
    now: () => now,
    ...overrides,
  };
}

async function expectCode(promise, code) {
  await expect(promise).rejects.toMatchObject({ code });
}

describe('sanitized Shopify webhook verifier', () => {
  it('verifies exact raw bytes and returns only observation fingerprints', async () => {
    const store = new MemoryIdempotencyStore();
    const verified = await verifyShopifyWebhookEnvelope(
      options({ idempotencyStore: store })
    );
    expect(verified).toMatchObject({
      schemaVersion: 'cp.provider-webhook-verification.v1',
      status: 'verified',
      provider: 'shopify',
      authority: 'observation_only',
      topic: 'orders/updated',
      rawPayloadReturned: false,
      lifecycleMutationAuthorized: false,
      releaseAuthority: false,
      checkoutAuthority: false,
      refundAuthority: false,
      publicationAuthority: false,
    });
    expect(verified.shopFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(verified.deliveryFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(verified.payloadFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    const serialized = JSON.stringify(verified);
    expect(serialized).not.toMatch(
      /cp-test\.myshopify|webhook-delivery|private@example|raw-order-id|"payload"/
    );
    expect([...store.claims.keys()]).toEqual([verified.deliveryFingerprint]);
  });

  it('accepts a Headers object and exact Uint8Array body without changing the result contract', async () => {
    const verified = await verifyShopifyWebhookEnvelope(
      options({
        rawBody: new TextEncoder().encode(rawBody),
        headers: new Headers(headers()),
      })
    );
    expect(verified).toMatchObject({
      status: 'verified',
      rawPayloadReturned: false,
    });
  });

  it('rejects an already-claimed delivery fingerprint', async () => {
    const store = new MemoryIdempotencyStore();
    await verifyShopifyWebhookEnvelope(options({ idempotencyStore: store }));
    await expectCode(
      verifyShopifyWebhookEnvelope(options({ idempotencyStore: store })),
      'SHOPIFY_WEBHOOK_REPLAYED'
    );
  });

  it('rejects body tampering and malformed signatures', async () => {
    await expectCode(
      verifyShopifyWebhookEnvelope(options({ rawBody: `${rawBody} ` })),
      'SHOPIFY_WEBHOOK_HMAC_INVALID'
    );
    await expectCode(
      verifyShopifyWebhookEnvelope(
        options({
          headers: headers(rawBody, { 'x-shopify-hmac-sha256': 'not-base64' }),
        })
      ),
      'SHOPIFY_WEBHOOK_HMAC_INVALID'
    );
  });

  it('rejects missing or malformed required headers', async () => {
    for (const [name, value, code] of [
      ['x-shopify-webhook-id', '', 'SHOPIFY_WEBHOOK_HEADERS_MISSING'],
      ['x-shopify-triggered-at', '', 'SHOPIFY_WEBHOOK_HEADERS_MISSING'],
      ['x-shopify-webhook-id', 'short', 'SHOPIFY_WEBHOOK_DELIVERY_ID_INVALID'],
    ]) {
      await expectCode(
        verifyShopifyWebhookEnvelope(
          options({ headers: headers(rawBody, { [name]: value }) })
        ),
        code
      );
    }
  });

  it('rejects unapproved or malformed shop and topic values', async () => {
    for (const [header, value, code] of [
      [
        'x-shopify-shop-domain',
        'other.myshopify.com',
        'SHOPIFY_WEBHOOK_SHOP_DENIED',
      ],
      [
        'x-shopify-shop-domain',
        'https://cp-test.myshopify.com',
        'SHOPIFY_WEBHOOK_SHOP_DENIED',
      ],
      ['x-shopify-topic', 'orders/create', 'SHOPIFY_WEBHOOK_TOPIC_DENIED'],
      ['x-shopify-topic', '../orders/create', 'SHOPIFY_WEBHOOK_TOPIC_DENIED'],
    ]) {
      await expectCode(
        verifyShopifyWebhookEnvelope(
          options({ headers: headers(rawBody, { [header]: value }) })
        ),
        code
      );
    }
  });

  it('rejects stale, future, and invalid timestamps', async () => {
    for (const [timestamp, code] of [
      ['2026-08-14T15:50:00.000Z', 'SHOPIFY_WEBHOOK_STALE'],
      ['2026-08-14T16:02:00.000Z', 'SHOPIFY_WEBHOOK_FROM_FUTURE'],
      ['not-a-date', 'SHOPIFY_WEBHOOK_TIMESTAMP_INVALID'],
    ]) {
      await expectCode(
        verifyShopifyWebhookEnvelope(
          options({
            headers: headers(rawBody, { 'x-shopify-triggered-at': timestamp }),
          })
        ),
        code
      );
    }
  });

  it('rejects invalid JSON, empty/oversized bodies, and non-byte inputs', async () => {
    const invalidJson = '{invalid';
    await expectCode(
      verifyShopifyWebhookEnvelope(
        options({ rawBody: invalidJson, headers: headers(invalidJson) })
      ),
      'SHOPIFY_WEBHOOK_PAYLOAD_INVALID'
    );
    const empty = '';
    await expectCode(
      verifyShopifyWebhookEnvelope(
        options({ rawBody: empty, headers: headers(empty) })
      ),
      'SHOPIFY_WEBHOOK_BODY_SIZE_REJECTED'
    );
    await expectCode(
      verifyShopifyWebhookEnvelope(options({ maxBodyBytes: 16 })),
      'SHOPIFY_WEBHOOK_BODY_SIZE_REJECTED'
    );
    await expectCode(
      verifyShopifyWebhookEnvelope(options({ rawBody: { unsafe: true } })),
      'SHOPIFY_WEBHOOK_BODY_INVALID'
    );
  });

  it('fails closed for missing secret, allowlists, replay store, or invalid windows', async () => {
    for (const [override, code] of [
      [{ secret: '' }, 'SHOPIFY_WEBHOOK_SECRET_MISSING'],
      [{ allowedTopics: new Set() }, 'SHOPIFY_WEBHOOK_CONFIGURATION_INVALID'],
      [{ allowedShops: new Set() }, 'SHOPIFY_WEBHOOK_CONFIGURATION_INVALID'],
      [{ idempotencyStore: null }, 'SHOPIFY_WEBHOOK_CONFIGURATION_INVALID'],
      [{ replayWindowMs: 0 }, 'SHOPIFY_WEBHOOK_WINDOW_INVALID'],
      [{ futureToleranceMs: Number.NaN }, 'SHOPIFY_WEBHOOK_WINDOW_INVALID'],
    ]) {
      await expectCode(verifyShopifyWebhookEnvelope(options(override)), code);
    }
  });

  it('fails closed when durable replay protection errors', async () => {
    await expectCode(
      verifyShopifyWebhookEnvelope(
        options({
          idempotencyStore: {
            claim: async () => {
              throw new Error('database detail must not escape');
            },
          },
        })
      ),
      'SHOPIFY_WEBHOOK_IDEMPOTENCY_STORE_FAILED'
    );
  });
});

import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_REPLAY_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_FUTURE_TOLERANCE_MS = 60 * 1000;
const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export interface WebhookIdempotencyStore {
  claim(webhookId: string, expiresAt: Date): Promise<boolean>;
}

export interface ShopifyWebhookVerificationOptions {
  readonly rawBody: string | Uint8Array;
  readonly headers: Headers | Readonly<Record<string, string | undefined>>;
  readonly secret: string;
  readonly allowedTopics: ReadonlySet<string>;
  readonly allowedShops: ReadonlySet<string>;
  readonly idempotencyStore: WebhookIdempotencyStore;
  readonly now?: () => Date;
  readonly replayWindowMs?: number;
  readonly futureToleranceMs?: number;
}

export interface VerifiedShopifyWebhook {
  readonly schemaVersion: 'cp.verified-shopify-webhook.v1';
  readonly authority: 'observation-only';
  readonly webhookId: string;
  readonly topic: string;
  readonly shop: string;
  readonly triggeredAt: string;
  readonly observedAt: string;
  readonly payloadHash: `sha256:${string}`;
  readonly payload: unknown;
}

export interface ShopifyWebhookObservationInput {
  readonly schemaVersion: 'cp.shopify-webhook-observation-input.v1';
  readonly authority: 'observation-only';
  readonly source: 'shopify-webhook';
  readonly webhookId: string;
  readonly topic: string;
  readonly shop: string;
  readonly triggeredAt: string;
  readonly observedAt: string;
  readonly payloadHash: `sha256:${string}`;
  readonly payload: unknown;
}

export class ShopifyWebhookVerificationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ShopifyWebhookVerificationError';
    this.code = code;
  }
}

function bodyBuffer(rawBody: string | Uint8Array): Buffer {
  return typeof rawBody === 'string'
    ? Buffer.from(rawBody, 'utf8')
    : Buffer.from(rawBody);
}

function headerValue(
  headers: Headers | Readonly<Record<string, string | undefined>>,
  name: string
): string {
  if (headers instanceof Headers) return headers.get(name)?.trim() ?? '';
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value?.trim() ?? '';
  }
  return '';
}

function verifyHmac(
  body: Buffer,
  suppliedHmac: string,
  secret: string
): boolean {
  let supplied: Buffer;
  try {
    supplied = Buffer.from(suppliedHmac, 'base64');
  } catch {
    return false;
  }
  const expected = createHmac('sha256', secret).update(body).digest();
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

function positiveWindow(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value <= 0) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_WINDOW_INVALID',
      'Webhook replay configuration is invalid.'
    );
  }
  return value;
}

export async function verifyShopifyWebhook(
  options: ShopifyWebhookVerificationOptions
): Promise<VerifiedShopifyWebhook> {
  const secret = options.secret.trim();
  if (!secret) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_SECRET_MISSING',
      'Webhook verification is not configured.'
    );
  }
  const body = bodyBuffer(options.rawBody);
  const suppliedHmac = headerValue(options.headers, 'x-shopify-hmac-sha256');
  if (!suppliedHmac || !verifyHmac(body, suppliedHmac, secret)) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_HMAC_INVALID',
      'Webhook signature is invalid.'
    );
  }

  const topic = headerValue(options.headers, 'x-shopify-topic').toLowerCase();
  const shop = headerValue(
    options.headers,
    'x-shopify-shop-domain'
  ).toLowerCase();
  const webhookId = headerValue(options.headers, 'x-shopify-webhook-id');
  const triggeredAtValue = headerValue(
    options.headers,
    'x-shopify-triggered-at'
  );
  if (!topic || !shop || !webhookId || !triggeredAtValue) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_HEADERS_MISSING',
      'Required Shopify webhook headers are missing.'
    );
  }
  if (!SHOP_DOMAIN_PATTERN.test(shop) || !options.allowedShops.has(shop)) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_SHOP_DENIED',
      'Webhook shop is not allowed.'
    );
  }
  if (!options.allowedTopics.has(topic)) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_TOPIC_DENIED',
      'Webhook topic is not allowed.'
    );
  }

  const now = (options.now ?? (() => new Date()))();
  const nowMs = now.getTime();
  const triggeredAtMs = Date.parse(triggeredAtValue);
  const replayWindowMs = positiveWindow(
    options.replayWindowMs,
    DEFAULT_REPLAY_WINDOW_MS
  );
  const futureToleranceMs = positiveWindow(
    options.futureToleranceMs,
    DEFAULT_FUTURE_TOLERANCE_MS
  );
  if (!Number.isFinite(nowMs) || !Number.isFinite(triggeredAtMs)) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_TIMESTAMP_INVALID',
      'Webhook timestamp is invalid.'
    );
  }
  if (triggeredAtMs < nowMs - replayWindowMs) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_STALE',
      'Webhook is outside the accepted replay window.'
    );
  }
  if (triggeredAtMs > nowMs + futureToleranceMs) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_FROM_FUTURE',
      'Webhook timestamp is outside the accepted future tolerance.'
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body.toString('utf8')) as unknown;
  } catch {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_PAYLOAD_INVALID',
      'Webhook payload is not valid JSON.'
    );
  }

  const expiresAt = new Date(Math.max(nowMs, triggeredAtMs) + replayWindowMs);
  if (!(await options.idempotencyStore.claim(webhookId, expiresAt))) {
    throw new ShopifyWebhookVerificationError(
      'SHOPIFY_WEBHOOK_REPLAYED',
      'Webhook has already been observed.'
    );
  }

  return {
    schemaVersion: 'cp.verified-shopify-webhook.v1',
    authority: 'observation-only',
    webhookId,
    topic,
    shop,
    triggeredAt: new Date(triggeredAtMs).toISOString(),
    observedAt: now.toISOString(),
    payloadHash: `sha256:${createHash('sha256').update(body).digest('hex')}`,
    payload,
  };
}

export function createWebhookObservationInput(
  verified: VerifiedShopifyWebhook
): ShopifyWebhookObservationInput {
  return {
    schemaVersion: 'cp.shopify-webhook-observation-input.v1',
    authority: 'observation-only',
    source: 'shopify-webhook',
    webhookId: verified.webhookId,
    topic: verified.topic,
    shop: verified.shop,
    triggeredAt: verified.triggeredAt,
    observedAt: verified.observedAt,
    payloadHash: verified.payloadHash,
    payload: structuredClone(verified.payload),
  };
}

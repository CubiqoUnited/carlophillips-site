import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_REPLAY_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_FUTURE_TOLERANCE_MS = 60 * 1000;
const DEFAULT_MAX_BODY_BYTES = 1024 * 1024;
const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const TOPIC_PATTERN = /^[a-z0-9_-]+\/[a-z0-9_-]+$/;

export class ShopifyWebhookVerificationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ShopifyWebhookVerificationError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new ShopifyWebhookVerificationError(code, message);
}

function fingerprint(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function bodyBuffer(rawBody) {
  if (typeof rawBody === 'string') return Buffer.from(rawBody, 'utf8');
  if (rawBody instanceof Uint8Array) return Buffer.from(rawBody);
  fail('SHOPIFY_WEBHOOK_BODY_INVALID', 'Webhook body must be the exact raw bytes.');
}

function headerValue(headers, name) {
  if (headers instanceof Headers) return headers.get(name)?.trim() || '';
  if (!headers || typeof headers !== 'object' || Array.isArray(headers)) return '';
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return typeof value === 'string' ? value.trim() : '';
  }
  return '';
}

function positiveInteger(value, fallback, code) {
  const resolved = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(resolved) || resolved <= 0) {
    fail(code, 'Webhook verification configuration is invalid.');
  }
  return resolved;
}

function validHmac(body, suppliedHmac, secret) {
  const expected = createHmac('sha256', secret).update(body).digest();
  const supplied = Buffer.from(suppliedHmac, 'base64');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function verifyConfiguration(options) {
  if (typeof options.secret !== 'string' || options.secret.length < 16) {
    fail('SHOPIFY_WEBHOOK_SECRET_MISSING', 'Webhook verification is not configured.');
  }
  if (!(options.allowedTopics instanceof Set) || !options.allowedTopics.size
    || !(options.allowedShops instanceof Set) || !options.allowedShops.size
    || !options.idempotencyStore
    || typeof options.idempotencyStore.claim !== 'function') {
    fail('SHOPIFY_WEBHOOK_CONFIGURATION_INVALID', 'Webhook allowlists and idempotency store are required.');
  }
}

export async function verifyShopifyWebhookEnvelope(options) {
  if (!options || typeof options !== 'object') {
    fail('SHOPIFY_WEBHOOK_CONFIGURATION_INVALID', 'Webhook verification options are required.');
  }
  verifyConfiguration(options);
  const body = bodyBuffer(options.rawBody);
  const maxBodyBytes = positiveInteger(options.maxBodyBytes, DEFAULT_MAX_BODY_BYTES, 'SHOPIFY_WEBHOOK_BODY_LIMIT_INVALID');
  if (body.length < 2 || body.length > maxBodyBytes) {
    fail('SHOPIFY_WEBHOOK_BODY_SIZE_REJECTED', 'Webhook body is empty or exceeds the configured limit.');
  }

  const suppliedHmac = headerValue(options.headers, 'x-shopify-hmac-sha256');
  if (!suppliedHmac || !validHmac(body, suppliedHmac, options.secret)) {
    fail('SHOPIFY_WEBHOOK_HMAC_INVALID', 'Webhook signature is invalid.');
  }

  const topic = headerValue(options.headers, 'x-shopify-topic').toLowerCase();
  const shop = headerValue(options.headers, 'x-shopify-shop-domain').toLowerCase();
  const deliveryId = headerValue(options.headers, 'x-shopify-webhook-id');
  const triggeredAtValue = headerValue(options.headers, 'x-shopify-triggered-at');
  if (!topic || !shop || !deliveryId || !triggeredAtValue) {
    fail('SHOPIFY_WEBHOOK_HEADERS_MISSING', 'Required webhook headers are missing.');
  }
  if (!SHOP_DOMAIN_PATTERN.test(shop) || !options.allowedShops.has(shop)) {
    fail('SHOPIFY_WEBHOOK_SHOP_DENIED', 'Webhook shop is not allowed.');
  }
  if (!TOPIC_PATTERN.test(topic) || !options.allowedTopics.has(topic)) {
    fail('SHOPIFY_WEBHOOK_TOPIC_DENIED', 'Webhook topic is not allowed.');
  }
  if (!/^[a-zA-Z0-9._:-]{8,255}$/.test(deliveryId)) {
    fail('SHOPIFY_WEBHOOK_DELIVERY_ID_INVALID', 'Webhook delivery identity is invalid.');
  }

  const now = options.now ? options.now() : new Date();
  const nowMs = now instanceof Date ? now.getTime() : Number.NaN;
  const triggeredAtMs = Date.parse(triggeredAtValue);
  const replayWindowMs = positiveInteger(options.replayWindowMs, DEFAULT_REPLAY_WINDOW_MS, 'SHOPIFY_WEBHOOK_WINDOW_INVALID');
  const futureToleranceMs = positiveInteger(options.futureToleranceMs, DEFAULT_FUTURE_TOLERANCE_MS, 'SHOPIFY_WEBHOOK_WINDOW_INVALID');
  if (!Number.isFinite(nowMs) || !Number.isFinite(triggeredAtMs)) {
    fail('SHOPIFY_WEBHOOK_TIMESTAMP_INVALID', 'Webhook timestamp is invalid.');
  }
  if (triggeredAtMs < nowMs - replayWindowMs) {
    fail('SHOPIFY_WEBHOOK_STALE', 'Webhook is outside the accepted replay window.');
  }
  if (triggeredAtMs > nowMs + futureToleranceMs) {
    fail('SHOPIFY_WEBHOOK_FROM_FUTURE', 'Webhook timestamp is outside the accepted future tolerance.');
  }

  try {
    JSON.parse(body.toString('utf8'));
  } catch {
    fail('SHOPIFY_WEBHOOK_PAYLOAD_INVALID', 'Webhook payload is not valid JSON.');
  }

  const shopFingerprint = fingerprint(shop);
  const deliveryFingerprint = fingerprint(`${shop}\n${deliveryId}`);
  const payloadFingerprint = fingerprint(body);
  const expiresAt = new Date(Math.max(nowMs, triggeredAtMs) + replayWindowMs);
  let claimed;
  try {
    claimed = await options.idempotencyStore.claim(deliveryFingerprint, expiresAt);
  } catch {
    fail('SHOPIFY_WEBHOOK_IDEMPOTENCY_STORE_FAILED', 'Webhook replay protection is unavailable.');
  }
  if (claimed !== true) {
    fail('SHOPIFY_WEBHOOK_REPLAYED', 'Webhook has already been observed.');
  }

  return {
    schemaVersion: 'cp.provider-webhook-verification.v1',
    status: 'verified',
    provider: 'shopify',
    authority: 'observation_only',
    topic,
    shopFingerprint,
    deliveryFingerprint,
    payloadFingerprint,
    payloadBytes: body.length,
    triggeredAt: new Date(triggeredAtMs).toISOString(),
    observedAt: now.toISOString(),
    rawPayloadReturned: false,
    lifecycleMutationAuthorized: false,
    releaseAuthority: false,
    checkoutAuthority: false,
    refundAuthority: false,
    publicationAuthority: false,
  };
}

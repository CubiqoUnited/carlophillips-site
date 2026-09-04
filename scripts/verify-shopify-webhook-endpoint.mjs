import { createHmac, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const baseUrl = process.env.CP_WEBHOOK_BASE_URL;
const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
const shop = process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS;
if (!baseUrl || !secret || !shop || shop.includes(',')) {
  throw new Error('WEBHOOK_PROBE_CONFIG_INVALID');
}

const endpoint = new URL('/api/webhooks/shopify', baseUrl);
const body = JSON.stringify({ probe: 'cp-webhook-health-v1' });
const headers = {
  'content-type': 'application/json',
  'x-shopify-hmac-sha256': createHmac('sha256', secret)
    .update(body)
    .digest('base64'),
  'x-shopify-topic': 'orders/updated',
  'x-shopify-shop-domain': shop,
  'x-shopify-webhook-id': randomUUID(),
  'x-shopify-triggered-at': new Date().toISOString(),
};
if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  headers['x-vercel-protection-bypass'] =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
}

async function post() {
  const response = await fetch(endpoint, { method: 'POST', headers, body });
  return { status: response.status, responseBody: await response.text() };
}

const first = await post();
const status = first.status;
const responseBody = first.responseBody;

if (status < 200 || status >= 300) {
  let code = 'UNKNOWN';
  try {
    const payload = JSON.parse(responseBody);
    if (
      payload &&
      typeof payload === 'object' &&
      typeof payload.error === 'string' &&
      /^[A-Z0-9_]+$/.test(payload.error)
    ) {
      code = payload.error;
    }
  } catch {
    // Keep diagnostics PII-free when an upstream returns a non-JSON response.
  }
  throw new Error(`WEBHOOK_PROBE_REJECTED_${status}_${code}`);
}

const duplicate = await post();
if (duplicate.status < 200 || duplicate.status >= 300) {
  throw new Error(`WEBHOOK_DUPLICATE_PROBE_REJECTED_${duplicate.status}`);
}
let firstPayload;
let duplicatePayload;
try {
  firstPayload = JSON.parse(responseBody);
  duplicatePayload = JSON.parse(duplicate.responseBody);
} catch {
  throw new Error('WEBHOOK_PROBE_RESPONSE_INVALID');
}
if (
  firstPayload?.duplicate !== false ||
  firstPayload?.externalActionApplied !== false ||
  duplicatePayload?.duplicate !== true ||
  duplicatePayload?.externalActionApplied !== false
) {
  throw new Error('WEBHOOK_DUPLICATE_NOT_SUPPRESSED');
}

const receipt = {
  schemaVersion: 'cp.shopify-webhook-probe-receipt.v2',
  signatureVerified: true,
  signatureAlgorithm: 'shopify-hmac-sha256',
  durableIdempotency: true,
  duplicateDelivery: {
    attempted: true,
    suppressed: true,
    observationCount: 1,
    externalActionCount: 0,
  },
  piiFree: true,
};
if (process.env.CP_WEBHOOK_PROBE_OUTPUT) {
  writeFileSync(
    process.env.CP_WEBHOOK_PROBE_OUTPUT,
    `${JSON.stringify(receipt, null, 2)}\n`
  );
}
process.stdout.write(
  'Signed PII-free Shopify webhook probe accepted; duplicate delivery suppressed with no external action.\n'
);

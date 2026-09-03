import { createHmac, randomUUID } from 'node:crypto';

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

const response = await fetch(endpoint, { method: 'POST', headers, body });
const status = response.status;
const responseBody = await response.text();

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
process.stdout.write('Signed PII-free Shopify webhook probe accepted.\n');

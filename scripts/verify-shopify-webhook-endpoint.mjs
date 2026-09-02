import { createHmac, randomUUID } from 'node:crypto';

const baseUrl = process.env.CP_WEBHOOK_BASE_URL;
const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
const shop = process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS;
if (!baseUrl || !secret || !shop || shop.includes(',')) {
  throw new Error('WEBHOOK_PROBE_CONFIG_INVALID');
}

const endpoint = new URL('/api/webhooks/shopify', baseUrl);
const body = JSON.stringify({ probe: 'cp-webhook-health-v1' });
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-shopify-hmac-sha256': createHmac('sha256', secret)
      .update(body)
      .digest('base64'),
    'x-shopify-topic': 'orders/updated',
    'x-shopify-shop-domain': shop,
    'x-shopify-webhook-id': randomUUID(),
    'x-shopify-triggered-at': new Date().toISOString(),
  },
  body,
});
if (!response.ok) throw new Error(`WEBHOOK_PROBE_REJECTED_${response.status}`);
process.stdout.write('Signed PII-free Shopify webhook probe accepted.\n');

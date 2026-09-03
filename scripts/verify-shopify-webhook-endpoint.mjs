import { createHmac, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

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

let status;
let responseBody;
if (process.env.VERCEL_TOKEN && process.env.VERCEL_SCOPE) {
  const args = [
    'curl',
    endpoint.pathname,
    '--deployment',
    baseUrl,
    '--',
    '--silent',
    '--show-error',
    '--request',
    'POST',
    '--data-binary',
    body,
    '--write-out',
    '\n%{http_code}',
  ];
  for (const [name, value] of Object.entries(headers)) {
    args.push('--header', `${name}: ${value}`);
  }
  const result = spawnSync('vercel', args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    const diagnostic = `${result.error?.message ?? ''}\n${result.stderr ?? ''}`;
    const reason = /credentials|logged in|unauthorized|authentication/i.test(
      diagnostic
    )
      ? 'AUTH'
      : /option .*unknown|unknown option/i.test(diagnostic)
        ? 'OPTION'
        : /curl:/i.test(diagnostic)
          ? `CURL_${result.status ?? 'SPAWN'}`
          : /error:/i.test(diagnostic)
            ? `VERCEL_${result.status ?? 'SPAWN'}`
            : diagnostic.trim()
              ? `OTHER_${result.status ?? 'SPAWN'}`
              : `EMPTY_${result.status ?? 'SPAWN'}`;
    throw new Error(`WEBHOOK_PROBE_TRANSPORT_FAILED_${reason}`);
  }
  const lines = result.stdout.trimEnd().split('\n');
  status = Number(lines.pop());
  responseBody = lines.join('\n');
} else {
  const response = await fetch(endpoint, { method: 'POST', headers, body });
  status = response.status;
  responseBody = await response.text();
}

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

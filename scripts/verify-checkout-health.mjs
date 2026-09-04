import { writeFileSync } from 'node:fs';

function options(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error('CHECKOUT_HEALTH_ARGUMENT_INVALID');
    }
    parsed[key.slice(2)] = value;
  }
  return parsed;
}

const input = options(process.argv.slice(2));
if (!input.url || !input.output)
  throw new Error('CHECKOUT_HEALTH_INPUT_REQUIRED');
const base = new URL(input.url);
if (base.protocol !== 'https:')
  throw new Error('CHECKOUT_HEALTH_HTTPS_REQUIRED');
const product = new URL('/products/carlophillips-signature-hoodie', base);
const response = await fetch(product, {
  redirect: 'follow',
  headers: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    ? {
        'x-vercel-protection-bypass':
          process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
      }
    : undefined,
});
if (!response.ok) throw new Error(`CHECKOUT_HEALTH_HTTP_${response.status}`);
const html = await response.text();
if (!html.includes('action="/api/cart"')) {
  throw new Error('CHECKOUT_HEALTH_CART_ACTION_MISSING');
}
if (!/(?:CHOOSE A SIZE|ADD TO (?:TEST )?BAG)/.test(html)) {
  throw new Error('CHECKOUT_HEALTH_PURCHASE_ACTION_MISSING');
}
writeFileSync(
  input.output,
  `${JSON.stringify(
    {
      schemaVersion: 'cp.checkout-health-receipt.v1',
      checkedAt: new Date().toISOString(),
      healthy: true,
      checkoutEnabled: true,
      productStatus: response.status,
      privateCheckoutUrlRetained: false,
      paymentAttempted: false,
      orderSubmitted: false,
    },
    null,
    2
  )}\n`
);
process.stdout.write('Storefront and checkout controls are healthy.\n');

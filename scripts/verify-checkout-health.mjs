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

const receipt = {
  schemaVersion: 'cp.checkout-health-receipt.v1',
  checkedAt: new Date().toISOString(),
  healthy: true,
  checkoutEnabled: true,
  productStatus: response.status,
  cartCreated: false,
  checkoutHandoffVerified: false,
  privateCheckoutUrlRetained: false,
  paymentAttempted: false,
  orderSubmitted: false,
};

if (input['cart-probe'] === 'true') {
  const handle = 'carlophillips-signature-hoodie';
  const referenceHash = html.match(
    /referenceHash\\":\\"(sha256:[a-f0-9]{64})/u
  )?.[1];
  if (!referenceHash)
    throw new Error('CHECKOUT_HEALTH_VARIANT_REFERENCE_MISSING');

  const headers = {
    accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded',
    origin: base.origin,
  };
  const addResponse = await fetch(new URL('/api/cart', base), {
    method: 'POST',
    redirect: 'manual',
    headers,
    body: new URLSearchParams({
      cartAction: 'add',
      handle,
      referenceHash,
      quantity: '1',
    }),
  });
  const cartCookie = addResponse.headers.get('set-cookie')?.split(';')[0];
  const addResult = await addResponse.json().catch(() => null);
  if (!addResponse.ok || addResult?.ok !== true || addResult.count !== 1) {
    throw new Error(`CHECKOUT_HEALTH_CART_FAILED_${addResponse.status}`);
  }
  if (!cartCookie) throw new Error('CHECKOUT_HEALTH_CART_COOKIE_MISSING');

  const checkoutResponse = await fetch(new URL('/api/cart', base), {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: cartCookie,
      origin: base.origin,
    },
    body: new URLSearchParams({ cartAction: 'checkout' }),
  });
  const checkoutLocation = checkoutResponse.headers.get('location');
  if (checkoutResponse.status !== 303 || !checkoutLocation) {
    throw new Error(
      `CHECKOUT_HEALTH_HANDOFF_FAILED_${checkoutResponse.status}`
    );
  }
  const checkoutHost = new URL(checkoutLocation).hostname;
  if (
    !checkoutHost.endsWith('.myshopify.com') &&
    !checkoutHost.endsWith('.shopify.com')
  ) {
    throw new Error('CHECKOUT_HEALTH_HANDOFF_HOST_UNTRUSTED');
  }

  receipt.cartCreated = true;
  receipt.checkoutHandoffVerified = true;
}

writeFileSync(
  input.output,
  `${JSON.stringify(receipt, null, 2)}\n`
);
process.stdout.write(
  input['cart-probe'] === 'true'
    ? 'Storefront, real cart creation, and checkout handoff are healthy.\n'
    : 'Storefront and checkout controls are healthy.\n'
);

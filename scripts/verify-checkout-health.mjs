#!/usr/bin/env node
/**
 * verify-checkout-health.mjs
 *
 * Confirms the live storefront's product page, cart, and Shopify checkout
 * handoff are actually working — not just deployed. Writes a structured
 * JSON receipt so the result is evidence, not a claim.
 *
 * Usage:
 *   node scripts/verify-checkout-health.mjs --url https://carlophillips.com --output receipt.json
 *   node scripts/verify-checkout-health.mjs --url https://carlophillips.com --output receipt.json --cart-probe true
 *
 * --url          Storefront origin to check (must be https).
 * --output       Path to write the JSON receipt.
 * --cart-probe   Optional. "true" adds a real item to cart and confirms
 *                Shopify checkout handoff (redirect to a trusted
 *                *.myshopify.com / *.shopify.com host). Without this flag,
 *                only the product page and cart/purchase controls are checked.
 *
 * Env:
 *   VERCEL_AUTOMATION_BYPASS_SECRET   Optional. Sent as x-vercel-protection-bypass
 *                                     when the target is a protected Preview/Staging alias.
 */

import { writeFileSync } from 'node:fs';

const CHECK_PRODUCT_HANDLE = 'carlophillips-signature-hoodie';

function parseArgs(values) {
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

async function checkProductPage(base) {
  const productUrl = new URL(`/products/${CHECK_PRODUCT_HANDLE}`, base);
  const response = await fetch(productUrl, {
    redirect: 'follow',
    headers: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`CHECKOUT_HEALTH_HTTP_${response.status}`);
  }

  const html = await response.text();

  if (!html.includes('action="/api/cart"')) {
    throw new Error('CHECKOUT_HEALTH_CART_ACTION_MISSING');
  }
  if (!/(?:CHOOSE A SIZE|ADD TO (?:TEST )?BAG)/.test(html)) {
    throw new Error('CHECKOUT_HEALTH_PURCHASE_ACTION_MISSING');
  }

  return { response, html };
}

async function probeCartAndCheckout(base, html) {
  const referenceHash = html.match(/referenceHash\\":\\"(sha256:[a-f0-9]{64})/u)?.[1];
  if (!referenceHash) {
    throw new Error('CHECKOUT_HEALTH_VARIANT_REFERENCE_MISSING');
  }

  const addResponse = await fetch(new URL('/api/cart', base), {
    method: 'POST',
    redirect: 'manual',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      origin: base.origin,
    },
    body: new URLSearchParams({
      cartAction: 'add',
      handle: CHECK_PRODUCT_HANDLE,
      referenceHash,
      quantity: '1',
    }),
  });

  const cartCookie = addResponse.headers.get('set-cookie')?.split(';')[0];
  const addResult = await addResponse.json().catch(() => null);

  if (!addResponse.ok || addResult?.ok !== true || addResult.count !== 1) {
    throw new Error(`CHECKOUT_HEALTH_CART_FAILED_${addResponse.status}`);
  }
  if (!cartCookie) {
    throw new Error('CHECKOUT_HEALTH_CART_COOKIE_MISSING');
  }

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
    throw new Error(`CHECKOUT_HEALTH_HANDOFF_FAILED_${checkoutResponse.status}`);
  }

  const checkoutHost = new URL(checkoutLocation).hostname;
  const isTrustedShopifyHost =
    checkoutHost.endsWith('.myshopify.com') || checkoutHost.endsWith('.shopify.com');
  if (!isTrustedShopifyHost) {
    throw new Error('CHECKOUT_HEALTH_HANDOFF_HOST_UNTRUSTED');
  }

  return { cartCreated: true, checkoutHandoffVerified: true };
}

async function main() {
  const input = parseArgs(process.argv.slice(2));

  if (!input.url || !input.output) {
    throw new Error('CHECKOUT_HEALTH_INPUT_REQUIRED');
  }

  const base = new URL(input.url);
  if (base.protocol !== 'https:') {
    throw new Error('CHECKOUT_HEALTH_HTTPS_REQUIRED');
  }

  const { response, html } = await checkProductPage(base);

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
    const probeResult = await probeCartAndCheckout(base, html);
    Object.assign(receipt, probeResult);
  }

  writeFileSync(input.output, `${JSON.stringify(receipt, null, 2)}\n`);

  process.stdout.write(
    input['cart-probe'] === 'true'
      ? 'Storefront, real cart creation, and checkout handoff are healthy.\n'
      : 'Storefront and checkout controls are healthy.\n'
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});

import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/vercel-release-candidate.yml', 'utf8');
const cartServer = readFileSync('apps/web/src/lib/commerce/shopify-cart-server.ts', 'utf8');
const cartRoute = readFileSync('apps/web/src/app/api/cart/route.ts', 'utf8');
const storefrontQueries = readFileSync('packages/shopify/src/queries.ts', 'utf8');
const productPage = readFileSync('apps/web/src/app/product/[handle]/page.tsx', 'utf8');
const productPageServer = readFileSync('apps/web/src/lib/commerce/product-page-server.ts', 'utf8');
const productInfo = readFileSync('apps/web/src/components/product/ProductInfo/index.tsx', 'utf8');
const catalogServer = readFileSync('apps/web/src/lib/commerce/catalog-server.ts', 'utf8');
const bagPage = readFileSync('apps/web/src/app/bag/page.tsx', 'utf8');
const violations = [];

function requireText(source, text, message) {
  if (!source.includes(text)) violations.push(message);
}

requireText(workflow, 'default: true', 'Production candidate checkout must default to enabled.');
requireText(workflow, 'test "$SHOPIFY_CART_UI_ENABLED" = "true"', 'Production candidates must reject a disabled cart gate.');
requireText(workflow, 'test "$SHOPIFY_CHECKOUT_ENABLED" = "true"', 'Production candidates must reject a disabled checkout gate.');
requireText(workflow, '--meta cpArtifactKind=safe-fallback', 'A distinct checkout-disabled emergency fallback must remain available.');
requireText(workflow, '--env SHOPIFY_CHECKOUT_ENABLED=false', 'The emergency fallback must remain checkout-disabled.');
requireText(workflow, 'action="/api/cart"', 'The release smoke test must verify the Shopify cart handoff.');
requireText(cartServer, 'createStorefrontClient', 'Cart and checkout must use the shared Storefront client.');
requireText(cartServer, "environment === 'preview'", 'Cart and checkout must support isolated Preview and Production stores.');
requireText(storefrontQueries, "'2026-07'", 'Storefront reads and cart mutations must use the supported shared API version.');
requireText(productPageServer, 'SHOPIFY_CART_UI_ENABLED', 'The emergency fallback must hide cart activation.');
requireText(productPageServer, 'SHOPIFY_CHECKOUT_ENABLED', 'The emergency fallback must hide checkout activation.');
requireText(cartRoute, 'SHOPIFY_CART_SAFETY_DISABLED', 'The cart route must enforce the emergency fallback server-side.');
requireText(cartRoute, 'SHOPIFY_CHECKOUT_SAFETY_DISABLED', 'The checkout handoff must enforce the emergency fallback server-side.');

if (/releaseRecord|mediaManifest|shopify-checkout-authorization/.test(cartServer)) {
  violations.push('Public checkout must not depend on release records, media manifests, or agent authorization files.');
}
if (/\/api\/20\d{2}-\d{2}\/graphql\.json/.test(cartServer)) {
  violations.push('Checkout must not hardcode a second Storefront API version.');
}
if (workflow.includes('verify-production-commerce-release.mjs')) {
  violations.push('Deployment workflow must not gate current Shopify commerce on a Product Release Record.');
}
if (/product-release-registry|releaseRecord|releaseBinding/.test(productPage)) {
  violations.push('The active product page must not depend on Product Release Record runtime bindings.');
}
if (/shopify-product-offer|allowedSizes|productOffer/.test(productInfo)) {
  violations.push('The active PDP must not filter current Shopify variants through a code-owned offer allowlist.');
}
if (/listProductReleaseHandles|release\.json/.test(catalogServer)) {
  violations.push('The active catalog must discover products from Shopify, not code-owned release records.');
}
if (/cart-activation-server|releaseRecord/.test(bagPage)) {
  violations.push('The active bag must derive its runtime state from the Shopify cart, not release records.');
}

if (violations.length) {
  console.error(`Production-commerce lint failed:\n${violations.join('\n')}`);
  process.exit(1);
}

console.log('Production-commerce lint passed: Shopify is runtime authority, Preview and Production use the shared Storefront contract, and the emergency fallback remains fail-closed.');

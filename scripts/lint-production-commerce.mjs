import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/vercel-release-candidate.yml', 'utf8');
const checkoutServer = readFileSync('lib/commerce/shopify-checkout-server.js', 'utf8');
const authorization = JSON.parse(readFileSync('config/shopify-checkout-authorization.json', 'utf8'));
const violations = [];

function requireText(source, text, message) {
  if (!source.includes(text)) violations.push(message);
}

requireText(workflow, 'default: true', 'Production candidate checkout must default to enabled.');
requireText(workflow, 'test "$SHOPIFY_CART_UI_ENABLED" = "true"', 'Production candidates must reject a disabled cart gate.');
requireText(workflow, 'test "$SHOPIFY_CHECKOUT_ENABLED" = "true"', 'Production candidates must reject a disabled checkout gate.');
requireText(workflow, 'verify-production-commerce-release.mjs', 'Production checkout must remain release-gated.');
requireText(workflow, '--meta cpArtifactKind=safe-fallback', 'A distinct checkout-disabled emergency fallback must remain available.');
requireText(workflow, '--env SHOPIFY_CHECKOUT_ENABLED=false', 'The emergency fallback must remain checkout-disabled.');
requireText(workflow, 'action="/api/checkout"', 'The release smoke test must verify the storefront checkout handoff.');
requireText(checkoutServer, "releaseRecord.state !== 'released'", 'Checkout must require a Released Product Release Record.');
requireText(checkoutServer, "SHOPIFY_CHECKOUT_ENABLED === 'true'", 'Checkout must require the server-only environment gate.');

if (authorization.status !== 'approved' || !authorization.environments?.includes('production')) {
  violations.push('Production Shopify-hosted checkout authorization is missing.');
}

if (violations.length) {
  console.error(`Production-commerce lint failed:\n${violations.join('\n')}`);
  process.exit(1);
}

console.log('Production-commerce lint passed: every primary Production candidate requires release-bound Shopify checkout, while a distinct emergency fallback remains fail-closed.');

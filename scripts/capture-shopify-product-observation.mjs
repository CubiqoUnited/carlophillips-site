import { lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createShopifyProductLoader } from '../lib/providers/shopify/product-loader.js';
import { normalizePublicShopifyProduct } from '../lib/providers/shopify/public-product-json-adapter.js';
import { attachObservationToProduct, createProductObservation } from '../lib/commerce/product-observation.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE_ID = 'cp-signature-hoodie-2026-001';
const HANDLE = 'carlophillips-signature-hoodie';
const DEFAULT_OUTPUT = `releases/${RELEASE_ID}/shopify-product-observation.json`;

function parseArguments(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`Invalid argument near ${key || '<missing>'}`);
    options[key.slice(2)] = value;
  }
  return options;
}

function resolveInsideRoot(reference) {
  const resolved = path.resolve(ROOT, reference);
  const relative = path.relative(ROOT, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Observation output escapes the repository: ${reference}`);
  }
  return resolved;
}

function readJson(reference) {
  const resolved = resolveInsideRoot(reference);
  if (lstatSync(resolved).isSymbolicLink()) throw new Error(`Symlinked input is forbidden: ${reference}`);
  return JSON.parse(readFileSync(resolved, 'utf8'));
}

const options = parseArguments(process.argv.slice(2));
const outputReference = options.output || DEFAULT_OUTPUT;
if (outputReference !== DEFAULT_OUTPUT) throw new Error(`Output must be ${DEFAULT_OUTPUT}`);

const registry = readJson('config/capability-registry.json');
const capability = registry.capabilities?.find(item => item.capability === 'shopify-storefront-product-read');
if (
  capability?.selectedAdapter !== 'shopify-storefront-product'
  || capability.accessState !== 'read_only_verified'
  || capability.callableSurface !== 'shopify_storefront'
  || !capability.allowedOperations?.includes('product-read')
  || !capability.evidenceRef
) throw new Error('Verified read-only Shopify product capability is required.');

let product;
let transport;
if (process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN) {
  const loader = createShopifyProductLoader({
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
    environment: 'production',
    capabilityEvidence: capability.evidenceRef,
  });
  product = await loader(HANDLE);
  transport = 'storefront-graphql';
} else {
  const sourceUrl = `https://carlophillips.myshopify.com/products/${HANDLE}.js`;
  const response = await fetch(sourceUrl, { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error(`Shopify public product JSON returned HTTP ${response.status}.`);
  const normalized = normalizePublicShopifyProduct(await response.json(), { currency: 'USD' });
  const observation = createProductObservation({
    source: 'shopify',
    environment: 'production',
    observedAt: new Date().toISOString(),
    product: normalized,
    capabilityEvidence: capability.evidenceRef,
  });
  product = attachObservationToProduct(normalized, observation);
  transport = 'public-shopify-product-json';
}
if (!product?.observation || product.handle !== HANDLE) throw new Error('Exact Shopify Hoodie observation was not returned.');

const outputPath = resolveInsideRoot(outputReference);
mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(product.observation, null, 2)}\n`, { mode: 0o600 });

process.stdout.write(`${JSON.stringify({
  output: outputReference,
  transport,
  handle: product.observation.product.handle,
  observedAt: product.observation.observedAt,
  variantCount: product.observation.variants.length,
  currency: product.observation.product.currency,
  minimumPrice: product.observation.product.minimumPrice,
  maximumPrice: product.observation.product.maximumPrice,
  availableForSale: product.observation.product.availableForSale,
  variantFingerprint: product.observation.variantFingerprint,
  commerceFactsFingerprint: product.observation.commerceFactsFingerprint,
  observationFingerprint: product.observation.observationFingerprint,
  reviewStatus: product.observation.review.status,
}, null, 2)}\n`);

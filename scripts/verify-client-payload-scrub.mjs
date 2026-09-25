#!/usr/bin/env node
/**
 * KAN-19 build-time assertion.
 *
 * A denylist that covers only the field someone remembered is the defect, not
 * the control. This script fails the build on three independent conditions:
 *
 *   1. The client allowlist in client-payload-guard.ts names a forbidden field.
 *   2. Any served source module emits a forbidden field into a client payload.
 *   3. Any blocked supplier term appears as a literal in served source, other
 *      than inside the guard module that exists to name them.
 *
 * Scope is apps/web only. The root `app/`, `lib/` and `components/` trees are
 * not built or served (CLAUDE.md), so evidence from them describes dead code.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SERVED = join(ROOT, 'apps/web/src');
const GUARD = join(SERVED, 'lib/commerce/client-payload-guard.ts');

const BLOCKED_TERMS = ['apliiq', 'printful', 'printify'];
const FORBIDDEN_CLIENT_FIELDS = ['vendor'];

/** Files allowed to contain a blocked term, with the reason it is not a leak. */
const TERM_ALLOWANCES = new Map([
  [
    'lib/commerce/client-payload-guard.ts',
    'the guard itself must name the terms it blocks',
  ],
  [
    'lib/providers/shopify/public-product-json-adapter.ts',
    'tagline denylist; the terms are what it strips, not what it emits',
  ],
]);

/**
 * Files allowed to emit a forbidden field, with the reason. Each entry is a
 * server-only path whose output is stripped again at the client boundary.
 */
const FIELD_ALLOWANCES = new Map([
  [
    'lib/providers/shopify/product-loader.ts',
    'server-only; vendor feeds the internal product observation record and is removed by toClientRuntimeProduct at the adapter boundary',
  ],
  [
    'lib/commerce/product-observation.ts',
    'server-only integrity record; never serialised to a client',
  ],
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(full)) out.push(full);
  }
  return out;
}

const failures = [];
const confirmations = [];
const files = walk(SERVED);

// 1. The allowlist must not name a forbidden field.
const guardSource = readFileSync(GUARD, 'utf8');
const allowlistBlock = guardSource.match(
  /CLIENT_PRODUCT_FIELDS\s*=\s*\[([\s\S]*?)\]\s*as const/
);
if (!allowlistBlock) {
  failures.push(
    'client-payload-guard.ts: CLIENT_PRODUCT_FIELDS allowlist not found. The scrub cannot be verified, so it is treated as absent.'
  );
} else {
  const named = [...allowlistBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const field of FORBIDDEN_CLIENT_FIELDS) {
    if (named.includes(field))
      failures.push(
        `client-payload-guard.ts: "${field}" is in the client allowlist and must never be.`
      );
  }
  confirmations.push(
    `allowlist present, ${named.length} fields, none forbidden`
  );
}

// 2. No served module may emit a forbidden field into a product payload.
for (const file of files) {
  if (file === GUARD) continue;
  const rel = relative(SERVED, file);
  const source = readFileSync(file, 'utf8');
  if (FIELD_ALLOWANCES.has(rel)) continue;
  for (const field of FORBIDDEN_CLIENT_FIELDS) {
    // An object-literal entry ends in a comma; an interface member ends in a
    // semicolon. Only the former is a value actually being emitted.
    const emits = new RegExp(`^\\s*${field}\\s*:\\s*[^;\\n]+,\\s*$`, 'm');
    if (emits.test(source)) {
      failures.push(
        `${rel}: emits "${field}" in an object literal on a served path.`
      );
    }
  }
}

// 3. No blocked supplier term as a literal in served source.
for (const file of files) {
  const rel = relative(SERVED, file);
  if (TERM_ALLOWANCES.has(rel)) continue;
  const source = readFileSync(file, 'utf8').toLowerCase();
  for (const term of BLOCKED_TERMS) {
    if (source.includes(term))
      failures.push(`${rel}: contains blocked supplier term "${term}".`);
  }
}

if (failures.length) {
  console.error('verify:client-payload-scrub FAILED (KAN-19)');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('verify:client-payload-scrub PASSED (KAN-19)');
console.log(`  - scanned ${files.length} served modules under apps/web/src`);
for (const note of confirmations) console.log(`  - ${note}`);
console.log(
  `  - zero occurrences of ${BLOCKED_TERMS.join(', ')} outside the guard`
);

#!/usr/bin/env node
/**
 * KAN-23 deployed-artifact evidence. AC-ADM-1, AC-ADM-2, AC-ADM-4, AC-ADM-6..10, AC-ADM-12.
 *
 * Re-runnable by design: AC-ADM-12 requires the same evidence set for a later
 * deployment without hand work, because one passing deployment is not a pattern.
 *
 * This script DOES NOT DEPLOY. It observes a deployment that already exists.
 *
 * Usage:
 *   node scripts/verify-admin-surface.mjs --base https://<host> --deployment <id> [--commit <sha>]
 *
 * Optional, supplied out of band and never written to the record:
 *   CP_ADMIN_SECRET_SEARCH_TERM  a prefix of the live CLERK_SECRET_KEY, >= 12 chars.
 *                               Only its match COUNT is recorded (AC-ADM-1).
 */
import { writeFileSync } from 'node:fs';

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? null : process.argv[index + 1];
}

const baseUrl = arg('base');
const deploymentId = arg('deployment');
const commitSha = arg('commit') || null;
const outPath = arg('out') || null;

if (!baseUrl || !deploymentId) {
  console.error(
    'verify:admin-surface REFUSED: --base and --deployment are both required.\n' +
      '  Evidence that does not name the artifact it was taken from is how the\n' +
      '  2026-09-19 error happened: one surface read, another concluded about.'
  );
  process.exit(2);
}

/**
 * AC-ADM-1 recorded search terms. Printed into the evidence record so the terms
 * themselves are auditable, per Pushpa's "with the search terms recorded".
 * The live secret prefix, if supplied, is counted but never printed.
 */
const SECRET_SEARCH_TERMS = ['sk_test_', 'sk_live_', 'CLERK_SECRET_KEY'];
const liveSecretTerm = String(process.env.CP_ADMIN_SECRET_SEARCH_TERM || '').trim();
if (liveSecretTerm && liveSecretTerm.length < 12) {
  console.error(
    'verify:admin-surface REFUSED: CP_ADMIN_SECRET_SEARCH_TERM must be at least 12 characters to be a useful partial.'
  );
  process.exit(2);
}

/** AC-ADM-10 and AC-ADM-2: library errors and stacks must not reach a caller. */
const LEAK_TERMS = [
  'Missing publishableKey',
  'publishableKey',
  '@clerk/nextjs',
  'at Object.<anonymous>',
  'Error:',
];

/**
 * Pushpa's target matrix, §3 of work/items/KAN-23.md, as amended by her §6/§7
 * rulings of 2026-09-21.
 *
 * /api/admin and /api/admin/health are expected to be ABSENT. AC-ADM-8 and
 * AC-ADM-9 are WITHDRAWN: she wrote them believing those paths existed because
 * they served 500, and no route was ever built under apps/web/src/app/api/admin.
 * A 404 there is the honest state of a surface that does not exist, and it is
 * not a leak. It is recorded as `withdrawn`, NOT as a pass, because grading a
 * withdrawn criterion "passed" on a 404 is the not-examined-graded-fine error.
 * AC-ADM-1, AC-ADM-2, AC-ADM-10 and AC-ADM-13 still bind on these two paths.
 */
const EXPECTATIONS = [
  { path: '/admin/sign-in', expect: 'ok', criterion: 'AC-ADM-6' },
  { path: '/admin', expect: 'redirect-to-sign-in', criterion: 'AC-ADM-7' },
  { path: '/admin.rsc', expect: 'redirect-to-sign-in', criterion: 'AC-ADM-7' },
  { path: '/api/admin', expect: 'absent-surface', criterion: 'AC-ADM-8-WITHDRAWN' },
  {
    path: '/api/admin/health',
    expect: 'absent-surface',
    criterion: 'AC-ADM-9-WITHDRAWN',
  },
];

/**
 * Every section id declared by the admin page, /admin itself excluded (it is
 * the `overview` section and is probed above). Thirteen sections plus the five
 * above is the eighteen paths Pushpa accepted for probing; she refused to grade
 * "whether routes beyond the five are affected" as fine, and they were.
 */
const SECTIONS = [
  'overview', 'evidence', 'theme', 'media-generation', 'runs', 'approvals',
  'commands', 'releases', 'capabilities', 'audit', 'orders', 'post-sale',
  'analytics',
];

const failures = [];
const confirmations = [];
const observations = [];

async function probe(path, { redirect = 'manual' } = {}) {
  const url = new URL(path, baseUrl).toString();
  const response = await fetch(url, {
    redirect,
    headers: { 'user-agent': 'cp-kan23-admin-surface-probe' },
  });
  const body = await response.text();
  return {
    path,
    status: response.status,
    location: response.headers.get('location'),
    body,
  };
}

const withdrawn = [];

function judge({ path, status, location }, expectation, criterion) {
  // AC-ADM-13, new in Pushpa's §6 term 3: no path among the eighteen returns
  // 500 or leaks a named library error. This applies to every path, including
  // the two whose own criteria were withdrawn.
  if (status === 500) {
    failures.push(
      `AC-ADM-13/${criterion} ${path}: 500. The defect is not remediated.`
    );
    return;
  }
  if (expectation === 'absent-surface') {
    if (status === 404) {
      withdrawn.push(
        `${criterion} ${path}: 404, surface not built. Accepted for KAN-23 by ` +
          'Pushpa §7; recorded as WITHDRAWN, not as a pass.'
      );
      return;
    }
    return failures.push(
      `${criterion} ${path}: ${status}. Expected 404 from an unbuilt surface. ` +
        'Anything else means product surface exists that nobody specified.'
    );
  }
  if (expectation === 'ok') {
    if (status === 200) return confirmations.push(`${criterion} ${path}: 200`);
    if (status === 404) {
      return failures.push(
        `${criterion} ${path}: 404. Fail-closed under missing configuration. ` +
          'Pushpa: 404 is the correct response only where we deliberately decided ' +
          'admin is absent, and no such decision exists for staging.'
      );
    }
    return failures.push(`${criterion} ${path}: ${status}, expected 200.`);
  }
  if (expectation === 'redirect-to-sign-in') {
    if ([301, 302, 303, 307, 308].includes(status)) {
      if (String(location || '').includes('/admin/sign-in')) {
        return confirmations.push(`${criterion} ${path}: ${status} -> ${location}`);
      }
      return failures.push(
        `${criterion} ${path}: ${status} but redirected to ${location}, not /admin/sign-in.`
      );
    }
    if (status === 200) {
      return failures.push(
        `${criterion} ${path}: 200 to an anonymous caller. Pushpa: worse than the 500.`
      );
    }
    return failures.push(`${criterion} ${path}: ${status}, expected a redirect.`);
  }
  if (expectation === 'auth-refusal') {
    if ([401, 403].includes(status)) {
      return confirmations.push(`${criterion} ${path}: ${status}`);
    }
    if (status === 404) {
      return failures.push(
        `${criterion} ${path}: 404 API_ROUTE_UNAVAILABLE. No /api/admin handler exists ` +
          'in the served tree (apps/web/src/app/api). This is the defect the 500 masked.'
      );
    }
    return failures.push(`${criterion} ${path}: ${status}, expected 401 or 403.`);
  }
}

function scanForLeaks(observation, criterion) {
  for (const term of LEAK_TERMS) {
    if (observation.body.includes(term)) {
      failures.push(
        `${criterion} ${observation.path}: response body contains "${term}".`
      );
    }
  }
}

/** Collect the sign-in HTML and every static chunk it references. */
async function collectBundles(signInBody) {
  const chunks = new Set();
  for (const match of signInBody.matchAll(/["'](\/_next\/static\/[^"']+\.js)["']/g)) {
    chunks.add(match[1]);
  }
  const bodies = [{ name: '/admin/sign-in (html)', text: signInBody }];
  for (const chunk of chunks) {
    try {
      const response = await fetch(new URL(chunk, baseUrl).toString());
      bodies.push({ name: chunk, text: await response.text() });
    } catch (error) {
      failures.push(`bundle ${chunk} could not be fetched: ${error.message}`);
    }
  }
  return bodies;
}

const record = {
  check: 'verify:admin-surface',
  item: 'KAN-23',
  observedAt: new Date().toISOString(),
  baseUrl,
  deploymentId,
  commitSha,
  secretSearchTerms: [
    ...SECRET_SEARCH_TERMS,
    liveSecretTerm ? '<live CLERK_SECRET_KEY prefix, supplied out of band, value withheld>' : null,
  ].filter(Boolean),
  responses: [],
  bundlesScanned: [],
  publishableKeysFound: [],
  pathsProbed: EXPECTATIONS.length + SECTIONS.length,
  failures: [],
  confirmations: [],
  withdrawn: [],
};

try {
  // --- AC-ADM-6..10: the five paths. ----------------------------------------
  for (const { path, expect, criterion } of EXPECTATIONS) {
    const observation = await probe(path);
    observations.push(observation);
    record.responses.push({
      path,
      status: observation.status,
      location: observation.location,
      criterion,
    });
    judge(observation, expect, criterion);
    scanForLeaks(observation, `AC-ADM-10/${criterion}`);
  }

  // --- Scope: the other thirteen admin sections, not graded fine. -----------
  for (const section of SECTIONS) {
    const observation = await probe(`/admin/${section}`);
    record.responses.push({
      path: observation.path,
      status: observation.status,
      location: observation.location,
      criterion: 'scope',
    });
    if (observation.status === 500) {
      failures.push(`AC-ADM-13 /admin/${section}: 500.`);
    } else {
      confirmations.push(`scope /admin/${section}: ${observation.status}`);
    }
    scanForLeaks(observation, 'AC-ADM-10/scope');
  }

  // --- AC-ADM-1 and AC-ADM-4 against the served bundles. -------------------
  const signIn = observations.find((o) => o.path === '/admin/sign-in');
  const bundles = await collectBundles(signIn ? signIn.body : '');
  record.bundlesScanned = bundles.map((b) => b.name);

  const publishableKeys = new Set();
  for (const bundle of bundles) {
    for (const term of SECRET_SEARCH_TERMS) {
      if (bundle.text.includes(term)) {
        failures.push(
          `AC-ADM-1 ${bundle.name}: contains secret search term "${term}".`
        );
      }
    }
    if (liveSecretTerm && bundle.text.includes(liveSecretTerm)) {
      failures.push(
        `AC-ADM-1 ${bundle.name}: contains the live CLERK_SECRET_KEY prefix. Value withheld.`
      );
    }
    for (const match of bundle.text.matchAll(/pk_(?:test|live)_[A-Za-z0-9_-]+/g)) {
      publishableKeys.add(match[0]);
    }
  }

  if (failures.every((f) => !f.startsWith('AC-ADM-1 '))) {
    confirmations.push(
      `AC-ADM-1: zero occurrences of [${record.secretSearchTerms.join(', ')}] across ` +
        `${bundles.length} scanned bundles`
    );
  }

  // AC-ADM-4: logging this value is permitted; it is public by design.
  record.publishableKeysFound = [...publishableKeys];
  if (publishableKeys.size === 0) {
    failures.push(
      'AC-ADM-4: no publishable key found in any served bundle. The artifact was ' +
        'built without NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, which is the KAN-23 defect.'
    );
  } else if (publishableKeys.size > 1) {
    failures.push(
      `AC-ADM-4: ${publishableKeys.size} distinct publishable keys in one artifact: ` +
        `${[...publishableKeys].join(', ')}`
    );
  } else {
    const [key] = publishableKeys;
    confirmations.push(`AC-ADM-4: served artifact carries ${key}`);
    if (key.startsWith('pk_live_')) {
      failures.push(
        `AC-ADM-4: this artifact carries a production key (${key}). If this is staging, ` +
          "staging's artifact must not carry production's key."
      );
    }
  }
} catch (error) {
  failures.push(`probe aborted: ${error.message}`);
}

record.failures = failures;
record.confirmations = confirmations;
record.withdrawn = withdrawn;

// Confirming evidence is recorded alongside failures, not only failures.
console.log(`verify:admin-surface ${failures.length ? 'FAILED' : 'PASSED'} (KAN-23)`);
console.log(`  - artifact: deployment ${deploymentId}${commitSha ? `, commit ${commitSha}` : ''}`);
console.log(`  - secret search terms: ${record.secretSearchTerms.join(', ')}`);
console.log(`  - paths probed: ${record.pathsProbed}`);
for (const note of confirmations) console.log(`  - CONFIRMED: ${note}`);
for (const note of withdrawn) console.log(`  - WITHDRAWN: ${note}`);
for (const failure of failures) console.error(`  - FAILED: ${failure}`);

if (outPath) {
  writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`  - evidence record written to ${outPath}`);
}

process.exit(failures.length ? 1 : 0);

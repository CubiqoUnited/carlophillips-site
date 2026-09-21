#!/usr/bin/env node
/**
 * KAN-23 build-time assertion. AC-ADM-3, AC-ADM-4, AC-ADM-5.
 *
 * WHY THIS RUNS IN prebuild AND NOT IN CI:
 * `NEXT_PUBLIC_*` is inlined into the client and edge bundles at `next build`.
 * A project settings listing (`vercel env ls`) describes settings, not the
 * artifact, and the two diverged on the deployment serving today. This script
 * runs inside the same process tree as the build that produces the artifact,
 * so its output is written into that build's log and describes that artifact.
 * Pushpa explicitly rejects a settings listing as evidence for AC-ADM-3.
 *
 * ASYMMETRY IS DELIBERATE (R-ADM-3, AC-ADM-1 vs AC-ADM-4):
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is printed IN FULL. It is public by
 *   design, compiled into a bundle any anonymous caller can read, and logging
 *   it is permitted. Printing it is what makes AC-ADM-4 checkable.
 *   CLERK_SECRET_KEY is NEVER printed: not whole, not a prefix, not a suffix,
 *   not a length, not a hash. Only `present: true|false` and its `sk_test` /
 *   `sk_live` class, both of which are derivable from a single character.
 * These two must never be handled by one rule. Do not "simplify" this file by
 * unifying them.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const PUBLISHABLE_PATTERN = /^pk_(test|live)_[A-Za-z0-9_-]+$/;
const SECRET_PATTERN = /^sk_(test|live)_[A-Za-z0-9_-]+$/;

const env = process.env;
const onVercel = env.VERCEL === '1';
const optOut = env.CP_ADMIN_CLERK_OPTIONAL === 'true';

const publishableKey = String(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').trim();
const secretKey = String(env.CLERK_SECRET_KEY || '').trim();

const publishableClass = PUBLISHABLE_PATTERN.test(publishableKey)
  ? publishableKey.split('_')[1]
  : null;
const secretClass = SECRET_PATTERN.test(secretKey) ? secretKey.split('_')[1] : null;

const vercelEnvironment = env.VERCEL_ENV || null;
const commerceEnvironment = env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT || null;
const commitSha = env.VERCEL_GIT_COMMIT_SHA || env.GITHUB_SHA || null;
const deploymentId = env.VERCEL_DEPLOYMENT_ID || env.VERCEL_URL || null;

/**
 * Which environment is this artifact for? Used only for the key-class check.
 * Unknown is not an error; it means the cross-contamination check cannot run,
 * and that is reported rather than passed silently.
 */
function targetEnvironment() {
  if (vercelEnvironment === 'production' || commerceEnvironment === 'production') {
    return 'production';
  }
  if (vercelEnvironment === 'preview' || commerceEnvironment === 'staging') {
    return 'staging';
  }
  if (!onVercel) return 'local';
  return 'unknown';
}

const target = targetEnvironment();
const failures = [];
const confirmations = [];

// --- AC-ADM-5: absent publishable key fails the build. ------------------------
if (!publishableKey) {
  failures.push(
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is absent or empty at build time. ' +
      'The artifact would inline an empty publishable key, and no project ' +
      'settings value can repair it after the fact. This is the exact condition ' +
      'that produced the serving artifact under investigation in KAN-23.'
  );
} else if (!PUBLISHABLE_PATTERN.test(publishableKey)) {
  failures.push(
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is present but malformed: ${publishableKey}. ` +
      'Expected ^pk_(test|live)_[A-Za-z0-9_-]+$. Printed in full because this ' +
      'value is public by design (AC-ADM-4).'
  );
} else {
  confirmations.push(
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY present and well-formed: ${publishableKey}`
  );
}

// --- AC-ADM-4: staging must not carry production's key, and vice versa. ------
if (publishableClass && target === 'production' && publishableClass !== 'live') {
  failures.push(
    `Target environment is production but the publishable key is a pk_${publishableClass} key.`
  );
} else if (publishableClass && target === 'staging' && publishableClass !== 'test') {
  failures.push(
    `Target environment is staging/preview but the publishable key is a pk_${publishableClass} key. ` +
      "Staging's artifact must not carry production's key."
  );
} else if (publishableClass && (target === 'production' || target === 'staging')) {
  confirmations.push(
    `publishable key class pk_${publishableClass} matches target environment ${target}`
  );
} else if (publishableClass) {
  confirmations.push(
    `target environment is "${target}"; key-class cross-contamination check not applicable`
  );
}

// --- Secret: reported, never disclosed. AC-ADM-1. ----------------------------
// The secret is NOT required at build time. It is a runtime value and belongs in
// project settings. Its absence here is reported, not failed, because failing on
// it would push operators toward putting a secret in a build environment.
if (!secretKey) {
  confirmations.push(
    'CLERK_SECRET_KEY present: false (runtime value; absence at build time is expected and not a failure)'
  );
} else if (!secretClass) {
  failures.push(
    'CLERK_SECRET_KEY is present at build time but malformed. Value withheld by rule (AC-ADM-1).'
  );
} else {
  confirmations.push(
    `CLERK_SECRET_KEY present: true, class sk_${secretClass}. Value withheld by rule (AC-ADM-1). ` +
      'It is a runtime value; setting it at build time is unnecessary and widens the log surface.'
  );
}

// --- Binding: the proof must name the artifact it describes. -----------------
// Pushpa's SOLUTION_CONSENSUS term 2. She accepts prebuild-generated proof as
// evidence for AC-ADM-3/AC-ADM-5 regardless of pipeline shape, on one condition:
// the proof must be tied to the deployment id or commit required by §4 item 6.
// "A proof that cannot be tied back to the artifact that served is a settings
// listing wearing a different hat", and her rejection of settings listings
// stands. So an unbound Vercel build fails here rather than emitting a receipt
// nobody can attach to anything.
if (onVercel && !commitSha && !deploymentId) {
  failures.push(
    'This build emits no deployment id and no commit sha, so its receipt cannot ' +
      'be tied to the artifact it describes. Untied, this evidence is a project ' +
      'settings listing in a different hat, and AC-ADM-3 rejects it. Expected one ' +
      'of VERCEL_DEPLOYMENT_ID, VERCEL_URL, VERCEL_GIT_COMMIT_SHA or GITHUB_SHA.'
  );
} else if (commitSha || deploymentId) {
  confirmations.push(
    `receipt bound to ${commitSha ? `commit ${commitSha}` : ''}` +
      `${commitSha && deploymentId ? ', ' : ''}` +
      `${deploymentId ? `deployment ${deploymentId}` : ''}`
  );
}

// --- Escape hatch: local only, explicit only, always echoed. ------------------
if (failures.length && !onVercel && optOut) {
  console.warn('verify:admin-clerk-build-config DOWNGRADED TO WARNING (KAN-23)');
  console.warn('  - CP_ADMIN_CLERK_OPTIONAL=true and this is not a Vercel build.');
  console.warn(
    '  - The artifact produced by this build will fail closed on /admin. It must not be deployed.'
  );
  for (const failure of failures) console.warn(`  - ${failure}`);
  process.exit(0);
}

const receipt = {
  check: 'verify:admin-clerk-build-config',
  item: 'KAN-23',
  criteria: ['AC-ADM-3', 'AC-ADM-4', 'AC-ADM-5'],
  observedAt: new Date().toISOString(),
  onVercel,
  vercelEnvironment,
  commerceEnvironment,
  targetEnvironment: target,
  commitSha,
  deploymentId,
  publishableKey: publishableKey || null, // public by design; AC-ADM-4
  publishableKeyClass: publishableClass,
  secretKeyPresent: Boolean(secretKey), // value never emitted; AC-ADM-1
  secretKeyClass: secretClass,
};

/**
 * Carry the receipt OUT of the build, not only into the build log.
 * Written into the Next build output so it travels with the uploaded artifact,
 * which is what makes it re-readable for a later deployment (AC-ADM-12) instead
 * of surviving only as scrollback. Never written during tests or ordinary local
 * runs: only on Vercel, or when a path is asked for explicitly.
 *
 * It is a file inside the output, NOT a served route. Creating a served endpoint
 * that discloses configuration is out of scope and is Pushpa's §7 ruling.
 */
const receiptPath =
  env.CP_ADMIN_BUILD_RECEIPT_PATH ||
  (onVercel ? '.next/kan23-admin-clerk-build-receipt.json' : null);

function writeReceipt() {
  if (!receiptPath) return;
  try {
    mkdirSync(dirname(receiptPath), { recursive: true });
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(`  - receipt written to ${receiptPath}`);
  } catch (error) {
    // Reported, never fatal: failing the build over a file write would turn an
    // evidence problem into an outage. The log copy still exists either way.
    console.warn(
      `  - receipt could not be written to ${receiptPath}: ${error.message}`
    );
  }
}

if (failures.length) {
  console.error('verify:admin-clerk-build-config FAILED (KAN-23 AC-ADM-5)');
  for (const failure of failures) console.error(`  - ${failure}`);
  for (const note of confirmations) console.error(`  - CONFIRMED: ${note}`);
  console.error(`  - receipt ${JSON.stringify(receipt)}`);
  // Written on failure too. A record of only successful builds would
  // misrepresent the system, which is how the artifact under investigation got
  // to production unremarked.
  writeReceipt();
  process.exit(1);
}

console.log('verify:admin-clerk-build-config PASSED (KAN-23)');
for (const note of confirmations) console.log(`  - CONFIRMED: ${note}`);
console.log(
  '  - evidence taken from this build process, not from a project settings listing'
);
console.log(`  - receipt ${JSON.stringify(receipt)}`);
writeReceipt();

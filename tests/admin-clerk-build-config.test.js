/**
 * KAN-23 — build-time configuration gate. AC-ADM-3, AC-ADM-4, AC-ADM-5.
 *
 * NEGATIVE FIRST, deliberately. The first describe block asserts that the build
 * FAILS with the publishable key absent, because a silently-produced artifact
 * without the key is the artifact serving today. A suite that only proves the
 * happy path would have graded that artifact green.
 *
 * These tests execute the real script in a child process and read its exit code
 * and output. They do not re-implement its logic, so they cannot agree with a
 * bug in it.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SCRIPT = resolve(
  __dirname,
  '../scripts/verify-admin-clerk-build-config.mjs'
);

const GOOD_PUBLISHABLE = 'pk_test_ZmFrZS1zdGFnaW5nLWtleQ';
const GOOD_LIVE_PUBLISHABLE = 'pk_live_ZmFrZS1wcm9kdWN0aW9uLWtleQ';
const FAKE_SECRET = 'sk_test_0000000000000000000000000000000000000000';

function runGate(env) {
  // spawnSync, not execFileSync: both streams must be captured on success as
  // well as on failure. The local opt-out downgrade is written to stderr, and a
  // harness that read only stdout would report a loud warning as silence.
  const result = spawnSync(process.execPath, [SCRIPT], {
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8',
  });
  return {
    code: result.status,
    output: `${result.stdout || ''}${result.stderr || ''}`,
  };
}

describe('AC-ADM-5 — the build fails when the publishable key is absent', () => {
  it('fails on a Vercel build with the key absent', () => {
    const result = runGate({ VERCEL: '1', VERCEL_ENV: 'preview' });
    expect(result.code).toBe(1);
    expect(result.output).toContain('FAILED');
    expect(result.output).toContain(
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is absent'
    );
  });

  it('fails on a Vercel build with the key set to an empty string', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '   ',
    });
    expect(result.code).toBe(1);
  });

  it('fails on a Vercel build with a malformed key', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'not-a-clerk-key',
    });
    expect(result.code).toBe(1);
    expect(result.output).toContain('malformed');
  });

  it('cannot be escaped on Vercel, even with the opt-out set', () => {
    // The opt-out exists for a developer building locally without Clerk access.
    // If it worked on Vercel it would recreate the exact defect it guards.
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      CP_ADMIN_CLERK_OPTIONAL: 'true',
    });
    expect(result.code).toBe(1);
  });

  it('downgrades to a warning only for an explicit local opt-out', () => {
    const result = runGate({ CP_ADMIN_CLERK_OPTIONAL: 'true' });
    expect(result.code).toBe(0);
    expect(result.output).toContain('DOWNGRADED TO WARNING');
    expect(result.output).toContain('must not be deployed');
  });

  it('fails a local build that did not ask for the opt-out', () => {
    const result = runGate({});
    expect(result.code).toBe(1);
  });
});

describe('AC-ADM-4 — the artifact carries the key intended for its environment', () => {
  it("fails when a staging build carries production's key", () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_LIVE_PUBLISHABLE,
    });
    expect(result.code).toBe(1);
    expect(result.output).toContain("must not carry production's key");
  });

  it("fails when a production build carries staging's key", () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'production',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    expect(result.code).toBe(1);
  });

  it('passes a staging build carrying a test key', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      // Bound, because an unbound Vercel build is now a failure in its own
      // right (Pushpa's SOLUTION_CONSENSUS term 2). See the binding describe.
      VERCEL_GIT_COMMIT_SHA: 'deadbeefcafe',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    expect(result.code).toBe(0);
    expect(result.output).toContain('PASSED');
  });
});

describe('AC-ADM-3 — the receipt describes this build, not a settings listing', () => {
  const result = runGate({
    VERCEL: '1',
    VERCEL_ENV: 'preview',
    VERCEL_GIT_COMMIT_SHA: 'deadbeefcafe',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    CLERK_SECRET_KEY: FAKE_SECRET,
  });

  function receipt() {
    const match = result.output.match(/receipt (\{.*\})/);
    expect(match, 'the gate must emit a machine-readable receipt').toBeTruthy();
    return JSON.parse(match[1]);
  }

  it('names the commit that produced the artifact', () => {
    // AC-ADM-12 and Pushpa's UAT item 6: the next reader must not be able to
    // repeat the 2026-09-19 error of reading one surface and concluding about
    // another. The receipt binds the evidence to a commit.
    expect(receipt().commitSha).toBe('deadbeefcafe');
  });

  it('records the environment the artifact was built for', () => {
    expect(receipt().targetEnvironment).toBe('staging');
    expect(receipt().vercelEnvironment).toBe('preview');
  });

  it('states that its evidence is not a project settings listing', () => {
    expect(result.output).toContain('not from a project settings listing');
  });

  it('carries an observation timestamp, so a stale receipt is visible as stale', () => {
    expect(Number.isNaN(Date.parse(receipt().observedAt))).toBe(false);
  });
});

describe('R-ADM-3 — public and secret are governed by different rules', () => {
  const env = {
    VERCEL: '1',
    VERCEL_ENV: 'preview',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    CLERK_SECRET_KEY: FAKE_SECRET,
  };

  it('AC-ADM-4 — prints the publishable key in full, because it is public', () => {
    const result = runGate(env);
    expect(result.output).toContain(GOOD_PUBLISHABLE);
  });

  it('AC-ADM-1 — never emits the secret, whole or in useful partial form', () => {
    const result = runGate(env);
    // Recorded search terms for AC-ADM-1, asserted here and re-used by the
    // deployed-artifact check: the whole value, and every prefix long enough to
    // be useful. 12 characters past the sk_test_ prefix is well beyond guessable.
    expect(result.output).not.toContain(FAKE_SECRET);
    for (let length = 12; length <= FAKE_SECRET.length; length += 1) {
      expect(result.output).not.toContain(FAKE_SECRET.slice(0, length));
    }
    expect(result.output).not.toContain(FAKE_SECRET.slice(-12));
  });

  it('AC-ADM-1 — does not leak the secret through a length either', () => {
    const result = runGate(env);
    expect(result.output).not.toContain(String(FAKE_SECRET.length));
  });

  it('reports the secret only as presence and class', () => {
    const result = runGate(env);
    expect(result.output).toContain('CLERK_SECRET_KEY present: true');
    expect(result.output).toContain('class sk_test');
  });

  it('emits no secret value in the receipt object', () => {
    const result = runGate(env);
    const receipt = JSON.parse(result.output.match(/receipt (\{.*\})/)[1]);
    expect(receipt.secretKeyPresent).toBe(true);
    expect(receipt.secretKeyClass).toBe('test');
    expect(JSON.stringify(receipt)).not.toContain('sk_test_0');
  });

  it('does not fail the build merely because the secret is absent', () => {
    // The secret is a runtime value. Requiring it at build time would push an
    // operator into putting a secret in a build environment, which widens the
    // very log surface AC-ADM-1 protects.
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_SHA: 'deadbeefcafe',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    expect(result.code).toBe(0);
  });
});

describe('AC-ADM-3 binding — an untied proof is a settings listing in a different hat', () => {
  // Pushpa accepted the shape-independence argument on one condition: the proof
  // must be carried out of the build TIED to the deployment id or commit of
  // §4 item 6. Untied, her rejection of a project settings listing still stands.
  // So the gate refuses to certify a Vercel build it cannot bind.
  it('fails an otherwise-valid Vercel build that names no commit and no deployment', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    expect(result.code).toBe(1);
    expect(result.output).toContain('settings listing in a different hat');
  });

  it('accepts a deployment id when no commit sha is available', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      VERCEL_DEPLOYMENT_ID: 'dpl_KAN23FAKE',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    expect(result.code).toBe(0);
    const receipt = JSON.parse(result.output.match(/receipt (\{.*\})/)[1]);
    expect(receipt.deploymentId).toBe('dpl_KAN23FAKE');
  });

  it('does not require binding for a local build, which deploys nothing', () => {
    const result = runGate({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    expect(result.code).toBe(0);
  });
});

describe('confirming evidence is recorded, not only failures', () => {
  it('a passing run states what passed', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_SHA: 'deadbeefcafe',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: GOOD_PUBLISHABLE,
    });
    // The exit code is asserted too. Without it this test would also have
    // passed on a FAILED run, because a failing run prints CONFIRMED lines
    // by design, and a green tick would have meant nothing.
    expect(result.code).toBe(0);
    expect(result.output).toContain('CONFIRMED');
  });

  it('a failing run also states what passed, so the log is not only failures', () => {
    const result = runGate({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'not-a-clerk-key',
      CLERK_SECRET_KEY: FAKE_SECRET,
    });
    expect(result.code).toBe(1);
    expect(result.output).toContain('CONFIRMED');
  });
});

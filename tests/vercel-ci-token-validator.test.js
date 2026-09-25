import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const verifierPath = join(
  process.cwd(),
  '.github/scripts/verify-vercel-ci-token.mjs'
);
const directories = [];
const token = 'secret-sentinel-token-never-print';
const projectId = 'prj_expected';

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function runVerifier(response, overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'vercel-token-validator-'));
  directories.push(directory);
  const callsPath = join(directory, 'calls.json');
  const preloadPath = join(directory, 'fetch-stub.mjs');
  writeFileSync(
    preloadPath,
    `
      import { writeFileSync } from 'node:fs';
      const config = JSON.parse(process.env.FETCH_STUB_RESPONSE);
      const calls = [];
      writeFileSync(process.env.FETCH_STUB_CALLS, JSON.stringify(calls));
      globalThis.fetch = async (url, options) => {
        calls.push(String(url));
        writeFileSync(process.env.FETCH_STUB_CALLS, JSON.stringify(calls));
        if (options?.headers?.Authorization !== \`Bearer \${process.env.VERCEL_TOKEN}\`) {
          throw new Error('sentinel authorization detail');
        }
        if (!(options?.signal instanceof AbortSignal)) {
          throw new Error('sentinel timeout detail');
        }
        if (config.throw) throw new Error('sentinel network detail');
        return {
          ok: config.ok,
          status: config.status,
          json: async () => {
            if (config.invalidJson) throw new SyntaxError('sentinel body detail');
            return config.body;
          },
        };
      };
    `
  );

  const env = {
    ...process.env,
    NODE_OPTIONS: `--import=${preloadPath}`,
    FETCH_STUB_CALLS: callsPath,
    FETCH_STUB_RESPONSE: JSON.stringify(response),
    VERCEL_PROJECT_ID: projectId,
    VERCEL_TOKEN: token,
    ...overrides,
  };
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) delete env[name];
  }

  const result = spawnSync(process.execPath, [verifierPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env,
  });
  const calls = readFileSync(callsPath, 'utf8');
  return { ...result, calls: JSON.parse(calls) };
}

function expectSecretSafe(result) {
  const output = `${result.stdout}${result.stderr}`;
  expect(output).not.toContain(token);
  expect(output).not.toContain('sentinel-token');
  expect(output).not.toContain('network detail');
  expect(output).not.toContain('body detail');
  expect(output).not.toContain('authorization detail');
  expect(output).not.toContain('timeout detail');
}

describe('Vercel CI credential validator', () => {
  it('accepts exact project access without user or team requests', () => {
    const result = runVerifier({
      ok: true,
      status: 200,
      body: { id: projectId },
    });

    expect(result.status).toBe(0);
    expect(result.calls).toEqual([
      `https://api.vercel.com/v9/projects/${projectId}`,
    ]);
    expect(result.stdout).toContain(
      'Vercel CI credential can access the exact configured project.'
    );
    expectSecretSafe(result);
  });

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['whitespace', '   '],
  ])('rejects a %s token before any request', (_label, value) => {
    const result = runVerifier(
      { ok: true, status: 200, body: { id: projectId } },
      { VERCEL_TOKEN: value }
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('VERCEL_TOKEN_REQUIRED');
    expect(result.calls).toEqual([]);
    expectSecretSafe(result);
  });

  it('rejects a missing project id before any request', () => {
    const result = runVerifier(
      { ok: true, status: 200, body: { id: projectId } },
      { VERCEL_PROJECT_ID: undefined }
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('VERCEL_PROJECT_ID_REQUIRED');
    expect(result.calls).toEqual([]);
    expectSecretSafe(result);
  });

  it.each([
    [401, 'VERCEL_PROJECT_AUTH_FAILED_401'],
    [403, 'VERCEL_PROJECT_ACCESS_FAILED_403'],
    [404, 'VERCEL_PROJECT_ACCESS_FAILED_404'],
    [500, 'VERCEL_PROJECT_ACCESS_FAILED_500'],
  ])('fails closed on HTTP %s', (status, diagnostic) => {
    const result = runVerifier({ ok: false, status, body: {} });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(diagnostic);
    expectSecretSafe(result);
  });

  it('fails closed on a network error without exposing its detail', () => {
    const result = runVerifier({ throw: true });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('VERCEL_PROJECT_REQUEST_FAILED');
    expectSecretSafe(result);
  });

  it.each([
    ['invalid JSON', { ok: true, status: 200, invalidJson: true }],
    ['null body', { ok: true, status: 200, body: null }],
    ['array body', { ok: true, status: 200, body: [] }],
  ])('fails closed on %s', (_label, response) => {
    const result = runVerifier(response);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('VERCEL_PROJECT_RESPONSE_INVALID');
    expectSecretSafe(result);
  });

  it.each([
    ['missing identity', {}],
    ['wrong identity', { id: 'prj_other' }],
  ])('rejects a response with %s', (_label, body) => {
    const result = runVerifier({ ok: true, status: 200, body });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('VERCEL_PROJECT_ID_MISMATCH');
    expectSecretSafe(result);
  });
});

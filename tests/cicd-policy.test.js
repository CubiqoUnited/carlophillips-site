import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const candidate = readFileSync('.github/workflows/vercel-release-candidate.yml', 'utf8');
const production = readFileSync('.github/workflows/vercel-production.yml', 'utf8');
const verifier = readFileSync('.github/scripts/verify-vercel-receipt.mjs', 'utf8');
const verifierPath = join(process.cwd(), '.github/scripts/verify-vercel-receipt.mjs');
const rollbackVerifierPath = join(process.cwd(), '.github/scripts/reconcile-vercel-rollback.mjs');
const testSha = 'a'.repeat(40);

function writeJson(directory, name, value) {
  const path = join(directory, name);
  writeFileSync(path, `${JSON.stringify(value)}\n`);
  return path;
}

function candidateFixtures(directory, overrides = {}) {
  const inspect = {
    id: 'dpl_candidate',
    url: 'cp-candidate.vercel.app',
    target: 'production',
    readyState: 'READY',
    aliases: [],
    ...overrides.inspect,
  };
  const metadata = {
    cpGitCommitSha: testSha,
    cpRelease: 'v-test',
    cpArtifactKind: 'staged-production',
    cpBuildEnvironment: 'production',
    cpCheckoutEnabled: 'false',
    ...overrides.metadata,
  };
  const listed = {
    id: inspect.id,
    url: inspect.url,
    target: 'production',
    state: 'READY',
    meta: metadata,
    ...overrides.listed,
  };
  const productionBefore = {
    id: 'dpl_old',
    url: 'cp-old.vercel.app',
    target: 'production',
    readyState: 'READY',
    aliases: ['carlophillips.com', 'www.carlophillips.com'],
    ...overrides.productionBefore,
  };
  const productionAfter = {
    ...productionBefore,
    ...overrides.productionAfter,
  };

  return {
    inspect: writeJson(directory, 'candidate-inspect.json', inspect),
    list: writeJson(directory, 'candidate-list.json', { deployments: [listed] }),
    before: writeJson(directory, 'production-before.json', productionBefore),
    after: writeJson(directory, 'production-after.json', productionAfter),
  };
}

function runVerifier(argumentsList) {
  return spawnSync(process.execPath, [verifierPath, ...argumentsList], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

function workflowStep(workflow, name) {
  const marker = `      - name: ${name}`;
  const start = workflow.indexOf(marker);
  if (start === -1) return '';
  const next = workflow.indexOf('\n      - name:', start + marker.length);
  return workflow.slice(start, next === -1 ? workflow.length : next);
}

function candidateArguments(fixtures, output, expectedProductionAnchor = null) {
  const values = [
    'candidate',
    '--candidate-inspect', fixtures.inspect,
    '--candidate-list', fixtures.list,
    '--production-before', fixtures.before,
    '--production-after', fixtures.after,
    '--expected-sha', testSha,
    '--expected-release', 'v-test',
    '--output', output,
  ];
  if (expectedProductionAnchor) {
    values.push('--expected-production-anchor', expectedProductionAnchor);
  }
  return values;
}

describe('CI/CD policy', () => {
  it('keeps verification independent, read-only, Yarn Classic, and cancellable', () => {
    expect(ci).toContain('pull_request:');
    expect(ci).toContain('branches:\n      - main');
    expect(ci).toContain('contents: read');
    expect(ci).toContain('cancel-in-progress: true');
    expect(ci).toContain('node-version: 24');
    expect(ci).toContain('cache: yarn');
    expect(ci).toContain('yarn@1.22.22');
    expect(ci).toContain('yarn install --frozen-lockfile');
    expect(ci).toContain('run: yarn verify');
    expect(ci).not.toContain('pull_request_target');
    expect(ci).not.toMatch(/npm\s+(ci|install)|pnpm/);
  });

  it('stages a protected Production-semantics candidate without assigning domains', () => {
    expect(candidate).toContain('workflow_dispatch:');
    expect(candidate).toContain('group: vercel-production-release');
    expect(candidate).toContain('environment: Production');
    expect(candidate).not.toContain('pull_request:');
    expect(candidate).not.toContain('pull_request_target');
    expect(candidate).toContain('NEXT_PUBLIC_COMMERCE_ENVIRONMENT: production');
    expect(candidate).toContain('SHOPIFY_CART_UI_ENABLED: "false"');
    expect(candidate).toContain('VERCEL_ORG_ID: ${{ vars.VERCEL_ORG_ID }}');
    expect(candidate).toContain('VERCEL_PROJECT_ID: ${{ vars.VERCEL_PROJECT_ID }}');
    expect(candidate).toContain('VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}');
    expect(candidate.match(/    env:\n((?:      .*\n)+)/)?.[1]).not.toContain('VERCEL_TOKEN');
    expect(candidate).toContain("rule.type === 'required_reviewers'");
    expect(candidate).toContain('vercel pull --yes --environment=production');
    expect(candidate).toContain('vercel build --prod');
    expect(candidate).toContain('vercel deploy --prebuilt --archive=tgz --prod --skip-domain');
    expect(candidate).toContain('--meta cpArtifactKind=staged-production');
    expect(candidate).toContain('--meta cpBuildEnvironment=production');
    expect(candidate).toContain('--meta cpCheckoutEnabled=false');
    expect(candidate).toContain('Verify staged candidate receipt without deployment credential');
    expect(candidate).toContain("fs.rmSync('.vercel', { recursive: true, force: true })");
    expect(candidate.indexOf("fs.rmSync('.vercel'")).toBeLessThan(candidate.indexOf('uses: actions/upload-artifact@v4'));
    expect(workflowStep(candidate, 'Verify repository before deployment')).not.toContain('VERCEL_TOKEN');
    expect(workflowStep(candidate, 'Build fail-closed Production artifact')).not.toContain('VERCEL_TOKEN');
    expect(workflowStep(candidate, 'Verify staged candidate receipt without deployment credential')).not.toContain('VERCEL_TOKEN');
    expect(candidate).not.toMatch(/vercel\s+promote/);
  });

  it('keeps Production manual, reviewer-gated, metadata-bound, and rebuild-free', () => {
    expect(production).toContain('workflow_dispatch:');
    expect(production).toContain('group: vercel-production-release');
    expect(production).toContain('name: Production');
    expect(production).toContain('actions: read');
    expect(production).toContain('CP_PRODUCTION_PROMOTION_ENABLED');
    expect(production).toContain('VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}');
    expect(production.match(/    env:\n((?:      .*\n)+)/)?.[1]).not.toContain('VERCEL_TOKEN');
    expect(production).toContain("rule.type === 'required_reviewers'");
    expect(production).toContain('test "$EXPECTED_SHA" = "$GITHUB_SHA"');
    expect(production).toContain('expected_production_anchor:');
    expect(production).toContain('--expected-production-anchor "$EXPECTED_PRODUCTION_ANCHOR"');
    expect(production).toContain('vercel promote "$CANDIDATE_DEPLOYMENT"');
    expect(production).toContain("fs.writeFileSync('.vercel/project.json'");
    expect(production).not.toContain('vercel pull');
    expect(production).toContain('continue-on-error: true');
    expect(production).toContain('production-immediate-before.json');
    expect(production).toContain('Reject rollback-anchor drift before promotion');
    expect(production).toContain('echo "attempted=true" >> "$GITHUB_OUTPUT"');
    expect(production).toContain("steps.promotion.outputs.attempted == 'true'");
    expect(production).toContain('PROMOTION_OUTCOME: ${{ steps.promotion.outcome }}');
    expect(production).toContain('test "$PROMOTION_OUTCOME" = "success"');
    expect(production).toContain('Verify selected candidate without deployment credential');
    expect(production).toContain('Verify Production promotion identity without deployment credential');
    expect(production).toContain('reconcile-vercel-rollback.mjs plan');
    expect(production).toContain('reconcile-vercel-rollback.mjs verify');
    expect(workflowStep(production, 'Verify selected candidate without deployment credential')).not.toContain('VERCEL_TOKEN');
    expect(workflowStep(production, 'Verify Production promotion identity without deployment credential')).not.toContain('VERCEL_TOKEN');
    expect(production).toContain('Capture live Production for rollback planning');
    expect(production).toContain('vercel rollback "$ROLLBACK_DEPLOYMENT_ID" --yes');
    expect(production).toContain("html.includes('Selection disabled')");
    expect(production).toContain("html.includes('Purchasing disabled')");
    expect(production).toContain("html.includes('Continue to checkout')");
    expect(production).not.toMatch(/vercel\s+(build|deploy)/);
    expect(production).not.toContain('pull_request_target');
    expect(production).not.toMatch(/npm\s+(ci|install)|pnpm/);
  });

  it('encodes exact staged-candidate and same-artifact promotion invariants', () => {
    for (const requirement of [
      "inspect.target === 'production'",
      "listed.target === 'production'",
      "metadata?.cpArtifactKind === 'staged-production'",
      "metadata?.cpBuildEnvironment === 'production'",
      "metadata?.cpCheckoutEnabled === 'false'",
      'aliases.length === 0',
      'productionAfter.id === productionBefore.id',
      'productionBefore.id === expectedProductionAnchor',
      'productionAfter.id === candidateInspect.id',
    ]) {
      expect(verifier).toContain(requirement);
    }
  });

  it('executes a valid staged-candidate receipt fixture', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-cicd-candidate-'));
    try {
      const fixtures = candidateFixtures(directory);
      const output = join(directory, 'receipt.json');
      const result = runVerifier(candidateArguments(fixtures, output));
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({
        deploymentId: 'dpl_candidate',
        gitCommitSha: testSha,
        artifactKind: 'staged-production',
        buildEnvironment: 'production',
        checkoutEnabled: false,
        productionDomainsAssigned: false,
        productionBeforeDeploymentId: 'dpl_old',
        productionAfterStagingDeploymentId: 'dpl_old',
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ['Preview target', { inspect: { target: 'preview' } }],
    ['wrong SHA', { metadata: { cpGitCommitSha: 'b'.repeat(40) } }],
    ['wrong release', { metadata: { cpRelease: 'wrong' } }],
    ['missing checkout marker', { metadata: { cpCheckoutEnabled: 'true' } }],
    ['Preview build semantics', { metadata: { cpBuildEnvironment: 'preview' } }],
    ['wrong artifact kind', { metadata: { cpArtifactKind: 'preview' } }],
    ['Production alias leakage', { inspect: { aliases: ['www.carlophillips.com'] } }],
    ['already-current candidate', { productionBefore: { id: 'dpl_candidate' }, productionAfter: { id: 'dpl_candidate' } }],
    ['concurrent Production change', { productionAfter: { id: 'dpl_other' } }],
    ['Production alias drift', { productionAfter: { aliases: ['www.carlophillips.com'] } }],
  ])('rejects a candidate receipt with %s', (_label, overrides) => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-cicd-candidate-invalid-'));
    try {
      const fixtures = candidateFixtures(directory, overrides);
      const result = runVerifier(candidateArguments(fixtures, join(directory, 'receipt.json')));
      expect(result.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejects a candidate whose current Production differs from the reviewed receipt anchor', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-cicd-anchor-invalid-'));
    try {
      const fixtures = candidateFixtures(directory);
      const result = runVerifier(candidateArguments(
        fixtures,
        join(directory, 'receipt.json'),
        'dpl_wrong',
      ));
      expect(result.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('accepts exact same-artifact promotion and rejects identity substitution', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-cicd-production-'));
    try {
      const fixtures = candidateFixtures(directory);
      const productionAfterValue = id => ({
        id,
        url: id === 'dpl_candidate' ? 'cp-candidate.vercel.app' : 'cp-other.vercel.app',
        target: 'production',
        readyState: 'READY',
        aliases: ['carlophillips.com', 'www.carlophillips.com'],
      });
      const productionListValue = id => ({
        deployments: [{
          id,
          url: id === 'dpl_candidate' ? 'cp-candidate.vercel.app' : 'cp-other.vercel.app',
          target: 'production',
          state: 'READY',
          meta: {
            cpGitCommitSha: testSha,
            cpRelease: 'v-test',
            cpArtifactKind: 'staged-production',
            cpBuildEnvironment: 'production',
            cpCheckoutEnabled: 'false',
          },
        }],
      });
      const run = id => {
        const productionAfter = writeJson(directory, 'production-promoted.json', productionAfterValue(id));
        const productionList = writeJson(directory, 'production-list.json', productionListValue(id));
        return runVerifier([
          'production',
          '--candidate-inspect', fixtures.inspect,
          '--candidate-list', fixtures.list,
          '--production-before', fixtures.before,
          '--production-after', productionAfter,
          '--production-list', productionList,
          '--expected-production-anchor', 'dpl_old',
          '--expected-sha', testSha,
          '--expected-release', 'v-test',
          '--output', join(directory, 'production-receipt.json'),
        ]);
      };

      expect(run('dpl_candidate').status).toBe(0);
      expect(run('dpl_other').status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('executes rollback planning and reconciliation fixtures', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-cicd-rollback-'));
    try {
      const before = writeJson(directory, 'before.json', {
        id: 'dpl_old', target: 'production', readyState: 'READY',
      });
      const unchanged = writeJson(directory, 'unchanged.json', {
        id: 'dpl_old', target: 'production', readyState: 'READY',
        aliases: ['carlophillips.com', 'www.carlophillips.com'],
      });
      const changed = writeJson(directory, 'changed.json', {
        id: 'dpl_candidate', target: 'production', readyState: 'READY',
      });
      const missingAlias = writeJson(directory, 'missing-alias.json', {
        id: 'dpl_old', target: 'production', readyState: 'READY', aliases: ['www.carlophillips.com'],
      });
      const githubOutput = join(directory, 'github-output.txt');
      const plan = current => {
        const output = join(directory, `plan-${current === changed ? 'changed' : 'unchanged'}.json`);
        const result = spawnSync(process.execPath, [
          rollbackVerifierPath,
          'plan',
          '--production-before', before,
          '--production-current', current,
          '--github-output', githubOutput,
          '--output', output,
        ], { encoding: 'utf8' });
        return { result, receipt: result.status === 0 ? JSON.parse(readFileSync(output, 'utf8')) : null };
      };

      expect(plan(unchanged)).toMatchObject({ result: { status: 0 }, receipt: { rollbackRequired: false } });
      expect(plan(changed)).toMatchObject({ result: { status: 0 }, receipt: { rollbackRequired: true } });

      const verify = after => spawnSync(process.execPath, [
        rollbackVerifierPath,
        'verify',
        '--production-before', before,
        '--production-after', after,
        '--output', join(directory, 'rollback-receipt.json'),
      ], { encoding: 'utf8' });

      expect(verify(unchanged).status).toBe(0);
      expect(verify(changed).status).not.toBe(0);
      expect(verify(missingAlias).status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

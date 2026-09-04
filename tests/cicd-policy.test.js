import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const preview = readFileSync('.github/workflows/vercel-preview.yml', 'utf8');
const staging = readFileSync('.github/workflows/vercel-staging.yml', 'utf8');
const protectedProof = readFileSync(
  '.github/workflows/protected-release-proof.yml',
  'utf8'
);
const candidate = readFileSync(
  '.github/workflows/vercel-release-candidate.yml',
  'utf8'
);
const production = readFileSync(
  '.github/workflows/vercel-production.yml',
  'utf8'
);
const verifier = readFileSync(
  '.github/scripts/verify-vercel-receipt.mjs',
  'utf8'
);
const fallbackSelector = readFileSync(
  '.github/scripts/select-vercel-safe-fallback.mjs',
  'utf8'
);
const productionCommerceVerifier = readFileSync(
  'scripts/verify-production-commerce-release.mjs',
  'utf8'
);
const webhookEndpointVerifier = readFileSync(
  'scripts/verify-shopify-webhook-endpoint.mjs',
  'utf8'
);
const checkoutHealthVerifier = readFileSync(
  'scripts/verify-checkout-health.mjs',
  'utf8'
);
const protectedProofCollector = readFileSync(
  'scripts/collect-protected-shopify-proof.mjs',
  'utf8'
);
const stagingPromotionVerifier = readFileSync(
  '.github/scripts/verify-staging-promotion.mjs',
  'utf8'
);
const releasePlaywright = readFileSync('playwright.release.config.ts', 'utf8');
const verifierPath = join(
  process.cwd(),
  '.github/scripts/verify-vercel-receipt.mjs'
);
const fallbackSelectorPath = join(
  process.cwd(),
  '.github/scripts/select-vercel-safe-fallback.mjs'
);
const testSha = 'a'.repeat(40);

describe('protected Staging workflow', () => {
  it('uses authenticated Vercel requests before assigning the Staging alias', () => {
    expect(staging).toContain('vercel curl "$DEPLOYMENT_URL$route"');
    expect(staging).toContain(
      'vercel curl "$DEPLOYMENT_URL/products/carlophillips-signature-hoodie"'
    );
    expect(staging).not.toMatch(/(^|\s)curl\s+--fail/);
    expect(staging.indexOf('Verify deployment before aliasing')).toBeLessThan(
      staging.indexOf('Assign protected Staging domain')
    );
  });
});

function writeJson(directory, name, value) {
  const path = join(directory, name);
  writeFileSync(path, `${JSON.stringify(value)}\n`);
  return path;
}

function productionAnchor(overrides = {}) {
  return {
    id: 'dpl_old',
    url: 'cp-old.vercel.app',
    target: 'production',
    readyState: 'READY',
    aliases: ['carlophillips.com', 'www.carlophillips.com'],
    ...overrides,
  };
}

function artifactMetadata(role, overrides = {}) {
  const contract =
    role === 'candidate'
      ? { kind: 'staged-production', environment: 'production' }
      : role === 'fallback'
        ? { kind: 'safe-fallback', environment: 'production' }
        : role === 'staging'
          ? { kind: 'protected-staging', environment: 'preview' }
          : { kind: 'immutable-preview', environment: 'preview' };
  return {
    cpGitCommitSha: testSha,
    cpRelease: 'v-test',
    cpArtifactKind: contract.kind,
    cpBuildEnvironment: contract.environment,
    cpCheckoutEnabled: 'false',
    ...(role === 'preview' || role === 'staging'
      ? { cpPullRequest: '42' }
      : {}),
    ...overrides,
  };
}

function artifact(role, overrides = {}) {
  const defaults =
    role === 'candidate'
      ? {
          id: 'dpl_candidate',
          url: 'cp-candidate.vercel.app',
          target: 'production',
        }
      : role === 'fallback'
        ? {
            id: 'dpl_fallback',
            url: 'cp-fallback.vercel.app',
            target: 'production',
          }
        : { id: 'dpl_preview', url: 'cp-preview.vercel.app', target: null };
  return {
    ...defaults,
    readyState: 'READY',
    aliases: [],
    ...overrides,
  };
}

function listedArtifact(inspect, role, overrides = {}) {
  return {
    id: inspect.id,
    url: inspect.url,
    target: inspect.target,
    state: 'READY',
    aliases: [],
    meta: artifactMetadata(role),
    ...overrides,
  };
}

function releasePairFixtures(directory, overrides = {}) {
  const candidateInspect = artifact('candidate', overrides.candidateInspect);
  const fallbackInspect = artifact('fallback', overrides.fallbackInspect);
  const candidateListed = listedArtifact(candidateInspect, 'candidate', {
    ...overrides.candidateListed,
    meta: artifactMetadata('candidate', overrides.candidateMetadata),
  });
  const fallbackListed = listedArtifact(fallbackInspect, 'fallback', {
    ...overrides.fallbackListed,
    meta: artifactMetadata('fallback', overrides.fallbackMetadata),
  });
  const beforeValue = productionAnchor(overrides.productionBefore);
  const afterValue = { ...beforeValue, ...overrides.productionAfter };
  return {
    candidateInspect: writeJson(
      directory,
      'candidate-inspect.json',
      candidateInspect
    ),
    fallbackInspect: writeJson(
      directory,
      'fallback-inspect.json',
      fallbackInspect
    ),
    deploymentList: writeJson(directory, 'deployment-list.json', {
      deployments: [candidateListed, fallbackListed],
    }),
    before: writeJson(directory, 'production-before.json', beforeValue),
    after: writeJson(directory, 'production-after.json', afterValue),
  };
}

function previewFixtures(directory, overrides = {}) {
  const inspect = artifact('preview', overrides.inspect);
  const listed = listedArtifact(inspect, 'preview', {
    ...overrides.listed,
    meta: artifactMetadata('preview', overrides.metadata),
  });
  const beforeValue = productionAnchor(overrides.productionBefore);
  return {
    inspect: writeJson(directory, 'preview-inspect.json', inspect),
    deploymentList: writeJson(directory, 'preview-list.json', {
      deployments: [listed],
    }),
    before: writeJson(directory, 'production-before-preview.json', beforeValue),
    after: writeJson(directory, 'production-after-preview.json', {
      ...beforeValue,
      ...overrides.productionAfter,
    }),
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

function pairArguments(
  fixtures,
  output,
  expectedProductionAnchor = null,
  expectedCandidateCheckout = false
) {
  const values = [
    'candidate-pair',
    '--candidate-inspect',
    fixtures.candidateInspect,
    '--fallback-inspect',
    fixtures.fallbackInspect,
    '--deployment-list',
    fixtures.deploymentList,
    '--production-before',
    fixtures.before,
    '--production-after',
    fixtures.after,
    '--expected-sha',
    testSha,
    '--expected-release',
    'v-test',
    '--expected-candidate-checkout',
    String(expectedCandidateCheckout),
    '--output',
    output,
  ];
  if (expectedProductionAnchor)
    values.push('--expected-production-anchor', expectedProductionAnchor);
  return values;
}

function promotionFiles(directory, role, overrides = {}) {
  const sourceId = role === 'candidate' ? 'dpl_candidate' : 'dpl_fallback';
  const sourceKind =
    role === 'candidate' ? 'staged-production' : 'safe-fallback';
  const productionId = overrides.productionId || `dpl_promoted${role}`;
  const productionUrl =
    overrides.productionUrl || `cp-promoted-${role}.vercel.app`;
  const metadata = {
    cpGitCommitSha: testSha,
    cpRelease: 'v-test',
    cpArtifactKind: sourceKind,
    cpBuildEnvironment: 'production',
    cpCheckoutEnabled: 'false',
    action: 'promote',
    originalDeploymentId: sourceId,
    ...overrides.metadata,
  };
  const inspect = {
    id: productionId,
    url: productionUrl,
    target: 'production',
    readyState: 'READY',
    aliases: ['carlophillips.com', 'www.carlophillips.com'],
    ...overrides.inspect,
  };
  const listed = {
    id: inspect.id,
    url: inspect.url,
    target: 'production',
    state: 'READY',
    meta: metadata,
    ...overrides.listed,
  };
  return {
    after: writeJson(directory, `production-${role}.json`, inspect),
    list: writeJson(directory, `production-${role}-list.json`, {
      deployments: [listed],
    }),
  };
}

describe('CI/CD policy', () => {
  it('keeps one verification authority read-only, Node 24, accessible, and cancellable', () => {
    expect(ci).toContain('pull_request:');
    expect(ci).toContain('branches:\n      - main');
    expect(ci).toContain('contents: read');
    expect(ci).toContain('cancel-in-progress: true');
    expect(ci).toContain('node-version: 24');
    expect(ci).toContain('yarn@1.22.22');
    expect(ci).toContain('yarn install --frozen-lockfile');
    expect(ci).toContain('run: yarn verify');
    expect(ci).toContain('yarn test:a11y');
    expect(ci.match(/NEXT_PUBLIC_COMMERCE_ENVIRONMENT: local/g)).toHaveLength(
      2
    );
    expect(ci.match(/COMMERCE_DATA_MODE: fixture/g)).toHaveLength(2);
    expect(ci).toContain('name: ci-evidence-${{ github.sha }}');
    expect(ci).not.toContain('pull_request_target');
    expect(ci).not.toMatch(/npm\s+(ci|install)|pnpm/);
    expect(() =>
      readFileSync('.github/workflows/quality.yml', 'utf8')
    ).toThrow();
  });

  it('deploys only an exact same-repository PR head through the protected Preview environment', () => {
    expect(preview).toContain('workflow_dispatch:');
    expect(preview).toContain('environment: Preview');
    expect(preview).toContain('pull-requests: read');
    expect(preview).toContain(
      'pullRequest.head?.repo?.full_name !== process.env.GITHUB_REPOSITORY'
    );
    expect(preview).toContain("pullRequest.base?.ref !== 'staging'");
    expect(preview).toContain('test "$EXPECTED_SHA" = "$GITHUB_SHA"');
    expect(preview).toContain('NEXT_PUBLIC_COMMERCE_ENVIRONMENT: preview');
    expect(preview).toMatch(/SHOPIFY_CART_UI_ENABLED: ['"]true['"]/);
    expect(preview).toContain('vercel pull --yes --environment=preview');
    expect(preview).toContain('run: vercel build');
    expect(preview).toContain('vercel deploy --prebuilt --archive=tgz --token');
    expect(preview).not.toContain('--skip-domain');
    expect(preview).toContain('--meta cpArtifactKind=immutable-preview');
    expect(preview).toContain('--meta cpBuildEnvironment=preview');
    expect(preview).toContain('--meta cpCheckoutEnabled=true');
    expect(preview).toContain('--env SHOPIFY_CART_UI_ENABLED=true');
    expect(preview).toContain('--env SHOPIFY_CHECKOUT_ENABLED=true');
    expect(preview).toContain('Preview Shopify add-to-bag action is missing.');
    expect(preview).toContain('ADD TO BAG - $128');
    expect(preview).toContain(
      'yarn playwright test --config=playwright.release.config.ts'
    );
    expect(preview).toContain('SHOPIFY_STAGING_CHECKOUT_HOSTS:');
    expect(preview).toContain('/product/carlophillips-signature-hoodie');
    expect(preview).not.toContain('/products/carlophillips-signature-hoodie');
    expect(preview).toContain('action="/api/cart"');
    expect(preview).toContain('verify-vercel-receipt.mjs preview');
    expect(preview).toContain('vercel curl "$route"');
    expect(preview).not.toMatch(/vercel curl[^\n]*--token/);
    expect(preview).not.toContain('vercel promote');
    expect(preview).not.toContain('staging.carlophillips.com');
    expect(preview).not.toMatch(
      /vercel\s+(?:build|deploy)[^\n]*--prod(?:\s|$)/
    );
    expect(preview).not.toContain('pull_request_target');
    expect(
      workflowStep(preview, 'Verify repository before Preview')
    ).not.toContain('VERCEL_TOKEN');
    expect(
      workflowStep(
        preview,
        'Verify immutable Preview receipt without deployment credential'
      )
    ).not.toContain('VERCEL_TOKEN');
  });

  it('deploys only the exact merged-staging SHA to protected Staging', () => {
    expect(staging).toContain('workflow_dispatch:');
    expect(staging).toContain('pr_number:');
    expect(staging).toContain('name: Staging');
    expect(staging).toContain('STAGING_REVIEWER_REQUIRED');
    expect(staging).toContain('test "$(git rev-parse HEAD)" = "$EXPECTED_SHA"');
    expect(staging).toContain("pull.state !== 'closed' || !pull.merged_at");
    expect(staging).toContain("pull.base?.ref !== 'staging'");
    expect(staging).toContain(
      'pull.merge_commit_sha !== process.env.EXPECTED_SHA'
    );
    expect(staging).toContain('git rev-parse origin/staging');
    expect(staging).toContain('vercel pull --yes --environment=preview');
    expect(staging).toContain('VERCEL_PROJECT_LINK_MISMATCH');
    expect(staging).toContain('VERCEL_ORG_LINK_MISMATCH');
    expect(staging).toContain('vercel deploy --prebuilt --archive=tgz --token');
    expect(staging).not.toContain('--skip-domain');
    expect(staging).toContain('--meta cpArtifactKind=protected-staging');
    expect(staging).toContain('--meta cpCheckoutEnabled=true');
    expect(staging).toContain('--meta cpGitCommitSha="$EXPECTED_SHA"');
    expect(staging).toContain(
      'name: staging-receipt-${{ inputs.expected_sha }}'
    );
    expect(staging).not.toContain('--meta cpGitCommitSha="$GITHUB_SHA"');
    expect(staging).toContain('yarn test:e2e');
    expect(staging).toContain('snapshot-shopify:');
    expect(staging).toContain('needs: snapshot-shopify');
    expect(staging).toContain('CP_STAGING_CAPTURE_SHOPIFY_SNAPSHOT');
    expect(staging).toContain('collect-protected-shopify-proof.mjs snapshot');
    expect(staging).toContain('SHOPIFY_STAGING_ADMIN_TOKEN');
    expect(staging).toContain('SHOPIFY_PRODUCTION_STORE_DOMAIN');
    expect(staging).toContain(
      'staging-shopify-snapshot-${{ inputs.expected_sha }}'
    );
    const deployJob = staging.slice(0, staging.indexOf('  snapshot-shopify:'));
    expect(deployJob).not.toContain('SHOPIFY_STAGING_ADMIN_TOKEN');
    expect(deployJob).not.toContain('SHOPIFY_PRODUCTION_STORE_DOMAIN');
    expect(staging).toContain('playwright.release.config.ts');
    expect(releasePlaywright).toContain('width: 1440');
    expect(releasePlaywright).toContain('width: 390');
    expect(releasePlaywright).toContain("reporter: [['list']]");
    expect(releasePlaywright).not.toContain("['json'");
    expect(releasePlaywright).not.toContain("['html'");
    expect(staging).toContain('verify-checkout-health.mjs');
    expect(staging).toContain("html.includes('CHOOSE A SIZE')");
    expect(staging).not.toContain("html.includes('ADD TO BAG')");
    expect(staging).toContain('verify-vercel-receipt.mjs staging');
    expect(staging).toContain('Verify deployment before aliasing');
    expect(staging).toContain(
      'vercel alias set "$DEPLOYMENT_URL" staging.carlophillips.com'
    );
    expect(staging.indexOf('Verify deployment before aliasing')).toBeLessThan(
      staging.indexOf('Assign protected Staging domain')
    );
    expect(staging).toContain('yarn verify:webhook-endpoint');
    expect(webhookEndpointVerifier).toContain(
      "headers['x-vercel-protection-bypass']"
    );
    expect(staging).toContain('VERCEL_AUTOMATION_BYPASS_SECRET');
    expect(webhookEndpointVerifier).not.toContain('spawnSync');
    expect(webhookEndpointVerifier).toContain(
      'WEBHOOK_DUPLICATE_NOT_SUPPRESSED'
    );
    expect(staging).not.toContain('SHOPIFY_CHECKOUT_ENABLED=false');
  });

  it('creates a signed PII-free checkout-handoff proof for the successful Staging SHA', () => {
    expect(protectedProof).toContain('environment: Staging');
    expect(protectedProof).toContain('git rev-parse origin/staging');
    expect(protectedProof).toContain('STAGING_RUN_NOT_SUCCESSFUL');
    expect(protectedProof).toContain('STAGING_RUN_SHA_MISMATCH');
    expect(protectedProof).toContain('staging-receipt-$EXPECTED_SHA');
    expect(protectedProof).not.toContain('snapshot_run_id:');
    expect(protectedProof).toContain('staging-shopify-snapshot-$EXPECTED_SHA');
    expect(protectedProof).toContain(
      '--snapshot shopify-snapshot/staging-shopify-snapshot.json'
    );
    expect(protectedProof).toContain(
      'collect-protected-shopify-proof.mjs finalize'
    );
    expect(protectedProof).toContain('CP_RELEASE_RECEIPT_SIGNING_SECRET');
    expect(protectedProof).toContain(
      'protected-release-proof-${{ inputs.expected_sha }}'
    );
    expect(protectedProof).not.toContain('vercel promote');
    expect(protectedProofCollector).toContain('partnerDevelopment');
    expect(protectedProofCollector).toContain('checkoutHandoffEvidenceHash');
    expect(protectedProofCollector).toContain('paymentAttempted: false');
    expect(protectedProofCollector).toContain('orderSubmitted: false');
    expect(protectedProofCollector).not.toContain('exactTestOrder');
    expect(protectedProofCollector).not.toContain('orders(first');
    expect(protectedProofCollector).not.toContain('UPSTASH_REDIS');
    expect(protectedProofCollector).not.toContain('confirmation-hash');
    expect(protectedProofCollector).not.toContain('order-status-hash');
    expect(protectedProof).not.toContain('confirmation_evidence_hash');
    expect(protectedProof).not.toContain('order_status_evidence_hash');
  });

  it('stages one checkout-enabled Production candidate without aliases', () => {
    expect(candidate).toContain('workflow_dispatch:');
    expect(candidate).toContain('environment: Production');
    expect(candidate).toContain('fetch-depth: 0');
    expect(candidate).toContain('NEXT_PUBLIC_COMMERCE_ENVIRONMENT: production');
    expect(candidate).toMatch(/SHOPIFY_CART_UI_ENABLED: ['"]true['"]/);
    expect(candidate).toMatch(/SHOPIFY_CHECKOUT_ENABLED: ['"]true['"]/);
    expect(candidate).toContain('action="/api/cart"');
    expect(candidate).toContain('protected-release-receipt.mjs verify');
    expect(candidate).toContain('staging_sha:');
    expect(candidate).toContain('production_pr:');
    expect(candidate).toContain('verify-staging-promotion.mjs');
    expect(candidate).toContain('PROTECTED_PROOF_STAGING_SHA_MISMATCH');
    expect(candidate).not.toContain('PROTECTED_PROOF_SHA_MISMATCH');
    expect(candidate).toContain('VERCEL_PROJECT_LINK_MISMATCH');
    expect(candidate).toContain('VERCEL_ORG_LINK_MISMATCH');
    expect(candidate).toContain('vercel build --prod');
    expect(
      candidate.match(
        /vercel deploy --prebuilt --archive=tgz --prod --skip-domain/g
      )
    ).toHaveLength(1);
    expect(candidate).toContain('--meta cpArtifactKind=staged-production');
    expect(candidate).toContain('--meta cpBuildEnvironment=production');
    expect(candidate).toContain('--meta cpCheckoutEnabled=true');
    expect(candidate).not.toContain('safe-fallback');
    expect(candidate).not.toContain('SHOPIFY_CHECKOUT_ENABLED=false');
    expect(candidate).not.toMatch(/vercel\s+(promote|rollback)/);
    expect(
      workflowStep(candidate, 'Build exact Production artifact')
    ).toContain('VERCEL_TOKEN');
  });

  it('verifies evidence-only ancestry from full Git history without rename or symlink ambiguity', () => {
    expect(candidate).toContain('fetch-depth: 0');
    expect(production).toContain('fetch-depth: 0');
    expect(productionCommerceVerifier).toContain(
      "['merge-base', '--is-ancestor', candidateSha, expectedSha]"
    );
    expect(productionCommerceVerifier).toContain(
      "['diff', '--no-renames', '--name-only'"
    );
    expect(productionCommerceVerifier).toContain(
      "['ls-tree', '-rz', expectedSha, '--', ...changedPaths]"
    );
  });

  it('binds Production to an approved Staging tree through a merged staging-to-main PR', () => {
    expect(production).toContain('staging_sha:');
    expect(production).toContain('production_pr:');
    expect(production).toContain('verify-staging-promotion.mjs');
    expect(production).toContain('PROTECTED_PROOF_STAGING_SHA_MISMATCH');
    expect(production).not.toContain('PROTECTED_PROOF_SHA_MISMATCH');
    expect(stagingPromotionVerifier).toContain(
      "['merge-base', '--is-ancestor', ancestor, descendant]"
    );
    expect(stagingPromotionVerifier).toContain('`${sha}^{tree}`');
    expect(stagingPromotionVerifier).toContain(
      'tree(stagingSha) === tree(productionSha)'
    );
  });

  it('promotes only the reviewed candidate and restores only the prior checkout-enabled deployment', () => {
    expect(production).toContain('previous_checkout_enabled_deployment:');
    expect(production).toContain('fetch-depth: 0');
    expect(production).toContain('verify-checkout-health.mjs');
    expect(checkoutHealthVerifier).toContain('action="/api/cart"');
    expect(production).toContain('protected-release-receipt.mjs verify');
    expect(production).toContain('vercel promote "$CANDIDATE"');
    expect(production).toContain('vercel promote "$PREVIOUS"');
    expect(production).toContain('previous.id !== live.id');
    expect(production).toContain("steps.receipt.outcome != 'success'");
    expect(production).toContain("steps.receipt_upload.outcome != 'success'");
    expect(production).toContain('ROLLBACK_SOURCE_IDENTITY_MISMATCH');
    expect(production).not.toContain('safe-fallback');
    expect(production).not.toContain('SHOPIFY_CHECKOUT_ENABLED=false');
    expect(production).not.toMatch(/vercel\s+rollback/);
    expect(production).not.toMatch(/vercel\s+(build|deploy)/);
    expect(production).not.toContain('pull_request_target');
  });

  it('encodes artifact role, distinctness, promotion-source, and unsafe-anchor invariants', () => {
    for (const requirement of [
      "artifactKind: 'immutable-preview'",
      "artifactKind: 'staged-production'",
      "artifactKind: 'safe-fallback'",
      'candidate.inspect.id !== fallback.inspect.id',
      'fallback.inspect.id !== anchor.id',
      "listed?.meta?.action === 'promote'",
      'promotedFrom === source.inspect.id',
    ])
      expect(verifier).toContain(requirement);
    expect(fallbackSelector).toContain(
      'safeFallback.id !== productionAnchor.id'
    );
    expect(fallbackSelector).toContain(
      'safe_fallback_deployment_id=${safeFallback.id}'
    );
    expect(fallbackSelector).not.toContain(
      'safe_fallback_deployment_id=${productionAnchor.id}'
    );
  });

  it('executes a valid immutable Preview receipt fixture', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-preview-'));
    try {
      const fixtures = previewFixtures(directory, {
        metadata: { cpCheckoutEnabled: 'true' },
        // Vercel CLI 56 list JSON omits deployment IDs; the verifier must use
        // the exact immutable provider URL as the list-to-inspect join key.
        listed: { id: undefined },
        productionBefore: { aliases: [] },
      });
      const output = join(directory, 'receipt.json');
      const result = runVerifier([
        'preview',
        '--preview-inspect',
        fixtures.inspect,
        '--deployment-list',
        fixtures.deploymentList,
        '--production-before',
        fixtures.before,
        '--production-after',
        fixtures.after,
        '--expected-sha',
        testSha,
        '--expected-release',
        'v-test',
        '--expected-pull-request',
        '42',
        '--output',
        output,
      ]);
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({
        deploymentId: 'dpl_preview',
        target: 'preview',
        pullRequest: 42,
        artifactKind: 'immutable-preview',
        buildEnvironment: 'preview',
        checkoutEnabled: true,
        productionDomainsAssigned: false,
        productionBeforeDeploymentId: 'dpl_old',
        productionAfterPreviewDeploymentId: 'dpl_old',
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('executes a valid protected Staging deployment receipt fixture', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-staging-'));
    try {
      const fixtures = previewFixtures(directory, {
        metadata: {
          cpArtifactKind: 'protected-staging',
          cpCheckoutEnabled: 'true',
        },
        productionBefore: { aliases: [] },
      });
      const stagingInspect = JSON.parse(readFileSync(fixtures.inspect, 'utf8'));
      const aliasInspect = writeJson(directory, 'staging-alias.json', {
        ...stagingInspect,
        readyState: 'READY',
      });
      const output = join(directory, 'receipt.json');
      const result = runVerifier([
        'staging',
        '--staging-inspect',
        fixtures.inspect,
        '--staging-alias-inspect',
        aliasInspect,
        '--deployment-list',
        fixtures.deploymentList,
        '--production-before',
        fixtures.before,
        '--production-after',
        fixtures.after,
        '--expected-sha',
        testSha,
        '--expected-release',
        'v-test',
        '--expected-pull-request',
        '42',
        '--output',
        output,
      ]);
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({
        schemaVersion: 'cp.protected-staging-deployment-receipt.v1',
        gitCommitSha: testSha,
        artifactKind: 'protected-staging',
        alias: 'staging.carlophillips.com',
        checkoutEnabled: true,
        productionBeforeDeploymentId: 'dpl_old',
        productionAfterPreviewDeploymentId: 'dpl_old',
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ['Production target', { inspect: { target: 'production' } }],
    ['wrong SHA', { metadata: { cpGitCommitSha: 'b'.repeat(40) } }],
    ['wrong pull request', { metadata: { cpPullRequest: '41' } }],
    ['wrong role', { metadata: { cpArtifactKind: 'staged-production' } }],
    ['wrong environment', { metadata: { cpBuildEnvironment: 'production' } }],
    ['checkout disabled', { metadata: { cpCheckoutEnabled: 'false' } }],
    ['alias leakage', { inspect: { aliases: ['www.carlophillips.com'] } }],
    ['Production drift', { productionAfter: { id: 'dpl_other' } }],
  ])('rejects immutable Preview tampering: %s', (_label, overrides) => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-preview-invalid-'));
    try {
      const fixtures = previewFixtures(directory, overrides);
      const result = runVerifier([
        'preview',
        '--preview-inspect',
        fixtures.inspect,
        '--deployment-list',
        fixtures.deploymentList,
        '--production-before',
        fixtures.before,
        '--production-after',
        fixtures.after,
        '--expected-sha',
        testSha,
        '--expected-release',
        'v-test',
        '--expected-pull-request',
        '42',
        '--output',
        join(directory, 'receipt.json'),
      ]);
      expect(result.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('executes a valid distinct candidate and safe-fallback receipt fixture', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-release-pair-'));
    try {
      const fixtures = releasePairFixtures(directory);
      const output = join(directory, 'receipt.json');
      const result = runVerifier(pairArguments(fixtures, output));
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({
        candidateDeploymentId: 'dpl_candidate',
        candidateArtifactKind: 'staged-production',
        safeFallbackDeploymentId: 'dpl_fallback',
        safeFallbackArtifactKind: 'safe-fallback',
        deploymentsDistinct: true,
        checkoutEnabled: false,
        productionBeforeDeploymentId: 'dpl_old',
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('accepts a checkout-enabled candidate only beside a fail-closed safe fallback', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-release-pair-enabled-'));
    try {
      const fixtures = releasePairFixtures(directory, {
        candidateMetadata: { cpCheckoutEnabled: 'true' },
      });
      const output = join(directory, 'receipt.json');
      const result = runVerifier(pairArguments(fixtures, output, null, true));
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({
        checkoutEnabled: true,
        safeFallbackCheckoutEnabled: false,
      });

      const wrongExpectation = runVerifier(
        pairArguments(
          fixtures,
          join(directory, 'wrong-receipt.json'),
          null,
          false
        )
      );
      expect(wrongExpectation.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    [
      'candidate wrong role',
      { candidateMetadata: { cpArtifactKind: 'safe-fallback' } },
    ],
    [
      'fallback wrong role',
      { fallbackMetadata: { cpArtifactKind: 'staged-production' } },
    ],
    [
      'fallback wrong SHA',
      { fallbackMetadata: { cpGitCommitSha: 'b'.repeat(40) } },
    ],
    ['fallback wrong release', { fallbackMetadata: { cpRelease: 'wrong' } }],
    [
      'fallback wrong environment',
      { fallbackMetadata: { cpBuildEnvironment: 'preview' } },
    ],
    [
      'unreviewed candidate checkout enabled',
      { candidateMetadata: { cpCheckoutEnabled: 'true' } },
    ],
    [
      'fallback checkout enabled',
      { fallbackMetadata: { cpCheckoutEnabled: 'true' } },
    ],
    [
      'candidate alias leakage',
      { candidateInspect: { aliases: ['www.carlophillips.com'] } },
    ],
    [
      'fallback alias leakage',
      { fallbackInspect: { aliases: ['www.carlophillips.com'] } },
    ],
    ['same deployment ID', { fallbackInspect: { id: 'dpl_candidate' } }],
    [
      'same immutable URL',
      { fallbackInspect: { url: 'cp-candidate.vercel.app' } },
    ],
    ['unsafe anchor used as fallback', { fallbackInspect: { id: 'dpl_old' } }],
    ['concurrent Production change', { productionAfter: { id: 'dpl_other' } }],
  ])('rejects release-pair tampering: %s', (_label, overrides) => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-pair-invalid-'));
    try {
      const fixtures = releasePairFixtures(directory, overrides);
      const result = runVerifier(
        pairArguments(fixtures, join(directory, 'receipt.json'))
      );
      expect(result.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejects a release pair whose live Production differs from the reviewed drift anchor', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-anchor-invalid-'));
    try {
      const fixtures = releasePairFixtures(directory);
      const result = runVerifier(
        pairArguments(fixtures, join(directory, 'receipt.json'), 'dpl_wrong')
      );
      expect(result.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('accepts provider-recorded exact candidate promotion and rejects source substitution', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-production-'));
    try {
      const fixtures = releasePairFixtures(directory);
      const run = (overrides) => {
        const promoted = promotionFiles(directory, 'candidate', overrides);
        return runVerifier([
          'production',
          '--candidate-inspect',
          fixtures.candidateInspect,
          '--fallback-inspect',
          fixtures.fallbackInspect,
          '--deployment-list',
          fixtures.deploymentList,
          '--production-before',
          fixtures.before,
          '--production-after',
          promoted.after,
          '--production-list',
          promoted.list,
          '--expected-production-anchor',
          'dpl_old',
          '--expected-sha',
          testSha,
          '--expected-release',
          'v-test',
          '--output',
          join(directory, 'production-receipt.json'),
        ]);
      };
      expect(run().status).toBe(0);
      expect(
        run({ metadata: { originalDeploymentId: 'dpl_other' } }).status
      ).not.toBe(0);
      expect(run({ metadata: { action: 'deploy' } }).status).not.toBe(0);
      expect(
        run({ metadata: { cpArtifactKind: 'safe-fallback' } }).status
      ).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('preserves the reviewed checkout marker through exact candidate promotion', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-production-enabled-'));
    try {
      const fixtures = releasePairFixtures(directory, {
        candidateMetadata: { cpCheckoutEnabled: 'true' },
      });
      const promoted = promotionFiles(directory, 'candidate', {
        metadata: { cpCheckoutEnabled: 'true' },
      });
      const output = join(directory, 'production-enabled-receipt.json');
      const result = runVerifier([
        'production',
        '--candidate-inspect',
        fixtures.candidateInspect,
        '--fallback-inspect',
        fixtures.fallbackInspect,
        '--deployment-list',
        fixtures.deploymentList,
        '--production-before',
        fixtures.before,
        '--production-after',
        promoted.after,
        '--production-list',
        promoted.list,
        '--expected-production-anchor',
        'dpl_old',
        '--expected-sha',
        testSha,
        '--expected-release',
        'v-test',
        '--expected-candidate-checkout',
        'true',
        '--output',
        output,
      ]);
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({
        artifactRole: 'staged-production',
        checkoutEnabled: true,
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('accepts only the exact verified safe fallback after a failed candidate promotion', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-safe-fallback-'));
    try {
      const fixtures = releasePairFixtures(directory);
      const run = (overrides) => {
        const promoted = promotionFiles(directory, 'fallback', overrides);
        return runVerifier([
          'fallback-production',
          '--candidate-inspect',
          fixtures.candidateInspect,
          '--fallback-inspect',
          fixtures.fallbackInspect,
          '--deployment-list',
          fixtures.deploymentList,
          '--production-before',
          fixtures.before,
          '--production-after',
          promoted.after,
          '--production-list',
          promoted.list,
          '--expected-production-anchor',
          'dpl_old',
          '--expected-sha',
          testSha,
          '--expected-release',
          'v-test',
          '--output',
          join(directory, 'fallback-receipt.json'),
        ]);
      };
      expect(run().status).toBe(0);
      expect(
        run({ metadata: { originalDeploymentId: 'dpl_old' } }).status
      ).not.toBe(0);
      expect(
        run({ metadata: { cpArtifactKind: 'staged-production' } }).status
      ).not.toBe(0);
      expect(
        run({ metadata: { cpGitCommitSha: 'b'.repeat(40) } }).status
      ).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('selects the verified safe fallback and never the current unsafe Production anchor', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cp-fallback-selector-'));
    try {
      const anchor = writeJson(directory, 'anchor.json', productionAnchor());
      const fallback = writeJson(
        directory,
        'fallback.json',
        artifact('fallback')
      );
      const current = writeJson(directory, 'current.json', {
        id: 'dpl_candidate',
        target: 'production',
        readyState: 'READY',
        aliases: ['carlophillips.com', 'www.carlophillips.com'],
      });
      const githubOutput = join(directory, 'github-output.txt');
      const receipt = join(directory, 'plan.json');
      const result = spawnSync(
        process.execPath,
        [
          fallbackSelectorPath,
          '--production-anchor',
          anchor,
          '--safe-fallback',
          fallback,
          '--production-current',
          current,
          '--github-output',
          githubOutput,
          '--output',
          receipt,
        ],
        { encoding: 'utf8' }
      );
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(readFileSync(receipt, 'utf8'))).toMatchObject({
        productionAnchorDeploymentId: 'dpl_old',
        safeFallbackDeploymentId: 'dpl_fallback',
        recoveryRequired: true,
      });
      expect(readFileSync(githubOutput, 'utf8')).toContain(
        'safe_fallback_deployment_id=dpl_fallback'
      );
      expect(readFileSync(githubOutput, 'utf8')).not.toContain(
        'safe_fallback_deployment_id=dpl_old'
      );

      const unsafeFallback = writeJson(
        directory,
        'unsafe-fallback.json',
        artifact('fallback', { id: 'dpl_old' })
      );
      const rejected = spawnSync(
        process.execPath,
        [
          fallbackSelectorPath,
          '--production-anchor',
          anchor,
          '--safe-fallback',
          unsafeFallback,
          '--production-current',
          current,
          '--github-output',
          join(directory, 'rejected-output.txt'),
          '--output',
          join(directory, 'rejected.json'),
        ],
        { encoding: 'utf8' }
      );
      expect(rejected.status).not.toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

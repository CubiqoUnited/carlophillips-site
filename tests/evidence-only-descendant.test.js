import { describe, expect, it } from 'vitest';
import {
  evaluateEvidenceOnlyDescendant,
  isEvidenceOnlyPath,
} from '../lib/releases/evidence-only-descendant.js';

const releaseId = 'cp-signature-hoodie-2026-001';
const candidateSha = 'a'.repeat(40);
const expectedSha = 'b'.repeat(40);

function evaluate(overrides = {}) {
  return evaluateEvidenceOnlyDescendant({
    releaseId,
    candidateSha,
    expectedSha,
    candidateExists: true,
    expectedExists: true,
    expectedIsHead: true,
    candidateIsAncestor: true,
    changedPaths: [
      `releases/${releaseId}/release.json`,
      `releases/${releaseId}/production-observation.json`,
      'reports/HUMAN_INTERVENTION_STICKY_RED.md',
      'test_reports/cp-production-release/report.md',
      'tests/product-release-transition.test.js',
    ],
    symlinkPaths: [],
    ...overrides,
  });
}

describe('evidence-only descendant policy', () => {
  it('accepts exact candidates and verified evidence-only descendants', () => {
    expect(evaluate()).toMatchObject({
      ready: true,
      mode: 'evidence_only_descendant',
      blockers: [],
    });
    expect(
      evaluate({
        expectedSha: candidateSha,
        candidateIsAncestor: false,
        changedPaths: [],
      })
    ).toMatchObject({
      ready: true,
      mode: 'exact_candidate',
      blockers: [],
    });
  });

  it.each([
    'app/products/[handle]/page.js',
    'components/commerce/product-detail.jsx',
    'lib/commerce/shopify-checkout-server.js',
    `releases/${releaseId}/media-manifest.json`,
    'public/products/signature-hoodie/front.jpg',
    'config/shopify-checkout-authorization.json',
    '.github/workflows/vercel-production.yml',
    'scripts/verify-production-commerce-release.mjs',
    'theme.json',
  ])('rejects non-evidence Production change %s', (path) => {
    const decision = evaluate({ changedPaths: [path] });
    expect(decision.ready).toBe(false);
    expect(decision.blockers).toContain('NON_EVIDENCE_CHANGE_DETECTED');
    expect(decision.forbiddenPaths).toEqual([path]);
  });

  it('rejects non-ancestry, missing commits, wrong HEAD and symlinks', () => {
    expect(evaluate({ candidateIsAncestor: false }).blockers).toContain(
      'CANDIDATE_IS_NOT_ANCESTOR'
    );
    expect(evaluate({ candidateExists: false }).blockers).toContain(
      'CANDIDATE_COMMIT_NOT_FOUND'
    );
    expect(evaluate({ expectedExists: false }).blockers).toContain(
      'EXPECTED_COMMIT_NOT_FOUND'
    );
    expect(evaluate({ expectedIsHead: false }).blockers).toContain(
      'EXPECTED_SHA_IS_NOT_HEAD'
    );
    expect(
      evaluate({
        changedPaths: [`releases/${releaseId}/release.json`],
        symlinkPaths: [`releases/${releaseId}/release.json`],
      }).blockers
    ).toContain('SYMLINK_CHANGE_FORBIDDEN');
  });

  it.each([
    '../release.json',
    '/release.json',
    `releases/${releaseId}/../release.json`,
    `releases\\${releaseId}\\release.json`,
    '',
  ])('rejects malformed or escaping path %s', (path) => {
    const decision = evaluate({ changedPaths: [path] });
    expect(decision.ready).toBe(false);
    expect(decision.blockers).toEqual(
      expect.arrayContaining([
        'CHANGED_PATH_INVALID',
        'NON_EVIDENCE_CHANGE_DETECTED',
      ])
    );
  });

  it('keeps the release allowlist exact', () => {
    expect(
      isEvidenceOnlyPath(`releases/${releaseId}/release.json`, releaseId)
    ).toBe(true);
    expect(
      isEvidenceOnlyPath(`releases/${releaseId}/media-approval.json`, releaseId)
    ).toBe(true);
    expect(
      isEvidenceOnlyPath(`releases/${releaseId}/media-manifest.json`, releaseId)
    ).toBe(false);
    expect(
      isEvidenceOnlyPath(`releases/${releaseId}/unreviewed.json`, releaseId)
    ).toBe(false);
  });
});

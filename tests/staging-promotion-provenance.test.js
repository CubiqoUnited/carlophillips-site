import { describe, expect, it } from 'vitest';
import { verifyStagingPromotionProvenance } from '../lib/releases/staging-promotion-provenance';

const stagingSha = 'a'.repeat(40);
const productionSha = 'b'.repeat(40);
const repository = 'CubiqoUnited/carlophillips-site';

function facts(overrides = {}) {
  return {
    stagingSha,
    productionSha,
    repository,
    stagingCommitExists: true,
    productionCommitExists: true,
    stagingIsAncestor: true,
    treesMatch: true,
    productionPullRequest: {
      number: 75,
      state: 'closed',
      merged_at: '2026-09-04T12:00:00Z',
      base: { ref: 'main' },
      head: {
        ref: 'staging',
        sha: stagingSha,
        repo: { full_name: repository },
      },
      merge_commit_sha: productionSha,
    },
    ...overrides,
  };
}

function expectCode(action, code) {
  expect(action).toThrow(expect.objectContaining({ code }));
}

describe('Staging-to-Production provenance', () => {
  it('accepts different branch merge SHAs only when the approved tree is unchanged', () => {
    expect(verifyStagingPromotionProvenance(facts())).toEqual({
      stagingSha,
      productionSha,
      productionPullRequest: 75,
      exactTreePromoted: true,
    });
  });

  it.each([
    [
      'missing commit',
      { stagingCommitExists: false },
      'PROMOTION_COMMIT_MISSING',
    ],
    [
      'wrong PR head',
      {
        productionPullRequest: {
          ...facts().productionPullRequest,
          head: { ...facts().productionPullRequest.head, sha: 'c'.repeat(40) },
        },
      },
      'STAGING_PROOF_NOT_PR_HEAD',
    ],
    [
      'wrong main merge',
      {
        productionPullRequest: {
          ...facts().productionPullRequest,
          merge_commit_sha: 'c'.repeat(40),
        },
      },
      'PRODUCTION_PR_MERGE_SHA_MISMATCH',
    ],
    [
      'missing ancestry',
      { stagingIsAncestor: false },
      'STAGING_NOT_PRODUCTION_ANCESTOR',
    ],
    ['tree drift', { treesMatch: false }, 'STAGING_PRODUCTION_TREE_MISMATCH'],
  ])('fails closed for %s', (_label, overrides, code) => {
    expectCode(() => verifyStagingPromotionProvenance(facts(overrides)), code);
  });
});

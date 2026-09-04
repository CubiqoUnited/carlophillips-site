const SHA = /^[a-f0-9]{40}$/;

export class StagingPromotionProvenanceError extends Error {
  constructor(code) {
    super(code);
    this.name = 'StagingPromotionProvenanceError';
    this.code = code;
  }
}

function fail(code) {
  throw new StagingPromotionProvenanceError(code);
}

export function verifyStagingPromotionProvenance({
  stagingSha,
  productionSha,
  productionPullRequest,
  repository,
  stagingCommitExists,
  productionCommitExists,
  stagingIsAncestor,
  treesMatch,
}) {
  if (!SHA.test(stagingSha || '') || !SHA.test(productionSha || '')) {
    fail('PROMOTION_SHA_INVALID');
  }
  if (!stagingCommitExists || !productionCommitExists) {
    fail('PROMOTION_COMMIT_MISSING');
  }

  const pull = productionPullRequest;
  if (
    !pull ||
    pull.state !== 'closed' ||
    !pull.merged_at ||
    pull.base?.ref !== 'main' ||
    pull.head?.ref !== 'staging' ||
    pull.head?.repo?.full_name !== repository
  ) {
    fail('PRODUCTION_PULL_REQUEST_INVALID');
  }
  if (pull.head?.sha !== stagingSha) fail('STAGING_PROOF_NOT_PR_HEAD');
  if (pull.merge_commit_sha !== productionSha) {
    fail('PRODUCTION_PR_MERGE_SHA_MISMATCH');
  }
  if (!stagingIsAncestor) fail('STAGING_NOT_PRODUCTION_ANCESTOR');
  if (!treesMatch) fail('STAGING_PRODUCTION_TREE_MISMATCH');

  return {
    stagingSha,
    productionSha,
    productionPullRequest: pull.number,
    exactTreePromoted: true,
  };
}

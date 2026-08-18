const COMMIT_PATTERN = /^[a-f0-9]{40}$/;
const RELEASE_PATTERN = /^cp-[a-z0-9-]+$/;

const STATIC_EVIDENCE_PATHS = new Set([
  'docs/status/CURRENT_STATUS.md',
  'docs/status/HUMAN_BLOCKERS.md',
  'reports/HUMAN_INTERVENTION_STICKY_RED.md',
  'tests/admin-control-plane.test.js',
  'tests/contracts.test.js',
  'tests/evidence-reconciliation.test.js',
  'tests/product-release-registry.test.js',
  'tests/product-release-transition.test.js',
]);

const RELEASE_EVIDENCE_FILES = new Set([
  'candidate-build-evidence.json',
  'fulfillment-approval.json',
  'media-approval.json',
  'physical-sample-approval.json',
  'physical-sample-evidence.json',
  'product-approval.json',
  'production-observation.json',
  'release.json',
  'rollback-verification.json',
  'shopify-observation-approval.json',
  'shopify-observation-review.json',
  'staging-evidence.json',
  'staging-readiness.json',
]);

function invalidPath(path) {
  return (
    typeof path !== 'string'
    || path.length === 0
    || path.includes('\0')
    || path.includes('\\')
    || path.startsWith('/')
    || path.split('/').some(segment => segment === '' || segment === '.' || segment === '..')
  );
}

export function isEvidenceOnlyPath(path, releaseId) {
  if (invalidPath(path) || !RELEASE_PATTERN.test(releaseId || '')) return false;
  if (STATIC_EVIDENCE_PATHS.has(path)) return true;
  if (path.startsWith('test_reports/') && path.length > 'test_reports/'.length) return true;

  const releasePrefix = `releases/${releaseId}/`;
  if (!path.startsWith(releasePrefix)) return false;
  return RELEASE_EVIDENCE_FILES.has(path.slice(releasePrefix.length));
}

/**
 * Validate the Git facts collected by the CLI verifier without granting this
 * policy module shell access. Exact candidates pass. Descendants pass only
 * when every endpoint difference is explicitly evidence-only and no changed
 * endpoint path is a symlink.
 */
export function evaluateEvidenceOnlyDescendant({
  releaseId,
  candidateSha,
  expectedSha,
  candidateExists,
  expectedExists,
  expectedIsHead,
  candidateIsAncestor,
  changedPaths = [],
  symlinkPaths = [],
}) {
  const blockers = [];

  if (!RELEASE_PATTERN.test(releaseId || '')) blockers.push('RELEASE_ID_INVALID');
  if (!COMMIT_PATTERN.test(candidateSha || '')) blockers.push('CANDIDATE_SHA_INVALID');
  if (!COMMIT_PATTERN.test(expectedSha || '')) blockers.push('EXPECTED_SHA_INVALID');
  if (!candidateExists) blockers.push('CANDIDATE_COMMIT_NOT_FOUND');
  if (!expectedExists) blockers.push('EXPECTED_COMMIT_NOT_FOUND');
  if (!expectedIsHead) blockers.push('EXPECTED_SHA_IS_NOT_HEAD');

  const exact = candidateSha === expectedSha;
  if (!exact && !candidateIsAncestor) blockers.push('CANDIDATE_IS_NOT_ANCESTOR');

  const malformedPaths = changedPaths.filter(invalidPath);
  if (malformedPaths.length) blockers.push('CHANGED_PATH_INVALID');

  const forbiddenPaths = changedPaths.filter(path => !isEvidenceOnlyPath(path, releaseId));
  if (forbiddenPaths.length) blockers.push('NON_EVIDENCE_CHANGE_DETECTED');

  const changedPathSet = new Set(changedPaths);
  if (symlinkPaths.some(path => changedPathSet.has(path))) blockers.push('SYMLINK_CHANGE_FORBIDDEN');

  return {
    schemaVersion: 'cp.evidence-only-descendant.v1',
    ready: blockers.length === 0,
    mode: blockers.length === 0 ? (exact ? 'exact_candidate' : 'evidence_only_descendant') : 'denied',
    candidateSha: COMMIT_PATTERN.test(candidateSha || '') ? candidateSha : null,
    expectedSha: COMMIT_PATTERN.test(expectedSha || '') ? expectedSha : null,
    changedPaths: [...changedPaths],
    forbiddenPaths,
    symlinkPaths: symlinkPaths.filter(path => changedPathSet.has(path)),
    blockers,
  };
}


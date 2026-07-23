import { evaluateMediaRelease } from '../commerce/media-release-policy';

const ALLOWED_TRANSITIONS = {
  draft: new Set(['staged']),
  staged: new Set(['draft', 'approved']),
  approved: new Set(['staged', 'released']),
  released: new Set(['withdrawn']),
  withdrawn: new Set(),
};

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;
const COMMIT_PATTERN = /^[a-f0-9]{7,40}$/;

function blocker(code, humanAction, resumePoint) {
  return { code, humanAction, resumePoint };
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addStagingBlockers(record, blockers) {
  if (
    record.shopify.variantFingerprintStatus !== 'observed'
    || !FINGERPRINT_PATTERN.test(record.shopify.variantFingerprint || '')
  ) {
    blockers.push(blocker(
      'SHOPIFY_VARIANT_FINGERPRINT_MISSING',
      'An authorized read-only Shopify observer records and fingerprints the exact candidate variants.',
      'Update the Draft Product Release Record with the sanitized Shopify variant fingerprint, then re-evaluate staging.',
    ));
  }

  if (record.fulfillmentMappings.length === 0) {
    blockers.push(blocker(
      'FULFILLMENT_MAPPING_MISSING',
      'An authorized owner verifies at least one provider mapping for the candidate.',
      'Bind the provider product and exact variant fingerprint without ordering, then re-evaluate staging.',
    ));
  } else if (record.fulfillmentMappings.some(mapping => (
    mapping.variantFingerprintStatus !== 'observed'
    || !FINGERPRINT_PATTERN.test(mapping.variantFingerprint || '')
  ))) {
    blockers.push(blocker(
      'FULFILLMENT_VARIANT_FINGERPRINT_MISSING',
      'An authorized provider observer verifies every fulfillment variant mapping.',
      'Record sanitized provider variant fingerprints for every mapping, then re-evaluate staging.',
    ));
  }

  if (!COMMIT_PATTERN.test(record.candidate.gitCommit || '')) {
    blockers.push(blocker(
      'CANDIDATE_COMMIT_MISSING',
      'Select an immutable candidate commit without merging or deploying it.',
      'Record the candidate Git commit in the Product Release Record, then re-evaluate staging.',
    ));
  }
  if (!hasText(record.candidate.buildEvidence)) {
    blockers.push(blocker(
      'BUILD_EVIDENCE_MISSING',
      'Run the approved local quality/build gate for the immutable candidate.',
      'Bind the passing machine-readable build evidence to the candidate, then re-evaluate staging.',
    ));
  }
  if (!hasText(record.candidate.stagingEvidence)) {
    blockers.push(blocker(
      'STAGING_EVIDENCE_MISSING',
      'Restore or select an authorized private staging surface and verify the candidate.',
      'Bind desktop/mobile staging evidence without promoting production, then re-evaluate staging.',
    ));
  }
  if (!record.rollback.strategy || !hasText(record.rollback.planEvidence)) {
    blockers.push(blocker(
      'ROLLBACK_PLAN_MISSING',
      'Define the release-specific withdrawal or previous-release restoration plan.',
      'Bind the rollback plan evidence to the Product Release Record, then re-evaluate staging.',
    ));
  }
  if (
    record.rollback.strategy === 'restore-previous-release'
    && !/^cp-[a-z0-9-]+$/.test(record.rollback.previousReleaseId || '')
  ) {
    blockers.push(blocker(
      'ROLLBACK_PREVIOUS_RELEASE_MISSING',
      'Identify the exact previously approved release that the rollback strategy will restore.',
      'Bind the previous release ID and its immutable evidence before re-evaluating staging.',
    ));
  }
}

function addApprovalBlockers(record, manifest, blockers) {
  for (const [approval, code] of [
    ['product', 'PRODUCT_APPROVAL_REQUIRED'],
    ['media', 'MEDIA_APPROVAL_REQUIRED'],
    ['fulfillment', 'FULFILLMENT_APPROVAL_REQUIRED'],
  ]) {
    if (record.approvals[approval].status !== 'approved') {
      blockers.push(blocker(
        code,
        `The Product Owner or named designee approves the ${approval} evidence for this exact candidate.`,
        `Record the ${approval} approval in the Product Release Record, then re-evaluate approval.`,
      ));
    }
  }

  if (!manifest) {
    blockers.push(blocker(
      'MEDIA_MANIFEST_MISSING',
      'Provide the Media Registry manifest bound to this exact release candidate.',
      'Load and validate the release-bound media manifest, then re-evaluate approval.',
    ));
    return;
  }

  if (record.releaseId !== manifest.releaseId) {
    blockers.push(blocker(
      'MEDIA_MANIFEST_RELEASE_MISMATCH',
      'Bind the media manifest that belongs to this exact release candidate.',
      'Correct the releaseId/mediaManifest binding without copying approvals between releases, then re-evaluate approval.',
    ));
    return;
  }

  let mediaDecision;
  try {
    mediaDecision = evaluateMediaRelease(manifest);
  } catch {
    blockers.push(blocker(
      'MEDIA_MANIFEST_INVALID',
      'Repair the malformed release-bound media manifest without inventing missing evidence.',
      'Validate the manifest against its schema, then re-evaluate approval.',
    ));
    return;
  }
  if (!mediaDecision.ready) {
    blockers.push(blocker(
      'MEDIA_MATRIX_INCOMPLETE',
      'Resolve every required media modality and every bound asset provenance, rights, exact-product, approval, and fallback gate.',
      'Update the release-bound Media Registry with approved assets or approved where-feasible infeasibility evidence, then re-evaluate approval.',
    ));
  }
}

function addReleaseBlockers(record, blockers) {
  if (record.shopify.statusObserved !== 'ACTIVE') {
    blockers.push(blocker(
      'SHOPIFY_ACTIVE_OBSERVATION_REQUIRED',
      'After separately authorized publication, observe that the exact Shopify product is ACTIVE.',
      'Record the dated read-only ACTIVE observation for the same variant fingerprint, then re-evaluate release.',
    ));
  }
  if (!hasText(record.rollback.verificationEvidence)) {
    blockers.push(blocker(
      'ROLLBACK_VERIFICATION_REQUIRED',
      'Verify the release-specific rollback path without disrupting production.',
      'Bind sanitized rollback verification evidence, then re-evaluate release.',
    ));
  }
}

export function evaluateProductReleaseTransition({ record, manifest, targetState }) {
  const blockers = [];
  const allowedTargets = ALLOWED_TRANSITIONS[record.state];
  if (!allowedTargets?.has(targetState)) {
    blockers.push(blocker(
      'INVALID_RELEASE_TRANSITION',
      'Use the permitted Draft → Staged → Approved → Released sequence or an explicit rework/withdrawal path.',
      `Keep the record at ${record.state} and select a permitted next state before re-evaluating.`,
    ));
  }

  blockers.push(...evaluateProductReleaseEvidence({ record, manifest, targetState }).blockers);
  if (targetState === 'withdrawn' && !hasText(record.rollback.verificationEvidence)) {
    blockers.push(blocker(
      'WITHDRAWAL_EVIDENCE_REQUIRED',
      'Execute only the separately authorized rollback or withdrawal action.',
      'Bind the observed withdrawal/rollback evidence, then record the release as withdrawn.',
    ));
  }

  return {
    schemaVersion: 'cp.release-transition-decision.v1',
    releaseId: record.releaseId,
    fromState: record.state,
    targetState,
    allowed: blockers.length === 0,
    blockers,
    candidate: blockers.length === 0 ? { ...structuredClone(record), state: targetState } : null,
  };
}

export function evaluateProductReleaseEvidence({ record, manifest, targetState = record.state }) {
  const blockers = [];
  if (['staged', 'approved', 'released'].includes(targetState)) {
    addStagingBlockers(record, blockers);
  }
  if (['approved', 'released'].includes(targetState)) {
    addApprovalBlockers(record, manifest, blockers);
  }
  if (targetState === 'released') {
    addReleaseBlockers(record, blockers);
  }
  return {
    ready: blockers.length === 0,
    targetState,
    blockers,
  };
}

import { createHash } from 'node:crypto';
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
const VERIFIED_SAMPLE_CHECKS = ['fit', 'colour', 'artworkPlacement', 'finish'];

function blocker(code, humanAction, resumePoint) {
  return { code, humanAction, resumePoint };
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort(compareText).map(key => [key, canonicalize(value[key])]));
}

function fingerprint(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')}`;
}

export function fingerprintReleaseArtifact(value) {
  return fingerprint(value);
}

function orderedMappings(mappings = []) {
  return mappings.map(mapping => ({
    adapter: mapping.adapter,
    providerProductId: mapping.providerProductId,
    variantFingerprint: mapping.variantFingerprint,
    mappingFingerprint: mapping.mappingFingerprint,
  })).sort((left, right) => compareText(
    `${left.adapter}\0${left.providerProductId}`,
    `${right.adapter}\0${right.providerProductId}`
  ));
}

export function fingerprintReleaseApprovalTarget(record) {
  return fingerprint({
    releaseId: record.releaseId,
    candidateCommit: record.candidate.gitCommit,
    shopify: {
      handle: record.shopify.handle,
      variantFingerprint: record.shopify.variantFingerprint,
      commerceFactsFingerprint: record.shopify.commerceFactsFingerprint,
      observationFingerprint: record.shopify.observationFingerprint,
      observationReviewBindingFingerprint: record.shopify.observationReviewBinding?.fingerprint || null,
    },
    fulfillmentMappings: orderedMappings(record.fulfillmentMappings),
    physicalSample: {
      status: record.physicalSample.status,
      providerMappingFingerprint: record.physicalSample.providerMappingFingerprint,
      sampleFingerprint: record.physicalSample.sampleFingerprint,
      evidenceFingerprint: record.physicalSample.evidence?.fingerprint || null,
      approvalEvidenceFingerprint: record.physicalSample.approvalEvidence?.fingerprint || null,
      inspection: record.physicalSample.inspection,
    },
    mediaManifest: record.mediaManifest,
    mediaManifestFingerprint: record.mediaManifestFingerprint,
    buildEvidenceFingerprint: record.candidate.buildEvidence?.fingerprint || null,
    stagingEvidenceFingerprint: record.candidate.stagingEvidence?.fingerprint || null,
    rollbackPlanFingerprint: record.rollback.planEvidence?.fingerprint || null,
  });
}

function isEvidenceBinding(binding, record) {
  return Boolean(
    binding
    && hasText(binding.reference)
    && FINGERPRINT_PATTERN.test(binding.fingerprint || '')
    && binding.releaseId === record.releaseId
    && binding.candidateCommit === record.candidate.gitCommit
    && Number.isFinite(Date.parse(binding.recordedAt))
  );
}

function isApprovalEvidence(evidence, record, expectedTargetFingerprint) {
  return Boolean(
    evidence
    && hasText(evidence.reference)
    && FINGERPRINT_PATTERN.test(evidence.fingerprint || '')
    && evidence.releaseId === record.releaseId
    && evidence.candidateCommit === record.candidate.gitCommit
    && evidence.approvedTargetFingerprint === expectedTargetFingerprint
    && Number.isFinite(Date.parse(evidence.approvedAt))
  );
}

function addBoundEvidenceBlocker(record, blockers, {
  binding,
  missingCode,
  invalidCode,
  humanAction,
  resumePoint,
}) {
  if (!binding) {
    blockers.push(blocker(missingCode, humanAction, resumePoint));
  } else if (!isEvidenceBinding(binding, record)) {
    blockers.push(blocker(invalidCode, humanAction, resumePoint));
  }
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
  if (
    record.shopify.commerceFactsFingerprintStatus !== 'reviewed'
    || !FINGERPRINT_PATTERN.test(record.shopify.commerceFactsFingerprint || '')
  ) {
    blockers.push(blocker(
      'SHOPIFY_COMMERCE_FACTS_REVIEW_MISSING',
      'The Product Owner or named designee reviews the canonical product, price, availability, and variant facts.',
      'Apply the accepted commerce-facts fingerprint to the Draft Product Release Record under separate authorization, then re-evaluate staging.',
    ));
  }
  if (
    record.shopify.observationFingerprintStatus !== 'reviewed'
    || !FINGERPRINT_PATTERN.test(record.shopify.observationFingerprint || '')
    || !hasText(record.shopify.observationReviewEvidence)
  ) {
    blockers.push(blocker(
      'SHOPIFY_PRODUCT_OBSERVATION_REVIEW_MISSING',
      'The Product Owner or named designee reviews the exact sanitized Shopify observation envelope.',
      'Apply the accepted candidate observation fingerprint and durable review evidence to the Draft Product Release Record under separate authorization, then re-evaluate staging.',
    ));
  }
  if (!isEvidenceBinding(record.shopify.observationReviewBinding, record)) {
    blockers.push(blocker(
      'SHOPIFY_OBSERVATION_REVIEW_BINDING_INVALID',
      'Bind the reviewed observation evidence fingerprint to this exact release and candidate commit.',
      'Replace the loose, stale, or cross-candidate review reference before re-evaluating staging.',
    ));
  }

  if (record.fulfillmentMappings.length === 0) {
    blockers.push(blocker(
      'FULFILLMENT_MAPPING_MISSING',
      'An authorized owner verifies at least one provider mapping for the candidate.',
      'Bind the provider product and exact mapping and variant fingerprints without ordering, then re-evaluate staging.',
    ));
  } else {
    if (record.fulfillmentMappings.some(mapping => (
      mapping.variantFingerprintStatus !== 'observed'
      || !FINGERPRINT_PATTERN.test(mapping.variantFingerprint || '')
    ))) {
      blockers.push(blocker(
        'FULFILLMENT_VARIANT_FINGERPRINT_MISSING',
        'An authorized provider observer verifies every fulfillment variant mapping.',
        'Record sanitized provider variant fingerprints for every mapping, then re-evaluate staging.',
      ));
    }
    if (record.fulfillmentMappings.some(mapping => (
      mapping.mappingFingerprintStatus !== 'reviewed'
      || !FINGERPRINT_PATTERN.test(mapping.mappingFingerprint || '')
    ))) {
      blockers.push(blocker(
        'FULFILLMENT_MAPPING_FINGERPRINT_MISSING',
        'An authorized provider observer reviews the exact product, design, decoration, and variant mapping envelope.',
        'Record the sanitized provider-mapping fingerprint without ordering or enabling fulfillment, then re-evaluate staging.',
      ));
    }
  }

  if (!COMMIT_PATTERN.test(record.candidate.gitCommit || '')) {
    blockers.push(blocker(
      'CANDIDATE_COMMIT_MISSING',
      'Select an immutable candidate commit without merging or deploying it.',
      'Record the candidate Git commit in the Product Release Record, then re-evaluate staging.',
    ));
  }
  if (!FINGERPRINT_PATTERN.test(record.mediaManifestFingerprint || '')) {
    blockers.push(blocker(
      'MEDIA_MANIFEST_FINGERPRINT_MISSING',
      'Fingerprint the exact release-bound Media Registry manifest for the immutable candidate.',
      'Record the manifest SHA-256 binding without changing any media approval, then re-evaluate staging.',
    ));
  }
  addBoundEvidenceBlocker(record, blockers, {
    binding: record.candidate.buildEvidence,
    missingCode: 'BUILD_EVIDENCE_MISSING',
    invalidCode: 'BUILD_EVIDENCE_BINDING_INVALID',
    humanAction: 'Run the approved local quality/build gate for the immutable candidate.',
    resumePoint: 'Bind the passing machine-readable build evidence fingerprint to this release and candidate commit, then re-evaluate staging.',
  });
  addBoundEvidenceBlocker(record, blockers, {
    binding: record.candidate.stagingEvidence,
    missingCode: 'STAGING_EVIDENCE_MISSING',
    invalidCode: 'STAGING_EVIDENCE_BINDING_INVALID',
    humanAction: 'Restore or select an authorized private staging surface and verify the candidate.',
    resumePoint: 'Bind desktop/mobile staging evidence to this release and candidate commit without promoting Production, then re-evaluate staging.',
  });
  if (!record.rollback.strategy) {
    blockers.push(blocker(
      'ROLLBACK_PLAN_MISSING',
      'Define the release-specific withdrawal or previous-release restoration plan.',
      'Bind the rollback plan evidence to the Product Release Record, then re-evaluate staging.',
    ));
  } else {
    addBoundEvidenceBlocker(record, blockers, {
      binding: record.rollback.planEvidence,
      missingCode: 'ROLLBACK_PLAN_MISSING',
      invalidCode: 'ROLLBACK_PLAN_BINDING_INVALID',
      humanAction: 'Fingerprint the release-specific withdrawal or previous-release restoration plan.',
      resumePoint: 'Bind the rollback plan to this release and candidate commit, then re-evaluate staging.',
    });
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

  const expectedTargetFingerprint = fingerprintReleaseApprovalTarget(record);
  if (record.candidate.releaseEvidenceFingerprint !== expectedTargetFingerprint) {
    blockers.push(blocker(
      'RELEASE_EVIDENCE_FINGERPRINT_MISMATCH',
      'Fingerprint the complete candidate truth envelope after every bound input is final.',
      'Record the derived release-evidence fingerprint for this exact release and candidate; never reuse it across candidates.',
    ));
  }
}

function addPhysicalSampleBlockers(record, blockers) {
  const sample = record.physicalSample;
  if (sample.status !== 'approved') {
    blockers.push(blocker(
      'PHYSICAL_SAMPLE_APPROVAL_REQUIRED',
      'Order and inspect the exact approved sample only after the item, destination, and total cost are separately authorized.',
      'Record delivered sample evidence and explicit approval without inferring physical truth from provider or AI imagery.',
    ));
    return;
  }
  if (VERIFIED_SAMPLE_CHECKS.some(check => sample.inspection?.[check] !== 'verified')) {
    blockers.push(blocker(
      'PHYSICAL_SAMPLE_INSPECTION_INCOMPLETE',
      'Inspect fit, colour, artwork placement, and finish on the delivered exact-product sample.',
      'Bind each verified inspection result or reject the sample before re-evaluating approval.',
    ));
  }
  if (
    !FINGERPRINT_PATTERN.test(sample.providerMappingFingerprint || '')
    || !record.fulfillmentMappings.some(mapping => mapping.mappingFingerprint === sample.providerMappingFingerprint)
  ) {
    blockers.push(blocker(
      'PHYSICAL_SAMPLE_MAPPING_MISMATCH',
      'Prove that the delivered sample came from the exact reviewed provider mapping.',
      'Bind the sample to a reviewed fulfillment mapping fingerprint; do not transfer evidence between provider configurations.',
    ));
  }
  if (!FINGERPRINT_PATTERN.test(sample.sampleFingerprint || '')) {
    blockers.push(blocker(
      'PHYSICAL_SAMPLE_FINGERPRINT_MISSING',
      'Fingerprint the exact sample inspection envelope and immutable capture evidence.',
      'Record the sanitized sample fingerprint before re-evaluating approval.',
    ));
  }
  if (!isEvidenceBinding(sample.evidence, record)) {
    blockers.push(blocker(
      'PHYSICAL_SAMPLE_EVIDENCE_BINDING_INVALID',
      'Bind immutable delivery and inspection evidence to this release and candidate commit.',
      'Correct the release/candidate/fingerprint descriptor without inventing sample evidence, then re-evaluate approval.',
    ));
  }
  if (!isEvidenceBinding(sample.approvalEvidence, record)) {
    blockers.push(blocker(
      'PHYSICAL_SAMPLE_APPROVAL_EVIDENCE_INVALID',
      'Record explicit approval evidence for this exact inspected sample.',
      'Bind the approval evidence to this release and candidate commit, then re-evaluate approval.',
    ));
  }
}

function addApprovalBlockers(record, manifest, blockers) {
  addPhysicalSampleBlockers(record, blockers);
  const expectedTargetFingerprint = fingerprintReleaseApprovalTarget(record);
  for (const [approval, requiredCode, bindingCode] of [
    ['product', 'PRODUCT_APPROVAL_REQUIRED', 'PRODUCT_APPROVAL_BINDING_INVALID'],
    ['media', 'MEDIA_APPROVAL_REQUIRED', 'MEDIA_APPROVAL_BINDING_INVALID'],
    ['fulfillment', 'FULFILLMENT_APPROVAL_REQUIRED', 'FULFILLMENT_APPROVAL_BINDING_INVALID'],
  ]) {
    const decision = record.approvals[approval];
    if (decision.status !== 'approved') {
      blockers.push(blocker(
        requiredCode,
        `The Product Owner or named designee approves the ${approval} evidence for this exact candidate.`,
        `Record the ${approval} approval in the Product Release Record, then re-evaluate approval.`,
      ));
    } else if (!isApprovalEvidence(decision.evidence, record, expectedTargetFingerprint)) {
      blockers.push(blocker(
        bindingCode,
        `Bind the ${approval} approval to the complete evidence fingerprint for this exact release and candidate.`,
        `Replace the stale, tampered, or cross-candidate ${approval} approval evidence, then re-evaluate approval.`,
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

function latestApprovalTime(record) {
  const approvalTimes = Object.values(record.approvals)
    .map(approval => Date.parse(approval.evidence?.approvedAt))
    .filter(Number.isFinite);
  const sampleApprovalTime = Date.parse(record.physicalSample.approvalEvidence?.recordedAt);
  if (Number.isFinite(sampleApprovalTime)) approvalTimes.push(sampleApprovalTime);
  return approvalTimes.length ? Math.max(...approvalTimes) : Number.NaN;
}

function addReleaseBlockers(record, blockers) {
  if (record.shopify.statusObserved !== 'ACTIVE') {
    blockers.push(blocker(
      'SHOPIFY_ACTIVE_OBSERVATION_REQUIRED',
      'After separately authorized publication, observe that the exact Shopify product is ACTIVE.',
      'Record the dated read-only ACTIVE observation for the same reviewed facts, then re-evaluate release.',
    ));
  }

  const observation = record.shopify.productionObservation;
  if (!observation) {
    blockers.push(blocker(
      'PRODUCTION_OBSERVATION_REQUIRED',
      'After approval and separately authorized publication, capture a fresh read-only Production observation.',
      'Bind the fresh ACTIVE observation and capability evidence to this release and candidate, then re-evaluate release.',
    ));
  } else {
    if (observation.environment !== 'production' || observation.statusObserved !== 'ACTIVE') {
      blockers.push(blocker(
        'PRODUCTION_ACTIVE_OBSERVATION_INVALID',
        'Observe the exact product as ACTIVE from the Production environment.',
        'Replace the non-Production or non-ACTIVE observation before re-evaluating release.',
      ));
    }
    if (
      observation.variantFingerprint !== record.shopify.variantFingerprint
      || observation.commerceFactsFingerprint !== record.shopify.commerceFactsFingerprint
      || observation.reviewedObservationFingerprint !== record.shopify.observationFingerprint
      || !FINGERPRINT_PATTERN.test(observation.currentObservationFingerprint || '')
    ) {
      blockers.push(blocker(
        'PRODUCTION_OBSERVATION_BINDING_MISMATCH',
        'Compare fresh Production identity and commerce facts to the reviewed release while preserving the new observation envelope as separate audit evidence.',
        'Reject changed facts or bind a new reviewed release; do not copy the historical full-observation fingerprint into a fresh read.',
      ));
    }
    if (!isEvidenceBinding(observation.capabilityEvidence, record)) {
      blockers.push(blocker(
        'PRODUCTION_CAPABILITY_EVIDENCE_INVALID',
        'Bind the fresh Production observation to the exact authorized read capability evidence.',
        'Correct the release/candidate/fingerprint descriptor before re-evaluating release.',
      ));
    }
    const observedAt = Date.parse(observation.observedAt);
    const approvedAt = latestApprovalTime(record);
    if (!Number.isFinite(observedAt) || !Number.isFinite(approvedAt) || observedAt <= approvedAt) {
      blockers.push(blocker(
        'PRODUCTION_OBSERVATION_STALE',
        'Capture the Production observation after all release and physical-sample approvals are recorded.',
        'Bind a newer read-only observation without reusing pre-approval evidence, then re-evaluate release.',
      ));
    }
  }

  if (!record.rollback.verificationEvidence) {
    blockers.push(blocker(
      'ROLLBACK_VERIFICATION_REQUIRED',
      'Verify the release-specific rollback path without disrupting Production.',
      'Bind sanitized rollback verification evidence, then re-evaluate release.',
    ));
  } else if (!isEvidenceBinding(record.rollback.verificationEvidence, record)) {
    blockers.push(blocker(
      'ROLLBACK_VERIFICATION_BINDING_INVALID',
      'Bind rollback verification to this exact release and candidate.',
      'Replace stale, tampered, or cross-candidate rollback evidence, then re-evaluate release.',
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
  if (targetState === 'withdrawn') {
    if (!record.rollback.verificationEvidence) {
      blockers.push(blocker(
        'WITHDRAWAL_EVIDENCE_REQUIRED',
        'Execute only the separately authorized rollback or withdrawal action.',
        'Bind the observed withdrawal/rollback evidence, then record the release as withdrawn.',
      ));
    } else if (!isEvidenceBinding(record.rollback.verificationEvidence, record)) {
      blockers.push(blocker(
        'WITHDRAWAL_EVIDENCE_BINDING_INVALID',
        'Bind withdrawal evidence to this exact release and candidate.',
        'Replace stale, tampered, or cross-candidate evidence before recording the release as withdrawn.',
      ));
    }
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
    if (
      manifest
      && FINGERPRINT_PATTERN.test(record.mediaManifestFingerprint || '')
      && record.mediaManifestFingerprint !== fingerprint(manifest)
    ) {
      blockers.push(blocker(
        'MEDIA_MANIFEST_FINGERPRINT_MISMATCH',
        'Fingerprint the exact Media Registry manifest supplied for this release evaluation.',
        'Reject the tampered or cross-candidate manifest and update the complete release-evidence fingerprint before re-evaluating.',
      ));
    }
  }
  if (['approved', 'released'].includes(targetState)) addApprovalBlockers(record, manifest, blockers);
  if (targetState === 'released') addReleaseBlockers(record, blockers);
  return { ready: blockers.length === 0, targetState, blockers };
}

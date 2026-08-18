import { deriveEvidenceReconciliation } from './evidence-reconciliation';
import { deriveOrderLifecycleAdminProjection } from '../operations/order-lifecycle';

const sectionDefinitions = [
  ['overview', 'Overview', 'Current readiness, blockers, and permitted next actions.'],
  ['evidence', 'Evidence health', 'Freshness, conflicts, superseded blockers, and operating-authority boundaries.'],
  ['theme', 'Theme', 'Product Owner-only token proposals through the repository review workflow.'],
  ['drops', 'Briefs & drops', 'Designer-led and trend-led candidate inputs.'],
  ['runs', 'Jobs & runs', 'Pipeline work, attempts, evidence counts, and blockers.'],
  ['products', 'Products, POD & samples', 'Product truth, provider mapping, and physical verification.'],
  ['media', 'Media Registry', 'Required modalities, quarantine, approvals, and binding coverage.'],
  ['releases', 'Releases', 'Canonical release state and immutable candidate evidence.'],
  ['approvals', 'Approvals', 'Pending human decisions without mutation authority.'],
  ['commands', 'Commands', 'Reviewed command policy and the exact gates preventing execution.'],
  ['publication', 'Preview & publication', 'Staging, release, Production, and rollback gates.'],
  ['orders', 'Orders & fulfillment', 'Payment, POD handoff, fulfillment, shipment, and tracking.'],
  ['post-sale', 'Post-sale', 'Support, returns, refunds, and review eligibility.'],
  ['analytics', 'Analytics', 'Consent-aware measurement and Shopify reconciliation readiness.'],
  ['capabilities', 'Capabilities', 'Integration ownership, callable surfaces, and approval boundaries.'],
  ['audit', 'Audit history', 'Historical PipelineRun event projection; durable hash-chained audit is not implemented.'],
];

export const adminSections = sectionDefinitions.map(([id, label, description]) => ({ id, label, description }));

const statusPriority = {
  failed: 0,
  blocked: 1,
  human_required: 2,
  pending: 3,
  partial: 4,
  stale: 5,
  draft: 6,
  succeeded: 7,
  approved: 8,
  released: 9,
};

export function normalizeStatus(status) {
  return String(status || 'unknown').trim().toLowerCase().replaceAll('-', '_');
}

export function statusLabel(status) {
  return normalizeStatus(status).replaceAll('_', ' ');
}

function summarizeBlocker(blocker) {
  if (!blocker) return null;
  return {
    code: blocker.code,
    humanAction: blocker.humanAction,
    resumePoint: blocker.resumePoint,
  };
}

function approvalEntries(approvals = {}) {
  return Object.entries(approvals).map(([id, approval]) => ({
    id,
    status: normalizeStatus(approval.status),
    owner: approval.owner,
  }));
}

export function deriveAdminControlPlane({ release, mediaManifest, run, registry, authorities, readiness }) {
  const evidence = deriveEvidenceReconciliation({ release, run, registry, readiness });
  const lifecycle = deriveOrderLifecycleAdminProjection();
  const stages = readiness.stages.map(stage => ({
    id: stage.id,
    label: stage.label,
    group: stage.group,
    status: normalizeStatus(stage.status),
    owner: stage.owner,
    evidenceCount: stage.evidenceRefs.length,
    blocker: summarizeBlocker(stage.blocker),
  }));
  const openStages = stages.filter(stage => !['succeeded', 'approved', 'released'].includes(stage.status));
  const mediaRequirements = mediaManifest.requirements.map(requirement => ({
    modality: requirement.modality,
    requirement: requirement.requirement,
    status: normalizeStatus(requirement.status),
    assetCount: requirement.assetIds.length,
  }));
  const approvedMedia = mediaManifest.assets.filter(asset => asset.approvalStatus === 'approved');
  const boundMedia = approvedMedia.filter(asset => asset.storefrontBinding);
  const releaseApprovals = approvalEntries(release.approvals);
  const runApprovals = approvalEntries(run.approvals);
  const allApprovals = [...releaseApprovals, ...runApprovals];
  const pendingApprovals = allApprovals.filter(approval => approval.status !== 'approved');
  const authorityEntries = authorities.authorities.map(authority => ({
    id: authority.id,
    owner: authority.owner,
    accountable: authority.accountable,
    productionGate: authority.productionGate,
    failureMode: authority.failureMode,
  }));
  const auditEvents = [...run.events]
    .sort((left, right) => String(right.recordedAt).localeCompare(String(left.recordedAt)))
    .map(event => ({
      id: event.eventId,
      aggregate: event.workItemId,
      status: normalizeStatus(event.status),
      recordedAt: event.recordedAt,
      actor: event.actor,
      evidenceState: 'historical',
    }));
  const commandPolicy = registry.capabilities.find(capability => capability.capability === 'admin-command-authorizer');
  const sampleInspectionComplete = ['fit', 'colour', 'artworkPlacement', 'finish']
    .every(check => release.physicalSample.inspection[check] === 'verified');
  const approvalBindingsComplete = Object.values(release.approvals)
    .every(approval => approval.status === 'approved' && Boolean(approval.evidence));

  return {
    meta: {
      mode: 'local_read_only_review',
      authoritative: false,
      systemStatus: normalizeStatus(readiness.overallStatus),
      generatedFrom: Object.values(readiness.canonicalTruth),
      updatedAt: readiness.updatedAt,
      warning: 'Read-only projection. Canonical artifacts remain authoritative; historical technical access is separate from operating authority, and no action on this screen mutates an external system.',
    },
    metrics: {
      stages: stages.length,
      openStages: openStages.length,
      humanRequired: stages.filter(stage => stage.status === 'human_required').length,
      pendingApprovals: pendingApprovals.length,
      approvedMedia: approvedMedia.length,
      boundMedia: boundMedia.length,
      evidenceConflicts: evidence.metrics.conflicts,
    },
    release: {
      id: release.releaseId,
      state: normalizeStatus(release.state),
      approvals: releaseApprovals,
      shopifyObservation: {
        status: normalizeStatus(release.shopify.statusObserved),
        observedAt: release.shopify.observedAt,
        identityBound: release.shopify.observationFingerprintStatus === 'reviewed',
        variantsBound: release.shopify.variantFingerprintStatus === 'observed',
        commerceFactsBound: release.shopify.commerceFactsFingerprintStatus === 'reviewed',
      },
      candidate: {
        commitBound: Boolean(release.candidate.gitCommit),
        buildEvidence: Boolean(release.candidate.buildEvidence),
        stagingEvidence: Boolean(release.candidate.stagingEvidence),
      },
      rollbackVerified: Boolean(release.rollback.verificationEvidence),
      bindings: [
        { id: 'provider-mapping', gate: 'Provider mapping fingerprint', status: release.fulfillmentMappings.every(mapping => mapping.mappingFingerprintStatus === 'reviewed') ? 'reviewed' : 'missing', boundary: 'Exact product, design, decoration, and variants' },
        { id: 'observation-review', gate: 'Observation review evidence', status: release.shopify.observationReviewBinding ? 'bound' : 'missing', boundary: 'Must match this release and candidate commit' },
        { id: 'physical-sample', gate: 'Physical sample', status: normalizeStatus(release.physicalSample.status), boundary: sampleInspectionComplete ? 'Four inspection dimensions verified' : 'Fit, colour, artwork placement, and finish are not all verified' },
        { id: 'sample-evidence', gate: 'Sample evidence and approval', status: release.physicalSample.evidence && release.physicalSample.approvalEvidence ? 'bound' : 'missing', boundary: 'Must match this release, candidate, and provider mapping' },
        { id: 'media-manifest', gate: 'Media manifest fingerprint', status: release.mediaManifestFingerprint ? 'bound' : 'missing', boundary: 'Manifest path alone is not immutable evidence' },
        { id: 'candidate-evidence', gate: 'Build and staging evidence', status: release.candidate.buildEvidence && release.candidate.stagingEvidence ? 'bound' : 'missing', boundary: 'Both descriptors must match this release and commit' },
        { id: 'release-fingerprint', gate: 'Release evidence fingerprint', status: release.candidate.releaseEvidenceFingerprint ? 'bound' : 'missing', boundary: 'Derived from the complete candidate truth envelope' },
        { id: 'approval-bindings', gate: 'Approval bindings', status: approvalBindingsComplete ? 'bound' : 'missing', boundary: 'Product, media, and fulfillment approvals must target the exact envelope' },
        { id: 'production-observation', gate: 'Fresh Production observation', status: release.shopify.productionObservation ? 'observed' : 'missing', boundary: 'Must be ACTIVE, post-approval, and match reviewed identity and commerce facts' },
        { id: 'rollback-verification', gate: 'Rollback verification', status: release.rollback.verificationEvidence ? 'bound' : 'missing', boundary: 'Must match this release and candidate' },
      ],
    },
    run: {
      id: run.runId,
      mode: run.mode,
      state: normalizeStatus(run.state),
      items: evidence.runRows.sort((left, right) => (statusPriority[normalizeStatus(left.sourceStatus)] ?? 99) - (statusPriority[normalizeStatus(right.sourceStatus)] ?? 99)),
    },
    stages,
    blockers: openStages.map(stage => ({
      stageId: stage.id,
      stage: stage.label,
      status: stage.status,
      owner: stage.owner,
      ...stage.blocker,
    })),
    media: {
      requirements: mediaRequirements,
      assetCount: mediaManifest.assets.length,
      approvedCount: approvedMedia.length,
      boundCount: boundMedia.length,
    },
    approvals: pendingApprovals,
    commands: {
      authoritative: false,
      title: 'No executable admin commands.',
      status: 'blocked',
      detail: 'The reviewed-command policy is locally verified, but no identity, durable claim/audit, connector decision, or executor is wired.',
      rows: [
        { id: 'policy', gate: 'Command policy', status: commandPolicy?.accessState || 'unavailable', boundary: 'Pure local decision only' },
        { id: 'identity', gate: 'Identity and role grants', status: 'unavailable', boundary: 'Local review tokens are not remote identity or RBAC' },
        { id: 'idempotency', gate: 'Durable idempotency', status: 'unavailable', boundary: 'No persistent claim store' },
        { id: 'audit', gate: 'Append-only audit', status: 'unavailable', boundary: 'No durable hash-chained event store' },
        { id: 'connector', gate: 'Connector decision', status: 'unavailable', boundary: 'No approved callable connector' },
        { id: 'executor', gate: 'Command executor', status: 'unavailable', boundary: 'No queue, worker, retry, or dead-letter path' },
      ],
    },
    evidence,
    capabilities: evidence.capabilityRows,
    authorities: authorityEntries,
    audit: evidence.audit,
    auditEvents,
    lifecycle,
  };
}

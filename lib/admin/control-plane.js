const sectionDefinitions = [
  ['overview', 'Overview', 'Current readiness, blockers, and permitted next actions.'],
  ['drops', 'Briefs & drops', 'Designer-led and trend-led candidate inputs.'],
  ['runs', 'Jobs & runs', 'Pipeline work, attempts, evidence counts, and blockers.'],
  ['products', 'Products, POD & samples', 'Product truth, provider mapping, and physical verification.'],
  ['media', 'Media Registry', 'Required modalities, quarantine, approvals, and binding coverage.'],
  ['releases', 'Releases', 'Canonical release state and immutable candidate evidence.'],
  ['approvals', 'Approvals', 'Pending human decisions without mutation authority.'],
  ['publication', 'Preview & publication', 'Staging, release, Production, and rollback gates.'],
  ['orders', 'Orders & fulfillment', 'Payment, POD handoff, fulfillment, shipment, and tracking.'],
  ['post-sale', 'Post-sale', 'Support, returns, refunds, and review eligibility.'],
  ['analytics', 'Analytics', 'Consent-aware measurement and Shopify reconciliation readiness.'],
  ['capabilities', 'Capabilities', 'Integration ownership, callable surfaces, and approval boundaries.'],
  ['audit', 'Audit log', 'Sanitized, append-only evidence projection.'],
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
  const runItems = run.workItems.map(item => ({
    id: item.workItemId,
    lane: item.lane,
    capability: item.capability,
    status: normalizeStatus(item.status),
    attempts: item.attempts,
    evidenceCount: item.evidence.length,
    blocker: summarizeBlocker(item.blocker),
  }));
  const releaseApprovals = approvalEntries(release.approvals);
  const runApprovals = approvalEntries(run.approvals);
  const allApprovals = [...releaseApprovals, ...runApprovals];
  const pendingApprovals = allApprovals.filter(approval => approval.status !== 'approved');
  const capabilityEntries = registry.capabilities.map(capability => ({
    id: capability.capability,
    status: normalizeStatus(capability.accessState),
    callableSurface: capability.callableSurface,
    operations: capability.allowedOperations,
    approvals: capability.requiresApproval,
    costGate: capability.costGate,
    draftSafety: capability.draftSafety,
    blocker: summarizeBlocker(capability.blocker),
  }));
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
    }));

  return {
    meta: {
      mode: 'local_read_only_review',
      authoritative: false,
      generatedFrom: Object.values(readiness.canonicalTruth),
      updatedAt: readiness.updatedAt,
      warning: 'Read-only projection. Canonical artifacts remain authoritative; no action on this screen mutates an external system.',
    },
    metrics: {
      stages: stages.length,
      openStages: openStages.length,
      humanRequired: stages.filter(stage => stage.status === 'human_required').length,
      pendingApprovals: pendingApprovals.length,
      approvedMedia: approvedMedia.length,
      boundMedia: boundMedia.length,
    },
    release: {
      id: release.releaseId,
      state: normalizeStatus(release.state),
      approvals: releaseApprovals,
      shopifyObservation: {
        status: normalizeStatus(release.shopify.statusObserved),
        observedAt: release.shopify.observedAt,
        identityBound: release.shopify.observationFingerprintStatus === 'present',
        variantsBound: release.shopify.variantFingerprintStatus === 'present',
        commerceFactsBound: release.shopify.commerceFactsFingerprintStatus === 'present',
      },
      candidate: {
        commitBound: Boolean(release.candidate.gitCommit),
        buildEvidence: Boolean(release.candidate.buildEvidence),
        stagingEvidence: Boolean(release.candidate.stagingEvidence),
      },
      rollbackVerified: Boolean(release.rollback.verificationEvidence),
    },
    run: {
      id: run.runId,
      mode: run.mode,
      state: normalizeStatus(run.state),
      items: runItems.sort((left, right) => (statusPriority[left.status] ?? 99) - (statusPriority[right.status] ?? 99)),
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
    capabilities: capabilityEntries,
    authorities: authorityEntries,
    auditEvents,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_AGE_DAYS = 7;

function toTime(value) {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : null;
}

export function classifyFreshness(observedAt, asOfDate, maxAgeDays = DEFAULT_MAX_AGE_DAYS) {
  const observedTime = toTime(observedAt);
  const asOfTime = toTime(asOfDate);
  if (observedTime === null) return { status: 'not_recorded', ageDays: null };
  if (asOfTime === null) throw new Error('Evidence reconciliation requires a valid as-of date.');

  const ageDays = Math.floor((asOfTime - observedTime) / DAY_MS);
  if (ageDays < 0) return { status: 'conflicting', ageDays };
  return {
    status: ageDays > maxAgeDays ? 'stale' : 'current',
    ageDays,
  };
}

function latestEventFor(run, workItemId) {
  return [...(run.events || [])]
    .filter(event => event.workItemId === workItemId)
    .sort((left, right) => String(right.recordedAt).localeCompare(String(left.recordedAt)))[0] || null;
}

function operationalAuthority(capability) {
  if (capability.accessState === 'write_test_verified') return 'blocked';
  if (capability.accessState === 'write_verified') return 'activation_gated';
  if (capability.accessState === 'read_only_verified') return 'observation_only';
  if (capability.accessState === 'local_verified') return 'local_only';
  return 'blocked';
}

function capabilityEvidenceClass(capability, freshness) {
  if (capability.accessState === 'local_verified') return 'current';
  if (['read_only_verified', 'write_test_verified', 'write_verified'].includes(capability.accessState)) {
    return freshness.status === 'current' ? 'current' : 'historical';
  }
  return 'missing';
}

function capabilityDependency(capability, freshness) {
  if (capability.blocker?.code) return capability.blocker.code;
  if (freshness.status === 'stale' && capability.callableSurface !== 'local') {
    return 'FRESH_OBSERVATION_REQUIRED_FOR_RELEASE_BINDING';
  }
  if (capability.accessState === 'read_only_verified') return 'RELEASE_FINGERPRINT_REVIEW_REQUIRED';
  return 'NONE';
}

function deriveCapabilityRows(registry, asOfDate) {
  return registry.capabilities.map(capability => {
    const observedAt = capability.observedAt
      || (capability.callableSurface !== 'local'
        && ['read_only_verified', 'write_test_verified', 'write_verified'].includes(capability.accessState)
        ? registry.observedAt
        : null);
    const freshness = classifyFreshness(observedAt, asOfDate);
    return {
      id: capability.capability,
      technicalAccess: capability.accessState,
      callableSurface: capability.callableSurface,
      observedAt,
      freshness: freshness.status,
      evidenceClass: capabilityEvidenceClass(capability, freshness),
      operationalAuthority: operationalAuthority(capability),
      blockingDependency: capabilityDependency(capability, freshness),
      operations: capability.allowedOperations,
      approvals: capability.requiresApproval,
      costGate: capability.costGate,
      draftSafety: capability.draftSafety,
      blocker: capability.blocker ? {
        code: capability.blocker.code,
        humanAction: capability.blocker.humanAction,
        resumePoint: capability.blocker.resumePoint,
      } : null,
    };
  });
}

function deriveRunRows(run, registry, asOfDate) {
  const registryCart = registry.capabilities.find(capability => capability.capability === 'shopify-storefront-cart');
  const registryCartTime = toTime(registryCart?.observedAt || registry.observedAt);

  return run.workItems.map(item => {
    const latestEvent = latestEventFor(run, item.workItemId);
    const freshness = classifyFreshness(latestEvent?.recordedAt, asOfDate);
    const staleAuthBlocker = item.blocker?.code === 'SHOPIFY_AUTHENTICATED_SESSION_REQUIRED';
    const superseded = staleAuthBlocker
      && registryCartTime !== null
      && registryCartTime > (toTime(latestEvent?.recordedAt) ?? Number.POSITIVE_INFINITY);

    return {
      id: item.workItemId,
      lane: item.lane,
      capability: item.capability,
      sourceStatus: item.status,
      evidenceState: superseded
        ? 'superseded'
        : (freshness.status === 'not_recorded' ? 'missing' : (freshness.status === 'current' ? 'current' : 'historical')),
      lastObservedAt: latestEvent?.recordedAt || null,
      currentAuthority: superseded
        ? 'Later technical evidence exists; operating authority remains blocked.'
        : 'Historical run evidence only; no current operating authority.',
      attempts: item.attempts,
      evidenceCount: item.evidence.length,
      blocker: item.blocker ? {
        code: item.blocker.code,
        humanAction: item.blocker.humanAction,
        resumePoint: item.blocker.resumePoint,
      } : null,
    };
  });
}

export function deriveEvidenceReconciliation({ release, run, registry, readiness, asOfDate = readiness.updatedAt }) {
  const cart = registry.capabilities.find(capability => capability.capability === 'shopify-storefront-cart');
  const cartObservedAt = cart?.observedAt || registry.observedAt || null;
  const cartFreshness = classifyFreshness(cartObservedAt, asOfDate);
  const authEvent = latestEventFor(run, 'shopify-live-readonly-audit');
  const authFreshness = classifyFreshness(authEvent?.recordedAt, asOfDate);
  const authSuperseded = toTime(cartObservedAt) !== null
    && toTime(authEvent?.recordedAt) !== null
    && toTime(cartObservedAt) > toTime(authEvent.recordedAt);
  const releaseFreshness = classifyFreshness(release.shopify?.observedAt, asOfDate);
  const missingFingerprints = [
    release.shopify?.observationFingerprintStatus === 'reviewed',
    release.shopify?.commerceFactsFingerprintStatus === 'reviewed',
    release.shopify?.variantFingerprintStatus === 'observed',
  ].filter(bound => !bound).length;
  const latestRunEvent = [...(run.events || [])]
    .sort((left, right) => String(right.recordedAt).localeCompare(String(left.recordedAt)))[0] || null;
  const auditFreshness = classifyFreshness(latestRunEvent?.recordedAt, asOfDate);
  const readinessFreshness = classifyFreshness(readiness.updatedAt, asOfDate);

  const records = [
    {
      id: 'shopify-session-access',
      label: 'Shopify session access',
      classification: authSuperseded ? 'superseded' : 'stale',
      freshness: authFreshness.status,
      observedAt: authEvent?.recordedAt || null,
      technicalAccess: authSuperseded ? 'Later technical access evidence recorded' : 'Authentication blocker recorded',
      operationalAuthority: 'blocked',
      issueCode: authSuperseded ? 'STALE_AUTH_BLOCKER_SUPERSEDED' : 'SHOPIFY_AUTHENTICATED_SESSION_REQUIRED',
      finding: authSuperseded
        ? 'The historical login blocker is no longer the current blocker; the later observation is itself stale and grants no operating authority.'
        : 'No later technical access evidence supersedes the recorded authentication blocker.',
      conflict: authSuperseded,
    },
    {
      id: 'shopify-cart-test',
      label: 'Storefront cart test',
      classification: cartFreshness.status === 'current' ? 'current' : 'historical',
      freshness: cartFreshness.status,
      observedAt: cartObservedAt,
      technicalAccess: 'No-order write test observed',
      operationalAuthority: 'blocked',
      issueCode: 'CART_ACTIVATION_AUTHORITY_REQUIRED',
      finding: 'The test proves a historical technical surface only. It cannot enable customer cart, checkout, payment, or an order.',
      conflict: false,
    },
    {
      id: 'release-observation-binding',
      label: 'Release observation binding',
      classification: missingFingerprints ? 'missing' : (releaseFreshness.status === 'current' ? 'current' : 'stale'),
      freshness: releaseFreshness.status,
      observedAt: release.shopify?.observedAt || null,
      technicalAccess: `${3 - missingFingerprints}/3 required fingerprints bound`,
      operationalAuthority: release.state === 'released' && missingFingerprints === 0 ? 'release_bound' : 'blocked',
      issueCode: missingFingerprints ? 'CURRENT_OBSERVATION_NOT_RELEASE_BOUND' : 'FRESH_RELEASE_OBSERVATION_REQUIRED',
      finding: missingFingerprints
        ? `${missingFingerprints} canonical Shopify fingerprints are missing from the Draft release.`
        : 'The bound observation must still satisfy release-state and freshness gates.',
      conflict: false,
    },
    {
      id: 'operational-audit-chain',
      label: 'Operational audit chain',
      classification: 'conflicting',
      freshness: auditFreshness.status,
      observedAt: latestRunEvent?.recordedAt || null,
      technicalAccess: 'Static PipelineRun event projection',
      operationalAuthority: 'not_implemented',
      issueCode: 'DURABLE_AUDIT_STORE_UNSELECTED',
      finding: 'PipelineRun events contain no durable hash chain. A succeeded local run item is not append-only operational audit proof.',
      conflict: true,
    },
    {
      id: 'readiness-index',
      label: 'End-to-end readiness index',
      classification: readinessFreshness.status === 'current' ? 'current' : 'stale',
      freshness: readinessFreshness.status,
      observedAt: readiness.updatedAt,
      technicalAccess: `${readiness.stages.length} stages evaluated`,
      operationalAuthority: readiness.overallStatus === 'end_to_end_ready' ? 'ready' : 'blocked',
      issueCode: readiness.overallStatus.toUpperCase(),
      finding: 'The canonical index remains fail-closed until every prerequisite stage carries current, exact evidence.',
      conflict: false,
    },
  ];

  const priorityStages = ['pod-mapping', 'physical-sample', 'shopify-observation'];
  const safeNextActions = priorityStages
    .map(id => readiness.stages.find(stage => stage.id === id))
    .filter(Boolean)
    .map(stage => ({
      id: stage.id,
      label: stage.label,
      owner: stage.owner,
      authority: 'human_approval_required',
      code: stage.blocker.code,
      humanAction: stage.blocker.humanAction,
      resumePoint: stage.blocker.resumePoint,
    }));

  return {
    asOfDate,
    evidenceBoundary: registry.evidenceBoundary,
    status: records.some(record => record.conflict) ? 'conflicts_present' : 'gaps_present',
    metrics: {
      records: records.length,
      conflicts: records.filter(record => record.conflict).length,
      stale: records.filter(record => record.freshness === 'stale').length,
      missing: records.filter(record => record.classification === 'missing').length,
      current: records.filter(record => record.classification === 'current').length,
    },
    records,
    safeNextActions,
    capabilityRows: deriveCapabilityRows(registry, asOfDate),
    runRows: deriveRunRows(run, registry, asOfDate),
    audit: {
      source: 'historical_pipeline_run_projection',
      durable: false,
      hashChained: false,
      status: 'not_implemented',
      issueCode: 'DURABLE_AUDIT_STORE_UNSELECTED',
    },
  };
}

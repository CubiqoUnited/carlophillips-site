import { fingerprintReleaseArtifact } from '../releases/product-release-transition.js';

export const mediaTruthClassifications = [
  'factual-pod',
  'ai-assisted-product-visual',
  'ai-editorial',
  'ai-assisted-360',
  'approximate-3d',
  'physically-verified',
];

export const mediaGenerationActionIds = [
  'generate',
  'regenerate',
  'compare',
  'quarantine',
  'approve',
  'assign',
];

export function isMediaGenerationEnabled(environment = {}) {
  if (
    environment.VERCEL_ENV === 'production' ||
    environment.NEXT_PUBLIC_COMMERCE_ENVIRONMENT === 'production'
  ) {
    return false;
  }
  return environment.CP_ADMIN_MEDIA_GENERATION_ENABLED === 'true';
}

function actionDecision(id, allowed, reason) {
  return { id, allowed, reason };
}

export function evaluateMediaGenerationAction({
  action,
  featureEnabled,
  role,
  workspace,
}) {
  if (!mediaGenerationActionIds.includes(action)) {
    return actionDecision(action, false, 'MEDIA_GENERATION_ACTION_UNKNOWN');
  }
  if (!featureEnabled) {
    return actionDecision(action, false, 'MEDIA_GENERATION_FEATURE_DISABLED');
  }
  if (role !== 'product_owner') {
    return actionDecision(action, false, 'PRODUCT_OWNER_REQUIRED');
  }
  if (action === 'compare') {
    return actionDecision(
      action,
      workspace.candidates.length > 0,
      workspace.candidates.length > 0
        ? 'READ_ONLY_COMPARISON_AVAILABLE'
        : 'NO_CANDIDATE_AVAILABLE'
    );
  }
  if (['generate', 'regenerate'].includes(action)) {
    if (workspace.constraintProfile.status !== 'ready') {
      return actionDecision(action, false, 'POD_CONSTRAINT_PROFILE_INCOMPLETE');
    }
    if (workspace.providers.some((provider) => provider.access !== 'ready')) {
      return actionDecision(action, false, 'PROVIDER_ADAPTER_NOT_READY');
    }
    if (
      workspace.providers.some(
        (provider) => provider.costApproval === 'required'
      )
    ) {
      return actionDecision(action, false, 'EXACT_COST_APPROVAL_REQUIRED');
    }
  }
  return actionDecision(
    action,
    false,
    'DURABLE_COMMAND_AND_AUDIT_NOT_CONNECTED'
  );
}

export function deriveMediaGenerationWorkspace({
  workspace,
  release,
  mediaManifest,
  featureEnabled,
  role,
  providerHandshakes = [],
}) {
  if (
    workspace.releaseId !== release.releaseId ||
    mediaManifest.releaseId !== release.releaseId
  ) {
    throw new Error('MEDIA_GENERATION_RELEASE_MISMATCH');
  }
  const expectedBindings = {
    mediaManifestFingerprint: fingerprintReleaseArtifact(mediaManifest),
    shopifyObservationFingerprint: release.shopify.observationFingerprint,
    providerMappingFingerprint:
      release.fulfillmentMappings[0]?.mappingFingerprint,
  };
  if (
    Object.entries(expectedBindings).some(
      ([key, value]) => workspace.bindings[key] !== value
    )
  ) {
    throw new Error('MEDIA_GENERATION_BINDING_STALE');
  }

  const actions = mediaGenerationActionIds.map((action) =>
    evaluateMediaGenerationAction({
      action,
      featureEnabled,
      role,
      workspace,
    })
  );
  const availableInputs = workspace.inputs.filter(
    (input) => input.status === 'available'
  ).length;
  const candidateCounts = workspace.candidates.reduce(
    (counts, candidate) => ({
      ...counts,
      [candidate.truthClassification]:
        (counts[candidate.truthClassification] || 0) + 1,
    }),
    {}
  );

  return {
    schemaVersion: workspace.schemaVersion,
    workspaceId: workspace.workspaceId,
    releaseId: workspace.releaseId,
    productHandle: workspace.productHandle,
    rollout: workspace.rollout,
    inputs: workspace.inputs.map((input) => ({
      inputId: input.inputId,
      role: input.role,
      reference: input.reference,
      fingerprint: input.fingerprint ? 'bound' : null,
      status: input.status,
    })),
    constraintProfile: workspace.constraintProfile,
    providers: workspace.providers,
    providerHandshakes,
    workflow: workspace.workflow,
    candidates: workspace.candidates.map((candidate) => ({
      assetId: candidate.assetId,
      label: candidate.label,
      kind: candidate.kind,
      role: candidate.role,
      truthClassification: candidate.truthClassification,
      storageState: candidate.storageState,
      qaStatus: candidate.qaStatus,
      approvalStatus: candidate.approvalStatus,
      placement: candidate.placement,
      storefrontBound: candidate.storefrontBound,
      stagingPreviewBound: candidate.stagingPreviewBound,
      notes: candidate.notes || [],
    })),
    authoritative: false,
    draftOnly: false,
    existingFunnelChanged: false,
    canonicalMediaRegistry: mediaManifest.releaseId,
    canonicalReleaseState: release.state,
    bindings: {
      mediaManifest: true,
      shopifyObservation: true,
      providerMapping: true,
    },
    metrics: {
      inputsReady: availableInputs,
      inputsTotal: workspace.inputs.length,
      candidates: workspace.candidates.length,
      quarantined: workspace.candidates.filter(
        (candidate) => candidate.approvalStatus === 'quarantined'
      ).length,
      approved: workspace.candidates.filter(
        (candidate) => candidate.approvalStatus === 'approved'
      ).length,
      storefrontBound: workspace.candidates.filter(
        (candidate) => candidate.storefrontBound
      ).length,
      stagingPreviewBound: workspace.candidates.filter(
        (candidate) => candidate.stagingPreviewBound
      ).length,
    },
    candidateCounts,
    actions,
    boundary:
      'Feature-flagged Staging review workspace. Product Owner-approved preview media may be presented on Staging, while the canonical Product Release Record, Shopify publication, payment authority, and Production remain unchanged.',
  };
}

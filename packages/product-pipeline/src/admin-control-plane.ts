import { evaluatePodpipeDelivery } from './delivery';
import type {
  PodpipeDeliveryInput,
  PodpipeDeliveryStepDecision,
} from './delivery';
import type {
  MediaRequirement,
  ProductMediaManifest,
  ProductReleaseRecord,
  ReleaseState,
} from './types';

export interface AdminControlPlaneInput {
  release: ProductReleaseRecord;
  mediaManifest: ProductMediaManifest;
  delivery: PodpipeDeliveryInput;
}

export interface AdminBindingView {
  id:
    | 'podpipe-release'
    | 'media-release'
    | 'shopify-observation'
    | 'fulfillment-mapping'
    | 'physical-sample'
    | 'media-approval'
    | 'candidate'
    | 'rollback';
  status: 'bound' | 'missing' | 'mismatch' | 'pending';
  boundary: string;
}

export interface AdminReleaseView {
  id: string;
  state: ReleaseState;
  blockers: string[];
  bindings: AdminBindingView[];
}

export interface AdminWorkflowStepView {
  id: PodpipeDeliveryStepDecision['id'];
  position: number;
  title: string;
  status: PodpipeDeliveryStepDecision['status'];
  evidenceStatus: PodpipeDeliveryStepDecision['evidenceStatus'];
  blockers: string[];
}

export interface AdminMediaRequirementView {
  modality: string;
  requirement: string;
  status: string;
  assetCount: number;
}

export interface AdminApprovalView {
  id: string;
  status: string;
  owner: string;
}

export const ADMIN_CONTROL_PLANE_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    aggregates: ['readiness'],
    pipelineOwned: true,
  },
  {
    id: 'briefs',
    label: 'Briefs',
    aggregates: ['ProductBrief'],
    pipelineOwned: true,
  },
  {
    id: 'runs',
    label: 'Jobs & runs',
    aggregates: ['ProductCreationJob', 'PipelineRun'],
    pipelineOwned: true,
  },
  {
    id: 'products',
    label: 'Products, POD & samples',
    aggregates: ['provider-mapping', 'physical-sample'],
    pipelineOwned: true,
  },
  {
    id: 'media',
    label: 'Media Registry',
    aggregates: ['ProductMediaManifest'],
    pipelineOwned: true,
  },
  {
    id: 'releases',
    label: 'Releases',
    aggregates: ['ProductReleaseRecord', 'ReleaseTransitionDecision'],
    pipelineOwned: true,
  },
  {
    id: 'evidence',
    label: 'Evidence',
    aggregates: ['PodpipeDeliveryEvidence'],
    pipelineOwned: true,
  },
  {
    id: 'approvals',
    label: 'Approvals',
    aggregates: ['release-approvals', 'delivery-approvals'],
    pipelineOwned: true,
  },
  {
    id: 'publication',
    label: 'Publication',
    aggregates: ['candidate', 'rollback'],
    pipelineOwned: true,
  },
  {
    id: 'orders',
    label: 'Orders & fulfillment',
    aggregates: ['operations'],
    pipelineOwned: true,
  },
  {
    id: 'post-sale',
    label: 'Post-sale',
    aggregates: ['operations'],
    pipelineOwned: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    aggregates: ['consent'],
    pipelineOwned: false,
  },
  {
    id: 'commands',
    label: 'Commands',
    aggregates: ['decision-only'],
    pipelineOwned: true,
  },
  {
    id: 'theme',
    label: 'Theme',
    aggregates: ['design-system'],
    pipelineOwned: false,
  },
] as const;

export type AdminControlPlaneSectionId =
  (typeof ADMIN_CONTROL_PLANE_SECTIONS)[number]['id'];

export type AdminOperationStatus = 'unavailable' | 'empty' | 'blocked';

export interface AdminOperationProjection {
  status: AdminOperationStatus;
  authoritative: false;
  recordCount: 0;
  records: [];
  blockers: string[];
}

export interface AdminOperationsView {
  authoritative: false;
  recordCount: 0;
  payment: AdminOperationProjection;
  order: AdminOperationProjection;
  fulfillment: AdminOperationProjection;
  shipmentTracking: AdminOperationProjection;
  support: AdminOperationProjection;
  return: AdminOperationProjection;
  refund: AdminOperationProjection;
  reviewEligibility: AdminOperationProjection;
}

export interface AdminControlPlaneView {
  schemaVersion: 'cp.admin-control-plane-view.v1';
  meta: {
    mode: 'read_only_projection';
    authoritative: false;
    warning: string;
  };
  metrics: {
    deliverySteps: number;
    openSteps: number;
    pendingApprovals: number;
    mediaRequirements: number;
    approvedMedia: number;
    boundMedia: number;
  };
  release: AdminReleaseView;
  workflow: {
    ready: boolean;
    nextStepId: PodpipeDeliveryStepDecision['id'] | null;
    steps: AdminWorkflowStepView[];
  };
  media: {
    requirements: AdminMediaRequirementView[];
    assetCount: number;
    approvedCount: number;
    boundCount: number;
  };
  approvals: AdminApprovalView[];
  operations: AdminOperationsView;
  authority: {
    externalExecutionAuthorized: false;
    shopifyMutationAuthorized: false;
    publicationAuthorized: false;
    productionAuthorized: false;
  };
}

function unavailableOperation(blockers: string[]): AdminOperationProjection {
  return {
    status: 'unavailable',
    authoritative: false,
    recordCount: 0,
    records: [],
    blockers,
  };
}

function blockedOperation(blockers: string[]): AdminOperationProjection {
  return {
    status: 'blocked',
    authoritative: false,
    recordCount: 0,
    records: [],
    blockers,
  };
}

function emptyOperation(blockers: string[]): AdminOperationProjection {
  return {
    status: 'empty',
    authoritative: false,
    recordCount: 0,
    records: [],
    blockers,
  };
}

function deriveOperations(release: ProductReleaseRecord): AdminOperationsView {
  const releaseBlocker =
    release.state === 'released'
      ? 'CONTROLLED_OPERATION_EVIDENCE_REQUIRED'
      : 'CANONICAL_RELEASE_NOT_RELEASED';
  return {
    authoritative: false,
    recordCount: 0,
    payment: blockedOperation([
      releaseBlocker,
      'PAYMENT_AUTHORITY_UNAVAILABLE',
    ]),
    order: emptyOperation([releaseBlocker, 'NO_SANITIZED_ORDER_RECORDS']),
    fulfillment: unavailableOperation(['FULFILLMENT_OBSERVER_UNAVAILABLE']),
    shipmentTracking: unavailableOperation([
      'SHIPMENT_TRACKING_OBSERVER_UNAVAILABLE',
    ]),
    support: unavailableOperation(['SUPPORT_SYSTEM_UNAVAILABLE']),
    return: unavailableOperation(['RETURN_WORKFLOW_UNAVAILABLE']),
    refund: blockedOperation([releaseBlocker, 'REFUND_AUTHORITY_UNAVAILABLE']),
    reviewEligibility: blockedOperation([
      'DELIVERED_UNREFUNDED_ORDER_REQUIRED',
    ]),
  };
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

function hasFingerprint(value: unknown): value is string {
  return typeof value === 'string' && FINGERPRINT_PATTERN.test(value);
}

function requirementView(
  requirement: MediaRequirement
): AdminMediaRequirementView {
  return {
    modality: requirement.modality,
    requirement: requirement.requirement,
    status: requirement.status,
    assetCount: requirement.assetIds.length,
  };
}

function deriveBindings(
  input: AdminControlPlaneInput,
  mediaRequirementsCovered: boolean
): AdminBindingView[] {
  const { release, mediaManifest, delivery } = input;
  const shopifyBound =
    release.shopify.variantFingerprintStatus === 'observed' &&
    hasFingerprint(release.shopify.variantFingerprint) &&
    release.shopify.commerceFactsFingerprintStatus === 'reviewed' &&
    hasFingerprint(release.shopify.commerceFactsFingerprint) &&
    release.shopify.observationFingerprintStatus === 'reviewed' &&
    hasFingerprint(release.shopify.observationFingerprint) &&
    hasText(release.shopify.observationReviewEvidence) &&
    hasText(release.shopify.observedAt) &&
    (release.state !== 'released' ||
      release.shopify.statusObserved === 'ACTIVE');
  const fulfillmentBound =
    release.fulfillmentMappings.length > 0 &&
    release.fulfillmentMappings.every(
      (mapping) =>
        hasText(mapping.adapter) &&
        hasText(mapping.providerProductId) &&
        mapping.variantFingerprintStatus === 'observed' &&
        hasFingerprint(mapping.variantFingerprint)
    );
  const sample = release.physicalSample;
  const sampleBound =
    sample?.status === 'approved' &&
    ['fit', 'colour', 'artworkPlacement', 'finish'].every(
      (field) => sample[field as keyof typeof sample] === 'approved'
    ) &&
    hasText(sample.evidence);
  const approvalsBound = Object.values(release.approvals).every(
    (approval) => approval.status === 'approved'
  );
  const candidateBound =
    hasText(release.candidate.gitCommit) &&
    hasText(release.candidate.buildEvidence) &&
    hasText(release.candidate.stagingEvidence);
  const rollbackBound =
    hasText(release.rollback.planEvidence) &&
    hasText(release.rollback.verificationEvidence);

  return [
    {
      id: 'podpipe-release',
      status:
        delivery.releaseId === release.releaseId &&
        delivery.releaseState === release.state
          ? 'bound'
          : 'mismatch',
      boundary: 'Delivery evidence must bind the exact release ID and state.',
    },
    {
      id: 'media-release',
      status:
        mediaManifest.releaseId === release.releaseId ? 'bound' : 'mismatch',
      boundary: 'Media evidence must bind the exact release ID.',
    },
    {
      id: 'shopify-observation',
      status: shopifyBound ? 'bound' : 'missing',
      boundary:
        'Identity, commerce-facts, variant, and review bindings are required.',
    },
    {
      id: 'fulfillment-mapping',
      status: fulfillmentBound ? 'bound' : 'missing',
      boundary:
        'Every provider mapping requires exact provider identity and a reviewed variant fingerprint.',
    },
    {
      id: 'physical-sample',
      status: sampleBound ? 'bound' : 'pending',
      boundary:
        'Fit, colour, artwork placement, finish, and evidence require approval.',
    },
    {
      id: 'media-approval',
      status: mediaRequirementsCovered && approvalsBound ? 'bound' : 'pending',
      boundary:
        'Every required or non-waived modality must be approved and storefront-bound.',
    },
    {
      id: 'candidate',
      status: candidateBound ? 'bound' : 'missing',
      boundary: 'Immutable commit, build, and staging evidence are required.',
    },
    {
      id: 'rollback',
      status: rollbackBound ? 'bound' : 'missing',
      boundary:
        'A release-specific plan and verification evidence are required.',
    },
  ];
}

function deriveReleaseBlockers(
  release: ProductReleaseRecord,
  bindings: AdminBindingView[]
): string[] {
  const blockers = bindings
    .filter((binding) => binding.status !== 'bound')
    .map(
      (binding) =>
        `${binding.id.replaceAll('-', '_').toUpperCase()}_${binding.status.toUpperCase()}`
    );
  if (release.state !== 'released')
    blockers.unshift('CANONICAL_RELEASE_NOT_RELEASED');
  return [...new Set(blockers)];
}

export function deriveAdminControlPlaneView(
  input: AdminControlPlaneInput
): AdminControlPlaneView {
  const workflow = evaluatePodpipeDelivery(input.delivery);
  const approvedAssets = input.mediaManifest.assets.filter(
    (asset) => asset.approvalStatus === 'approved'
  );
  const boundAssets = approvedAssets.filter((asset) =>
    Boolean(
      asset.exactProductMatch === 'verified' &&
      asset.rightsStatus === 'verified' &&
      asset.quality?.status === 'verified' &&
      hasText(asset.quality.evidence) &&
      hasText(asset.storefrontBinding?.adapter) &&
      hasFingerprint(asset.storefrontBinding?.referenceHash) &&
      hasText(asset.storefrontBinding?.evidence)
    )
  );
  const boundAssetIds = new Set(boundAssets.map((asset) => asset.assetId));
  const mediaRequirementsCovered =
    input.mediaManifest.requirements.length > 0 &&
    input.mediaManifest.requirements.every((requirement) => {
      if (requirement.status === 'infeasible-approved') {
        return (
          requirement.requirement === 'where-feasible' &&
          requirement.infeasibilityBlocker?.approvalStatus === 'approved' &&
          hasText(requirement.infeasibilityBlocker.reason) &&
          hasText(requirement.infeasibilityBlocker.owner)
        );
      }
      return (
        requirement.status === 'approved' &&
        requirement.assetIds.length > 0 &&
        requirement.assetIds.every((assetId) => boundAssetIds.has(assetId))
      );
    });
  const approvals: AdminApprovalView[] = [
    ...Object.entries(input.release.approvals).map(([id, approval]) => ({
      id: `release:${id}`,
      status: approval.status,
      owner: approval.owner || 'Unassigned',
    })),
    ...Object.entries(input.delivery.approvals || {}).map(([id, approval]) => ({
      id: `delivery:${id}`,
      status: approval?.status || 'pending',
      owner: approval?.owner || 'Product Owner',
    })),
  ];
  const bindings = deriveBindings(input, mediaRequirementsCovered);
  const requirements = input.mediaManifest.requirements.map(requirementView);
  const steps = workflow.steps.map((step) => ({
    id: step.id,
    position: step.position,
    title: step.title,
    status: step.status,
    evidenceStatus: step.evidenceStatus,
    blockers: [...step.blockers],
  }));

  return {
    schemaVersion: 'cp.admin-control-plane-view.v1',
    meta: {
      mode: 'read_only_projection',
      authoritative: false,
      warning:
        'Read-only projection. Canonical release, media, and PODPIPE evidence remain authoritative; this view grants no external, Shopify, publication, or Production action.',
    },
    metrics: {
      deliverySteps: steps.length,
      openSteps: steps.filter((step) => step.status !== 'complete').length,
      pendingApprovals: approvals.filter(
        (approval) => approval.status !== 'approved'
      ).length,
      mediaRequirements: requirements.length,
      approvedMedia: approvedAssets.length,
      boundMedia: boundAssets.length,
    },
    release: {
      id: input.release.releaseId,
      state: input.release.state,
      blockers: deriveReleaseBlockers(input.release, bindings),
      bindings,
    },
    workflow: {
      ready:
        input.release.state === 'released' &&
        workflow.ready &&
        bindings.every((binding) => binding.status === 'bound'),
      nextStepId: workflow.nextStep?.id || null,
      steps,
    },
    media: {
      requirements,
      assetCount: input.mediaManifest.assets.length,
      approvedCount: approvedAssets.length,
      boundCount: boundAssets.length,
    },
    approvals,
    operations: deriveOperations(input.release),
    authority: {
      externalExecutionAuthorized: false,
      shopifyMutationAuthorized: false,
      publicationAuthorized: false,
      productionAuthorized: false,
    },
  };
}

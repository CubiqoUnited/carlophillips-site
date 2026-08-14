import { evaluateProductReleaseTransition } from '../releases/product-release-transition';

export const PODPIPE_DELIVERY_STEP_DEFINITIONS = [
  {
    id: 'product-brief',
    title: 'ProductBrief',
    external: false,
    approvals: [],
  },
  {
    id: 'select-provider-garment',
    title: 'Select POD provider + exact garment',
    external: true,
    approvals: ['externalExecution'],
  },
  {
    id: 'prepare-production-artwork',
    title: 'Prepare production artwork',
    external: false,
    approvals: [],
  },
  {
    id: 'create-pod-draft',
    title: 'Create Draft in POD app',
    external: true,
    approvals: ['externalExecution'],
  },
  {
    id: 'configure-fulfillment-truth',
    title: 'Configure fulfilment truth',
    external: true,
    approvals: ['externalExecution'],
  },
  {
    id: 'sync-shopify-draft',
    title: 'Sync Draft to Shopify',
    external: true,
    approvals: ['externalExecution', 'shopifyWrite'],
  },
  {
    id: 'verify-physical-sample',
    title: 'Verify physical sample',
    external: true,
    approvals: ['externalExecution', 'spend', 'sample'],
  },
  {
    id: 'collect-canonical-references',
    title: 'Collect canonical references',
    external: false,
    approvals: [],
  },
  {
    id: 'produce-editorial-media',
    title: 'Produce editorial media',
    external: true,
    approvals: ['externalExecution'],
  },
  {
    id: 'curate-quarantine-media',
    title: 'Curate & quarantine inaccurate media',
    external: false,
    approvals: [],
  },
  {
    id: 'produce-real-360-3d',
    title: 'Produce 360 + 3D only from real inputs',
    external: true,
    approvals: ['externalExecution'],
  },
  {
    id: 'register-approved-media',
    title: 'Add only approved assets to Media Registry',
    external: false,
    approvals: [],
  },
  {
    id: 'assemble-headless-display',
    title: 'Assemble headless product display',
    external: false,
    approvals: [],
  },
  {
    id: 'preview-qa',
    title: 'Desktop + Mobile Preview QA',
    external: true,
    approvals: ['externalExecution'],
  },
  {
    id: 'product-owner-approval',
    title: 'Product Owner approval',
    external: false,
    approvals: [],
  },
  {
    id: 'merge-production-deployment',
    title: 'Merge → Production deployment',
    external: true,
    approvals: ['publish', 'production'],
  },
  {
    id: 'live-verification',
    title: 'Live Shopify / POD / checkout verification',
    external: true,
    approvals: [
      'externalExecution',
      'shopifyWrite',
      'production',
      'liveVerification',
    ],
  },
] as const;

export type PodpipeDeliveryStepId =
  (typeof PODPIPE_DELIVERY_STEP_DEFINITIONS)[number]['id'];
export type PodpipeDeliveryApproval =
  | 'externalExecution'
  | 'spend'
  | 'sample'
  | 'shopifyWrite'
  | 'publish'
  | 'production'
  | 'liveVerification';
export type PodpipeEvidenceStatus =
  'missing' | 'candidate' | 'verified' | 'approved';

export interface PodpipeStepEvidence {
  status: PodpipeEvidenceStatus;
  evidence: string[];
}

export interface PodpipeApprovalDecision {
  status: 'pending' | 'approved' | 'denied';
  owner: 'Product Owner';
}

export interface PodpipeDeliveryInput {
  releaseId: string;
  releaseState: 'draft' | 'staged' | 'approved' | 'released' | 'withdrawn';
  steps?: Partial<Record<PodpipeDeliveryStepId, PodpipeStepEvidence>>;
  approvals?: Partial<Record<PodpipeDeliveryApproval, PodpipeApprovalDecision>>;
}

export interface PodpipeDeliveryStepDecision {
  id: PodpipeDeliveryStepId;
  position: number;
  title: string;
  external: boolean;
  status: 'complete' | 'ready' | 'blocked';
  evidenceStatus: PodpipeEvidenceStatus;
  evidence: string[];
  blockers: string[];
}

export interface PodpipeDeliveryDecision {
  schemaVersion: 'cp.podpipe-delivery-decision.v1';
  releaseId: string;
  releaseState: PodpipeDeliveryInput['releaseState'];
  ready: boolean;
  steps: PodpipeDeliveryStepDecision[];
  nextStep: PodpipeDeliveryStepDecision | null;
  authorizedExternalSteps: PodpipeDeliveryStepId[];
}

const approvalCode = (approval: PodpipeDeliveryApproval): string =>
  `${approval.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}_APPROVAL_REQUIRED`;

const APPROVED_EVIDENCE_STEPS = new Set<PodpipeDeliveryStepId>([
  'verify-physical-sample',
  'register-approved-media',
  'product-owner-approval',
]);

function hasDurableEvidence(
  stepId: PodpipeDeliveryStepId,
  evidence: PodpipeStepEvidence | undefined
): boolean {
  return Boolean(
    evidence &&
    ['verified', 'approved'].includes(evidence.status) &&
    (!APPROVED_EVIDENCE_STEPS.has(stepId) || evidence.status === 'approved') &&
    evidence.evidence.length > 0 &&
    evidence.evidence.every((reference) => reference.trim().length > 0)
  );
}

export function evaluatePodpipeDelivery(
  input: PodpipeDeliveryInput
): PodpipeDeliveryDecision {
  const decisions: PodpipeDeliveryStepDecision[] = [];

  for (const [
    index,
    definition,
  ] of PODPIPE_DELIVERY_STEP_DEFINITIONS.entries()) {
    const evidence = input.steps?.[definition.id];
    const blockers: string[] = [];
    const prerequisite = decisions[index - 1];

    if (prerequisite && prerequisite.status !== 'complete') {
      blockers.push(`STEP_${index}_PREREQUISITE_INCOMPLETE`);
    }
    for (const approval of definition.approvals) {
      if (input.approvals?.[approval]?.status !== 'approved') {
        blockers.push(approvalCode(approval));
      }
    }

    const evidenceComplete = hasDurableEvidence(definition.id, evidence);
    const status =
      blockers.length > 0 ? 'blocked' : evidenceComplete ? 'complete' : 'ready';

    decisions.push({
      id: definition.id,
      position: index + 1,
      title: definition.title,
      external: definition.external,
      status,
      evidenceStatus: evidence?.status || 'missing',
      evidence: evidence?.evidence ? [...evidence.evidence] : [],
      blockers,
    });
  }

  return {
    schemaVersion: 'cp.podpipe-delivery-decision.v1',
    releaseId: input.releaseId,
    releaseState: input.releaseState,
    ready: decisions.every((step) => step.status === 'complete'),
    steps: decisions,
    nextStep:
      decisions.find(
        (step) => step.status === 'ready' || step.status === 'blocked'
      ) || null,
    authorizedExternalSteps: decisions
      .filter((step) => step.external && step.status === 'ready')
      .map((step) => step.id),
  };
}

const REQUIRED_STEP_COUNT = {
  staged: 6,
  approved: 15,
  released: 17,
} as const;

export interface CanonicalReleaseRecord {
  releaseId: string;
  state: 'draft' | 'staged' | 'approved' | 'released' | 'withdrawn';
  [key: string]: unknown;
}

export function evaluatePodpipeReleaseTransition({
  delivery,
  record,
  manifest,
  targetState,
}: {
  delivery: PodpipeDeliveryInput;
  record: CanonicalReleaseRecord;
  manifest: Record<string, unknown> | null;
  targetState: 'staged' | 'approved' | 'released';
}) {
  const workflow = evaluatePodpipeDelivery(delivery);
  const canonical = evaluateProductReleaseTransition({
    record: record as never,
    manifest: manifest as never,
    targetState,
  });
  const requiredCount = REQUIRED_STEP_COUNT[targetState];
  const workflowBlockers = workflow.steps
    .slice(0, requiredCount)
    .filter((step) => step.status !== 'complete')
    .map((step) => ({
      code: `PODPIPE_STEP_${step.position}_INCOMPLETE`,
      humanAction: `Complete ${step.title} with its exact evidence and approvals.`,
      resumePoint: `Bind durable evidence for PODPIPE step ${step.position}, then re-evaluate ${targetState}.`,
    }));
  const blockers = [...canonical.blockers, ...workflowBlockers];

  return {
    schemaVersion: 'cp.podpipe-release-transition-decision.v1' as const,
    releaseId: delivery.releaseId,
    fromState: record.state,
    targetState,
    allowed: blockers.length === 0,
    blockers,
    candidate:
      blockers.length === 0 && canonical.candidate ? canonical.candidate : null,
    workflow,
  };
}

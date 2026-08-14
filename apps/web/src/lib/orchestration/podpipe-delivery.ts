import {
  evaluatePodpipeDelivery,
  type PodpipeDeliveryInput,
} from '@repo/product-pipeline';
import { evaluateProductReleaseTransition } from '../releases/product-release-transition';

export {
  PODPIPE_DELIVERY_APPROVALS,
  PODPIPE_DELIVERY_STEP_DEFINITIONS,
  evaluatePodpipeDelivery,
} from '@repo/product-pipeline';

export type {
  PodpipeApprovalDecision,
  PodpipeDeliveryApproval,
  PodpipeDeliveryDecision,
  PodpipeDeliveryInput,
  PodpipeDeliveryStepDecision,
  PodpipeDeliveryStepId,
  PodpipeEvidenceStatus,
  PodpipeStepEvidence,
} from '@repo/product-pipeline';

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

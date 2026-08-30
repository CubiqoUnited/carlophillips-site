import { createHash } from 'node:crypto';
import { createPipelineRun } from './pipeline-run';

const APPROVALS = [
  'externalExecution',
  'spend',
  'credits',
  'sample',
  'shopifyWrite',
  'publish',
  'production',
];

const TRUTH_POLICY = {
  maySetProductTruth: false,
  mayApproveMedia: false,
  mayAuthorizeCommerce: false,
  mayPublish: false,
};

const REFERENCE_USE_POLICY = {
  mode: 'inspiration-only',
  mayCopy: false,
  mayAssertRights: false,
  mayAssertProductTruth: false,
  mayAssertMediaTruth: false,
};

const RESEARCH_POLICY = {
  sourceAttributionRequired: true,
  freshnessRequired: true,
  humanReviewStatus: 'pending',
  mayTriggerExternalResearch: false,
};

interface InputEvidence {
  evidenceId: string;
  kind: string;
  authority: string;
  sourceType: string;
  confidence: string;
  sourceRef: string;
  publishedAt: string | null;
  observedAt: string;
  provenance: { publisher?: string; evidenceRef?: string; retrievedAt: string };
  freshness: {
    evaluatedAt: string;
    maxAgeHours: number | null;
    status: string;
  };
}
interface BrandConstraints {
  status: string;
  rules: string[];
  prohibitedClaims: string[];
  [key: string]: unknown;
}
interface Trigger {
  type: 'on-demand' | 'scheduled';
  cadence: string;
  schedule: { expression: string; timezone: string } | null;
}
interface ReferenceUsePolicy {
  mode: string;
  mayCopy: boolean;
  mayAssertRights: boolean;
  mayAssertProductTruth: boolean;
  mayAssertMediaTruth: boolean;
}
interface ResearchPolicy {
  sourceAttributionRequired: boolean;
  freshnessRequired: boolean;
  humanReviewStatus: string;
  mayTriggerExternalResearch: boolean;
}
interface ProductCreationJob {
  schemaVersion: 'cp.product-creation-job.v2';
  jobId: string;
  environment: string;
  simulation: boolean;
  trigger: Trigger;
  brief: {
    schemaVersion: 'cp.product-brief.v1';
    briefId: string;
    releaseId: string;
    entryMode: string;
    status: 'candidate-only';
    inputEvidence: InputEvidence[];
    brandConstraints: BrandConstraints;
    referenceUsePolicy: ReferenceUsePolicy;
    researchPolicy: ResearchPolicy;
    truthPolicy: typeof TRUTH_POLICY;
  };
  idempotency: {
    key: string;
    inputFingerprint: string | null;
    duplicatePolicy: 'suppress';
  };
  contractBindings: {
    productReleaseRecord: unknown;
    mediaRegistry: unknown;
    commerceGateway: string;
    pipelineRunContract: string;
    pipelineRunId: string;
  };
  approvals: Record<string, { status: string; owner: string }>;
}

interface CreateProductCreationJobInput {
  jobId: string;
  environment?: string;
  simulation?: boolean;
  briefId: string;
  entryMode: string;
  releaseId: string;
  trigger: Trigger;
  inputEvidence: InputEvidence[];
  brandConstraints: BrandConstraints;
  referenceUsePolicy?: ReferenceUsePolicy;
  researchPolicy?: ResearchPolicy;
  idempotencyKey: string;
  productReleaseRecord: unknown;
  mediaRegistry: unknown;
  pipelineRunId: string;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function computeCreationInputFingerprint(
  job: ProductCreationJob
): string {
  const { briefId: _briefId, ...briefInputs } = job.brief;
  const payload = {
    trigger: job.trigger,
    brief: briefInputs,
  };
  return `sha256:${createHash('sha256').update(stableSerialize(payload)).digest('hex')}`;
}

function pendingApprovals() {
  return Object.fromEntries(
    APPROVALS.map((action) => [
      action,
      { status: 'pending', owner: 'Product Owner' },
    ])
  );
}

function assertFreshness(evidence: InputEvidence): void {
  const publishedAt =
    evidence.publishedAt === null ? null : Date.parse(evidence.publishedAt);
  const observedAt = Date.parse(evidence.observedAt);
  const retrievedAt = Date.parse(evidence.provenance?.retrievedAt);
  const evaluatedAt = Date.parse(evidence.freshness?.evaluatedAt);
  if (
    !Number.isFinite(observedAt) ||
    !Number.isFinite(retrievedAt) ||
    !Number.isFinite(evaluatedAt) ||
    (publishedAt !== null &&
      (!Number.isFinite(publishedAt) || publishedAt > observedAt)) ||
    retrievedAt < observedAt ||
    evaluatedAt < retrievedAt
  ) {
    throw new Error(
      `Evidence ${evidence.evidenceId} has an invalid freshness window.`
    );
  }

  const { maxAgeHours, status } = evidence.freshness;
  if (status === 'not-time-sensitive') {
    if (maxAgeHours !== null) {
      throw new Error(
        `Evidence ${evidence.evidenceId} must use a null age limit when not time-sensitive.`
      );
    }
    return;
  }
  if (
    typeof maxAgeHours !== 'number' ||
    !Number.isInteger(maxAgeHours) ||
    maxAgeHours < 1
  ) {
    throw new Error(
      `Evidence ${evidence.evidenceId} requires a positive freshness limit.`
    );
  }

  const ageHours = (evaluatedAt - observedAt) / 3_600_000;
  if (status === 'current' && ageHours > maxAgeHours) {
    throw new Error(
      `Evidence ${evidence.evidenceId} is labeled current beyond its freshness limit.`
    );
  }
  if (status === 'stale' && ageHours <= maxAgeHours) {
    throw new Error(
      `Evidence ${evidence.evidenceId} is labeled stale inside its freshness limit.`
    );
  }
}

function assertInputPolicy(
  environment: string,
  inputEvidence: InputEvidence[]
): void {
  for (const evidence of inputEvidence) {
    if (!evidence.provenance?.publisher || !evidence.provenance?.evidenceRef) {
      throw new Error(
        `Evidence ${evidence.evidenceId} requires explicit provenance.`
      );
    }
    assertFreshness(evidence);
    if (
      evidence.kind === 'trend-signal' &&
      evidence.authority !== 'research-only'
    ) {
      throw new Error(
        'Trend signals are research-only and cannot become candidate truth.'
      );
    }
    if (
      evidence.kind === 'trend-signal' &&
      !['current', 'stale'].includes(evidence.freshness.status)
    ) {
      throw new Error(
        'Trend signals require a time-bounded current or stale classification.'
      );
    }
    if (evidence.sourceType === 'fixture') {
      if (environment !== 'local') {
        throw new Error('Fixture creation evidence is local-only.');
      }
      if (
        evidence.authority !== 'research-only' ||
        evidence.confidence !== 'unassessed'
      ) {
        throw new Error(
          'Fixture evidence must remain unassessed and research-only.'
        );
      }
      if (evidence.freshness.status !== 'stale') {
        throw new Error('Fixture trend evidence must remain explicitly stale.');
      }
    }
  }
}

function assertTriggerPolicy(trigger: Trigger): void {
  if (trigger.type === 'on-demand') {
    if (trigger.cadence !== 'on-demand' || trigger.schedule !== null) {
      throw new Error('On-demand creation jobs cannot carry a schedule.');
    }
    return;
  }
  if (
    trigger.type !== 'scheduled' ||
    trigger.cadence === 'on-demand' ||
    !trigger.schedule?.expression ||
    !trigger.schedule?.timezone
  ) {
    throw new Error(
      'Scheduled creation jobs require an explicit cadence, expression, and timezone.'
    );
  }
}

function assertFailClosedJob(job: ProductCreationJob): void {
  if (job.brief.status !== 'candidate-only') {
    throw new Error('Creation jobs may produce Draft candidates only.');
  }
  if (Object.values(job.brief.truthPolicy).some(Boolean)) {
    throw new Error(
      'Creation inputs cannot grant product, media, commerce, or publish authority.'
    );
  }
  assertTriggerPolicy(job.trigger);
  if (
    job.brief.brandConstraints?.status !== 'binding' ||
    !job.brief.brandConstraints.rules?.length ||
    !job.brief.brandConstraints.prohibitedClaims?.length
  ) {
    throw new Error(
      'Creation jobs require binding brand rules and prohibited claims.'
    );
  }
  if (
    Object.values({
      mayCopy: job.brief.referenceUsePolicy?.mayCopy,
      mayAssertRights: job.brief.referenceUsePolicy?.mayAssertRights,
      mayAssertProductTruth:
        job.brief.referenceUsePolicy?.mayAssertProductTruth,
      mayAssertMediaTruth: job.brief.referenceUsePolicy?.mayAssertMediaTruth,
    }).some((value) => value !== false) ||
    job.brief.referenceUsePolicy?.mode !== 'inspiration-only'
  ) {
    throw new Error(
      'References are inspiration-only and cannot grant copying, rights, product, or media truth.'
    );
  }
  if (
    job.brief.researchPolicy?.sourceAttributionRequired !== true ||
    job.brief.researchPolicy?.freshnessRequired !== true ||
    job.brief.researchPolicy?.humanReviewStatus !== 'pending' ||
    job.brief.researchPolicy?.mayTriggerExternalResearch !== false
  ) {
    throw new Error(
      'Research must remain attributed, freshness-labeled, human-pending, and externally gated.'
    );
  }
  if (
    APPROVALS.some(
      (action) =>
        job.approvals[action]?.status !== 'pending' ||
        job.approvals[action]?.owner !== 'Product Owner'
    )
  ) {
    throw new Error(
      'Every restricted creation action requires pending Product Owner approval.'
    );
  }
  assertInputPolicy(job.environment, job.brief.inputEvidence);
  if (
    job.idempotency?.duplicatePolicy !== 'suppress' ||
    job.idempotency?.inputFingerprint !== computeCreationInputFingerprint(job)
  ) {
    throw new Error(
      'Creation job idempotency fingerprint is missing or inconsistent.'
    );
  }
}

export function createProductCreationJob({
  jobId,
  environment = 'local',
  simulation = false,
  briefId,
  entryMode,
  releaseId,
  trigger,
  inputEvidence,
  brandConstraints,
  referenceUsePolicy = REFERENCE_USE_POLICY,
  researchPolicy = RESEARCH_POLICY,
  idempotencyKey,
  productReleaseRecord,
  mediaRegistry,
  pipelineRunId,
}: CreateProductCreationJobInput): ProductCreationJob {
  if (!['designer-led', 'trend-led'].includes(entryMode)) {
    throw new Error(`Unsupported creation entry mode: ${entryMode}`);
  }
  if (!Array.isArray(inputEvidence) || inputEvidence.length === 0) {
    throw new Error('A creation job requires evidence-labeled inputs.');
  }
  if (
    entryMode === 'designer-led' &&
    !inputEvidence.some((item) => item.kind === 'designer-brief')
  ) {
    throw new Error('A designer-led job requires a designer brief.');
  }
  if (
    entryMode === 'trend-led' &&
    !inputEvidence.some((item) => item.kind === 'trend-signal')
  ) {
    throw new Error('A trend-led job requires at least one trend signal.');
  }
  assertInputPolicy(environment, inputEvidence);

  const job: ProductCreationJob = {
    schemaVersion: 'cp.product-creation-job.v2',
    jobId,
    environment,
    simulation,
    trigger,
    brief: {
      schemaVersion: 'cp.product-brief.v1',
      briefId,
      releaseId,
      entryMode,
      status: 'candidate-only',
      inputEvidence,
      brandConstraints,
      referenceUsePolicy: { ...referenceUsePolicy },
      researchPolicy: { ...researchPolicy },
      truthPolicy: { ...TRUTH_POLICY },
    },
    idempotency: {
      key: idempotencyKey,
      inputFingerprint: null,
      duplicatePolicy: 'suppress',
    },
    contractBindings: {
      productReleaseRecord,
      mediaRegistry,
      commerceGateway: 'lib/commerce/product-gateway.ts',
      pipelineRunContract: 'contracts/pipeline-run.schema.json',
      pipelineRunId,
    },
    approvals: pendingApprovals(),
  };
  job.idempotency.inputFingerprint = computeCreationInputFingerprint(job);
  assertFailClosedJob(job);
  return job;
}

export function getConvergenceContract(job: ProductCreationJob) {
  assertFailClosedJob(job);
  const { pipelineRunId: _pipelineRunId, ...sharedContractBindings } =
    job.contractBindings;
  return {
    releaseId: job.brief.releaseId,
    candidateDisposition: job.brief.status,
    contractBindings: sharedContractBindings,
    brandConstraints: structuredClone(job.brief.brandConstraints),
    referenceUsePolicy: { ...job.brief.referenceUsePolicy },
    researchPolicy: { ...job.brief.researchPolicy },
    truthPolicy: { ...job.brief.truthPolicy },
    approvalKeys: Object.keys(job.approvals).sort(),
  };
}

export function registerCreationJob(
  existingJobs: ProductCreationJob[],
  job: ProductCreationJob
) {
  assertFailClosedJob(job);
  const duplicate = existingJobs.find(
    (existing) =>
      existing.idempotency.key === job.idempotency.key ||
      existing.idempotency.inputFingerprint === job.idempotency.inputFingerprint
  );
  if (duplicate) {
    return {
      accepted: false,
      reason: 'DUPLICATE_CREATION_JOB',
      duplicateOf: duplicate.jobId,
      jobs: structuredClone(existingJobs),
    };
  }
  return {
    accepted: true,
    reason: null,
    duplicateOf: null,
    jobs: [...structuredClone(existingJobs), structuredClone(job)],
  };
}

export function assessInputAuthority(job: ProductCreationJob) {
  assertFailClosedJob(job);
  return {
    candidateInputAccepted: job.brief.inputEvidence.length > 0,
    maySetProductTruth: false,
    mayApproveMedia: false,
    mayAuthorizeCommerce: false,
    mayPublish: false,
    researchOnlyEvidenceIds: job.brief.inputEvidence
      .filter((item) => item.authority === 'research-only')
      .map((item) => item.evidenceId),
  };
}

export function createCandidatePipelineRun(job: ProductCreationJob) {
  assertFailClosedJob(job);
  const externalExecutionBlocker = {
    code: 'EXTERNAL_EXECUTION_APPROVAL_REQUIRED',
    humanAction:
      'Product Owner approves the exact external tool/source, access path, and any cost or credit boundary.',
    resumePoint:
      'Invoke only the approved adapter in candidate-only mode, record sanitized evidence, and leave all write/publish gates pending.',
  };

  return createPipelineRun({
    runId: job.contractBindings.pipelineRunId,
    releaseId: job.brief.releaseId,
    mode: job.brief.entryMode,
    workItems: [
      {
        workItemId: 'external-input-refresh',
        lane: 'orchestration',
        capability: 'external-input-refresh',
        adapter: 'capability-registry',
        status: 'human_required',
        attempts: 0,
        evidence: job.brief.inputEvidence.map((item) => item.sourceRef),
        blocker: externalExecutionBlocker,
      },
      {
        workItemId: 'verify-product-pod-truth',
        lane: 'product-pod',
        capability: 'product-and-fulfillment-evidence',
        adapter: 'fulfillment-adapter',
      },
      {
        workItemId: 'build-media-truth',
        lane: 'media',
        capability: 'provenance-bound-media-candidate',
        adapter: 'cp-media-registry',
      },
      {
        workItemId: 'stage-commerce-candidate',
        lane: 'commerce-frontend',
        capability: 'shopify-backed-draft-candidate',
        adapter: 'shopify-commerce-gateway',
      },
      {
        workItemId: 'assemble-release-evidence',
        lane: 'orchestration',
        capability: 'release-record-and-approval-gates',
        adapter: 'cp-pipeline-run',
      },
    ],
  });
}

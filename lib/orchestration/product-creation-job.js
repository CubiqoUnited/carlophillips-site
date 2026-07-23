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

function pendingApprovals() {
  return Object.fromEntries(APPROVALS.map(action => [
    action,
    { status: 'pending', owner: 'Product Owner' },
  ]));
}

function assertInputPolicy(environment, inputEvidence) {
  for (const evidence of inputEvidence) {
    if (evidence.kind === 'trend-signal' && evidence.authority !== 'research-only') {
      throw new Error('Trend signals are research-only and cannot become candidate truth.');
    }
    if (evidence.sourceType === 'fixture') {
      if (environment !== 'local') {
        throw new Error('Fixture creation evidence is local-only.');
      }
      if (evidence.authority !== 'research-only' || evidence.confidence !== 'unassessed') {
        throw new Error('Fixture evidence must remain unassessed and research-only.');
      }
    }
  }
}

function assertFailClosedJob(job) {
  if (job.candidateDisposition !== 'draft-only') {
    throw new Error('Creation jobs may produce Draft candidates only.');
  }
  if (Object.values(job.truthPolicy).some(Boolean)) {
    throw new Error('Creation inputs cannot grant product, media, commerce, or publish authority.');
  }
  if (APPROVALS.some(action => (
    job.approvals[action]?.status !== 'pending'
    || job.approvals[action]?.owner !== 'Product Owner'
  ))) {
    throw new Error('Every restricted creation action requires pending Product Owner approval.');
  }
  assertInputPolicy(job.environment, job.inputEvidence);
}

export function createProductCreationJob({
  jobId,
  environment = 'local',
  simulation = false,
  entryMode,
  releaseId,
  inputEvidence,
  productReleaseRecord,
  mediaRegistry,
  pipelineRunId,
}) {
  if (!['designer-led', 'trend-led'].includes(entryMode)) {
    throw new Error(`Unsupported creation entry mode: ${entryMode}`);
  }
  if (!Array.isArray(inputEvidence) || inputEvidence.length === 0) {
    throw new Error('A creation job requires evidence-labeled inputs.');
  }
  if (entryMode === 'designer-led' && !inputEvidence.some(item => item.kind === 'designer-brief')) {
    throw new Error('A designer-led job requires a designer brief.');
  }
  if (entryMode === 'trend-led' && !inputEvidence.some(item => item.kind === 'trend-signal')) {
    throw new Error('A trend-led job requires at least one trend signal.');
  }
  assertInputPolicy(environment, inputEvidence);

  const job = {
    schemaVersion: 'cp.product-creation-job.v1',
    jobId,
    environment,
    simulation,
    entryMode,
    releaseId,
    candidateDisposition: 'draft-only',
    inputEvidence,
    contractBindings: {
      productReleaseRecord,
      mediaRegistry,
      commerceGateway: 'lib/commerce/product-gateway.js',
      pipelineRunContract: 'contracts/pipeline-run.schema.json',
      pipelineRunId,
    },
    truthPolicy: { ...TRUTH_POLICY },
    approvals: pendingApprovals(),
  };
  assertFailClosedJob(job);
  return job;
}

export function getConvergenceContract(job) {
  assertFailClosedJob(job);
  const {
    pipelineRunId: _pipelineRunId,
    ...sharedContractBindings
  } = job.contractBindings;
  return {
    releaseId: job.releaseId,
    candidateDisposition: job.candidateDisposition,
    contractBindings: sharedContractBindings,
    truthPolicy: { ...job.truthPolicy },
    approvalKeys: Object.keys(job.approvals).sort(),
  };
}

export function assessInputAuthority(job) {
  assertFailClosedJob(job);
  return {
    candidateInputAccepted: job.inputEvidence.length > 0,
    maySetProductTruth: false,
    mayApproveMedia: false,
    mayAuthorizeCommerce: false,
    mayPublish: false,
    researchOnlyEvidenceIds: job.inputEvidence
      .filter(item => item.authority === 'research-only')
      .map(item => item.evidenceId),
  };
}

export function createCandidatePipelineRun(job) {
  assertFailClosedJob(job);
  const externalExecutionBlocker = {
    code: 'EXTERNAL_EXECUTION_APPROVAL_REQUIRED',
    humanAction: 'Product Owner approves the exact external tool/source, access path, and any cost or credit boundary.',
    resumePoint: 'Invoke only the approved adapter in candidate-only mode, record sanitized evidence, and leave all write/publish gates pending.',
  };

  return createPipelineRun({
    runId: job.contractBindings.pipelineRunId,
    releaseId: job.releaseId,
    mode: job.entryMode,
    workItems: [
      {
        workItemId: 'external-input-refresh',
        lane: 'orchestration',
        capability: 'external-input-refresh',
        adapter: 'capability-registry',
        status: 'human_required',
        attempts: 0,
        evidence: job.inputEvidence.map(item => item.sourceRef),
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

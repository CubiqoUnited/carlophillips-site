import { describe, expect, it } from 'vitest';
import {
  assessInputAuthority,
  computeCreationInputFingerprint,
  createCandidatePipelineRun,
  createProductCreationJob,
  getConvergenceContract,
  registerCreationJob,
} from '../lib/orchestration/product-creation-job';
import designerJob from '../runs/cp-hoodie-designer-contract-sim-002/job.json';
import trendJob from '../runs/cp-hoodie-trend-contract-sim-003/job.json';
import designerRunArtifact from '../runs/cp-hoodie-designer-contract-sim-002/run.json';
import trendRunArtifact from '../runs/cp-hoodie-trend-contract-sim-003/run.json';

describe('ProductCreationJob', () => {
  it('requires mode-specific evidence', () => {
    const shared = {
      jobId: 'cp-invalid-job',
      releaseId: 'cp-signature-hoodie-2026-001',
      inputEvidence: [
        {
          evidenceId: 'brand-rule',
          kind: 'brand-rule',
          sourceType: 'first-party',
          sourceRef: 'PRD.md',
          observedAt: '2026-07-22T00:00:00Z',
          authority: 'candidate-input',
          confidence: 'high',
        },
      ],
      productReleaseRecord:
        'releases/cp-signature-hoodie-2026-001/release.json',
      mediaRegistry:
        'releases/cp-signature-hoodie-2026-001/media-manifest.json',
      pipelineRunId: 'cp-invalid-run',
    };

    expect(() =>
      createProductCreationJob({
        ...shared,
        entryMode: 'designer-led',
      })
    ).toThrow(/designer brief/);
    expect(() =>
      createProductCreationJob({
        ...shared,
        entryMode: 'trend-led',
      })
    ).toThrow(/trend signal/);
  });

  it('reproduces both durable jobs through the deterministic factory', () => {
    for (const job of [designerJob, trendJob]) {
      expect(
        createProductCreationJob({
          jobId: job.jobId,
          environment: job.environment,
          simulation: job.simulation,
          briefId: job.brief.briefId,
          entryMode: job.brief.entryMode,
          releaseId: job.brief.releaseId,
          trigger: job.trigger,
          inputEvidence: job.brief.inputEvidence,
          brandConstraints: job.brief.brandConstraints,
          referenceUsePolicy: job.brief.referenceUsePolicy,
          researchPolicy: job.brief.researchPolicy,
          idempotencyKey: job.idempotency.key,
          productReleaseRecord: job.contractBindings.productReleaseRecord,
          mediaRegistry: job.contractBindings.mediaRegistry,
          pipelineRunId: job.contractBindings.pipelineRunId,
        })
      ).toEqual(job);
      expect(computeCreationInputFingerprint(job)).toBe(
        job.idempotency.inputFingerprint
      );
    }
  });

  it('makes both entry modes converge on the same canonical truth and approval core', () => {
    expect(getConvergenceContract(designerJob)).toEqual(
      getConvergenceContract(trendJob)
    );

    const designerRun = createCandidatePipelineRun(designerJob);
    const trendRun = createCandidatePipelineRun(trendJob);
    expect(
      designerRun.workItems.map((item) => [
        item.lane,
        item.capability,
        item.adapter,
      ])
    ).toEqual(
      trendRun.workItems.map((item) => [
        item.lane,
        item.capability,
        item.adapter,
      ])
    );
    expect(Object.keys(designerRun.approvals)).toEqual(
      Object.keys(trendRun.approvals)
    );
    expect(designerRun).toEqual(designerRunArtifact);
    expect(trendRun).toEqual(trendRunArtifact);
  });

  it('keeps safe work actionable around an external human gate', () => {
    const run = createCandidatePipelineRun(trendJob);
    expect(run.state).toBe('in_progress_with_blockers');
    expect(
      run.workItems.find((item) => item.status === 'human_required')
    ).toMatchObject({
      workItemId: 'external-input-refresh',
      blocker: {
        code: 'EXTERNAL_EXECUTION_APPROVAL_REQUIRED',
      },
    });
    expect(
      run.workItems.filter((item) => item.status === 'pending')
    ).toHaveLength(4);
    expect(trendJob.brief.inputEvidence[0]).toMatchObject({
      authority: 'research-only',
      freshness: { status: 'stale', maxAgeHours: 24 },
    });
  });

  it('never promotes trend research or designer input into product, media, commerce, or publish authority', () => {
    expect(assessInputAuthority(trendJob)).toEqual({
      candidateInputAccepted: true,
      maySetProductTruth: false,
      mayApproveMedia: false,
      mayAuthorizeCommerce: false,
      mayPublish: false,
      researchOnlyEvidenceIds: ['contract-trend-signal'],
    });
    expect(assessInputAuthority(designerJob)).toMatchObject({
      maySetProductTruth: false,
      mayApproveMedia: false,
      mayAuthorizeCommerce: false,
      mayPublish: false,
    });
  });

  it('rejects fixture evidence outside local and rejects authority-tampered jobs', () => {
    const previewTrendJob = structuredClone(trendJob);
    previewTrendJob.environment = 'preview';
    expect(() => createCandidatePipelineRun(previewTrendJob)).toThrow(
      /local-only/
    );

    const elevated = structuredClone(trendJob);
    elevated.brief.truthPolicy.maySetProductTruth = true;
    expect(() => assessInputAuthority(elevated)).toThrow(/cannot grant/);

    const preapproved = structuredClone(designerJob);
    preapproved.approvals.shopifyWrite.status = 'approved';
    expect(() => createCandidatePipelineRun(preapproved)).toThrow(
      /pending Product Owner/
    );
  });

  it('distinguishes on-demand and scheduled cadence without authorizing execution', () => {
    expect(designerJob.trigger).toEqual({
      type: 'on-demand',
      requestedAt: '2026-07-22T00:00:00Z',
      cadence: 'on-demand',
      schedule: null,
    });
    expect(trendJob.trigger).toMatchObject({
      type: 'scheduled',
      cadence: 'daily',
      schedule: {
        expression: '0 9 * * *',
        timezone: 'America/New_York',
      },
    });
    expect(trendJob.brief.researchPolicy.mayTriggerExternalResearch).toBe(
      false
    );
    expect(trendJob.approvals.externalExecution.status).toBe('pending');
  });

  it('rejects inconsistent freshness, copying authority, and missing binding brand rules', () => {
    const falselyFresh = structuredClone(trendJob);
    falselyFresh.brief.inputEvidence[0].freshness.status = 'current';
    expect(() => createCandidatePipelineRun(falselyFresh)).toThrow(
      /beyond its freshness limit/
    );

    const copyAuthorized = structuredClone(designerJob);
    copyAuthorized.brief.referenceUsePolicy.mayCopy = true;
    expect(() => createCandidatePipelineRun(copyAuthorized)).toThrow(
      /inspiration-only/
    );

    const unconstrained = structuredClone(designerJob);
    unconstrained.brief.brandConstraints.rules = [];
    expect(() => createCandidatePipelineRun(unconstrained)).toThrow(
      /binding brand rules/
    );

    const impossibleTimeline = structuredClone(designerJob);
    impossibleTimeline.brief.inputEvidence[0].provenance.retrievedAt =
      '2026-07-21T00:00:00Z';
    expect(() => createCandidatePipelineRun(impossibleTimeline)).toThrow(
      /invalid freshness window/
    );
  });

  it('suppresses retries and equivalent duplicate jobs without mutating the accepted registry', () => {
    const accepted = registerCreationJob([], designerJob);
    expect(accepted).toMatchObject({
      accepted: true,
      reason: null,
      duplicateOf: null,
    });

    const retry = registerCreationJob(accepted.jobs, designerJob);
    expect(retry).toMatchObject({
      accepted: false,
      reason: 'DUPLICATE_CREATION_JOB',
      duplicateOf: designerJob.jobId,
    });
    expect(retry.jobs).toEqual(accepted.jobs);

    const equivalent = structuredClone(designerJob);
    equivalent.jobId = 'cp-hoodie-designer-equivalent-sim';
    equivalent.brief.briefId = 'cp-hoodie-designer-equivalent-brief';
    equivalent.contractBindings.pipelineRunId =
      'cp-hoodie-designer-equivalent-sim';
    equivalent.idempotency.key = 'cp:hoodie:designer:equivalent-sim';
    const duplicate = registerCreationJob(accepted.jobs, equivalent);
    expect(duplicate).toMatchObject({
      accepted: false,
      reason: 'DUPLICATE_CREATION_JOB',
      duplicateOf: designerJob.jobId,
    });
  });
});

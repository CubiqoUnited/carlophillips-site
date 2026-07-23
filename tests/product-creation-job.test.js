import { describe, expect, it } from 'vitest';
import {
  assessInputAuthority,
  createCandidatePipelineRun,
  createProductCreationJob,
  getConvergenceContract,
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
      inputEvidence: [{
        evidenceId: 'brand-rule',
        kind: 'brand-rule',
        sourceType: 'first-party',
        sourceRef: 'PRD.md',
        observedAt: '2026-07-22T00:00:00Z',
        authority: 'candidate-input',
        confidence: 'high',
      }],
      productReleaseRecord: 'releases/cp-signature-hoodie-2026-001/release.json',
      mediaRegistry: 'releases/cp-signature-hoodie-2026-001/media-manifest.json',
      pipelineRunId: 'cp-invalid-run',
    };

    expect(() => createProductCreationJob({
      ...shared,
      entryMode: 'designer-led',
    })).toThrow(/designer brief/);
    expect(() => createProductCreationJob({
      ...shared,
      entryMode: 'trend-led',
    })).toThrow(/trend signal/);
  });

  it('makes both entry modes converge on the same canonical truth and approval core', () => {
    expect(getConvergenceContract(designerJob)).toEqual(getConvergenceContract(trendJob));

    const designerRun = createCandidatePipelineRun(designerJob);
    const trendRun = createCandidatePipelineRun(trendJob);
    expect(designerRun.workItems.map(item => [item.lane, item.capability, item.adapter]))
      .toEqual(trendRun.workItems.map(item => [item.lane, item.capability, item.adapter]));
    expect(Object.keys(designerRun.approvals)).toEqual(Object.keys(trendRun.approvals));
    expect(designerRun).toEqual(designerRunArtifact);
    expect(trendRun).toEqual(trendRunArtifact);
  });

  it('keeps safe work actionable around an external human gate', () => {
    const run = createCandidatePipelineRun(trendJob);
    expect(run.state).toBe('in_progress_with_blockers');
    expect(run.workItems.find(item => item.status === 'human_required')).toMatchObject({
      workItemId: 'external-input-refresh',
      blocker: {
        code: 'EXTERNAL_EXECUTION_APPROVAL_REQUIRED',
      },
    });
    expect(run.workItems.filter(item => item.status === 'pending')).toHaveLength(4);
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
    expect(() => createCandidatePipelineRun(previewTrendJob)).toThrow(/local-only/);

    const elevated = structuredClone(trendJob);
    elevated.truthPolicy.maySetProductTruth = true;
    expect(() => assessInputAuthority(elevated)).toThrow(/cannot grant/);

    const preapproved = structuredClone(designerJob);
    preapproved.approvals.shopifyWrite.status = 'approved';
    expect(() => createCandidatePipelineRun(preapproved)).toThrow(/pending Product Owner/);
  });
});

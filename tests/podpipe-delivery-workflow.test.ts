import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import {
  PODPIPE_DELIVERY_STEP_DEFINITIONS,
  evaluatePodpipeDelivery,
  evaluatePodpipeReleaseTransition,
  type PodpipeDeliveryApproval,
  type PodpipeDeliveryInput,
  type PodpipeDeliveryStepId,
} from '../apps/web/src/lib/orchestration/podpipe-delivery.ts';

const expectedStepIds = [
  'product-brief',
  'select-provider-garment',
  'prepare-production-artwork',
  'create-pod-draft',
  'configure-fulfillment-truth',
  'sync-shopify-draft',
  'verify-physical-sample',
  'collect-canonical-references',
  'produce-editorial-media',
  'curate-quarantine-media',
  'produce-real-360-3d',
  'register-approved-media',
  'assemble-headless-display',
  'preview-qa',
  'product-owner-approval',
  'merge-production-deployment',
  'live-verification',
] as const;

const readJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as unknown;

const deliverySchema = readJson('contracts/podpipe-delivery.schema.json');
const validateDeliveryEvidence = new Ajv2020({ allErrors: true }).compile(
  deliverySchema
);

function completeDelivery(): PodpipeDeliveryInput {
  const steps = Object.fromEntries(
    expectedStepIds.map((id, index) => [
      id,
      {
        status: [
          'verify-physical-sample',
          'register-approved-media',
          'product-owner-approval',
        ].includes(id)
          ? 'approved'
          : 'verified',
        evidence: [`evidence/step-${index + 1}.json`],
      },
    ])
  ) as Record<
    PodpipeDeliveryStepId,
    {
      status: 'verified' | 'approved';
      evidence: string[];
    }
  >;
  const approvalIds: PodpipeDeliveryApproval[] = [
    'externalExecution',
    'spend',
    'sample',
    'shopifyWrite',
    'publish',
    'production',
    'liveVerification',
  ];
  const approvals = Object.fromEntries(
    approvalIds.map((id) => [
      id,
      { status: 'approved', owner: 'Product Owner' },
    ])
  ) as PodpipeDeliveryInput['approvals'];

  return {
    releaseId: 'cp-complete-delivery-001',
    releaseState: 'approved',
    steps,
    approvals,
  };
}

describe('typed PODPIPE delivery workflow', () => {
  it('defines the exact seventeen-step delivery order', () => {
    expect(PODPIPE_DELIVERY_STEP_DEFINITIONS).toHaveLength(17);
    expect(
      PODPIPE_DELIVERY_STEP_DEFINITIONS.map((definition) => definition.id)
    ).toEqual(expectedStepIds);

    const decision = evaluatePodpipeDelivery({
      releaseId: 'cp-empty-delivery-001',
      releaseState: 'draft',
    });
    expect(decision.steps.map((step) => step.position)).toEqual(
      Array.from({ length: 17 }, (_, index) => index + 1)
    );
  });

  it('schema-validates the exact current evidence envelope', () => {
    const evidence = readJson(
      'releases/cp-signature-hoodie-2026-001/podpipe-delivery.json'
    );
    expect(validateDeliveryEvidence(evidence)).toBe(true);

    const incomplete = structuredClone(evidence) as Record<string, unknown>;
    const steps = incomplete.steps as Record<string, unknown>;
    delete steps['live-verification'];
    expect(validateDeliveryEvidence(incomplete)).toBe(false);
  });

  it('keeps every external step unauthorized without exact approvals', () => {
    const spoofedEvidence = completeDelivery();
    spoofedEvidence.approvals = {};
    const decision = evaluatePodpipeDelivery(spoofedEvidence);

    expect(decision.ready).toBe(false);
    expect(decision.authorizedExternalSteps).toEqual([]);
    expect(decision.steps[1]).toMatchObject({
      id: 'select-provider-garment',
      status: 'blocked',
      blockers: ['EXTERNAL_EXECUTION_APPROVAL_REQUIRED'],
    });
    expect(decision.steps[5].blockers).toContain(
      'SHOPIFY_WRITE_APPROVAL_REQUIRED'
    );
    expect(decision.steps[6].blockers).toEqual(
      expect.arrayContaining([
        'SPEND_APPROVAL_REQUIRED',
        'SAMPLE_APPROVAL_REQUIRED',
      ])
    );
    expect(decision.steps[15].blockers).toEqual(
      expect.arrayContaining([
        'PUBLISH_APPROVAL_REQUIRED',
        'PRODUCTION_APPROVAL_REQUIRED',
      ])
    );
    expect(decision.steps[16].blockers).toContain(
      'LIVE_VERIFICATION_APPROVAL_REQUIRED'
    );
  });

  it('records the current Signature Hoodie truth as Draft and blocked', () => {
    const evidence = readJson(
      'releases/cp-signature-hoodie-2026-001/podpipe-delivery.json'
    ) as PodpipeDeliveryInput;
    const decision = evaluatePodpipeDelivery(evidence);

    expect(evidence.releaseState).toBe('draft');
    expect(decision.ready).toBe(false);
    expect(decision.authorizedExternalSteps).toEqual([]);
    expect(decision.steps[0]).toMatchObject({
      status: 'ready',
      evidenceStatus: 'candidate',
    });
    expect(decision.steps[1]).toMatchObject({
      status: 'blocked',
      evidenceStatus: 'candidate',
    });
    expect(decision.steps[9]).toMatchObject({
      evidenceStatus: 'verified',
      status: 'blocked',
    });
  });

  it('allows pure workflow readiness only after all evidence and approvals exist', () => {
    const decision = evaluatePodpipeDelivery(completeDelivery());
    expect(decision.ready).toBe(true);
    expect(decision.steps.every((step) => step.status === 'complete')).toBe(
      true
    );
    expect(decision.authorizedExternalSteps).toEqual([]);
  });

  it('requires approval-grade evidence for sample, registry, and owner gates', () => {
    const input = completeDelivery();
    input.steps!['verify-physical-sample']!.status = 'verified';
    const decision = evaluatePodpipeDelivery(input);

    expect(decision.steps[6].status).toBe('ready');
    expect(decision.steps[7].status).toBe('blocked');
    expect(decision.ready).toBe(false);
  });

  it('denies every current Hoodie release transition without mutating evidence', () => {
    const delivery = readJson(
      'releases/cp-signature-hoodie-2026-001/podpipe-delivery.json'
    ) as PodpipeDeliveryInput;
    type TransitionInput = Parameters<
      typeof evaluatePodpipeReleaseTransition
    >[0];
    const record = readJson(
      'releases/cp-signature-hoodie-2026-001/release.json'
    ) as TransitionInput['record'];
    const manifest = readJson(
      'releases/cp-signature-hoodie-2026-001/media-manifest.json'
    ) as TransitionInput['manifest'];
    const before = JSON.stringify({ delivery, record, manifest });

    for (const targetState of ['staged', 'approved', 'released'] as const) {
      const decision = evaluatePodpipeReleaseTransition({
        delivery,
        record,
        manifest,
        targetState,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.candidate).toBeNull();
      expect(decision.blockers.length).toBeGreaterThan(0);
    }

    expect(record.state).toBe('draft');
    expect(JSON.stringify({ delivery, record, manifest })).toBe(before);
  });
});

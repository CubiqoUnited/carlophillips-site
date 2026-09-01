import { describe, expect, it } from 'vitest';
import {
  authorizeRestrictedAction,
  createPipelineRun,
  recordWorkItemEvent,
  resumeHumanWorkItem,
} from '../lib/orchestration/pipeline-run';

function createRun() {
  return createPipelineRun({
    runId: 'cp-hoodie-local-sim-001',
    releaseId: 'cp-signature-hoodie-2026-001',
    mode: 'designer-led',
    workItems: [
      {
        workItemId: 'pod-map',
        lane: 'product-pod',
        capability: 'hoodie-fulfillment',
        adapter: 'apliiq',
      },
      {
        workItemId: 'media-plan',
        lane: 'media',
        capability: 'media-matrix',
        adapter: 'cp-media-registry',
      },
      {
        workItemId: 'commerce-check',
        lane: 'commerce-frontend',
        capability: 'local-contract-test',
        adapter: 'shopify-gateway',
      },
      {
        workItemId: 'run-audit',
        lane: 'orchestration',
        capability: 'event-log',
        adapter: 'cp-pipeline-run',
      },
    ],
  });
}

function event(overrides = {}) {
  return {
    eventId: 'evt-1',
    idempotencyKey: 'idem-1',
    workItemId: 'pod-map',
    status: 'human_required',
    recordedAt: '2026-07-22T22:45:00Z',
    actor: 'CP Fitness Delivery Agent',
    evidence: ['docs/shopify-capability-access-audit.md'],
    blocker: {
      code: 'APLIIQ_READ_ACCESS_REQUIRED',
      humanAction: 'Authorize a least-privilege read-only Apliiq access path.',
      resumePoint:
        'Observe and fingerprint the Hoodie provider-to-Shopify variant mapping without ordering.',
    },
    ...overrides,
  };
}

describe('PipelineRun', () => {
  it('requires all four coordinated lanes', () => {
    expect(() =>
      createPipelineRun({
        runId: 'cp-invalid',
        releaseId: 'release',
        mode: 'designer-led',
        workItems: [],
      })
    ).toThrow(/all four/);
  });

  it('isolates a human blocker while safe work continues', () => {
    const blocked = recordWorkItemEvent(createRun(), event());
    expect(blocked.state).toBe('in_progress_with_blockers');
    expect(
      blocked.workItems.filter((item) => item.status === 'pending')
    ).toHaveLength(3);

    const continued = recordWorkItemEvent(
      blocked,
      event({
        eventId: 'evt-2',
        idempotencyKey: 'idem-2',
        workItemId: 'commerce-check',
        status: 'succeeded',
        evidence: ['test_reports/cp-fitness-cycle-3/verification.json'],
        blocker: null,
      })
    );
    expect(continued.state).toBe('in_progress_with_blockers');
    expect(
      continued.workItems.find((item) => item.workItemId === 'commerce-check')
        .status
    ).toBe('succeeded');
  });

  it('uses global blocked only when no unblocked actionable work remains', () => {
    let run = recordWorkItemEvent(createRun(), event());
    run = recordWorkItemEvent(
      run,
      event({
        eventId: 'evt-media-blocked',
        idempotencyKey: 'idem-media',
        workItemId: 'media-plan',
      })
    );
    run = recordWorkItemEvent(
      run,
      event({
        eventId: 'evt-commerce-done',
        idempotencyKey: 'idem-commerce',
        workItemId: 'commerce-check',
        status: 'succeeded',
        blocker: null,
      })
    );
    run = recordWorkItemEvent(
      run,
      event({
        eventId: 'evt-orchestration-done',
        idempotencyKey: 'idem-orchestration',
        workItemId: 'run-audit',
        status: 'succeeded',
        blocker: null,
      })
    );
    expect(run.state).toBe('blocked');
  });

  it('suppresses duplicate events by idempotency key', () => {
    const once = recordWorkItemEvent(createRun(), event());
    const twice = recordWorkItemEvent(
      once,
      event({ eventId: 'evt-duplicate' })
    );
    expect(twice.events).toHaveLength(1);
    expect(twice.workItems[0].attempts).toBe(1);
  });

  it('resumes a human-required item without losing its evidence', () => {
    const blocked = recordWorkItemEvent(createRun(), event());
    const resumed = resumeHumanWorkItem(blocked, 'pod-map');
    expect(resumed.workItems[0]).toMatchObject({
      status: 'pending',
      blocker: null,
      attempts: 1,
    });
    expect(resumed.workItems[0].evidence).toHaveLength(1);
  });

  it.each([
    'externalExecution',
    'spend',
    'credits',
    'sample',
    'shopifyWrite',
    'publish',
    'production',
  ])('denies %s without Product Owner approval', (action) => {
    const decision = authorizeRestrictedAction(createRun(), action);
    expect(decision).toMatchObject({
      allowed: false,
      status: 'human_required',
    });
    expect(decision.run.approvals[action].status).toBe('pending');
  });
});

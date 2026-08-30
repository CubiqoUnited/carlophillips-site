const LANES = ['product-pod', 'media', 'commerce-frontend', 'orchestration'];
export const RESTRICTED_ACTIONS = [
  'externalExecution',
  'spend',
  'credits',
  'sample',
  'shopifyWrite',
  'publish',
  'production',
];
const TERMINAL_WORK_ITEM_STATES = ['succeeded', 'unavailable'];

type WorkItemStatus =
  | 'pending'
  | 'in_progress'
  | 'human_required'
  | 'unavailable'
  | 'failed'
  | 'succeeded';
interface PipelineWorkItem {
  workItemId: string;
  lane: string;
  capability: string;
  adapter: string;
  status: WorkItemStatus;
  attempts: number;
  evidence: string[];
  blocker: Record<string, unknown> | null;
}
interface WorkItemInput extends Omit<
  PipelineWorkItem,
  'status' | 'attempts' | 'evidence' | 'blocker'
> {
  status?: WorkItemStatus;
  attempts?: number;
  evidence?: string[];
  blocker?: Record<string, unknown> | null;
}
interface PipelineEvent {
  eventId: string;
  idempotencyKey: string;
  workItemId: string;
  status: WorkItemStatus;
  recordedAt: string;
  actor: string;
  evidence?: string[];
  blocker?: Record<string, unknown> | null;
}
interface PipelineRun {
  schemaVersion: 'cp.pipeline-run.v1';
  runId: string;
  releaseId: string;
  mode: string;
  state: string;
  workItems: PipelineWorkItem[];
  events: PipelineEvent[];
  approvals: Record<string, { status: string; owner: string }>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function deriveRunState(workItems: PipelineWorkItem[]): string {
  if (workItems.every((item) => item.status === 'succeeded')) return 'complete';
  const hasBlockers = workItems.some((item) =>
    ['human_required', 'unavailable', 'failed'].includes(item.status)
  );
  const hasActionableWork = workItems.some((item) =>
    ['pending', 'in_progress'].includes(item.status)
  );
  if (hasBlockers && hasActionableWork) return 'in_progress_with_blockers';
  if (hasBlockers) return 'blocked';
  if (workItems.some((item) => item.status === 'in_progress'))
    return 'in_progress';
  return 'pending';
}

export function createPipelineRun({
  runId,
  releaseId,
  mode,
  workItems,
}: {
  runId: string;
  releaseId: string;
  mode: string;
  workItems: WorkItemInput[];
}): PipelineRun {
  const observedLanes = new Set(workItems.map((item) => item.lane));
  if (!LANES.every((lane) => observedLanes.has(lane))) {
    throw new Error(
      'A PipelineRun must include work in all four delivery lanes.'
    );
  }
  const normalizedWorkItems = workItems.map((item) => ({
    ...item,
    status: item.status || 'pending',
    attempts: item.attempts || 0,
    evidence: item.evidence || [],
    blocker: item.blocker || null,
  }));

  return {
    schemaVersion: 'cp.pipeline-run.v1',
    runId,
    releaseId,
    mode,
    state: deriveRunState(normalizedWorkItems),
    workItems: normalizedWorkItems,
    events: [],
    approvals: Object.fromEntries(
      RESTRICTED_ACTIONS.map((action) => [
        action,
        { status: 'pending', owner: 'Product Owner' },
      ])
    ),
  };
}

export function recordWorkItemEvent(
  run: PipelineRun,
  event: PipelineEvent
): PipelineRun {
  if (
    run.events.some(
      (existing) => existing.idempotencyKey === event.idempotencyKey
    )
  ) {
    return clone(run);
  }

  const next = clone(run);
  const workItem = next.workItems.find(
    (item) => item.workItemId === event.workItemId
  );
  if (!workItem) throw new Error(`Unknown work item: ${event.workItemId}`);
  if (TERMINAL_WORK_ITEM_STATES.includes(workItem.status)) {
    throw new Error(`Work item ${event.workItemId} is already terminal.`);
  }

  workItem.status = event.status;
  workItem.attempts += 1;
  workItem.evidence = [...workItem.evidence, ...(event.evidence || [])];
  workItem.blocker = event.blocker || null;
  next.events.push({
    eventId: event.eventId,
    idempotencyKey: event.idempotencyKey,
    workItemId: event.workItemId,
    status: event.status,
    recordedAt: event.recordedAt,
    actor: event.actor,
  });
  next.state = deriveRunState(next.workItems);
  return next;
}

export function resumeHumanWorkItem(
  run: PipelineRun,
  workItemId: string
): PipelineRun {
  const next = clone(run);
  const workItem = next.workItems.find(
    (item) => item.workItemId === workItemId
  );
  if (!workItem || workItem.status !== 'human_required') {
    throw new Error('Only a human_required work item can be resumed.');
  }
  workItem.status = 'pending';
  workItem.blocker = null;
  next.state = deriveRunState(next.workItems);
  return next;
}

export function authorizeRestrictedAction(
  run: PipelineRun,
  action: string,
  approvalStatus = 'pending'
) {
  if (!RESTRICTED_ACTIONS.includes(action))
    throw new Error(`Unknown restricted action: ${action}`);
  if (approvalStatus !== 'approved') {
    return {
      allowed: false,
      status: 'human_required',
      reason: `${action.toUpperCase()}_APPROVAL_REQUIRED`,
      run: clone(run),
    };
  }

  const next = clone(run);
  next.approvals[action].status = 'approved';
  return { allowed: true, status: 'approved', reason: null, run: next };
}

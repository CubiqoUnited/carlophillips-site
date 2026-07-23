const LANES = ['product-pod', 'media', 'commerce-frontend', 'orchestration'];
const RESTRICTED_ACTIONS = ['spend', 'credits', 'sample', 'publish', 'production'];
const TERMINAL_WORK_ITEM_STATES = ['succeeded', 'unavailable'];

function clone(value) {
  return structuredClone(value);
}

function deriveRunState(workItems) {
  if (workItems.every(item => item.status === 'succeeded')) return 'complete';
  const hasBlockers = workItems.some(item => (
    ['human_required', 'unavailable', 'failed'].includes(item.status)
  ));
  const hasActionableWork = workItems.some(item => ['pending', 'in_progress'].includes(item.status));
  if (hasBlockers && hasActionableWork) return 'in_progress_with_blockers';
  if (hasBlockers) return 'blocked';
  if (workItems.some(item => item.status === 'in_progress')) return 'in_progress';
  return 'pending';
}

export function createPipelineRun({ runId, releaseId, mode, workItems }) {
  const observedLanes = new Set(workItems.map(item => item.lane));
  if (!LANES.every(lane => observedLanes.has(lane))) {
    throw new Error('A PipelineRun must include work in all four delivery lanes.');
  }
  return {
    schemaVersion: 'cp.pipeline-run.v1',
    runId,
    releaseId,
    mode,
    state: 'pending',
    workItems: workItems.map(item => ({
      ...item,
      status: item.status || 'pending',
      attempts: item.attempts || 0,
      evidence: item.evidence || [],
      blocker: item.blocker || null,
    })),
    events: [],
    approvals: Object.fromEntries(RESTRICTED_ACTIONS.map(action => [
      action,
      { status: 'pending', owner: 'Product Owner' },
    ])),
  };
}

export function recordWorkItemEvent(run, event) {
  if (run.events.some(existing => existing.idempotencyKey === event.idempotencyKey)) {
    return clone(run);
  }

  const next = clone(run);
  const workItem = next.workItems.find(item => item.workItemId === event.workItemId);
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

export function resumeHumanWorkItem(run, workItemId) {
  const next = clone(run);
  const workItem = next.workItems.find(item => item.workItemId === workItemId);
  if (!workItem || workItem.status !== 'human_required') {
    throw new Error('Only a human_required work item can be resumed.');
  }
  workItem.status = 'pending';
  workItem.blocker = null;
  next.state = deriveRunState(next.workItems);
  return next;
}

export function authorizeRestrictedAction(run, action, approvalStatus = 'pending') {
  if (!RESTRICTED_ACTIONS.includes(action)) throw new Error(`Unknown restricted action: ${action}`);
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

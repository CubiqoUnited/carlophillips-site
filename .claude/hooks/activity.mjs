#!/usr/bin/env node
/*
 * V3.5interim activity recorder.
 *
 * Fires on every tool use, from Sushma and from every dispatched agent, and
 * appends one line to state/activity.jsonl. It exists because discipline is
 * not a control: state/events.jsonl went silent for a full working day while
 * a rebase, a push, two commits, a quarantine and four dispatches happened.
 * The harness cannot forget, so the harness does the recording.
 *
 * Never throws, never blocks a tool call. A broken recorder must not be able
 * to stop delivery.
 */
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, relative, isAbsolute } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LOG = `${ROOT}/state/activity.jsonl`;

/* Which role a session belongs to. Subagents carry their type; the main
 * session is Sushma by the project's own CLAUDE.md. */
function roleOf(payload) {
  const raw = (
    payload.subagent_type ||
    payload.agent_type ||
    payload.agent ||
    ''
  ).toLowerCase();
  for (const known of ['sushma', 'pushpa', 'aarti', 'watchdog']) {
    if (raw.includes(known)) return known;
  }
  if (raw) return raw;
  return 'sushma';
}

/* A short, human-readable statement of what just happened. The dashboard
 * shows this verbatim, so it must read as an action, not a tool name. */
function describe(tool, input) {
  const i = input || {};
  const path = i.file_path || i.path || i.notebook_path;
  const short = (p) => {
    if (!p) return '';
    try {
      const r = isAbsolute(p) ? relative(ROOT, p) : p;
      return r.startsWith('..') ? p : r;
    } catch {
      return p;
    }
  };

  switch (tool) {
    case 'Read':
      return { verb: 'READ', what: `reading ${short(path)}`, target: short(path) };
    case 'Write':
      return { verb: 'WRITE', what: `writing ${short(path)}`, target: short(path) };
    case 'Edit':
    case 'NotebookEdit':
      return { verb: 'EDIT', what: `editing ${short(path)}`, target: short(path) };
    case 'Grep':
      return { verb: 'SEARCH', what: `searching for "${i.pattern ?? ''}"`, target: i.pattern };
    case 'Glob':
      return { verb: 'SEARCH', what: `globbing ${i.pattern ?? ''}`, target: i.pattern };
    case 'Bash': {
      const d = i.description || (i.command || '').slice(0, 72);
      return { verb: 'SHELL', what: d, target: (i.command || '').slice(0, 200) };
    }
    case 'Agent':
      return {
        verb: 'DISPATCH',
        what: `dispatching ${i.subagent_type || 'agent'}: ${i.description || ''}`,
        target: i.subagent_type,
      };
    case 'WebFetch':
    case 'WebSearch':
      return { verb: 'FETCH', what: `fetching ${i.url || i.query || ''}`, target: i.url || i.query };
    default: {
      /* MCP tools arrive as mcp__Server__action; show what a person would say. */
      const m = /^mcp__(.+?)__(.+)$/.exec(tool);
      if (m) {
        const server = m[1].replace(/_/g, ' ').trim();
        const action = m[2].replace(/_/g, ' ').trim();
        return { verb: 'TOOL', what: `${action} — ${server}`, target: path || '' };
      }
      return { verb: 'TOOL', what: tool, target: path || '' };
    }
  }
}

/* Files whose change is a governance event in its own right, not just a write. */
const CANONICAL = [
  'state/NOW.md',
  'state/BOARD.md',
  'state/BLOCKERS.md',
  'state/DECISIONS-LOG.md',
  'state/events.jsonl',
];

/*
 * The board is a projection, not a participant. Work on the dashboard, the
 * recorder itself, or the log it writes is instrumentation — it is not
 * delivery, and showing it as an agent action makes the feed narrate its own
 * plumbing instead of the work Boss is watching for.
 */
const NOT_WORK = [
  'governance/dashboard/',
  '.claude/hooks/',
  'state/activity.jsonl',
  '.claude/settings.json',
  '.claude/launch.json',
];
function isInstrumentation(target) {
  const t = target || '';
  return NOT_WORK.some((p) => t.includes(p));
}

/* Context a role loads before it may act. Reading these is cold start. */
const COLD_START = [
  'AGENTS.md', 'CLAUDE.md',
  'state/NOW.md', 'state/BOARD.md', 'state/BLOCKERS.md', 'state/SCOPE.md',
  'state/STATUS-SCHEMA.md', 'state/DECISIONS-LOG.md',
  'agents/', 'checklists/', 'governance/', 'work/items/', 'docs/reference/',
];

/*
 * The three phases every role moves through, in order, plus communication.
 * Phase is derived from the artifact actually touched — never from a claim.
 *
 *   COLD_START   loading the context it is required to load
 *   WORK         the actual work: code, documents, research, tools
 *   RECONCILE    writing the agentic files back at the end of the work
 *   COMMS        dispatch out, or a status-change request in
 */
function classify(verb, tool, target, input) {
  const t = target || '';
  const i = input || {};

  // Running the role's own daily / deep review checklist.
  if (/(^|\/)checklists\//.test(t) || /state\/checklist-runs\//.test(t)) {
    return { phase: 'CHECKLIST', comm: null };
  }

  // Taking note: distilled lessons, or evidence captured for a gate.
  if ((verb === 'WRITE' || verb === 'EDIT') &&
      /(knowledge\/LEARNINGS|knowledge\/GRAVEYARD|^evidence\/|\/evidence\/)/.test(t)) {
    return { phase: 'NOTE', comm: null };
  }

  // Writing an ADR is the solution proposal, not ordinary work.
  if ((verb === 'WRITE' || verb === 'EDIT') && /(^|\/)decisions\//.test(t)) {
    return { phase: 'PROPOSE', comm: null };
  }

  // Communication: Sushma dispatching out.
  if (tool === 'Agent') {
    return {
      phase: 'COMMS',
      comm: { kind: 'DISPATCH', from: 'sushma', to: (i.subagent_type || 'agent').toLowerCase() },
    };
  }

  // Communication: a role filing its three-line signal to Sushma.
  if (/state\/signals\//.test(t) && (verb === 'WRITE' || verb === 'EDIT')) {
    return { phase: 'COMMS', comm: { kind: 'SIGNAL', from: null, to: 'sushma' } };
  }

  // Reconcile: writing canonical delivery state.
  if ((verb === 'WRITE' || verb === 'EDIT') &&
      CANONICAL.some((c) => t.endsWith(c))) {
    return { phase: 'RECONCILE', comm: null };
  }

  // Cold start: reading required context.
  if (verb === 'READ' && COLD_START.some((c) => t.includes(c))) {
    return { phase: 'COLD_START', comm: null };
  }

  return { phase: 'WORK', comm: null };
}

let raw = '';
try {
  raw = readFileSync(0, 'utf8');
} catch {
  try {
    raw = await new Promise((resolve) => {
      let b = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (c) => (b += c));
      process.stdin.on('end', () => resolve(b));
      setTimeout(() => resolve(b), 800);
    });
  } catch {
    raw = '';
  }
}

try {
  const payload = raw ? JSON.parse(raw) : {};
  const tool = payload.tool_name || 'unknown';
  const { verb, what, target } = describe(tool, payload.tool_input);
  const role = roleOf(payload);

  const touched = typeof target === 'string' ? target : '';
  const canonical = CANONICAL.some((c) => touched.endsWith(c));

  // Instrumentation never enters the log at all.
  if (isInstrumentation(touched)) process.exit(0);

  const { phase, comm } = classify(verb, tool, touched, payload.tool_input);
  if (comm && comm.from === null) comm.from = role;

  const line = {
    ts: new Date().toISOString(),
    role,
    verb,
    tool,
    what,
    target: touched.slice(0, 240),
    canonical,
    phase,
    comm,
    session: (payload.session_id || '').slice(0, 8),
  };

  mkdirSync(dirname(LOG), { recursive: true });
  appendFileSync(LOG, JSON.stringify(line) + '\n');
} catch {
  /* A recorder that fails must fail silently. */
}

process.exit(0);

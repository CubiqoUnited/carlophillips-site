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

  const line = {
    ts: new Date().toISOString(),
    role,
    verb,
    tool,
    what,
    target: touched.slice(0, 240),
    canonical,
    session: (payload.session_id || '').slice(0, 8),
  };

  mkdirSync(dirname(LOG), { recursive: true });
  appendFileSync(LOG, JSON.stringify(line) + '\n');
} catch {
  /* A recorder that fails must fail silently. */
}

process.exit(0);

#!/usr/bin/env node
/*
 * V3.5interim role boundaries — ENFORCED, not documented.
 *
 * A PreToolUse hook. It denies the tool call outright when a role reaches
 * outside its lane. This exists because the permissions matrix in the operating
 * model was true on paper and false in practice: every role held Read, Edit,
 * Write and Bash, so nothing but good intentions stopped Sushma editing
 * apps/web or Pushpa writing an ADR.
 *
 * Four boundaries, from Boss, 2026-09-19:
 *   1. Sushma and Pushpa may not develop.
 *   2. Pushpa and Aarti may not deploy.
 *   3. Aarti and Sushma may not write user stories.
 *   4. Pushpa and Sushma may not do technical solutioning.
 *
 * Boss is never restricted. A denial is recorded so it appears on the board —
 * a boundary nobody can see being enforced is just a policy again.
 */
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, relative, isAbsolute } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const DENIALS = `${ROOT}/state/activity.jsonl`;

const MUTATES = new Set(['Write', 'Edit', 'NotebookEdit']);

/* ---- the four boundaries, as lane definitions ---- */
const LANES = {
  /* 1. DEVELOPMENT — application code. Aarti only. */
  development: {
    owner: 'aarti',
    denied: ['sushma', 'pushpa'],
    paths: [/^apps\//, /^packages\//, /^tests\//, /\.(ts|tsx|js|jsx|mjs|cjs|css|scss)$/],
    // Governance tooling is not the product; it is not development.
    exempt: [/^governance\//, /^\.claude\//, /^scripts\//],
    why: 'application code is Aarti\'s standing implementation role',
    instead: 'raise it on the work item and request READY_FOR_SOLUTION from Sushma',
  },

  /* 2. DEPLOYMENT — release surfaces and commands. Sushma only. */
  deployment: {
    owner: 'sushma',
    denied: ['pushpa', 'aarti'],
    paths: [/^\.github\/workflows\//, /^vercel\.json$/, /^work\/releases\//],
    commands: [
      /\bvercel\s+(deploy|promote|alias|env\s+(add|rm))/,
      /\bgh\s+workflow\s+run/,
      /\bgh\s+release\s+create/,
      /\bgit\s+push\b/,
      /\bnpm\s+publish\b/,
    ],
    why: 'release execution is reserved to Sushma from READY_FOR_RELEASE',
    instead: 'signal READY_FOR_RELEASE to Sushma with the evidence packet',
  },

  /* 3. USER STORIES — product definition. Pushpa only. */
  stories: {
    owner: 'pushpa',
    denied: ['sushma', 'aarti'],
    paths: [/^work\/items\//, /^work\/modules\//],
    why: 'stories and acceptance criteria are the PO\'s act; inventing product intent is prohibited',
    instead: 'request READY_FOR_PO from Sushma so Pushpa writes it',
  },

  /* 4. TECHNICAL SOLUTIONING — ADRs and contracts. Aarti only. */
  solutioning: {
    owner: 'aarti',
    denied: ['sushma', 'pushpa'],
    paths: [/^decisions\//, /^contracts\//, /^ARCHITECTURE\.md$/],
    // Both gate-holders must still be able to record their approval.
    approvalSections: true,
    why: 'the technical solution is Aarti\'s; the other roles hold gates on it, not the pen',
    instead: 'record your gate verdict in the ADR\'s own approval section, or request changes',
  },
};

function roleOf(payload) {
  const raw = (payload.subagent_type || payload.agent_type || payload.agent || '').toLowerCase();
  for (const known of ['sushma', 'pushpa', 'aarti']) if (raw.includes(known)) return known;
  return 'sushma'; // the main session is Sushma per this project's CLAUDE.md
}

function relPath(p) {
  if (!p) return '';
  try {
    const r = isAbsolute(p) ? relative(ROOT, p) : p;
    return r.startsWith('..') ? '' : r;
  } catch {
    return '';
  }
}

function record(role, lane, target, reason) {
  try {
    mkdirSync(dirname(DENIALS), { recursive: true });
    appendFileSync(DENIALS, JSON.stringify({
      ts: new Date().toISOString(),
      role,
      verb: 'DENIED',
      tool: 'boundary',
      what: `boundary: ${role} may not ${lane} — ${target}`,
      target: String(target).slice(0, 200),
      canonical: false,
      phase: 'BOUNDARY',
      comm: null,
      denied: { lane, reason },
    }) + '\n');
  } catch { /* a recorder that fails must never block a decision */ }
}

function deny(role, lane, target) {
  const l = LANES[lane];
  record(role, lane, target, l.why);
  const out = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `BOUNDARY: ${role} may not perform ${lane}. Owner: ${l.owner}. ` +
        `Reason: ${l.why}. Do this instead: ${l.instead}. ` +
        `(governance/AUTHORITY_AND_GATES.md, enforced by .claude/hooks/boundaries.mjs)`,
    },
  };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

let raw = '';
try {
  raw = readFileSync(0, 'utf8');
} catch { /* no stdin: allow */ }

try {
  const payload = raw ? JSON.parse(raw) : {};
  const tool = payload.tool_name || '';
  const input = payload.tool_input || {};
  const role = roleOf(payload);

  const path = relPath(input.file_path || input.path || input.notebook_path);
  const command = tool === 'Bash' ? String(input.command || '') : '';

  for (const [lane, l] of Object.entries(LANES)) {
    if (!l.denied.includes(role)) continue;

    // Path-based boundaries apply to mutations only. Reading is always allowed:
    // a role must be able to see what it may not change.
    if (path && MUTATES.has(tool)) {
      const exempt = (l.exempt || []).some((re) => re.test(path));
      if (!exempt && (l.paths || []).some((re) => re.test(path))) {
        // An ADR's approval sections belong to the gate-holders, not to Aarti.
        if (lane === 'solutioning' && tool === 'Edit') {
          const text = String(input.new_string || '');
          if (/product[- ]fit|readiness|approval|APPROVED|CHANGES_REQUESTED/i.test(text)) continue;
        }
        deny(role, lane, path);
      }
    }

    // Command-based boundaries apply to Bash regardless of path.
    if (command && (l.commands || []).some((re) => re.test(command))) {
      deny(role, lane, command.slice(0, 120));
    }
  }
} catch { /* never block on a broken boundary check; fail open and stay silent */ }

process.exit(0);

#!/usr/bin/env node
/*
 * V3.5interim role boundaries — ENFORCED.
 *
 * A PreToolUse hook that denies the tool call outright when a role reaches
 * outside its lane.
 *
 * Why this exists rather than settings.json: agent frontmatter has no
 * `permissions` field, `tools:` and `disallowedTools:` are tool-wide rather
 * than path-aware, and `permissions.deny` is session-wide — so any rule strong
 * enough to stop Sushma editing apps/** also stops Aarti, whose job it is.
 * Per-role, per-path enforcement has exactly one supported mechanism, and this
 * is it.
 *
 * Four boundaries, from Boss, 2026-09-19:
 *   1. Sushma and Pushpa may not develop.
 *   2. Pushpa and Aarti may not deploy.
 *   3. Aarti and Sushma may not write user stories.
 *   4. Pushpa and Sushma may not do technical solutioning.
 *
 * Boss is never restricted.
 */
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, relative, isAbsolute } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LOG = `${ROOT}/state/activity.jsonl`;

const MUTATES = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

const LANES = {
  /* 1. DEVELOPMENT — application code. Aarti only. */
  development: {
    owner: 'aarti',
    denied: ['sushma', 'pushpa'],
    paths: [/^apps\//, /^packages\//, /^tests\//, /\.(ts|tsx|jsx|css|scss)$/],
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
      /\bgh\s+pr\s+merge/,
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
    why: 'the technical solution is Aarti\'s; the other roles hold gates on it, not the pen',
    instead: 'record your gate verdict in the ADR\'s own approval section, or request changes',
  },

  /* 5. JIRA — the delivery record. Sushma only.
   *
   * Boss, 2026-09-19: only Sushma drafts epics and features, and on approval
   * the stories, tasks, subtasks and comment-section communication too.
   * Pushpa and Aarti raise a three-line signal; Sushma carries it into Jira.
   *
   * Matched on TOOL NAME, not path — Jira lives behind MCP, which is why the
   * first four lanes never reached it. */
  jira: {
    owner: 'sushma',
    denied: ['pushpa', 'aarti'],
    tools: [
      /^mcp__.*__(create|edit|transition|delete)Jira/i,
      /^mcp__.*__addOrEditJiraIssueComment$/i,
      /^mcp__.*__(create|update)ConfluenceContent$/i,
      /^mcp__.*__execute(Write|Destructive)$/i,
    ],
    why: 'the Jira record is Sushma\'s; roles signal her rather than writing it themselves',
    instead: 'raise your three-line signal (ITEM / RESULT / EVIDENCE) and Sushma carries it into Jira',
  },
};

/*
 * Content gates on a Jira write.
 *
 * These bind SUSHMA, and they exist because she broke both on 2026-09-19:
 * she wrote "Done when" acceptance criteria into eleven issues, and prescribed
 * the implementation ("scrub at the adapter boundary", "must notFound()") in
 * four more. Owning the record is not owning its content. The what is Pushpa's
 * and the how is Aarti's, in Jira exactly as on disk.
 *
 * Pushpa and Aarti never reach these — the jira lane stops them first.
 */
const JIRA_WRITE = /^mcp__.*__(createJiraIssue|editJiraIssue|addOrEditJiraIssueComment)$/i;

const JIRA_CONTENT_GATES = [
  {
    lane: 'stories',
    /* Acceptance criteria, however it is dressed. */
    markers: [
      /\bacceptance criteria\b/i,
      /^\s*#{0,4}\s*\**\s*done when\b/im,
      /^\s*#{0,4}\s*\**\s*definition of done\b/im,
      /\bAC-[A-Z]*-?\d+\b/,
      /\bgiven\b[\s\S]{0,120}\bwhen\b[\s\S]{0,120}\bthen\b/i,
    ],
  },
  {
    lane: 'solutioning',
    /* A fenced implementation block is a design decision, not a finding. */
    markers: [/```\s*(ts|tsx|js|jsx|javascript|typescript)\b/i],
  },
];

function roleOf(payload) {
  const raw = (payload.subagent_type || payload.agent_type || payload.agent || '').toLowerCase();
  for (const known of ['sushma', 'pushpa', 'aarti']) if (raw.includes(known)) return known;
  return 'sushma'; // the main session is Sushma, per this project's CLAUDE.md
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

function record(role, lane, target, why) {
  try {
    mkdirSync(dirname(LOG), { recursive: true });
    appendFileSync(LOG, JSON.stringify({
      ts: new Date().toISOString(),
      role,
      verb: 'DENIED',
      tool: 'boundary',
      what: `boundary: ${role} may not ${lane} — ${target}`,
      target: String(target).slice(0, 200),
      canonical: false,
      phase: 'BOUNDARY',
      comm: null,
      denied: { lane, why },
    }) + '\n');
  } catch { /* a recorder that fails must never block a decision */ }
}

function deny(role, lane, target) {
  const l = LANES[lane];
  record(role, lane, target, l.why);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `BOUNDARY: ${role} may not perform ${lane}. Owner: ${l.owner}. ` +
        `Reason: ${l.why}. Do this instead: ${l.instead}. ` +
        `(governance/AUTHORITY_AND_GATES.md, enforced by .claude/hooks/boundaries.mjs)`,
    },
  }));
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
  /*
   * Match only what the shell will EXECUTE, never what it merely carries.
   *
   * A real false positive proved this necessary: Aarti was denied
   * `mkdir -p .../decisions/...` — his own lane — because the heredoc body he
   * was writing quoted `git push` and `gh workflow run` inside an ADR. A role
   * must be able to DOCUMENT a command it may not RUN, or the boundary blocks
   * exactly the design work it is meant to protect.
   */
  const rawCommand = tool === 'Bash' ? String(input.command || '') : '';
  const command = rawCommand
    // drop heredoc bodies: <<'EOF' ... EOF
    .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?^\s*\1\s*$/gm, ' <<HEREDOC> ')
    // drop quoted strings, which carry prose rather than invocations
    .replace(/'[^']{20,}'/g, " '<STR>' ")
    .replace(/"[^"]{20,}"/g, ' "<STR>" ');

  for (const [lane, l] of Object.entries(LANES)) {
    if (!l.denied.includes(role)) continue;

    /* Path boundaries apply to mutations only. Reading is never denied — a role
     * must be able to see what it may not change. */
    if (path && MUTATES.has(tool)) {
      const exempt = (l.exempt || []).some((re) => re.test(path));
      if (!exempt && (l.paths || []).some((re) => re.test(path))) {
        /* An ADR's approval sections belong to the gate-holders. Pushpa and
         * Sushma hold gates on the solution and must be able to record a
         * verdict without holding the pen for the solution itself. */
        if (lane === 'solutioning' && tool !== 'Write') {
          const text = String(input.new_string || input.content || '');
          if (/product[- ]fit|readiness|approval|APPROVED|CHANGES_REQUESTED/i.test(text)) continue;
        }
        deny(role, lane, path);
      }
    }

    /* Command boundaries apply to Bash regardless of path. A shell is the
     * easiest way around a path rule, so it is checked separately. */
    if (command && (l.commands || []).some((re) => re.test(command))) {
      deny(role, lane, command.slice(0, 120));
    }

    /* Tool-name boundaries. Jira and Confluence live behind MCP and carry no
     * path, so neither the path nor the command check can see them. */
    if (tool && (l.tools || []).some((re) => re.test(tool))) {
      deny(role, lane, tool);
    }
  }

  /*
   * Content gates on a Jira write. Reached only by whoever may write Jira at
   * all — today, Sushma. Owning the record is not owning its content.
   */
  if (JIRA_WRITE.test(tool)) {
    const body = [input.description, input.commentBody, input.summary]
      .filter((t) => typeof t === 'string')
      .join('\n');

    if (body) {
      for (const gate of JIRA_CONTENT_GATES) {
        const l = LANES[gate.lane];
        if (!l || !l.denied.includes(role)) continue;
        if (gate.markers.some((re) => re.test(body))) {
          deny(role, gate.lane, `${tool} (body)`);
        }
      }
    }
  }
} catch { /* never block delivery on a broken check: fail open, stay silent */ }

process.exit(0);

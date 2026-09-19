#!/usr/bin/env node
/*
 * V3.5interim Boss control plane — read-only projection.
 *
 * Per the spec (Part 4): "Start with a read-only dashboard over repository
 * files, Git state, and existing deployment and monitoring APIs. Add approval
 * write-backs only after the state model, authorization, audit logging, and
 * conflict handling are proven."
 *
 * This server writes nothing. It reads the repository and reports what it can
 * actually see, and says plainly when it cannot see something — the spec
 * requires distinguishing not-configured, unavailable, stale, failing and
 * healthy rather than collapsing them into one green light.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, watch, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const PORT = Number(process.env.PORT || 4317);

const STALE_MS = 15 * 60 * 1000; // evidence older than this is flagged, not hidden

function read(rel, max = 400_000) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, 'utf8').slice(-max);
  } catch {
    return null;
  }
}

function mtime(rel) {
  const p = join(ROOT, rel);
  try {
    return existsSync(p) ? statSync(p).mtimeMs : null;
  } catch {
    return null;
  }
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 4000 }).trim();
  } catch {
    return null;
  }
}

/* Past instrumentation noise is filtered on read too, so the history the board
 * shows is delivery work only — not the board's own construction. */
const NOT_WORK = ['governance/dashboard/', '.claude/hooks/', 'state/activity.jsonl',
                  '.claude/settings.json', '.claude/launch.json'];
const isInstrumentation = (t) => NOT_WORK.some((p) => (t || '').includes(p));

/* ---- activity: the live feed, written by the PostToolUse hook ---- */
function activity(limit = 220) {
  const raw = read('state/activity.jsonl', 900_000);
  if (raw === null) return { available: false, rows: [] };
  const rows = raw
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((r) => !isInstrumentation(r.target))
    .reverse();
  return { available: true, rows };
}

/* ---- events: the governance log, written deliberately ---- */
function events(limit = 40) {
  const raw = read('state/events.jsonl');
  if (raw === null) return { available: false, rows: [], lastTs: null };
  const rows = raw
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .reverse();
  return { available: true, rows, lastTs: mtime('state/events.jsonl') };
}

/* Per-role status derived from real activity, never from self-report. */
const ROLES = ['sushma', 'pushpa', 'aarti'];
function roles(act) {
  const now = Date.now();
  return ROLES.map((role) => {
    const mine = act.rows.filter((r) => r.role === role);
    const last = mine[0] || null;
    const age = last ? now - Date.parse(last.ts) : null;
    let status = 'NOT_ASSIGNED';
    if (last) {
      if (age < 45_000) status = 'ACTIVE';
      else if (age < 10 * 60_000) status = 'IDLE';
      else status = 'QUIET';
    }
    /* Which of the three phases the role is in, and how much of each it has
     * done in this window. Derived from artifacts touched, never claimed. */
    const phaseCounts = { COLD_START: 0, WORK: 0, RECONCILE: 0, COMMS: 0 };
    for (const r of mine) phaseCounts[r.phase || 'WORK'] = (phaseCounts[r.phase || 'WORK'] || 0) + 1;

    return {
      role,
      status,
      phase: last ? last.phase || 'WORK' : null,
      phaseCounts,
      last: last ? { what: last.what, verb: last.verb, ts: last.ts, target: last.target } : null,
      ageMs: age,
      count: mine.length,
    };
  });
}

/* Board rows, parsed from the markdown table Sushma maintains. */
/* Every dispatch out and every status-change request in, newest first. */
function comms(act, limit = 30) {
  return act.rows
    .filter((r) => r.comm)
    .slice(0, limit)
    .map((r) => ({
      ts: r.ts,
      kind: r.comm.kind,
      from: r.comm.from,
      to: r.comm.to,
      what: r.what,
    }));
}

/* The artifacts currently in play — what to click to see what an agent saw. */
function files(act, limit = 18) {
  const seen = new Map();
  for (const r of act.rows) {
    const t = r.target;
    if (!t || !/\.(md|ts|tsx|js|jsx|json|yaml|yml|jsonl)$/.test(t)) continue;
    if (t.includes(' ') || t.startsWith('/')) continue;   // shell commands, absolute paths
    if (seen.has(t)) { seen.get(t).touches++; continue; }
    seen.set(t, { path: t, role: r.role, verb: r.verb, phase: r.phase, ts: r.ts, touches: 1 });
    if (seen.size >= limit) break;
  }
  return [...seen.values()];
}

function board() {
  const raw = read('state/BOARD.md');
  if (raw === null) return { available: false, rows: [] };
  const rows = [];
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('| CP-')) continue;
    const c = t.split('|').map((s) => s.trim());
    if (c.length < 8) continue;
    rows.push({ id: c[1], module: c[2], priority: c[3], state: c[4], assigned: c[5], blocker: c[6] });
  }
  return { available: true, rows };
}

/*
 * Checklist runs. Parsed from the markdown each role writes, because the run is
 * meant to be readable by a person a month from now, not only by this server.
 *
 * Per CHECKLIST_RUN_PROTOCOL: EVIDENCE is mandatory on every line including
 * PASS. An unevidenced PASS is counted as UNKNOWN here, deliberately — it is
 * indistinguishable from a guess, and the whole point of the run is to stop
 * treating a confident label as a checked fact.
 */
const VERDICTS = ['PASS', 'FAIL', 'UNKNOWN', 'BLOCKED', 'N-A'];
const LINE = /^-\s*\[(PASS|FAIL|UNKNOWN|BLOCKED|N-A|N\/A)\]\s*([A-Za-z]+-?\d*)?\s*(?:[\u2014-]\s*)?(.*)$/i;

function parseRun(rel) {
  const raw = read(rel, 200_000);
  if (raw === null) return null;
  const header = /^RUN:\s*(\w+)\s*\|\s*DATE:\s*([\d-]+)\s*\|\s*TIER:\s*(\w+)/im.exec(raw);
  const items = [];
  const counts = Object.fromEntries(VERDICTS.map((v) => [v, 0]));
  let unevidenced = 0;

  for (const line of raw.split('\n')) {
    const m = LINE.exec(line.trim());
    if (!m) continue;
    let verdict = m[1].toUpperCase().replace('N/A', 'N-A');
    const id = (m[2] || '').replace(/[\u2014-]+$/, '') || `C-${items.length + 1}`;
    const body = m[3] || '';
    const hasEvidence = /EVIDENCE:\s*\S/i.test(body);
    if (verdict === 'PASS' && !hasEvidence) { verdict = 'UNKNOWN'; unevidenced++; }
    counts[verdict] = (counts[verdict] || 0) + 1;
    items.push({ id, verdict, body: body.slice(0, 400), hasEvidence });
  }

  return {
    path: rel,
    role: header ? header[1].toLowerCase() : rel.split('/').pop().replace('.md', ''),
    date: header ? header[2] : null,
    tier: header ? header[3].toLowerCase() : 'daily',
    total: items.length,
    counts,
    unevidenced,
    // What Boss should look at first: anything that is not a clean pass.
    attention: items.filter((i) => i.verdict !== 'PASS' && i.verdict !== 'N-A').slice(0, 12),
    items,
    updated: mtime(rel),
  };
}

function checklists() {
  const base = join(ROOT, 'state/checklist-runs');
  if (!existsSync(base)) return { available: false, runs: [] };
  const runs = [];
  try {
    const days = readdirSync(base).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
    for (const day of days.slice(0, 3)) {
      for (const f of readdirSync(join(base, day))) {
        if (!f.endsWith('.md')) continue;
        const run = parseRun(`state/checklist-runs/${day}/${f}`);
        if (run && run.total) runs.push(run);
      }
    }
  } catch { /* directory raced with a write; next tick picks it up */ }
  runs.sort((a, b) => (b.updated || 0) - (a.updated || 0));
  return { available: true, runs };
}

function decisions() {
  const raw = read('state/DECISIONS-LOG.md');
  if (raw === null) return { available: false, open: null };
  const open = (raw.match(/^##+ .*D-\d+/gm) || []).length;
  return { available: true, open, updated: mtime('state/DECISIONS-LOG.md') };
}

function repo() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const head = git(['rev-parse', '--short', 'HEAD']);
  const dirty = git(['status', '--porcelain']);
  const worktrees = (git(['worktree', 'list']) || '').split('\n').filter(Boolean);
  const remotes = (git(['remote']) || '').split('\n').filter(Boolean);
  const ahead = git(['rev-list', '--count', 'github/staging..HEAD']);
  return {
    branch,
    head,
    dirtyCount: dirty ? dirty.split('\n').filter(Boolean).length : 0,
    worktrees: worktrees.length,
    remotes,
    unpushed: ahead === null ? null : Number(ahead),
  };
}

function snapshot() {
  const act = activity();
  const ev = events();
  return {
    ts: new Date().toISOString(),
    activity: act,
    events: {
      ...ev,
      // The spec forbids collapsing "stale" into "healthy". Say which it is.
      freshness:
        !ev.available ? 'NOT_CONFIGURED'
        : ev.lastTs && Date.now() - ev.lastTs < STALE_MS ? 'FRESH'
        : 'STALE',
    },
    roles: roles(act),
    comms: comms(act),
    files: files(act),
    checklists: checklists(),
    board: board(),
    decisions: decisions(),
    repo: repo(),
  };
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };

/* Push rather than poll. Clients used to repaint every two seconds whether or
 * not anything had changed, which is what made the board flicker. Now the
 * server watches the log and pushes only when there is something new. */
const clients = new Set();
let lastPayload = '';

function broadcast(force = false) {
  const payload = JSON.stringify(snapshot());
  if (!force && payload === lastPayload) return;   // nothing changed: stay silent
  lastPayload = payload;
  for (const res of clients) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      clients.delete(res);
    }
  }
}

/* Watch the activity log and canonical state. Coalesce bursts so a flurry of
 * tool calls produces one update, not twenty. */
let pending = null;
function nudge() {
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    broadcast();
  }, 140);
}
for (const target of ['state', 'work', 'decisions', 'checklists']) {
  const dir = join(ROOT, target);
  if (!existsSync(dir)) continue;
  try {
    watch(dir, { recursive: true }, nudge);
  } catch {
    /* recursive watch is not available everywhere; the interval below covers it */
  }
}
setInterval(() => broadcast(), 1500);          // safety net, still silent when unchanged
setInterval(() => {
  for (const res of clients) { try { res.write(': ping\n\n'); } catch { clients.delete(res); } }
}, 25_000);

/* Read one repository file for the drawer. Read-only, inside the repo only. */
function safeRead(rel) {
  if (!rel || rel.includes('..') || rel.startsWith('/')) return null;
  const abs = join(ROOT, rel);
  if (!abs.startsWith(ROOT) || !existsSync(abs)) return null;
  try {
    const st = statSync(abs);
    if (!st.isFile() || st.size > 400_000) return null;
    return { path: rel, size: st.size, mtime: st.mtimeMs, text: readFileSync(abs, 'utf8') };
  } catch {
    return null;
  }
}

createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];

  if (url === '/api/stream') {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    });
    res.write(`data: ${JSON.stringify(snapshot())}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (url === '/api/file') {
    const rel = decodeURIComponent((req.url.split('?')[1] || '').replace(/^path=/, ''));
    const file = safeRead(rel);
    res.writeHead(file ? 200 : 404, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(file || { error: 'not readable', path: rel }));
    return;
  }

  if (url === '/api/state') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(snapshot()));
    return;
  }

  const file = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const path = join(HERE, file);
  if (!path.startsWith(HERE) || !existsSync(path)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  const ext = path.slice(path.lastIndexOf('.'));
  res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(readFileSync(path));
}).listen(PORT, () => {
  console.log(`V3.5interim control plane — read-only — http://localhost:${PORT}`);
});

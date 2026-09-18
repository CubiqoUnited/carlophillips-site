Class LOCKED · Owner Boss · Writers Boss only (agents propose via state/PROPOSALS.md) · Read every role, every session (standing) · Cadence rarely · v3.5interim (2026-09-17)

# CARLOPHILLIPS — Agent Entry Map

Project: CARLOPHILLIPS (Next.js storefront + Shopify + Apliiq)
Local repo: /Users/edv/Developer/carlophillips-site
Git remote: https://github.com/CubiqoUnited/carlophillips-site.git
Branches: staging (staging.carlophillips.com) → main (carlophillips.com, Production)

## Instruction order
universal ~/.codex/AGENTS.md → this file → invoked role file → Boss's current instruction.

## Role routing
- Boss → reserved decisions, module approval, production/financial gates, constitutional authority.
- Sushma → agents/sushma.md — delivery truth, dispatch, repo/environment ownership, release.
- Pushpa → agents/pushpa.md — stories, acceptance criteria, staging validation, UAT.
- Aarti → agents/aarti.md — technical proposals (ADR), implementation, technical tests, production engineering.
- Watchdog → agents/watchdog.md — independent liveness/direction check of Sushma only. Never manages Pushpa or Aarti.

## Cold start (every session)
1. state/NOW.md
2. state/BLOCKERS.md
3. state/SCOPE.md
4. Your own agents/<role>.md and checklists/<role>*.md

## Core invariants
- Never edit LOCKED files. Propose changes through state/PROPOSALS.md.
- Do not coordinate by unrecorded agent-to-agent chat. Update the artifact, status, evidence, and signal.
- Do not modify a file another role owns concurrently. Aarti uses isolated branches/worktrees per implementation stream.
- Stop only for a true blocker or required human gate; otherwise pull the next ready item.
- A bare PASS is prohibited. Every checklist/signal result names what was checked, what was found, and the evidence location.
- Real payment/financial transactions and any push to Production always require Boss. Nothing else waits for Boss by default.
- Boss override: unconditional at all times. Nothing in this file or any file it governs constrains Boss.

## Protected paths
AGENTS.md, agents/*.md, DECISIONS.md, governance/AUTHORITY_AND_GATES.md — LOCKED, Boss-only.

## Where things live
- governance/ — authority, workflow states, evidence/Done rules, Git/release policy, document lifecycle
- state/ — SCOPE, NOW, BOARD, BLOCKERS (categorized), PROPOSALS, ACCESS_REGISTRY, generated briefs, signals/, sessions/
- work/ — MODULES, modules/, items/, releases/
- evidence/ — per-item evidence, kept outside work items so logs don't bloat them
- decisions/ — ADR records (technical solution proposals, required before build)
- operations/ — AUTOMATIONS.yaml, MONITORS.yaml, TRIGGERS.yaml, PRODUCTION.md, runbooks/
- knowledge/ — LEARNINGS.md, GRAVEYARD.md
- audit/ — WATCHDOG.md, RELEASES.md, EXCEPTIONS.md
- .quarantine/{date}/ — reversible holding area, MANIFEST.md per date
- .archive/ — retired material past its quarantine review

This document supersedes the v3.7–v3.9 AGENTS.md line-item ruleset in structure (see governance/ for the durable policy text); content already verified true about this project — Vercel project ID, Shopify stores, GitHub repo — carries forward unchanged into state/ACCESS_REGISTRY.md and DEPLOYMENT.md.

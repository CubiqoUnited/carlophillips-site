Class CONTROLLED · Owner Sushma · Writers Sushma with Aarti proposals; Boss approves exceptions · v3.5interim (2026-09-17)

# Git, Release, and Concurrency Policy

## Canonical repository
- Local: /Users/edv/Developer/carlophillips-site
- Remote: https://github.com/CubiqoUnited/carlophillips-site.git
- staging → staging.carlophillips.com (canonical Staging)
- main → carlophillips.com (Production)
- Only main and staging persist on origin. Temporary branches removed after verified merge.
- Merges to staging go through a PR — GitHub branch protection enforces required status checks (Verify, Playwright checkout gate).

## Concurrency rules
- Sushma may prepare multiple modules for Boss review while Pushpa defines one approved module and Aarti builds another.
- One canonical owner writes a work artifact at a time. Reviewers use correction/approval sections, not overwrites.
- Aarti uses a separate branch or worktree per implementation stream. Shared migrations/contracts require an explicit serialization plan.
- Production releases are serialized through Sushma's release queue.
- Multi-writer EVOLVING ledgers (state/BLOCKERS.md, state/PROPOSALS.md, knowledge/LEARNINGS.md, knowledge/GRAVEYARD.md) use atomic append via scripts/check-agent-docs — never in-place edits to another writer's entry.

## Release policy
Sushma releases only from READY_FOR_RELEASE. The release record (work/releases/{id}.md) links candidate, commits, approvals, tests, known risks, deployment, and rollback plan. Production requires a known rollback path and post-deployment verification, no exceptions.

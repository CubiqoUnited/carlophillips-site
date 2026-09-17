Class EVOLVING · Owner Boss · Writers Boss records; roles propose · Read all roles · v3.5interim (2026-09-17)

# Approved Exceptions (append-only)

### EXC-001 — Direct migration without PROPOSALS.md routing
- Date: 2026-09-17
- What: this entire V3.5interim structural migration was applied directly by Aarti/Sushma on Boss's explicit direct instruction ("deploy the changes"), invoking the Boss-override clause in governance/AUTHORITY_AND_GATES.md rather than routing through state/PROPOSALS.md first.
- Why this is recorded as an exception rather than silently normal: LOCKED and CONTROLLED files were touched directly. Boss override permits this, but it should be visible in the audit trail, not invisible.
- Scope: this migration only. Future changes to LOCKED/CONTROLLED files still default to state/PROPOSALS.md routing unless Boss again explicitly invokes override.

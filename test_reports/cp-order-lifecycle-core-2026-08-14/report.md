# Sale-to-post-sale lifecycle core QA

Date: 2026-08-14
Branch: `codex/cp-e2e-admin-control-plane`
Source state: working candidate based on evidence-binding commit `e44cbee`; exact clean commit binding follows
Environment: local pure contracts/reducer only; no provider ingress, customer data, payment, order, refund, connector, or Production mutation

## Outcome

The local lifecycle foundation passes. It does **not** prove a controlled order or make any end-to-end stage ready.

Implemented locally:

- `cp.order-lifecycle-event.v1` with 21 provider-neutral event types;
- opaque aggregate identity and exact release/variant/environment binding;
- whitelisted source, authority, details, money, reason, tracking-hash, and support-case-hash fields;
- PII/raw-reference/unknown-field rejection;
- deterministic SHA-256 event hashing and previous-event chain validation;
- exact idempotency replay suppression plus conflicting replay/event-ID rejection;
- monotonic sequence and occurred/recorded timestamp enforcement;
- Released/Production/checkout/controlled-order authority gates for payment/order;
- separate refund authority gate;
- strict payment, order, POD, production, shipment, support, return/refund, review, and reconciliation transitions;
- sanitized non-authoritative Admin projection with truthful no-order empty state.

Explicitly absent:

- provider-specific webhook signature, shop/topic, timestamp/replay, or payload verification;
- network listener, durable inbox/outbox, queue, retry/dead-letter store, or database;
- customer/order PII, raw provider identifiers, credentials, or secrets;
- connector invocation or any payment, order, refund, notification, publication, or Production side effect.

## Deterministic verification

- Yarn Classic: 1.22.22
- Frozen install: retained from the clean evidence-reconciliation candidate
- Lint: zero warnings
- Tests: 41 files / 400 tests passed
- Lifecycle tests: 16 cases covering the happy path and fail-closed exception matrix
- Production dependency audit: 0 vulnerabilities across 55 audited packages
- Next.js optimized build: passed
- `git diff --check`: passed

The exception matrix covers exact replay, conflicting replay, hash tamper, stale sequence, broken chain, reused event ID, out-of-order time, cross-release/variant/environment, missing sale/refund authority, PII/raw/unknown fields, malformed money, payment failure, POD rejection, shipment delay, open support, return/partial/full refund, review ineligibility, reconciliation variance, and attempts to create upstream authority through lifecycle events.

## Headless browser and visual verification

Final working-candidate result: 538/538 findings passed, 0 failures, 58 screenshots.

The same protected admin/public matrix covers 14 reviewer sections plus Product Owner Theme, denied states, same/cross-origin API behavior, Draft checkout denial, Axe, keyboard navigation, mobile navigation reachability, overflow, raw-reference/provider leakage, console/network health, and decoded public media.

The responsive Overview contact sheet, all-section desktop contact sheet, and mobile Capabilities screen were inspected offscreen. The added local lifecycle capability remains clearly labelled local-only; long capability rows wrap at mobile without viewport overflow.

Eight public home/shop/PDP/bag screenshots at desktop/mobile match the exact prior evidence-reconciliation candidate with zero changed pixels.

Machine-readable evidence:

- `verification.json`
- `public-zero-delta-comparison.json`
- `comparisons/admin-overview-responsive.png`
- `comparisons/admin-sections-desktop-contact-sheet.png`
- `screenshots/`

## Remaining gate

The Product Release Record remains Draft and no controlled order exists. Provider ingress and persistence must be authorized, implemented, and verified separately; then one exact approved order must traverse the full lifecycle before the admin may show a real populated record or readiness may advance.

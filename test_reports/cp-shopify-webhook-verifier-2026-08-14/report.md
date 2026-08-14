# Shopify webhook verifier QA

Date: 2026-08-14
Branch: `codex/cp-e2e-admin-control-plane`
Source state: working tree based on `f2716dfefb32740d76524c35d51a4ba099efcba4`; exact clean implementation commit binding follows
Environment: local pure verifier only; no webhook registration/listener, provider secret, customer payload retention, lifecycle mutation, connector, or Production action

## Outcome

The isolated verification boundary passes its working-tree QA. It does **not** prove provider ingress, a controlled order, or any end-to-end stage ready.

Implemented locally:

- `cp.provider-webhook-verification.v1` fingerprint-only result contract;
- HMAC-SHA256 over exact raw `string` or `Uint8Array` bytes with timing-safe comparison;
- allowlisted Shopify shop and topic checks;
- delivery identity validation plus an injected replay claim keyed only by its SHA-256 fingerprint;
- provider-triggered timestamp replay/future bounds;
- bounded JSON payload size;
- explicit observation-only authority with lifecycle, release, checkout, refund, and publication authority false.

The accepted result returns no raw payload, shop domain, delivery identity, customer data, order ID, provider reference, selected mutation target, or secret. Verification cannot create a lifecycle event or invoke an external side effect.

Explicitly absent:

- webhook subscription or HTTP listener;
- approved provider secret custody, storage, or rotation;
- durable replay store, inbox/outbox, queue, retries, or dead-letter handling;
- provider payload schema/sanitizer, PII handling, retention policy, or incident owner;
- connector invocation, customer record, lifecycle projection, payment/order/refund action, or Production mutation.

The `x-shopify-triggered-at` input and surrounding header contract were derived from the audited local architecture candidate already present in this repository. They are not a fresh live-provider observation or authorization.

## Deterministic verification

- Yarn Classic: 1.22.22
- Full `yarn verify`: passed
- Lint: zero warnings
- Tests: 42 files / 412 tests passed
- Webhook verifier tests: accepted envelope plus fail-closed HMAC/body/header/shop/topic/time/JSON/replay/config/store paths
- Production dependency audit: 0 vulnerabilities across 55 audited packages
- Next.js optimized build: passed
- `git diff --check`: passed

## Headless browser and visual verification

Working-tree result: 538/538 findings passed, 0 failures, 58 screenshots.

The protected admin/public matrix covers reviewer and Product Owner boundaries, same/cross-origin API behavior, Draft checkout denial, Axe, keyboard navigation, mobile navigation reachability, overflow, raw-reference/provider leakage, console/network health, and decoded public media.

Responsive Overview and all-section contact sheets plus the 390×844 Capabilities screen were inspected offscreen. The new verifier is clearly local-only, long rows wrap without viewport overflow, and no hierarchy or disclosure defect is visible.

Eight public home/shop/PDP/bag screenshots at desktop/mobile match the exact prior lifecycle candidate with zero changed pixels.

Machine-readable evidence:

- `verification.json`
- `public-zero-delta-comparison.json`
- `comparisons/admin-overview-responsive.png`
- `comparisons/admin-sections-desktop-contact-sheet.png`
- `screenshots/`

## Remaining gate

The Product Owner must select and approve exact shops/topics, secret custody and rotation, privacy/retention, durable infrastructure, sanitizer rules, retry/dead-letter behavior, and incident ownership before an ingress can be created. A verified raw envelope must then enter a durable quarantine boundary and explicit PII-safe sanitizer; it must never mutate the lifecycle reducer directly.

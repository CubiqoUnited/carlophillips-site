# Canonical release-proof binding and admin truth QA

Date: 2026-08-14

Candidate state: working tree based on `93442bec13b89d664db5b858d68b13b047addfa2`; exact clean commit validation follows in the evidence-binding commit.

## Outcome

The Product Release Record now fails closed on immutable release proof instead of accepting path-only evidence or status-only approvals:

- fulfillment carries separate reviewed provider-mapping and Shopify-variant fingerprints;
- a physical sample records exact provider-mapping binding, delivery/inspection evidence, approval evidence, and fit, colour, artwork-placement, and finish outcomes;
- build, staging, observation-review, rollback, and Production-capability evidence use SHA-256 descriptors bound to the release and candidate commit;
- the Media Registry manifest has an immutable fingerprint and a changed manifest is rejected;
- the complete candidate truth envelope has a derived release-evidence fingerprint;
- product, media, and fulfillment approvals bind that exact envelope and cannot be reused across candidates;
- release requires a fresh post-approval Production ACTIVE observation whose current variant identity and commerce facts match the reviewed release while its new full observation fingerprint remains separate audit evidence;
- the Hoodie remains Draft with no sample, approval, candidate, Production observation, or rollback verification invented.

The capability registry no longer repeats a superseded Shopify-login blocker for Apliiq, Modelize, Spin Studio, Flow, MyDesigns, or trend research. Each now exposes its observed provider-specific blocker and keeps external operation unavailable.

The protected Admin labels `Release: Draft` and `System: Not end-to-end ready` separately on every reviewer section. Releases adds a non-mutating nine-gate release-proof table. It contains no raw Shopify or provider reference.

## Source verification

- Frozen-policy verification command: `yarn verify`
- ESLint: zero warnings
- Vitest: 43 files / 433 tests passed
- Production dependency audit: zero vulnerabilities across 55 packages
- Next.js 15.5.21 optimized build: passed
- Focused affected suites: 4 files / 84 tests passed before the integrated run

Tests cover missing physical sample truth, incomplete inspection, mapping mismatch, missing descriptors, altered manifest, tampered evidence fingerprint, cross-release descriptor, cross-candidate approval, stale Production observation, changed Production commerce facts, invalid state transitions, and the current denied Hoodie Draft.

## Headless visual and interaction verification

Final working-tree run:

- Playwright Chromium, headless/background; no visible window or focus change
- 669/669 findings passed
- 61 screenshots retained
- 15 reviewer sections at 1440×1000, 1024×768, and 390×844
- Product Owner Theme at all three widths
- unauthenticated and reviewer/Theme denials
- public home, shop, Hoodie PDP, and bag at desktop and mobile
- zero critical/serious automated accessibility findings
- zero console errors, failed requests, horizontal overflow, broken media, raw provider references, or unexpected mutation controls
- the initial `127.0.0.1` API-origin probe was rejected because Next normalized the request host to `localhost`; the complete matrix was rerun consistently on `http://localhost:3100` and passed

Offscreen visual inspection covered the responsive Overview composite, Releases at desktop and mobile, and the full desktop section contact sheet. The two global statuses, all release-binding rows, mobile table cards, navigation affordance, and blocked-transition copy are readable without clipping or overlap.

## Public regression comparison

The eight public screenshots were compared to the exact prior local Commands-portal baseline:

- 8/8 same dimensions
- 8/8 identical SHA-256 hashes
- 0 changed channels
- 0 changed pixels

Machine-readable evidence:

- `verification.json`
- `public-screenshot-comparison.json`
- `comparisons/admin-overview-responsive.png`
- `comparisons/admin-sections-desktop-contact-sheet.png`
- `screenshots/`

## Authority boundary

This proves local contracts and truthful read-only presentation only. It creates no physical sample, Apliiq mapping, Shopify write, publication, payment, order, fulfillment, post-sale case, remote identity, durable event store, Vercel Preview, merge, or Production change.

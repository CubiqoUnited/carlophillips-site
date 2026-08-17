# Current Status

Updated: 2026-08-17
Branch: isolated commerce handoff `codex/cp-shopify-checkout-handoff`; exact pushed evidence head `9754a6c` plus the approved local Production-preflight correction; no merge to `main` or Production deployment
Canonical remote: `https://github.com/CubiqoUnited/carlophillips-site.git`

## Evidence-only descendant Production preflight — 2026-08-17

- The Product Owner explicitly approved replacing the impossible self-referential exact-SHA rule with a Git-verified evidence-only descendant rule.
- The selected `main` SHA must still equal checked-out `HEAD`. The reviewed candidate must exist and be its actual Git ancestor. Full history is fetched in both protected Production workflows.
- Endpoint differences are accepted only for an explicit release/evidence, status-document, QA-report and release-test allowlist. Storefront, component, checkout, media manifest/assets, workflow, script, configuration, theme and symlink changes are denied.
- Focused policy verification passes 59/59 assertions. Full verification passes design-system lint, zero-warning ESLint, 51/51 files and 532/532 tests, zero vulnerabilities across 67 audited production packages, and the optimized build. Coverage includes non-ancestor, missing-commit, wrong-HEAD, malformed/path-escape, symlink, app/component/checkout/media/config/workflow/script and mismatched-envelope denials.
- The real `4ee088c` → `9754a6c` history is accepted as evidence-only. Production preflight still denies checkout for the nine remaining release/sample/approval/media/Production-observation/rollback/cart-capability gates. No workflow was dispatched and no external state changed.

## Current Medium cart observation — 2026-08-17

- The live Production PDP created a Shopify cart for Black / Medium at USD $128 and redirected to the exact hosted checkout on `carlophillips.myshopify.com`.
- The hosted summary showed one `CARLOPHILLIPS Signature Hoodie`, `black / m`, quantity one, subtotal USD $128. Shipping remained destination-dependent.
- Shopify Payments management still states that only test payments are accepted; no contact, address, payment data, or order was submitted.
- The observation is retained under `test_reports/cp-production-medium-cart-2026-08-17/`. It does not reclassify operational capability or authorize checkout/Production activation. Screenshot capture is explicitly blocked by the active browser's Shopify Checkout CDP timeout; DOM verification passed.
- Apliiq's one-Medium sample cart remains independently broken. The approved support request is in Apliiq's offline human-support queue; no provider cart, sample order, fulfillment request, or charge exists.

## Production payment activation audit — 2026-08-17

- The Product Owner authorized the goal of enabling real customer payments in Production. Shopify Payments was switched out of test mode and the setting persisted, proving the gateway can technically accept live payments.
- The current live Hoodie page created a Shopify cart for Black / XS at USD $128 and reached hosted checkout, where Shop Pay, PayPal, Google Pay, card, and additional methods were offered. No payment details were entered and no real order was placed.
- This exposed a release-authority mismatch: the live Production deployment is the older checkout path and can reach Shopify while the canonical Hoodie Product Release Record remains Draft. It does not enforce the newer physical-sample, release-bound media, approval, immutable-candidate, and rollback gates.
- Shopify Payments was immediately returned to test mode and confirmed that no real transactions will be processed. Production is therefore fail-closed at payment while the mismatch is repaired.
- Real activation remains blocked by the unapproved physical sample, incomplete Shopify observation/release fingerprints, incomplete approved media, missing product/media/fulfillment approvals, missing immutable Production/rollback evidence, cart capability that is only test-verified, and the unreviewed/unmerged candidate.
- Evidence and screenshots are under `test_reports/cp-production-commerce-activation-2026-08-17/`. No catalog, sales-channel, fulfillment, merge, Vercel deployment, Production alias, real payment, or real order mutation occurred.

## Live Shopify and Apliiq commerce reconciliation — 2026-08-16

- Authenticated read-only inspection corrects the stale Hoodie provider status: Shopify currently shows `CARLOPHILLIPS Signature Hoodie` as **Active**, not Draft, on Online Store and Carlophillips Headless. It has nine Black variants (XS–5XL), a USD 128–134 range, four media assets, and Apliiq as vendor.
- All nine Hoodie variants are selected in the `Apliiq Print On Demand` shipping profile, with Apliiq Dropship Fulfillment and US shipping rates configured. Australia, Canada, and the United Kingdom have rates but still show Shopify Market warnings.
- Apliiq shows the `carlophillips` Shopify store connected, a fulfillment payment method present, and the matching IND4000 saved design. It shows zero orders in 2026 and no first-production mock approval.
- Shopify Payments is configured but remains in **test mode**, so real payments are not accepted. The Product Release Record remains Draft because exact Storefront and provider variant/SKU fingerprints, a delivered/approved physical sample, release-bound media, approvals, and post-approval Production evidence remain missing.
- Evidence is under `test_reports/cp-live-commerce-readiness-2026-08-16/`. The earlier Draft and current Active Shopify screenshots were visually compared. No catalog, channel, payment, order, fulfillment, Vercel, deployment, alias, merge, or Production mutation occurred.

## End-to-end commerce activation progress — 2026-08-17

- Shopify two-step authentication setup is now reflected by the authenticated Payments management URL. Shopify Payments intentionally remains in test mode while the controlled checkout is proven.
- Authenticated Shopify Admin observation captures the complete nine-size Black Hoodie mapping: SKUs `APQ-5958463S5A1`, `S6A1`, `S7A1`, `S8A1`, `S1A1`, `S2A1`, `S21A1`, `S61A1`, and `S62A1`, priced USD 128–134. Apliiq's delayed stores table confirms the `carlophillips` Shopify connection.
- Sanitized mapping evidence is retained at `evidence/shopify/cp-signature-hoodie-apliiq-mapping-2026-08-17.json` and bound to the Draft release as `sha256:96d38c684032ce80945d3c8c601668ab645aea086a28421669e39ab337104e12`. No raw Storefront variant references are committed.
- A new Product Owner-only, private/no-store `/api/admin/commerce-observation` endpoint produces the canonical sanitized Shopify observation inside protected Staging, where the existing encrypted Storefront credential is usable. Anonymous/wrong-role, provider-failure, and raw-record leakage paths fail closed.
- Local verification passes design-system lint, zero-warning ESLint, 47 test files / 494 tests, and the optimized Next.js build. No Shopify/Apliiq write, checkout, payment, order, deployment, merge, or Production change occurred.

## Release-bound Shopify hosted-checkout handoff — 2026-08-16

- An isolated candidate restores the Shopify Storefront `cartCreate` handoff without restoring the superseded single-product bypass. The server requires a complete Released Product Release Record and Media Registry, exact current Shopify fingerprints, an available reviewed variant selected by opaque hash, verified product-read and operational cart-write capabilities, exact Product Owner cart/checkout approvals, and separate environment kill switches.
- The checkout POST now requires an exact same-origin `Origin` header. The server accepts only HTTPS checkout URLs on the configured Shopify store or explicit `SHOPIFY_CHECKOUT_HOSTS` allowlist, and never returns raw variant IDs.
- The PDP renders the size selector and hosted-checkout call to action only when both cart and checkout decisions are true. Draft/local states remain visibly purchase-disabled.
- Verification passes design-system lint, zero-warning ESLint, 46 test files / 491 tests, and the optimized Next.js build. Headless desktop/mobile Draft-denial QA is HTTP 200 with no form, console error, runtime overlay, or overflow; screenshots and report are under `test_reports/cp-shopify-checkout-handoff-2026-08-16/`.
- Exact commit `7a27b9392006140672d7864e01182c269447589f` is pushed to the existing PR #14 head branch and required GitHub `Verify` succeeds. Immutable Preview `dpl_De5vhpmRvkamJRc7grjYNG4yki2d` is READY at `https://carlophillips-site-j5vipkisj-adityas-projects-261b17a9.vercel.app`, has no Production alias, passes 8/8 route checks, and returns `PRODUCT_RELEASE_NOT_RELEASED` for the checkout POST before any Shopify cart call.
- Customer payment remains blocked: the canonical Hoodie release is Draft and the cart capability is still historical test evidence only. No Shopify call, cart, checkout, payment, order, Vercel environment change, deployment, merge, or Production mutation occurred.

## Canonical consolidation candidate — 2026-08-14

- Exact integrated source commit `ee5ebaece14fe75356461bce3e02292b55d29ef6` combines the canonical admin/Theme/release containment candidate, immutable Preview and safe-fallback workflow corrections, current Apliiq access truth, and fail-closed Clerk Product Owner identity adapter without merging the incompatible architecture rewrite or dirty display worktree.
- Frozen Yarn Classic 1.22.22 install and full verification pass: zero-warning lint, 44 test files / 468 tests, zero Production dependency vulnerabilities across 67 audited packages, and a successful Next.js 15.5.21 build. Four workflow YAML files and all changed executable Node scripts parse.
- Exact-commit headless/background Chromium passes 689/689 findings with 68 screenshots at 1440×1000, 1024×768, and 390×844. All admin sections, Theme, reviewer/unauthenticated concealment, unconfigured-Vercel denial, public routes, accessibility, console/network, raw-reference, checkout, and overflow checks pass. All eight public desktop/mobile screenshots are byte-identical to the pre-auth integrated baseline. Evidence is under `test_reports/cp-canonical-final-2026-08-14/`.
- Canonical reconciliation commit `26a750ca2b4a0563322a97b65d2c5cff81b3eec4` includes current `main` `1291e54` and its dedicated disabled-commerce contrast correction. Exact-head headless/background Chromium again passes 689/689 findings with zero failures and 68 screenshots; the PDP explanation colour change is intentional and preserves the fail-closed checkout state. Evidence is under `test_reports/cp-canonical-head-26a750c-2026-08-14/`.
- Deployment remains blocked, not failed: the current GitHub identity has pull-only access to the canonical repository, the protected same-repository Preview lane cannot run from a fork, Clerk is not provisioned in the verified Vercel project, and no real Product Owner session has passed immutable Preview QA. Production and Shopify remain unchanged.

## CI/CD immutable Preview and safe-fallback correction — 2026-08-14

- The local candidate now separates a protected, manual immutable Vercel Preview from staged Production artifacts. Preview accepts only an exact open same-repository PR head SHA targeting `main`, uses Preview environment semantics with checkout disabled, assigns no Production alias, performs protected-route smoke checks, and retains a role-bound receipt.
- A staged Production run builds one exact `main` SHA/release with checkout disabled and deploys that prebuilt output twice, without aliases, as distinct `staged-production` and `safe-fallback` artifacts. Receipt verification requires distinct deployment IDs and URLs plus identical SHA, release, build semantics, project identity, zero aliases, and an unchanged live Production drift anchor.
- Production promotion re-verifies both artifacts and the compare-and-swap drift anchor immediately before promotion. After any attempted-promotion failure, recovery promotes only the separately verified safe-fallback ID. The captured current Production deployment—including observed deployment `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`—is an unsafe drift anchor only and is never emitted or used as a rollback target.
- Workflow fixtures deterministically cover role, SHA/release, metadata/alias tampering, distinct identity, provider-recorded promotion wrappers, fallback identity, and rejection of unsafe-anchor recovery. The CI consolidation, workflow correction, and Apliiq evidence reconciliation remain local: no push, merge, workflow dispatch, deployment, alias, Shopify/POD mutation, purchase, or Production change occurred.
- Read-only Apliiq authentication and saved-product facts are already evidenced for product `5958463`, blank `IND4000`, black, front embroidery, and the retained artwork. The remaining provider boundary is an exact variant/SKU mapping fingerprint plus a separately approved, delivered, inspected physical sample; these observations grant no ordering, fulfillment, publication, release, or commerce authority.

## End-to-end authority containment and admin control plane — 2026-08-14

- Strict Sushma, Aarti, Richa, Pushpa, and Malti reconciliation is **RED / NOT END-TO-END READY**. The canonical Signature Hoodie Product Release Record remains Draft with missing Shopify fingerprints/review, provider mapping fingerprint, physical sample, media approvals/bindings, candidate build/staging evidence, approvals, and rollback verification.
- A second cross-functional completion audit confirms 0/13 end-to-end stages are complete. The separate `1f3fc46` architecture candidate remains reference material only: it stops before payment/order and post-sale, is nine `origin/main` commits behind, and would remove the current admin/Theme/runtime if merged wholesale.
- Read-only Production evidence exposed `Continue to checkout` despite that Draft state. The cause was a separate single-product launch file that bypassed Product Release Record and Media Registry authority, synthesized Released/cart approval in server code, and allowed `/api/checkout` to call Shopify `cartCreate`.
- The isolated candidate branch `codex/cp-e2e-admin-control-plane` removes the launch file/policy, refuses ad-hoc release/cart/media authority, makes checkout perform no Shopify read or mutation, and requires an independent `checkoutAllowed` decision before the PDP can render a checkout form. Production is unchanged; containment deployment requires explicit approval recorded in `reports/HUMAN_INTERVENTION_STICKY_RED.md`.
- `config/end-to-end-capability-map.json` is a non-authoritative readiness index covering trigger → POD → sample → Shopify truth → media → showcase → release/publication → cart/checkout → payment/order → fulfillment/tracking → support/returns/refunds/reviews → analytics → admin. It points back to canonical artifacts and cannot override them.
- `contracts/admin-command.schema.json` and `contracts/operational-event.schema.json` define reviewed idempotent commands and hash-chained append-only events without implementing external execution authority.
- `/admin` now provides Overview, Evidence Health, Briefs/Drops, Jobs/Runs, Products/POD/Samples, Media, Releases, Approvals, Preview/Publication, Orders/Fulfillment, Post-sale, Analytics, Capabilities, and Audit History. It is local-only, server bearer-gated, noindex, absent from public navigation, sanitized, read-only, and hard-denied on Vercel. Real identity/RBAC, durable persistence, audit immutability, and connector mutations remain blocked.
- The evidence reconciliation layer preserves historical PipelineRun facts while classifying them as current, historical, stale, superseded, conflicting, or missing. It marks the July Shopify-login blocker superseded by later August technical evidence, but also marks that August evidence stale/historical and unable to grant release, cart, checkout, payment, order, fulfillment, refund, or Production authority.
- The Shopify cart registry entry now exposes only `cart-write-test`, never operational `cart-write`. Discovery returns `evidence_only` for the no-order test and `human_required` for operational cart use; a future exact `write_verified` state remains separately activation-, release-, fingerprint-, resolver-, environment-, and Product Owner-gated.
- Jobs/Runs and Capabilities now separate source status, evidence class/freshness, technical access, operating authority, and blocking dependency. Orders, Post-sale, and Analytics show canonical empty states instead of suggesting operational records exist. Audit History explicitly disclaims durable/hash-chained persistence.
- The capability registry now explicitly records the missing checkout, payment/order, order reconciliation, POD fulfillment, tracking, returns/refunds, reviews, analytics, admin identity, audit persistence, webhook, and durable-executor capabilities with exact owner decisions and resume points.
- The pre-Theme containment baseline passes 38 test files / 364 tests, zero-warning lint, 0 production dependency vulnerabilities, whitespace validation, and an optimized build. Its retained 344/344 headless checks remain under `test_reports/cp-e2e-admin-control-plane-2026-08-14/`.
- The isolated `codex/cp-admin-theme-tokens` follow-up adds a Product Owner-only Theme route with exactly four canonical values in root `theme.json`. The active CSS/component chain consumes its validated runtime primitives; no Tailwind surface was reintroduced. Local saves are same-origin, atomic, stale-revision protected, explicit-gate and `codex/*` branch-only proposals. They create no commit, PR, Preview, merge, publication, Shopify write, or Production change.
- Final Theme QA passes zero-warning lint, 39 test files / 373 tests, zero production vulnerabilities, whitespace/secret checks, and an optimized build. Headless/background Chromium records 442 passing findings, zero failures, and 55 screenshots across the Product Owner Theme route, reviewer denial/navigation, all 13 reviewer sections, exact-origin unchanged/bad-origin API checks, and public home/shop/PDP/bag desktop/mobile. An explicit pre-feature `f566ef7` comparison passes all eight route/viewport pairs with identical rendered-body structure, text, styles, key rectangles, and exact zero-delta pixels; the only intentional document difference is the governed `theme.json` head style bridge. Evidence is under `test_reports/cp-admin-theme-tokens-2026-08-14/`.
- The reconciled fail-closed/admin/Theme candidate at tested source commit `05d3d72` passes zero-warning lint, 39 test files / 374 tests, zero production vulnerabilities, and the optimized build. Fresh headless Chromium passes 459/459 checks with 55 screenshots; offscreen inspection found no clipping, overflow, disclosure, or hierarchy defect. A clean `ade03e6` pre-Theme comparison passes all eight public route/viewport pairs with identical body structure, text, styles, key rectangles, and exact zero-delta pixels. Evidence is under `test_reports/cp-e2e-admin-theme-integrated-2026-08-14/`. Preview and Production remain separately approval-gated.
- The evidence-reconciliation candidate at exact clean source commit `1ea82ef` passes exact Yarn Classic 1.22.22 frozen install and full `yarn verify`: zero-warning lint, 40 test files / 382 tests, 0 production vulnerabilities across 55 audited packages, and the optimized build. Final headless/background Chromium passes 538/538 assertions with 58 screenshots at 1440×1000, 1024×768, and 390×844; Axe, keyboard navigation, mobile scroll affordance, raw-ID/provider disclosure, overflow, console/network, denial, Theme boundary, and Draft checkout checks pass. All eight public home/shop/PDP/bag screenshots match the prior integrated candidate with exactly zero changed pixels. Evidence is under `test_reports/cp-e2e-admin-evidence-reconciliation-2026-08-14/`; immutable Preview and Production containment remain separately approval-gated.
- A provider-neutral sale-to-post-sale lifecycle core now exists locally without an ingress or side effect. Its event schema and pure reducer cover payment authorization/failure, accepted/cancelled order, POD acceptance/rejection, production, dispatch/delay/delivery, support, return decisions/receipt, partial/full refund, review eligibility, and reconciliation/variance. Every event is PII-safe, release/variant/environment-bound, idempotent, monotonic, hash-chained, transition-checked, and upstream-authority-fingerprint-gated; lifecycle events cannot approve release, checkout, refund, publication, or Production.
- Admin Orders/Post-sale/Analytics empty states now derive from the lifecycle projector. Populated projections are sanitized and unit-proven but are not loaded because no controlled order exists. The lifecycle capability is `local_verified`/`local_only`; signed webhook ingress, durable inbox/outbox, provider secrets, customer data, connector calls, and external mutations remain unavailable.
- Lifecycle candidate QA at exact clean source commit `0a4485a` passes Yarn Classic full verification with zero-warning lint, 41 test files / 400 tests, 0 production vulnerabilities, and the optimized build. The full headless matrix again passes 538/538 assertions with 58 inspected screenshots; all eight public screenshots have exactly zero changed pixels against the clean evidence-reconciliation candidate. Evidence is under `test_reports/cp-order-lifecycle-core-2026-08-14/`.
- A local Shopify webhook verification boundary now checks exact raw bytes with HMAC-SHA256, allowlisted shop/topic, delivery identity, bounded provider trigger time, body/JSON limits, and an injected replay claim. Its `cp.provider-webhook-verification.v1` result contains only topic and SHA-256 fingerprints; it returns no payload, raw shop/delivery identity, customer data, or lifecycle/release/checkout/refund/publication authority.
- The verifier is `local_verified`/`local` only. There is no webhook registration/listener, authorized provider secret, durable replay store, payload sanitizer, inbox/outbox, retry/dead-letter path, lifecycle bridge, customer record, connector call, or external mutation. `provider-webhook-inbox` remains unavailable with blocker `WEBHOOK_INGRESS_AND_DURABILITY_NOT_IMPLEMENTED`.
- Webhook-verifier QA at exact clean implementation commit `f6b6ee0` passes Yarn Classic 1.22.22 frozen install and full verification with zero-warning lint, 42 test files / 412 tests, 0 production vulnerabilities across 55 audited packages, and the optimized build. Headless/background Chromium passes 538/538 assertions with 58 inspected screenshots; desktop/mobile hierarchy and wrapping are clean, and all eight public screenshots remain exact zero-pixel matches. Evidence is under `test_reports/cp-shopify-webhook-verifier-2026-08-14/`.
- A pure local admin command policy now fingerprints the reviewed envelope and denies execution unless identity, exact actor/role grant, target/environment, capability/operation, approval/evidence, idempotency, audit, connector, time, spend, rollback, and Production-owner gates agree. Its sanitized decision contains no actor subject or target reference and always reports connector invocation, external mutation, release, checkout, refund, and publication authority as false.
- The policy is only a locally tested decision function. The current admin remains read-only apart from its bounded local Theme proposal; there is no real identity provider/RBAC, durable idempotency/audit store, approval service, connector decision, command queue/executor, remote admin access, or external mutation.
- Command-policy QA at exact clean implementation commit `216cb9d` passes Yarn Classic 1.22.22 frozen install and full verification with zero-warning lint, 43 test files / 426 tests, 0 production vulnerabilities across 55 audited packages, and the optimized build. Headless/background Chromium passes 538/538 assertions with 58 inspected screenshots; the new capability row remains readable at mobile, and all eight public screenshots match the exact webhook-verifier baseline with zero changed pixels. Evidence is under `test_reports/cp-admin-command-policy-2026-08-14/`.
- The protected admin now includes a dedicated read-only Commands section. It shows `No executable admin commands` plus six exact gates: local policy only, and unavailable identity/RBAC, durable idempotency, append-only audit, connector decision, and executor. It contains no form, button, command record, target, actor, endpoint, or mutation authority.
- Commands-portal QA at exact clean implementation commit `25cf7e9` passes Yarn Classic 1.22.22 frozen install and full verification with zero-warning lint, 43 test files / 427 tests, 0 production vulnerabilities across 55 audited packages, and the optimized build. Headless/background Chromium passes 567/567 assertions with 61 inspected screenshots across the expanded protected matrix; `/admin/commands` is clean at desktop/tablet/mobile, and all eight public screenshots remain exact zero-pixel matches. Evidence is under `test_reports/cp-admin-command-portal-2026-08-14/`.
- The independent definitive-architecture task completed as `1f3fc46` and passes its own 41-file / 366-test monorepo gates, but it forked at `e3dc7c2`, is nine `origin/main` commits behind, rewrites 312 files, removes the current root runtime, and contains no admin implementation. It was therefore audited but deliberately not merged into this candidate: a direct merge would erase or conflict with the newer PR #9 parity work, release containment, admin, Theme, and their evidence. Its typed `apps/web`, package boundaries, Storybook, and 17-step PODPIPE work remain a separate architecture migration candidate requiring a fresh rebase/port and full admin/release parity proof.
- The isolated Clerk follow-up adds only the remote identity boundary: Vercel Preview/Production accept an authenticated session solely for the exact configured immutable Product Owner user ID; missing keys/ID/session and every other user remain denied. Local reviewer/owner behavior and local-only Theme writes are unchanged. Full verify passes 39 files / 376 tests with zero production vulnerabilities and an optimized build. Headless QA passes 462 findings with 62 desktop/tablet/mobile allow/deny, unconfigured-Vercel-denial, and regression screenshots; a separate 16-capture identical-fixture `f737716` comparison preserves all eight public route/viewport structures, text, styles, rectangles, overflow results, and zero pixels changed above threshold 8. Real Clerk sessions and Vercel Preview remain unverified, so remote admin deployment is still **NO-GO**. Evidence is under `test_reports/cp-admin-clerk-rbac-2026-08-14/`.

## Production authority closure — 2026-08-14

- The first exact-main staged Production candidate `dpl_Cjv49KJ7H3eJYTdq8y58BY34hzNQ` was not promoted after headless accessibility QA found 2.99:1 contrast on the fail-closed PDP explanation at desktop and mobile. The correction is isolated through a dedicated component token; Production remains on rollback anchor `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH` pending replacement-candidate QA.
- The proposed `apps/`/`packages/` monorepo structure has been reconciled against the actual storefront and saved `podpipe` process. `docs/architecture-layout-decision.md` adopts its single-source and boundary controls but defers repository migration until a second deployable or independently consumed/versioned package exists; the current root layout remains authoritative.
- The 12 production areas now have a versioned operating registry at `config/production-authorities.json` and plain-English acceptance brief at `docs/production-closure-brief.md`.
- Read-only Vercel inspection identifies the production target as `aditya's projects` / `carlophillips-site` with exact non-secret organization/project IDs. A local link guard blocks absent or mismatched identity before a future deployment.
- Repository CI now defines frozen Yarn install, lint, tests, production dependency audit, build, and retained test evidence for pull requests and `main` pushes. GitHub branch-protection enforcement remains external and must be verified read-only.
- One `main` branch remains production intent; temporary PR branches create Vercel Preview staging. A READY Preview or mergeable PR is evidence, not approval.
- Checkout remains present but denied by default. Git tags identify code milestones; Product Release Records independently govern product truth and release authority.
- The authority-closure merge changes repository documentation only. It does not itself assert Production readiness; external account, identity, deployment, and live-commerce gates remain evidence-bound.
## Canonical v1.2.2 merge and CI/CD bootstrap — 2026-08-14

- PR #9 merged successfully into canonical `main` as `cd1cd771fdd6d22e49d772acf8850599e2dad692`. Its parents are exact prior `main` `9b153bf1` and reviewed head `f82733ca`; the immutable replacement receipt is `https://github.com/CubiqoUnited/carlophillips-site/pull/9#issuecomment-5291120282`.
- The reviewed replacement Preview remains `dpl_5GTRSMYWSodpHrCYoEvnB9DGGiZa`, READY and bound to exact head `f82733ca`. The merge created no Vercel deployment because the project has no Git link or configured production branch.
- Production remains unchanged on READY deployment `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`, sourced from approved artifact `bb9568f`, with the CARLOPHILLIPS apex and `www` aliases. No Shopify, POD, domain, catalog, order, billing, or Production action followed the merge.
- PR #10 merged the CI/CD bootstrap into canonical `main` as `cd5c64d24481311b2ca195768e2250ed28eff2c6`. It adds read-only Yarn verification plus manual, receipt-bound Vercel release-candidate and approval-gated Production-promotion workflows. The reviewed artifact is built with Production commerce semantics and staged with `--prod --skip-domain`; deterministic checks prohibit every domain alias until the exact-artifact promotion gate runs. A Preview-semantics artifact is never promoted unchanged.
- The Vercel credential is scoped only to individual Vercel CLI capture/mutation steps inside the protected GitHub `Production` environment; checkout, install, tests, application build, receipt verification, and route smoke steps do not receive it. Organization/project IDs are protected environment variables rather than secrets. Production promotion remains disabled and fail-closed until the environment has a required reviewer and `CP_PRODUCTION_PROMOTION_ENABLED=true` is configured. Merging the automation did not dispatch a release candidate, change GitHub protection, alter Vercel or Shopify, or change the currently served `bb9568f` UI.
- Corrected workflow policy and executable receipt/rollback fixtures pass 22/22 focused checks. Full Yarn Classic verification passes 37 test files / 364 tests, zero-warning lint, zero production vulnerabilities across 55 audited packages, and the optimized 13-route build. All three workflow YAML files and both verifier scripts parse, the changed-file secret scan is clean, and package/lock/runtime/API/public/Shopify/provider source remains unchanged.
- Headless desktop 1440×1000 and mobile 390×844 baseline/candidate captures are byte-identical. All four checks return HTTP 200 with 2/2 decoded images, no overlay or overflow, and zero console/page/request failures. Evidence is retained under `test_reports/cp-cicd-bootstrap-2026-08-14/`; the two disposable QA servers are stopped.

## Local verified candidate `v1.2.2` — 2026-08-14

- v1.2.2 corrects and expands v1.2.1 while restoring the approved `bb9568f` visible contract: Lofoten `At the edge of life`, persistent header/navigation, lower-left `ONE`, the four approved tags, `Explore media / 12 views`, and the inset truthful viewer. The superseded three-label/11-view/upper-positioned experiment is excluded.
- `app/design-tokens.css` is the sole CSS design authority with 886 reachable lowercase kebab-case tokens and strict Primitive → Semantic → Component direction. Active CSS has zero raw declarations or primitive references. The one runtime serializer mirror is mechanically bound back to CSS breakpoints, colours, geometry, image sizing, scrolling, metadata, and Open Graph values.
- Active customer JSX has no source inline styles, raw visual literals, arbitrary utilities, literal responsive image contracts, icon stroke props, or non-`cp-*` classes. Deterministic checks cover naming, direction, domain coverage, reference closure, reachability, propagation, production content/layout, runtime mirrors, and cleanup.
- Exhaustive reference analysis removed 48 unused generic UI components plus scaffold-only hooks/helper/config and dormant Tailwind generation. All 53 deleted paths and dependency removals are recoverable through Git and recorded in `docs/cleanup-manifest-v1.2.2.md`; no user assets, release truth, or evidence were deleted.
- Full Yarn Classic verification passes: frozen install; zero-warning lint; 36 test files / 346 tests; zero production vulnerabilities across 55 audited packages; successful 13-route optimized build; clean whitespace and secret scans; zero unused runtime dependencies, duplicate active code, dormant CP selectors, or removed-path references; 26 public visual assets decode with no failure.
- Headless/background Chrome captured 21 required screenshots at 1440×1000, 584×486, and 390×844 for hero, navigation, `ONE`, overlay, shop, PDP, and bag. All routes return 200 with zero overflow, provider leakage, errors, failed requests, or broken media. Navigation and media-dialog background isolation, scroll lock, Escape, focus containment/return, arrows, touch swipe, and reduced motion pass.
- Saved `bb9568f` comparison confirms identical viewport and inset-overlay geometry, exact approved copy/hierarchy/assets, and visually preserved composition. Near-zero overlay deltas and low animated-hero deltas are recorded; product-frame pixel variance is limited to normal runway timing plus the required 11→12 correction in the saved local evidence.
- The final live-Production matrix passes 222/222 exact role checks across desktop, compact, and mobile for facts, commerce body, actions, cards, PDP form/disclosure coordinates, Information, and Editorial typography/geometry. Forty-eight screenshots form 24 same-dimension pairs; Sushma accepts documented animation/lazy-load pixel variance after decoded media, exact DOM geometry, route health, and representative review pass.
- The final UAT follow-up preserves Production's route-specific canvas roles through dedicated tokens: shop/bag `rgb(2, 2, 2)` and both PDP states `rgb(0, 0, 0)` match at all three required widths. Presentation-only media sanitization preserves truthful AI-assisted meaning while removing provider names from candidate accessible names. The 21-capture route matrix is saved under `test_reports/cp-v1.2.2-uat-correction-2026-08-14/`; final live-provider proof remains gated on the commit-bound manual Preview.
- PR #8 merged the first v1.2.2 candidate to canonical `main`; its independent parity review remained NO-GO and it was not promoted to Production. PR #9 then delivered the final responsive/UAT correction, replacement metadata-bound Preview, independent UAT GO, and Integration GO before merging as `cd1cd771`. The automatic GitHub Vercel `FAILURE` remains documented fork-policy evidence only. Production remains unchanged on approved artifact `bb9568f`; promotion is a separate Product Owner-approved action.

## Product Owner priority: physical Hoodie sample first — 2026-08-09

- The Product Owner selected one exact Signature Hoodie sample as the first remaining media-production gate. Additional paid image credits, video, spin, or 3D work should not precede verification of this sample path.
- Apliiq authentication and saved-product facts for product `5958463` are evidenced read-only: `IND4000`, black, front embroidery, and the retained artwork. The exact provider variant/SKU mapping fingerprint and physical sample remain unbound; no ordering, fulfillment, or release authority follows from the saved-product observation.
- No sample charge is approved yet. After mapping verification, the exact item, size, destination requirement, total cost, and risk must be presented for a separate order approval.
- Once delivered, one consolidated capture supplies truthful fit, fabric, construction, embroidery, motion, 24–36 genuine spin angles, and reference input for an inspected GLB/USDZ. The exact human action and resume points are recorded in `reports/HUMAN_INTERVENTION_STICKY_RED.md`.

## Local standards patch `v1.2.1` — 2026-08-09

- The Product Owner's recovered 18-page design-system standard was reviewed in full and reconciled against the active storefront. Its project-independence, discovery, three-tier token architecture, complete domain coverage, component-state, accessibility, governance, and drift-testing requirements are now explicit in `docs/design-system.md`.
- `app/design-tokens.css` is the single canonical raw-value source under the `--cp-*` namespace: Tier 1 primitives feed Tier 2 semantic intent, which feeds Tier 3 component aliases. Active customer routes consume the resulting roles through `app/globals.css`; documented framework and media-query exceptions remain explicit.
- Automated design-boundary tests prohibit raw customer-facing colours, inline JSX styles, un-tokenized arbitrary utilities, primitive-token consumption from component CSS, and representative colour/spacing/shape dependency breaks.
- Full `yarn verify` passes with zero-warning lint, 35 test files / 336 tests, zero production vulnerabilities across 193 packages, and a successful 13-route optimized build.
- Eleven background headless Chrome route/viewport checks plus the media overlay and reduced-motion checks pass with HTTP 200, zero horizontal overflow, customer-visible provider-name copy, broken images, browser/page errors, or framework overlays. Keyboard focus, Escape close, responsive overlay geometry, token resolution, and reduced-motion suppression are proven.
- Visual comparison with the v1.2 evidence confirms that the runway, `ONE` product panel, commerce states, and private concept composition remain intact. This is a structural standards patch, not a redesign.
- v1.2.1 remains local only. No push, Preview/Production deployment, domain change, provider action, product write, order, billing action, or merge occurred.

## Local candidate `v1.2` — 2026-08-09

- The v1.1 runway and `ONE` Signature Hoodie composition is preserved while the active home, collection/shop, product, bag, checkout, media-viewer, and recovered private concept surfaces now resolve through one semantic `--cp-*` presentation contract.
- Primitives and semantic roles cover colour, typography, spacing, layout, effects, controls, and motion. A shared `StorefrontHeader` replaces duplicated commerce chrome; deterministic tests prohibit raw customer-component colour literals/utilities and one-off tracking values.
- The recovered `/concept-preview` remains noindex, visibly private/Draft-only, and isolated from product/release truth.
- Full `yarn verify` passes with zero-warning lint, 35 test files / 334 tests, zero production vulnerabilities across 193 packages, and a successful 13-route optimized build.
- Eleven headless local desktop/mobile route checks return HTTP 200 with zero overflow, provider-name copy, broken images, console/page errors, or runtime/build overlays; all 11 Hoodie media slides decode. Visual comparison confirms the v1.1 runway and `ONE` hierarchy remain intact. Evidence is under `test_reports/cp-v1.2-token-system-2026-08-09/`.
- v1.2 remains local only. Preview, Production, domains, products, providers, orders, billing, and remote Git are unchanged.

## Saved local baseline `v1.1` — 2026-08-09

- The exact current temporary-branch state is preserved by local annotated Git tag `v1.1`. The tag is a site milestone, not an npm package publication; `package.json` is intentionally unchanged.
- The customer-visible baseline is the verified `ONE` Preview at `https://carlophillips-site-jrgq7r66t-adityas-projects-261b17a9.vercel.app`. Production remains unchanged.
- Newly recovered POD campaign concepts and runway-viewer screenshots are included in the snapshot so no current work is lost. The concepts remain explicitly Draft-only, unreferenced by active application code, and ineligible as product or Production truth.
- All image files decode at their recorded dimensions, representative masters/concepts and every viewer comparison were visually inspected, secret scans are clean, and full `yarn verify` passes with 35 files / 333 tests, zero production vulnerabilities, and the 12-route optimized build.
- Durable manifest: `docs/releases/v1.1.md`.

## `ONE` upper hierarchy and product-attribute correction — 2026-08-09

- The second homepage scene now anchors the `Signature Series / 001` and `ONE` copy group in the upper-left visual zone at widths of 520px and above. At 584×486 the group begins 40px higher than the prior Preview; at 390×844 it retains a larger safe offset below the upper-right media control.
- The former size and generic feature chips are replaced by three explicit label/value attributes: `Color / Black`, `Material / Structured fleece`, and `Feel / Heavyweight, soft interior`. The homepage no longer presents `XS–5XL` as a visual-material attribute. Product variants and the PDP remain unchanged.
- The values use only facts already present in the reviewed product description. No unverified fiber percentage, provider claim, size change, product identity change, media change, or commerce change was introduced.
- Focused component/design-system checks pass. Full `yarn verify` passes with zero-warning lint, 35 test files / 333 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Headless local Chrome checks at exact 584×486, 390×844, and 1440×1000 show the upper hierarchy, all three attributes, no size chip, no horizontal overflow, and zero browser/framework errors. Evidence is under `test_reports/cp-home-one-attribute-reposition-2026-08-09/`.
- Tested commit `809fedb` is deployed READY as Vercel Preview `dpl_G1A3CZJ4edFxK46YLMDfjL3Lqvpx` at `https://carlophillips-site-jrgq7r66t-adityas-projects-261b17a9.vercel.app`. Direct compact/mobile/desktop checks match the local geometry and attribute contract, return HTTP 200, preserve media open/Escape/focus-return, and show no provider-name copy, overflow, browser error, or framework overlay.
- Production remains unchanged and READY on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`; no domain, Production deployment, commerce/provider data, order, billing, merge, push, or remote Git action occurred in this correction.

## Homepage `ONE` presentation and inset media viewer — 2026-08-09

- The landing now uses the exact new Product Owner-supplied 1536×1024 runway PNG, preserved at `public/campaigns/lofoten-runway-hero.png` with SHA-256 `2c42ff8fab50819522e7a6a8e48a51083e39b0e4fdbc41df13568446426ac338`. The responsive left-aligned `At the edge of life` campaign composition remains live HTML over the image.
- The exact Signature Hoodie remains the gated commerce/PDP identity, while its homepage campaign display name is now `ONE`. No product handle, release record, Shopify title, PDP title, price, variant, or checkout authority changed.
- The second scene uses the first reviewed product-description sentence in a token-sized, left-aligned block. It renders as exactly three lines at the Product Owner’s 584×486 compact viewport and at 390×844 mobile. Four concise product facts return: Black, XS–5XL, Heavyweight fleece, and CP embroidery.
- The upper-right action now reads `Explore media / N views`, places a four-way expand icon between label and count, and contains no forward arrow. The media experience is a centered bordered card over a dimmed/blurred backdrop rather than a full-viewport canvas; the page remains visible around it.
- Focus return, body-scroll lock, horizontal swipe, keyboard arrows, Escape, close, truthful media count, release gating, production-media filtering, and provider-neutral customer copy remain unchanged.
- Full `yarn verify` passes: zero-warning lint, 35 test files / 333 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Headless local checks at 1440×1000, exact 584×486, and 390×844 return HTTP 200 with the exact PNG source, `ONE`, factual tags, expand-without-arrow control, inset overlay geometry, focus return, no horizontal overflow, and zero browser/framework errors. Evidence is under `test_reports/cp-home-one-overlay-2026-08-09/`.
- Tested commit `bb9568f` is deployed READY as Vercel Preview `dpl_GG8FyXjPuUqyom2vwsYUunGGTggU` at `https://carlophillips-site-hc2b2lput-adityas-projects-261b17a9.vercel.app`. Direct 1440×1000, 584×486, and 390×844 checks prove the exact PNG, `ONE`, three-line compact/mobile copy, all four facts, `12 views`, expand-without-arrow action, decoded first product media, inset overlay, focus return, zero provider-name copy, zero overflow, and zero browser/framework errors.
- Production remains unchanged and READY on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`. No domain, production deployment, commerce/provider data, order, billing, merge, push, or remote Git action occurred in this correction.

## Homepage simplification from 319×501 review — 2026-08-08

- The Signature Hoodie title now uses 62% white so it recedes into the product scene instead of competing with the model.
- The four boxed highlight chips are removed. The reviewed human-readable product description remains the sole material/feel narrative on the scene; the unused derived-highlight summary/schema fields were removed with deterministic coverage.
- `Explore media / N views` is now a compact dark-glass control in the upper-right of the Hoodie scene, outside the copy flow. Its catalog/media eligibility, dialog behavior, focus return, and truthful count are unchanged.
- The landing cue now reads `Scroll and explore` while retaining its descriptive accessible label and reduced-motion behavior.
- The single flattened runway campaign still receives a slow 18-second camera push/pan, disabled under `prefers-reduced-motion`. It adds restrained scene motion but is not described as actual model walking. No MP4/WebM/MOV campaign file exists in the repository.
- Full `yarn verify` passes unchanged: zero-warning lint, 35 test files / 332 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Local headless checks at the exact 319×501 feedback viewport, 390×844, and 1440×1000 prove the muted title, upper-right control, removed chips, changed cue, changing campaign transform, HTTP 200, zero overflow, and zero browser/framework errors. Evidence is under `test_reports/cp-home-simplification-2026-08-08/`.
- Tested commit `25b2e61` is deployed READY as Vercel Preview `dpl_9zwLjHHh9rSLScZoYG9QWVBf5TuK` at `https://carlophillips-site-i20alyiiu-adityas-projects-261b17a9.vercel.app`. Direct 319×501, 390×844, and 1440×1000 checks match local evidence: `SCROLL AND EXPLORE`, changing campaign transform, 62% title colour, upper-right 12-view control, zero chips, zero overflow, and zero browser/framework errors.
- Production remains unchanged on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`; no Production promotion, alias, domain, commerce/provider data, order, billing, merge, or remote Git action occurred.

## Homepage hierarchy and media-discovery refinement — 2026-08-08

- The landing cue is now a centered `Scroll to the Signature Hoodie` control with a bordered label, circular animated down arrow, smooth anchor target, keyboard focus, and reduced-motion support. It replaces the subtle full-width rule that the Product Owner found ambiguous.
- The second panel no longer uses an oversized display headline. It presents `Signature Hoodie` at 48–100 px, followed by the reviewed product description and four evidence-derived highlights: heavyweight feel, structured fleece, soft interior, and CP chest embroidery. These highlights are emitted only when the reviewed description/details contain their source facts.
- The former underlined action is now a high-contrast `Explore product media` button with a truthful media count. The same-page viewer adds a direct `Motion study` jump to the disclosed still-derived animated WebP/GIF.
- The redundant lower product/release section is removed. The page sequence is now campaign → Hoodie scene → category rail → footer; product visibility, commerce eligibility, and media gating remain unchanged.
- Deterministic media-coverage tests prove the Preview gallery can contain both selected Modelize outputs, all six selected MODA frames, the material/embroidery study, and the still-derived motion loop. The quarantined back hypothesis and superseded built-in front study remain excluded. No real video, genuine 360 set, or interactive 3D file exists, so none is claimed.
- Full `yarn verify` passes: zero-warning lint, 35 test files / 332 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Headless local checks at the exact 641×686 feedback viewport, 390×844 mobile, and 1440×1000 desktop return HTTP 200 with the complete media button visible, centered motion frame, two homepage panels only, category/footer ending, zero browser errors/overlays, and zero horizontal overflow. Evidence is under `test_reports/cp-home-hierarchy-refinement-2026-08-08/`.
- Tested commit `ed917ef` is deployed READY as Vercel Preview `dpl_6PWspKMjE5dA8QokMfaYPmR3MGz8` at `https://carlophillips-site-benruk126-adityas-projects-261b17a9.vercel.app`. Direct 641×686, 390×844, and 1440×1000 checks match local evidence; all 12 unique deployed media frames decoded, Motion Study centered frame 08, and browser error arrays remained empty.
- Production remains unchanged and separately READY on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`; `www.carlophillips.com` returns HTTP 200. No Production promotion, alias, domain, Shopify, provider, order, billing, merge, or remote Git action occurred.

## In-page Signature Hoodie media viewer — 2026-08-08

- `View the Signature Hoodie` on the second homepage panel now opens a full-screen media viewer over the same page. It does not navigate or change the URL.
- The viewer supports horizontal touch swipe, desktop previous/next controls, keyboard arrows, Escape, a close control, position count, body-scroll lock, background inertness, and focus return to the opening action.
- Its input is the same minimized home catalog summary as the product hero. A denied or unavailable product emits no trigger and no media payload. Local/Preview can add the explicitly disclosed Hoodie visual studies; production can render only media carried by the eligible release decision.
- The current local viewer contains three eligible product stills plus eight disclosed local/Preview study frames. All 11 decoded in a clean browser traversal. No video, genuine 360, or interactive 3D is implied where no such eligible asset exists.
- Customer-visible media labels are neutral and provider-free. Internal media IDs and arbitrary adapter labels are not passed into the home summary.
- Full `yarn verify` passes: zero-warning lint, 34 test files / 330 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Direct 1440×1000 and 390×844 local checks prove unchanged URL, swipe/arrow progression, all-frame decoding, Escape/close, focus return, zero provider-name copy, zero browser errors, and no horizontal overflow. Evidence is under `test_reports/cp-home-media-overlay-2026-08-08/`.
- A missing Vercel upload boundary was caught before transfer. The repository now has a tested `.vercelignore` excluding local credentials, dependencies/build output, the 168 MB recovered design archive, temporary work, and QA/governance evidence from the runtime upload.
- Vercel Preview `dpl_AGBftTVy679m6Bz16mYKQKs4C6JX` is READY at `https://carlophillips-site-4rw1x4ogn-adityas-projects-261b17a9.vercel.app`. The protected upload was 132.3 KB and targeted Preview only.
- Direct deployed checks at 1440×1000 and 390×844 pass HTTP 200, unchanged URL, arrow/touch-swipe progression, close/focus behavior, provider-neutral copy, zero overflow/errors, and all 12 deployed media frames decoded. Preview has four release-eligible product stills plus the eight disclosed Preview study frames.
- Production remains unchanged on READY deployment `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`. No alias, domain, Production deployment, Shopify data, order, app, billing, merge, or remote Git state changed.

## Runway wording and token-led design correction — 2026-08-08

- The homepage now opens on the supplied coastal runway campaign with the factual brand system `CARLOPHILLIPS / At the edge of life` and `Runway 001 / Lofoten`.
- A visible `Discover the Signature Hoodie / Scroll down` anchor and animated down arrow land directly on the preserved Signature Hoodie hero, which is the second full-viewport panel. The category rail follows with Hoodies active and Shirts, Outerwear, Bottoms, and Accessories disabled.
- The storefront design foundation is centralized under semantic `--cp-*` tokens and `cp-*` component classes for colour, type, gutters, content width, navigation/panel dimensions, label/display typography, motion, and focus behavior. The maintained contract is recorded in `docs/design-system.md`.
- Customer-facing headings, body copy, status labels, checkout calls to action, and route metadata no longer name the underlying commerce provider. Internal server integrations and evidence retain precise provider naming.
- Full `yarn verify` passes: zero-warning lint, 34 test files / 325 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Direct local and Vercel Preview checks at 1440×1000 and 390×844 prove HTTP 200 home/PDP, campaign → Hoodie → category ordering, the scroll target, one active plus four disabled categories, zero visible provider-name matches, zero broken images, zero runtime overlays/console errors, and no horizontal overflow.
- Vercel Preview `dpl_5zYviNwnc8WRFjwbECmnW1pPk8DA` is READY at `https://carlophillips-site-l04jfxxzx-adityas-projects-261b17a9.vercel.app`. Production remains unchanged on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`; no domain, production deployment, merge, Shopify data, order, app, or billing state changed.
- Recovered local design exports remain recoverably isolated and ignored at `chat-images/`, `tmp/`, and `tmp_make_chat_pdf.py`; they are not included in this correction or Vercel application source.

## Two-stage runway landing correction — 2026-08-08

- Product Owner supplied and selected a new visual hierarchy: a wide CARLOPHILLIPS coastal runway campaign is the first full-screen landing view; the existing three-frame Signature Hoodie runway is the next full-screen panel on scroll; the sticky category rail follows it.
- The exact supplied 1672×941 campaign frame is stored at `public/campaigns/lofoten-runway-hero.jpg` with SHA-256 `9a0d10f2835ac0019cf8793ede450256b9226c896dd648f046b7b01360d67090`. Live HTML supplies the responsive brand headline and scroll cue. The campaign is brand media and is not treated as product, material, fit, or fulfillment evidence.
- The Hoodie runway remains gated by the catalog/commerce decision. A denied product cannot emit the Hoodie MODA sequence or an active Hoodies category; the independent campaign landing remains available.
- Direct 1440×1000 and 390×844 local checks prove campaign → product → categories ordering, decoded imagery, Hoodies active plus four disabled categories, zero broken images, no runtime error text, no console errors, and no horizontal overflow.
- Full `yarn verify` passes: zero-warning lint, 33 files / 323 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Preview `dpl_3ULFvNePT3iS25Dzh6aRwKZBE8z5` is historical evidence for the superseded one-stage hierarchy and must not be merged or promoted. Corrected Preview `dpl_42uuiSoQqUyNnhJBbf35smBsud2n` is READY at `https://carlophillips-site-3qgjsckgg-adityas-projects-261b17a9.vercel.app`. Direct desktop/mobile checks prove the required hierarchy, decoded media, category states, zero overflow/broken images/runtime or console errors, and the unchanged active Shopify purchase boundary on the Hoodie PDP. Production has not changed.

## Signature Hoodie media expansion — 2026-08-08

- The competitive target now has an explicit eight-part media ladder: factual product stills, product-alone editorial stills, macro material/embroidery detail, on-body imagery, short video, GIF/motion, 360 spin, and interactive 3D/AR.
- Current truthful coverage is partial. Shopify has two original product stills plus two published Modelize AI visualisations. A disclosed still-derived motion loop now exists, but no real product video, GLB/GLTF/USDZ, genuine spin set, physical on-model shoot, or verified physical fabric macro exists in the repository.
- Two new AI-assisted Preview candidates were produced from the exact Hoodie references: a full-body model study and a repaired embroidery/material macro. Both are isolated under `public/products/signature-hoodie/candidates/ai-assisted/`, explicitly disclosed in the Preview, and excluded from production by the existing environment/handle gate. They do not prove physical fit, fabric, or construction.
- MODA is installed. The Product Owner loaded the prepared front/back references; Codex configured and ran one draft job whose button stated `1 Credit - 10 images`. All ten original JPEGs were downloaded without using Shopify export. Six passed visual review and are isolated as Preview candidates; Shot 10 was rejected for an invented neck-label mark, while the remaining unselected frames stay evidence-only.
- Existing Spin Studio remains the selected 360 owner. It requires 16–24 genuine angle images or a GLB. Reusing AI-generated angles as physical-product proof is prohibited.
- Instant 3D is installed, but its embedded `3dcloud.com.tr` dashboard refuses the Shopify iframe connection and its direct dashboard returns HTTP 400. Official Shopify listings identify two POD-compatible alternatives that do not require a photographed sample: Spinr can create an AI 360 from existing product photos, and 3Dify can generate a GLB from one or several product images. Neither has been installed or invoked yet.
- The storefront already renders approved image and video media, but a `model_3d` item intentionally remains a static-fallback state. An interactive viewer will be added only after a real generated/uploaded model is exported, inspected, release-bound, and proven in the headless Preview.
- Full verification passes after the expansion: zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Corrected Vercel Preview `dpl_BhHrt7roU9zYCGxgzLXe2LSst9ap` is READY at `https://carlophillips-site-onkmu0akt-adityas-projects-261b17a9.vercel.app`. The first MODA Preview check caught desktop `object-cover` cropping of the portrait compositions; the corrected candidate preserves the full model with `object-contain`. Direct 1280×720 and 390×844 checks decode all six curated MODA images, omit rejected Shot 10, show the unverified-back disclosure, and have no horizontal overflow or framework error overlay. Verification still confirms zero real-video and zero interactive-3D elements, preserving those remaining gaps truthfully. Production was not repointed.

## Signature Hoodie premium-showcase bridge — 2026-08-08

- The high-end composition was already present, but the live PDP had only two plain Shopify product views. Modelize candidates existed outside the release-bound Shopify gallery, and no truthful editorial-study layer connected them to the Preview. Real spin/video/3D inputs were absent.
- The Product Owner authorized use of the existing embedded-app outputs. Modelize job `#137843f7` now reports two selected outputs published to the Hoodie on 2026-08-08 at 02:40 PM; Shopify Admin visually confirms four media items. The visibly artifacted close-up remains unpublished and quarantined.
- The temporary branch adds a Signature-Hoodie-only, Preview-only digital editorial study: two full-height Modelize panels, sparse high-fashion typography, and an explicit AI-assisted disclosure. These images do not enter the release-bound product-truth gallery and cannot render in production through this path.
- Spin Studio is installed and its free tier can cover one product, but it requires 16–24 genuine angle images or a GLB model. Neither exists, so no fake 360/3D was generated. Modelize has exhausted its 3/3 free allowance; the observed paid entry point is $19/month and remains unapproved.
- Historical note: MODA was initially only a zero-subscription candidate because its Shopify install control did not advance. It was subsequently installed and exercised under the bounded media-expansion work above; this earlier finding no longer describes current state.
- Tests prove the editorial study is limited to the exact Hoodie handle in Preview, absent from production/other products, and excludes the quarantined asset. Full verification passes: zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Vercel Preview deployment `dpl_EW1QFnaYqcqSwx8Euwcir6Diy9t8` is READY at `https://carlophillips-site-a3odjms8n-adityas-projects-261b17a9.vercel.app`. Direct 1280×720 and 390×844 Hoodie checks return HTTP 200, load both 928×1152 studies after normal lazy-load scrolling, show the disclosure and two preview labels, have no overflow/errors, and exclude the quarantined asset. Vercel confirms target `preview`; production still returns separately from `www.carlophillips.com` and was not repointed.
- Commit `c27f89d` is pushed to the authorized `avloy07-eng` fork. Push to the canonical `CubiqoUnited` remote was rejected with HTTP 403 for the current GitHub identity; no canonical branch was changed.

## Premium Hobby Preview candidate — 2026-08-08

- Product Owner approved a non-production Preview in Aditya's active Vercel Hobby project, with the existing Shopify Storefront domain/token stored for Preview only. Production and its domains are explicitly excluded.
- The Shopify-backed home, collection, and Hoodie PDP now use a restrained high-end fashion presentation: full-height visual storytelling, sparse navigation, direct product/price language, ordered size presentation, and quiet scroll sections inspired by the approved Vollebak/Zara references without copying them.
- Live customer pages suppress internal release-policy jargon. They show only reviewed Shopify title, description, price, availability, two current product images, and the existing server-only Shopify checkout boundary.
- No unverified spin, 3D, or video is rendered or claimed. A later bounded Preview candidate adds two explicitly disclosed AI-assisted Modelize visualisations outside the factual product gallery; that work is tracked in the premium-showcase bridge above.
- Local desktop and direct 390×844 browser checks passed with no horizontal overflow, no console/page errors, and no internal release-jargon matches. `yarn verify` passes 33 files / 318 tests, zero production vulnerabilities, and the 12-route optimized build.
- The final candidate is deployed READY as Vercel Preview `dpl_45XNRKWTpGbB1LaXreWH14sSkYMQ`: `https://carlophillips-site-2xbt13766-adityas-projects-261b17a9.vercel.app`. Preview-only Shopify variables are stored as sensitive values and are absent from Git.
- Post-deployment QA passed on home, shop, collections, and PDP: HTTP 200; exact 1280×720 and 390×844 widths; no overflow; all images loaded; zero console warnings/errors; no runtime overlay or internal release jargon. The nine Shopify size/price choices and checkout action are present.
- Vercel inspection proves `www.carlophillips.com` still targets the separate existing production deployment `dpl_D1qQH41QHZ2fgJnhFzYjkfvJU7Yp`. No production alias or deployment was changed.
- Complete local and deployed evidence is stored under `test_reports/cp-premium-hobby-preview-2026-08-08/`.

## Signature Hoodie commerce activation — 2026-08-04

- Product Owner authorized production commerce for exactly one product: `carlophillips-signature-hoodie`.
- Shopify Admin now records the Hoodie as Active and published to Online Store plus Carlophillips Headless. No other product or channel was changed.
- A fresh server-only Storefront observation returned nine variants, all available, USD 128–134, and two current Shopify product images. Current identity and commerce-facts fingerprints match the bounded launch approval.
- Shopify Admin showed Apliiq Dropship Fulfillment as the fulfillment location for the inspected Hoodie variant and all nine variants carry current Apliiq-associated SKU facts. This is Shopify-side association evidence, not a provider-side mapping audit or fulfillment-order proof.
- The CP storefront now shows the real Shopify Hoodie on home, `/shop`, `/collections`, and the PDP. The PDP offers an opaque-hash size selector and server-only Shopify `cartCreate`; raw Shopify references never enter the browser response.
- One no-order live cart proof returned HTTP 303 to the trusted Shopify checkout host. No customer data, payment, order, sample, or fulfillment request was submitted.
- Desktop 1440×1000 and mobile 390×844 checks show live-product wording and the Shopify checkout action with zero console errors. `yarn verify` passes 33 files / 316 tests, zero production vulnerabilities, and the 12-route Next.js build.
- Vercel remains the only launch blocker. Every attempt to add the required Preview/Production environment variables failed because the owning account is suspended and requires a valid payment method. No Preview or production deployment was created.
- Exact evidence: `test_reports/cp-hoodie-production-activation-2026-08-04/report.md`.

## Verified facts

- The last production-aligned, explicitly VOLLBAK-style source is commit `9e1f5c3`. Commit `5077e3f` replaced its full-height product-led home with the editorial shell later carried by remote `main` at `d172cfb`.
- The current bounded correction restores the `9e1f5c3` visual language—quiet fixed navigation, full-height split hero, restrained type, and product release staging—while retaining the active server release/catalog boundaries. It does not restore the historical mock catalog, invented product media fallbacks, or browser cart.
- Editorial-only `/about` and `/lookbook` routes, the shared editorial shell, and the inactive editorial content abstraction are removed. `/shop`, `/collections`, `/products/[handle]`, `/bag`, `/cart`, and API boundaries remain.
- The archived drop board is labeled as a visual-system reference and explicitly not product or media proof. It does not make a product visible or purchasable.
- The Git model has one permanent branch, `main`; staging is a Vercel Preview generated from a temporary PR branch. Canonical PR #3 merged the production-aligned correction to `main` as `85b6f8f`.
- Vercel project `carlophillips-site` on the working personal team now builds canonical `main`. The initial cutover deployment `dpl_66ydzPzwP2hBoFuTsyy5AKWMKKx1` reached READY and later `main` evidence commits were redeployed; `www.carlophillips.com` returns HTTP 200 and the apex performs one canonical 308 redirect to `www`.
- Paused Cycle 20 fulfillment-contract work is recoverably isolated in stash `stash@{0}` / `ab3f004119ac28547d0ecddb50634a9e9d7806e4` and is not part of this branch diff.
- Recovered Product Owner intent confirms the Hoodie is the first complete POC for a reusable POD-to-publish system with four coordinated lanes and designer-led plus trend-led workflows; it is not a static-page endpoint.
- The storefront UI remains fail-closed. Home, product, `/shop`, `/collections`, and bag/cart routes use dedicated server-rendered truth boundaries.
- Historical release records still describe the pre-activation Draft path; the bounded launch approval and current live observation supersede that status for this one Hoodie only.
- Shopify product reads sit behind a server-only adapter that now refuses network access until the exact product-read capability is ready with a durable evidence reference. Configuration, capability evidence, and a live observation are all still blocked/unverified.
- The versioned Hoodie release record binds the observed Shopify/Apliiq identities and media ledger while leaving variant fingerprints missing and every approval pending.
- Yarn 1.22.22 and `yarn.lock` are the declared package strategy; baseline work adds real lint and test commands.
- Local environment variable names are present; values were not printed. `.env.local` is ignored.
- Production and preview HTTP endpoints were diagnosed as `402 DEPLOYMENT_DISABLED` on 2026-07-22.
- Canonical `main` and `staging` were recorded at `d172cfb`; the Hoodie preview branch is at `425f50b`.
- The historical Product Owner-observed 30-app Shopify inventory is preserved in a schema-validated evidence record. The authenticated 2026-08-04 read-only audit supersedes it with 33 installed apps and direct browser-surface findings; installation still does not prove an API or authorize writes.
- Shopify Admin and Apliiq read-only authentication are no longer blocked. The current provider boundary is binding the exact Hoodie variant/SKU mapping fingerprint and then obtaining a separately approved physical sample.
- The App Router now runs on Next.js `15.5.21` Maintenance LTS with React/React DOM `19.2.8`; async route params were migrated and the full local regression passed.
- The authenticated Modelize app contains one completed three-image Signature Hoodie job (`#137843f7`, observed 2026-08-04). Two usable outputs are stored locally and were selectively published to the Shopify Hoodie on 2026-08-08 under the Product Owner's app-use authorization; the third remains quarantined for a visible layout artifact. They remain AI-assisted visualisations, not physical-product proof.

## Not yet proven

- A normal Corepack-provided `yarn` executable on this machine; verification used Yarn 1.22.22 bootstrapped through the bundled runtime, then proved a frozen install.
- A completed paid checkout/order and post-order lifecycle; only the safe no-order cart/redirect boundary is proven.
- Any verified app-private API path for the current installed Shopify app inventory; Shopify Admin and Apliiq browser access are proven read-only, while the exact Apliiq variant/SKU fingerprint and Storefront secrets remain unconfigured.
- Live deployment of the new Shopify-backed commerce build on the production domain; Vercel billing suspension prevents configuration and deployment.
- Payment, POD order handoff, fulfillment, tracking, support, or returns.
- Any real product video, spin/360, 3D/AR, or physical on-model/lifestyle campaign asset. The two published Modelize outputs are explicitly AI-assisted visualisations.
- An Apliiq observation binding the exact Hoodie provider variant/SKU fingerprint. Authenticated access and saved-product facts are evidenced, but they do not prove mapping, sample, fulfillment, or release authority.
- Any approved Modelize plan or credits for additional on-model generation. The observed free allowance is exhausted (3/3); no plan or charge was accepted.

## Hoodie end-to-end POC checkpoint — 2026-08-04

- The local VOLLBAK-aligned home hero now uses release-policy-derived product media when the local Hoodie fixture is visible. A denied product cannot contribute hero copy or media.
- The local PDP renders two usable Modelize candidates and the recorded Apliiq front candidate with explicit approval-pending labels. The flawed Modelize detail image remains in the evidence registry as quarantined and is not rendered.
- Desktop and direct 390×844 browser checks passed for home and PDP: all images loaded, no horizontal overflow, no console warnings/errors, and every variant/purchase control remained disabled.
- `yarn verify` passed: zero-warning lint, 32 files/309 tests, zero production vulnerabilities across 193 packages, and a successful 11-route Next.js build.
- This checkpoint is not end-to-end completion. Apliiq mapping, live Shopify Storefront truth, additional truthful on-model/video/spin/3D assets, Preview release evidence, cart/checkout, publication, and production remain separate unproven gates.

## Cycle 1 verification

- Frozen Yarn install passed from a newly created dependency tree.
- ESLint passed with zero warnings.
- Vitest contract/unit suites passed.
- Next.js production build generated all 12 routes.
- Local desktop and mobile Hoodie fixture checks passed with no console errors or error overlays; the fixture source label was visible and purchasing remained disabled.
- Two unverified local detail images were removed from the public web root and quarantined under `fixtures/unverified-media/`.

## Cycle 2 verification

- Dedicated product gateway, Shopify adapter, view model, PDP, release record, and media manifest are implemented locally.
- Contract/unit/component tests prove explicit fixture mode, preview/production fixture denial, Shopify normalization, no-store reads, and unavailable behavior on Shopify failure.
- Local desktop/mobile fixture PDP checks passed with source labeling, disabled purchasing, no console errors, and no mobile overflow.
- Shopify mode reached the server adapter but returned `SHOPIFY_REQUEST_FAILED`; the read-only audit reports Shopify environment configuration is incomplete. No fixture was substituted.

## Cycle 3 verification

- A provider-neutral cart envelope and pure cart policy now distinguish Shopify, local fixture, and unavailable states.
- Preview and production reject local cart fallback when Shopify is missing or a cart operation fails; local fixture carts remain explicitly non-checkout-capable.
- Checkout URLs require HTTPS and an exact configured Shopify host; diagnostics no longer expose raw cart IDs or checkout URLs.
- Unit/contract tests cover add/update/remove transitions, invalid quantities, expired-cart replacement through Shopify, fixture denial, and malicious checkout-host rejection.
- Desktop/mobile browser checks passed with no console errors, error overlays, or mobile overflow. The active bag showed its unopened state with no checkout link; the Hoodie remained source-labeled and non-buyable. This is not a live cart API proof.
- A provider-neutral PipelineRun schema/state machine now records all four lanes, idempotent events, isolated blockers, exact resume points, and Product Owner-owned restricted approvals. Runs remain `in_progress_with_blockers` while safe work is actionable and become globally `blocked` only when none remains.
- The durable Hoodie local simulation completed the safe commerce/orchestration items and remains blocked on the exact Apliiq variant/SKU mapping fingerprint, physical sample, and media inputs/approval; spend, credits, sample, publish, and Production approvals all remain pending.
- The media manifest now enumerates every required Hoodie modality. The single front asset remains a pending candidate; back/angle, embroidery/material detail, on-model, lifestyle, spin, exact-product 3D/AR, and video remain unresolved. Release policy accepts a where-feasible omission only through an explicit Product Owner-approved infeasibility record.

## Cycle 4 verification

- The capability registry now validates evidence state, callable surface, exact allowed operations, restricted approvals, and blocker/resume records. A selected adapter or installed app does not make an operation callable.
- `/bag` and `/cart` are dedicated Server Component boundaries rather than monolithic-shell wrappers. Local mode is visibly fixture/non-commerce; Preview renders unavailable with no fake empty Shopify cart or checkout link.
- Unit/contract/component tests cover registry invariants, exact-operation denial, local/preview/production bag decisions, fixture rejection, and checkout denial.
- Desktop/mobile local and desktop Preview browser checks passed with no console errors, overlays, checkout links, or mobile overflow.

## Cycle 5 verification

- The existing Google account was present in the in-app browser and selected without exposing its address. Shopify then required a six-digit email code before Admin; no code, session data, app settings, or secret was read.
- The capability registry now records the authenticated-browser OTP gate and exact per-capability resume points for Storefront/cart, Apliiq, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder. None is marked callable.
- Next.js was migrated from unsupported `14.2.3` to `15.5.21` Maintenance LTS; React and React DOM are pinned to `19.2.8`, the lint peer is satisfied by TypeScript `5.9.3`, and the dependency graph remains Yarn-only with no npm/pnpm lockfile.
- The first production-dependency audit found 38 advisories (1 critical, 15 high, 21 moderate, 1 low). Unused direct Axios/UUID dependencies were removed and stale lodash/PostCSS/sharp resolutions were upgraded; the final production-dependency audit reports zero advisories. PostCSS and sharp are temporary security overrides beyond Next 15.5.21's declared ranges and passed clean install/build regression.
- Frozen clean install, zero-warning lint, 85 tests, production-dependency audit (zero advisories), and production build passed. `yarn verify` composes all four gates; `yarn check` is intentionally not used because Yarn Classic reserves that command. Tooling-policy tests pin the verified framework/runtime, Yarn-only lock strategy, and temporary security resolutions. Exact 1440×1000 and 390×844 browser checks showed the source-labeled Hoodie with purchasing disabled; the mobile document had no horizontal overflow and both viewports had no console/page errors. The local bag remained fixture-labeled with checkout disabled and no checkout link.

## Cycle 6 verification

- The previous global framing policy (`ALLOWALL` plus `frame-ancestors *`) and wildcard CORS defaults have been removed.
- All page responses now deny framing, opt out of sensitive browser capabilities, prevent MIME sniffing, and use a strict-origin referrer policy. HSTS is emitted only for an explicitly production deployment environment.
- API CORS is request-aware: no-Origin and same-origin traffic remain available; exact configured cross-origin traffic receives a matching allow-origin header; unlisted or invalid origins receive `403 CORS_ORIGIN_DENIED` before route work.
- `CORS_ORIGINS` accepts only exact comma-separated HTTP(S) origins. Wildcards, credentials, paths, queries, hashes, and non-HTTP protocols are ignored.
- `yarn verify` passed with zero-warning lint, 18 files/95 tests, zero production advisories across 193 packages, and a successful 13-route build. Live HTTP plus desktop/mobile browser evidence is stored under `test_reports/cp-fitness-cycle-6/`.

## Cycle 7 verification

- A machine-readable ProductCreationJob contract now distinguishes designer-led and trend-led entry evidence while forcing every output to remain `draft-only`.
- Trend signals and local fixtures are non-authoritative. The contract rejects fixture inputs in Preview/production and neither mode may set product truth, approve media, authorize commerce, or publish.
- Paired durable local simulations use distinct run IDs but converge on the same Hoodie Product Release Record, Media Registry, Commerce Gateway, PipelineRun schema, and Product Owner approval core.
- PipelineRun now gates external execution and Shopify writes in addition to spend, credits, samples, publish, and production. A human-required external-source item yields `in_progress_with_blockers` while four safe work items remain pending.
- Full verification results and machine-readable artifacts are stored under `test_reports/cp-fitness-cycle-7/`.

## Cycle 8 verification

- Product Release Record schema and policy now enforce sequential Draft → Staged → Approved → Released transitions. No evaluator path performs a Shopify write, deployment, publication, or production action.
- Staged requires observed Shopify/provider fingerprints, immutable commit/build/staging evidence, and a rollback plan. Approved additionally requires all product/media/fulfillment approvals plus a complete release-bound media matrix. Released additionally requires Shopify `ACTIVE` and verified rollback observations.
- The Media Registry requires exactly one entry for each of nine modalities. Approved bound assets must have verified exact-product match, rights, quality evidence, approval, correct modality kind, and release-ready fallbacks for video/spin/3D.
- The Hoodie Draft now binds a release-specific withdrawal plan, but rollback verification remains null. Its machine-readable staging decision remains denied on five exact evidence blockers; the record was not advanced.
- Full verification and evidence are stored under `test_reports/cp-fitness-cycle-8/`.

## Cycle 9 verification

- ProductBrief v1 now records publisher/retrieval provenance, published/observed/evaluated timestamps, deterministic current/stale/not-time-sensitive classification, brand/reference constraints, and candidate-only truth limits. ProductCreationJob v2 embeds that validated brief and records on-demand or scheduled cadence plus timezone/expression.
- Binding CARLOPHILLIPS constraints and inspiration-only reference rules explicitly deny copying, inferred rights, and inferred product/media truth.
- Normalized input fingerprints plus idempotency keys suppress identical retries and equivalent duplicate jobs without mutating the accepted registry.
- The designer simulation is on-demand and first-party. The trend simulation is scheduled but uses a stale, local sanitized fixture with `research-only` authority; it cannot invoke external research and every restricted approval remains pending.
- Both modes still converge on the same Product Release Record, Media Registry, Commerce Gateway, PipelineRun schema, blocker isolation, and Product Owner approval core.
- Full verification and evidence are stored under `test_reports/cp-fitness-cycle-9/`.

## Cycle 10 verification

- The product route now resolves every Shopify observation against handle-matched Product Release Record and Media Registry evidence from a server-side release registry.
- Preview permits only evidence-complete Staged, Approved, or Released candidates for private non-commerce review. Production denies any state other than complete Released, and even a complete Released observation remains non-commerce until cart/checkout is directly proven.
- Missing, mismatched, withdrawn, or incomplete release evidence returns a denied decision with no product payload. Local fixture review remains explicitly labeled and non-commerce.
- Contract, policy, gateway, registry, transition, and component tests prove that a successful Shopify read cannot independently authorize customer visibility or purchasing.
- `yarn verify` passed with zero-warning lint, 21 files/150 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop/mobile PDP regression passed with explicit fixture/release labels, purchasing disabled, no console/page errors or error overlays, and no horizontal overflow. Evidence is stored under `test_reports/cp-fitness-cycle-10/`.

## Cycle 11 verification

- `/shop` and `/collections` no longer re-export the editorial home shell. Both use one reusable Server Component catalog boundary and derive candidates only from the Product Release Record registry.
- Every catalog candidate is resolved through the same Commerce Gateway, Product Release Record, Media Registry, and environment policy as its PDP. Local fixtures are labeled/non-commerce; Preview requires Staged-or-later Shopify evidence; production requires Released evidence.
- Catalog decisions expose truthful candidate, visible, and withheld counts. Denied/unavailable product payloads are discarded; tests prove a denied Draft title cannot appear in a mixed Preview decision.
- The Product Owner-observed 30-app inventory now has a schema-validated per-app disposition/access/authentication/fee-risk/next-action record. All callable surfaces remain unverified. CodexAutomation5, Shopify CLI Connector App, and Carlophillips Headless grant no inferred authority.
- The latest managed-browser audit reached Shopify login with Continue with Google and did not trigger OTP or reach Admin. The login tab is preserved as a handoff; safe local work continued.
- `yarn verify` passed with zero-warning lint, 24 files/169 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop `/shop`, mobile `/collections`, catalog-to-PDP, and credentials-disabled Preview empty-state checks passed with no console/page errors, overlays, or horizontal overflow. Evidence is stored under `test_reports/cp-fitness-cycle-11/`.

## Cycle 12 verification (historical; presentation superseded by the current correction)

- At Cycle 12, home stopped importing visibility flags or the Hoodie fixture in client code. Its server route consumed the exact shared catalog decision and passed only a schema-validated non-commerce summary into the then-active editorial shell.
- The home release section derives candidate/visible/withheld counts and its optional PDP review link from that summary. A denied or empty decision emits no product payload, title, or `/products/` link.
- At that point, About and Lookbook were editorial-only. Both routes and their shared shell are removed by the current correction.
- The obsolete client-owned collection/PDP implementations were removed at Cycle 12; `/shop`, `/collections`, and `/products/[handle]` remain the only owners of those flows.
- `yarn verify` passed with zero-warning lint, 27 files/179 tests, zero production advisories across 193 packages, and a successful 13-route build.
- The then-active desktop/mobile home, home-to-PDP/catalog, About, and credentials-disabled Preview checks passed. That evidence remains historical under `test_reports/cp-fitness-cycle-12/` and is not current visual proof.

## Cycle 13 verification

- Dormant `lib/data/products.js` and `lib/store/cart.js` paths were removed. They could return product data or perform browser cart mutations without the active Product Release Record and Commerce Gateway.
- The broad Storefront client/mutation exports were removed. Pure normalization remains transport-free; the active Shopify product adapter is server-only, read-only, and uses only server environment names.
- Public Shopify media-audit/readiness endpoints were retired because they exposed unfiltered catalog observations. Unknown commerce/API write routes now return `404 API_ROUTE_UNAVAILABLE`; health returns no Shopify configuration diagnostics.
- `cp.cart-activation-decision.v1` now requires a visible Shopify decision, matching Released record, an exact current/release variant-fingerprint match, sellable mapped variant, verified `cart-write` capability, scoped Product Owner approval, and a server-only activation gate. Local fixtures and stale variant observations are never eligible, and checkout is always separately disabled.
- PDP and bag routes consume the server activation decision. The current Hoodie remains Draft and every activation path remains non-commerce; no Shopify read/write, cart, checkout, payment, or order was attempted.
- Shopify normalization now preserves the product handle required for release-record matching.
- `yarn verify` passed with zero-warning lint, 27 files/184 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop PDP and mobile bag checks passed with explicit disabled states, no checkout links, console/page errors, overlays, or horizontal overflow. The retired media-audit API returned the expected 404. Evidence is stored under `test_reports/cp-fitness-cycle-13/`.

## Cycle 14 verification

- `cp.product-observation.v1` sanitizes raw Shopify variant references into hashes, canonicalizes variants/options with locale-independent ordering, and fingerprints stable variant identity separately from the complete review envelope.
- The variant fingerprint intentionally covers hashed reference, title, and options. Price/availability changes keep identity stable but change the full observation fingerprint, which binds schema/source/authority/environment/timestamp/capability evidence/product/variant facts.
- Observation creation rejects missing/duplicate raw variant references, empty variants, malformed price/currency, inconsistent price ranges/currencies, and availability-summary mismatches. Durable observations contain no raw Shopify IDs.
- Review recomputes the Cycle 14 variant and full-envelope fingerprints, rejects noncanonical/tampered/duplicate/malformed facts, and requires capability evidence exactly matching a ready `shopify-storefront-product-read` decision.
- Product Owner/designee approval must bind the exact observation fingerprint and expected handle. An accepted review returns only a schema-validated candidate release patch; no apply operation exists and tests prove Draft records remain unchanged.
- Fixture and simulation observations remain local, non-authoritative, unapprovable as Shopify truth, and incapable of producing a candidate patch.
- The server product loader initially attached sanitized pending-observation metadata. Cycle 15 retains the complete sanitized envelope server-side so runtime policy can recompute integrity without exposing raw Shopify references.
- `yarn verify` passed with zero-warning lint, 28 files/204 tests, zero production advisories across 193 packages, and a successful 13-route build. No UI changed, so existing Cycle 13 browser evidence remains applicable. Evidence is stored under `test_reports/cp-fitness-cycle-14/`.

## Cycle 15 verification

- Product Observation now has three explicit fingerprints: stable variant identity, canonical commerce facts, and the immutable complete review/audit envelope.
- The full observation fingerprint continues to bind timestamp, environment, capability evidence, product, and variants for exact approval. Runtime does not compare a fresh read against that historical instance fingerprint.
- Preview and production validate the complete fresh envelope, then compare its variant identity and commerce-facts fingerprints to reviewed Product Release Record bindings. Unchanged reads remain eligible across new timestamps and the correct runtime environment.
- Changed title, price, currency, availability, or variant facts are withheld. Variant identity mismatch has a distinct reason; malformed/tampered observations return no payload.
- Catalog resolution isolates stale and malformed candidates while preserving truthful counts and any other eligible product.
- The Hoodie Draft now explicitly records missing commerce-facts and full-observation review bindings. Staging has seven exact blockers and remains denied.
- `yarn verify` passed with zero-warning lint, 29 files/216 tests, zero production advisories across 193 packages, and a successful 13-route build. Evidence is stored under `test_reports/cp-fitness-cycle-15/`. No route presentation changed, so new browser capture was not required.

## Cycle 16 verification

- Media Registry assets now carry an explicit nullable Shopify storefront binding. A current approved binding hashes media identity, type, canonical URL, and preview URL plus durable evidence; raw Shopify media IDs/URLs are not persisted in the manifest.
- The server strips unapproved, unprovenance-bound, rights/quality-incomplete, duplicate, wrong-kind, stale-URL, and unregistered media individually before the product view model. Registry alt text and modality labels replace unreviewed Shopify presentation metadata.
- Preview may keep an otherwise eligible product visible with only its matched approved subset. The PDP exposes an explicit incomplete media-review state and remains non-commerce.
- Production denies the entire product if the current matched set does not cover every required non-waived modality or an approved motion/3D fallback. An unapproved extra is discarded without failing an otherwise complete approved set.
- The current Hoodie front candidate has no storefront binding and remains pending; the two unverified details remain quarantined. No live media or approval was invented.
- `yarn verify` passed with zero-warning lint, 30 files/231 tests, zero production advisories across 193 packages, and a successful 13-route build. Desktop/mobile local fixture PDP and home regression passed with no console warning/error, overlay, checkout link, or horizontal overflow; purchasing remained disabled. Full verification and browser evidence are stored under `test_reports/cp-fitness-cycle-16/`.

## Cycle 17 verification

- The canonical Product Observation now requires plain description, vendor, product type, derived tagline, and ordered details alongside title, price, currency, availability, and variants. All are included in commerce-facts and full-envelope fingerprints.
- Preview/production release products are constructed from the validated observation rather than by spreading the normalized Shopify adapter object. Only the current media array crosses that boundary, then immediately passes through the independent Media Registry filter.
- Outer title/name/description/vendor/type/tagline/details/story/HTML edits cannot replace reviewed presentation. A real change inside a fresh observation produces `PRODUCT_COMMERCE_FACTS_STALE`, withholds the entire product payload, and requires a newly reviewed and separately applied binding.
- Shopify `descriptionHtml`, raw product IDs, raw variant mappings, and arbitrary outer fields are absent from the release product. The plain description remains React-escaped presentation data.
- View-model and PDP status copy derives from source, environment, and release reason. Preview is private review; production Released says product facts are released while purchasing remains separately disabled. A neutral unavailable story replaces both outer story text and the former false pending-approval fallback.
- Focused verification passed with zero-warning lint and 10 files/124 tests. Full `yarn verify` passed with 30 files/246 tests, zero production advisories across 193 packages, and a successful 13-route build. Fresh desktop/mobile PDP and home regression found no console warning/error, overlay, checkout link, or horizontal overflow; purchasing remained disabled. Evidence is under `test_reports/cp-fitness-cycle-17/`.

## Cycle 18 verification

- Shopify-backed PDP option review now uses exact sanitized variant combinations rather than independently flattened color and size lists. Each combination retains canonical selected dimensions, current availability, and reviewed price/currency.
- `cp.variant-presentation.v1` binds the current/release variant fingerprint and product currency, requires one canonical non-empty unique option-name schema, and rejects duplicate signatures/references, missing or extra dimensions, non-canonical order, malformed price/currency, and authority flags.
- The release whitelist constructs this presentation from the validated Product Observation. Injected outer `shopifyVariants` or `variantPresentation` objects are discarded.
- Every combination is disabled review information. The view contains no add-to-cart or checkout action, and opaque reference hashes are not displayed.
- Cart activation now separates the available reviewed-combination gate from an eighth evidence-backed server-only resolver gate. No resolver is currently wired, so a hash or raw outer mapping cannot become mutation authority.
- Product Owner reconfirmed the existing 30-app Shopify inventory and reported a logged-in Product Owner browser. This remains reported-installed evidence only: the agent's Admin/Storefront/custom-app/CLI/app-private access is unverified. The durable audit now defines one narrow CP Admin/Storefront connector path plus only selected Apliiq/media/workflow access, records duplicate groups and usage-fee exposure, and preserves exact human authentication/approval gates.
- Focused verification passed across 10 files/155 tests. Full `yarn verify`
  passed with zero-warning lint, 31 files/276 tests, zero production
  advisories across 193 packages, and a successful 13-route Next.js 15.5.21
  build. Direct desktop PDP plus a temporary localhost-only 390×844 responsive
  frame passed with meaningful fixture content, purchasing disabled, no
  add/cart/checkout action, no error overlay, and no horizontal overflow.
  Collection and home navigation also passed. The selected in-app browser had
  no viewport override, so the temporary proxy stripped framing headers only
  from copied local responses; it was stopped and is absent from the final
  repository diff.

## Cycle 19 verification

- `cp.variant-resolution-decision.v1` defines sanitized readiness evidence for
  the eighth cart gate. The evaluator requires exact environment, handle,
  current/release fingerprint, an evidence-bound Storefront product-read
  decision, and the locally verified CP resolver implementation.
- The resolver re-creates the canonical Product Observation from fresh
  server-ephemeral raw variants and proves every reviewed opaque hash has one
  current match. Changed identity, changed facts, duplicates, missing variants,
  evidence mismatch, wrong surface, wrong handle, and wrong environment fail
  closed.
- Registry `local` means the deterministic implementation is locally proven;
  decision `server_only` means runtime containment. The upstream server-only
  Storefront loader necessarily sees raw references first. The new wrapper is
  only the sole production entry for readiness computation.
- The readiness decision returns no raw ID or selected mutation target and
  explicitly denies cart mutation and checkout. The obsolete flattened
  `shopifyVariants` and first-variant shortcuts were removed from product
  normalization.
- A real production readiness decision passes cart gate 6 only when every
  exact schema field is intact. Public routes, views, activation summaries,
  and durable decision evidence contain no raw reference.
- Cart activation remains intentionally unwired with
  `variantResolverDecision: null`; no Shopify read/write, selection, cart,
  checkout, order, or other external action was performed.
- Focused verification passed across 6 files/98 tests with zero-warning lint.
  Full `yarn verify` passed with zero-warning lint, 32 files/308 tests, zero
  production advisories across 193 packages, and a successful 13-route
  Next.js 15.5.21 build. No customer-visible route changed, so Cycle 18 remains
  the current browser-regression evidence.

## Production cutover verification — 2026-08-03

- Canonical PR #3 merged the production-aligned storefront and PostCSS security patch to `main` as `85b6f8f`.
- A production deployment built from that exact merge commit and reached READY on the working Vercel team.
- The stale `www.carlophillips.com` binding was removed from the disabled legacy project, then both apex and `www` were bound to the new production deployment. The temporary redirect loop was eliminated.
- HTTP checks passed for `/`, `/shop`, `/products/signature-hoodie`, and `/bag`; apex redirects once to `www`.
- Direct desktop and mobile browser checks passed. At 390×844 the document width equals the viewport width and no product image is broken. Screenshots and the concise record are under `test_reports/cp-production-cutover-2026-08-03/`.
- This proves hosting and the approved visual direction, not live Shopify commerce. Product, cart, checkout, payment, and fulfillment remain fail-closed pending authenticated Shopify evidence and credentials.
- The misleading permanent `carlophillips-preview.vercel.app` project alias and obsolete legacy `staging.carlophillips.com` binding were removed. Staging evidence uses immutable temporary-branch Preview deployment URLs only.

## External blockers

### Authenticated Shopify POC audit — 2026-08-04

- The in-app Shopify Admin session is authenticated. A read-only audit observed 33 installed apps, the Draft `CARLOPHILLIPS Signature Hoodie`, the active native Headless storefront connection, app permission surfaces, selected dashboards, and current billing boundaries without exposing secrets or changing Shopify.
- The minimum POC stack is Apliiq for Hoodie POD, Modelize for reviewed still imagery, one provisional spin worker (Spin Studio), native Shopify Headless for Next.js commerce truth, Flow for an approval gate, and the CP Next.js storefront for presentation.
- Apliiq authenticated read-only access and saved-product facts are evidenced, but exact variant/SKU mapping is still unbound; Modelize has used 3/3 free images but contains three completed Hoodie outputs; Spin Studio is disabled and has no Hoodie spin; ZS-Spin-View/MyDesigns request new theme permissions; the CP Flow exists but is inactive.
- Native Shopify Headless, not the broken `Carlophillips Headless` custom app or embedded Codex/CLI/Claude connector shells, is the supported storefront path.
- Follow-through proved exactly where the Modelize allowance went: one Auto Mode job (`#137843f7`) generated three Signature Hoodie images from one reference at 2026-07-11 16:16; all three remain unpublished.
- Spin Studio is inactive because its required Online Store theme app embed is off. Its documented default installation targets a Shopify theme and replaces a product-gallery image; no export, API, or CP Next.js integration was exposed, so enabling the embed would not activate 360 media on the headless storefront.
- Shopify Agentic is a future sales channel, not an agent-control surface. Shopify reports Agentic Storefronts unavailable, ChatGPT/Copilot/other channels inactive, and zero products in Shopify Catalog.
- The existing native Headless storefront has a usable public Storefront credential and checked product-listing/checkouts scopes. A secret-free live query returned HTTP 200 with no GraphQL errors and correctly withheld the Signature Hoodie because it is Draft. No credential was persisted, rotated, or recorded.
- Shopify Basic is $39/month. The upcoming bill was $0 at observation time. Modelize generation and several usage-fee apps remain cost-gated.
- Full evidence, screenshots, app dispositions, blockers, and the exact POC sequence are in `test_reports/cp-shopify-audit-2026-08-04/audit-report.md`.

### Read-only Shopify configuration

Human action: an authorized owner supplies valid read-only Storefront domain/token values to the intended local or Preview environment without sharing them in reports.

Resume point: mark `shopify-storefront-product-read` ready only with its durable evidence reference, set `COMMERCE_DATA_MODE=shopify`, generate the sanitized product observation, and review approval against its exact full fingerprint/handle. The accepted patch binds variant identity, commerce facts, full audit fingerprint, and review evidence. Keep it unapplied until separate authorization, and keep purchasing disabled.

### Shopify app capability/access audit

Observed blocker: Shopify Admin and Apliiq are authenticated read-only. Apliiq saved product `5958463` is evidenced as `IND4000`, black, front embroidery, with the retained artwork; the exact provider variant/SKU fingerprint remains unbound. Modelize requires a plan for new generations. Spin Studio's theme embed is disabled and a headless/export path is unproven.

Human action: inspect and record the exact Apliiq provider variant/SKU mapping fingerprint without changing configuration, then obtain the exact one-sample quote. Approve that named item, size, destination, and total separately before any order. Approve any Modelize spend, Flow activation, spin configuration, Shopify write/publication, Preview deployment, merge, or Production action separately.

Resume point: bind the exact Hoodie provider variant/SKU fingerprint to the release evidence, then quote/order/inspect one exact physical sample only after separate approval. The native Headless credential is callable, but the Draft Hoodie is intentionally unavailable to Storefront API; obtain an explicit controlled publication/channel decision before any Shopify write, then bind reviewed Shopify/POD/media evidence before generating a Vercel Preview.

### Production and commerce operations

Human action: separately approve any future Shopify catalog mutation or checkout/order test with operational impact. Future merges and production promotions must continue through reviewed temporary-branch evidence.

Resume point: execute only the specifically approved action, capture evidence without secrets/customer data, then update this status.

## Canonical release-proof binding and live authority recheck — 2026-08-14

- The Product Release Record now models provider-mapping truth and an exact physical sample independently. Approval requires immutable delivery/inspection and sample-approval evidence plus verified fit, colour, artwork placement, and finish; the current Hoodie remains `not_ordered` with no evidence invented.
- Observation review, build, staging, rollback, sample, and Production-capability evidence are structured SHA-256 descriptors bound to the exact release and candidate commit. The media manifest and complete candidate truth envelope have separate fingerprints. Product, media, and fulfillment approvals must target the derived release-evidence fingerprint.
- Staging and approval reject missing, altered, cross-release, cross-candidate, or stale evidence. Release additionally requires a fresh post-approval Production ACTIVE observation whose current variant identity and commerce facts match the reviewed bindings; the new full observation fingerprint remains separate audit evidence, consistent with legitimate timestamped fresh reads.
- The Admin Releases screen exposes nine explicit proof gates. Every reviewer page distinguishes `Release: Draft` from `System: Not end-to-end ready`.
- Capability blockers were reconciled to authenticated evidence: Apliiq read-only access and saved-product facts are proven, while the exact variant/SKU fingerprint and physical sample remain gated; Modelize is credit/physical-truth gated; Spin lacks genuine source/headless proof; Flow is inactive/unapproved; MyDesigns requires new permission/selection; trend research requires an approved research/cost boundary. No connector mutation became callable.
- Full `yarn verify` passed with zero-warning lint, 43 files / 433 tests, zero production vulnerabilities across 55 packages, and a successful Next.js 15.5.21 build. Headless QA passed 669/669 findings with 61 screenshots; offscreen desktop/mobile inspection found no clipping or misleading control. Eight public desktop/mobile route captures are byte-identical to the prior baseline with zero changed pixels.
- Fresh read-only Git/Vercel/HTTP evidence confirms `origin/main` at `cd1cd77`, the latest READY Preview at `f82733c`, and READY Production at `bb9568f`; neither contains this local containment branch. The live PDP still returns `action="/api/checkout"` and `Continue to checkout`, so Production remains NO-GO and the sticky containment handoff remains active.
- Exact clean implementation commit `98a23f2` passed the same full source and browser gates; its machine-readable run is marked `exact-clean-commit`. Evidence: `test_reports/cp-release-binding-truth-2026-08-14/` and `test_reports/cp-live-authority-recheck-2026-08-14/report.md`. No external state changed.

## Token-governed storefront cleanup candidate — 2026-08-15

- The customer-facing optional-analytics prompt and its inactive component were removed; optional analytics remains disconnected and policy surfaces state that no analytics choice is requested or stored.
- The menu now exposes merchandise categories only: Hoodies, T-Shirts, Shirts, Outerwear, Trousers, and Accessories. Preview-only production/commerce labels were removed without granting product-link, gallery, cart, or checkout authority.
- Hoodie copy is de-emphasized exclusively through semantic/component tokens. `yarn lint` now runs a dedicated design-system gate that rejects raw colours, visual properties, spacing, radius, typography, and non-token inline styling across active app/component sources.
- Full verification passes: 44/44 files and 475/475 tests, zero production vulnerabilities across 67 audited packages, and an optimized Next.js 15.5.21 build. Background headless QA passes 21/21 route/viewport checks plus 14/14 WCAG route/viewport audits. Nine exact-dimension screenshot comparisons document only the requested consent, menu, label, and copy-emphasis changes under `test_reports/cp-ui-token-cleanup-2026-08-15/`.
- The Product Owner Theme read path and remote fail-closed write boundary remain healthy. The GitHub proposal adapter is not connected: no reviewed runtime GitHub App can yet create the restricted `codex/*` branch, single-file `theme.json` commit, and draft PR. Remote Save therefore remains disabled and creates no commit, PR, merge, or publication.

### Product Owner visual refinement — 2026-08-16

- The merchandise-menu scale is reduced through its primitive typography token; `ONE` is increased by 2 px and its description reduced by 1 px through primitive → semantic → component token bindings.
- The duplicated category rail below the Hoodie runway is removed because those destinations now live in the hamburger menu. Its component CSS and newly dormant tokens are removed rather than hidden.
- Product Owner follow-up increases `ONE` by another 2 px through the same semantic token and restores the existing twelve-asset Preview media explorer. The closed-page QA now explicitly rejects category links outside the hamburger dialog; every media slide retains its Preview disclosure and grants no commerce authority.
- Full verification remains green at 44/44 files and 475/475 tests, zero production vulnerabilities across 67 audited packages, and a successful Next.js 15.5.21 build.
- Background QA passes 3/3 viewports and 21/21 route checks with exact menu labels, no clipping or overflow, decoded Hoodie media, restored keyboard focus, and zero console/request failures. Six prior/current screenshot pairs are retained under `test_reports/cp-chapter-one-closure-2026-08-16/`.
- Purchasing is the required final customer state, but is not activated by these visual changes. The Hoodie remains Draft and cart/checkout/payment still require the release-bound Shopify, variant, fulfillment, controlled-order, and Product Owner activation evidence already listed in the commerce gates.

### Product Owner Hoodie editorial-reference correction — 2026-08-16

- The supplied 1440×1000 reference is now the Hoodie runway composition target: the product caption begins at the upper-left editorial grid, `ONE` uses a 96 px wide-screen token, descriptive copy uses the brighter 18.4 px body token, and the media explorer aligns at the upper right.
- Flat feature chips are replaced by structured design-system fact components: `Color / Black`, `Material / Structured fleece`, and `Feel / Heavyweight, soft interior`. Layout, typography, colour, border, spacing, and wide-screen media position all resolve through primitive → semantic → component tokens; no page-level visual value was hardcoded.
- The wide-screen runway asset is lowered through responsive motion tokens to match the supplied model crop while tablet and mobile retain their fitted composition. Reduced-motion rendering uses the same canonical position.
- Full verification is green: zero-warning design-system/ESLint checks, 44/44 files and 475/475 tests, zero production dependency vulnerabilities across 67 packages, and a successful Next.js 15.5.21 build.
- Background headless QA passes 3 viewports × 7 public routes with exact structured facts, expected 96 px desktop title geometry, decoded media, no overflow/clipping, restored keyboard focus, and no console or request failures. Accepted screenshots are under `test_reports/cp-runway-reference-correction-accepted-v2-2026-08-16/`.

### Product Owner Motion Study controls — 2026-08-16

- The media viewer's existing Motion Study component now has deterministic Jump → Pause → Play behavior. A jump survives the token-governed smooth-scroll transition; navigating away stops playback.
- Pausing swaps the animated asset for its canonical first-frame poster, and the requested motion-slide footer caption is omitted while the registry retains its provenance metadata.
- Design-system lint, 44 files / 475 tests, zero production dependency vulnerabilities across 67 packages, and the optimized Next.js build pass.
- Background headless QA passes the three transitions at desktop, tablet, and mobile widths with no overflow, console errors, or request failures. Playing and paused screenshots are retained under `test_reports/cp-media-motion-controls-2026-08-16/`.

### Shopify test checkout and Apliiq handoff — 2026-08-17

- Product Owner approval was consumed for exactly one Shopify Payments test-mode order.
- Shopify order #1002 proves hosted checkout → test payment → Paid/Unfulfilled order creation for the Signature Hoodie `black / xs`, SKU `APQ-5958463S5A1`, total USD $136.20.
- Apliiq received store order 1002 in Pending orders while automatic processing was off. The matching pending fulfillment was removed before manufacturing or a fulfillment-card charge.
- Sanitized facts and screenshots are retained under `test_reports/cp-end-to-end-commerce-2026-08-17/`. Apliiq's final screenshot timed out at the vendor page; its rendered post-removal text was verified and records that no unprocessed orders remain.
- This proves the controlled test path only. Live customer payments, Production checkout activation, paid fulfillment, tracking, delivery, support, returns/refunds, and Product Release Record release remain fail-closed and unproven.

### Release-bound Production checkout pipeline — 2026-08-17

- The Vercel release-candidate and Production workflows now have an explicit, reviewed checkout mode. An enabled candidate is permitted only when the exact full commit SHA has a `Released` Product Release Record, complete release evidence, operational `cart-write` capability, and matching Product Owner Production cart/checkout approvals.
- The same workflows continue to build a distinct fail-closed fallback. Candidate and fallback receipts bind their separate checkout states; the fallback can never enable checkout.
- Production promotion re-runs the release preflight and rejects candidate-receipt tampering, stale SHA/release bindings, and enabled-checkout drift. Route smoke checks require a checkout form only for a reviewed enabled candidate and require the fallback to remain visibly disabled.
- The current Signature Hoodie correctly fails preflight: it remains Draft and still lacks the physical-sample, fulfillment, Shopify fingerprint, media, approval, current Production observation, rollback, and operational-cart evidence required for release.
- Full verification passes: design-system and ESLint checks, 48/48 files and 501/501 tests, zero production dependency vulnerabilities across 67 packages, and the optimized Next.js 15.5.21 build.
- Background production-mode browser QA passes at 1440×1000 and 390×844: HTTP 200, visible purchasing denial, zero checkout controls, no overflow/runtime overlay/console/page errors. Screenshot comparison against the prior accepted fail-closed baseline shows only sub-threshold rendering variance (0.029% desktop; 0.065% mobile).
- No branch push, PR update, merge, Vercel deployment, Shopify mutation, real payment, order, or fulfillment occurred. Real charging remains off.
- A fresh authenticated, read-only Apliiq observation also bound all nine current IND4000 black Hoodie SKUs plus the exact front 2×2-inch, 648-stitch embroidery configuration to the release. The provider variant fingerprint is now observed and the reviewed full mapping fingerprint is refreshed; the physical sample remains `not_ordered`.
- A fresh read-only Shopify-native product JSON observation now captures all nine available black variants, USD $128–$134 pricing, customer copy, vendor/type, and opaque identity/facts/full-observation fingerprints without retaining raw Shopify or provider references. It remains candidate evidence pending Product Owner approval of exact fingerprint `sha256:143a817c9a1d8898faeaee2aa81e05ccc05153f9dfa3ae9497411c44c1cf47f4`.
- Candidate source `acd2a0b80d3be24234c41827c35e669c6ad39742`, its passing build/browser evidence, the exact Media Registry manifest fingerprint, and the release-specific rollback plan are now bound. Staging evidence is still absent because the exact candidate has not been pushed or deployed.
- Post-capture verification of the observation adapter/evidence tooling passes design-system and zero-warning ESLint checks, 49/49 files and 507/507 tests, and the optimized Next.js 15.5.21 build; dependency inputs remain unchanged from the zero-vulnerability audit.

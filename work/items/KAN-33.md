# KAN-33 — Accept project-scoped Vercel credentials without weakening the deployment gate

Owner of this document: Pushpa (product definition, acceptance, UAT)
Written 2026-09-24. Workflow unit: PO_DEFINE.

## Evidence status and boundary

Reported to Pushpa by Sushma/The Hand and accepted as the governed defect context:

- The protected staging workflow validates `VERCEL_TOKEN` by calling Vercel's
  user-profile endpoint before checking the configured project.
- The Boss supplied a Vercel token scoped to the Cubiqo `carlophillips` project.
- Vercel's current token contract permits a project-scoped token to use the CLI
  and REST API for that project, while user-level and team-level resources are
  outside that token's scope.
- The prior protected run failed at the user-profile call with
  `VERCEL_USER_AUTH_FAILED_404`; it never reached build or deployment.

Pushpa has not handled, read, or inspected the credential value. No credential
value belongs in this artifact or its evidence.

This document defines expected behaviour only. Endpoint choice, response
parsing, script structure, and test implementation belong to Aarti's ADR.

## Product rule

**R-KAN33-1.** A Vercel credential is acceptable for the staging release lane
when it can authenticate to Vercel and access the one configured Vercel project
the lane is authorised to deploy. Access to a Vercel user profile, account-wide
resources, unrelated teams, or unrelated projects is not required and must not
be used as a proxy for deployability.

**R-KAN33-2.** The credential gate remains fail-closed. It must reject an absent,
empty, malformed, expired, revoked, or wrong-project credential before expensive
verification, build, deployment, alias mutation, receipt generation, or UAT.

**R-KAN33-3.** Passing credential validation proves only access to the configured
project. It does not prove a deployment occurred, an alias moved, regression
passed, or UAT passed; those existing gates remain separate and unchanged.

**R-KAN33-4.** The validator and its evidence must never expose the token or a
useful fragment of it. A failure may identify the failed capability and the
configured project identifier, but not secret material.

## Acceptance criteria

- **AC-KAN33-1 — valid project scope passes.** Given a valid token scoped only to
  the configured `VERCEL_PROJECT_ID`, credential validation succeeds even when
  that token cannot read Vercel user-profile or team-level resources.
  Evidence: automated test of the project-scoped response contract plus one
  protected staging run reaching the next workflow step.

- **AC-KAN33-2 — project identity is asserted.** Success requires the Vercel
  resource returned by the authoritative project-access check to identify the
  exact configured `VERCEL_PROJECT_ID`. A successful response for a different
  project is a failure.
  Evidence: positive exact-match test and wrong-project negative test.

- **AC-KAN33-3 — no user-profile dependency.** The validation path does not call,
  require, or infer success from a user-profile endpoint. A project-scoped token
  denied user-profile access remains eligible to pass AC-KAN33-1 and AC-KAN33-2.
  Evidence: test that fails if a user-profile request is attempted.

- **AC-KAN33-4 — no team-profile dependency.** Validation does not require access
  to a team listing or team profile. Project access may be checked using the
  configured project identifier and the token's own scope; lack of broader team
  access is not itself a failure.
  Evidence: project-scoped fixture with team/account endpoints denied.

- **AC-KAN33-5 — missing token fails before side effects.** An unset or empty
  `VERCEL_TOKEN` fails with a stable, capability-specific error before build,
  deploy, alias, receipt, or UAT steps execute.
  Evidence: negative workflow/script test with all downstream side effects
  asserted absent.

- **AC-KAN33-6 — invalid or expired token fails before side effects.** A token
  Vercel rejects for authentication fails closed before every downstream side
  effect named in AC-KAN33-5.
  Evidence: rejected-auth fixture and downstream non-execution assertions.

- **AC-KAN33-7 — wrong-project token fails before side effects.** A valid Vercel
  token that cannot access the configured project, or can access only a different
  project, fails closed before every downstream side effect named in AC-KAN33-5.
  Evidence: inaccessible-project and mismatched-project fixtures.

- **AC-KAN33-8 — transient or malformed responses do not pass.** Network errors,
  timeouts, non-success status codes, malformed JSON, and responses without an
  exact project identity all fail closed; none are rounded to success.
  Evidence: one automated negative test per response class.

- **AC-KAN33-9 — secret-safe diagnostics.** Test output and a protected staging
  run log contain no token and no reusable token fragment. Diagnostics state the
  capability that failed and distinguish authentication failure, configured-
  project denial, project mismatch, and invalid response.
  Evidence: log redaction assertion plus review of the protected run log.

- **AC-KAN33-10 — existing release controls survive.** The change does not bypass
  exact-SHA/release-tuple checks, protected Staging environment gates or timers,
  `cleanup=false`, `update_visual_baselines=false`, build/regression, immutable
  receipt verification, or Pushpa UAT. Production remains untouched.
  Evidence: workflow diff review and protected staging run record.

- **AC-KAN33-11 — staging proof is end-to-end.** The item is not accepted merely
  because the validator unit tests pass. The exact approved staging commit must
  pass credential validation, build, deploy, alias verification, full regression,
  and immutable receipt verification before it reaches Pushpa UAT.
  Evidence: one run URL/id tied to the exact SHA and release id, with every named
  stage green and the receipt retained.

- **AC-KAN33-12 — UAT gate remains independent.** Pushpa signs off only after the
  deployed staging artifact and receipt identify the exact approved SHA and the
  governed staging regression is green. A validator pass alone cannot satisfy
  UAT or close KAN-33.
  Evidence: dated Pushpa UAT signal referencing the run, deployment, receipt, and
  regression evidence.

## Edge and negative cases

1. Token is valid but scoped to an unrelated project: fail.
2. Token accesses the configured project but receives 403/404 from `/v2/user`:
   pass credential validation; the profile result is irrelevant and should not
   be requested.
3. Token authenticates but the project response names a different id: fail.
4. Token authenticates and the project response omits identity: fail.
5. Project response is cached, stale, malformed, or timed out: fail; never reuse
   a prior run's success.
6. Error output accidentally includes an Authorization header or token fragment:
   fail the test suite and do not retain or publish that log.
7. Credential check passes but deployment later fails: KAN-33's validator
   behaviour may be correct, but staging/UAT remains not green and the release
   stays open.

## PO_DEFINE disposition

READY_FOR_RCA. The expected behaviour is now unambiguous: validate the capability
the release actually needs — access to the exact configured project — and retain
fail-closed handling for every missing, invalid, ambiguous, or wrong-project
case. Aarti owns root-cause confirmation, the ADR, implementation, and technical
tests. Pushpa returns for product-fit on the ADR and for staging UAT only.

---

## Revision 2 — 2026-09-25: full-pipeline credential ruling after protected run 36098244788

### New verified boundary

The original definition described the REST validator correctly but described the
release credential too narrowly.

- Run `36098244788` proved the repaired exact-project REST validator works: it
  passed against the project-scoped token, and repository verification passed.
- The same protected run then failed at pinned Vercel CLI `56.1.0` during
  `vercel pull --scope`, because the CLI loads `/v2/user` while resolving its
  user/team context.
- Aarti's follow-on RCA against primary CLI source found that removing `--scope`
  or pre-linking does not remove the dependency: `pull`, `deploy`, `inspect`, and
  `alias` still resolve team/org context. The latest CLI available in the RCA
  provides no evidence that a project-only token can execute the approved
  prebuilt release pipeline.
- Replacing those CLI operations with raw REST calls is not a credential repair.
  It is a different release architecture and would require a new ADR, build,
  regression plan, rollback plan, and release proof.

The protected run therefore disproves **AC-KAN33-1 as a credential requirement
for the complete pipeline**. It does not disprove the exact-project validator or
its tests; those are useful fail-closed controls, but they cannot by themselves
prove the CLI can execute.

### Product ruling

**R-KAN33-1 is amended.** The staging release credential MUST use the least-
privilege credential class that the complete approved Vercel CLI pipeline
actually supports. For the current pipeline, that class is a **team-scoped
classic Vercel token for the exact Cubiqo team that owns the configured
`VERCEL_PROJECT_ID`**. A project-only token is insufficient for this pipeline and
must not be represented as release-capable merely because the REST preflight
passes.

The larger raw-REST deployment redesign is **not authorised under KAN-33**. The
release architecture remains the approved prebuilt Vercel CLI path. If a future
item proposes removing the team-scoped credential requirement, it must treat the
REST rewrite as a new architecture and pass the full governed ADR/build/staging
sequence independently.

### Amended acceptance criteria

- **AC-KAN33-1A — supported credential class.** The protected Staging
  `VERCEL_TOKEN` is a classic token scoped to the exact configured Cubiqo team,
  and the full pinned-CLI pipeline can use it. A project-only token is not an
  acceptable production-like release credential for this pipeline.
- **AC-KAN33-1B — exact project remains mandatory.** The repaired REST preflight
  must still retrieve and exactly match `VERCEL_PROJECT_ID`. Team-level access
  does not permit deploying an arbitrary project, and a broad account/team check
  cannot replace the exact-project assertion.
- **AC-KAN33-3A — user lookup is an operational dependency, not the acceptance
  target.** The custom validator must not reintroduce `/v2/user`; however, the
  Vercel CLI may perform the user/team resolution its supported pipeline
  requires. The credential is accepted only when the subsequent CLI operations
  actually succeed.
- **AC-KAN33-4A — team context is constrained.** The configured
  `VERCEL_ORG_ID`/scope must identify the exact team that owns the configured
  project. A token capable of resolving an unrelated team, without access to the
  exact configured project, fails under AC-KAN33-1B.
- **AC-KAN33-13 — no architecture substitution.** KAN-33 may change the
  credential class and retain the repaired REST preflight; it may not replace
  `vercel pull`, prebuilt build/deploy, inspect, or alias operations with raw REST
  implementations.
- **AC-KAN33-14 — protected containment.** The token remains only in the protected
  Staging environment secret, is never printed or persisted in an artifact, and
  receives no production use under this item. Rotation/expiry follows the
  credential record without recording the value.
- **AC-KAN33-15 — operational proof supersedes preflight proof.** Acceptance now
  requires one fresh protected run in which exact-project REST validation,
  `vercel pull`, prebuilt build/deploy, inspect, alias, regression, immutable
  receipt, and Pushpa UAT all succeed for the exact approved SHA. A green REST
  preflight followed by CLI failure is a failed KAN-33 run.

All original criteria remain in force except where explicitly amended above:
AC-KAN33-1 is replaced by AC-KAN33-1A/1B; AC-KAN33-3 and AC-KAN33-4 continue to
govern the custom validator but no longer prohibit the Vercel CLI's own required
user/team resolution. AC-KAN33-2 and AC-KAN33-5..12 remain unchanged.

### SOLUTION_CONSENSUS revision

**APPROVED:** retain ADR-0004's exact-project REST validator as the first
fail-closed check, keep the approved prebuilt Vercel CLI release architecture,
and use the least-privilege supported credential class: an exact-team-scoped
classic token. **NOT APPROVED:** a raw REST rewrite of pull/deploy/inspect/alias
under KAN-33.

This ruling changes credential acceptance, not code architecture. No production
action is authorised. Pushpa returns for UAT only after AC-KAN33-15 is green.

## Boss override — 2026-09-25: Staging environment protection

Boss removed the Staging environment wait timer and required reviewers. The
custom deployment branch restriction remains mandatory and must allow only the
exact `staging` branch. The protected workflow guard must enforce that remaining
live policy and must not fail on the deliberately removed reviewer or timer
rules. Existing exact merged-staging SHA, pull-request, release, credential,
regression, receipt, and UAT controls remain unchanged. Production is excluded.

---

## Revision 4 — 2026-09-25: catalogue-derived release regression

Protected run `36104034451` deployed and aliased exact SHA `7f2ab90`. The
credential preflight, Vercel CLI pull/build/deploy/inspect/alias sequence, and
webhook probe passed with destructive catalogue cleanup `false`. Regression
failed at all seven widths because it required stale fixed strings
`CATEGORIES / 2 GROUPS` and `TSHIRTS 1 PIECE` while authoritative Staging
presented one current `HOODIES` group.

**R-KAN33-5.** Release regression must assert category navigation, counts,
labels, and product totals from the catalogue projection used by the deployed
storefront. It must not require an obsolete category or product, while the
current Signature Hoodie path remains explicit.

- **AC-KAN33-16:** the rendered `CATEGORIES / <n> group(s)` count and grammar
  match the rendered catalogue projection at all seven governed widths.
- **AC-KAN33-17:** every projected navigable category is rendered exactly once,
  with no assertion for `TSHIRTS` when that group is absent.
- **AC-KAN33-18:** duplicate, padded, retained, or otherwise phantom categories
  fail regression.
- **AC-KAN33-19:** the current catalogue renders `HOODIES` and the Signature
  Hoodie at all seven widths.
- **AC-KAN33-20:** the Signature Hoodie exposes exactly S, M, and L as selectable
  storefront sizes.
- **AC-KAN33-21:** at least one Hoodie size can be added to a bag that preserves
  product identity, size, quantity, and authoritative price without a stale
  T-shirt line or zero/null fallback.
- **AC-KAN33-22:** checkout produces the approved Shopify handoff without
  completing payment, fulfilment, or dispatch.
- **AC-KAN33-23:** projection, Hoodie presence, navigation reachability, and
  absence of stale T-shirt copy pass at all seven widths. Shared bag/checkout
  behaviour may run once at the designated interaction width.
- **AC-KAN33-24:** fresh evidence records its run, exact SHA, deployed Staging
  identity, catalogue projection/fixture identity, and per-width result. A
  screenshot-only baseline update is insufficient.

The release remains **UAT NOT READY** until a fresh run is green. Visual baseline
updates remain `false`; no Production action is authorised.

## Revision 5 — 2026-09-25: mobile product-selected visual verdict

### Evidence inspected

- Protected run `36105632777`, exact SHA
  `4f872d52a89058909a4a50e92286278b1f09cf7f`.
- Preserved artifact `10851710162`, digest
  `sha256:818c2a08202355cd9c598029c8c7e9afe037e0029584df1b1f54d87ad45811ce`.
- Expected, actual, and diff images for `staging-product-selected` at mobile
  widths 320, 360, 390, and 430.
- Live staging `/product/carlophillips-signature-hoodie` independently rendered
  at those four widths and compared with the artifact actuals.

Artifact dimensions confirm 320 is unchanged at 320×2649. The other actuals are
21 px taller than their baselines: 360×2630 vs 360×2609, 390×2635 vs 390×2614,
and 430×2638 vs 430×2617. The diffs are not an unexplained 21 px spacer. They
show a mixed content change across the purchase panel:

- price and bag price changed from `$128` to `$128.00`;
- price moved before the short description;
- purchase-support copy changed from the baseline's generic checkout wording to
  `Free shipping on eligible orders · Returns accepted — see policy`;
- the downstream vertical displacement is a consequence of those upstream text
  and ordering changes, while the editorial image, gallery, product story, and
  facts remain visually coherent.

Live staging reproduces the artifact's current composition. Across all four
widths, the title, price, S/M/L controls, quantity, add-to-bag control, image,
gallery CTA, product story, colour, sizes, availability, and checkout fact are
readable with no horizontal overflow, clipping, overlap, or unreachable control.

### Product verdict

**CURRENT MOBILE PRESENTATION: NOT APPROVED AS A NEW BASELINE.**

The responsive layout is product-fit, and two-fraction money (`$128.00`) is the
approved KAN-29 behaviour. Those facts do not make the composite screenshot
acceptable. The current purchase-support copy is explicitly unapproved product
copy: `Free shipping on eligible orders` makes an undefined eligibility promise,
and `Returns accepted — see policy` makes a returns promise without the approved
linked policy treatment. CP-COPY-001 and the KAN-14 signal reject that text; the
current interim rule is silence rather than an unsupported promise.

The 21 px increase is therefore not independently approved or rejected as a
height. Height is an outcome, not the product rule. The intended final height
must be established by a fresh capture after the purchase-support copy is brought
back into the approved policy state. Updating baselines now would ratify a known
content defect and hide it inside a visual acceptance operation.

### Acceptance correction

- **AC-KAN33-25 — mixed visual change cannot be bulk-approved.** Intended money
  formatting and responsive stability may pass while unapproved copy fails. The
  screenshot is accepted only when every visible product assertion is approved.
- **AC-KAN33-26 — purchase-support copy gate.** The product-selected state must
  contain either the approved linked shipping/returns treatment with its actual
  policy targets available, or the governed interim silence. It must not render
  `Free shipping on eligible orders · Returns accepted — see policy` as plain,
  unsupported text.
- **AC-KAN33-27 — mobile integrity.** At 320/360/390/430, the final state must keep
  title, two-fraction price, S/M/L, quantity, bag CTA, size guide, checkout
  assurance, image, gallery, product story and product facts readable and
  operable without horizontal overflow, clipping, overlap, or hidden controls.
- **AC-KAN33-28 — baseline update gate.** Baseline changes remain prohibited until
  AC-KAN33-26/27 pass on live staging and Pushpa inspects the fresh expected,
  actual, and diff set. A lower diff ratio or matching height alone is not
  approval.

KAN-33 remains **UAT NOT READY**. This verdict authorises no baseline mutation,
production action, policy publication, or financial operation. Sushma subsequently
approved the narrow implementation boundary: governed interim silence only,
preserving two-fraction money and all unrelated presentation.

## Revision 6 — 2026-09-25: corrected interim-silence visual approval

### Evidence inspected

- Protected run `36116914434`, exact SHA
  `9320d43e59f3f52f1cb46a7623111cffef53d61f`.
- Diagnostics artifact `10855925296`, digest
  `sha256:5fb790776fe6bd70d173b038a3cea5ea6d7c0f97c7b9700ac6110f385d6aa63e`.
- Preserved expected, actual, and diff images for
  `staging-product-selected` at 320, 360, 390, and 430.
- Live staging independently rendered at the same four widths.
- Reported run results: functional/accessibility green; tablet/desktop three
  green; credential, build, project identity, deploy/alias and signed webhook
  green; cleanup `false`; baseline updates `false`; production untouched.

The corrected actual heights are 320×2591, 360×2572, 390×2577, and 430×2580.
The shorter state is the expected result of governed interim silence. Height is
again treated as an outcome, not as the pass criterion.

### Product verdict

**AC-KAN33-26 — PASS.** The unsupported free-shipping and returns promise is
absent at all four widths. The purchase-support area uses governed interim
silence. Checkout assurance remains visible.

**AC-KAN33-27 — PASS.** At all four widths, the Signature Hoodie title,
two-fraction `$128.00` price, S/M/L controls with M selected, quantity controls,
`ADD TO BAG - $128.00`, size guide, checkout assurance, editorial image, gallery
CTA, product story, colour, sizes, availability, and checkout fact remain
readable and aligned. The inspected actuals show no clipping, overlap,
horizontal overflow, phantom control, or missing product content. Live staging
matches the corrected composition.

The residual diff is explained and product-intended: old one-decimal-free money
and old purchase-support text are replaced by approved two-fraction money,
current content order, and interim silence. It does not reveal an unintended
mobile regression.

### Baseline ruling

**APPROVED — baseline regeneration is authorised, narrowly scoped.**

Authorisation covers only these four files/states:

1. `staging-product-selected-mobile-320-linux.png`
2. `staging-product-selected-mobile-360-linux.png`
3. `staging-product-selected-mobile-390-linux.png`
4. `staging-product-selected-mobile-430-linux.png`

The regenerated baselines must be byte-for-state representations of the four
inspected actuals from run `36116914434` / artifact `10855925296`. This approval
does not authorise changes to tablet, desktop, contact, gallery, catalogue, bag,
or any other baseline; does not approve tolerance increases; and does not permit
new content or layout changes during regeneration.

After the four baseline files are updated through the governed change path, a
fresh staging-only run must use baseline updates `false` and prove those four
comparisons green alongside the full functional/a11y suite. The immutable signed
receipt and independent Pushpa UAT remain pending until that green run. No
production action is authorised.

---

## Revision 7 — 2026-09-25: final independent Staging UAT

Pushpa independently verified protected Staging run `36147672270`: **SUCCESS**
at exact SHA `b8e91be29f205db71772fb26157c6f2a7f74675b`, PR `161`, release
`cp-staging-20260925-b8e91be`. All seven functional, accessibility, and visual
checks passed with catalogue cleanup `false` and baseline updates `false`.
Credential validation, build, project identity, deploy, alias, signed webhook,
and production-health invariance also passed.

The staging receipt is artifact `10870399052`, digest
`sha256:f3a6e14935f7f7b98405b0f37c73f9a0a4f9434190dbd9d3ec1d7d20ba6b3d4f`.
Diagnostics artifact `10870394099` has digest
`sha256:4ced39756203aef34ff717c86ad97419f85b5e381ae7290ad8a7eb1d30b860ec`.
Immutable proof run `36148637741` succeeded at the same SHA. Its signed artifact
is `10870583913`, digest
`sha256:c7978cacb0e24d0f851d35f4964c8741a97d59c77fe0b27d256ccbbdf1aa3797`.

The signed receipt binds deployment `dpl_DTQN4QpKdhpAicx55WD6aKJDtzZ6`, the
immutable deployment URL, `staging.carlophillips.com`, PR 161, release id, and
exact SHA. It proves S/M/L at USD 128.00, bag truth, trusted checkout handoff,
visual/accessibility health, zero console/network failures, webhook HMAC and
durable idempotency, and PII-free evidence. No payment or order occurred.
Production remained the same healthy deployment before and after the staging
release, and the production store was not mutated.

### UAT and signoff verdict

**PASS — KAN-33 independent Staging UAT and staging-only signoff are complete.**

AC-KAN33-1A/1B, 2, 3A, 4A, 5–15, 16–24, and 25–28 are satisfied for the exact
SHA above. KAN-33 is `DONE` within its explicitly authorised Staging scope. This
does not authorise Production, close unrelated P1s, publish policy copy, create
an order, or approve a payment.

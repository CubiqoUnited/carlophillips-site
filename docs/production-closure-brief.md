# Production Closure Brief

Status: execution plan and repository policy; not production approval

Updated: 2026-08-14

Accountable decision-maker: Product Owner (Boss)

Delivery coordinator/final QA: Sushma

Product scope and prioritization: Pushpa

Customer experience, SEO, analytics and accessibility: Malti

Architecture and commerce/security boundaries: Aarti
Evidence/current-practice research when required: Richa

## Outcome and operating model

CARLOPHILLIPS uses one production-intent branch: `main`. Work happens on temporary branches, enters a pull request, and receives an isolated Vercel Preview. A Preview is staging evidence, not production. After checks, review, release evidence, rollback proof, and explicit Product Owner approval, the approved commit may enter `main` and be promoted to Production. No permanent `staging` branch is required.

The 12 production areas are governed like a design system through `config/production-authorities.json`: one named authority, explicit consumers, an owner, validation, production gate, fail-closed behavior, and rollback. The registry references other truth; it does not replace Shopify commerce truth, the CSS styling system, Product Release Records, or external account controls.

## Verified Vercel identity and collision guard

Read-only account inspection on 2026-08-14 identified the production target as:

- team: `aditya's projects` (`team_8ABMxicIAtMyzgNYsJawFad0`);
- project: `carlophillips-site` (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`);
- production domain: `www.carlophillips.com`;
- current domain deployment observed: `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`, commit `bb9568f46bd60b587f3fc16b82513ae5ea220026`.

A different same-named project in the Cubiqo team is not the production target and must not be linked or deployed. `yarn verify:vercel-link --require-link` compares the ignored local `.vercel/project.json` with the exact project and organization IDs and aborts on missing or mismatched identity. This guard must run before any future Vercel deployment command. It prints no secrets.

PR #9 was observed open and mergeable, base `main` at `9b153bf`, head `f82733c`, with a READY Vercel Preview for its head commit. “Mergeable” and “READY” are technical observations, not approval to merge or promote. Production is behind both current `main` and PR #9; exact candidate selection remains a Product Owner release decision after QA.

## Plain-English decisions

### Checkout present but denied

The checkout endpoint can remain in the code because it is already protected by server-side gates and is needed for end-to-end testing. “Present but denied” means a browser can reach the route, but the server refuses to create a cart or return a checkout URL unless every independent condition passes: released product truth, current Shopify facts, exact variant resolution, cart capability, environment policy, and Product Owner approval. This is safer and easier to test than deleting and later rebuilding it. Decision: retain it, keep denial as the default, and treat any unexpected success as a release-blocking incident.

### Git tags versus Product Release Records

An annotated Git tag such as `v1.2.2` names an immutable site-code milestone. It answers “which source commit was this version?” A Product Release Record answers “which exact product, Shopify facts, media, fulfillment approvals, candidate evidence and rollback were authorized?” A tag never releases a product and a Product Release Record never substitutes for Git history. Policy: add an annotated tag only after the exact approved site candidate reaches `main`; bind its commit in any affected Product Release Record. Do not backfill or move a tag merely to imply approval.

### Crawl posture

An unreleased product page must not be discoverable through sitemap or collection links and must emit `noindex, nofollow`. A private Preview should be `noindex` globally. A production product becomes indexable only when the release policy says it is customer-visible and its canonical metadata/structured data are truthful. Crawling is therefore derived from release state, not a manually maintained marketing switch.

### Analytics baseline

Phase 1 is deliberately passive: page view, collection view, product view, policy view, and consent update. Media, size/variant, bag, checkout and outbound-redirect intent events are deferred until each has a concrete product decision, approved naming contract and additional privacy review; they are not implemented or promised by this brief. Never send raw Shopify IDs, checkout URLs, names, email, address, payment data, free-text fields, or secret values. Optional marketing pixels remain off until the Product Owner approves the tool/event purpose and the legal/content owner supplies applicable consent requirements. Prefer one analytics authority first; do not install GA, Meta and TikTok simultaneously by default.

## RACI and acceptance ownership

| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Platform, Vercel, CI, secrets, security operations | Sushma-designated Platform/Security owner | Product Owner | Aarti, Sushma | team |
| Shopify, checkout, Product Release Records | Aarti-designated Commerce/Release owner | Product Owner | Pushpa, Sushma | Malti |
| SEO, customer content, analytics, consent mechanics | Malti | Product Owner | Pushpa, legal/content owner, Sushma | Aarti |
| Accessibility and customer-flow QA | Malti | Product Owner | Sushma, Pushpa | team |
| Scope, sequencing, go/no-go brief | Pushpa | Product Owner | all specialists | team |
| Billing, account recovery, spend ceilings | named Account/Billing owner (must be assigned) | Product Owner | Sushma, service owner | team |
| Final evidence review and delivery | Sushma | Product Owner | Pushpa, Malti, Aarti, Richa | team |

Named-role gaps remain explicit: the Product Owner must nominate a human Platform/Security owner and Account/Billing owner before Production. Specialist roles above may prepare and verify work; they do not silently assume external account liability.

## Preview acceptance criteria

A private PR Preview may be accepted as staging evidence only when:

1. It is built from the exact PR head SHA in the verified production project, without a production alias.
2. Frozen install, lint, tests, production dependency audit and build pass in the required GitHub check.
3. No tracked secrets exist; Preview and Production variables are separately scoped; commerce remains fail-closed unless a bounded test is explicitly approved.
4. Desktop/mobile route, console, network, SEO, accessibility and interaction evidence is captured for the exact Preview.
5. Preview and unreleased products are `noindex`; metadata makes no unsupported live-commerce claim.
6. Security headers, exact-origin CORS and denied checkout behavior pass.
7. Product/media evidence is truthful, environment-labelled and bound to the candidate where applicable.
8. A rollback target and operator are recorded.

## Production go/no-go criteria

Production is a **no-go** unless all applicable Preview criteria pass and:

1. The exact approved commit is on `main`; required checks and review are visible; no unexplained diff exists.
2. The Product Owner explicitly approves Production promotion for that commit.
3. Every customer-visible product has a valid `Released` Product Release Record with fresh ACTIVE Shopify observation, exact commerce/media/fulfillment bindings and verified withdrawal path.
4. Live domain routing, TLS, redirects, headers, canonical metadata, sitemap/robots and monitoring are verified after promotion.
5. Checkout, payment/order, POD mapping, fulfillment/tracking, support and returns are proven in separately authorized controlled checks before claiming commerce readiness.
6. Privacy/terms/cookie surfaces and consent behavior match approved technical requirements; optional analytics fires only in permitted states.
7. Critical customer flows pass desktop/mobile accessibility and browser QA with no critical/serious automated findings.
8. Account owners, least privilege, 2FA/recovery, spend alerts, incident contact and rollback operator are recorded.

## Security and account tier recommendation

Use the lowest paid tier that satisfies measured production needs; no purchase is authorized here.

- **Now, no-cost controls:** GitHub required checks/review, Vercel project identity guard, least-privilege members, enforced 2FA where available, secret rotation ownership, dependency audit, fail-closed checkout, security headers, spend notifications, and one recovery owner.
- **Before commerce activation:** a rate-limit/abuse-control plan for cart and checkout, fuller CSP with report-only rollout, operational logging/alerts without personal or secret data, and documented incident/credential-revocation runbook.
- **Paid upgrade trigger:** choose a paid security/hosting tier only when a required capability, observed traffic/risk, support SLA, log retention, WAF rule, or team permission model cannot be met on the current tier. Record feature, monthly/annual ceiling, owner, cancellation path and approval before purchase.

## Now / Next / Later

**Now:** land the authority registry, CI, exact Vercel guard, metadata/crawl corrections, analytics specification, policy-route framework and accessibility automation; reconcile release-language contradictions; review PR #9 against these gates.

**Next:** create an immutable approved Preview evidence set; complete Product Release Record and commerce/fulfillment truth; obtain approved policy content/consent requirements; assign account owners and conduct read-only RBAC/billing review.

**Later:** controlled checkout-to-fulfillment validation, rollback rehearsal, production promotion after explicit approval, post-deploy smoke/monitoring, and quarterly account/access/cost reviews.

## Change control and rollback

Changes to a source authority require its owner, tests, evidence, and Product Owner approval when they alter a production gate or external state. Consumer files may reference an authority but must not create competing approval flags. A failing or missing gate is a denial, never an implicit fallback. Code rollback uses a reviewed Git revert and immutable Vercel deployment; product rollback uses the Product Release Record withdrawal process; external account/integration rollback requires the authorized account owner.

## Remaining decisions for Boss

1. Nominate the human Platform/Security and Account/Billing owners.
2. Select the exact PR #9 candidate only after the cross-functional QA brief; READY/mergeable does not equal approved.
3. Approve or reject the proposed minimal analytics event set and later the chosen platform after consent requirements are supplied.
4. Approve an account spend ceiling only when the read-only account audit identifies a concrete required capability.

No deploy, merge, push, account mutation, tracking enablement, commerce activation, purchase, or production claim is authorized by this brief.

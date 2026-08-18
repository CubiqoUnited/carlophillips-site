# Shopify Capability and Access Audit Backlog

Status: authenticated Shopify Admin read-only audit completed 2026-08-04. The live inventory contains 33 apps. Installation and browser access still do not prove a supported API or authorize writes. Detailed current evidence is in `test_reports/cp-shopify-audit-2026-08-04/audit-report.md`.

The audit observed the Draft Signature Hoodie, active native Shopify Headless storefront connection, Modelize outputs/quota, inactive Flow gate, disabled Spin Studio state, permission-update gates for ZS-Spin-View/MyDesigns, Apliiq's separate sign-in boundary, and billing surfaces. No secret, setting, product, order, fulfillment, generation, publication, or charge was changed.

The live inventory adds Printify, Printful, and ShineOn to the earlier 30-app Product Owner record. They are installed alternatives, not current Hoodie inventory or co-owners. Apliiq remains the selected Hoodie provider.

Product Owner reconfirmed the same 30-app CP inventory on 2026-07-23 and
reported that Shopify is logged in in the Product Owner's browser. That is
historical installed-app evidence only. The 2026-08-04 audit supersedes its
authentication and inventory-count findings, while the older machine-readable
record remains the normalized snapshot of what the Product Owner reported at
that time.

Cycle 4 added a validated executable registry at `config/capability-registry.json`. Registry `ready` means the exact requested operation is evidence-listed for a verified callable surface; an installed name or selected adapter is insufficient.

Cycle 19 adds one CP-owned local capability:
`shopify-storefront-variant-resolver` / `resolve-reviewed-variant`. Its `local`
surface proves only the deterministic implementation. A successful runtime
decision reports `server_only`, re-derives current read facts, exposes no raw
reference, and authorizes no mutation. It is not a third-party app capability,
not Storefront write access, and not wired into cart activation; the server
activation boundary continues to pass a null resolver decision.

## Historical authentication attempts — superseded

On 2026-07-22, the in-app browser had no open tab to claim, so Shopify Admin was opened in the same browser profile. Shopify presented its login screen. The existing Google account was available and selected without exposing its address. Shopify then stopped at “Verify your email to continue” and requested a six-digit email code.

No Admin page, installed-app list, app settings, permission details, billing screen, product, order, customer, credential, or secret was opened. No code was read, entered, or recorded. No resend, charge, write, generation, publish, order, fulfillment, or message action was taken.

The earlier verification tab did not persist across that task boundary. Cycle 11 later reached the login lookup page. Both authentication blockers were superseded on 2026-08-04 when the in-app Admin session was successfully audited.

The current human action is Apliiq provider sign-in, recorded in `reports/HUMAN_INTERVENTION_STICKY_RED.md`.

The current resume point is the Apliiq Hoodie mapping, followed by secure native Headless Storefront configuration and release-bound observation.

The historical per-app Product Owner-observed matrix is machine-readable at `evidence/shopify/po-observed-installed-apps-2026-07-22.json` and validated by `contracts/shopify-app-inventory.schema.json`. Its `none-auth-blocked` values describe that dated snapshot, not the 2026-08-04 browser findings.

## Minimum-access model

CP does not require direct agent access to every embedded app. The least-access
target is:

1. the existing native Shopify Headless connection for the server-only
   Storefront channel/token path covering product, media, current
   variant facts, and later separately approved cart operations;
2. Shopify Admin or a narrow Product Owner-approved CP custom app only for an
   exact operation that Storefront cannot serve;
3. Shopify CLI Connector only for approved development diagnostics and scope
   inspection, never as production runtime authority;
4. Apliiq read/mapping access for the Hoodie only when Shopify facts do not
   prove the exact fulfillment mapping;
5. only the selected media workers: Modelize if chosen for an approved modality
   and exactly one of Spin Studio or ZS-Spin-View after evidence; and
6. optional worker access (Flow, MyDesigns, CS Trending Products Finder) only
   when a named PipelineRun job requires it and its source/cost/write boundary
   is separately approved.

Native Shopify Headless is the storefront owner. The unlisted custom app also
named Carlophillips Headless launched a dummy Example Domain and is not a
storefront candidate. CodexAutomation5 and Shopify CLI Connector exposed only
embedded extension shells, while Shopify Claude Connector is Claude-specific.
None grants inferred Codex API authority. CP's Commerce
Gateway, Product Release Record, Media Registry, and PipelineRun remain the
canonical owners regardless of which connector is selected.

Duplicate/overlap groups remain fail-closed:

- Hoodie fulfillment: Apliiq is selected; Gelato, CustomCat, Spreadconnect,
  Zendrop, teelaunch, CJdropshipping, Only Caps, and MyDesigns are alternatives
  or workflow candidates, not co-owners.
- Spin: select one of Spin Studio or ZS-Spin-View.
- Support: select one primary inbox between Messaging and Tidio.
- Media workflow: Modelize, MyDesigns, and a spin worker have distinct candidate
  roles; none may replace Media Registry provenance/rights/approval.
- Connectors: select the narrow CP Admin/Storefront path; reject duplicate write
  authority across CodexAutomation5, Carlophillips Headless, Shopify CLI
  Connector, and Shopify Claude Connector.

Usage-fee exposure remains unverified unless explicitly reported. Tidio and
Order Printer Pro carry reported usage-fee risk; Modelize and spin tools may
use credits; POD/sourcing providers may create product, sample, fulfillment,
shipping, or subscription charges; AfterShip, Loox, Marketplace Connect, and
other operational apps may have plan/volume fees. No installed app, trial,
credit, or plan is approved for use by this record.

Exact human gates:

- The Product Owner permits secure configuration of the existing native
  Headless Storefront connection and any exact Admin operation that Storefront
  cannot serve, without sharing credential values in chat or reports.
- The Product Owner separately places any approved server credential in an
  ignored local or Preview environment and records a durable evidence
  reference; installation or browser login is insufficient.
- Each selected vendor/app-private API requires its own approved
  authentication, least permissions, and read-only probe.
- Any credit, usage fee, subscription, sample, order, customer contact,
  Shopify write, Flow activation, product sync, publish, or production action
  requires a separate explicit approval at action time.
- Resume the live audit at the installed-app list in the authenticated session
  available to the Product Owner, but do not claim that session is controllable
  by the agent until an approved browser/connector path is actually verified.

## Access classification

Every required capability must be verified as exactly one primary path:

1. supported API or webhook;
2. Shopify Admin API or Flow integration;
3. app-specific API credentials;
4. approved authenticated-browser workflow;
5. human-only step; or
6. unavailable or unsuitable.

For each candidate, record authentication class (never values), least permissions, cost/credit boundary, Draft-versus-publish behavior, automation surface, read-only test result, exact human action, and exact code/workflow resume point. “Installed” means only that the Product Owner reported it in the Shopify UI.

## Historical Product Owner-supplied inventory — superseded by live audit

The table below preserves the 2026-07-22 reported state. Its login-blocked findings are historical. Use the 2026-08-04 audit report for current browser capability findings.

| Capability | Candidate apps currently reported installed | Current access finding | Audit action |
|---|---|---|---|
| Product media / spin | Spin Studio - 360 Product Spin; Modelize; ZS-Spin-View | Product Owner reports installation; current managed browser is blocked at login, so API, credits, settings, and provenance remain unobserved | Authenticate, then determine real inputs/outputs, exportability, private app API/browser surface, costs, rights, and Draft safety |
| POD / sourcing | Apliiq - Print On Demand; Gelato: Print on Demand; CustomCat: Print on Demand; CJdropshipping: Much Faster; Spreadconnect; Zendrop - Dropshipping & POD; MyDesigns: Print on Demand; teelaunch: Print on Demand; Only Caps | Product Owner reports installation; Apliiq identifiers exist locally, but current mapping and provider-private access remain unverified | Authenticate, then review read-only per provider, retain one owner per product class, and bind exact SKU/variant mappings |
| Automation / connectors | CodexAutomation5; Flow; Shopify Claude Connector App; Shopify CLI Connector App; Carlophillips Headless | Product Owner reports installation; no granted scope or callable surface was observed | Distinguish Shopify-native Admin/Flow access from connector-specific OAuth/API authorization and record scope names read-only |
| Core commerce / operations | Fraud Control; Forms; Bundles; Search & Discovery; Translate & Adapt; Marketplace Connect | Unverified | Map source of truth and required operational role; reject unnecessary duplicate ownership |
| Customer / fulfillment operations | Messaging; Tidio; AfterShip Tracking; AfterShip Returns; Order Printer Pro; Loox Reviews | Unverified | Map tracking, support, returns, document, and review evidence paths; keep customer contact and order tests approval-gated |
| Research | CS - Trending Products Finder | Product Owner reports installation; access remains unverified at Shopify login | Authenticate, then determine export/private API/browser access, cost, provenance, freshness, and suitability for trend-led briefs |

Historical note: Printify, Printful, and ShineOn appeared in an older conversation but were absent from the 2026-07-22 Product Owner list. The 2026-08-04 live inventory proves they are installed; it does not make any of them a current Hoodie provider or prove callable provider access.

## Historical per-app candidate disposition

These were architecture recommendations before live read-only verification. The current selected stack and observed surfaces are in the 2026-08-04 audit report; neither record authorizes procurement, configuration, uninstall, or writes.

| Reported app | Build/reuse/buy disposition | Preferred access to verify | Current gate / ownership ruling |
|---|---|---|---|
| Spin Studio | Buy candidate worker | App API/webhook; approved browser fallback | One spin tool only after exact-Hoodie bake-off; credits and human QA gated |
| Modelize | Buy candidate worker | App API; approved browser fallback | Media Registry owns truth; credits, provenance, rights, and approval gated |
| ZS-Spin-View | Buy alternate | API/app block; approved browser fallback | Inactive unless compared with Spin Studio; never two customer viewers |
| Apliiq | Buy provider; selected Hoodie owner | Provider API/webhook; approved browser/human fallback | Draft/read-only first; samples, orders, fulfillment, and charges gated |
| Gelato | Buy provider alternate | Provider API/webhook/app credential | Inactive pending category-fit evidence; not Hoodie co-owner |
| CustomCat | Buy provider alternate | Provider API/webhook/app credential | One provider per approved product/category; auto-order gated |
| CJdropshipping | Buy sourcing candidate | Provider API/app credential | No role unless an approved non-POD brief requires it |
| Spreadconnect | Buy provider alternate | Provider API/webhook/app credential | Inactive pending category-fit evidence; no duplicate mapping |
| Zendrop | Buy sourcing alternate | Provider API/app credential | Not co-owner with CJdropshipping; product/order/plan costs gated |
| MyDesigns | Buy workflow candidate | App API/bulk-job surface | May create Draft jobs only; CP PipelineRun/Release Record remain owners |
| teelaunch | Buy provider alternate | Provider API/webhook/app credential | Inactive pending category-fit evidence; Draft-only pilot if approved |
| Only Caps | Buy specialist candidate | Provider/app API; browser/human proof | Candidate only for approved cap products; not Hoodie fulfillment |
| CodexAutomation5 | Reuse after code/scope audit | Scoped Admin API/webhooks/callbacks | Adapter only; CP PipelineRun owns orchestration; no autonomous publish |
| Flow | Reuse Shopify-native worker | Shopify Admin/Flow | Narrow versioned Shopify reactions only; activation/write gates remain human |
| Shopify Claude Connector | Research-only candidate | Connector scopes, preferably read-only | No production ownership; reject duplicate write authority |
| Shopify CLI Connector | Reuse for development | CLI/OAuth/Admin development scopes | Diagnostics only until exact write approval; never runtime owner |
| Carlophillips Headless | Reuse storefront/channel candidate | Storefront token/channel settings/webhooks | Presence does not prove active frontend flow; Commerce Gateway remains owner |
| Fraud Control | Reuse operations worker | Shopify Admin configuration/events | Product Owner policy and order-traffic test required |
| Forms | Reuse native candidate | Admin/app block/webhook/Flow | Consent, privacy, destination, and data-processor review required |
| Bundles | Reuse Shopify-native owner | Shopify Admin/API | Not required for Hoodie; pricing/margin/fulfillment approval gated |
| Search & Discovery | Reuse merchandising owner | Shopify Admin/Storefront API | Shopify owns facts; Next.js renders without inventing rules |
| Translate & Adapt | Reuse localization candidate | Shopify Admin/API | Human language/legal QA; no unreviewed auto-publish |
| Marketplace Connect | Reuse channel candidate | Admin/channel APIs | Inactive unless channel strategy/fees approved; never syndicate Draft products |
| Messaging | Support alternate | Admin/inbox/webhook/browser | Select one inbox; fallback if Tidio wins access/privacy audit |
| Tidio | Buy provisional support candidate | API/webhook/dashboard | Select one inbox; subscription/privacy/escalation/knowledge gates |
| AfterShip Tracking | Buy provisional tracking worker | API/webhook/app credential | Shopify/POD remain truth; subscription/event-volume gated |
| AfterShip Returns | Buy provisional returns worker | API/webhook/app credential | Product Owner policy and human exceptions; no automatic refund authority |
| Order Printer Pro | Buy utility candidate | Admin/template/browser | Generates from Shopify order truth only; template/legal QA gated |
| Loox Reviews | Buy provisional review worker | API/webhook/widget/browser | No fabricated/undisclosed reviews; moderation and subscription gated |
| CS - Trending Products Finder | Buy/reuse research input | App data/API; approved browser fallback | Source/date/confidence required; never automatic design/publish truth |

Historical Printify, Printful, and ShineOn are not in the current reported inventory and therefore have no active architecture dependency.

## Audit backlog and resume points

| Priority | Evidence to obtain | Safe current state | Human action if required | Resume point |
|---|---|---|---|---|
| P0 | Shopify Storefront product/variant/media read | Server adapter plus variant-identity, complete customer-copy/commerce-facts, full audit observation, and hashed per-media binding contracts exist; capability evidence/config remain unverified | Authorized owner configures least-privilege read-only values in an ignored local or Preview environment and records the durable capability evidence reference | Run the product-by-handle observation, review the exact sanitized full-envelope fingerprint/handle and current media binding hashes, then keep resulting release/media patches unapplied until separately authorized |
| P0 | Shopify cart, variant resolution, and checkout-host behavior | Local policy/tests fail closed; reviewed variant presentation is not mutation authority; active bag is not wired | Authorized owner provides a safe Storefront cart test context and confirms accepted Shopify checkout hosts | Prove an exact server-only resolver for the reviewed fingerprint, then exercise create/add/update/remove without order submission, validate the returned checkout host, and capture sanitized evidence |
| P0 | Apliiq Hoodie product/variant mapping | Local record has partial product/design identity; no current variant mapping proof | Authorized owner provides approved read-only provider/API/browser access | Observe exact mappings, hash non-secret facts into the release record, stop before ordering |
| P1 | Media candidate generation/export | Two Hoodie details quarantined; no verified spin/model/video | Product Owner approves specific tool access and any credit/billing boundary before use | Generate/export a candidate to quarantine, record provenance/rights, seek media approval before public use |
| P1 | Shopify Admin/Flow Draft staging | No write authorization | Product Owner approves a bounded Draft-only test and least-privilege credentials | Create/update only the named Draft candidate, log reversible changes, do not publish |
| P1 | Tracking/returns/support/reviews | No order or customer-operation proof | Product Owner approves an isolated test-order plan and any operational impact | Execute only approved test steps, redact personal data, bind outcomes to release acceptance evidence |
| P2 | Designer-led and trend-led research inputs | Intent defined; providers/access not selected | Product Owner approves sources and cadence; separately approve paid sources | Implement source adapters and auditable briefs; outputs remain candidates pending human approval |

No audit item authorizes billing, app installation/removal, customer/vendor contact, Shopify mutation, order placement, publication, deployment, merge, or production promotion.

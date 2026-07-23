# Shopify Capability and Access Audit Backlog

Status: Product Owner reports 30 installed apps. The current managed browser is blocked at Shopify login, and no programmatic or app-specific capability is proven. Updated 2026-07-22.

Cycle 4 added a validated executable registry at `config/capability-registry.json`. Registry `ready` means the exact requested operation is evidence-listed for a verified callable surface; an installed name or selected adapter is insufficient.

## Live read-only attempt

On 2026-07-22, the in-app browser had no open tab to claim, so Shopify Admin was opened in the same browser profile. Shopify presented its login screen. The existing Google account was available and selected without exposing its address. Shopify then stopped at “Verify your email to continue” and requested a six-digit email code.

No Admin page, installed-app list, app settings, permission details, billing screen, product, order, customer, credential, or secret was opened. No code was read, entered, or recorded. No resend, charge, write, generation, publish, order, fulfillment, or message action was taken.

Current handoff note: the earlier verification tab did not persist across the subsequent task-continuation boundary. Cycle 11 opened Shopify Admin in the managed browser and received the login lookup page with **Continue with Google**; no account was selected and no OTP was requested. This current result supersedes any assumption that the managed browser session is authenticated.

Exact human action: in the current Shopify login tab, choose **Continue with Google**, select the existing account, then enter Shopify's one-time code if prompted. Do not share or record the code.

Exact resume point: begin at Shopify installed-app inventory. Confirm the 30 Product Owner-reported names, then inspect Carlophillips Headless/Storefront-cart, Apliiq, Modelize, Spin Studio, ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder read-only. Record each actual API/Admin/Flow/app-API/browser/human/unavailable surface, scopes by name only, billing boundary, Draft safety, and app-specific resume point. Stop before every mutation or charge.

The complete per-app Product Owner-observed matrix is machine-readable at `evidence/shopify/po-observed-installed-apps-2026-07-22.json` and validated by `contracts/shopify-app-inventory.schema.json`. Every entry records goal disposition, ownership/duplicate finding, access path to verify, agent authentication need, usage-fee risk, and safe next action. Every callable surface remains `none-auth-blocked`.

## Access classification

Every required capability must be verified as exactly one primary path:

1. supported API or webhook;
2. Shopify Admin API or Flow integration;
3. app-specific API credentials;
4. approved authenticated-browser workflow;
5. human-only step; or
6. unavailable or unsuitable.

For each candidate, record authentication class (never values), least permissions, cost/credit boundary, Draft-versus-publish behavior, automation surface, read-only test result, exact human action, and exact code/workflow resume point. “Installed” means only that the Product Owner reported it in the Shopify UI.

## Current Product Owner-supplied inventory

| Capability | Candidate apps currently reported installed | Current access finding | Audit action |
|---|---|---|---|
| Product media / spin | Spin Studio - 360 Product Spin; Modelize; ZS-Spin-View | Product Owner reports installation; current managed browser is blocked at login, so API, credits, settings, and provenance remain unobserved | Authenticate, then determine real inputs/outputs, exportability, private app API/browser surface, costs, rights, and Draft safety |
| POD / sourcing | Apliiq - Print On Demand; Gelato: Print on Demand; CustomCat: Print on Demand; CJdropshipping: Much Faster; Spreadconnect; Zendrop - Dropshipping & POD; MyDesigns: Print on Demand; teelaunch: Print on Demand; Only Caps | Product Owner reports installation; Apliiq identifiers exist locally, but current mapping and provider-private access remain unverified | Authenticate, then review read-only per provider, retain one owner per product class, and bind exact SKU/variant mappings |
| Automation / connectors | CodexAutomation5; Flow; Shopify Claude Connector App; Shopify CLI Connector App; Carlophillips Headless | Product Owner reports installation; no granted scope or callable surface was observed | Distinguish Shopify-native Admin/Flow access from connector-specific OAuth/API authorization and record scope names read-only |
| Core commerce / operations | Fraud Control; Forms; Bundles; Search & Discovery; Translate & Adapt; Marketplace Connect | Unverified | Map source of truth and required operational role; reject unnecessary duplicate ownership |
| Customer / fulfillment operations | Messaging; Tidio; AfterShip Tracking; AfterShip Returns; Order Printer Pro; Loox Reviews | Unverified | Map tracking, support, returns, document, and review evidence paths; keep customer contact and order tests approval-gated |
| Research | CS - Trending Products Finder | Product Owner reports installation; access remains unverified at Shopify login | Authenticate, then determine export/private API/browser access, cost, provenance, freshness, and suitability for trend-led briefs |

Historical contradiction: Printify, Printful, and ShineOn appeared in an older conversation but are absent from the current Product Owner-supplied installed list. They remain **unavailable/unverified** until a current read-only observation proves otherwise.

## Per-app candidate disposition

These are architecture recommendations pending live read-only verification, not procurement, configuration, uninstall, or access claims.

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
| P0 | Shopify Storefront product/variant/media read | Server adapter exists; local config incomplete | Authorized owner configures least-privilege read-only values in an ignored local or Preview environment | Run the read-only product probe, fingerprint normalized variants/media, bind results to the Draft release record |
| P0 | Shopify cart and checkout-host behavior | Local policy/tests fail closed; active bag is not wired | Authorized owner provides a safe Storefront cart test context and confirms accepted Shopify checkout hosts | Exercise create/add/update/remove without order submission, validate the returned checkout host, capture sanitized evidence |
| P0 | Apliiq Hoodie product/variant mapping | Local record has partial product/design identity; no current variant mapping proof | Authorized owner provides approved read-only provider/API/browser access | Observe exact mappings, hash non-secret facts into the release record, stop before ordering |
| P1 | Media candidate generation/export | Two Hoodie details quarantined; no verified spin/model/video | Product Owner approves specific tool access and any credit/billing boundary before use | Generate/export a candidate to quarantine, record provenance/rights, seek media approval before public use |
| P1 | Shopify Admin/Flow Draft staging | No write authorization | Product Owner approves a bounded Draft-only test and least-privilege credentials | Create/update only the named Draft candidate, log reversible changes, do not publish |
| P1 | Tracking/returns/support/reviews | No order or customer-operation proof | Product Owner approves an isolated test-order plan and any operational impact | Execute only approved test steps, redact personal data, bind outcomes to release acceptance evidence |
| P2 | Designer-led and trend-led research inputs | Intent defined; providers/access not selected | Product Owner approves sources and cadence; separately approve paid sources | Implement source adapters and auditable briefs; outputs remain candidates pending human approval |

No audit item authorizes billing, app installation/removal, customer/vendor contact, Shopify mutation, order placement, publication, deployment, merge, or production promotion.

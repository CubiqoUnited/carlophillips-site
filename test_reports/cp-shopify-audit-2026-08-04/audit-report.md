# CP Shopify-to-storefront POC audit

Audit ID: `CP-SHOPIFY-2026-08-04`

Observed: 2026-08-04 through the authenticated Shopify Admin session, read-only. No app was installed, removed, configured, upgraded, charged, or used to generate media. No product, order, fulfillment, customer, theme, Flow, publication, deployment, or production setting was changed. No credential value was viewed, copied, or recorded.

## 1. Outcome

The Hoodie POC has a viable minimum stack, but it is not yet publishable:

1. **Apliiq** — sole POD/fulfillment owner for the Signature Hoodie.
2. **Modelize** — editorial, lifestyle, and on-model still-image candidate.
3. **Spin Studio** — sole 360-spin candidate, subject to proving a headless export/integration path.
4. **Shopify native Headless** — product/variant/media/cart/checkout truth for the Next.js storefront.
5. **Shopify Flow** — Draft/review automation after the existing workflow is reviewed and explicitly activated.
6. **The CP Next.js site** — VOLLBAK-aligned presentation and release-gated publication.

Installed apps alone do not make this pipeline active. Apliiq requires its own login; Modelize has exhausted the free allocation; Spin Studio is disabled and its Shopify theme embed is not a Next.js integration; the CP Flow is inactive; and live Storefront credentials have not yet been configured in the local/Preview runtime.

## 2. Product evidence

- Shopify contains `CARLOPHILLIPS Signature Hoodie` as **Draft**.
- Vendor: Apliiq. Category: Hoodies. Product type: hoodie.
- Black; sizes XS through 5XL; displayed price $128.
- The product has two Shopify source images and one sales channel assignment.
- Inventory was observed as not tracked.
- A different active product named `CarloPhillips Atelier Hoodie` exists and must not be mistaken for the Signature Hoodie POC.

The observed Draft is product evidence, not proof of current Apliiq variant mapping, production inventory, publish approval, or checkout readiness.

## 3. Live capability findings

| Capability | Live finding | POC ruling | Exact next action |
|---|---|---|---|
| Native Shopify Headless | Installed; `Carlophillips Headless` storefront connection is Active and exposes Storefront API access management | Required commerce connection | Configure least-privilege Storefront values through ignored local/Vercel secrets, then run a read-only observation; never record token values |
| Apliiq | Installed Apr 22; product/order activity is recorded in Shopify; opening the provider reaches Apliiq sign-in | Required Hoodie POD owner; provider capability not authenticated | Product Owner signs in to Apliiq; then inspect exact Hoodie product/design/variant mapping read-only |
| Modelize | Embedded app opens; 3/3 free images used; three completed Signature Hoodie outputs exist | Selected still-image candidate | Review/export existing exact-product candidates; new generation requires explicit plan/credit approval |
| Spin Studio | Embedded app opens; Signature Hoodie can be added but has no spin; app reports disabled app embed | Selected spin candidate | First prove export/API/headless compatibility; only then seek approval to add the Hoodie or enable anything |
| ZS-Spin-View | Permission update is required for Online Store/theme access | Duplicate spin alternative | Keep inactive unless Spin Studio fails the headless/export proof |
| MyDesigns | Permission update is required for Online Store/theme access | Duplicate POD/design alternative | Do not grant new access for the Hoodie POC while Apliiq/Modelize cover the selected roles |
| Flow | Embedded app opens; `CARLOPHILLIPS - POD Product Review Gate` exists but is Inactive | Required review automation candidate | Inspect workflow steps/version, then seek explicit activation approval; keep product Draft |
| CS Trending Products Finder | Embedded app opens with a populated research dashboard | Research-only | May support later trend-led briefs with dated provenance; cannot establish Hoodie product/media truth |
| `Carlophillips Headless` custom app | Unlisted app; no recent activity; launches Example Domain | Broken/dummy duplicate | Do not use as commerce authority; native Headless is the supported path |
| CodexAutomation5 | Embedded extension only; broad permissions; no standalone callable surface proven | Not required for POC | Do not infer Admin API access or publication authority |
| Shopify CLI Connector App | Embedded extension only; no token/control surface proven | Development-only candidate | Use only if a separately authenticated CLI diagnostic is needed |
| Shopify Claude Connector | Opens Claude connector settings | Not a Codex or storefront connector | Exclude from the POC path |

## 4. Installed-app inventory and overlap

The live Admin displayed 33 installed apps across three pages. POD/sourcing overlap includes Apliiq, Gelato, CustomCat, CJdropshipping, Spreadconnect, Zendrop, MyDesigns, teelaunch, Only Caps, Printify, Printful, and ShineOn. The Hoodie POC should use Apliiq only. Spin Studio and ZS-Spin-View overlap; choose Spin Studio provisionally and keep ZS inactive.

Later operational candidates include Search & Discovery, Translate & Adapt, Loox, AfterShip Tracking/Returns, Messaging/Tidio, Fraud Control, Order Printer Pro, Marketplace Connect, and Bundles. None is required to prove the first Hoodie design-to-Preview path.

## 5. Media truth

Modelize visibly contains at least one strong monochrome editorial candidate for the Signature Hoodie. It remains a candidate until its exact-product accuracy, provenance, permitted use, and release binding are approved. The audit did not treat the other two completed jobs as visually verified.

No installed app currently proves genuine 3D/AR or a video clip. Spin Studio advertises a photo-based 360-degree effect; that must not be labeled as a true 3D model. A production release still requires the Media Registry's non-waived modalities or an explicit approved infeasibility record.

## 6. Cost and risk

- Shopify Basic is $39/month. The June 30 and July 30 bills were observed paid at $39 each.
- The upcoming bill was $0 at observation time, with 24 days to the next bill and the $200 threshold remaining.
- Zendrop and Order Printer Pro showed usage-charge exposure in plan subscriptions; Only Caps was also marked with usage-fee exposure in the installed list.
- Modelize's free allocation is exhausted. No plan was selected.
- Provider samples, orders, fulfillment, shipping, subscriptions, credits, or app generation can create cost and remain approval-gated.

This audit found no evidence that the current recurring charge above the Shopify base plan is caused by these apps.

## 7. POC execution sequence

1. Authenticate Apliiq without purchasing or ordering; observe and bind the exact Hoodie product/design/variant mapping.
2. Configure the existing native Headless Storefront read connection in secret storage and capture a sanitized current Shopify observation.
3. Review the three existing Modelize outputs and Shopify source photos; approve only exact-product assets and bind them to the Media Registry.
4. Prove whether Spin Studio can export or serve a headless-safe spin asset. If not, record the modality blocker and do not enable a duplicate viewer.
5. Review the inactive Flow gate; after explicit approval, use it only to maintain Draft/review state.
6. Apply the reviewed release candidate on the temporary branch and deploy a Vercel Preview. Preview remains non-commerce until product/media/fulfillment/current-facts gates pass.
7. Verify desktop/mobile visuals, console, product combinations, cart, Shopify-hosted checkout redirect, and rollback without submitting an order.
8. Only after Product Owner approval, merge the temporary branch to `main`; production follows `main`. Publication and production activation remain separate explicit actions.

## 8. Evidence and blockers

Screenshots in this directory:

- `installed-apps-page-1.png`
- `signature-hoodie-draft.png`
- `modelize-dashboard.png`
- `modelize-signature-hoodie-existing.png`
- `flow-workflows.png`
- `spin-studio-disabled-notice.png`

Current blockers are precise and isolated: Apliiq provider login; secure Storefront credential configuration; Modelize spend approval for new generations; Spin Studio headless/export proof; media approval; Flow activation approval; Shopify write/publication approval; Preview deployment approval; and later production approval. Safe local work need not wait on paid media generation, but truthful staging cannot pretend these gates have passed.

Repository QA completed after the documentation/evidence update: zero-warning lint passed; 32 test files and 309 tests passed; production dependency audit found zero vulnerabilities across 193 packages; and the Next.js 15.5.21 production build completed successfully. `git diff --check` passed. All six live-audit screenshots were inspected at 588×696. No storefront UI code changed, so the existing production desktop/mobile evidence remains the applicable customer-site comparison; these new captures validate Shopify/app state rather than claim a new storefront visual.

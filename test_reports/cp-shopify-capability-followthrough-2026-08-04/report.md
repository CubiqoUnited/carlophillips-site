# CP Shopify capability follow-through

Audit ID: `CP-HOODIE-E2E-2026-08-04-R2`

Observed read-only on 2026-08-04 through the authenticated Shopify Admin session. No product, app setting, theme embed, plan, charge, generation, publication, order, fulfillment, credential, deployment, or production state was changed.

## Answers

### Modelize: when and why the three credits were used

All three free images were consumed by one completed Auto Mode job, `#137843f7`, at 2026-07-11 04:16 PM. The job used one reference image for `CARLOPHILLIPS Signature Hoodie` and produced three images. All three remain **Not published**. The job was an image-generation attempt for the Hoodie; this audit did not generate or publish anything.

### Spin Studio: why it is disabled

The app's Installation screen reports the `360° Product Spin widget` as **Inactive**. Its default setup opens Shopify's theme App Embeds editor, enables a script, and replaces the first product-gallery image (or an image marked with an alt-text convention). This is an Online Store theme integration. It does not establish an export/API or integration with the CP Next.js headless storefront. No Hoodie spin exists, and the audit did not click Start setup.

### Shopify Agentic: what it can do now

Shopify reports that Agentic Storefronts are not available yet. ChatGPT, Microsoft Copilot, and Other channels are inactive; Shop is active; Shopify Catalog contains 0 products. This surface controls future AI shopping-channel discoverability. It does not grant Codex Shopify Admin access, POD control, media generation, or publication authority.

### Native Headless and live Storefront read

The native `Carlophillips Headless` storefront exists. Its existing public Storefront credential is readable and the permission screen shows product-listing plus checkout read/write scopes enabled. The value was held only in memory/locked temporary storage, never printed or committed, and the temporary file was deleted immediately.

A live Storefront API request for handle `carlophillips-signature-hoodie` returned HTTP 200, zero GraphQL errors, and no product. This is the expected fail-closed result because the Shopify product is **Draft**. Admin shows vendor Apliiq, type hoodie, black in sizes XS–5XL, nine variants, displayed price range $128–$134, inventory not tracked, two source images, and one channel assignment. These facts do not prove the provider mapping or sellable inventory.

### Apliiq authentication

Apliiq accepted the password-reset request, but both password variants supplied by the Product Owner were rejected. No more guesses were attempted. Exact resume: complete the newest reset-email link through Apliiq's password-confirmation form, then sign in and signal `Apliiq open`. No plan, sample, order, sync, fulfillment, or charge may be accepted during sign-in.

## End-to-end state

1. POD truth is blocked only at the separate Apliiq login; Shopify vendor labeling is not mapping proof.
2. Still-image generation already exists: two Modelize outputs are usable local-review candidates and the artifacted third remains quarantined. New generation requires a plan/credit decision.
3. Spin/360 is not ready: the installed app's theme embed is inactive and no headless-safe output path or angle set is proven.
4. Shopify commerce connectivity is real, but the Hoodie is deliberately Draft and therefore unavailable through Storefront API.
5. The CP Next.js production design is already live and commerce remains fail-closed. A temporary-branch Vercel Preview comes only after the product/POD/media evidence is bound and the Preview action is approved.

## Evidence

- `modelize-job-137843f7.jpg` — exact completed job, time, product, reference count, three outputs, and publish controls left untouched.
- `spin-studio-inactive-installation.jpg` — inactive theme widget and installation boundary.
- `shopify-agentic-inactive.jpg` — channel status and zero-product catalog.
- `shopify-headless-storefront.jpg` — existing native Headless storefront, with no credential screen captured.
- `shopify-signature-hoodie-draft.jpg` — Draft product, source imagery, vendor, and publication state.

The five screenshots were visually inspected at 1280×720. Credential screens were intentionally excluded. This cycle changes evidence and status only; it does not change the customer-facing storefront, so the existing production desktop/mobile comparisons remain applicable.

## Repository verification

`yarn verify` passed with Yarn Classic 1.22.22: zero-warning lint; 32 test files and 309 tests; production dependency audit with zero vulnerabilities across 193 packages; and the Next.js 15.5.21 production build. `git diff --check` and the final password/token/session-marker scan passed. The first sandboxed audit attempt could not resolve the Yarn registry; the complete command was rerun with network access and passed.

# CARLOPHILLIPS / CANONICAL REQUIREMENTS
**Consolidated Working Source of Truth**

---

## CP PROJECT-CHAT REVIEW
### System-definition additions and clarifications

Reviewed by the CP project-chat agent against the canonical Markdown and rendered PDF. This section is a requirements suite, not an implementation plan. Each proposed change is expressed as a system behavior.

### Required additions
- The system must accept one or two factual POD source images as sufficient initial product-media input; additional approved media may be AI-generated only when truthfully labeled and bound to the Product Release Record.
- The system must provide a role-scoped Admin Portal for products, media, releases, approvals, orders, support, analytics, audit evidence, and design-system governance.
- The system must retain desktop, tablet, and mobile screenshots; console and network evidence; accessibility, performance, video, and staging-UAT evidence for every release candidate.
- The system must use only the canonical `CubiqoUnited/carlophillips-site` repository, approved branches, and approved Vercel project; it must not use unrelated personal forks, accounts, branches, or Vercel projects.
- **Branch Lifecycle Governance:** Only `main` (Production) and `staging` (Staging) may persist as long-lived branches on `origin`. Any temporary working/task branch created by an agent (e.g. `codex/*`, `copilot/*`, `feature/*`, `cp-staging-*`) MUST be deleted immediately after its pull request or changes are merged into `main` or `staging`.

> **Rationale:** These requirements were identified as direct CP project-chat and repository-governance requirements that were missing or not stated as mandatory system behavior.

### Required corrections and clarifications
- The system must provide at least 12 approved static product images when the full gallery is enabled (derived from verified POD source assets and approved AI-generated views); video, motion, 360, 3D, AR, and on-model media are additional only when genuine approved assets exist.
- The bottom-left gallery control must provide preview access to the full gallery media set, opening the complete 12-view overlay on interaction.
- The system must keep canonical staging and production visually and functionally equivalent, using the exact approved staging artifact; the only permitted checkout difference is that real payment may complete only in production.
- The system must provide media comparison, regeneration, quarantine, rejection, approval, staging, release, placement assignment, and rollback controls.
- The system must not permit hardcoded visual values in staging or production; all visual values must resolve through approved design tokens and reusable components.

> **Rationale:** These statements remove ambiguity between existing wording and the confirmed product-page, checkout, media, and delivery requirements.

### Confirmed as already covered
- The system must keep Shopify as the authority for catalog, price, availability, cart, checkout, payment, and orders.
- The system must not collect card data or replace Shopify secure payment fields.
- The system must keep staging payment-safe and require Product Owner approval before production promotion.
- The system must preserve Draft -> Staged -> Approved -> Released, Product Release Records, Media Registry truth labels, rollback evidence, and Draft-until-approved AI media.
- The system must not claim production readiness before checkout, payment, POD fulfillment, tracking, support, and returns are directly verified.
- The system must keep analytics, observability, consent, feature flags, provider reliability, post-sale operations, and customer/member boundaries as currently defined.

---

# CARLOPHILLIPS canonical product, commerce, customer and production requirements

**Status:** Consolidated working source of truth  
**Scope:** Product page, checkout, CP Member customer layer, CP Stone status, lifecycle communications, POD/fulfillment, media truth, and release governance.

---

## 1. Purpose and authority

This document consolidates the requirements found in the supplied product-page HTML, checkout requirements HTML, `CP-stones.pdf`, `CARLOPHILLIPS-pod.docx`, and the supplied CP Member strategy text.

Normative terms are used as follows:
- **MUST / MUST NOT:** release-blocking requirement.
- **SHOULD:** recommended product or implementation direction unless the Product Owner explicitly changes it.
- **REFERENCE:** creative direction or example, not commerce or production proof.
- **OPEN GATE:** unresolved decision, evidence, approval, or external dependency.

This document is canonical for requirements consolidation. Shopify remains the canonical source of live product, variant, price, availability, cart, checkout, payment, and order truth.

---

## 2. Truth, evidence and governance boundaries

### 2.1 Commerce truth
- Shopify MUST own product title, description, vendor, product type, tagline, details, variants, prices, availability, cart, checkout, payment and orders.
- A storefront fixture or design mock MUST be visibly labeled as a review fixture and MUST NOT be presented as live commerce.
- The storefront MUST NOT collect card data, emulate secure card fields, bypass Shopify checkout, or claim that a payment method is live without direct verification.
- Preview/staging may mimic the production checkout journey, but it MUST NOT submit a real payment or order.
- Production payment MUST remain enabled from checkout through payment once production is authorized and verified.

### 2.2 Product and media truth
- A mock, runway image, AI-generated image, motion study, or campaign image is creative direction unless explicitly bound to an approved sampled SKU.
- A hero product requires an approved physical sample, exact supplier/provider SKU, approved construction/decoration route, and truthful product media.
- Do not invent video, 3D, AR, on-model, lifestyle, 360, fabrication, fit, or construction evidence.
- AI-generated media is acceptable only as disclosed creative/review material and may not be promoted as physical-product proof.
- The supplied Product Owner assets are the only eligible assets until the release record binds additional approved media.

### 2.3 Release governance
- Product Release Records advance only through **Draft -> Staged -> Approved -> Released**.
- Staging requires immutable build/staging evidence and a rollback plan.
- Approval requires complete product, media, POD/fulfillment truth and Product Owner approvals.
- Release requires an active Shopify observation and a verified rollback path.
- There is one canonical staging target. Production may be promoted only from the approved staging result and only after Product Owner approval.
- Preview and production must use the same design system, tokens, reusable components, and reviewed UI behavior (hardcoded visual values are prohibited).
- **Branch Lifecycle Governance:** Only `main` (Production) and `staging` (Staging) may persist as long-lived branches on `origin`. Working branches created by agents must be deleted immediately upon merge completion.

---

## 3. Brand and design system

- All product, checkout, member, stone, bag, drawer, account, and communication surfaces MUST use the CARLOPHILLIPS design system.
- Theme shape, sizing, typography, color, spacing, borders, surfaces, motion, and assets MUST be tokenized and implemented through reusable components.
- The visual language is premium, restrained, editorial, minimal, and merchandise-first.
- Checkout direction: black/charcoal surfaces, off-white type, fine gray borders, and the supplied CP marble-and-silver logo.
- CP Stone material direction: rough unfinished slate with restrained emerald, sapphire, or garnet mineral illumination. Gemstone color is an embedded material property, not a neon interface effect; letterforms use a dark recessed channel, chipped rim, and subtle internal light.
- Reduced-motion preferences MUST be respected.

---

## 4. Product page requirements

### 4.1 Landing and motion
- While visible, the landing page SHOULD combine editorial runway movement with subtle still-image movement.
- The primary landing/product display sequence is: **Runway video -> Fit & silhouette video -> Product-only 360 spin**, when each approved modality exists:
  - **Phase 1 (Runway Motion):** Editorial walking motion, 7.79 seconds, 0.9x speed, muted autoplay when in viewport (≥60% visibility).
  - **Phase 2 (Fit & Silhouette):** Shows garment drape, structure, and profile (5.04 seconds).
  - **Phase 3 (Product 360 Spin):** 360-degree rotation of the merchandise alone without on-model invention.
- Both videos are distinct assets with visible Play/Pause, muted autoplay only while visible on the landing hero, reduced-motion fallback, and soft lateral edge vignette so no portion of the garment is cropped.
- Keep `Pause Motion`, progress timeline, `ORDER`, and `VIEW GALLERY` visible.
- `ORDER - EUR 180` opens the purchase tray. The price is a product-page reference and must be replaced by Shopify truth for a live product.
- `VIEW GALLERY` opens the gallery overlay.
- Motion MUST be paused when the gallery opens.

### 4.2 Mobile product page
- Motion remains prominent with visible `Pause Motion`.
- Provide a sticky `Select Size / Order Now` bar.
- Purchase controls MUST NOT cover the garment or obscure essential product media.

### 4.3 Purchase tray
- Initial reviewed sizes are S, M, and L only. Live size options MUST come from Shopify and may not be hardcoded when the product is live.
- Default CTA: `SELECT A SIZE`.
- After selection: `ADD TO BAG`.
- Keep `BUY NOW`, size guide, shipping, and returns available.
- The tray MUST preserve product-page context and expose truthful availability.

### 4.4 Size and fit drawer
- Open in place without leaving the product page.
- Show size guidance; measurements and measuring instructions expand progressively.
- Use Shopify product data and approved model/fit data only.
- Where available, show remembered CP size and preferred fit (e.g., `Your CP size: L · Preferred fit: relaxed`).
- Do not infer or expose sensitive body profiling.

### 4.5 Bag confirmation drawer
- Confirm product, selected size, quantity, and subtotal.
- Allow quantity changes, checkout, and continued shopping.
- Keep the product page visible behind the drawer.
- Guest checkout remains open; account recognition is invited, not forced.
- Guest bag primary CTA: `CONTINUE TO GUEST CHECKOUT ->`, leading directly to native Shopify checkout rails.
- Recognized member bag shows member identity and eligible CP Credit; member CTA: `CONTINUE WITH CP ACCOUNT ->`.
- The guest/member distinction must be visible in the bag without requiring a prototype toggle or forcing account creation.

### 4.6 Gallery & Preview Strip
- The left-bottom gallery thumbnail/control is always visible when approved gallery media exists and provides visual thumbnails for the full approved media set. Clicking it opens the gallery overlay without leaving the product view.
- The gallery overlay MUST contain at least 12 approved product views when the full gallery is enabled. The set should cover front, back, side, three-quarter, detail, construction, fit/scale, movement, and product-only 360 entry where available.
- The overlay must preserve the product name, selected variant/size, live order cost, and primary order CTA.
- Default behavior is manual with arrows and swipe. `Play Auto` is optional (5-second cadence).
- Support zoom, fullscreen, keyboard controls, focus return, and reduced motion.
- Include front, back, and side views with and without a model only when approved media exists.
- Include 360-degree product and on-model views only when available and truthfully labeled.
- Include fabric, stitching, embroidery/print, construction, fit, scale, and movement close-ups only when evidence exists.
- Keep `ORDER - EUR 180` visible in the reviewed concept; use live Shopify price in production.

### 4.7 Product-to-payment journey
- Product media, size selection, price, and availability must resolve before the order action is enabled.
- The order CTA from the landing view, purchase tray, gallery overlay, and bag must converge on the same Shopify-backed cart/checkout flow.
- The flow is: **Select product/variant -> Show live cost -> Add to bag or Buy now -> Bag confirmation -> Guest or recognized-member checkout -> Shopify checkout -> eligible payment gateway/wallet -> payment confirmation -> order confirmation**.
- The storefront must not collect or proxy secure card fields. Shopify owns the final payment gateway, payment method eligibility, and order submission.
- Preview/staging may exercise the complete screen journey through a payment UI or sandbox boundary, but must not capture real funds or create an unapproved production order.

---

## 5. CP relationship layer

The customer journey is:  
**anonymous visitor -> invited -> recognized -> member -> owner -> known -> privileged**

CP Member is not a points-based loyalty program. It is a private customer layer around the brand, centered on access, recognition, ownership, and service.

### 5.1 Private List / access
- Initial signup is email-only.
- Private List capture MUST separate marketing consent from account/service communication.
- Private access may include pre-launch access, private colorways or variants, member-only objects, reserved quantities, selective private pricing, and CP Credit.
- Do not lead with a permanent discount or train members to expect coupons.
- Progressive profiling may later request first name, country, category interests, usual size, preferred fit, and color preferences.
- Access landing pages may be reached from private referral, QR, creator, or event sources.

### 5.2 CP Member identity
- Use Shopify Customer Accounts and passwordless authentication; do not build a separate password system.
- Sign-in may use a one-time code and may persist according to Shopify's supported session behavior.
- Recognized customers should see a unified account surface containing member identity, member number, member-since date, CP Credit, orders, returns, saved pieces, sizes, preferred fits, color preferences, access, addresses, payment methods, and communication preferences.
- Account creation MUST NOT be forced before joining the Private List or using guest checkout.
- Customer auth flow: **customer enters email -> receives a six-digit one-time code -> signs in instantly**.
- Passwordless customer identity must use Shopify native Customer Accounts; do not build a custom password database or require a third-party login app.
- Private List marketing signup and customer-account authentication remain separate actions and consent categories.

### 5.3 CP Member Card, CP Stone Card, and payment wallets
- Every recognized member receives a digital-first CP Member Card representing the relationship with CP.
- CP Member Card and CP Stone Card MUST remain separate objects.
- CP Stone is brand-selected invitation/status, not a spend tier, points tier, or payment card.
- Do not launch Stone as a generic silver/gold spend ladder. Introduce it after CP Member has established meaning.
- Possible Stone benefits include private previews, reservations, priority quantities, special alterations/customization, concierge contact, private capsules, and selected service privileges.
- Shop Pay, Apple Pay, Google Pay, PayPal, and other eligible wallets are payment infrastructure. They are not the CP Member Card.
- A future Apple/Google Wallet membership pass, if approved, remains separate from payment methods.

### 5.4 CP Credit
- CP Credit is Shopify Store Credit or an equivalent Shopify-native money balance, never points.
- Show current balance and a transparent ledger of earned, used, expired, issued date, and expiry where applicable.
- Credit may be used for first-purchase incentives, exchanges, referrals, service recovery, private launches, birthdays, or anniversaries.
- Signed-in customers must be able to view and apply eligible credit at checkout.
- Do not expose store credit as proof of payment capability until the live Shopify checkout path is verified.

### 5.5 Saved Pieces and fit memory
- Saved Pieces is a core member feature, not merely a utility icon.
- Persist SKU/product, color, size, and access state across devices.
- Support low-stock, restock, private-access, coordinating-item, and one-click move-to-bag notifications where supported.
- For made-to-order/POD items, allow a future `Reserve this piece` demand signal without implying production availability.
- Persist useful fit memory: usual CP top size, usual bottom size, height only if voluntarily provided, preferred fit, and past fit feedback.

### 5.6 Ownership, service, returns and exchanges
- After purchase, show `Your Pieces` as a living wardrobe with care, service, fit, and complementary-piece context.
- Lifecycle should cover confirmation, production story, dispatch, delivery, fit follow-up, review/UGC request, returns, and exchanges.
- Shopify Customer Accounts remains the base for self-service returns.
- Layer CP service over Shopify with clear choices: exchange size, choose another CP piece, take CP Credit, or refund original payment.
- Any member-specific exchange window, priority replacement, complimentary exchange, or bonus credit remains an explicit Product Owner/business decision.

### 5.7 Guest and recognized-member checkout
- Guest checkout is first-class and remains fully open for anonymous customers.
- The bag may offer soft email recognition: *"Have a CP account or store credit? Enter your email for passwordless recognition."*
- Recognition is optional and must not block `Continue to Guest Checkout ->`.
- When identity is successfully recognized, show the CP Member identity and eligible credit balance; applying credit requires explicit customer action or the approved checkout policy.
- Guest and recognized-member states must use the same Shopify checkout authority and preserve the same payment/wallet eligibility.

---

## 6. Checkout and payment requirements

### 6.1 Visual behavior
- Use the supplied CP marble-and-silver logo in the checkout header.
- Desktop: payment form on the left; item, price, and total on the right.
- Mobile: one column with an easy-to-find total and continuation button.
- Preserve the minimal editorial hierarchy from the supplied desktop and mobile concepts.
- Keep Credit Card, Shop Pay, PayPal, Apple Pay, and Google Pay as Shopify provides them and only when eligible.

### 6.2 Ownership and launch sequence
- Shopify controls secure card fields, payment method eligibility, and the final payment action.
- The storefront MUST NOT collect card details.
- Confirm the Shopify plan and supported checkout customization capability.
- Build and test a draft checkout configuration.
- Compare desktop and mobile against the supplied checkout concepts.
- Obtain Product Owner approval before publishing the checkout configuration.
- Verify live domain, Shopify checkout, payment, fulfillment, tracking, support, and returns before claiming production readiness.

---

## 7. Lifecycle communications and customer states

Communications must follow the customer state, not a single generic abandonment template.

### 7.1 State architecture
1. **Unknown visitor:** merchandise-first visit -> Private List capture -> welcome/brand introduction -> browse behavior -> product-interest segmentation.
2. **Prospect:** browse abandonment -> saved/bag abandonment -> checkout abandonment -> first conversion.
3. **First-time owner:** confirmation -> production/dispatch story -> delivery -> fit check -> review/UGC request -> CP Credit -> second-piece recommendation.
4. **Repeat member:** private drop -> complementary piece -> size-aware recommendation -> early reservation -> relationship milestone.
5. **High-value member:** Stone qualification -> private preview -> concierge/clienteling -> events/invites -> limited or personalized pieces.

### 7.2 Message rules
- Browse abandonment is editorial and product-interest-led; no automatic discount.
- Saved/bag abandonment is product-oriented and should address size availability, shipping, returns, and saved context; no automatic discount by default.
- Checkout abandonment is transactional and restores checkout; never train customers to abandon for a coupon.
- Transactional messages include order, shipping, account security, delivery, and service updates.
- Marketing messages include launches, recommendations, early access, member/editorial announcements, and campaigns.
- Marketing consent MUST be separate and must propagate to every sending system.
- Provide a unified preference center for email, SMS if introduced, product/drop alerts, and editorial/member announcements.

---

## 8. POD, sourcing and production requirements

### 8.1 Collection and classification
- Signature means CP branding only.
- Narrative artwork belongs to a named campaign such as *At the Edge of Life*.
- Assign designs to Signature, *At the Edge of Life*, *Origin of Elevation / Lofoten*, or a future named campaign.

### 8.2 Provider ownership
- **Apliiq:** primary for premium tees, heavyweight fleece, embroidery, patches, woven labels, private labels, and Signature hero apparel.
- **Printful:** primary for global core apparel, DTG, DTFlex, embroidery, documented AOP constructions, and embroidered headwear.
- **Printify:** controlled catalog breadth; lock exact provider plus SKU and sample that combination.
- **Gelato:** specialist posters, framed campaign art, and selected apparel only after market availability verification.
- **CustomCat:** value printed tees/fleece and tests; do not assign embroidery.
- **CJdropshipping / Zendrop / Spreadconnect:** controlled or secondary gap-filling routes; never hero ownership without exact SKU, material, decoration, and sample evidence.
- **teelaunch:** specific specialist objects only.
- **Only Caps:** hold for niche cap use; not the Signature embroidered-cap owner.
- **ShineOn:** future jewelry/gift capsule only.
- **MyDesigns:** workflow/tooling only unless an exact physical fulfillment partner is named.

### 8.3 Decoration and construction
- Embroidery is for CP monograms, restrained chest marks, and caps; simplify gradients, microtype, and fine lines.
- DTG is for detailed bounded cotton graphics.
- DTF/DTFlex/DIGISOFT is for sharper, opaque transfer-style graphics; always sample hand feel.
- AOP sublimation is panel-by-panel cut-and-sew printing and will not align perfectly across seams.
- Woven/private labels are finishing elements, not the primary artwork.
- Jacquard/intarsia knit is a knitted construction and MUST NOT be replaced by a rectangular sweatshirt print.

### 8.4 Launch recipe baseline
The supplied POD record preserves these mapped candidates; every one requires exact provider/SKU confirmation and an approved physical sample before Shopify publication:
- **Premium tee:** Apliiq US Blanks US3210-GD; transfer + tonal chest embroidery + private label.
- **Heavyweight tee:** Apliiq EC1000; centered digital print.
- **Global box tee:** Printful Cotton Heritage MC1087; front/back DTG.
- **Value tee:** CustomCat Gildan G500; DIGISOFT back print.
- **Hero hoodie:** Apliiq Cotton Heritage M2650; back transfer + tonal chest embroidery + private label.
- **Premium crew:** Apliiq Cotton Heritage M2480; front transfer or digital print.
- **Global hoodie:** Printful Cotton Heritage M2580; front/back DTG.
- **Value crew:** CustomCat Gildan G180; DIGISOFT front print.
- **Cap:** Apliiq Sportsman SP500; front flat embroidery.
- **Beanie:** Printful Yupoong 1501KC; dark-charcoal flat embroidery.
- **Tote:** Printful Econscious EC8000; front DTG or DTFlex.
- **AOP hoodie:** Printify/MWW On Demand product 450; panel-by-panel sublimation.
- **AOP joggers:** Printify/Subliminator product 591; sublimation.
- **AOP swim trunks:** Printify/Subliminator product 589; sublimation.
- **AOP polo:** Printify/MWW On Demand product 1604; sublimation.
- **Luxury bomber:** Contrado custom men's bomber; full-print cut-and-sew.
- **Luxury scarf:** Contrado custom scarf; all-over textile print.
- **Framed poster:** Gelato archival matte wooden framed poster; archival matte giclée.
- **Unframed poster:** Gelato premium matte poster.
- **Metal panel:** teelaunch direct-print aluminum panel.

### 8.5 Explicit production boundaries
Standard POD is not sufficient for tailored trousers/suits, substantial wool coats, leather jackets, true engineered knitwear, couture embroidery, seam-spanning appliqué, or exact runway fabric matching. These require specialist manufacturing, patternmaking, grading, fittings, physical development, and separate approval.

Runway scenes with multiple garments MUST be decomposed into separate products/routes. A campaign image is not proof that one supplier can produce the whole look.

---

## 9. Media generation, registry and admin workflow

### 9.1 Minimal POD input and constraint engine
- The initial media pipeline MUST be able to start from one factual front image, garment specifications, approved variants, and artwork placement.
- Convert fabric, weight, fit, construction, color, and decoration details into machine-readable generation and QA constraints.
- Generate a reference pack before editorial media: front, back, side, three-quarter, and detail views.
- Every generated asset MUST be compared against POD specifications and artwork placement; mismatches are rejected or regenerated.
- Enablement of the full 12-view gallery overlay occurs once candidate assets pass QA and human approval.

### 9.2 Truth classification
Every asset MUST carry one explicit truth classification:
- **Factual POD**
- **AI-assisted product visual**
- **AI editorial**
- **AI-assisted 360**
- **Approximate 3D**
- **Physically verified**

AI-assisted 360 is not photographed 360. Approximate GLB output is not a physically verified 3D model. These labels must remain visible wherever the asset is presented for review or customer use.

### 9.3 Media placement and storage
- Default landing media is approved runway motion.
- Explore Media may combine a factual POD anchor with approved AI angles, models, details, motion, spin, or 3D, each with its truth label.
- Per garment, organize media as `media/{product-handle}/originals/`, `images/`, `videos/`, `posters/`, and `derivatives/`.
- Draft files belong in private draft storage/DAM; approved staging files belong in approved draft storage; production media belongs in Shopify Product Media/CDN.
- Metadata and approvals MUST be recorded in `releases/{release-id}/media-manifest.json` or its canonical equivalent.
- Temporary Downloads and QA folders MUST NOT be production media sources.

### 9.4 Asset record
Each asset record MUST include product and variant IDs, media type, placement label, source and generation prompt, rights status, exact-product verification, dimensions, duration and format, checksum, poster/fallback where applicable, approval status, Shopify media ID/CDN URL when published, and release version.

### 9.5 Admin and agentic workflow
The CP Control/Admin portal SHOULD expose product facts, source assets, generated candidates, media coverage checklist, QA results, rights/product-match status, approve/reject controls, Shopify upload status, preview link, release status, and rollback controls.

The agentic workflow is:  
**Ingest -> Validate -> Generate -> QA -> Human approval -> Upload to Shopify -> Bind Media Registry -> Preview -> Release -> Monitor**

AI may generate, classify, compress, compare, and test assets. AI MUST NOT approve product truth, spend credits, publish, or release without the required human gate.

### 9.6 Non-disruptive integration
- Add the media-generation workflow to the existing CP Control/Admin portal as a separate, feature-flagged workflow.
- The existing POD-to-publish funnel MUST remain unchanged and operational until the new workflow passes QA and is explicitly activated.
- Reuse the existing Product Release Record and Media Registry; do not create duplicate product truth.
- Generated assets remain Draft-only and isolated from the existing gallery until approved.
- The new workflow MUST NOT automatically modify Shopify, existing releases, storefront media, or publishing behavior.
- Provide side-by-side comparison with existing assets, gradual per-product migration, and immediate rollback by disabling the feature flag.

### 9.7 Connections and credits
MODA/Modelize may be the initial fashion-AI connection. ProductSpin or an equivalent approved service may provide AI-assisted 360. Instant 3D or an equivalent approved service may provide approximate GLB models. Additional services such as Sugata, TAYLA, or Raspberry AI require separate evaluation.

External API/browser access and pay-as-used credits are OPEN GATES. No paid service, credit spend, or external write is authorized merely because it appears in this requirements document.

---

## 10. Signature Hoodie video & motion specifications

### 10.1 Video Asset Specifications
- **Runway Motion Video:**
  - **Source asset:** Approved Gen-4.5 runway walking edit (`apps/web/public/media/signature-hoodie/videos/runway-motion.mp4` / `runway-motion-final.mp4`).
  - **Duration & Speed:** Exactly 7.79 seconds runtime, rendered at 0.9× playback speed.
  - **Edit sequence:** Starts directly with walking steps (closed-eye opening cut), stop, quarter-turn, and confident hold.
  - **Landing viewport playback:** Muted autoplay initiates when the hero panel is in view (≥60% intersection ratio). Video plays once and pauses at the final frame; visible `Pause motion` / `Play motion` control allows manual toggle.
  - **Edge rendering:** Lateral vignette gradient preserves 100% of the model and hoodie without vertical seam cutoffs.
  - **Accessibility:** Reduced-motion preferences (`prefers-reduced-motion: reduce`) prevent autoplay and display the primary static poster.
- **Fit & Silhouette Video:**
  - **Source asset:** Approved Gen-4.5 garment drape & silhouette showcase (`fit-silhouette.mp4`).
  - **Duration:** Exactly 5.04 seconds.
  - **Modal interaction:** Explicit user-selected asset inside the gallery overlay modal; does not autoplay on landing hero.
- **Product 360 Spin:**
  - Dedicated merchandise-only rotation (isolated product, no invented on-model spin) labeled as `AI-assisted 360` or physically verified.

### 10.2 Asset Protection Rules
- Do not reverse, mirror, or color-invert the footage.
- Preserve the CP logo, black color, Hoodie construction, and concrete setting.
- Test desktop/mobile layout, performance, accessibility, and video engagement.
- Keep the video set Draft-only until Product Owner and Media Registry approval.

---

## 11. Authentication and external-system access

- Customer authentication uses Shopify Customer Accounts and passwordless identity as defined in Section 5; it must remain separate from internal admin access.
- The Admin portal MUST use authenticated role-based access for generation, QA, approval, Shopify upload, release, and rollback actions.
- GitHub, Vercel, Shopify, and provider sessions are operational access context, not product requirements or proof that an action was completed.
- Never place tokens, passwords, OTPs, session cookies, or private account data in the repository, canonical documents, screenshots, logs, or Media Registry.
- External writes, paid credits, Shopify changes, deployments, and production release require the relevant authorization and evidence gate.

---

## 12. Authentication authority separation

Authentication is split into customer identity and internal Admin/Agent authority.

### 12.1 Customer authentication
- Customer identity is Shopify-native, passwordless, and email OTP-based as defined in Section 5.
- Customer authentication grants access to CP Member profile, saved pieces, fit memory, orders, returns, and CP Credit according to Shopify permissions.
- Customer authentication does not imply marketing consent, Private List membership, or Product Owner authority.

### 12.2 Admin and Agent authority
- Internal `/admin` actions use separate role-scoped bearer tokens held only in environment variables or an approved secret manager.
- `CP_ADMIN_PRODUCT_OWNER` is the full-authority role allowed to approve releases, authorize Shopify writes, authorize paid external-tool credits, publish, and advance a release to production.
- `CP_ADMIN_REVIEW_TOKEN` is read-only review authority for pipeline, media, logs, and evidence; it MUST NOT spend credits, publish, authorize Shopify writes, or release to production.
- Automated previews and simulations use the reviewer/read-only authority by default.
- Tokens, bearer headers, OTPs, sessions, and secret values MUST never appear in documents, logs, screenshots, analytics payloads, API collections, commits, or Media Registry records.
- Every privileged action must be authenticated, role-checked, auditable, bound to the release record, and fail closed when authority is missing or ambiguous.

---

## 13. Platform tooling and measurement scope

The following tool categories are in scope for the CARLOPHILLIPS platform, subject to product fit, privacy/consent review, environment separation, cost approval, and implementation evidence:
- **Feature management:** LaunchDarkly for feature flags, staged activation, targeted rollout, and fast rollback. Media generation and other new workflows MUST remain independently disableable.
- **Observability and reliability:** Datadog for application performance, logs, traces, infrastructure/service health, browser errors, checkout monitoring, and release alerts.
- **API design and testing:** Postman and/or Swagger/OpenAPI for API contracts, documentation, collections, integration tests, schema validation, and reproducible handoff evidence.
- **Web analytics:** Google Analytics for consent-aware acquisition, navigation, funnel, commerce, and campaign measurement. Analytics MUST respect the consent model and MUST NOT be treated as product or payment truth.
- **Behavior analytics and heat maps:** Microsoft Clarity, or an approved equivalent, for consent-aware heat maps, session recordings, rage/dead-click signals, and UX friction analysis. Clarity data MUST be separated from payment fields and must not capture card data, OTPs, secrets, or unnecessary personal data.
- **Experimentation and optimization:** Optimizely for controlled experiments, feature variants, conversion optimization, and statistically bounded rollout decisions. Experiments MUST NOT bypass release gates or change reviewed commerce truth.
- **Product analytics:** Mixpanel and/or Amplitude for event taxonomy, funnels, retention, lifecycle states, Saved Pieces, CP Credit usage, checkout progression, and member behavior. Use one canonical event taxonomy and prevent duplicate/conflicting events across tools.
- **Additional tools:** Other analytics, experimentation, monitoring, customer-data, API, or automation tools may be added only when their role, data ownership, consent behavior, retention, cost, environment, and rollback path are documented.

### 13.1 Tooling requirements
- Define a tool-to-event matrix before production activation: event name, trigger, payload, owner, destination, consent category, retention, and failure behavior.
- Keep preview/staging telemetry separate from production telemetry, and label fixture or test traffic.
- Never send secrets, payment data, full access tokens, OTPs, or unnecessary personal data to analytics, logs, traces, API collections, or experiment platforms.
- Instrument checkout and payment observability without intercepting or storing Shopify secure card fields.
- Feature flags, experiments, and analytics must fail safely: a vendor outage must not create false commerce truth, block emergency rollback, or silently publish draft media.
- Dashboards and alerts MUST distinguish Draft, Staged, Approved, and Released states and link evidence to the relevant release record.
- Product Owner approval remains required for customer-visible experiments, production flags, new paid tooling, and changes to event or consent behavior.

### 13.2 System API and integration inventory
- **Core commerce authority:** Shopify Admin API for catalog, drafts, variants, metafields, orders, fulfillment, and release-bound observations; Shopify Storefront API for customer-facing product/variant data, cart, and checkout handoff; Shopify Customer Accounts for passwordless identity; Shopify-native Store Credit capability for eligible balances and application.
- **Storefront/application:** Next.js server/API routes and the CP Commerce Gateway are the presentation and controlled integration layer. The browser must not receive server-only credentials or raw provider secrets.
- **Fulfillment and service:** provider-specific APIs and webhooks for the selected POD route; AfterShip Tracking and Returns APIs/webhooks for carrier and return state; n8n or an equivalent webhook hub; Shopify Flow for approved workflow orchestration; Klaviyo/Shopify Messaging for lifecycle communications.
- **Media generation:** approved API or browser integrations for MODA/Modelize, ProductSpin/Spin Studio, Instant 3D/3Dify, and Runway. These are candidate/route-specific integrations and require explicit access, credit, QA, and Product Owner approval.
- **Observability and product intelligence:** Datadog, Google Analytics, Microsoft Clarity, Mixpanel, Amplitude, Optimizely, and LaunchDarkly SDKs/APIs are measurement or control-plane integrations, not commerce truth. Consent, environment separation, payload minimization, and failure behavior are required.
- **Engineering and delivery:** GitHub and Vercel APIs/CLIs may support repository, preview, deployment, and evidence workflows; they do not authorize a production release by themselves.
- **API design/testing tools:** Postman and Swagger/OpenAPI are contract, documentation, and testing tools. They are not runtime commerce or payment APIs.
- **Provider candidates not simultaneously guaranteed:** Apliiq, Printify, Printful, Gelato, CustomCat, Contrado, teelaunch, and other providers are route candidates. Only the exact provider/SKU/API/webhook path bound to a release record is considered active for that product.

No vendor appearing in this inventory should be treated as live, authenticated, paid, or production-connected without direct evidence in the relevant release record. Exact API versions, scopes, webhook contracts, secrets, rate limits, retries, idempotency keys, and data-retention rules remain implementation gates.

---

## 14. Three-funnel architecture and agentic checklist

CARLOPHILLIPS operates as three connected but separately governed funnels. The agent traverses schema-backed gates in sequence and pauses only at designated human approval gates.

### 14.1 Funnel 1 - POD to Publish: catalog and release truth
- **Objective:** turn a design concept or approved trend signal into a verified Shopify draft and, after approval, a purchasable Next.js storefront product.
- **Core systems:** ProductBrief, POD suppliers, Shopify Admin/Storefront APIs, Product Release Records, GitHub, and Vercel Preview.
- **Responsibilities:** ProductBrief validation, POD blank/SKU mapping, variant-to-supplier mapping, fulfillment location, Shopify draft staging, release evidence, and Product Owner authorization.
- **Release states:** Draft -> Staged -> Approved -> Released.

### 14.2 Funnel 2 - AI Media Generation: visual truth and registry
- **Objective:** produce brand-compliant editorial, AI-assisted 360, and approximate 3D candidates without compromising physical product truth.
- **Core systems:** MODA/Modelize, ProductSpin or Spin Studio, Instant 3D or equivalent, private DAM, Media Registry, and storefront media binding.
- **Responsibilities:** tool ingestion, candidate generation, automated QA, quarantine with reason codes, responsive derivatives, poster fallbacks, provenance, rights, truth labels, approval, and binding to the reviewed PODPIPE storefront presentation order.
- AI tools create candidates only. Unverified or artifacted media remains quarantined or Draft-only and cannot bind to the storefront.

### 14.3 Funnel 3 - Post-Sale Operations: webhooks, service and retention
- **Objective:** turn made-to-order production into a transparent customer experience, capture fit intelligence, and retain value through service and exchanges.
- **Core systems:** Shopify Orders, n8n or an equivalent webhook hub, Shopify Flow, Klaviyo/Shopify Messaging, AfterShip Tracking and Returns, and Shopify Store Credit.
- **Responsibilities:** multi-POD order splitting, production milestones, provider callbacks, dispatch/tracking, transactional and lifecycle messaging, fit memory, returns/exchanges, CP Credit ledger updates, and retention reporting.

### 14.4 Deterministic agentic checklist
1. **Ingest ProductBrief:** validate brand constraints and inspiration-only reference policy; compute an immutable input fingerprint and suppress duplicates.
2. **Verify POD truth:** confirm blank availability, decoration zones, base cost, and one-to-one Shopify variant-to-supplier SKU mapping.
3. **Stage Shopify draft:** create or update only a Shopify Draft with inventory, variant dimensions, and fulfillment location.
4. **Trigger media jobs:** dispatch approved factual inputs to the selected on-model, 360, and 3D tools.
5. **Automated QA and quarantine:** inspect seam distortion, false tags, anatomy, artwork placement, and product mismatch; mark failures `QUARANTINED` with reason codes and clean outputs `CANDIDATE`.
6. **Bind Media Registry:** record provenance, prompt, tool, rights, truth classification, placement, responsive derivatives, and video poster fallback.
7. **Prepare approval envelope:** compile Shopify draft facts, variant mappings, fulfillment evidence, and the approved media matrix.
8. **Pause for Product Owner approval:** stop at `EXTERNAL_EXECUTION_APPROVAL_REQUIRED`; only the Product Owner may authorize the Staged -> Approved -> Released transition.
9. **Arm post-sale webhooks:** listen for Shopify order creation, route multi-vendor fulfillment, and write provider production callbacks to order metafields.
10. **Route lifecycle communications:** send production, dispatch, delivery, fit-memory, and service messages from verified order/tracking state.
11. **Run retention-first returns:** offer exchange, CP Credit, and refund choices; any bonus-credit amount remains a Product Owner-approved business rule and must be written to Shopify Store Credit.

### 14.5 Shared boundaries
- **Fail closed:** products remain invisible and unbuyable until release gates and evidence bindings pass.
- **Preserve modality integrity:** if verified 3D or 360 does not exist, omit it rather than simulate it with misleading flat media.
- Customer identity and CP Credit remain native to Shopify Customer Accounts and Store Credit where supported.
- Next.js owns presentation and gated visibility; Shopify owns commerce and catalog truth; the webhook hub bridges external provider events.
- The existing POD-to-publish funnel and the new media funnel remain independently feature-flagged and rollbackable.

---

## 15. Fulfillment reliability and control plane

CP owns the customer promise. Provider estimates, marketing claims, and isolated best-case times are inputs only; customer-facing delivery windows must be based on CP observations with a buffer.

### 15.1 Reliability model
- Reliability is evaluated as provider + product/SKU + geography + decoration route, not at provider-brand level alone.
- Score each sellable variant on production p50/p90, carrier-handoff p90, delivery p90, defect rate, stock interruption, backup qualification, quality, and cost.
- Route orders using reliability x quality x delivery x cost, not price alone.
- Use observed p90 performance to calculate delivery windows and update them when provider health degrades.
- Do not promise a provider's best-case estimate. Use language such as `Expected dispatch: [date window]` or `Produced after your order. Expected dispatch: [date window]`.
- Treat current provider claims and community reports as hypotheses requiring controlled CP samples and operational data before launch decisions.

### 15.2 Curated assortment and provider strategy
- Launch with a deliberately small, availability-curated assortment rather than exposing every provider SKU, color, and size.
- Curate 10-20 proven Apliiq base garments for premium branded work instead of listing its full catalog.
- Build a small **CP CORE / READY** line from high-availability, high-volume blanks and limited colors/sizes.
- Build **CP EDITIONS** for embroidery, private labels, complex decoration, limited colors, and intentionally made-to-order pieces.
- Candidate test matrix: Printify Express for fast basic US tees; Printify Choice for standard basics; Printify Choice Global and Gelato for international tests; Apliiq for premium branding and embroidery; Printful as a controlled test/secondary route; best-fit provider per experimental SKU; bulk/warehouse fulfillment for proven hero SKUs.
- Maintain a second qualified supplier for every critical SKU where feasible.
- A provider, product, region, and decoration route must be sampled before being treated as a launch-ready route.

### 15.3 Production qualification sprint
Before accepting real customer orders, qualify the likely first 10 products across equivalent routes where available. Test relevant destinations such as US East, US West, UK, and EU. Capture production start, production completion, carrier handoff, first carrier scan, delivery, print/color/placement, packaging, garment consistency, and defects. Repeat critical tests at least twice.

Launch assortment selection must be based on this evidence. A smaller set of products with proven delivery control is preferred over a larger set with unverified fulfillment.

### 15.4 Fulfillment control plane
- Use a CP fulfillment orchestrator between Shopify commerce, POD APIs, carrier/tracking services, and the customer notification engine.
- Shopify `order paid` starts the orchestration flow; provider APIs/webhooks report acceptance, production, issues, item completion, tracking, and errors; carrier events report possession, transit, exception, out-for-delivery, and delivery.
- Use two event sources: Shopify fulfillment events plus direct provider webhooks/API events, with carrier tracking as the delivery evidence source.
- Normalize external statuses into CP states and keep raw provider state in the internal record.
- Do not manually mark Shopify fulfillment complete when an integration is responsible for tracking updates.
- Distinguish `Packed / Awaiting carrier` from `With carrier`. Show `Dispatched` only when carrier possession or first scan is evidenced where available.
- Multi-provider or multi-process orders must expose split shipments, separate tracking numbers, and separate arrival windows before checkout when known. Prefer assortment architecture that reduces split shipments.

### 15.5 CP Order Timeline
The customer account must show a CP-owned timeline with timestamps, expected windows, and confidence:  
**Order confirmed -> Production accepted -> Preparing your piece -> In production (verified only) -> Packed (if known) -> With carrier -> Out for delivery -> Delivered**
- Always show a prominent `Expected delivery window`.
- If the prediction changes, show the new window and proactively explain the change.
- Never expose `Processing` as a dead-end status with no expected date or next action.
- Brand journey content may fill verified waiting periods - fabric, artwork, fit, complementary pieces, account setup, or CP Credit - but must remain separate from operational state and must never invent factory telemetry.

### 15.6 Delay watchdog and exception operations
Every order receives timers and baseline comparisons:
- Provider has not acknowledged the order at T+15 minutes: internal alert.
- Not in production at T+24 hours: monitor and compare with baseline.
- Still waiting at T+72 hours: investigate provider/SKU health.
- Likely to miss estimated ship date: investigate before the date.
- Ship date missed: customer update with revised estimate.
- Label created for more than 24 hours with no carrier scan: alert.
- Carrier has no movement for 48 hours or delivery estimate is missed: investigate and contact proactively.

Internal exception dashboard must show orders needing attention, provider health by SKU/region, rising p50/p90, stock interruptions, carrier exceptions, and recommended storefront estimate changes.

### 15.7 Service recovery and hybrid fulfillment
- If a customer issue is likely legitimate, CP should place a replacement promptly and pursue provider reimbursement separately. Provider disputes must not become the customer-facing explanation.
- Keep a small emergency finished-stock reserve for top products and sizes for VIP replacements, lost packages, delayed reprints, and urgent samples.
- Use a hybrid model as products mature: experimental and long-tail pieces remain POD; proven hero products may move to 25/50/100-unit or warehouse inventory; core bestsellers may qualify for 24-48 hour fulfillment.
- The storefront must distinguish fast-ready products from made-to-order products with credible, product-specific windows.

### 15.8 Dynamic reliability controls
- If a variant repeatedly experiences stock or delay problems, automatically suspend it, widen the made-to-order window, or route it to a qualified backup.
- Dynamic controls must fail closed and require an auditable rule, source data, and rollback path.
- Never accept an order against a variant merely because it exists in a provider API if its availability or reliability is below the configured threshold.

---

## 16. Delivery roadmap

### P0 - foundation
- Define CP Member rules, CP Credit rules, consent model, Customer Accounts behavior, customer states/tags/metafields, event taxonomy, release record, and rollback evidence.

### P1 - acquisition
- Private List landing/popup, email-only capture, welcome sequence, progressive profile, consent/preference center.

### P2 - conversion
- Product page motion/gallery/purchase tray, Saved Pieces, browse/bag/checkout recovery, Shop Pay/wallets, and CP Credit checkout application.

### P3 - ownership
- Order/production/dispatch/delivery, fit follow-up, returns/exchanges, credit-versus-refund choices, reviews/UGC.

### P4 - retention
- Early access, private products, ownership-based cross-sell, size-aware recommendations, milestones, and referrals.

### P5 - prestige
- CP Stone, reservations, concierge/clienteling, events, special customization, and private capsules.  
*(Do not build CP Stone as a P0 dependency. Its value depends on CP Member already being meaningful.)*

---

## 17. Acceptance checklist

- [ ] All surfaces use shared design tokens and reusable components (no hardcoded visual values in staging or production).
- [ ] Product page passes desktop/mobile layout, keyboard, swipe, focus, reduced-motion, and no-overflow checks.
- [ ] Landing sequence supports the two approved videos, product-only 360 when available, bottom-left gallery preview strip, and gallery overlay with at least 12 approved product views.
- [ ] Every order CTA resolves to live cost/variant data and the Shopify checkout-to-payment boundary.
- [ ] Product facts and variant availability are Shopify-derived.
- [ ] Gallery media is product-driven and evidence-bound.
- [ ] Checkout uses Shopify-hosted secure fields and payment action.
- [ ] Preview/staging cannot submit a payment or order.
- [ ] Production payment, checkout, fulfillment, tracking, support, and returns are directly verified before release.
- [ ] CP Member is passwordless and separate from payment wallets.
- [ ] CP Credit is money-like store credit with a ledger, not points.
- [ ] CP Stone is invitation status, separate from Member Card and payment cards.
- [ ] Marketing and transactional consent are separate and centrally suppressible.
- [ ] Every launch SKU has exact provider/SKU, approved sample, truthful media, and rollback evidence.
- [ ] Product Owner approves the canonical staging result before production promotion.
- [ ] Media assets have explicit truth classifications, checksums, manifests, and placement states.
- [ ] AI media generation is feature-flagged, Draft-until-approved by default, and rollbackable without changing the existing funnel.
- [ ] Signature Hoodie video behavior (7.79s runway edit, 0.9x speed, muted autoplay in viewport, soft lateral vignette) passes desktop/mobile, accessibility, performance, and reduced-motion checks.
- [ ] Admin actions are authenticated, role-scoped, auditable, and free of secrets in stored evidence.
- [ ] Tooling scope is documented for LaunchDarkly, Datadog, Microsoft Clarity, Postman/Swagger, Google Analytics, Optimizely, Mixpanel/Amplitude, and any approved additions.
- [ ] Event, consent, data-retention, environment, cost, and rollback behavior is defined before production instrumentation.
- [ ] The three funnels have explicit ownership, handoff contracts, evidence, and release gates.
- [ ] The agent pauses at the human approval gate and cannot self-approve, publish, spend credits, or release.
- [ ] Post-sale webhooks, production milestones, tracking, communications, fit memory, returns, and CP Credit updates are observable and replay-safe.
- [ ] Provider/SKU/region reliability baselines and a qualification sprint exist before launch.
- [ ] CP Order Timeline distinguishes provider acceptance, production, packing, carrier possession, and delivery.
- [ ] Delay watchdog timers, provider-health dashboard, exception procedures, and customer recovery actions are tested.
- [ ] Delivery windows are CP-calculated, buffered, product-specific, and updated from observed performance.
- [ ] Guest checkout is a first-class path with the correct guest and recognized-member CTAs.
- [ ] Customer auth is Shopify-native passwordless email OTP and remains separate from marketing consent.
- [ ] Product Owner and Reviewer Admin/Agent authorities are role-separated and secret-safe.
- [ ] Branch governance: Only `main` and `staging` persist on remote origin; temporary task branches deleted immediately after merge.

---

## 18. Source register and interpretation

1. `carlophillips-product-page-final-requirements.html` - normative product-page interaction, motion, gallery, sizing, and purchase-tray requirements.
2. `checkout-requirements.html` - normative checkout visual direction and Shopify ownership boundary. The supplied path was absent from the working tree; the preserved Git artifact was used as the source copy.
3. `CP-stones.pdf` - customer-experience concept book: relationship-layer journey, slate/gemstone material direction, 22 states, and implementation boundaries. It is design concept documentation, not proof of live Shopify commerce.
4. `CARLOPHILLIPS-pod.docx` - canonical product/production sourcing record: provider ownership, exact build matrix, decoration language, campaign classification, sample gate, and POD infeasibility boundaries.
5. Supplied CP Member strategy text - product strategy recommendations for access, identity, CP Member Card, CP Stone Card, CP Credit, lifecycle states, product-interest memory, saved pieces, fit memory, consent, stack, and priority order. Recommendations are consolidated here as SHOULD-level direction unless separately marked MUST.
6. Supplied pasted GitHub/Vercel/Shopify and media-pipeline notes - operational context plus implementation requirements for non-disruptive admin media generation, asset storage, truth labeling, Signature Hoodie video, staging/production media behavior, and external access boundaries. Logged-in status and listed apps were treated as context, not as proof of current deployment or authorization.
7. `carlophillips-v144.1-visual-sourcing-guide.html` - visual index, provider audit, exact/adapted/specialist route classification, v144.1 recipe guidance, artwork-rebuild rule, storefront/Admin interface boundary, and fulfillment timing baselines. Supplier timing is planning guidance, not a customer promise until verified for the actual order.
8. Supplied 3-Funnel Architecture & Agentic Checklist Specification - three-funnel operating map, deterministic agentic checklist, human approval gate, webhook/lifecycle responsibilities, and shared architectural boundaries. Its proposed tools and integrations remain subject to the tooling, consent, security, cost, and approval gates in this document.
9. Supplied operational reliability research - provider/SKU/geography strategy, CP fulfillment control plane, CP Order Timeline, delay watchdog, service recovery, hybrid POD/warehouse model, reliability scoring, and production qualification sprint. Provider claims and anecdotal reports are treated as hypotheses until validated by CP sampling and event data.
10. `CARLOPHILLIPS-xyz.pdf` and its pasted auth/guest-checkout notes - complete visual member journey, guest/member bag states, passwordless customer auth, Admin/Agent token authority separation, and the three-funnel responsibility matrix. Visuals remain reference material; token names describe roles only and never authorize disclosure of secret values.

> Instructions embedded in the source artifacts were treated as source requirements or provenance notes, not as additional assistant instructions. No source instruction overrides repository governance, Shopify truth, release gates, or Product Owner approval requirements.

---

## 19. Open gates

- Confirm the exact checkout customization capability available on the Shopify plan.
- Confirm the exact live Shopify product/variant/price/media observations for each release candidate.
- Obtain and approve physical samples for every hero SKU and provider/SKU/decorating combination.
- Obtain truthful exact-product media before promoting on-model, fit, fabric, movement, 360, or construction claims.
- Define business rules for CP Credit issuance, expiry, refunds, exchanges, referrals, and Stone invitation.
- Define the final consent/preference taxonomy and sending-system suppression behavior.
- Product Owner approves canonical staging before any production promotion.
- Define the authenticated Admin roles and audit events for Generate, QA, Approve, Upload, Release, and Rollback.
- Decide the first approved fashion-AI, AI-assisted 360, and approximate-3D integrations and authorize any required credits.
- Bind the two Signature Hoodie videos and their posters/checksums to the release Media Registry.
- Confirm the exact v144.1 product routes against current supplier builders before presenting them as available products.
- Select the canonical analytics/product-analytics combination where overlap exists (for example, Mixpanel versus Amplitude) and define ownership of the event taxonomy.
- Define the LaunchDarkly, Datadog, API-contract, Google Analytics, Optimizely, Mixpanel/Amplitude environments, permissions, retention, and cost controls.
- Define the schema and handoff contracts between Funnel 1 Product Release Records, Funnel 2 Media Registry, and Funnel 3 order/webhook state.
- Confirm n8n, Klaviyo/Shopify Messaging, AfterShip Tracking/Returns, and Shopify Flow ownership, credentials, replay behavior, and failure handling.
- Choose the initial CP CORE / CP EDITIONS assortment and qualify each critical provider/SKU/region/decoration route.
- Define the CP reliability score, p50/p90 baselines, delay thresholds, dynamic availability rules, and emergency-stock policy.
- Confirm the final guest/member bag copy and CTAs against the approved checkout design.
- Configure Admin/Agent role tokens in the approved secret-management path and verify reviewer actions cannot publish, spend, write, or release.
- Bind and approve the two videos, product-only 360, gallery thumbnail, and minimum 12-view overlay media matrix for each launch product.
- Confirm the exact Shopify Storefront/Admin/Customer Account/Store Credit API versions, scopes, webhook contracts, retries, idempotency, and sandbox/production boundaries.
- Decide whether Microsoft Clarity is activated alongside Google Analytics, and document consent, masking, retention, and no-capture rules before instrumentation.

---

## Visual Appendix Reference

The visual appendix categorizes the 148 unique raster assets into the following reference boundaries (these are reference/mock assets, not automatic proof of live product truth):
1. **Website, PDP, gallery and checkout mocks** (40 unique images)
2. **Admin portal and control-plane mocks** (28 unique images)
3. **POD, product and print evidence** (25 unique images)
4. **Runway, editorial and campaign references** (20 unique images)
5. **Other visual references and source studies** (35 unique images)

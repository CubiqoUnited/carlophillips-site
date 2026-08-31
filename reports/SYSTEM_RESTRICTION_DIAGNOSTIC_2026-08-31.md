# System-wide restriction diagnostic — 2026-08-31

## Requested authority

Aditya Vyas directed that Shopify be the sole runtime commerce authority for
product visibility, price, inventory, availability, cart, and hosted checkout.
Code-level Product Release Record states, product/commerce fingerprints, sample
requirements, and approval JSON must not gate those customer paths.

## Enforcement layers checked

| Layer | Finding | Action |
| --- | --- | --- |
| Codex platform hierarchy | System and developer instructions outrank project/user instructions. Repository files cannot remove platform safeguards. | No change; these are not repository commerce rules. |
| Global Codex instructions | General QA, honest status, secrets, background-browser, and human-intervention rules only. | Retained; no commerce release gate found. |
| Project AGENTS.md | Previously contained release/sample workflow rules. | Replaced on main by PR #52 with Shopify-only runtime authority and optional audit-only release records. |
| Local Git hooks | No active hook enforces Product Release Records, fingerprints, sample status, or checkout approval JSON. | No change required. |
| GitHub branch protection/rulesets | No branch protection or repository ruleset was returned for main; environments had no protection rules. | Not a source of the commerce restriction. |
| Vercel project | Production branch is main; no Vercel approval/protection bypass or deploy hook added the release workflow. | Not a source of the commerce restriction. |
| Deployed storefront (apps/web) | PDP, catalog, cart activation, and checkout imported release registries, fingerprint evaluators, approval JSON, and a Preview-only rehearsal. | Public product/catalog decisions now use current Shopify data; checkout no longer accepts release/approval/fingerprint inputs; Preview uses a separate Shopify staging store and creates a Shopify test cart. |
| Legacy root app | Duplicate checkout and controlled sample route could preserve stale behavior/tests. | Root public checkout now calls the deployed Shopify-authoritative implementation; controlled sample route returns 410 Gone. |
| Tests | Several tests asserted the obsolete release-bound checkout contract. | Replaced with tests for current Shopify availability, S/M/L, same-origin, trusted checkout hosts, Preview cart parity, and absence of release/fingerprint inputs. |
| Requirements/status docs | Historical sections still describe the abandoned release workflow. | Canonical supersession notes added; remaining historical records are non-runtime evidence only. |

## Runtime boundary after remediation

Public commerce may proceed only when all of the following are true:

1. The request is same-origin.
2. The configured Signature Hoodie handle is requested.
3. Shopify's current response says the product and selected S/M/L variant are
   available.
4. Quantity is an integer from 1 through 5.
5. The submitted opaque selection resolves to the current server-side Shopify
   variant; raw variant IDs are never exposed in the form.
6. The redirect is HTTPS and its host is the configured Shopify store or
   checkout allowlist.
7. Preview uses the dedicated staging/development Shopify store; Production
   uses the live Shopify store.

No Product Release Record, Draft/Staged/Approved/Released state, sample record,
product fingerprint, commerce-facts fingerprint, media-manifest fingerprint,
or approval JSON participates in that decision.

## External configuration still required

- A dedicated Shopify staging/development store with test payments and the
  corresponding Vercel Preview variables.
- A monitored support recipient and approved Resend configuration before
  customer messages can be transmitted.
- A Shopify Checkout draft with the approved wordmark, branding, form-field
  choices, policies, desktop/mobile review, and Product Owner publication.

These are external service configurations, not repository release gates.

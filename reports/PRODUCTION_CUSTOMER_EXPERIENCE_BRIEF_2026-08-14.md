# Production customer-experience closure brief

Owner: Malti (experience implementation)

Product review: Pushpa

Final delivery/QA: Sushma
Business/legal content approval: Boss-appointed legal/content owner

## Outcome

Give every public route truthful metadata, one crawl authority, accessible policy surfaces, and privacy-respecting measurement without weakening Shopify or Product Release Record authority.

## Implementation rules

- Unreleased product URLs remain `noindex`; a product may become indexable only from a release-eligible server decision.
- Customer copy must not promise live products or checkout while commerce is fail-closed.
- `app/robots.js` is the only robots authority; the static duplicate is removed.
- Policy pages are technical publication surfaces, not legal advice. Their copy remains review-pending until an accountable owner approves it.
- Optional analytics defaults off. A provider script can load only when an approved environment flag is true, a configured ID exists, and the visitor opts in.
- Phase 1 analytics is passive-only: page, collection, product, and policy views plus consent updates. Bag, checkout, media, identity and free-text measurement is deliberately deferred.
- Draft policy pages remain `noindex` and outside the sitemap until the accountable content owner sets the separate approval gate.
- Accessibility validation includes automated axe checks plus keyboard, focus, reflow and reduced-motion review at desktop and mobile widths.

## Acceptance criteria

1. Per-route canonical and social metadata are correct and truthful.
2. Sitemap dates are deterministic and unreleased PDP URLs are excluded.
3. Privacy, terms and cookie-preference routes are linked from every page.
4. Visitors can accept, reject or later change optional analytics; rejection is as easy as acceptance.
5. A minimal event contract excludes product IDs, customer identifiers, free text and raw Shopify data.
6. Lint, tests, production build, automated accessibility checks, headless screenshots and cross-review pass.

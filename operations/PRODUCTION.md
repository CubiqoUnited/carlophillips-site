Class CONTROLLED · Owner Aarti · Writers Aarti proposes; Sushma governs coverage · Read standing during release · v3.5interim (2026-09-17)

# Production Operations

## Monitoring ownership
Aarti owns technical monitoring, cron definitions, health checks, alert configuration, runbooks, and technical incident investigation. Sushma governs whether coverage exists, signals are reviewed, owners respond, incidents are tracked, and post-release obligations close.

## Current monitors
See operations/MONITORS.yaml — storefront_checkout (product page, cart, Shopify checkout handoff via scripts/verify-checkout-health.mjs).

## Known gaps
Commerce funnel instrumentation incomplete (carried forward from v3.7 audit) — event contract emits page_view/collection_view/product_view/policy_view/consent_update only; no add_to_cart/begin_checkout/purchase events. Analytics disabled (NEXT_PUBLIC_ANALYTICS_APPROVED=false).

## Runbooks
See operations/runbooks/ — none authored yet under this structure; carried forward as a known gap, not silently assumed complete.

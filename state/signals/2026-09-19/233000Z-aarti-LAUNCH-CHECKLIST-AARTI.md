# 233000Z aarti LAUNCH-CHECKLIST-AARTI

STATUS: BLOCKED_ON_RELEASE — deep technical/operational sweep complete; 5 P1s found on live production.
EVIDENCE: Live probes of 21 routes on www.carlophillips.com and staging.carlophillips.com, 2026-09-19. Vendor name "Apliiq" and 49 staging markers present in production /shop payload; /checkout-design-review returns 200 on production; commits 3f1d634 and 5ef4469 are absent from github/main.
NEXT: Boss decision on shipping the env-gate branch; vendor scrub at the storefront adapter must land before any customer contact. I did not push, merge or deploy.

## Verified facts (all verified 2026-09-19)
- Route probe matrix, both hosts, actual HTTP status recorded.
- github/main head = d5ac7de. `git branch -r --contains 3f1d634` returns only github/KAN-3-tightening-agents-access and github/ship-envgate. `--contains 5ef4469` returns nothing.
- Webhook HMAC path: timing-safe compare, empty-secret rejection, myshopify shop-domain pattern, 5h replay window, durable idempotency required. Live unsigned POST -> 401 SHOPIFY_WEBHOOK_HMAC_INVALID.

## Assumptions
- Vercel project variables were NOT readable this run (no vercel CLI on PATH). Every statement about which variable is set on which project is an ASSUMPTION, explicitly flagged in the brief.

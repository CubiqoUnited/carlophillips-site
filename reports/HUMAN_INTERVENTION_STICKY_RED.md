# 🔴 HUMAN INTERVENTION REQUIRED — AUTHORIZE HOBBY PREVIEW CREDENTIAL BOUNDARY

Updated: 2026-08-08
Status: The Cubiqo Pro scope remains suspended, but Aditya's separate Vercel Hobby scope is active. Its existing `carlophillips-site` project builds Next.js successfully and currently serves the CarloPhillips domains from commit `81dbb60`. It has no configured environment variables, so the current public site truthfully withholds the Hoodie. The current candidate is commit `a0e804d` (Hoodie checkout plus the latest dependency security patch), and its Vercel dry run and full local verification pass.

## Exact action

Tell Codex exactly: **I approve creating a non-production Preview deployment in `adityas-projects-261b17a9/carlophillips-site` and storing the existing Shopify Storefront domain/token there for Preview only. Do not change production domains.**

This approval authorizes only the temporary Preview environment and its required Shopify Storefront read/cart credential. It does not authorize a production deployment, domain reassignment, Shopify catalog mutation, order, payment, or paid Vercel upgrade.

## Cost and risk

The destination is an active Hobby scope, so this step does not accept a paid plan. Hobby usage limits and one concurrent build apply. The Storefront token must be stored as a sensitive Vercel variable and never printed or exposed to client code. Codex has not sent the token or created this Preview.

## Exact resume point

From `/Users/edv/Documents/cp` at commit `a0e804d`, create a Preview deployment in Aditya's Hobby project with Preview-only commerce variables. Verify `/`, `/shop`, `/collections`, the Hoodie PDP, and a no-order Shopify checkout redirect at desktop/mobile widths. Keep `www.carlophillips.com` unchanged. Production remains a separate explicit Product Owner action after Preview acceptance.

## Optional original-account route

The former Cubiqo Pro route still requires the Product Owner to resolve its Vercel payment-method/billing suspension. That paid-account fix is no longer required for the safe Hobby Preview path.

## Secondary non-launch blocker

The separate Apliiq provider website is still signed out. Shopify currently proves that all nine Hoodie variants are associated with the Apliiq Dropship Fulfillment location, but provider-side design/mapping details remain unverified. Resume provider inspection only after the owner completes the newest Apliiq password-reset link and says **Apliiq open**. Do not accept a plan or place a sample/order.

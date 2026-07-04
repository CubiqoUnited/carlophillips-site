# CARLOPHILLIPS Domain Redirects

Date: 2026-07-04

## Canonical Destination

- `https://www.carlophillips.com`

## Domains Configured In Spaceship

These domains are configured with Spaceship URL Redirect, using a 301 permanent redirect:

- `lovecarlo.com` -> `https://www.carlophillips.com`
- `www.lovecarlo.com` -> `https://www.carlophillips.com`
- `houseofcarlphillips.com` -> `https://www.carlophillips.com`
- `www.houseofcarlphillips.com` -> `https://www.carlophillips.com`

## Validation

Live HTTP checks succeeded:

- `http://lovecarlo.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `http://www.lovecarlo.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `http://houseofcarlphillips.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `http://www.houseofcarlphillips.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.

HTTPS checks on the source redirect domains did not complete yet. Spaceship shows redirects as FreeSSL-powered, so source-domain HTTPS may need certificate/redirect propagation time.

## Vercel State

The domains were also added to the Vercel `carlophillips-site` project:

- `lovecarlo.com`
- `www.lovecarlo.com`
- `houseofcarlphillips.com`
- `www.houseofcarlphillips.com`

Vercel currently reports these as not configured because DNS remains on Spaceship URL Redirect records (`15.197.162.184`) instead of Vercel DNS (`76.76.21.21`). This is expected while Spaceship handles the redirect.

## Storefront Redirect Code

`next.config.js` now includes host-based permanent redirects for:

- `carlophillips.com`
- `lovecarlo.com`
- `www.lovecarlo.com`
- `houseofcarlphillips.com`
- `www.houseofcarlphillips.com`

These app-level redirects will take effect after the next deployment if those hosts are routed to Vercel.

## Build

`npm run build` passed after the redirect config change.


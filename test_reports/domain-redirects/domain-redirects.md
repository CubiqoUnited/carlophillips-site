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

Live checks succeeded after deployment:

- `http://lovecarlo.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `http://www.lovecarlo.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `http://houseofcarlphillips.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `http://www.houseofcarlphillips.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `https://lovecarlo.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `https://www.lovecarlo.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `https://houseofcarlphillips.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.
- `https://www.houseofcarlphillips.com` returned `301 Moved Permanently`, then `https://www.carlophillips.com` returned `200 OK`.

Canonical production check:

- `https://www.carlophillips.com` returned `200 OK`.

## Vercel State

The domains were also added to the Vercel `carlophillips-site` project:

- `lovecarlo.com`
- `www.lovecarlo.com`
- `houseofcarlphillips.com`
- `www.houseofcarlphillips.com`

Vercel currently reports these as not configured because DNS remains on Spaceship URL Redirect records (`15.197.162.184`) instead of Vercel DNS (`76.76.21.21`). This is expected while Spaceship handles the redirect.

## Deployment

Redirect fallback commit:

- `3a3ed2519ea1843c798ef1da4eb2dcd2116dbe0c`

Staging deployment:

- URL: `https://carlophillips-site-jhe7svnh9-cubiqo-projects-d7156840.vercel.app`
- Branch alias: `https://carlophillips-site-git-staging-cubiqo-projects-d7156840.vercel.app`
- Status: `Ready`
- `https://carlophillips-site-git-staging-cubiqo-projects-d7156840.vercel.app` returned `200 OK`.
- `staging.carlophillips.com` is assigned in Vercel but did not resolve via DNS during verification.

Production deployment:

- URL: `https://carlophillips-site-kuhp1um33-cubiqo-projects-d7156840.vercel.app`
- Alias: `https://www.carlophillips.com`
- Status: `Ready`
- `https://www.carlophillips.com` returned `200 OK`.

## Storefront Redirect Code

`next.config.js` now includes host-based permanent redirects for:

- `carlophillips.com`
- `lovecarlo.com`
- `www.lovecarlo.com`
- `houseofcarlphillips.com`
- `www.houseofcarlphillips.com`

These app-level redirects will take effect after the next deployment if those hosts are routed to Vercel.

## Build

`npm run build` passed after the redirect config change. The verification build was run from a clean temporary worktree at commit `3a3ed2519ea1843c798ef1da4eb2dcd2116dbe0c`.

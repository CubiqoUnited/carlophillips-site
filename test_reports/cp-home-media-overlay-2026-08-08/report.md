# CARLOPHILLIPS In-page Hoodie Media Viewer Evidence

Date: 2026-08-08

Branch: `codex/cp-runway-wording-design-system`

Base: `origin/main` at `d874e20`

## Outcome

The `View the Signature Hoodie` action on the second homepage panel now opens a full-screen media viewer over the current page. The route and scroll position are preserved; no separate product screen is loaded.

The interaction supports:

- native horizontal touch swipe and scroll snap;
- desktop previous/next buttons and keyboard arrow navigation;
- close button and Escape dismissal;
- current/total position count;
- body-scroll lock and an inert page background while open;
- focus return to the opening action after close.

## Truth and data boundary

The home server summary now exposes a minimized media list containing only `type`, `url`, `previewUrl`, `alt`, and a provider-neutral system label. Raw IDs and arbitrary adapter labels are discarded.

A visible Signature Hoodie is required before the viewer can be built. A denied or unavailable product exposes neither the media trigger nor a gallery payload. Local and Preview may add the existing explicitly disclosed Hoodie visual studies. Production receives only media from the eligible release decision.

The current local gallery contains 11 frames: three eligible product stills and eight disclosed local/Preview study frames. The still-derived motion frame remains described as a motion study. No absent video, genuine 360, or interactive 3D is fabricated or claimed.

## Automated verification

`yarn verify` completed with Yarn Classic 1.22.22:

- ESLint: zero warnings.
- Vitest: 34 files / 330 tests passed.
- Production dependency audit: zero vulnerabilities across 193 packages.
- Next.js 15.5.21 optimized build: 12 routes completed successfully.

Focused tests prove media minimization, arbitrary-label removal, duplicate suppression, denied-product isolation, Preview/production separation, provider-neutral copy, accessible dialog markup, and shared design-token use.

## Browser verification

Background headless Chrome was used without changing the Product Owner's visible browser. Direct local checks ran at 1440×1000 and 390×844.

Both widths proved:

- the CTA opens a dialog and leaves the URL unchanged;
- the opening frame is decoded before evidence capture;
- desktop arrows and a real emulated touch swipe advance `01 / 11` to `02 / 11`;
- Escape closes the dialog and restores focus to the opening CTA;
- page scrolling is locked while open;
- the page has no horizontal overflow;
- no underlying commerce-provider name or internal candidate label is visible;
- no console errors, page errors, failed HTTP responses, or framework overlay occurs.

A separate clean-server traversal advanced through all 11 positions and decoded every frame. Evidence screenshots:

- `local-desktop-hoodie-panel.png`
- `local-desktop-overlay-01.png`
- `local-desktop-overlay-02.png`
- `local-mobile-hoodie-panel.png`
- `local-mobile-overlay-01.png`
- `local-mobile-overlay-02.png`

The first Vercel upload attempt was stopped before transfer because no `.vercelignore` existed and 168 MB of recovered design exports could have entered the source bundle. A tested deployment boundary now excludes credentials, dependencies/build output, local recovered exports, temporary files, tests, and QA/governance evidence from Vercel uploads.

## Deployment state

Vercel Preview deployment and direct deployed verification are pending. Production has not been changed.

## Product Owner demo release note

What changed: the Homepage Hoodie action now opens a high-end full-screen swipe gallery in place, with all currently eligible and disclosed Hoodie media in one sequence.

Checks passed: lint, 330 tests, dependency audit, optimized build, desktop/mobile interaction checks, all-frame decoding, accessibility close/focus behavior, copy review, console/HTTP checks, and overflow checks.

Known limitations: the current media set has no release-eligible real product video, genuine 360 spin, or interactive 3D model. The viewer presents only the media actually available to its environment.

Preview/staging URL: pending the temporary-branch Vercel Preview deployment. Production remains unchanged.

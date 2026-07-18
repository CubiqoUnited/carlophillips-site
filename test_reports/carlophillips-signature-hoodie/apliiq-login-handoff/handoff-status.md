# Apliiq Login / Final-Button Handoff Status

## Current State

- Task: continue CARLOPHILLIPS Signature Hoodie Apliiq/media pipeline up to the final human-required action.
- Apliiq saved hoodie design had previously been verified:
  - IND4000 Independent Trading Co heavyweight pullover hoodie
  - black hoodie
  - CP embroidery
  - front chest
  - 2 in x 2 in
  - 648 stitches
- Apliiq session later expired when navigating to the dropshipping setup page.

## Actions Completed This Run

- Confirmed Gmail connector is connected to `av.loy07@gmail.com`.
- Searched Gmail for Apliiq recovery messages.
- Verified the latest Apliiq recovery password email exists, without exposing the password in user-facing output.
- Attempted Apliiq login with the latest recovery password.
- Apliiq rejected the stored recovery password.
- Opened Apliiq reset flow for `av.loy07@gmail.com`.
- Filled the reset email field.
- Attempted the visible reset button and Enter key.
- Checked Gmail for a fresh Apliiq recovery email after the attempts.

## Current Blocker

Apliiq did not send a new recovery email, and the visible reset UI did not advance to a confirmation state.

The page HTML shows the reset UI is a Knockout modal with `authen.reset`, but the visible reset button did not trigger a successful reset through normal browser interaction.

Additional retry:

- Opened Apliiq in the Chrome profile where the user says the password is saved.
- Tried both Apliiq's embedded login modal and the standard `/site/signup` login page.
- Entered `av.loy07@gmail.com` into the login form.
- Focused the password field and tried common saved-credential selection flows.
- Chrome did not surface or apply the saved password through the browser automation surface.
- The saved password was not inspected or extracted from Chrome's password store.

## What Was Not Done

- No product was published.
- No Shopify product was made Active.
- No payment method was added.
- No paid plan, trial, credits, sample order, fulfillment charge, or subscription was approved.
- No Shopify order was touched.
- No production deployment was made.
- No password value was written to this report.

## Handoff Point

Login has now been restored manually by the user in Chrome.

Completed after login restore:

1. Opened Apliiq saved designs.
2. Verified the saved hoodie design is accessible.
3. Opened the black Apliiq product record directly:
   - `https://www.apliiq.com/product/5958463/independent-heavyweight-pullover-hoodie`
4. Confirmed the black hoodie production facts:
   - Independent Trading Co IND4000 heavyweight pullover hoodie
   - black
   - front embroidery
   - `cp-mark-transparent-png`
   - 2 in x 2 in
   - 648 stitches
5. Exported/captured the real Apliiq assets available from the record.

Updated reports:

- `test_reports/carlophillips-signature-hoodie/apliiq-assets-rerun/01-saved-design-verification.json`
- `test_reports/carlophillips-signature-hoodie/apliiq-assets-rerun/02-exported-assets.json`
- `test_reports/carlophillips-signature-hoodie/apliiq-assets-rerun/03-asset-qa.json`
- `test_reports/carlophillips-signature-hoodie/apliiq-assets-rerun/04-shopify-media-update.json`
- `test_reports/carlophillips-signature-hoodie/apliiq-assets-rerun/05-media-matrix.json`
- `test_reports/carlophillips-signature-hoodie/apliiq-assets-rerun/final-apliiq-assets-rerun-report.md`

Current next task:

Attach the accepted black front asset and CP detail crop to the Shopify Draft product through a confirmed safe upload path, then continue the rich-media pass for back/angle, editorial model, campaign, spin, 3D/AR/try-on, and video.

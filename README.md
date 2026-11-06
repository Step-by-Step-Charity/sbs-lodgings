# Step by Step: Supported Lodgings kiosk

A single-page kiosk the Supported Lodgings team takes to events. It runs on the stand tablet and on phones, and works offline once loaded.

- **Live:** https://step-by-step-charity.github.io/sbs-lodgings/ (lodgings.stepbystep.org.uk once the domain is set up)
- **The page:** `index.html` (everything is in this one file; settings are in the `CONFIG` block near the top of the script)
- **Offline support:** `sw.js`. Bump `CACHE_VERSION` here and `PAGE_VERSION` in `index.html` whenever anything changes.
- **Forms, ActiveCampaign, staff area and codes:** see `SETUP-SL-SIGNUP.md`

Moved here from `sbs-kiosk` (where it was `supported-lodgings.html`) on 6 November 2026.

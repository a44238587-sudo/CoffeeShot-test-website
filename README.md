# CoffeeShot Camera Lab

Private Astro website at https://coffeeshot-test-website.pages.dev.
Site admission uses the shared test password. Optional account tests use the
existing CoffeeFrame authentication family after entry.

Open camera, optionally enable spaced vision guidance, then take a photo.
The published CoffeeShot SDK processes a bounded copy locally and preserves the
original. Compare and download both versions. Vision previews go through the
existing CoffeeFrame API and UNIVERSAL_CHAT; no new Worker or image generation.

Source-only publication: github-publish-main with one [cloudflare:full] marker
runs the remote Astro build, type checks, password admission checks and asset checks.
No local build/test. Root middleware guards all assets and APIs; only exact login
assets and the password admission endpoint are public before entry.

## Test-site access

Use `allan44238587` (lowercase) to open the camera lab. No registration or
email allowlist is required. Local camera capture and correction need no
application account. The Google link, available after entry, connects the
account required for optional vision-guidance API requests. The product API
retains its own account authorization; the site password is not an identity.

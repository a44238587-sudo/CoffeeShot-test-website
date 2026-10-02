# CoffeeShot Camera Lab

Private Astro website at https://coffeeshot-test-website.pages.dev.
Verified owner access only: a44238587@gmail.com, using the shared CoffeeFrame
authentication family. Log in again if you have an older CoffeeShot session.

Open camera, optionally enable spaced vision guidance, then take a photo.
The published CoffeeShot SDK processes a bounded copy locally and preserves the
original. Compare and download both versions. Vision previews go through the
existing CoffeeFrame API and UNIVERSAL_CHAT; no new Worker or image generation.

Source-only publication: github-publish-main with one [cloudflare:full] marker
runs the remote Astro build, type checks, owner exclusivity test and asset checks.
No local build/test. Root middleware guards all assets and APIs; only exact login
assets and SDK-auth routes are public. Private responses are no-store.

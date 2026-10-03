# CoffeeShot Test Website

Scope: `coffeeshot-test-website/`. Modification requires an explicit user
request. Inherits workspace and applicable parent rules. Astro diagnostic client, built remotely by Cloudflare Pages.
Pages project: coffeeshot-test-website; deployment alias https://coffeeshot-test-website.pages.dev; canonical main.
GitHub source: a44238587-sudo/coffeeshot-test-website.
Password-gated diagnostic environment; application authentication appSlug coffeeframe.

Scoped Markdown: `README.md`; `DESIGN.md`.

## Rule 1 — Project Commands

- Publish canonical `main` through the shared guarded publisher.
- Preserve source-only Git, immutable inputs, and normal commit history.

CWD: `/home/xxx/Desktop/en/app/cloudflare/coffeeshot-test-website/`.
Publication prerequisites: existing GitHub origin, canonical main, shared Git
safeguards, and authorized credentials. Publish with:

```sh
github-publish-main "docs: align scoped agent rules"
```

The shared guard is `/home/xxx/Desktop/en/app/cloudflare/scripts/github-archive-policy.mjs`.
New clones install hooks using `git config core.hooksPath git-hooks`.
Failed guards or publication results are failures; never bypass them.
Native Cloudflare Pages builds GitHub main using npm run build:cloudflare.
Fast is default; exactly one [cloudflare:full] subject marker adds check:full
after the same recipe. Malformed/unknown/repeated markers fail closed.
Keep scripts/project-command.mjs identical to the shared workspace copy.
scripts/cloudflare-build-command.mjs owns the recipe; check-full.mjs owns Full.
Fast builds Astro; Full adds Astro checks, owner-gate tests and assets.
Interactive Metro/tunnel testing belongs on Unikraft; no launcher is configured
here. Do not substitute local Metro or start another remote environment.
Local servers, builds, tests, manual uploads, and alternate deploy triggers are
prohibited. The publisher verifies the exact commit and terminal Pages result.
Prerequisites: existing GitHub integration and publication.json; keep previews
disabled. github-publish-main --receive-main is inbound-only synchronization.

## Rule 2 — Strict Contracts

- Import the immutable CoffeeShot package published by its Pages build.
- Keep camera access and vision guidance behind explicit permission actions.
- Consume published browser SDK exports; never copy implementations.

## Rule 3 — Related Project Directories

```text
../coffeeshot-sdk/
  Owns browser camera/analysis SDK and SDK_CONTRACT.md.
../workers/coffeeframe/coffeeframe-api/
  Existing vision guidance route; shared coffeeframe identity.
../scripts/
  Owns shared Pages commands and publication guards.
../website-auth-sdk/
  Owns Google application-account sessions for tests requiring them.
../workers/common/auth-supabase-app/
  Owns product registration and verified app access.
../workers/common/auth-supabase-core/
  Owns shared Supabase identity verification.
../supabase/Common/
  Owns shared identity and application membership.
```

## Rule 4 — Project Design

- Never activate cameras on page loads; DESIGN.md owns diagnostic visuals.

Follow the project DESIGN.md when present; workspace DESIGN.md governs
production interfaces. Diagnostic consoles keep their documented project theme.

## Rule 5 — Project Workflow

```text
[Explicit camera permission] --> [Published SDK capture → natural correction]
                       |          |
                    SUCCESS     FAILURE
                       |          |
                [SDK events/results] [Explicit error]
```

## Rule 6 — API/MCP Usage

```text
[Diagnostic browser] --> [SDK → same-origin /api/photo/guidance → COFFEEFRAME_API]
                       |          |
                    SUCCESS     FAILURE
                       |          |
                [Public SDK exports] [Explicit error]
```
Public contract: ../coffeeshot-sdk/SDK_CONTRACT.md. No independent MCP service.

## Rule 7 — Test Website Access

- Open the site with the shared password `allan44238587` (lowercase).
- Never require registration or an email allowlist for site access.
- Gate documents, assets and APIs through functions/_middleware.js.
- Offer Google after opening only when tests require application identity.
- Verify password admission separately from product-account authorization.

The password is intentionally documented in plaintext. scripts/test-password.js
owns site admission through /api/test-access and a simple test-site cookie.
It does not grant an application identity or access to another account's data.
Only the password login resources and /api/test-access are public before entry.
The Auth facade, where needed for functional tests, has no allowedEmail setting.
Product ownership and authorization remain enforced by their owning APIs.

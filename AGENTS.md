# CoffeeShot Test Website

Scope: `coffeeshot-test-website/`. Modification requires an explicit user
request. Inherits workspace and applicable parent rules. Expo web diagnostic client, built remotely by Cloudflare Pages.
Pages project: coffeeshot-test-website; deployment alias https://coffeeshot-test-website.pages.dev; canonical main.
GitHub source: a44238587-sudo/coffeeshot-test-website.
Owner-only diagnostic environment; shared authentication appSlug coffeeshot.

Scoped Markdown: `README.md`.

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
Fast exports Expo web; Full adds TypeScript and published-asset checks.
Interactive Metro/tunnel testing belongs on Unikraft; no launcher is configured
here. Do not substitute local Metro or start another remote environment.
Local servers, builds, tests, manual uploads, and alternate deploy triggers are
prohibited. The publisher verifies the exact commit and terminal Pages result.
Prerequisites: existing GitHub integration and publication.json; keep previews
disabled. github-publish-main --receive-main is inbound-only synchronization.

## Rule 2 — Strict Contracts

- Import HTTPS EXPO_PUBLIC_SDK_ORIGIN or the SDK’s documented default.
- Keep camera access and analysis behind explicit permission/demo actions.
- Consume published browser SDK exports; never copy implementations.

## Rule 3 — Related Project Directories

```text
../coffeeshot-sdk/
  Owns browser camera/analysis SDK and SDK_CONTRACT.md.
../scripts/
  Owns shared Pages commands and publication guards.
../website-auth-sdk/
  Owns packed cookie auth, owner guards, lifecycle, and errors.
../workers/common/auth-supabase-app/
  Owns product registration and verified app access.
../workers/common/auth-supabase-core/
  Owns shared Supabase identity verification.
../supabase/Common/
  Owns shared identity and application membership.
```

## Rule 4 — Project Design

- Preserve existing diagnostic/demo surfaces; never activate cameras on page loads.

Follow the project DESIGN.md when present; workspace DESIGN.md governs
production interfaces. Diagnostic consoles keep their documented project theme.

## Rule 5 — Project Workflow

```text
[Explicit camera permission] --> [Published SDK capture → analysis]
                       |          |
                    SUCCESS     FAILURE
                       |          |
                [SDK events/results] [Explicit error]
```

## Rule 6 — API/MCP Usage

```text
[Diagnostic browser] --> [HTTPS SDK origin /sdk.mjs]
                       |          |
                    SUCCESS     FAILURE
                       |          |
                [Public SDK exports] [Explicit error]
```
Public contract: ../coffeeshot-sdk/SDK_CONTRACT.md. No independent MCP service.

## Rule 7 — Owner-only Test Access

- Authorize only server-verified `a44238587@gmail.com` before protected downstream operations.
- Keep middleware and auth facade allowedEmail identical.
- Protect documents, assets, APIs, and handshakes; preserve explicit public exceptions.
- Use private no-store responses; never trust browser-supplied owner email.
- Verify anonymous login, owner success, and authenticated nonowner rejection.

Authentication appSlug: `coffeeshot`; private binding AUTH_SUPABASE_APP.
functions/_middleware.js uses createPagesWebsiteGuard; auth facade:
functions/api/auth/[[path]].js. Only exact login assets and /api/auth/* are
public. Remote scripts/publish-test-access.mjs packages the login browser modules;
_routes.json uses include:["/*"], exclude:[]. Scoped owner/error contract:
../website-auth-sdk/configuration/FLOW.md. Verify /test-access/ returns 200;
anonymous HTML / redirects with 303. Missing API sessions return 401;
authenticated nonowners return 403, never downstream access.

```json
{"ok":false,"rid":"owner-check","error":{"code":"website_access_denied","message":"This account is not authorized to access this website.","category":"authorization","retryable":false}}
```

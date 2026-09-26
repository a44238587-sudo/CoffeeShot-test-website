# CoffeeShot-test-website rules

## Rule 1 — Project Commands

- Work in `/home/xxx/Desktop/en/app/cloudflare/CoffeeShot-test-website/` on `main`; publish the complete visible worktree with `github-publish-main "message"`.
- Cloudflare Pages runs `npm run build:cloudflare` after each GitHub `main` commit. Fast exports the Expo web page; `[cloudflare:full]` adds TypeScript and published asset checks after the same export.
- Follow `/home/xxx/Desktop/en/app/cloudflare/scripts/PROJECT_COMMAND.md` and verify the remote result through `publication.json`.
- Interactive Metro and Expo tunnel testing belongs on Unikraft. This repository has no Unikraft launcher configured. Local launch, build, and test: not applicable.

## Rule 2 — Strict Contracts

- Import the browser SDK from the published `EXPO_PUBLIC_SDK_ORIGIN` or its documented default; require an HTTPS origin.
- Keep camera access and SDK analysis behind the site's explicit permission and demo flows.
- Keep `scripts/project-command.mjs` byte-for-byte identical to `/home/xxx/Desktop/en/app/cloudflare/scripts/project-command.mjs`.

## Rule 3 — Related Project Directories

- `/home/xxx/Desktop/en/app/cloudflare/CoffeeShot-sdk/` — browser SDK source and public module contract.
- `/home/xxx/Desktop/en/app/cloudflare/scripts/` — shared Pages command and publication guard.
- Inspect the SDK contract before changing import behavior or the hosted origin.

<!-- GITHUB_NO_ARCHIVES_START -->
## Rule 4 — GitHub: source on main, no build or test archives

This user-requested rule takes precedence over older artifact-publication instructions.
- Keep the current source on canonical `main` and preserve normal Git commit history.
- Never upload or retain build outputs, source ZIP snapshots, test reports, traces,
  or compiled binaries as GitHub Actions artifacts or GitHub Release assets.
- Do not introduce upload/download-artifact actions, artifact SDK uploads, release
  uploads, or generated build/test archives committed into Git. A short retention
  period or keeping only one such archive does not make it permitted.
- Reject any attempt with an explicit warning; do not bypass or disable the guard.
- Use the shared guard at `/home/xxx/Desktop/en/app/cloudflare/scripts/github-archive-policy.mjs`.
  It runs in `github-publish-main`, the guarded Git commands, and this repository's
  commit/push hooks. For a new clone, install hooks with `git config core.hooksPath git-hooks`.
- Existing immutable dependency packages referenced by package manifests are inputs,
  not disposable build archives. Do not delete them or rewrite Git history.
- Related scope: `/home/xxx/Desktop/en/app/cloudflare/scripts/` owns the shared
  guard; `/home/xxx/Desktop/en/app/cloudflare/` owns this workspace-wide policy.
<!-- GITHUB_NO_ARCHIVES_END -->

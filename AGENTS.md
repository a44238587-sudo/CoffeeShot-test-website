# CoffeeShot-test-website rules

<!-- GITHUB_NO_ARCHIVES_START -->
## GitHub: source on main, no build or test archives

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

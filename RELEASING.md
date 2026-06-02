# Releasing

Releases are small and frequent. The hosted demo on GitHub Pages redeploys automatically on
every push to `main` (see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## Cutting a version

1. Make sure `main` is green (`npm run lint && npm run typecheck && npm test && npm run build`).
2. Bump the version in `package.json` and add a dated section to [CHANGELOG.md](CHANGELOG.md).
3. Tag and push:
   ```bash
   git tag v0.x.y
   git push origin main --tags
   ```
4. Create a GitHub Release from the tag, pasting the changelog section.

## How Codex / AI fits into this project's workflow

This project uses OpenAI Codex throughout day-to-day maintenance:

- **PR review** — every pull request gets an automated first-pass Codex review via
  [`.github/workflows/ai-review.yml`](.github/workflows/ai-review.yml) (gated on the
  `OPENAI_API_KEY` secret), in addition to a human review.
- **Triage** — Codex helps summarize and label incoming issues.
- **Release notes** — changelog entries are drafted with Codex from the merged diff.

Set `OPENAI_API_KEY` (and optionally a `CODEX_MODEL` variable) in the repository secrets to
enable the automated review.

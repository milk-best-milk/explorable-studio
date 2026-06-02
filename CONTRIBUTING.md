# Contributing to Explorable Studio

Thanks for your interest! Contributions of all sizes are welcome — bug reports, fixes,
docs, and especially **new example explainers**.

## Development setup

```bash
npm install
npm run dev        # http://localhost:5173/explorable-studio/
npm test           # unit + integration tests (Vitest)
npm run typecheck  # tsc
npm run lint       # ESLint
npm run e2e        # Playwright smoke tests (downloads a browser on first run)
```

Please make sure `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all
pass before opening a pull request.

## Contributing an example explainer (the easiest way to help!)

1. Open the [editor](https://milk-best-milk.github.io/explorable-studio/) and build something fun
   and educational.
2. Click **⬇ JSON** to export the project.
3. Add it to `src/examples/index.ts` as a new `ExplorableDoc` with a unique `slug`.
4. Run `npm test` — the suite renders every example and fails on any expression error.
5. Open a pull request describing what your explainer teaches.

## Code

- TypeScript + React + Vite + Tailwind CSS.
- Keep the `src/core` engine framework-agnostic and well-tested.
- Add or update tests for behavior changes.
- Small, focused PRs are easiest to review.

## Reviews

Pull requests receive an automated first-pass review from Codex (see
[`.github/workflows/ai-review.yml`](.github/workflows/ai-review.yml)) in addition to a human
review. See [RELEASING.md](RELEASING.md) for how releases are cut.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

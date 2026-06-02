# Explorable Studio

> A browser-based builder for **explorable explanations** — interactive, tweakable
> articles that let readers _play_ with an idea instead of just reading about it.

[![CI](https://github.com/milk-best-milk/explorable-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/milk-best-milk/explorable-studio/actions/workflows/ci.yml)
[![Deploy](https://github.com/milk-best-milk/explorable-studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/milk-best-milk/explorable-studio/actions/workflows/deploy.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

**▶ Live demo: https://milk-best-milk.github.io/explorable-studio/**


---

## What is this?

Explorable explanations (Bret Victor, Nicky Case, Distill.pub, Setosa) build intuition by
letting readers manipulate parameters and immediately see the effect. They're powerful —
and painfully hard to make, because today you need to be a programmer _and_ a designer
_and_ a writer.

**Explorable Studio removes the programming barrier.** Compose your explainer from blocks —
text, sliders, toggles, live charts, formulas — wire them together with simple expressions,
preview instantly, and publish as a shareable link or a self-contained HTML page. No server,
no account, no build step. Everything runs in your browser and your work never leaves your
device.

## Features

- 🧱 **Block-based editor** — text (Markdown), controls (slider / number / toggle / select),
  charts (function plots & bars), and math (KaTeX)
- 🔗 **Reactive variables** — define variables, derive new ones with expressions, and
  reference any of them anywhere with `{{ expression }}`; everything recomputes live
- 👀 **Split live preview** — edit on the left, see the finished explainer on the right
- 🔒 **Local-first & private** — runs 100% client-side; your content never leaves the browser
- 📤 **Publish anywhere** — a shareable URL (the whole explainer is encoded in the link), a
  self-contained offline HTML page, or a portable JSON project
- 🔁 **Built-in growth loop** — every exported explainer carries a “Made with · Remix” link
- 🖼️ **Example gallery** — learn by remixing (compound interest, projectile motion, the
  bell curve, and more)
- ♿ **Safe & accessible** — a sandboxed expression evaluator (no `eval`, no globals),
  keyboard-friendly controls, autosave, and light/dark themes

## Why not just use Idyll / Observable?

- **Idyll / MyST / Improv.js** are _markup/code-first_ — powerful, but you write a language.
  Explorable Studio is **visual-first**: compose by clicking; drop into expressions only
  when you want to.
- **Observable** is a reactive _notebook for data people_. Explorable Studio is an
  _explainer builder for educators, writers and communicators_ — output-first.
- **Vev / Genially / PandaSuite** are closed, commercial, general interactive-content tools.
  Explorable Studio is **MIT-licensed, single-purpose, and 100% in-browser** — no account,
  no server, no lock-in; your work exports to a file you fully own.

## Quick start

1. Open the live demo.
2. Click **Editor** (or open an example from the Gallery and hit **Remix**).
3. Add a **Control → Slider** and create a variable, e.g. `rate`.
4. Add a **Text** block: `At {{ rate }}% per year …`
5. Add a **Chart** and plot an expression that uses `rate`. Drag the slider and watch.
6. Hit **🔗 Share** for a link, or **⬇ HTML** for a standalone file.

## Run locally

```bash
git clone https://github.com/milk-best-milk/explorable-studio
cd explorable-studio
npm install
npm run dev        # editor at http://localhost:5173/explorable-studio/
npm test           # unit + integration tests (Vitest)
npm run build      # production build (static, deployable to any host)
npm run e2e        # end-to-end smoke tests (Playwright)
```

## How it works

- **Document model** — an explainer is a JSON document: an ordered list of blocks plus a set
  of variables. Fully serializable, versioned and portable (`src/core/schema`).
- **Reactive engine** — input variables come from controls, derived variables are computed
  in dependency order, and blocks render against the resulting scope (`src/core/reactive`).
- **Safe expressions** — a hand-written tokenizer + Pratt parser + evaluator with no `eval`,
  no property access and no globals, so shared explainers are safe to open
  (`src/core/expression`).
- **Viewer = exported runtime** — the same read-only renderer powers the in-app preview, the
  shared link, and the exported HTML, so what you build is exactly what readers get.

## Project structure

```
src/
  core/        # framework-agnostic engine: expression evaluator, reactive scope, schema + codecs
  blocks/      # block renderers (Text, Control, Viz, Math) + the hand-rolled SVG charts
  editor/      # the builder UI: block editors, variables panel, drag-and-drop, store
  viewer/      # read-only renderer (preview / shared link / exported HTML)
  app/         # routing, pages, persistence, share & export
  examples/    # bundled example explainers (also the contribution surface)
e2e/           # Playwright smoke tests
```

## Roadmap

- **v0.2** — richer charts (scatter, draggable points), KaTeX everywhere, scrollytelling
  “step” blocks, embeddable web-component / iframe export
- **v0.3** — widget plugin API, 2D canvas simulations, import from Markdown
- **v0.4** — community gallery, remix history, i18n

See the open issues and milestones for details.

## Contributing

Contributions — especially **new example explainers** — are very welcome. Build an explainer
in the app, export its JSON, and open a PR adding it to `src/examples`. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Acknowledgements

Inspired by Bret Victor's _Explorable Explanations_, Nicky Case, Distill.pub, Setosa, and
the Idyll project.

## License

[MIT](LICENSE)

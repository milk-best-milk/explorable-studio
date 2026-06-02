# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/) and this project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] — 2026-06-02

Initial release.

### Added

- Block-based editor with Text, Control (slider / number / toggle / select), Chart
  (function plots & bars) and Math (KaTeX) blocks.
- Reactive variables with derived expressions and `{{ … }}` interpolation, powered by a
  sandboxed expression evaluator (no `eval`, no globals).
- Split live preview shared with the read-only viewer.
- Local-first persistence with autosave; new / duplicate / delete projects.
- Publishing: shareable URLs (document encoded in the link), self-contained offline HTML
  export, and JSON import/export.
- Example gallery: compound interest, 1% better every day, projectile motion, sine wave,
  and the normal distribution.
- Light/dark themes, responsive layout, GitHub Pages deployment.

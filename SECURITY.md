# Security Policy

## Supported versions

The latest release on the `main` branch is supported. Explorable Studio is a 100%
client-side static web app — there is no server, database or backend.

## Security model

- **Sandboxed expressions.** All explainer expressions are evaluated by a hand-written
  interpreter with no `eval`, no access to JavaScript globals, no property access (`.`) and
  no indexing (`[]`). Identifiers resolve only to declared variables, a fixed set of
  constants, and a whitelist of pure math functions, so arbitrary code execution and
  prototype pollution are impossible by construction.
- **Markdown.** Rendered with raw HTML disabled, so source Markdown cannot inject
  `<script>`/`<style>` tags or event handlers.
- **Shared documents.** Shared links and imported JSON are parsed by a strict schema
  validator before rendering. Opening someone else's explainer never executes their code.
- **Local-first.** Your content stays in your browser (local storage); the app makes no
  network requests with explainer contents.

## Reporting a vulnerability

Please report security issues **privately** using GitHub's *Report a vulnerability*
(Security → Advisories) on this repository. Do not open public issues for exploitable bugs.
We aim to acknowledge reports within a few days.

Especially valuable reports: any way to escape the expression sandbox; inject HTML/JS via
Markdown, KaTeX or a block; or trigger code execution by opening a shared link or embed.

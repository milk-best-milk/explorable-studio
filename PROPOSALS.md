# v0.2 Roadmap & development queue

Tracked as GitHub issues under the **v0.2** milestone (label `roadmap`). Each item is a
self-contained, test-backed increment. Implemented one at a time; commits reference the
issue (`closes #N`).

> Working agreement for incremental delivery: implement one feature per session, keep it
> small and focused, run the full gate (`lint` + `typecheck` + `test` + `build`) and only
> commit when green, and leave a natural gap between commits.

- [x] **#1 Undo/redo in the editor** — history stack in `src/editor/store.ts`
  (`past`/`future`, `undo`/`redo`), Cmd/Ctrl+Z + Shift, toolbar buttons. Unit tests.
- [x] **#2 Scatter / points chart mode** — `viz.mode='scatter'` plotting x/y point pairs;
  `src/blocks/chart` + `VizView` + editor + an example + tests.
- [x] **#3 Number-format filters in interpolation** — `{{ x | pct }}`, `| fixed(2)`,
  `| $`, `| commas` in `src/core/interpolate.ts` (pipe delimiter avoids the ternary
  colon). Unit tests.
- [ ] **#4 Embeddable view + copy embed code** — `#/embed?d=` minimal route + a "Copy embed
  code" button producing an `<iframe>` snippet. e2e for the route.
- [ ] **#5 Radio / segmented control** — new control kind `radio`; renderer + editor +
  serialize + tests.
- [ ] **#6 Reader / presentation mode** — distraction-free viewer (wider, larger type, no
  chrome) via a toggle + URL flag.
- [ ] **#7 Per-explainer accent color** — doc-level `theme.accent` applied to controls and
  chart curves; editor color picker; serialize + default.
- [ ] **#8 Callout block (info/tip/warning)** — new block type `callout`; renderer + editor +
  schema + tests.
- [ ] **#9 Rename & duplicate projects on the gallery** — inline rename, duplicate, and a
  delete confirmation on the home page. Store + UI.
- [ ] **#10 Reset-to-defaults button in the viewer** — clears reader-set control overrides
  back to the document defaults.

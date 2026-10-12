# Pleat renderer port — tracking

Goal: third creaseui site (`--mode pleat`, port 5175, `dist/pleat`, pleat.creaseui.com) styled
with [pleat](https://github.com/Manzanita-Research/pleat) — full parity with the Tailwind and
StyleX sites: all ~124 components, docs previews + code samples, charts, blocks, create page,
landing, getting started.

## Architecture (mirrors the stylex port)

- `packages/pleat-core`, `packages/pleat-foldkit` — vendored `@pleat/*` sources
  (upstream is unpublished; pinned at Manzanita-Research/pleat@`7d579dcd`).
- `src/pleat/` — pleat component implementations (port of `src/stylex/`).
- `src/docs/components/pages/<slug>/pleat.ts` — preview providers; registered by
  `src/docs/components/pleat-provider-manifest.ts` (parallel to stylex-provider-manifest).
- `PageDefinition.pleatExamples` — code samples shown on the pleat site.
- `src/demo/{blocks-pleat,pleat-cards,charts-pleat}` + `src/demo/board-pleat.ts` — demo layers.
- `src/site/*.pleat.ts` — site chrome skins; `src/site/pleat.css`; `src/entry-pleat.ts`.
- `Page.Renderer` / `renderer` union gains `'pleat'`; `siteOrigin`/`counterpartUrl` 3-way;
  header switcher handles 3 sites.

## Mapping rules (stylex → pleat)

- `stylex.create({k: decls})` → `{k: Style}` object: base decls to `Style.make`,
  conditional-value keys to `.pipe(Style.when(<When>, {...}))`.
- `stylex.when.ancestor(sel, marker)` → `When.within(marker, <cond>)`;
  `siblingAfter` → `When.precededBy(marker, <cond>)`.
- `stylex.defineMarker()` → `When.marker('<file>-<name>')`; applied via `Style.mark(m)`.
- `stylex.defineVars` → `Token.make` spec + `Theme.make` + `Global.theme` (prefix `crease-`).
- `stylex.defineConsts` → plain `as const` object.
- `stylex.keyframes` → `Global.keyframes('<name>', frames)` (returns hashed name).
- `className(...)` adapter kept (`src/pleat/style.ts`): adds `boxSizing: border-box` like the
  stylex adapter, filters falsy args, delegates to `cssClass`.
- `StaticStyles`/`ComponentLayoutStyle` → `Style.Style` (contracts keep the restricted-prop docs).
- `stylex.defaultMarker()` → dropped (stylex-internal bookkeeping).
- `stylex.createTheme` (log-stream terminal) → `Theme.make/extend` + `Theme.bindings` spread
  into `css()`.

## Condition-key mapping

`:hover/:focus/:focus-visible/:focus-within/:active/:disabled/:checked/:indeterminate`,
`:first-child/:last-child/:nth-child(odd|even)/:empty/:placeholder-shown`,
`::before/::after/::placeholder/::selection/::backdrop`,
`@media (prefers-reduced-motion: reduce)` → `When.reducedMotion`, `(hover: hover)` → `When.canHover`,
`min-width`/`max-width` → `When.minWidth/maxWidth`, `prefers-color-scheme` → `When.dark/light`,
`:is([data-x])`/`[data-x]` → `When.data`, `[aria-x]` → `When.aria`,
`[data-selected]`→`When.selected`, `[data-active]`→`When.highlighted`, `[data-open]`→`When.open`,
`[data-closed|enter|leave|transition]`→`When.closed/entering/leaving/transitioning`,
`[data-invalid]`→`When.invalid`, `[data-readonly]`→`When.readonly`, `[data-current]`→`When.current`,
`[dir="rtl"]`/`[hidden]`/`[open]` → `When.pseudo(':is(...)')` or `When.within(pseudo)` for ancestors.
`[data-slot="x"] > *` → `When.within(When.data('slot','x'))` (descendant — flagged if children
can nest same-slot descendants).

## Progress

- [x] Study pleat API + creaseui renderer architecture
- [x] Vendor @pleat/core + @pleat/foldkit (file: deps, csstype added)
- [x] Token layer generated (tokens/foundations/complex/board) — kinds inferred
- [ ] Interaction tokens (const file)
- [ ] reset.ts, contracts.ts, style.ts adapter, markers
- [ ] Codemod `scripts/pleat/stylex-to-pleat.mjs`
- [ ] Port src/pleat components (batches)
- [ ] Renderer wiring (config, vite, entry, css)
- [ ] Site skins (skin/docs/docs-search-ui/landing/blocks/getting-started)
- [ ] Docs previews + shared emitters + manifest + catalog dispatch
- [ ] Demo layers (blocks-pleat, pleat-cards, charts-pleat, board-pleat)
- [ ] main.ts touchpoints (Create/Charts/Blocks pages)
- [ ] Registry/tests/lint/e2e updates
- [ ] npm run check + 3-site visual parity
- [ ] PR

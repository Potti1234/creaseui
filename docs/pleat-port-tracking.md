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
- [x] Interaction tokens (const file)
- [x] reset.ts, contracts.ts, style.ts adapter, markers
- [x] Codemod `scripts/pleat/stylex-to-pleat.mjs`
- [x] Port src/pleat components (batches)
- [x] Renderer wiring (config, vite, entry, css)
- [x] Site skins (skin/docs/docs-search-ui/landing/blocks/getting-started)
- [x] Docs previews + shared emitters + manifest + catalog dispatch
- [x] Demo layers (blocks-pleat, pleat-cards, charts-pleat, board-pleat)
- [x] main.ts touchpoints (Create/Charts/Blocks pages)
- [x] Registry/tests/lint/e2e updates (src/pleat in lint:design-system scope; pleat project in playwright.sites.config.ts)
- [x] npm run check + 3-site visual parity
- [ ] PR

## Runtime fixes found by browser verification (post-port)

- `Token.color` rejects non-color literals (`'none'`, `'var(--radius)'`) — re-kinded to
  `Token.value`/`Token.length` (shadowNone, radius, radiusLg, cardRadius, panelShadow,
  panelRadius, panelInnerRadius).
- `When.pseudo()` takes only a single `:pseudo` — compound selectors decomposed to
  `When.all(When.hover, When.not(...))`; pseudo-elements to `When.pseudoElement`.
- `[container]` keys → `When.container(query)` / `When.container(query, 'name')`.
- `Global.keyframes` names must be lowercase/digits/dashes — no dots.
- `Subscription.aggregate` rejects duplicate keys — pleat subscription records use
  prefixed keys (`pleatContainerEvents`, `boardPleat*`).
- `vite.config.ts` tailwind plugin gate must be `isTailwind ? [tailwindcss()] : []`
  (both non-tailwind modes deliberately omit it; the tailwind-leak check guards).
- Token-name collisions: every `Token.make` spec shared `prefix: 'crease-'`, so
  `boardTokens.border`, `inkTokens.hover`, etc. emitted `--crease-border`/`--crease-hover`
  at `:root` and overrode the base theme (invisible white borders on docs pages).
  Each non-base spec now has a unique prefix (`crease-board-`, `crease-fnd-`,
  `crease-complex-`, `crease-sem-`, `crease-comp-`, `crease-ink-`, `crease-card-`,
  `crease-icard-`, `crease-ccard-`), mirroring stylex `defineVars` hash isolation.
  `src/pleat/board-tokens.ts` was an unused codemod artifact duplicating
  `src/demo/board-pleat-tokens.ts` — deleted.

## E2E parity findings (testing agent, fixed in cae5596)

- Reset styles must live in `pleat.globals`, not atoms: `Style.make` resets emit
  into `pleat.atoms` sorted AFTER component atoms, so `padding:0`/`margin:0`
  clobbered component spacing everywhere. `reset.ts` now emits
  `Global.rule('.crease-reset-*')` per entry (globals layer < atoms layer).
- `stylex.when.siblingAfter(cond, marker)` emits `:has(~ .marker<cond>)` —
  the element precedes the marker. `When.precededBy` is the inverted sibling
  direction; translate siblingAfter to
  `When.pseudo(':has(~ .${marker.className}<selector>'))`.
- Never carry renderer-name strings across skin copies verbatim — /blocks
  labelled itself StyleX and loaded stylex-- iframes.
- Pre-existing stylex bug ported faithfully (not fixed): /create customizer
  field-picker popover renders inline inside overflow:hidden aside on both
  stylex and pleat; tailwind portals it to #foldkit-portal-root.

## Verification status

- `npm run check`: all stages pass except pre-existing main-broken items
  (echarts eslint errors, 375/373 design-system warning budget, chart-lifecycle
  unit test — identical at base commit 0968bd8).
- `npm run build` (all 3 modes) green; zero pageerrors on home, /create,
  /docs/components/*, /charts/area on all three sites.
- Screenshot parity: pleat docs/data-table/log-stream/charts/create match stylex
  chrome (borderless sidebar + bordered example frames); counterpart links cycle
  tailwind↔stylex↔pleat correctly.

## PR #27 review findings (pleat-pr-27.md) — status

- P1 `:is(> X)` inside `:has()` — fixed at 0f140b9 (`When.pseudo(':has(> X)')`, 15 sites).
- P1 uncompilable emitted doc programs — `src/docs/components/styled-repair.ts`
  post-pass repairs emitted sx/pl programs (missing imports/styles entries,
  `ComponentLayoutStyle` casts incl. `layoutStyle:` props and ternary/array
  cases); emitters fixed at the source where feasible (banner/link/metadata-list/
  selectable-card/tabs shells, grid duplicate `shell`, carousel array layoutStyle,
  drawer ternary cast, bubble `interaction-tokens.const` import mapping).
- P1 closed layout contract — `src/pleat/contracts.ts` branded
  `ComponentLayoutStyle` + `layoutStyle()` validating the 29-property allowlist;
  `src/stylex/contracts.ts` gained the same `layoutStyle()` constructor.
- P1 registry — `scripts/generate-pleat-registry.mjs` generates 178 `pleat-*`
  items (121 components + vendored `pleat-core`/`pleat-foldkit` lib items);
  wired into `registry.json` include, `generate-ui-registry.mjs`,
  `verify-registry-install.mjs` consumer test, README + docs/registry.md.
- P2 lint — `packages/lint` exports `pleat()` config + new `pleat-prop-limits`
  rule; `stylex-component-contract` gained `layoutConstructors`; wired for
  `src/pleat/**` and page emitters in eslint.config.js.
- P2 renderer-native shells — page `h.main` shells emit `styles.page`/
  `shell`/`shellPlain` for sx+pl; inner example-content Tailwind classes remain
  (pre-existing stylex debt, same on both renderers).
- P2 attribution — LICENSE + VENDORED.md in packages/pleat-core and
  packages/pleat-foldkit.
- Coverage — `test/stylex-catalog.test.ts` gained a Pleat describe block
  (component parity, no tailwind fallback, export/prop parity, no string class
  props); new `e2e/pleat-preflight.spec.ts` + `e2e/fixtures/pleat-preflight/`
  mirrors the stylex preflight-independence suite (2/2 pass).

## PR #27 round-three review (pleat-pr-27-round-three.md) — status

- Data Table parity — `DataTableColumn.align` (`left`/`center`/`right`) in
  `src/pleat/data-table.ts` + `src/stylex/data-table.ts`, applied to heading
  and data cells; docs preview and emitted copied programs both use
  `align: 'right'` (no `ComponentLayoutStyle` casts, no `columns(h)`).
  Browser-verified: amount `th`/`td` compute `text-align: right` on sx + pl.
- Drawer lint — popup-scoped `drawerTokens.bleedBackground` in
  `src/pleat/tokens.ts` (declared on `[data-slot="drawer-popup"]`, value
  `var(--drawer-bleed-background, var(--popover))`); the four raw fallbacks
  in `src/pleat/drawer.ts` now use the token. Override verified: setting
  `--drawer-bleed-background` on an ancestor recolors `::after`. Pleat
  diagnostics now name `src/pleat/tokens.ts` / `interaction-tokens.ts`.
- Windows — copied-program emitter launched via
  `process.execPath --import tsx` (no `npx`); registry generator compares the
  separator-normalized relative path to `src/server.ts`. Regenerated
  manifests are byte-identical and contain no `server.ts`.

## /create settings pickers (sx + pl)

- Root cause: StyleX/Pleat popovers stay in the themed subtree
  (`THEMED_OVERLAY_PORTAL = false`), so the create pickers rendered inside the
  customizer's `overflow: auto` column and were clipped; Tailwind portals.
- Fix: opt-in `portal: true` on `src/{stylex,pleat}/popover.ts` mounts
  `AnchorThemedPopover` (`Anchor.anchorSetup` with `portal: true` +
  `inheritPortalTheme`), used only by the ten create pickers. Other overlays
  keep the scoped-theme behavior.
- Parity: `surface: 'bare'` drops the default white panel surface so the dark
  picker content matches Tailwind's `bg-[#3a3a3a] p-2 border-white/10`;
  option labels use plain truncation (Tailwind `truncate`), not the bold
  trigger value style.
- Browser-verified on tw/sx/pl: all ten pickers open under
  `#foldkit-portal-root`, selecting an option updates the value and closes
  the panel, zero pageerrors.

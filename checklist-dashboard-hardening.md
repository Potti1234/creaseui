# Dashboard consumer hardening checklist

Imported and committed in this checkout on 2026-10-09. See the commit mapping
and combined validation in [component-fix-port.md](docs/component-fix-port.md).
The original source validation notes are retained below.

Findings from the Foldkit + CreaseUI + Tailwind dashboard experiment in
`../creasetests`, following the coverage table and numbered findings in
`checklist-hardening.md`. This agent's changes remain in the working tree for
review. The component docs agent's unrelated source edits are preserved;
shared documentation outputs were regenerated from the current combined source.

Legend: ✅ fixed and verified · ⚠️ findings (see Findings) · ⏭ pending

## Coverage

| #   | Area                      | Status | Examples/interactions exercised                                             | Findings |
| --- | ------------------------- | ------ | --------------------------------------------------------------------------- | -------- |
| 1   | Registry dependencies     | ✅     | Complete import graph, behavior helpers, re-exports, dynamic imports        | D1       |
| 2   | Consumer import rewriting | ✅     | Clean consumer, matching UI/lib basenames, all components and icon adapters | D2       |
| 3   | Avatar contrast           | ✅     | Initials and group counts, both skins, light/dark, dashboard Axe scans      | D3       |
| 4   | Data table toolbar        | ✅     | Search, status filter and columns in one wrapping row; desktop/mobile       | D4       |
| 5   | Icon discovery            | ✅     | Dashboard names, inventory, visible unknown-name fallback, adapter exports  | D5       |
| 6   | External switch labels    | ✅     | ID helpers, accessible names/descriptions, toggle, both skins               | D6       |
| 7   | Complete app recipes      | ✅     | Analytics, users/dialogs, settings, persistence, keyboard and mobile        | D7       |
| 8   | Chart helper types        | ✅     | Typed numeric formatters, axis composition, ECharts 6 containment           | D8       |
| 9   | Unsortable table search   | ✅     | Search and empty state when no column has a sort accessor                   | D9       |
| 10  | Windows unit runner       | ✅     | 8 GB inherited by test workers; portable invocation                         | D10      |

## Findings

- **D1 — registry (high, fixed, working tree):** the hand-written dependency
  map omitted newer behavior modules and their transitive dependencies. The
  generator now derives file ownership from registry metadata, registers
  unlisted library helpers, and parses imports, re-exports, import types and
  dynamic imports with the TypeScript AST. Both UI and library dependency lists
  are generated. An unowned local dependency fails generation rather than
  silently producing an incomplete item.
- **D2 — consumer imports (high, fixed, working tree):** missing behavior
  targets let the installer rewrite `@/lib/field` into a self-import of
  `@/ui/field`. Correct dependency ownership preserves both destinations.
  The clean-consumer verifier checks the actual installed import graph for
  missing modules and self-imports, then runs TypeScript and Vite. Its fixture
  now installs only consumer dependencies, so repository-only packages cannot
  hide missing registry dependencies. The new dashboard block is included.
- **D3 — avatar (high, fixed, working tree):** fallback initials had 4.34:1
  contrast with the default light tokens. Fallbacks and group overflow counts
  use the semantic foreground in Tailwind and StyleX. Browser contrast checks
  pass in both skins and both themes; dashboard overview and users Axe scans
  now return no violations.
- **D4 — data-table (med, fixed, working tree):** application filters required
  an extra toolbar row. Both skins accept optional `toolbarContent` between
  built-in search and column visibility, with a `data-table-toolbar` slot.
  The recipe demonstrates a status filter in that row. Existing calls retain
  their behavior and layout.
- **D5 — icons (med, fixed, working tree):** `banknote`, `user-check` and
  `mouse-pointer-2` were missing, and unknown names rendered empty SVGs. Added
  those names across all five adapters, exported `IconName`, `iconNames` and
  `hasIcon`, and generated `docs/icon-inventory.md`. Unknown names render a
  question-mark glyph with `data-icon-missing`, preserving the accessible name.
  This feedback keeps views pure. Generated nodes now use one compact entry per
  icon, keeping the existing 80 KiB/240-icon budgets without raising them.
  Clean-install testing also exposed missing
  named exports in alternate adapters, including clock/menu and dashboard
  navigation icons. Adapters now derive every named export from the default
  module and ship 98 shared icon names; `dataIcon` metadata is preserved too.
- **D6 — switch (med, fixed, working tree):** external labels relied on
  undocumented string conventions. Both styled wrappers export `switchIds`;
  the shared adapter accepts `ariaLabel`, `labelledBy` and `describedBy`.
  Explicit names replace the primitive's default label reference. Descriptions
  render even when the control uses an accessible label instead of an internal
  visible label. The recipe documents and exercises Field + Switch composition.
- **D7 — recipes (med, fixed, working tree):** composing a complete dashboard
  needed substantial application wiring. `dashboard-01` is now an installable
  local registry block with source-owned analytics, users and settings routes,
  responsive sidebar/breadcrumbs, validation, create/edit dialogs, CSV,
  schema-validated persistence, theme synchronization and keyboard wiring.
  `docs/dashboard-recipe.md`, `public/llms.txt` and `public/llms-full.txt` expose
  its installation and composition examples. Public installation requires
  publishing this revision; local installation is available now.
- **D8 — chart (low, fixed, working tree):** axis helpers returned arrays and
  unrelated axis kinds, breaking numeric formatter composition. Their return
  types are narrowed to category/value axes and accept typed `axisLabel`
  overrides. The recipe uses numeric formatters without casts. `compactGrid`
  returns a single GridOption and uses ECharts 6 outer bounds instead of the
  deprecated `containLabel` option.
- **D9 — data-table (med, fixed, working tree):** the toolbar regression test
  discovered that search did nothing when all columns lacked `sortValue`.
  TanStack skipped those columns because they had no accessor. The adapter now
  supplies a search accessor while leaving sorting disabled. Unit and rendered
  tests cover the no-match state in both skins; server mode remains unchanged.
- **D10 — test command (low, fixed, working tree):** `test:unit` assigned
  `NODE_OPTIONS` using POSIX shell syntax, which does not work in Windows npm
  scripts. A portable Node launcher now passes the existing 8 GB heap allowance
  through the environment to the harness and workers. Passing only a Node CLI
  heap flag does not reach test workers; a heap probe verified that distinction.

## Verification

- Whole-checkout TypeScript check and both Tailwind/StyleX production builds pass.
- Targeted registry, icon, table, switch and chart unit contracts pass.
- Dashboard composition Scene tests cover both skins; existing avatar and
  switch suites were exercised as well.
- Playwright contrast regression passes for both skins in light and dark.
- Dashboard browser checks pass: search/empty state, status filter, both sort
  directions, paging, page sizes, selection, column visibility, required and
  duplicate email validation, create/edit, reload persistence, cancel/Escape,
  CSV, settings save/discard, notification labels, keyboard tabs, chart ranges,
  theme, sidebar shortcut, mobile dismissal and chart disposal.
- Axe scans return no WCAG 2 A/AA or WCAG 2.1 AA violations in overview, users,
  create-user dialog, workspace settings and notifications.
- Full registry consumer matrix passes: all 122 UI components plus dashboard-01,
  preserved framework versions, installed import checks, all five icon adapters,
  six TypeScript passes and a production build in a clean temporary consumer.
- The broad unit run passed 478 of 480 tests. Both failures are resolved:
  the icon-byte-budget test passes after compact generation; documentation
  compilation passes through the portable launcher with the intended 8 GB
  worker allowance. The launcher also passes an explicit heap-limit probe.
- A fresh install of the final dashboard-01 sources independently passes its
  installed-import checks, strict TypeScript check and production build.
- `npm run check:full` reaches the global design-system lint gate and stops at
  **375 warnings against a ceiling of 373**. The ceiling was not raised. The
  owned changed source passes ESLint with no errors. Full check output is in
  `output/dashboard-check-full.log`; browser scripts/screenshots and CSVs are
  under `output/playwright/` (ignored artifacts).

## Design observations

The visible default card shadow is a preference, not a correctness defect.
The default treatment remains. The toolbar recipe reduces duplicated controls
without changing the card or sidebar visual language.

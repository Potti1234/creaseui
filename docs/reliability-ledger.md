# Styling reliability and lint ledger

Implementation ledger for [the handoff](plan/reliability-and-lint-agent-handoff.md).
One row per contract; status uses the existing quality vocabulary
(`planned` / `in-progress` / `verified`). Evidence links point at tests.

## R0 baseline (2026-10-13)

- Branch `devin/1791907682-design-reliability`, based on PR #27 head
  `922e2f1` (`devin/pleat-renderer`); worktree clean at start.
- Installed: `foldkit` / `@foldkit/ui` 0.164.0, `@stylexjs/stylex` ^0.19.0,
  `@playwright/test` ^1.62.1, TypeScript ^6.0.3, ESLint ^10.8.0, vendored
  `@pleat/core` / `@pleat/foldkit` (see `packages/pleat-*/VENDORED.md`).
- Token modules: `src/stylex/{tokens,foundations-tokens,complex-tokens}.stylex.ts`,
  `src/pleat/{tokens,foundations-tokens,complex-tokens,interaction-tokens,overlay-tokens}.ts`,
  Tailwind `src/theme.css`; composition themes in `src/{stylex,pleat}/composition`.
- Create preset: `src/demo/create-preset.ts` (`presetCss`, `STYLE_RULES` patch
  only `button`/`input`/`card` slots). Scoped bindings: hand-written alias
  lists `scopedStyleXThemeCss` / `scopedPleatThemeCss` in `src/demo/board-{stylex,pleat}.ts`.
- Lint package `packages/lint`: rules `no-component-restyle`,
  `no-foldkit-inline-style`, `no-stylex-escape`, `pleat-prop-limits`,
  `prefer-composition-primitives`, `require-static-class`,
  `stylex-component-contract`; helper `lib/foldkit-sites.js`. Exports: default
  plugin, `tailwind`, `stylex`, `constrainedStylex`, `pleat`.
- Not present in this repository (referenced by the plans): `packages/lint/rendered.js`
  (`@creaseui/lint/rendered` SDK, LintApple engine), `lib/pleat-sites.js`,
  `scripts/lint-rendered-ui.mjs`, `docs/rendered-ui-lint.md`,
  `docs/reviews/pleat-pr-27-{round-four,design-consistency}.md`.
- CI: `.github/workflows/ci.yml` (`quality`: `npm run check` + registry build;
  `browser`: sites config + `test:e2e`).

### Reproduced findings

| Finding                      | Reproduction                                     | Result on baseline                                                                                                                        |
| ---------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Scoped primary hover         | `/create`, theme Emerald, hover "Save Threshold" | TW `oklab(0.596 -0.139 0.042 / 0.8)`; SX and PL `oklab(0.205 0 0 / 0.8)` (neutral) — `buttonPrimaryHover` missing from scoped alias lists |
| DataTable explicit alignment | —                                                | `align` added in PR #27 round three; RTL/explicit-left regression test pending (R1)                                                       |

## Contracts

| Package | Contract                                                                                                                                                                                | Status             | Commit      | Evidence                                                                                                                                 | Remaining                                                                                                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R0      | Baseline + plans in repo                                                                                                                                                                | verified           | `5373ec0`   | this file                                                                                                                                | —                                                                                                                                                                                                                               |
| R1      | Canonical role groups (`src/theme/roles.ts`) + schema validation                                                                                                                        | in-progress        | see git log | `test/theme-roles.test.ts` (StyleX literals and Pleat specs match canonical roles; validator rejects unknown/missing/kind/cycle/version) | Tailwind binding check, preset resolver order, palette contrast                                                                                                                                                                 |
| R1      | Scoped state colors: Create board rebinds every role of `tokens`/`foundationTokens`/`complexTokens`                                                                                     | verified           | see git log | `e2e/sites/theme-scope.spec.ts` (Emerald + Blue hover chromatic in TW/SX/PL)                                                             | overlay/nested-scope lifecycle tests                                                                                                                                                                                            |
| R1      | Palette validation (`src/theme/palette.ts`): oklch/oklab/color-mix/var evaluation, alpha compositing, WCAG 2 text pairs; root + 25 themes × 8 base colors × light/dark resolve complete | verified (ratchet) | see git log | `test/theme-palette.test.ts`; 500 pre-existing failures in `test/fixtures/palette-contrast-baseline.json` (may only shrink)              | Decide palette fixes: white `primary-foreground` on light accents (amber, cyan, emerald, fuchsia, lime, orange, pink, rose, sky, teal, yellow light; indigo, purple, violet dark), `muted-foreground`/`muted` (root light 4.34) |

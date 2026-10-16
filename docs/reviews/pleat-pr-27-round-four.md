# Fourth review of Pleat PR 27

The later [component coverage and design-consistency analysis](pleat-pr-27-design-consistency.md)
records the broader interaction suite, preset comparisons and scoped state-color finding.

Reviewed on 2026-10-13. PR:
[add Pleat as the third styling renderer](https://github.com/Potti1234/creaseui/pull/27).

Updated head: `69359503e35cb5925426add76aee4aba30d9609a`.
Previously reviewed head: `f549ec670159b5c3d2a6cb2e854fe3298f2e96c2`.
This update contains six commits and changes 11 files.
The remote PR head was checked again after validation and still matches.

## Verdict

All four findings from the third review are resolved. The changes make sense:
column alignment now belongs to the Data Table API, Drawer keeps its override
behavior through a scoped token, and both Windows failures are fixed at their
source. The required checks below pass.

One small P2 bug remains in the newly added alignment API: explicit
`align: 'left'` is ignored for data cells in RTL in both Pleat and StyleX.
Fix that branch before merging. This is a narrow correction, not another
renderer migration or documentation rewrite.

This review used the existing isolated checkout and preserved the main
checkout's uncommitted work. No PR source files were changed or merged.
The strict installable consumer-lint plan remains a separate workstream.

## Verified previous fixes

| Third-review finding                                         | Result on this head                                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Copied Data Table heading differs from preview               | Resolved. Preview and copied programs use `align: 'right'`; numeric headings and cells align right in both renderers, including RTL. |
| Four Drawer color lint errors                                | Resolved. The four bleed declarations use `drawerTokens.bleedBackground`; focused ESLint reports no findings.                        |
| Copied-program emitter cannot launch on Windows              | Resolved. `process.execPath --import tsx` works; the repository's full copied-program browser test passes.                           |
| Windows registry regeneration includes excluded server entry | Resolved. The normalized relative path excludes `src/server.ts`; captured output is byte-identical to both committed manifests.      |

The shared emitter and both styled preview providers now use the same semantic
column option. The amount column's appearance assertion and cell-only wrapper
are removed. All eight emitted Data Table examples were built unmodified and
checked in the browser with their real renderer CSS loaded. The rebuilt live
Pleat and StyleX previews also compute right alignment for numeric headings and
cells, including their RTL examples.

The Drawer token is declared on `[data-slot="drawer-popup"]`, preserving
`var(--drawer-bleed-background, var(--popover))` at the popup's scope. This
matters because resolving the variable at the document root could lose overrides
closer to the Drawer. An actual opened Drawer was checked:

| Configuration                 | Rendered popup `::after` background             |
| ----------------------------- | ----------------------------------------------- |
| No override                   | `oklch(1 0 0)`, matching the popover background |
| Override on document ancestor | `rgb(11, 22, 33)`                               |
| Override directly on popup    | `rgb(44, 55, 66)`                               |

The popup itself retains its normal background during the bleed overrides.
Opening and cancelling the Drawer work. A separate scope probe confirms the
new token is absent outside matching popup elements. Pleat lint diagnostics now
name `src/pleat/tokens.ts` and `src/pleat/interaction-tokens.ts`.

## Remaining finding

### P2 Explicit left column alignment is ignored for RTL data cells

The new `DataTableColumn.align` type accepts `left`, `center` and `right`, but
the resolver handles only `right` and `center`:

- [Pleat data-table.ts:295](https://github.com/Potti1234/creaseui/blob/69359503e35cb5925426add76aee4aba30d9609a/src/pleat/data-table.ts#L295)
- [StyleX data-table.ts:284](https://github.com/Potti1234/creaseui/blob/69359503e35cb5925426add76aee4aba30d9609a/src/stylex/data-table.ts#L284)

For `left`, the helper returns `undefined`, just as it does when alignment is
omitted. Headers already have a left-aligned base style; data cells inherit
`text-align: start`. Under RTL, that places the values on the right despite the
explicit request to align left.

Reproduction uses the first emitted Data Table program, changes its amount
column to `align: 'left'`, and sets `dir="rtl"` on the document. It is compiled
through the real renderer configuration with the extracted CSS linked. Both
renderers give these browser measurements:

| Explicit option | Heading computed alignment | Cell computed alignment | Physical value placement                         |
| --------------- | -------------------------- | ----------------------- | ------------------------------------------------ |
| `left`          | `left`                     | `start`                 | Right edge: 12px gap; left edge: about 260px gap |
| `center`        | `center`                   | `center`                | Equal gaps: about 136px on each side             |
| `right`         | `right`                    | `right`                 | Right edge: 12px gap                             |

The screenshot visibly places the Amount heading at the left of its column
while the amounts sit at the right. Ordinary LTR defaults conceal this bug.

Add a module-scope `alignLeft` style with `textAlign: 'left'` in both renderers,
and return it for the explicit left branch. Preserve the existing default for
an omitted option. Do not change `left` to logical `start`: the API also exposes
physical `right`, and the current center/right implementation is physical.

Verify all three explicit values on headings and cells under both LTR and RTL.
A browser check of computed styles or text bounds is appropriate; the current
state-update unit tests do not exercise alignment rendering. Also check a
non-left inherited alignment, so an explicit option cannot silently inherit it.

Evidence: `pr27-round4-table-parity.log`,
`pr27-round4-alignment-pleat-left.png` and
`pr27-round4-alignment-stylex-left.png` in the review checkout's
`output/playwright/` directory.

## Validation and limits

Completed on the exact updated head:

- Full source TypeScript check passes:
  `node --max-old-space-size=8192 node_modules/typescript/bin/tsc --noEmit`.
- All three production site builds pass with `npm run build`.
- Focused ESLint checks 184 files with zero errors and zero warnings: the Pleat
  source tree, changed StyleX Data Table, shared styled-program repair, changed
  Data Table providers, copied-program spec, registry generator and ESLint config.
- All 18 lint-package tests pass.
- All 24 focused layout-contract, Data Table behavior and renderer-catalog
  tests pass across four suites.
- Formatting passes for all 11 changed files; `git diff --check` passes.
- The official copied-program Chromium spec passes on Windows for all 1,524
  Pleat and StyleX programs. The complete invocation takes about seven minutes.
- Semantic TypeScript checking passes for all 12 emitted Data Table programs,
  four per renderer. The full 2,286-program semantic test passed on the previous
  head; this pass reran that check only for the changed Data Table examples.
- Eight exact emitted Pleat/StyleX Data Table programs and six variants covering
  the three explicit alignment values compile and render. Their HTML entries
  explicitly load the shared extracted CSS asset. These checks confirm the
  previous parity fix and reproduce the new finding above.
- Live Pleat and StyleX Data Table previews match the copied numeric-column
  alignment. The Pleat Drawer opens and cancels, and its actual bleed pseudo
  element honors fallback, ancestor and popup-local color settings.
- Registry generation captures produce byte-identical `src/pleat/registry.json`
  and `packages/registry.json`, without the excluded vendored server source.
  The committed manifests were preserved during this audit.
- `npm run registry:build` passes. Clean installation of `pleat-data-table` and
  `pleat-drawer` passes installed-source TypeScript checking and a production
  build in a fresh fixture.

The copied-program startup test still has the fixture limitation described in
the third review: extracted StyleX CSS can land in a shared asset that some
entries do not reference. Its successful result proves compilation and initial
startup, not complete visual parity or reliable stylesheet delivery. The focused
alignment consumers explicitly link the asset to avoid that limitation.

The registry install verifier uses its existing multi-renderer fixture and does
not visually exercise the installed components. This pass did not rerun the
whole interaction suite, the complete visual catalog or `npm run check`. Do not
read the focused clean lint result as a repository-wide lint certification.

## Preview and evidence

The isolated checkout remains at:
`C:/Users/lpottner/Documents/MaasProjects/creaseui-pleat-review`.

Updated previews remain available:

- [Pleat Data Table](http://127.0.0.1:4175/docs/components/data-table)
- [Pleat Drawer](http://127.0.0.1:4175/docs/components/drawer)
- [Pleat Button](http://127.0.0.1:4175/docs/components/button)
- [StyleX Data Table](http://127.0.0.1:4174/docs/components/data-table)
- [Tailwind Data Table](http://127.0.0.1:4173/docs/components/data-table)

Logs, QA scripts and screenshots are under `output/playwright/`, prefixed
`pr27-round4-`. The temporary alignment-consumer server has been stopped;
the three production previews remain running. Earlier results remain in the
[third review](pleat-pr-27-round-three.md).

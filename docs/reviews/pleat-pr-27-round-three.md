# Third review of Pleat PR 27

For the latest PR update and verification of these fixes, see the
[fourth review](pleat-pr-27-round-four.md).

Reviewed on 2026-10-13. PR:
[add Pleat as the third styling renderer](https://github.com/Potti1234/creaseui/pull/27).

Updated head: `f549ec670159b5c3d2a6cb2e854fe3298f2e96c2`.
Previous review: `32957486eb3a13abff4309765743f05165897c82`.
This update contains six commits and changes 94 files.

## Verdict

The fixes make sense and resolve the four previous blockers. The branded Pleat
contract is preserved, all source files typecheck, the unsupported StyleX
runtime constructor is gone, copied programs initialize their styles before
startup, and real Pleat registry installation now succeeds.

Request a final small correction pass before merging. There is a demonstrated
Data Table difference between the displayed example and the program users copy,
four remaining lint errors, and two Windows failures in the new verification
and generation code. These are substantially narrower than the previous review.

The broader strict consumer-lint preset remains a separate planned workstream;
this review does not retroactively require that implementation in this PR.

## Verified fixes

| Previous finding                                             | Result on this head                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 197 source TypeScript errors                                 | Full source TypeScript check passes without suppression or reverting the brand                                |
| Styles appended after `Runtime.run`                          | No remaining occurrence in the generated-program scan; both copied Accordion applications render              |
| StyleX runtime `layoutStyle` constructor fails compilation   | Removed; emitted calls become module-scope `stylex.create` entries; all 762 StyleX programs build             |
| Pleat registry build and verifier fail                       | Registry build succeeds; clean installation of four representative components typechecks and builds           |
| Pleat lint misses aliases, conditions, variables and spreads | All earlier probes now produce the expected findings; unrelated Style objects are ignored; 18 lint tests pass |
| Appearance assertions in generated programs                  | Zero `as ComponentLayoutStyle` assertions in all 762 Pleat and 762 StyleX programs                            |
| Installed vendored sources omit attribution                  | Both installed runtime source folders now contain LICENSE and VENDORED.md                                     |

The Pleat migration uses `layoutStyle` for genuine placement declarations. The
new `layoutWhen` constructor validates conditional declarations through the same
allowlist and preserves the brand, rather than widening conditional styles to
arbitrary appearance properties. The shared property-name list also keeps the
runtime constructor and documentation repair aligned.

The StyleX fix correctly respects static extraction. Removing the runtime
factory and hoisting authored declarations avoids the unsupported parameter
expression from the previous version. The repair inserts missing declarations
before application startup instead of appending them afterward.

The registry fix moves the vendored manifests beside their source packages,
qualifies the registry dependencies, installs the shared layout-property module,
and maps the installed `@pleat/*` source imports. I verified the installed files,
not just the repository manifests.

## Remaining findings

### P2 Copied Data Table headers no longer match the documentation preview

[data-table/shared.ts:90](https://github.com/Potti1234/creaseui/blob/f549ec670159b5c3d2a6cb2e854fe3298f2e96c2/src/docs/components/pages/data-table/shared.ts#L90)
replaces the amount column's appearance-style assertion with a styled `h.div`
inside each data cell. That is an appropriate way to avoid asserting typography
into a placement-only type, but it does not style the column header.

In the first example, browser measurements show:

| Surface                                          | Amount header alignment |
| ------------------------------------------------ | ----------------------- |
| Pleat documentation preview                      | right                   |
| StyleX documentation preview                     | right                   |
| Tailwind documentation preview                   | right                   |
| Copied Pleat program                             | left                    |
| Copied StyleX program, with extracted CSS loaded | left                    |

The data-cell wrapper still right-aligns the amounts. The screenshot of the
copied Pleat table visibly places its header toward the start of the numeric
column while its values remain against the right edge. The preview retains its
old appearance cast in `data-table/pleat.ts` and therefore presents a different
result from Show Code.

Add an explicit column-alignment option to the styled Data Table API and apply
it consistently to the heading and data cells. Use the same option in the
preview and emitted program. Keep appearance styles outside `layoutStyle`.
Do not restore the unsafe assertion merely to regain the alignment.

Evidence: `pr27-round3-data-table-parity-with-css.log`,
`pr27-round3-pleat-preview-data-table.png` and
`pr27-round3-pleat-copy-data-table.png`.

### P2 The stronger Pleat lint rule leaves four source errors

The new analyzer correctly inspects `Style.when` branches. That exposes four
violations in [drawer.ts:158](https://github.com/Potti1234/creaseui/blob/f549ec670159b5c3d2a6cb2e854fe3298f2e96c2/src/pleat/drawer.ts#L158),
also at lines 170, 182 and 194:

```ts
backgroundColor: 'var(--drawer-bleed-background, var(--popover))'
```

The configured `crease/pleat-prop-limits` color policy rejects these literal
values. Focused ESLint exits 1 with exactly these four errors. The other reviewed
component and newly added verification files produce no lint findings in this
run. These errors are part of the branch's normal lint target as well.

Keep the fallback behavior, but express this through an owned semantic token or
another policy-supported token declaration. Keep the stronger analyzer enabled.
Also adjust the inherited color diagnostic mentioning `tokens.stylex.ts` when
used for Pleat, so its suggested fix names the correct renderer's token module.

Evidence: `pr27-round3-eslint.json`.

### P2 The new copied-program test cannot start on Windows

[copied-doc-programs.spec.ts:25](https://github.com/Potti1234/creaseui/blob/f549ec670159b5c3d2a6cb2e854fe3298f2e96c2/e2e/copied-doc-programs.spec.ts#L25)
uses `execFileSync('npx', ...)`. The repository's new test fails immediately on
this Windows environment:

```text
Error: spawnSync npx ENOENT
```

It never reaches the build or any browser assertions. Run the installed emitter
with `process.execPath` and `--import tsx` instead of launching a platform-specific
package-runner script. Directly running the emitter that way works here.

I separately built and booted every emitted program, so this runner failure
does not conceal an unresolved Accordion or StyleX factory failure. The new
test is useful; it needs to be executable on the user's development platform.

Evidence: `pr27-round3-copied-spec.log`, `pr27-round3-emit.log`,
`pr27-round3-all-build.json`, `pr27-round3-boot-all.json` and
`pr27-round3-retry-boot.log`.

### P2 Regenerating the registry on Windows reintroduces the excluded server entry

[generate-pleat-registry.mjs:118](https://github.com/Potti1234/creaseui/blob/f549ec670159b5c3d2a6cb2e854fe3298f2e96c2/scripts/generate-pleat-registry.mjs#L118)
filters the experimental server source with:

```js
.filter(path => !path.endsWith('/src/server.ts'))
```

Those paths come from `node:path.join`, so they contain backslashes on Windows.
The exclusion never matches here. The committed manifest correctly contains
only `pleat-foldkit/src/index.ts` plus attribution, but regenerating it adds
`pleat-foldkit/src/server.ts` again.

I reproduced this by capturing the generator's manifest writes into ignored QA
files, preserving the committed manifests. Normalize separators before the
comparison, or compare a normalized path relative to the vendored package.
Require regeneration to reproduce the committed manifest on both platforms.
This does not invalidate the successful install from the current committed
manifest; it makes that fix unstable when the manifest is regenerated locally.

Evidence: `pr27-round3-generator.log` and the generator-capture script.

## Validation and limits

Completed checks on the updated head:

- All three production site builds pass.
- Full source TypeScript checking passes with
  `node --max-old-space-size=8192 node_modules/typescript/bin/tsc --noEmit`.
- The generated-program semantic TypeScript test also passes for all 2,286
  programs (762 per renderer), in approximately 18 minutes. This test limits
  its reported diagnostics to generated source files; the separate full source
  check above verifies the implementation files as well.
- All 16 focused Pleat layout-contract and renderer-catalog tests pass.
- All 18 lint-package tests pass, including the new positive and negative forms.
- Formatting of the changed supported files passes; `git diff --check` passes.
- Independent scanning of all 2,286 generated programs finds zero syntax
  errors and duplicate import bindings, no non-Tailwind legacy shells, no
  appearance-brand assertions, and no `const styles` after startup.
- All 1,524 copied Pleat/StyleX programs build through the new test's renderer
  configuration, using their unmodified emitted TypeScript.
- All 1,524 render their initial view without a reproduced application crash
  or uncaught JavaScript error. The initial parallel headed-browser pass had
  97 timeouts and 26 resource-only failures. All 123 candidates render on a
  sequential retry with timer polling and a longer wait. Do not describe those
  initial timing failures as 97 component crashes.
- Registry build succeeds. A fresh installer fixture containing `pleat-button`,
  `pleat-input-group`, `pleat-dropdown-menu` and `pleat-data-table` passes both
  installed-source TypeScript checking and a production build. LICENSE and
  VENDORED.md are present in both installed runtime source folders.
- An additional copied Button consumer uses the installed sources and builds
  with the Foldkit plugin, without Tailwind or StyleX plugins. It renders two
  36px controls with the expected outline border and 8px radius. Its document
  only imports the theme stylesheet; application font defaults remain the
  application's responsibility.
- Focused source ESLint fails only on the four Drawer color declarations above.
- The PR's new copied-program test itself fails to launch its emitter on
  Windows, as documented above.

The initial-view crawl does not certify all interactions or visual parity.
Some programs request missing sample-image assets; the retry records their
404 responses separately from runtime failures. I did not rerun the entire
interaction suite or the older complete catalog visual review.

There is also an important fixture limitation: this new multi-entry build can
append StyleX's extracted rules to the MapLibre CSS asset, while most copied
pages do not reference that stylesheet. A successful startup can therefore
leave a StyleX page unstyled. I loaded the extracted CSS explicitly for the
StyleX Data Table alignment comparison. Give the verification fixtures a
shared loaded CSS entry and test computed styles if they are to validate style
delivery or visual parity. The current startup test is useful for compilation
and initialization, but should not be presented as a styling-parity test.

The generated programs have no appearance-brand assertions now, but existing
preview providers and internal component composition still contain such casts.
This scan result concerns the programs offered by Show Code, not every source
file in the repository. The Data Table finding demonstrates why the preview and
source should share the same semantic styling inputs.

## Preview and next steps

The isolated review checkout is at the new head:
`C:/Users/lpottner/Documents/MaasProjects/creaseui-pleat-review`.
The main checkout and its uncommitted work were preserved.

Rebuilt previews remain available:

- [Pleat Data Table](http://127.0.0.1:4175/docs/components/data-table)
- [Pleat Button](http://127.0.0.1:4175/docs/components/button)
- [StyleX Data Table](http://127.0.0.1:4174/docs/components/data-table)
- [Tailwind Data Table](http://127.0.0.1:4173/docs/components/data-table)

Evidence is under `output/playwright/` in that checkout, prefixed
`pr27-round3-`. Earlier results remain in the
[previous follow-up review](pleat-pr-27-followup.md).

Finish the column-alignment/preview parity correction, the four Drawer token
violations, and the two Windows fixes. Preserve the branded contract, static
StyleX declarations, semantic lint binding resolution, registry packaging and
attribution improvements. These are sound changes.

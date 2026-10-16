# Followup review of Pleat PR 27

For the next PR update and verification of these fixes, see the
[third review](pleat-pr-27-round-three.md). The latest result is in the
[fourth review](pleat-pr-27-round-four.md).

Reviewed on 2026-10-13. PR:
[add Pleat as the third styling renderer](https://github.com/Potti1234/creaseui/pull/27).

Updated head: `32957486eb3a13abff4309765743f05165897c82`.
Previously reviewed head: `2463fa824dfe13e055c580cf2a9f3fd047d29b99`.
The update contains 11 commits and changes 355 files.

## Verdict

The fixes improve the renderer substantially, especially the broken stacked
layouts and reset independence. Request changes before merging. Four concrete
blockers remain: full source typechecking fails, emitted applications can crash
at startup, the new StyleX layout helper cannot be compiled when used, and the
Pleat registry cannot be built or verified. The new lint support also remains
weaker than the previously demonstrated experimental policy.

This review checks the earlier findings and the changes made to address them.
The broader installable consumer-lint implementation is a separate planned
workstream; its full strict preset is not an acceptance requirement retroactively
added to this PR.

## What improved

| Earlier finding                                           | Updated result                                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Invalid direct-child `:has` conditions                    | Fixed in converter and known component occurrences; stacked Input Group measurements now match all three renderers   |
| Syntax errors and duplicate imports in displayed programs | Fixed in the scan of all 762 Pleat programs; the new semantic emitted-program test passes                            |
| Unrestricted Pleat layout type                            | Branded type and a validating property constructor added; migration is incomplete and emitted casts still bypass it  |
| Missing Pleat registry                                    | 178 items added, including 121 public components; generation/installation remains broken                             |
| Missing Pleat lint configuration                          | Preset and a raw-value rule added; important normal syntax is not analyzed                                           |
| Tailwind application shells in Pleat/StyleX code          | Old shell removed from all 762 examples per non-Tailwind renderer; some replacement declarations initialize too late |
| Missing upstream attribution                              | LICENSE and provenance files added to both vendored packages; registry artifacts still omit them                     |
| Weaker reset-independence coverage                        | Two new light/dark Pleat browser tests pass with and without Tailwind preflight                                      |

At 1440px and 390px, all eight stacked Input Group cases have the same direction,
group height, control height and width as StyleX and Tailwind. The block-start
textarea is now 108px tall with a 64px textarea, rather than the previous 32px
container. The RTL and 200px code-textarea cases also match. Desktop Pleat and
StyleX cropped screenshots were visually inspected and show the same treatment.

## Remaining findings

### P1 Full source typechecking has 197 errors

The same increased-heap command that passed the previously reviewed head now
exits 2 with 197 TypeScript errors:

```sh
node --max-old-space-size=8192 node_modules/typescript/bin/tsc --noEmit
```

Most errors are existing raw Pleat styles passed to the newly branded
`ComponentLayoutStyle`. They occur in component implementations, preview
providers, blocks and site chrome. For example,
[dialog.ts](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/src/pleat/dialog.ts#L248)
still forwards an object with `layoutStyle?: Style.Style` to a helper that now
requires the brand. Landing and tour styles have the same problem.

There are also emitter implementation errors:

- [authored-page.ts](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/src/docs/components/pages/authored-page.ts#L496)
  reads `config.componentImports` from a configuration type that has no such field.
- [pleat-source.ts](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/src/docs/components/pleat-source.ts#L346)
  uses a possibly undefined `braces.index` under strict checking.

Keep the brand, migrate legitimate placement styles through the validated
constructor, and move appearance changes into component variants or appropriate
parent composition. Where internal visual slots are intentionally different
from public placement slots, give them explicit contracts. Do not fix this with
a blanket cast or by reverting the type to unrestricted `Style.Style`.

Evidence: `pr27-followup-typecheck.log` in the review worktree QA directory.
Successful Vite builds do not run this TypeScript gate.

### P1 Repaired documentation programs still crash at startup

[styled-repair.ts](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/src/docs/components/styled-repair.ts#L97)
appends a missing stylesheet to the end of the emitted application:

```ts
Runtime.run(Runtime.makeApplication({ /* ... */ }))

const styles = { shell: Style.make({ /* ... */ }) }
```

The initial view reads `styles.shell` during `Runtime.run`. Both the unmodified
copied Pleat Accordion Basic program and its StyleX counterpart build, then
display Foldkit's Application Crash page with:

```text
Cannot read properties of undefined (reading 'shell')
```

The structural scan finds 40 programs per non-Tailwind renderer with a `const
styles` declaration after `Runtime.run`. That is 80 susceptible programs, not
80 separately executed failures. The two Accordion failures were reproduced
in isolated consumer builds without the documentation application's shell.

Place all style declarations before startup and fix the emitters that omitted
them. Add startup/render assertions for copied applications. Parsing or
typechecking source strings cannot detect this execution-order error.

Evidence: `pr27-followup-doc-programs.json`,
`pr27-followup-copied-browser.log`, the emitted `accordion-*.ts` fixtures, and
`pr27-followup-copied-accordion-*.png` screenshots.

### P1 The new StyleX layout constructor breaks consumer compilation

[contracts.ts](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/src/stylex/contracts.ts#L58)
adds this runtime constructor:

```ts
export const layoutStyle = (
  declarations: ComponentLayoutProperties,
): ComponentLayoutStyle => create({ root: declarations }).root
```

StyleX cannot statically extract the function parameter. An isolated entry that
imports and calls `layoutStyle({ width: '123px' })`, built using this PR's exact
StyleX compiler options, fails with:

```text
[plugin @stylexjs/unplugin] src/stylex/contracts.ts
Unsupported expression: Identifier
59 | declarations: ComponentLayoutProperties
60 | ): ComponentLayoutStyle => create({ root: declarations }).root
```

There are 124 emitted StyleX programs containing a layout-constructor call.
Those programs are exposed to this build problem; they were not all individually
built. The site builds because displayed code is a string and unused exports can
be removed. A minimal live import proves that the public helper is unusable in
the current supported build configuration.

Keep StyleX declarations statically authored at module scope. Validate/type the
extracted layout references instead of wrapping `create` around arbitrary runtime
declarations. The Pleat declaration constructor can remain renderer-specific.
Add a consumer build test that actually imports every newly advertised helper.

Evidence: `pr27-followup-consumer-builds.json`,
`pr27-followup-consumer-builds.log`, and `layout-helper-stylex.ts`.

### P1 Registry entries cannot be built or installed successfully

Two independent commands fail before a valid consumer installation:

```sh
npm run registry:build
node scripts/verify-registry-install.mjs pleat-button
```

The registry build fails on `pleat-core`. Its file paths are declared relative
to the repository root, although the declaring manifest is in `src/pleat`.
[generate-pleat-registry.mjs](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/scripts/generate-pleat-registry.mjs#L114)
emits `packages/pleat-core/src/calc.ts`; shadcn therefore looks for:

```text
src/pleat/packages/pleat-core/src/calc.ts
```

The verifier includes Pleat names in `stylexItemNames` but still finds their
target in `stylexRegistry.items` only.
[verify-registry-install.mjs](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/scripts/verify-registry-install.mjs#L226)
throws `Cannot read properties of undefined (reading 'files')` for `pleat-button`.
The default run also includes that item, so it takes the same broken path.

Fix path resolution and item lookup, then prove installation into a clean
Pleat-only application. The fixture currently still enables Tailwind and StyleX
and does not configure the installed `@pleat/core` / `@pleat/foldkit` source
aliases. Runtime dependencies are also bare `pleat-core` / `pleat-foldkit` names
while other Crease dependencies are qualified; verify their resolution through
the actual installer. Do not assume that adding item names proves closure,
theme initialization or correct installed imports.

Evidence: `pr27-followup-registry-build.log`, `pr27-followup-registry.log`,
generated `.registry/pleat-button.json`, and the fixture/generator source.

### P2 Pleat lint support still misses ordinary declaration forms

[pleat-prop-limits.js](https://github.com/Potti1234/creaseui/blob/32957486eb3a13abff4309765743f05165897c82/packages/lint/rules/pleat-prop-limits.js#L80)
recognizes only an object literal passed to a member call literally spelled
`Style.make`. It does not follow the imported Style binding or check conditional
declarations, variable declarations or spreads.

With the same raw-color policy, direct probes produce:

| Source shape                                                     | Findings            |
| ---------------------------------------------------------------- | ------------------- |
| `Style.make({ color: '#ff0000' })`                               | 1, expected         |
| Imported `Style as S`, then `S.make(...)`                        | 0, missed violation |
| `Style.empty.pipe(Style.when(When.hover, { color: '#ff0000' }))` | 0, missed violation |
| `Style.make(declarations)` with a local raw-color object         | 0, missed violation |
| `Style.make({ ...declarations })`                                | 0, missed violation |
| An unrelated object named Style with a make method               | 1, false positive   |

All 177 Pleat source files lint clean under the new configuration, but that does
not establish equivalent styling enforcement. Reconcile the more capable
experimental Pleat analyzer rather than maintaining a narrower name-based rule.
Add positive and negative alias/condition/spread/shadowing fixtures.

The emitted repair also adds `as ComponentLayoutStyle` automatically. The scan
finds such assertions in 77 Pleat programs. The Aspect Ratio Square example
casts a style containing background color, radius and overflow into the
layout-only type. This explicitly defeats the intended boundary. Replace these
with valid placement styles, public variants or parent composition; don't teach
agents to assert appearance styles into the layout type.

Evidence: `pr27-followup-source-summary.json`, `pr27-followup-pleat-eslint.json`
and the copied `aspect-ratio-pleat.ts` fixture.

### P2 Attribution is still missing from source installation artifacts

The package folders now contain the upstream LICENSE and useful VENDORED notes.
The two registry runtime items collect only `.ts` files. The core item has 14
files and the Foldkit item has 2; neither includes LICENSE or VENDORED.md.

Include attribution/provenance in the actual installed source artifacts as well
as the package folders. Fixing the source checkout alone does not complete this
distribution requirement.

## Validation and limits

Completed on the updated head:

- All three production site builds pass.
- Full source TypeScript checking fails with 197 errors using an 8GB heap.
- All 16 focused layout-contract/catalog unit tests pass.
- All 14 lint-package tests pass.
- The new emitted-program test passes for 2,286 programs: 762 per renderer. It
  takes about 18 minutes here and filters diagnostics to the generated virtual
  source files; it does not establish that imported implementation files are
  clean or that programs compile through renderer transforms or run correctly.
- The independent syntax/import scan finds zero syntax errors and duplicate
  import bindings in all 762 Pleat programs and their StyleX counterparts.
- Neither non-Tailwind renderer retains the old Tailwind application shell.
- Both new light/dark Pleat preflight-independence tests pass, including open
  overlays and mobile layout.
- Eight stacked Input Group cases match the three renderers at 1440px and 390px.
- Isolated copied Button, Calendar and Aspect Ratio Pleat applications render
  without runtime errors; the copied StyleX Calendar also renders.
- Copied Accordion Basic applications crash in both non-Tailwind renderers.
- A live import/call of the new StyleX layout helper fails the consumer build.
- Registry build and focused installation verification both fail as described.
- The review checkout remains clean; only ignored QA artifacts were added.

The prior full fresh-page catalog run and complex interaction checks belong to
the old reviewed head. They were not rerun wholesale. The earlier fast in-app
crawl's queued-message/schema crash remains unclassified; this followup does not
claim it was fixed. Passing the targeted new checks does not certify the entire
catalog's styling or every browser state.

## Preview and evidence

The isolated checkout is updated to the new head:
`C:/Users/lpottner/Documents/MaasProjects/creaseui-pleat-review`.
The main checkout and its uncommitted lint/planning work were preserved.

Rebuilt production previews remain available:

- [Pleat Input Group](http://127.0.0.1:4175/docs/components/input-group)
- [Pleat Button](http://127.0.0.1:4175/docs/components/button)
- [StyleX Input Group](http://127.0.0.1:4174/docs/components/input-group)
- [Tailwind Input Group](http://127.0.0.1:4173/docs/components/input-group)

Evidence is in `output/playwright/` within the review checkout. The `pr27-followup-*`
files distinguish these results from the original review. The original review
is [pleat-pr-27.md](pleat-pr-27.md).

## Next fixes

1. Finish the branded-layout migration and fix the two emitter implementation
   type errors until full source TypeScript checking passes.
2. Initialize every emitted declaration before startup and test copied programs
   through build and first render, not only TypeScript.
3. Replace the unsupported StyleX runtime declaration constructor with a static
   extraction-compatible API and migrate the affected emitted calls.
4. Repair registry paths/lookup, dependency and alias setup, attribution output,
   then install and run a Pleat-only consumer.
5. Reuse the robust Pleat lint analyzer, remove appearance-brand casts from docs,
   and add the missing positive/negative rule cases.

Keep the verified selector and reset fixes. Do not weaken contracts or suppress
these failures to make the branch appear green.

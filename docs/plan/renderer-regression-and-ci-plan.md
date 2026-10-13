# Renderer regression testing and CI plan

Date: 2026-10-13. Work package: R3. Status: proposed implementation.

Turn design and interaction expectations into permanent tests and required CI
checks. Add each regression beside its fix, then expand shared comparison fixtures
as components migrate. Reuse these fixtures for the optional consumer audit
without requiring that browser add-on for source-only lint users.

## Existing coverage to preserve and strengthen

At the reviewed PR #27 head, `playwright.sites.config.ts` runs Tailwind, StyleX
and Pleat production sites. The Pleat project passed 166 checks with two
StyleX-only skips. The catalog test's deeper reset comparison is conditional on
StyleX, so its title does not imply equivalent Pleat coverage.

The standalone Pleat preflight check initially failed a byte-identical screenshot
comparison in a three-pixel area while computed styles matched, then passed on
retry. Preserve reset independence with stable geometry and documented pixel
tolerance. A retry alone is not evidence that the underlying check is reliable.

Copied-program startup checks also passed without proving complete styles were
loaded. Extend them with selected computed-style and state assertions in real
production consumers. Preserve existing deeper overlay, selection, file-input,
OTP, slider, lightbox and navigation tests.

## Permanent shared fixtures

Create one renderer-neutral fixture model, message/update wiring, data and state
definitions. Renderer entry points supply only the styled view adapters and
required installation/build setup. Tests query semantic roles and component
contract IDs, not engine class strings.

| Fixture            | Required contents and purpose                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Mixed form         | Button variants, Input, Textarea, Native Select, styled Select, Field, Checkbox, Switch and validation; catches incomplete presets |
| Actions and text   | Normal/joined/dense action groups, icon buttons, headings, supporting text and numeric values; verifies role relationships         |
| Surfaces and data  | Panels, alerts/statuses, menu rows and a table with explicit column alignments; verifies elevation, status and RTL                 |
| Scope and overlays | Nested contrasting themes, two component instances, menu/dialog/popover, root mode changes and theme changes while open            |
| Settings recipe    | Strict composition, labels, help/errors, submission and long content in a realistic page                                           |
| Dashboard recipe   | Navigation, responsive regions, filters, numeric table and owned scrolling in a realistic page                                     |

The fixture should be installable without the documentation shell. It must
exercise actual exported preset CSS/theme installation as well as in-repository
preview bindings. Keep browser screenshots and test assertions based on the same
fixture program; do not substitute hand-styled mock elements.

## Matrix and assertions

For the mixed-form base fixture, cover all declared presets, three renderers,
light/dark mode, and 1440x1000 / 390x844 viewports. The eight current presets yield
96 base cases. Derive the matrix from the preset inventory so a new preset cannot
silently miss the gate. These are base-state cases, not a claim of all-state coverage.

Add dedicated state scenarios per contract: hover, keyboard focus, pressed,
selected/open, disabled, read-only, loading and invalid where supported. Cover
every preset's affected roles; geometry-only presets can share deep behavior
checks, while each changed state-color branch needs direct verification.
Keep the generated coverage report explicit about which combinations ran.

Use LTR/RTL for directional/alignment contracts, reduced motion for animated
families, and forced colors/zoom/reflow for applicable controls. Run critical
interaction contracts in Chromium, Firefox and WebKit as required by the existing
quality plan. Stable visual baselines may use one pinned Chromium environment;
cross-browser behavior results remain separate.

| Assertion layer       | Contract to prove                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pure/schema           | Complete resolved roles, adapter mappings, alias/merge behavior, preset branches and deterministic generation                                        |
| Computed styles       | Role-specific dimensions, font loading/type, borders/radii/elevation, explicit alignment, resolved state colors and CSS delivery                     |
| Browser interaction   | Selection/messages, form semantics, focus movement/restoration, dismissal, viewport collision, scroll ownership and theme updates without state loss |
| Rendered measurements | Contrast, clipping, document overflow, local scrolling, viewport bounds and declared spacing/target relationships                                    |
| Screenshots           | Hierarchy, balance, shape relationships and reviewed visual treatment per preset                                                                     |

Pair semantic/computed assertions across renderers with reviewed screenshots.
Separate per-renderer snapshots alone can allow each renderer to drift in a
different direction. Declare intentional platform/browser differences; matching
class names or identical DOM internals are not parity requirements.

## Required regression scenarios

- Emerald and blue primary/secondary controls retain scoped colors on hover,
  focus and applicable selected/pressed states in all three renderers.
- Nested and simultaneous theme scopes remain independent. Open overlays update
  palette/density without losing focus or selection, including detached roots
  where the actual primitive mounts outside the owner.
- Explicit DataTable left/center/right alignment works for header and cells in
  LTR/RTL, including inherited center/right alignment. Test undefined/default
  behavior separately from an explicit left value.
- Lyra Select/Textarea shape, Maia rounded control treatment, Sera outlines,
  Vega/Luma elevation, Mira compact geometry and Rhea larger geometry match the
  reviewed role tables. Exception contracts distinguish intentional shapes.
- All declared palette/mode pairs pass supported deterministic checks; browser
  state checks include transparent paints over actual backgrounds.
- Changing declared control/motion roles affects real components, not only
  generated variables. Reduced motion preserves final-state correctness.
- Standalone StyleX/Pleat installs preserve expected styling without Tailwind
  preflight and tolerate unrelated host styles within their declared contract.
- Windows example emission uses portable process invocation, and registry
  generation handles path separators without including unintended server files.
- Displayed code and live examples have matching renderer, state, order and
  complete program wiring; extracted programs compile.

Each regression must fail against the corresponding broken fixture or pre-fix
implementation. Prefer small deliberate fixture defects over repeatedly editing
production source during CI. Do not write assertions that merely mirror a token
map without measuring its consumer.

## CI gates and change selection

| Gate               | Run condition                                                                      | Required checks                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Static contracts   | Every PR                                                                           | Types, lint package tests, shared schemas, complete adapter/variant coverage, generated drift, docs/example and registry contracts |
| Focused browser    | Every implementation PR                                                            | Known regression suite and affected component/state fixtures in each renderer                                                      |
| Preset comparison  | Theme, token, preset, scope, shared component style, generator or contract changes | Complete base preset matrix plus affected state/RTL/overlay scenarios                                                              |
| Clean installation | Package/registry/build/setup changes; required at release gates                    | Packed lint and registry consumers, production CSS delivery, example compilation and real interactions                             |
| Broad catalog      | Nightly, explicit workflow, compatibility changes and full release gate            | All renderer catalog/interaction suites, all copied examples and supported critical browser matrix                                 |

Use dependency-aware selection with a conservative full comparison fallback for
unknown shared styling changes. Path filtering must not skip a gate because a
token helper, registry dependency or build plugin changed outside a component
directory. Shared theme regressions must block their PR, not wait for nightly CI.

Integrate with `.github/workflows/ci.yml` and the existing scheduled workflows;
do not create a second unrelated quality system. Shard larger matrices by stable
fixture/preset IDs. Upload traces, screenshots, diffs, coverage and JSON summaries
on failures, and preserve useful first-attempt artifacts when a retry succeeds.
Choose timeouts from measured runtime and report the suite duration.

## Determinism and baseline review

Pin tested browser/tooling versions and lock dependencies. Serve local fixture
fonts/assets, wait for `document.fonts.ready`, fix dates/IDs/data/timezone and
clear persisted test state. Use explicit readiness and state assertions instead
of arbitrary sleep. Freeze unrelated animation only for visual captures; real
motion/lifecycle tests must still exercise transitions and reduced-motion paths.

Compare decoded pixels rather than PNG bytes. Document small per-fixture noise
tolerances from repeated stable runs; tolerances must not conceal missing borders,
wrong colors or shifted geometry. Avoid broad masks over meaningful UI. An initial
failure remains in the report even when an isolated rerun passes.

A snapshot update requires before/after images, the changed design contract and
an explained baseline diff. Implementation agents may produce proposed snapshots
for review; updating all expected images solely to clear CI is prohibited.

## Work item and delivery evidence

**Objective:** regressions in shared styling, presets, CSS delivery and component
states fail reliably before release.

**Scope:** shared fixture programs, test helpers/specs, CI workflows, selected
consumer fixtures and documented evidence/coverage output. Keep source fixes in
their R1/R2 slice rather than hiding unrelated changes in a test PR.

**Inputs:** R0 compatibility baseline, R1 roles, R2 inventory, existing Playwright
configs/catalog tests, copied-program emitter and registry tests.

**State ownership:** fixtures use normal parent Models, child delegation and
OutMessages; tests drive genuine public interactions.

**Public API:** proposed additional scripts/report fields become documented only
after implementation. Preserve existing test entry points where possible.

**Behavior contract:** applicable browser, theme, viewport, state, direction,
motion and clean-host dimensions must be executed or reported as incomplete.

**Evidence:** known defects fail, corrected fixtures pass, generated matrix is
complete, clean install has real computed CSS, cross-platform generation passes,
and required CI jobs execute on representative shared changes.

**Migration:** update existing reset/style checks carefully, with retained
coverage and a measured tolerance rationale. Keep legacy findings classified.

**Stop conditions:** reproducible platform/tooling limitations or unresolved
design baseline decisions; failures are not resolved by silencing assertions.

## Existing commands and proposed additions

Inspect current scripts before running them; the reviewed PR includes these
existing entry points:

```sh
npm run typecheck
npm run test:lint-package
npm run build
npx --no-install playwright test --config playwright.sites.config.ts
npm run test:registry
```

Add clear scripts for theme validation, preset fixtures, regression coverage and
packed consumer checks. Their names are implementation choices, not commands
already available. The broad gate must compile extracted docs programs and
verify styles in representative installed programs; startup counts alone do not
satisfy it.

## Acceptance checklist

- [ ] Every known regression has a permanent failing/passing contract test.
- [ ] Every preset and renderer is present in the generated base matrix.
- [ ] Applicable state/RTL/motion/overlay coverage is explicit and discoverable.
- [ ] New shared theme changes trigger the complete relevant PR gate.
- [ ] Clean installs prove production CSS and an actual interaction.
- [ ] Stable screenshots use reviewed tolerances and preserve failure evidence.
- [ ] Critical interactions run in the required supported browsers.
- [ ] CI reports actual coverage, versions, skipped cases and artifacts.

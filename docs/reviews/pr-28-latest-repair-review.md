# PR 28 latest repair review

Reviewed 2026-10-15. PR: [Design reliability and consumer lint](https://github.com/Potti1234/creaseui/pull/28).
Head: 244b4c79cf901a28f7e2e8d57a9b4dd59aaee390.
Previous reviewed head: c3a805a892dcff0ba8d0c83904ee617ccae9ce82.
There are 12 additional commits, changing 70 files.

## Assessment

Keep the improvements, but this is still an incomplete repair and release.
The previous exact bypass examples are repaired, compact icon sizing is much
better, real registry consumer verification is a useful addition, and nested
light scopes and independent status roles are implemented. Further reproductions
still find a component-origin bypass, missing public export registrations,
invalid CSS accepted by theme validation,
an allowed application override that collapses Button height, and invalid
standalone linked Item semantics.

The agent now reports remaining work much more honestly in the reliability
ledger. That is useful progress; an open ledger entry does not itself satisfy
the associated acceptance criterion. Do not describe all five earlier findings
or the complete reliability/lint plan as finished.

The review checkout is detached at the exact head above in
`C:/Users/lpottner/Documents/MaasProjects/creaseui-reliability-review`.
The original dirty workspace and partial tutorial draft were preserved.
No preview implementation was continued, and nothing was merged or pushed.

## F1 P1 Component origin still disappears through namespace re-exports

Sources: [namespace/export origin lookup](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/packages/lint/lib/strict/ownership.js#L371)
and [component expression origin](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/packages/lint/lib/strict/component-calls.js#L94).

The new immutable alias and simple destructuring resolution works for the
original examples. A normal TypeScript namespace barrel still bypasses the
contract, using the real Tailwind Button and its registered public export:

```ts
// design.ts
export * as Button from '@/ui/button'

// feature.ts
import { Button } from './design'
export const view = (h: HtmlBuilder<unknown>): Html =>
  Button.button({ children: ['Bad'], class: 'text-red-500' }, h)
```

This returns zero diagnostics from the actual strict factory. Importing the
same barrel as a namespace and calling `Design.Button.button(...)` also returns
zero. Both forms pass TypeScript. Direct Button imports, a local namespace
alias, and simple destructuring all correctly report `crease/component-contract`
for the identical props; an approved outline Button passes.

`exportOrigin` skips a namespace export because it accepts only NamedExports.
The component index can represent only a namespace file or a final export
record, so it cannot carry the intermediate exported namespace through the
second member access. The installed Button has not changed ownership, but the
policy silently stops inspecting it.

Required correction: preserve origin through namespace exports and namespace
members, including named and namespace consumer imports. Add the paired real
component examples above and unrelated-object positives. If a supported UI
origin cannot be resolved, emit the explicit unverifiable diagnostic rather
than treating the call as ordinary application code. Audit the analogous
headless resolver for the same export representation.

Evidence: ignored review artifacts `output/playwright/pr28-r3-lint-probe.mjs`,
its results JSON, and `pr28-r3-probe-typecheck.log` in the review checkout.

## F2 P1 Fresh init leaves real public component exports outside the policy

Source: [export discovery and receipt generation](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/packages/lint/bin/creaseui-lint.js#L41).

This is a concrete consequence of the previously open installer-contract gap.
In the freshly registry-installed Tailwind consumer, the packed package's init
registers only card and cardTitle from the Card module. It omits factory-created
public exports such as cardHeader, because discovery accepts only direct arrow
or function-expression initializers.

```ts
import { cardHeader } from '@/ui/card'
export const header = (h: HtmlBuilder<unknown>): Html =>
  cardHeader({ children: ['Header'], class: 'bg-red-500 text-3xl p-0' }, h)
```

This is valid TypeScript and gets no strict diagnostic using the packed lint
package and the generated consumer config. A registered Button in the same file
with the identical class value correctly gets crease/component-contract.
The failure therefore occurs on a normal direct public import, without any
alias, assertion, hand-written manifest, or lint configuration modification.

Required correction: emit and consume exhaustive installer per-export contracts,
including public slot functions returned by factories. Doctor must report an
uncovered rendering export instead of accepting incomplete discovery. Add real
installed-component negative probes for every contracted public export, not
only a bad Button sample. Merely counting installed files does not measure
export coverage.

Evidence: pr28-r3-installed-ownership-results.json, the paired source probe,
the generated consumer receipt, and a clean isolated consumer typecheck.

## F3 P2 Theme validation still approves invalid CSS within supported functions

Sources: [tokenization](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/lib/theme-roles.ts#L296),
[color channels](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/lib/theme-roles.ts#L515)
and [color-mix validation](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/lib/theme-roles.ts#L547).

The six original malformed-function/wrong-alias-kind examples are rejected.
The new parser nevertheless returns an empty error array for every value below,
while Chromium CSS.supports rejects each one for the indicated property:

| Theme role | Accepted value                      | Browser property | Missing constraint                                     |
| ---------- | ----------------------------------- | ---------------- | ------------------------------------------------------ |
| primary    | rgb(1, 2%, 3)                       | color            | Legacy RGB channels cannot mix numbers and percentages |
| primary    | hsl(0, 50, 50)                      | color            | Legacy HSL saturation/lightness require percentages    |
| primary    | color-mix(in srgb, red 0%, blue 0%) | color            | Both weights cannot total zero                         |
| radius     | calc(1rem+ 2px)                     | border-radius    | Binary plus requires whitespace on both sides          |
| radius     | calc(1rem +2px)                     | border-radius    | Same whitespace constraint                             |

Positive controls `rgb(1 2 3)`, `hsl(0, 50%, 50%)` and
`calc(1rem + 2px)` pass both checks. This is not a request to support every CSS
feature: these are invalid inputs inside functions the validator already claims
to support. A custom property can store an invalid token sequence and later
invalidate the consuming component declaration.

Required correction: enforce the separate legacy/modern channel grammar,
color-mix weight constraints and CSS math token boundaries. Preserve enough
lexical information to validate spacing. Keep unsupported syntax explicit.
Use browser acceptance as an independent test oracle for representative valid
and invalid cases, in addition to parser-specific unit assertions.

Evidence: `pr28-r3-css-supports.log` and validator calls with
`validateThemeDefinition({schemaVersion:1,values:{primary:value}},{partial:true})`;
use `radius` instead of `primary` for the length cases.

## F4 P2 Strict application placement classes can defeat named Button sizes

Sources: [global placement allowlist](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/packages/lint/lib/strict/contracts.js#L120),
[class checking](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/packages/lint/lib/strict/component-calls.js#L403)
and [Button class merging](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/ui/button.ts#L81).

```ts
button({ children: ['Compressed action'], class: 'h-3' }, h)
```

This is valid TypeScript and returns zero strict diagnostics. The global
placement classifier accepts height/width/size utilities independently of the
component contract. Tailwind merge then replaces the Button's default height.

I serialized the actual Button functions and loaded their output with the
newly built Tailwind production CSS. The ordinary Button measures 36px high;
the lint-clean example above measures 12px high. `twMerge('h-9','h-3')` returns
`h-3`. This directly defeats the intended finite size and usable-control policy.

This is an additional strict-policy finding, separate from the repaired Mira
preset bug. Required correction: distinguish parent placement from a control's
owned geometry per export/contract. Restrict height/size overrides on controls
that expose named sizes; retain documented width/fill cases where appropriate.
Check the equivalent StyleX/Pleat layout-style path rather than assuming a
Tailwind-only restriction completes the policy. Add an allowed parent-placement
case alongside the rejected control-size override and verify rendered geometry.

Evidence: the typed lint probe and `pr28-r3-rendered-results.log`, generated
from the real component output rather than a hand-built mock Button.

## F5 P2 Linked Item repair introduces an orphan role outside ItemGroup

Sources: [Tailwind wrapper](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/ui/item.ts#L77),
[StyleX wrapper](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/stylex/item.ts#L186)
and [Pleat wrapper](https://github.com/Potti1234/creaseui/blob/244b4c79cf901a28f7e2e8d57a9b4dd59aaee390/src/pleat/item.ts#L199).

The grouped linked/ordinary/mixed cases now pass structural Axe checks and
keyboard navigation in all three renderers. The wrapper is unconditional:

```ts
item({ element: 'a', href: '#task', children: ['Standalone item'] }, h)
```

Rendered alone, this now contains a `div role=listitem` with no list parent.
Axe reports a critical `aria-required-parent` violation on the actual Tailwind
output. The identical unconditional wrapper exists in StyleX/Pleat. I ran this
standalone Axe reproduction on Tailwind; the three-renderer grouped checks
were run separately. Plain standalone Items already had an orphan role; this
change extends that existing problem to standalone links.

The agent also records this in the updated ledger, so it is acknowledged rather
than hidden. Required correction: let group/list composition own list-item
semantics and retain the native standalone element semantics. Verify standalone
plain/linked items and grouped linked/ordinary/mixed items across renderers,
including accessible roles, Tab/Enter, width and spacing.

Evidence: `pr28-r3-rendered-probe.html` and `pr28-r3-rendered-results.log`.

## Status of the previous five findings

| Previous finding                          | Result at this head                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| UI aliases/destructuring/headless barrels | Original examples repaired; namespace re-export form still escapes component contracts (F1 above)              |
| Theme function arguments and alias kinds  | Original examples repaired; supported CSS grammar still has false acceptance (F3 above)                        |
| Mira compact icon geometry                | In-board named sizes and square icons pass all three sites; no lg control is exercised by the board            |
| DOM style/classList aliases               | Repaired for the reviewed forms; typed DOM negatives and unrelated business-record positives pass              |
| Linked ItemGroup structure                | Grouped cases repaired in all three sites and standalone fixtures; standalone linked Item regresses (F5 above) |

## Additional useful work and remaining plan scope

Independent success/warning roles now replace chart-role coupling in the
updated semantic tokens. Explicit light scopes inside dark scopes work, and
dark-inside-light nesting resolves correctly in the standalone browser fixture.
The `:root, .light` selector-list palette reader correction is covered by the
theme/palette tests.

The new strict-consumer script genuinely installs registry components with the
shadcn CLI, installs the packed lint package, initializes ownership, checks clean
settings/dashboard source and a failing bad-source control, and runs the
consumer compiler and production build. This is substantially stronger than the
previous handwritten Button/Stack fixture. Its 24 checks are not 24 browser
interaction tests: production style presence uses bundle/CSS heuristics, and
the script does not launch the installed apps. The separate shared browser
fixture imports repository components; it does not prove runtime behavior of
those fresh registry installations.

The original completion obligations still include installer-produced per-export
contracts and source hashes instead of inferred ownership, a complete resolved
theme with custom patches and deterministic precedence, exhaustive adapter and
finite-choice coverage, reviewed visual comparison baselines and the full
preset/renderer/scheme/viewport report, installed-consumer runtime checks,
and remaining rendered audit coverage. The ledger explicitly retains many of
these. Windows/pnpm paths are not a complete CI matrix.

The four accepted shadcn contrast exceptions and the 500-entry palette ratchet
remain policy limitations; a passing filtered check does not mean raw contrast
findings were repaired. This review does not reverse the recorded palette
decision or count it as a newly introduced defect.

The latest ledger also records linked Item focus-ring differences, Pleat small
Item padding, warning-example color wiring, Nova close-button size differences,
missing lg board coverage, and an unresolved CI Pleat preflight comparison.
Those entries remain open; this review does not claim to have re-tested every
one independently.

## Verification and baseline for the next task

Verified locally at the pinned head:

- Lint package: 93 passed, zero failures/skips.
- Theme/palette tests: 15 passed.
- Full repository typecheck passed.
- All three production renderer builds passed.
- Focused production site tests: 60 passed (preset geometry, Item groups,
  scoped themes and overlay surfaces), using dedicated ports 4273–4275.
- Standalone production fixture and Pleat preflight tests: 19 passed.
- Real Button import/alias/destructuring/barrel/height probes ran under strict
  lint; their isolated TypeScript project passed.
- Registry rebuilt from the reviewed head, then the fresh packed strict-consumer
  run passed all 24 checks across Tailwind, StyleX and Pleat. The retained
  consumers are in C:/Users/lpottner/AppData/Local/Temp/creaseui-strict-consumers-88tIN6.
- The real installed Card export-coverage probe passed consumer TypeScript;
  its paired lint output rejects the Button override and misses cardHeader.
- Browser CSS.supports and actual rendered Button/standalone Item probes
  independently confirmed the findings above.

Both latest-head GitHub runs have successful quality, renderer-browser and
cross-browser jobs, and failed legacy e2e jobs:
[run 38744749322](https://github.com/Potti1234/creaseui/actions/runs/38744749322)
and [run 38744740462](https://github.com/Potti1234/creaseui/actions/runs/38744740462).
The failed step is Run browser and accessibility tests. Anonymous job-log
download returned HTTP 403, so this review does not attribute every latest
failure to either inherited failures or new regressions. The ledger documents
older baseline comparisons, which are useful context but not a classification
of these exact runs. CI is not fully green.

The complete local unit/Scene suite was not repeated in this review; the
latest-head quality jobs ran the repository check pipeline. Local checks here
targeted the changed contracts, actual consumers and interaction regressions.
The Windows consumers use npm; this fresh-registry run does not establish a
new Windows/pnpm or non-Chromium audit result.

PR head was rechecked after verification and still matched the reviewed SHA.
The review checkout has no tracked or untracked source changes; proof files
and generated builds remain in ignored output directories. Dedicated site
test servers and the isolated review browser have stopped. Existing user
servers were preserved.

Use this reviewed SHA as the integration baseline, not the old main checkout
or the previously installed sources in the paused tutorial draft. When preview
work resumes, refresh its installed component sources from the accepted latest
baseline and record provenance first. The tutorial preview remains paused at the
user's request; no application UI was built during this review.

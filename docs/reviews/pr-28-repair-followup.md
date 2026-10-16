# PR 28 repair followup review

Reviewed on 2026-10-15. PR: [Design reliability and consumer lint](https://github.com/Potti1234/creaseui/pull/28).
Head: c3a805a892dcff0ba8d0c83904ee617ccae9ce82.
Previous review: 838295176eda1ba5f0ec0afd375d9aada1437469.
Pleat base: 772144cbaf3fb71b8cce194f83272bb78424aed8.

## Assessment

The agent delivered substantial useful repair work, but did not complete the
[repair plan](../plan/pr-28-repair-agent-plan.md) or the first strict consumer
release. Keep the working changes. Do not accept this as the completed styling
reliability and consumer lint delivery yet.

The original failure examples now behave correctly, the Windows packed-consumer
runner works here, and the latest remote quality, renderer-browser, end-to-end
and Firefox/WebKit jobs all pass. Further probes find ordinary source forms
that bypass strict lint, invalid themes accepted as valid, broken compact icon
geometry and invalid ItemGroup list composition. Major canonical theme,
ownership, strict installed-consumer and visual-regression outcomes remain
unfinished.

The repository itself still labels the PR work in progress and R1 in progress;
some completion gaps are acknowledged. The new repair table nevertheless
overstates F2/F5 by recording no remaining work.

The reviewed update contains 90 commits and changes 105 files relative to the
previous review. The full stacked PR changes 214 files against the Pleat base.
This review evaluates the new repair work and the remaining plan obligations,
rather than treating older fixed findings as current failures.

## F1 P1 Strict UI identity still disappears through aliases and destructuring

Sources: [component namespace lookup](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/packages/lint/lib/strict/component-calls.js#L58),
[headless namespace imports](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/packages/lint/rules/strict/index.js#L181)
and [headless member lookup](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/packages/lint/rules/strict/index.js#L197).

Direct computed calls and named re-export barrels are repaired. Component
namespace lookup still accepts only the original import binding, and headless
lookup still uses direct binding membership. A namespace import of a local
headless barrel is explicitly skipped.

These typed probes all produce zero diagnostics with the actual strict factory:

```ts
import * as Design from '@design/button'
const UI = Design
export const view = <M>(h: HtmlBuilder<M>): Html =>
  UI.button(({ style: 'color:red', children: ['Bad'] } as any), h)
```

```ts
import * as Design from '@design/button'
const { button } = Design
export const view = <M>(h: HtmlBuilder<M>): Html =>
  button(({ style: 'color:red', children: ['Bad'] } as any), h)
```

```ts
import { Dialog } from '@foldkit/ui'
const Modal = Dialog
export const rawView = Modal.view
```

```ts
import { Dialog } from '@foldkit/ui'
const { view } = Dialog
export const rawView = view
```

```ts
// headless-barrel.ts exports { Dialog } from '@foldkit/ui'
import * as Headless from './headless-barrel'
export const rawView = Headless.Dialog.view
```

The view snippets use the same actual Foldkit Html/HtmlBuilder type imports as
the direct positive controls. Direct asserted component props still report
no-unverifiable-ui; direct Dialog.view still reports no-unapproved-renderer.
Only the representation changes.

An additional probe uses the real Tailwind Popover and its registered export:
the direct Popover.popover call rejects triggerClass, but assigning
const Widgets = Popover and calling Widgets.popover with the same props returns
zero diagnostics. Both forms pass the isolated TypeScript check. This bypass is
therefore also verified with a real public component and a valid appearance prop,
without an assertion or handwritten component fixture.

These are common refactors and agent-generated import forms, not an attempt to
modify policy configuration. They violate Slice 1's explicit alias/destructuring
acceptance criteria. The ledger's original F2 row should not show no remaining
work while these forms pass.

Required correction: one shared origin resolver must retain component/headless
identity through supported immutable aliases, destructuring, namespace barrels
and constant members. Give unresolved contracted UI access an actionable
diagnostic. Add paired unrelated-object and non-rendering import fixtures to
avoid widening this into identifier-name or package-wide bans.

## F2 P2 Theme validation still approves invalid function arguments and alias kinds

Sources: [value validation](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/src/lib/theme-roles.ts#L276)
and [alias dependency checks](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/src/lib/theme-roles.ts#L323).

The two original invalid literals are now rejected. The function path checks
only a recognized name, balanced parentheses and a nonempty body before returning
valid. It does not validate the supported function's arguments. Alias references
check role existence and cycles without enforcing the referenced role's kind.

All of these partial definitions return an empty error array:

| Supplied values                          | Problem                               |
| ---------------------------------------- | ------------------------------------- |
| primary: rgb(banana)                     | Invalid color arguments               |
| primary: rgb(1 2)                        | Invalid channel count                 |
| primary: color-mix(in banana, red, blue) | Invalid interpolation color space     |
| radius: calc(banana)                     | Invalid length expression             |
| radius: min(red, blue)                   | Color keywords in a length expression |
| primary: var(--radius), radius: 1rem     | A color role aliases a length role    |

Actual Chromium CSS.supports also rejected rgb(banana), calc(banana) and the
invalid color-mix expression. Valid rgb(1 2 3) and calc(1rem + 2px) remain useful
passing counterparts.

Required correction: parse the supported grammar and argument/value kinds,
validate alias dependencies against role kinds and the resolved inherited
theme, and give unsupported expressions an explicit unsupported/unresolved
outcome. The existing tests establish literal/name/parenthesis checks, not the
complete grammar validation claimed by the original F5 ledger row.

## F3 P2 Mira fixes height by breaking square icon geometry

Source: [Mira preset rule](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/src/demo/create-preset.ts#L347).

Changing min-height to a fixed 28px height fixes the original ineffective compact
height setting. The rule applies to every single-line slot without resolving
named size or corresponding width.

Actual Pleat Create measurements at 1440 x 1000:

| Control                            | Nova      | Mira      |
| ---------------------------------- | --------- | --------- |
| Default action height              | 36px      | 28px      |
| Select trigger height              | 32px      | 28px      |
| Close dividend income summary icon | 32 x 32px | 32 x 28px |
| Close Payout Threshold icon        | 32 x 32px | 32 x 28px |
| Close Preferences icon             | 36 x 36px | 36 x 28px |

The new test checks only that the sampled single-line heights are <=28px. It
does not protect square icon geometry or the named size relationships required
by Slice 5. The selector also does not distinguish data-size values.

Required correction: derive compact geometry through the role/density/named-size
contract. Keep icon buttons square, preserve intentional named-size and
role-specific differences, and test xs/sm/default/lg and applicable icon sizes.
Use the same relationship checks in all three renderers. The current height
assertion is useful but insufficient.

## F4 P2 Actual DOM style aliases still bypass application styling checks

Source: [assignment analysis](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/packages/lint/rules/strict/index.js#L277).

The business-data false positive is fixed and direct element.style.color
mutation is rejected. Assigning through an ordinary local CSSStyleDeclaration
alias produces zero diagnostics:

```ts
export const restyle = (element: HTMLElement) => {
  const style = element.style
  style.color = 'red'
}
```

The syntax check recognizes a parent member literally named style, rather than
retaining the actual DOM style receiver through its binding. This escape predates
this patch's receiver fix, but remains contrary to the correction plan's DOM
alias coverage and the promised no-application-styles boundary.

Required correction: resolve DOM style/classList receiver provenance through
supported aliases/destructuring while preserving the now-passing business-record
cases. Add direct/aliased pairs. Do not solve it by reporting all objects with a
color or style property.

## F5 P2 Linked Items no longer satisfy their ItemGroup list contract

Sources: [Tailwind Item role change](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/src/ui/item.ts#L59)
and [ItemGroup role](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/src/ui/item.ts#L171).
The same change is present in StyleX and Pleat.

The agent correctly identified that role=listitem on an anchor hides its native
link role. Removing that role preserves the link but leaves ItemGroup, which
still renders role=list, without its required list-item structure:

```ts
Item.itemGroup({
  children: [
    Item.item({ element: 'a', href: '#track-one', children: ['Track one'] }, h),
    Item.item({ element: 'a', href: '#track-two', children: ['Track two'] }, h),
  ],
}, h)
```

Actual Tailwind component output has a role=list div containing two anchors with
no listitem wrapper. Chromium with Axe 4.13.0 reports aria-required-children:
"Element has children which are not allowed: a". This is also the composition
used by the docs image example, rather than an unsupported mixture of APIs.

The probe serialized the actual Item/ItemGroup VNodes and served that markup
over a local HTTP server; it did not replace either component implementation.
This is a structural ARIA check without the renderer stylesheet. StyleX/Pleat
share the same changed role branch, but this specific Axe reproduction was run
against Tailwind output, not separately against their bundled pages.

The ordinary-Item positive control uses the same component functions and passes
the same Axe role checks with one list and two listitems.

Required correction: define a coherent group/item structure that preserves both
the list-item relationship and the native interactive link. Do not simply restore
the original anchor role override. Add accessibility and keyboard checks for
linked, ordinary and mixed ItemGroups in every renderer, including the image
example. The flagship docs Axe test currently scans Button/Dialog/Input/Select,
so its green result does not cover this regression.

## Results for the previous seven findings

| Previous finding                     | Before                                         | Current result                                                                                                                 |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Original F1 builder type alias       | Imported alias bypassed raw rendering bans     | Original probe fixed; typed imported and inferred cases added                                                                  |
| Original F2 computed access/barrels  | Direct computed and named barrel forms passed  | Original probes fixed; ordinary aliases/destructuring/namespace barrels still fail enforcement                                 |
| Original F3 part-specific appearance | Real Popover triggerClass passed strict lint   | Original probe now reports component-contract; classification remains suffix-based, not generated per-export contracts         |
| Original F4 audit completeness       | Gradient/frame/empty axes passed               | Actual gradient/frame runs now return 2; empty viewport/theme axes fail validation; package tests cover report-only/exclusions |
| Original F5 theme values             | Arbitrary invalid color/length literals passed | Those literals now fail; invalid recognized-function bodies and wrong-kind aliases still pass                                  |
| Original F6 Windows runner           | npm ENOENT before packing                      | Verified repaired on this Windows machine, with actual npm and pnpm consumers                                                  |
| Original F7 business records         | Ordinary record.className assignment failed    | Original false positive fixed and direct DOM mutation rejected; DOM style alias remains unchecked                              |

## Completion against the repair plan

| Area                           | Implemented progress                                                                                              | Still required                                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R0 baseline and reconciliation | Review/repair plan imported; deliberate ./rendered and ./audit reconciliation documented                          | Reconcile remaining local research intentionally and keep the ledger/current API documentation consistent                                                                              |
| R1 complete theme              | Central role inventories, broader scoped rebinding, stronger validator, Date Picker scope repair                  | Complete resolved semantic theme, independent status roles, exhaustive adapters and patch precedence; nested light scopes/custom patches remain absent                                 |
| R1 overlay scope               | Static dark scope, Date Picker inheritance and a live scoped variable update are exercised                        | Full multiple/nested scope, registered patch, open-theme-update and detached-root lifecycle contracts                                                                                  |
| R2 presets                     | More catalog roles covered; compact control heights now change                                                    | Full catalog/finite-choice coverage, semantic density integration, named-size relationships and off-board component proof                                                              |
| R3 prevention                  | Shared production fixtures, green renderer/legacy/Firefox/WebKit jobs, useful geometry and interaction assertions | Reviewed visual baselines and the full prescribed state/coverage matrix; screenshots attached to tests are not comparison baselines                                                    |
| L1 source lint                 | Actual typed regressions, exact-file ownership validation, better computed calls/appearance checks                | Identity/DOM escapes above; canonical real export/prop/variant contracts and installer-owned metadata                                                                                  |
| L2 consumers                   | Packed package init/doctor/ESLint works outside the repo with aliases and typed JS; Windows npm/pnpm now verified | Real registry-installed strict settings/dashboard consumers, complete controls/layout/text replacements, types/production CSS/build/behavior proof; required manager/OS coverage in CI |
| A1/A2 auditing                 | Corrected incomplete outcomes, optional browser runner and a minimal host-page SDK using one measurement engine   | Remaining semantic relationships, typography/spacing/copy guidance and full optional audit delivery gates                                                                              |

Three specific gaps prevent treating the existing green checks as the first
strict consumer release:

1. [init still guesses ownership](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/packages/lint/bin/creaseui-lint.js#L69)
   from the text HtmlBuilder, filename/directory conventions and directly
   exported functions. It does not consume the planned complete canonical
   installer contract with render kinds, finite choices and source hashes.
2. [Packed verification still writes Button and Stack itself](https://github.com/Potti1234/creaseui/blob/c3a805a892dcff0ba8d0c83904ee617ccae9ce82/scripts/verify-lint-consumer.mjs#L164).
   That proves real package/config installation, not actual registry component
   or production CSS delivery. The public-export check is runtime JavaScript,
   not a full consumer typecheck/build.
3. Shared settings/dashboard fixtures still use raw h.section/h.div/h.p and
   inline style. They build actual components through repository aliases,
   rather than installing and linting complete ordinary strict applications.
   All-controls/layout/text remains the agreed first-release policy.

The theme scopes still expose colorScheme: 'dark' only. Status success/warning
still reference chart roles in the StyleX/Pleat token definitions. These are
visible signs that the canonical theme work is not complete, despite useful
repairs to particular scope and preset failures.

## Contrast policy and test changes

The agent records an owner decision to retain shadcn palettes. Accordingly the
500 known pair/configuration failures remain a shrink-only palette baseline.
New e2e filtering accepts four specific foreground/background combinations,
including muted text and destructive badge pairs.

Treat that as a recorded policy deviation from the supplied plan's contrast
repair gate, rather than evidence that contrast was repaired. Confirm the
recorded decision against the implementation session's authorization when
accepting that changed release criterion. The filter is color-pair based across
matching nodes; the green Axe result is therefore not zero raw Axe violations.
Keep excluded findings/counts visible and avoid an all-clear accessibility claim.

Most inspected legacy test changes have defensible causes: current docs section
names, actual shadcn fixtures, native link semantics, accessible control names,
real overlay anchoring and a different three-site navigation cycle. Splitting CI
jobs and giving measured slow tests longer total timeouts is reasonable; the
ordinary expect timeout remains 5 seconds.

The sheet scrim check now pauses a real running transition and seeks to 25%,
asserting its duration and computed opacity. That is a deterministic CSS
transition check, not a synthetic style override. Other motion, first/last-frame
and focus checks remain. The code-block divider test measures the actual gutter
and guards a real Tailwind arbitrary-value compilation bug.

Some coverage moved or disappeared: the retired constrained inspector test was
removed and the Navigation Menu Scene hover case is now explicitly skipped
because Scene cannot dispatch mousemove. Browser hover checks provide
replacement coverage. Those changes
should be reported as coverage changes, rather than equating a green suite with
the complete strict composition plan.

## Verification

Fetched the latest PR into the clean isolated review checkout:
C:/Users/lpottner/Documents/MaasProjects/creaseui-reliability-review.
The main checkout's local changes were preserved. The remote PR head was checked
again during verification and remained c3a805a8.

| Check                               | Result                                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remote CI at the reviewed head      | Quality, renderer browser, legacy e2e and Firefox/WebKit jobs all passed                                                                                                            |
| Local npm run check                 | Passed end to end: formatting/generated metadata/parity/source lint, 8 GB typecheck, package/unit/Scene suites and all three production builds; 368 accepted design-system warnings |
| Local full typecheck                | Passed through npm run check with the configured 8 GB heap                                                                                                                          |
| Local lint package suite            | 72 passed, zero failed or skipped                                                                                                                                                   |
| Local unit suite                    | 503 passed, zero failed or skipped; includes the complete copyable-program typecheck                                                                                                |
| Local Scene suite                   | 44 files passed; 1,596 passed, 292 expected failures, 2 skipped, 470 todo; zero unexpected failures                                                                                 |
| Local production builds             | Tailwind, StyleX and Pleat passed (22.83s / 25.91s / 16.06s)                                                                                                                        |
| Documentation example inventory     | 121 pages; 762 examples per renderer (2,286 total); no per-page count mismatch; all programs compiled in the unit suite                                                             |
| Real Popover alias/type probe       | Direct appearance override rejected, identical namespace-alias call passes lint; both pass TypeScript                                                                               |
| ItemGroup structural accessibility  | Actual Tailwind output with linked Items fails Axe aria-required-children; ordinary Items pass the same checks                                                                      |
| Local packed consumers on Windows   | Passed: Tailwind/npm, StyleX/npm with typed JS, Pleat/pnpm; init, doctor, strict good/bad samples and public exports                                                                |
| Shared production renderer fixtures | 11 passed, including Date Picker dark scope, settings/dashboard behavior, geometry and scoped overlay comparison                                                                    |
| Original typed source probes        | Original F1/F2/F3/F7 outcomes repaired                                                                                                                                              |
| Additional typed source probes      | Five component/headless alias/destructuring forms and the DOM style alias return zero diagnostics                                                                                   |
| Actual browser audit probes         | Gradient and frame return 2; empty viewport/theme arrays fail setup                                                                                                                 |
| Theme probes                        | Original invalid literals rejected; six additional invalid definition cases return no errors                                                                                        |
| Manual Pleat Create check           | Mira measured/visually inspected at 1440 x 1000; compact heights work and icon width/height mismatch reproduced                                                                     |

Latest successful [GitHub CI run](https://github.com/Potti1234/creaseui/actions/runs/38671371928).

The Scene suite is green under its recorded classifications, which include
292 expected failures, two skips and 470 todos. These are not unexpected failures
from this local run, but remain coverage/compatibility limitations. The repair
diff adds one shared Navigation Menu hover skip used by two renderers and adds
no new Scene expected-failure or todo declarations. Do not equate the suite's
success status with every recorded behavior contract being complete.

The independent remote gates are evidence for the configured suites, not the
missing plan outcomes above. Full legacy and Firefox/WebKit suites were checked
through their remote results; this review does not claim a second local rerun of
all those tests. The local browser work used the shared production fixtures and a
separate Pleat development server at 4275, preserving existing user previews.
The review-owned browser and development server were closed after inspection.

## Evidence and next work

Ignored output/playwright artifacts in the review checkout:

- pr28-r2-check.log, pr28-r2-github-status.json and pr28-r2-ci-quality-job.json.
- pr28-r2-consumers.log; the runner retained its clean temporary consumers.
- pr28-r2-fixtures.log.
- pr28-r2-strict-probe.mjs and pr28-r2-strict-probe-results.json.
- pr28-r2-extra-probe.mjs and pr28-r2-extra-probe-results.json.
- pr28-r2-appearance-slot.ts and pr28-r2-appearance-probe-results.json.
- pr28-r2-appearance-alias-slot.ts, pr28-r2-appearance-alias-results.json and
  pr28-r2-appearance-typecheck.log (successful isolated check has no output).
- pr28-r2-example-counts.mjs and pr28-r2-example-counts.log.
- pr28-r2-audit-probe.mjs and pr28-r2-audit-probe-results.json.
- pr28-r2-extra-theme-probe.mjs and pr28-r2-extra-theme-results.json.
- pr28-r2-mira-measure.log and pr28-r2-mira.png.
- pr28-r2-item-markup-probe.mjs, pr28-r2-item-group.html and
  pr28-r2-item-axe-results.log (successful HTTP run records one list, two links
  and the aria-required-children finding).

The original artifacts were preserved; fresh probes/results use the r2 prefix.
The audit reproduction was adapted to catch newly rejected empty-axis setup
errors per case. That preserves the original inputs while allowing all four
outcomes to be recorded.

Next, close the five concrete findings with regression pairs, then complete the
canonical theme and real strict installed-consumer slices. Consolidate the
ledger so original F2/F5 gaps and the release blockers are visible, remove stale
remaining-work statements already superseded by later fixes, and update the PR
description to the current scope and actual evidence.

The agent's strongest work is the interaction/CI investigation and the concrete
original defect repairs. The recurring weakness is marking a boundary repaired
after testing selected spellings/examples, without covering the equivalent
binding forms or completing the shared contract. This is useful progress toward
the intended system, not a completed reliable lint/design release.

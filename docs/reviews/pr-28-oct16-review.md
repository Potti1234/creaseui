# PR 28 review on October 16

PR: [Design reliability and consumer lint](https://github.com/Potti1234/creaseui/pull/28).
Reviewed head: a9b270a3b0bab2683c8263c680527c56ee1b845b.
Previous reviewed head: 244b4c79cf901a28f7e2e8d57a9b4dd59aaee390.
The update adds 17 commits and changes 20 files.

The separate review checkout is creaseui-pr28-review-oct16. The dirty main
workspace, earlier review checkout and archived tutorial remain preserved.

## Assessment

The repairs are useful and materially improve the PR. All five exact examples
from the last review are addressed, and the latest CI run has successful quality,
browser, cross-browser and legacy e2e jobs. The previous legacy e2e failure is no
longer the current CI state.

Four remaining issues reproduce at this head: namespace identity is still lost
through import-then-export barrels, public function aliases escape installer and
doctor coverage, icon width overrides defeat named geometry, and ItemGroup now
creates an empty semantic item for a decorative separator.

The strongest recurring weakness is that discovery, doctor and the consumer proof
reuse an incomplete export inventory. Testing every already registered export
cannot prove that no public rendering exports were omitted.

## F1 P1 Namespace import followed by export bypasses the component contract

Source: [namespaceTarget](https://github.com/Potti1234/creaseui/blob/a9b270a3b0bab2683c8263c680527c56ee1b845b/packages/lint/lib/strict/ownership.js#L412).
The branch at line 426 skips exports without a module specifier. The new resolver
handles export-star-as declarations, but not the equivalent namespace binding
imported first and exported later.

```ts
// design.ts
import * as Button from '@/ui/button'
export { Button }

// feature.ts
import { Button } from './design'
export const view = (h: HtmlBuilder<unknown>): Html =>
  Button.button({ children: ['Bad'], class: 'text-red-500' }, h)
```

This is valid TypeScript and produces zero strict diagnostics. Importing the
barrel as a namespace or renaming the exported binding also produces zero.
The identical class through a direct Button import and through the newly repaired
export-star-as form correctly produces crease/component-contract.

Follow namespace bindings through imports and local named exports using the
shared origin model. Include renamed, namespace-consumer, multi-hop and unrelated
object controls. An unresolved supported UI origin must not become uninspected.

Evidence: pr28-r4-lint-probe.mjs, its results JSON and the passing isolated
pr28-r4-probe.tsconfig.json typecheck in the review output/playwright directory.

## F2 P1 Public rendering aliases are omitted while doctor reports complete coverage

Sources: [export discovery](https://github.com/Potti1234/creaseui/blob/a9b270a3b0bab2683c8263c680527c56ee1b845b/packages/lint/bin/creaseui-lint.js#L41)
and [doctor export coverage](https://github.com/Potti1234/creaseui/blob/a9b270a3b0bab2683c8263c680527c56ee1b845b/packages/lint/bin/creaseui-lint.js#L278).

Append an ordinary public alias to the actual Button source:

```ts
export const actionAlias = button
```

Fresh init registers button and buttonLink, but omits actionAlias. Doctor uses the
same exportedFunctions heuristic and returns exit 0 with 0 uncovered UI modules.
In a feature, actionAlias with class: 'text-red-500' gets no diagnostic; button
with identical props is rejected. The paired consumer TypeScript check passes.

The reproduction copies the real Button source into a fixture and resolves its
behavior dependencies against this review checkout. This is independent of the
ordinary fresh-registry suite, whose positive results do not cover this alias.

Do not add only another initializer pattern. Consume exhaustive installer
contracts and independently reconcile the public rendering API with source/type
exports. Supported aliases must retain the original contract identity. Doctor
must detect omitted render exports and report unresolved cases explicitly.
Non-rendering exports must remain legal.

Evidence: ownership-probe fixture, pr28-r4-alias-init.log,
pr28-r4-alias-doctor.log, pr28-r4-alias-lint.json and passing
pr28-r4-alias-types.log. Only the direct call on line 4 is diagnosed; the alias
call on line 3 is missed.

## F3 P2 Width placement can still collapse a named icon button

Sources: [placement and owned geometry](https://github.com/Potti1234/creaseui/blob/a9b270a3b0bab2683c8263c680527c56ee1b845b/packages/lint/lib/strict/contracts.js#L120)
and [class analysis](https://github.com/Potti1234/creaseui/blob/a9b270a3b0bab2683c8263c680527c56ee1b845b/packages/lint/lib/strict/component-calls.js#L424).

```ts
button({ size: 'icon', class: 'w-3', children: ['X'] }, h)
```

This passes TypeScript and strict lint. Rendering the real component output with
the newly built production Tailwind CSS gives:

| Case                       | Width | Height |
| -------------------------- | ----- | ------ |
| Ordinary named icon button | 36px  | 36px   |
| Same button with w-3       | 12px  | 36px   |

The new rule protects height and size utilities, but treats all width overrides
as placement. An icon variant owns both dimensions and its square shape.
Retain legitimate width/fill on appropriate text controls; use per-component and
per-variant geometry rather than banning every width on every control.
Test equivalent StyleX/Pleat inline-size/min/max-size paths.

The additional min/max-width example did not shrink in this production CSS
fixture; it is not counted as a second rendered defect.

Evidence: the typed lint probe, pr28-r4-rendered-probe.mjs, its generated HTML,
pr28-r4-rendered-results.log and pr28-r4-rendered.png.

## F4 P2 Decorative Item separators become empty list items

Source: [ItemGroup wrapper](https://github.com/Potti1234/creaseui/blob/a9b270a3b0bab2683c8263c680527c56ee1b845b/src/ui/item.ts#L173).
The group wraps every Html child in role=listitem, including itemSeparator.

```ts
itemGroup({
  children: [
    item({ children: ['First item'] }, h),
    itemSeparator({}, h),
    item({ children: ['Second item'] }, h),
  ],
}, h)
```

The browser accessibility snapshot exposes three list items, one empty, for two
content entries. The DOM confirms two data-slot=item elements and three
role=listitem wrappers. Decorative separation should not change the list count.

The standalone Item repair is correct for the tested cases. Extend it with
explicit item-versus-separator composition instead of assigning identical
semantics to opaque children. Avoid inspecting or cloning private VNode structure
as a public API shortcut. Preserve native standalone semantics and valid grouped
plain, linked and mixed items.

The updated site test counts only list-item wrappers containing data-slot=item,
so it excludes the empty separator wrapper from its count, while its unwrapped
assertion requires every child to carry listitem. Count all exposed semantic
items in the regression, rather than filtering out the erroneous one.

This reproduction runs the Tailwind source. StyleX and Pleat have the same
unconditional wrapping loop; their separator case still needs a browser regression
test. The existing three-renderer grouped tests do not exercise separators.

Evidence: pr28-r4-rendered-probe.mjs, rendered results and the recorded browser
snapshot. A generic structural Axe pass would not establish correct list counts.

## Status of the previous review

| Previous finding                   | Result                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Export-star-as namespace barrels   | Exact reviewed forms now rejected; F1 above remains                                     |
| Factory-created Card exports       | Local factory exports are now registered; general export completeness still fails in F2 |
| Five invalid supported CSS values  | Rejected; the independent browser grammar suite passes                                  |
| h-3 defeats Button size            | Rejected; icon width remains unprotected in F3                                          |
| Standalone linked Item orphan role | Fixed in all three tested renderers; separator semantics regress in F4                  |

The Pleat no-preflight comparison now waits for settled frames, uses an empty
stylesheet control for repaint behavior and compares document-wide computed
styles, including portaled overlays and more font properties. The focused fixture
suite passes locally; no pixel tolerance was introduced to excuse arbitrary drift.

## Verification

Independently verified at this head:

- npm ci --ignore-scripts completed from the lockfile; root lifecycle hooks were
  not installed for this review.
- Lint package: 110 passed, no failures or skips.
- Theme/palette/browser-grammar selection: 25 passed, no failures or skips.
- Three production renderer builds passed.
- Full repository TypeScript check passed.
- The registry rebuilt from this head, and the fresh packed strict-consumer run
  passed all 30 script checks across Tailwind, StyleX and Pleat. The export-negative
  checks exercise 19/20/20 registered exports respectively. These checks do not
  independently establish completeness or launch the installed apps.
- Shared production fixtures and Pleat preflight: 22 passed, including standalone
  and grouped Item semantics, scoped themes, overlays and settings/dashboard data.
- Isolated TypeScript checks passed for the namespace/geometry cases and the
  actual-Button alias consumer.
- Actual component output plus production CSS independently confirms F3 and F4.

The latest pull-request CI run
[38796332679](https://github.com/Potti1234/creaseui/actions/runs/38796332679)
has successful quality, browser, cross-browser and e2e jobs. The push run
[38796325166](https://github.com/Potti1234/creaseui/actions/runs/38796325166)
also concludes success. Those are CI results, separate from the local checks above.

The full local unit/Scene suite and full local browser/device matrix were not
repeated. The existing ledger still records incomplete source/installer contracts,
theme patch precedence, reviewed visual baselines, rendered audit coverage,
Windows/pnpm CI and specific component parity gaps.

## Tutorial experiment and the next assignment

The archived tutorial at f723c380ca66da05acca50727b0f210949840342 is a separate,
earlier consumer. Its global CSS, rebuilt Sidebar and ignored authoring sources
are not newly introduced by these 17 commits. They are concrete counterexamples
the next enforcement work must cover.

The freshly rebuilt Sidebar item at the reviewed head still has no meta, docs or
categories fields. The registry and Foldkit discovery follow-up therefore remains
applicable; it was not delivered by the latest repair commits.

The [combined agent plan](../plan/pr-28-enforcement-followup-agent-plan.md)
separates these four code findings from the additional CSS/authoring/discovery
requirements and carries forward the registry metadata experiment. It does not
require a special dashboard scaffold or a user-prepared component inventory.

The PR head was rechecked after verification and still matches the SHA above.
The review checkout has no source changes. The dedicated probe server and review
browser have stopped; existing user servers and the archived demo were preserved.

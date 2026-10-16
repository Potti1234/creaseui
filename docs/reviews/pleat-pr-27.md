# Independent review of Pleat PR #27

Reviewed on 2026-10-13. PR: [feat: add Pleat as third styling renderer](https://github.com/Potti1234/creaseui/pull/27).

For the updated PR head and verification of the fixes, see the
[fourth review](pleat-pr-27-round-four.md). The
[third review](pleat-pr-27-round-three.md) and
[second review](pleat-pr-27-followup.md) record the intermediate updates.

Head: `2463fa824dfe13e055c580cf2a9f3fd047d29b99`.
Base: `0968bd8dcfbcc1634279fddaa22992ec9416964d`.

## Verdict

Keep this as a useful full-port foundation, but request changes before merging
or advertising consumer parity. It uses native Pleat styles and reuses the
existing behavior layer. Its module count matches StyleX. Complex overlay
behavior works in the targeted browser checks. However, automated conversion
has introduced visible layout failures, broken documentation programs, and a
weaker public styling boundary. Installation and lint support are incomplete.

This review is against the PR itself, not the earlier experimental Pleat work
in the main checkout. No PR source files were changed and no merge was made.

## Isolated preview

Detached worktree:
`C:/Users/lpottner/Documents/MaasProjects/creaseui-pleat-review`.

Fresh dependencies were installed with `npm ci --ignore-scripts`.
The main checkout and its uncommitted work were preserved.

Production previews from this worktree:

| Renderer | URL                                          | Process ID |
| -------- | -------------------------------------------- | ---------- |
| Pleat    | http://127.0.0.1:4175/docs/components/button | 87228      |
| StyleX   | http://127.0.0.1:4174/docs/components/button | 74168      |
| Tailwind | http://127.0.0.1:4173/docs/components/button | 61836      |

These ports support the site's existing renderer-switch links. Logs and QA
artifacts are in the review worktree's ignored `output/playwright/` directory.
Restart with `npm run preview:pleat -- --host 127.0.0.1`, or the corresponding
`preview:stylex` / `preview:tailwind` command, from the review folder.

## Findings

### P1: direct-child conditions generate invalid CSS and break Input Group

[input-group.ts](https://github.com/Potti1234/creaseui/blob/2463fa824dfe13e055c580cf2a9f3fd047d29b99/src/pleat/input-group.ts#L45)
turns `:has(> textarea)` into
`When.has(When.pseudo(':is(> textarea)'))`. A relative selector beginning with
`>` is valid directly inside `:has`, but not inside the nested `:is`.
Chromium confirms:

```js
CSS.supports('selector(:has(:is(> textarea)))') // false
CSS.supports('selector(:has(> textarea))')     // true
```

The browser comparison measured eight stacked Input Group examples. Pleat
kept every group at `flex-direction: row` and 32px tall. Tailwind and StyleX
used `column` and appropriate heights of 71–294px. The `block-start-textarea`
example was 32px tall in Pleat and 108px in both other renderers; its textarea
overflowed its container. This is a functional layout regression, including
the RTL example, rather than a small visual difference.

The same invalid pattern occurs in `button-group.ts`, `field.ts`, and
`toolbar.ts`. Fix the converter and every generated occurrence. For these
conditions, `When.pseudo(':has(> textarea)')` preserves valid CSS; use an
equivalent validated relation where the API supports it. Add browser checks
for stacked groups, nested groups, responsive fields, and toolbar edges.

Evidence: `input-group-comparison.log`, `pleat-input-group-textarea.png`,
`stylex-input-group-textarea.png`, and `tailwind-input-group-textarea.png`.

### P1: displayed documentation programs do not compile

[pleat-source.ts](https://github.com/Potti1234/creaseui/blob/2463fa824dfe13e055c580cf2a9f3fd047d29b99/src/docs/components/pleat-source.ts#L373)
rewrites `StaticStyles` to `Style.Style` everywhere, including import lists.
The Persian Calendar program therefore contains invalid syntax:

```ts
import type { Style.Style } from '@stylexjs/stylex'
```

The same converter injects `className` imports even when the rewritten
program already imports that binding. A scan of all 762 emitted Pleat
examples found 229 programs with duplicate import bindings and 11 with syntax
errors. The corresponding 762 StyleX programs had neither problem in these
scans. These counts describe two overlapping checks and must not be added.

A focused semantic TypeScript check of the first three examples for Button,
Input Group, Calendar, Combobox, Field and Dropdown Menu found 5 failures out
of 18 Pleat programs and zero failures in the corresponding 18 StyleX programs.
Failures included Calendar Demo/Basic, Persian Calendar, Combobox Multiple,
and Field Payment Method. This was not a semantic typecheck of all 762 programs.

The site can build successfully because these programs are strings. Replace
fragile text rewriting with explicit native emitters or an AST conversion
that understands imports and types. Parse and typecheck emitted programs as a
separate gate, and verify that the copied program renders the shown example.

Evidence: `inventory.json`, `source-audit.json`, `source-audit-summary.json`,
and `doc-samples.json`.

### P1: the public layout-only contract was removed

[contracts.ts](https://github.com/Potti1234/creaseui/blob/2463fa824dfe13e055c580cf2a9f3fd047d29b99/src/pleat/contracts.ts#L14)
defines `ComponentLayoutStyle = Style.Style`. The accompanying comment
explicitly calls this a documentation-level contract. The equivalent StyleX
type accepts a closed set of parent-layout properties and has negative
compile-time assertions.

The PR accepts this Button call without any TypeScript diagnostics:

```ts
Button.button({
  layoutStyle: Style.make({
    backgroundColor: 'red',
    padding: '97px',
    borderRadius: '73px',
  }),
  children: ['Bad override'],
}, h)
```

Button merges the supplied style after its own visual styles. Consumers and
agents can therefore bypass the named variants and replace component-owned
appearance through a prop documented as layout-only. Restore a branded,
validated layout constructor with the same property allowlist, expose finite
appearance variants, and check prohibited properties and conditions at both
the type and lint boundaries. The earlier experimental implementation has a
useful starting point for this contract.

### P1: advertised Pleat installation commands have no registry items

[catalog.ts](https://github.com/Potti1234/creaseui/blob/2463fa824dfe13e055c580cf2a9f3fd047d29b99/src/docs/components/catalog.ts#L500)
advertises commands such as `Potti1234/creaseui/pleat-button`.
[registry.json](https://github.com/Potti1234/creaseui/blob/2463fa824dfe13e055c580cf2a9f3fd047d29b99/registry.json)
includes the Tailwind and StyleX registries, with no Pleat registry. Expanding
all included manifests found 373 items and zero `pleat-*` items.

The vendored Pleat workspace packages also need a real consumer distribution
path; copying a component must bring in its tokens, reset, style adapter,
behavior dependencies, and Pleat runtime. Workspace-local `file:` dependencies
do not supply those packages to a fresh consumer automatically.

Generate a Pleat registry and install it into an empty consumer fixture before
publishing the commands. Update Getting Started for Pleat: the shared guide
still presents the Tailwind setup, and the Pleat component page says to copy
the “StyleX source.” Verify alias rewriting, Vite setup, theme registration,
dependency closure and build output without Tailwind.

### P2: Pleat is included in the lint command but has no styling rules

The effective ESLint configuration for `src/pleat/button.ts` contains zero
`crease/*`, `shadcn/*`, or StyleX styling rules. The lint package in this PR
exports Tailwind and StyleX policies; adding `src/pleat` to a command does not
create a Pleat policy. General TypeScript import rules still run.

Consequently the PR does not preserve the lintability discussed for the
experimental renderer. Reconcile the existing Pleat preset and property limits,
then test identical prohibited overrides, raw colors/radii/motion, dynamic
style construction and raw-control restrictions across all three engines.
Do this before using lint-clean status as evidence of visual quality.

### P2: example program shells retain Tailwind utility classes

435 of 762 emitted Pleat programs retain this shared application shell:

```ts
h.Class('flex min-h-screen items-center justify-center p-8')
```

Pleat does not generate CSS for those Tailwind utilities. This means a copied
program loses its page positioning and padding unless the consumer also adds
Tailwind. The same shell exists in StyleX examples, so this is inherited
documentation debt extended to the third renderer, rather than a newly
introduced StyleX regression. Emit renderer-native shell styles for both
non-Tailwind renderers and actually run copied examples without Tailwind CSS.

### P2: preserve upstream attribution in the vendored packages

The two vendored Pleat packages contain no upstream LICENSE file, and this
repository's LICENSE names only Potti1234. The pinned
[upstream LICENSE](https://github.com/Manzanita-Research/pleat/blob/7d579dcd63ac364eaf335c396fc583965474c897/LICENSE)
names Manzanita Research. Copy the upstream license alongside the vendored
source and ensure it is included in consumer/package artifacts. Record the
full source revision and any local changes for future updates.

## Validation and limits

Completed:

- All three independent production builds passed.
- Full TypeScript checking passed with
  `node --max-old-space-size=8192 node_modules/typescript/bin/tsc --noEmit`.
  The ordinary `npm run typecheck` exhausted the default approximately 4GB heap.
  Whether that resource increase is introduced by this PR was not established.
- Documentation metadata and the parity contract passed for 121 components.
- Nine focused existing unit tests passed: site facts, preset creation and
  registry dependency declarations.
- All ten existing lint-package tests passed. They do not provide Pleat rules.
- Fifteen existing Pleat browser tests passed for Menubar, Multi Selector,
  navigation/form popover sizing and Sheet. These include keyboard behavior,
  focus, clipping, drag/animation and widths from 320 to 1440px.
- Another 124 existing Pleat browser tests passed: a fresh-page smoke check for
  each of the 121 catalog components and three route/theme/navigation checks.
  The route checks cover the landing page, Button, Create, charts, and blocks
  at desktop and mobile widths. Total existing browser checks passed: 139.
- Scanned all 762 Pleat documentation programs for syntax and import bindings;
  semantically checked 18 paired programs per renderer as described above.
- Compared stacked Input Group examples directly across the three renderers.
- Captured and inspected Combobox, Calendar and Data Table screenshots at
  1440px and 390px in light and dark themes. All twelve measured states had
  the expected renderer/theme, visible preview containers and no document
  horizontal overflow or page errors. This does not certify every internal
  component's visual parity. Evidence: `visual-review.log` and the
  `pleat-docs-components-*.png` screenshots.

Global ESLint still reports two `consistent-type-imports` errors in
`src/lib/echarts.ts`, lines 29 and 31. That file is unchanged from the PR base;
these are existing failures, not attributed to the Pleat port.

A fast in-app crawl rendered the first 17 documentation pages, then encountered
Foldkit's “Schema validation failed” crash when navigating from Message
Scroller to Accordion. It was stopped; the remaining routes were not validated
by that crawl. Its `visited: 121` field counts attempted routes, not successful
pages, and its zero preview counts use a mismatched selector. Do not interpret
that output as full catalog coverage. The route crash still needs an isolated
reproduction and comparison with the base/other renderers before assigning it
to this PR. Foldkit handles the crash internally, so a `pageerror` listener
alone did not catch it; browser gates should also assert that the crash view
and console errors are absent.

The targeted suite's StyleX-only trigger-appearance and reset-independence
assertions do not establish Pleat parity. In particular, the existing catalog
test applies its deeper preflight/reset comparison only to StyleX. Passing
the equivalent Pleat smoke tests is weaker evidence than those StyleX checks.
Fresh-page catalog success also does not resolve the interrupted in-app crawl's
queued-message crash.

## Recommended next work

1. Preserve the broad component port, fix selector conversion, and add focused
   visual checks for nested and stacked layouts.
2. Restore the strict layout boundary and integrate the existing Pleat lint
   work before expanding consumer presets.
3. Replace or repair the documentation conversion, including renderer-native
   application shells; validate copied programs independently from the site.
4. Finish consumer registry/runtime/theme installation and upstream attribution.
5. Extend the existing reset and trigger-appearance assertions to Pleat and
   investigate the cross-route crash. Re-run the gates after these changes.

The consumer lint rollout is specified separately in
[the implementation plan](../plan/consumer-ui-lint-plan.md). That plan should
be applied to all three renderers rather than weakening the policy to fit the
generated port.

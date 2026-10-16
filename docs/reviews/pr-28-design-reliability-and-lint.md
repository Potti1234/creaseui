# PR 28 design reliability and consumer lint review

Reviewed on 2026-10-14. PR: [Design reliability and consumer lint](https://github.com/Potti1234/creaseui/pull/28).
Head: `838295176eda1ba5f0ec0afd375d9aada1437469`.
Pleat base: `772144cbaf3fb71b8cce194f83272bb78424aed8`.
The remote head was checked again at the end of verification and was unchanged.

## Assessment

The checked styling changes make sense: scoped primary hover is repaired,
presets reach more control parts, overlay surfaces align more closely, and shared
production fixtures exercise real components across all three renderers.
The consumer lint and audit implementation needs corrections before it can
provide the planned guardrails. Four high-priority failures are reproducible,
with additional validator, portability and false-positive defects below.

The workstream is also incomplete. Its ledger explicitly retains missing theme,
density, contrast and overlay work. Keep the useful implementation, fix the
guardrails, then finish the delivery gates in the
[agent handoff](../plan/reliability-and-lint-agent-handoff.md). This review does
not recommend accepting the PR as the completed reliability/lint release.

## F1 P1 Imported builder type aliases bypass raw rendering bans

Source: [resolver.js:124](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/lib/strict/resolver.js#L124).

The parameter branch checks an explicit type annotation through its local syntax
resolver and uses the checker only when there is no annotation. An HtmlBuilder
type re-exported by another source module is not recognized by that syntax path.
The raw-control and appearance rules consequently cannot identify the builder.

Reproduction with the actual typed `creaseui()` factory:

```ts
// builder-alias.ts
export type { HtmlBuilder as AppBuilder } from 'foldkit/html'

// application view
import type { AppBuilder } from './builder-alias'
import type { Html } from 'foldkit/html'

export const view = <M>(h: AppBuilder<M>): Html => h.button([], ['Raw'])
```

Result: zero diagnostics. The same raw button with a direct HtmlBuilder import
correctly produces `crease/no-raw-controls`. Type information is enabled in
both cases; this is not a parser-setup failure or a syntax-only test limitation.

Required fix: use type/symbol resolution for explicit annotations as well as
inferred parameters, follow imported aliases/re-exports, and verify the original
Foldkit declaration. Do not rely only on the displayed type name. Add passing
unrelated-type/shadowing fixtures alongside failing imported-alias raw views.

## F2 P1 Computed component access and headless reexports skip enforcement

Sources: [component-calls.js:57](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/lib/strict/component-calls.js#L57)
and [strict/index.js:171](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/rules/strict/index.js#L171).

Component lookup rejects every computed member. The headless-view check also
returns immediately on computed access and recognizes headless modules only
from direct `@foldkit/ui` imports. Supported constant access and barrels can
therefore hide the very operations strict mode must check.

Observed with typed source lint:

| Operation                                                                            | Actual result            |
| ------------------------------------------------------------------------------------ | ------------------------ |
| Direct `Design.button` with asserted appearance props                                | `no-unverifiable-ui`     |
| `Design['button']` with the same asserted props                                      | Zero diagnostics         |
| Direct `Dialog.view` imported from `@foldkit/ui`                                     | `no-unapproved-renderer` |
| `Dialog['view']` from that same import                                               | Zero diagnostics         |
| `Dialog.view` imported through a local `export { Dialog } from '@foldkit/ui'` barrel | Zero diagnostics         |

Required fix: resolve constant computed members, namespace aliases and export
origins through the shared resolver. Unknown contracted UI access must produce
an actionable diagnostic. Preserve ordinary Message/type/init/update imports
and legitimate composed feature callbacks. Add paired direct/computed/barrel
fixtures so these representations enforce the same policy.

## F3 P1 Existing component appearance slots remain available to applications

Sources: [contracts.js:53](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/lib/strict/contracts.js#L53),
[component-calls.js:313](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/lib/strict/component-calls.js#L313)
and [Popover's triggerClass](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/src/ui/popover.ts#L50).

The contracted-call analyzer checks a short global forbidden-property list,
`class`, `*LayoutStyle`, literal children and recorded variants. It does not
inventory other appearance slots exposed by the installed component.

A view using the real Tailwind Popover, registered as `overlay.popover`, passes
strict lint with this valid public prop:

```ts
triggerClass: 'bg-red-500 rounded-full text-3xl'
```

The full probe also passes TypeScript. Popover applies those classes directly to
its trigger. No assertion, untyped props spread or unknown import is needed to
override color, radius and typography. Select exposes a similar trigger slot;
the verified reproduction here uses Popover.

Required fix: generated component contracts must enumerate appearance and
placement slots from the real public APIs, including part-specific class slots.
Reject appearance overrides in strict application code, or restrict explicitly
retained placement slots to their complete proven placement contract. Check
resolved spreads and opaque typed props against those fields too. Registration
must not turn an existing appearance escape into an approved consumer prop.

## F4 P1 Incomplete browser audits return a passing exit code

Sources: [audit matrix normalization](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/lib/audit/index.js#L70)
and [exit code calculation](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/lib/audit/index.js#L346).

The result records unresolved measurements and unsupported content, but only
unvisited cases affect completeness at exit. Empty axes are also accepted and
produce no combinations. These real Chromium audit runs all returned exit 0:

| Configuration or page     | Coverage                            |
| ------------------------- | ----------------------------------- |
| Text over a gradient      | One unresolved contrast measurement |
| Page containing an iframe | One unsupported frame               |
| `viewports: []`           | Zero checked cases                  |
| `themes: []`              | Zero checked cases                  |

The README promises exit 2 for incomplete coverage. This behavior defeats a CI
gate by presenting an incomplete or empty run as complete and passing.

Required fix: reject empty required axes/states and invalid matrix values. Required
unresolved/unsupported coverage must return 2 unless explicitly excluded under a
validated coverage policy with recorded scope and reason. Report-only must not
turn incomplete execution into success. Add fixtures for zero combinations,
unresolved contrast, frames/shadow roots and mixed findings plus incomplete
coverage; incomplete execution must take precedence.

## F5 P2 Theme kind validation accepts invalid values

Source: [theme-roles.ts:232](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/src/lib/theme-roles.ts#L232).

`validateThemeDefinition` rejects a few recognizable wrong-kind patterns, but
does not validate a value against the declared kind. With `partial: true`, both
of these patches return an empty error array:

```ts
{ primary: 'definitely-not-a-color' }
{ radius: 'definitely-not-a-length' }
```

Required fix: validate supported value grammar, nonempty/string values and alias
dependencies against actual role kinds. Unsupported expressions require an
explicit unresolved/validation outcome rather than a valid result. Include
invalid literals, malformed functions, unresolved aliases and valid supported
expressions. Complete the wider semantic schema during R1 instead of presenting
the current palette-only validator as the full theme contract.

## F6 P2 Packed consumer verification fails on Windows

Source: [verify-lint-consumer.mjs:24](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/scripts/verify-lint-consumer.mjs#L24).

`npm run lint:consumers` fails immediately with `spawnSync npm ENOENT` on this
machine. `execFileSync('npm', ...)` does not invoke the Windows npm command shim
as a native executable. Later package-manager calls use the same approach.

Required fix: use a cross-platform process launcher or invoke the resolved CLI
through `process.execPath`. Cover packing and both package-manager invocation
paths on Windows and Linux. The script's second-manager fallback must be reported
as narrower coverage when pnpm is absent, not as proof of two managers.

The fixture generator also writes small handwritten Button/Stack implementations.
That proves package/config behavior, not real registry component installation,
production CSS or a strict settings/dashboard consumer. Those release checks
remain necessary after fixing the runner.

## F7 P2 DOM styling detection reports ordinary business data

Source: [strict/index.js:251](https://github.com/Potti1234/creaseui/blob/838295176eda1ba5f0ec0afd375d9aada1437469/packages/lint/rules/strict/index.js#L251).

Assignment detection treats a property named `className`, `style` or similar as
DOM styling without proving the receiver is a DOM object. This plain data
normalizer gets `crease/no-application-styles`:

```ts
export const normalizeRecord = (input: { className: string }) => {
  const record = { ...input }
  record.className = 'premium'
  return record
}
```

There is no DOM or UI rendering in this function. The same rule applies to all
configured application source, including normal data utilities.

Required fix: use receiver binding/type provenance for known DOM mutations and
keep ordinary business properties legal. Add positive data-object cases paired
with genuine HTMLElement/classList/style mutations. Do not solve this by
excluding all model/update files from the rendering rules.

## Remaining plan outcomes

These are completion gaps, separate from the reproducible defects above.
Several are honestly listed in `docs/reliability-ledger.md` already.

- **R1 theme model:** existing token groups are centralized, but there is no
  complete resolved theme covering all palette/state, geometry, typography,
  status, surface and motion roles with documented patch precedence. Status
  colors still reference chart roles. Composition scopes remain partial;
  `colorScheme` only supplies a dark subtree option.
- **Density:** Mira still sets a lower minimum height while fixed heights win.
  In the actual Pleat Create board at 1440px, Nova to Mira keeps Button at 36px,
  Input at 32px, Select trigger at 32px and the sampled Textarea at 100px. Their
  text changes from 14px to 13px. The Mira geometry test checks typography/table
  padding, not control-height changes. Declared compact control tokens remain
  disconnected from the controls.
- **Contrast:** the new ratchet tracks 500 failing pair/configuration entries.
  That count spans root and theme/base-color/mode combinations; it is not 500
  distinct palettes or UI nodes. Preventing new failures is useful, but the
  planned accessible palette fixes are still pending.
- **Overlay scope:** static dark subtree/Popover and Escape behavior pass.
  Owning-theme changes while open, multiple/nested scopes and full detached-root
  lifecycle coverage remain pending. Tailwind Date Picker still uses the ordinary
  body portal according to both the source structure and ledger.
- **Strict consumer delivery:** the shared form/settings/dashboard browser
  fixtures still use raw layout/text such as `h.section`, `h.div` and `h.p` and
  are not linted as strict installed consumers. They are valuable renderer tests,
  but do not fulfill the full controls/layout/text first-release gate.
- **Ownership/contracts:** init infers rendering from the text `HtmlBuilder`,
  directory/filename conventions and directly exported functions. It does not
  consume a complete canonical registry contract with verified public render
  kinds, finite choices, hashes and compatibility. Resolve this before treating
  the generated receipt as the planned authoring/ownership contract.
- **Rendered integration:** the earlier local `./rendered` SDK/LintApple work
  and review inputs were absent from the agent's branch. This PR introduces a
  separate `./audit` surface. Reconcile the local work and public API intentionally
  before a consumer release; the current branch cannot prove preservation of
  inputs it did not contain.
- **R3 CI:** the preset matrix captures screenshots as attachments, with no
  reviewed visual baselines. The full browser job is red; critical Firefox/WebKit
  steps were skipped after its site-suite failure. Their configuration exists,
  but this review does not claim those browser runs passed.

## Verification results

Isolated review worktree:
`C:/Users/lpottner/Documents/MaasProjects/creaseui-reliability-review`.
Dependencies installed from its lockfile. Tests used new preview ports
4273/4274/4275 to preserve the existing 4173/4174/4175 user previews.

| Check                                         | Result                                                                                                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three production builds                       | Pass: Tailwind, StyleX and Pleat                                                                                                                                                                                     |
| Lint package suite                            | 38 pass                                                                                                                                                                                                              |
| Theme roles, palette and slot tests           | 16 pass; palette pass includes the declared 500-entry baseline                                                                                                                                                       |
| New site regression suite                     | 168 pass: all three renderers, eight-preset matrix, geometry, scoped hover, alignment, overlays, RTL/reflow/motion/forced colors                                                                                     |
| Shared production comparison fixtures         | 8 pass: form/validation, settings/tabs/stats, geometry parity and static dark scope/Popover                                                                                                                          |
| Existing Popover sizing and client navigation | 12 pass; includes all nine sizing cases and three client-navigation/reload cases                                                                                                                                     |
| Six route/counterpart URL checks              | Fail in the isolated-port harness: tests require 4173-4175 links, while current `counterpartUrl` selects 5173-5175 for any other local port. Failure artifacts retained; this is not a demonstrated PR 28 regression |
| Full TypeScript                               | Pass with `node --max-old-space-size=8192 .../tsc.js --noEmit`; initial standard run exhausted its approximately 4 GB heap                                                                                           |
| Real Popover appearance-slot probe types      | Pass; the accepted appearance override is valid public API usage                                                                                                                                                     |
| Repository `npm run check`                    | Stops at two existing ECharts lint errors, lines 29/31. That file is unchanged against the Pleat base; remote quality annotations report the same errors                                                             |
| Packed consumer verification                  | Fails on Windows before packing: npm ENOENT                                                                                                                                                                          |
| Additional typed strict probes                | Reproduce F1/F2/F3/F7 despite the package suite passing                                                                                                                                                              |
| Additional browser audit probes               | Reproduce F4 with actual Chromium                                                                                                                                                                                    |
| Manual visual check                           | Actual Pleat Mira Create board captured/inspected, with no page errors; measured Nova/Mira control geometry as above                                                                                                 |

The isolated-port navigation failures cannot explain the remote browser CI
failure, which uses the standard ports. Retrieve that job's failed test details
or rerun the standard suite in an isolated environment with its expected origins.
Do not update source or assertions simply to conceal either failure.

## Evidence artifacts

The review checkout's ignored `output/playwright/` contains:

- `pr28-build.log`, `pr28-lint-package.log`, `pr28-theme-tests.log`.
- `pr28-sites.log`, `pr28-fixtures.log`, `pr28-existing-interactions.log`.
- `pr28-typecheck.log`, `pr28-typecheck-8gb.log` and `pr28-lint-consumers.log`.
- `pr28-strict-probe.mjs`, `pr28-strict-probe-results.json` and copied typed fixture.
- `pr28-appearance-slot.ts`, `pr28-appearance-probe-results.json`,
  `pr28-appearance-typecheck.log`.
- `pr28-audit-probe.mjs`, `pr28-audit-probe-results.json`.
- `pr28-create-mira.png` and retained browser traces/screenshots for failures.

## Followup assignment for the implementation agent

> Fix F1-F7 against PR 28 head `838295176eda1ba5f0ec0afd375d9aada1437469`
> in bounded slices, keeping the working styling and interaction changes.
> Turn every reproduction into a permanent positive/negative regression fixture.
> Start with typed builder/export/member resolution, complete appearance-slot
> contracts and correct audit completeness/exit behavior. Then fix value validation,
> Windows process invocation and receiver-aware DOM styling checks. Preserve
> strict controls/layout/text policy and precise implementation exceptions.
> Complete the remaining R1 theme/density/contrast/overlay work and real installed
> strict settings/dashboard consumers before claiming the first consumer release.
> Reconcile the earlier local rendered SDK and metadata work intentionally.
> Run the full source matrix, three-renderer regressions, real packed/registry
> consumer builds and required browser/CI gates. Preserve initial failures and
> explain baseline/tolerance changes. Keep legacy ECharts lint and remote browser
> failures visible until resolved. Do not replace missing proof with a verified
> ledger label, raise warning budgets, silently skip a renderer, merge or publish
> as part of this correction task.

The review added this report and ignored QA artifacts. It made no changes to PR
source, committed no changes and posted no GitHub messages. The PR review
worktree remains clean and the main checkout's unrelated work was preserved.

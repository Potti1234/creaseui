# PR 28 repair and release completion plan

Date: 2026-10-14. Status: implementation assignment, not completed work.
Reviewed PR: [#28](https://github.com/Potti1234/creaseui/pull/28).
Reviewed head: `838295176eda1ba5f0ec0afd375d9aada1437469`.
Pleat base: `772144cbaf3fb71b8cce194f83272bb78424aed8`.

Correct the seven reproducible defects in the
[PR 28 review](../reviews/pr-28-design-reliability-and-lint.md), preserve the
working renderer changes, then complete the outstanding reliability and consumer
delivery gates. A defect-fix slice can be finished independently; it must not be
reported as completion of the entire lint or design reliability release.

The [original handoff](reliability-and-lint-agent-handoff.md) and its linked plans
remain the product and architecture contracts. This document specifies the next
implementation order and acceptance criteria after the review.

## Policy already decided

- Strict application code uses Crease controls, layout and text immediately.
  A controls-only default does not satisfy the first release.
- Application customization uses named variants, validated registered themes and
  source-owned registered components/adapters. Ad hoc appearance escapes fail.
- Raw rendering grants identify exact registered files and exports. Necessary
  implementation rendering is allowed; applicable authoring checks remain active.
- Application feature functions may compose approved components without being
  registered themselves. Model, Message, init/update and normal business data stay
  legal. Returning Html alone does not make a feature an unapproved renderer.
- All three renderers preserve behavior and the same semantic design contract.
  Presets change declared visual roles, rather than arbitrary unrelated parts.
- Source lint installs and runs independently of browser tooling. Optional
  rendered auditing and real interaction tests provide separate evidence.

## R0 establish the correction baseline

Read every document in `docs/plan/`, the review, `PRODUCT.md`, architecture,
authoring, registry, compatibility, parity and roadmap references. Follow the
[agent protocol](07-agent-execution-protocol.md), including its bounded work-item
format, before making edits.

Work in a separate checkout/worktree and preserve unrelated work. Record the
actual starting SHA, dirty status, installed versions and generated inputs. If
the PR has advanced, compare the newer commits with the reviewed head and
reproduce each finding before deciding which still needs repair. Source line
numbers in the review describe the pinned head, not a moving branch.

The reviewed PR uses Foldkit and `@foldkit/ui` 0.164.0, Effect 4.0.0-rc.117 and
the Foldkit Vite plugin 0.25.0. The separate local checkout now has compatibility
metadata for Foldkit 0.165.x and plugin 0.26.x. Those are different inputs:
use the implementation checkout's coherent lockfile and installed sources.
Any compatibility migration requires its own evidence; do not mix dependency
metadata from the local research with the reviewed PR baseline.

The ZIP contains the earlier local lint/rendered research that was absent from
the agent branch. Compare its source, declarations, tests, dependencies and
documentation with the PR implementation. Record what is retained, adapted or
superseded. Treat it as a reference snapshot, rather than a directory to copy over
the PR. Preserve useful APIs or document and test any intentional migration.

Write a short correction brief and acceptance checklist. Start a ledger row for
each finding and remaining contract, using the repository's existing status
vocabulary. Attach evidence to the actual implementation commit.

## Slice 1 repair shared resolution and DOM provenance

Scope: the lint package's shared strict resolver, component-call analysis,
headless export lookup and receiver-aware styling analysis, with typed fixtures.
This covers F1, F2 and F7. It introduces no Foldkit runtime state changes.
Keep public configuration compatible unless a validated migration is necessary.

### F1 imported HtmlBuilder type aliases

Use the TypeScript checker for explicit annotations as well as inferred
parameters. Resolve imported aliases and re-export chains to the actual Foldkit
declaration. Cache analysis within the consumer project. Displayed type names,
the text `HtmlBuilder` and directory names do not prove identity.

Required regression pairs:

- Raw controls/layout/text fail with a direct builder type, a renamed type
  import, a local re-export, a multi-hop barrel and supported inferred parameters.
- Supported immutable builder aliases/destructuring retain the same policy.
- An unrelated type named HtmlBuilder and a shadowed binding do not acquire
  Foldkit rules merely because of their spelling.
- Missing required type information gives an actionable strict setup error.
- Registered renderer files retain their exact raw-rendering allowance and
  continue receiving applicable authoring checks.

The archived `raw-imported-type-alias` probe currently yields no diagnostic. It
must produce the same raw-control violation as `raw-direct` after the fix.

### F2 computed access and headless barrels

Resolve constant computed properties, namespace/local aliases, named exports and
re-export origins through the same resolver. Handle cycles without hanging.
Unsupported dynamic contracted UI access must yield a precise unverifiable UI
diagnostic instead of disappearing from analysis.

Required regression pairs:

- `Design.button` and `Design['button']` enforce identical appearance/props
  contracts, including asserted or opaque props.
- Direct `Dialog.view`, constant computed `Dialog['view']` and a local barrel
  re-export of Dialog all reject application headless rendering.
- Multi-hop barrels, supported destructuring and implementation-only exports
  cannot change the enforcement result.
- Message/types/init/update imports and ordinary domain records remain legal.
- Feature callbacks composing approved components remain legal; rendering inside
  lazy/keyed/Submodel callbacks is still checked.

Inventory native/headless rendering exports from the installed Foldkit sources.
Do not solve the problem with a blanket `@foldkit/ui` import ban.

### F7 business fields versus actual DOM styling

Determine the receiver's binding/type provenance before classifying a property
assignment as DOM appearance. Preserve detection for real HTMLElement style,
className and classList mutations and supported known DOM aliases.

The archived business record normalizer must pass. Pair it with failing actual
DOM mutations. Add business objects with `style`, `className` and similarly named
methods, plus genuine DOM receivers in model/update utility files. Excluding
entire utility folders is not a fix.

Acceptance: all original probes have the expected outcomes, the expanded typed
positive/negative matrix passes and resolver performance remains bounded. Keep
diagnostic locations and remediation specific to the offending UI operation.

## Slice 2 complete component contracts and ownership

Scope: F3, canonical contract generation, registry/receipt integration and strict
contract fixtures. Read the [source brief](consumer-ui-lint-implementation-brief.md)
and [L1/L2 delivery plan](consumer-ui-lint-delivery-plan.md).

Inventory actual public render exports and props across Tailwind, StyleX and
Pleat. Generate a versioned contract identifying finite variants, content,
appearance fields, placement fields and implementation-only exports. Include
part-specific props such as Popover's `triggerClass`, rather than relying on a
short global forbidden-property list.

For every retained placement field, define and enforce its complete allowed
domain. A name suggesting layout does not justify allowing arbitrary CSS.
Unknown or ambiguous contracted appearance cannot silently pass. Ordinary
component Models and domain content are not wholesale styling data.

Resolve object spreads, known branch choices and overwrite order for contracted
fields. Handle typed opaque objects and assertions with an actionable unresolved
outcome when their relevant UI contract cannot be proven. Add regressions for
direct literals, aliases, spreads and part-specific overrides. The real Popover
probe must still typecheck but fail strict lint for the appearance override;
approved content/variants/placement must pass.

Replace init's text/filename heuristics with canonical installer metadata for
exact consumer destinations, file roles, render exports, contracts, source
hashes and renderer/policy/schema compatibility. Explicit manual registration
uses the same validated schema. Normalize Windows separators/case and actual
symlink targets; reject traversal, ambiguity and incompatible declarations.
Modified installed sources remain owned and checked while upgrade metadata
records the changes.

Test that a raw-render grant covers only its declared implementation. It must
not disable renderer/token rules, authorize a neighboring application file,
automatically trust a theme file or approve implementation-only public exports.

Acceptance: real registered APIs have complete contracts; a permissive prop
cannot become approved through registration; installer receipts and doctor
report uncovered or incompatible UI explicitly. All supported representation
forms enforce equivalent policy without flagging unrelated business objects.

## Slice 3 make audit completeness truthful

Scope: F4, audit normalization/coverage/reporting/CLI tests and rendered API
reconciliation. Read the [A1/A2 plan](rendered-ui-audit-delivery-plan.md).

Validate nonempty required cases and matrix axes, supported values and actual
state execution. Every configured combination has a recorded outcome. Define
completeness before calculating a pass or findings result:

| Outcome                                                                             | Required exit behavior                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Complete execution with no blocking findings                                        | 0                                                        |
| Complete execution with blocking findings                                           | 1, subject to the documented report-only findings policy |
| Missing required execution/measurement, unresolved or unsupported required coverage | 2, including report-only mode                            |
| Invalid or empty required configuration                                             | Configuration failure; it cannot return 0                |

Incomplete coverage takes precedence when a report also contains findings.
Explicit exclusions need validated scope, reason and a recorded coverage entry.
Record excluded coverage separately from a passing measurement. Support for a
previously unresolved feature may pass only when its measurement is proven.

Test the archived gradient, iframe and empty-axis cases, then unavailable states,
navigation/readiness timeouts, unsupported required shadow/frame content, mixed
findings/incomplete coverage and report-only. Clean fixtures must genuinely
complete, while broken fixtures produce findings. State callbacks need actual
transition/result assertions; a label or callback invocation is not proof.

Reconcile `./rendered` and `./audit` deliberately. Compare the local minimal
host-page interface, `auditUI`/`assertUI`/`expectUI`, policy/report types and
LintApple adapter with the new runner. Retain useful behavior and provenance;
document tested engine/host versions and migrations. Keep optional browser
dependencies out of source-only imports and installation.

Acceptance: package/SDK/CLI agree on coverage and outcomes, incomplete runs cannot
pass, and source lint works in a clean consumer without browser tooling.

## Slice 4 validate theme values and complete R1

Scope: F5 and the semantic schema, three renderer adapters, scoped resolution,
palette validation and theme tests. The
[theme plan](theme-contract-and-scoping-plan.md) owns the full contract.

Validate values against declared kinds and supported grammar, including empty
and non-string input, malformed functions, wrong kinds, aliases, alias cycles
and unresolved dependencies. Partial patches may omit roles but cannot make
invalid supplied values valid. Define how aliases resolve against the inherited
complete theme. Unsupported expressions need an explicit validation/unresolved
outcome. The two `definitely-not-a-*` review inputs must be rejected.

Complete resolved roles for palette/state, geometry/density, typography, status,
surfaces and motion. Status roles must be independently themeable from chart
colors. Implement deterministic patch precedence and exhaustive bindings in
all three adapters. Reuse that contract in root scopes, nested scopes, Create,
docs and installed consumers.

Test nested light and dark scopes, registered partial patches, secondary as well
as primary derived states, and theme changes while overlays are open. Detached
roots follow the owning scope through updates and disposal. Cover multiple
independent scopes, focus/dismissal lifecycle and Tailwind Date Picker's portal
with actual behavior checks. Avoid adding duplicate interaction state merely to
propagate styling.

Acceptance: invalid themes fail clearly; complete adapters cannot omit a role;
live owning-theme/overlay tests pass; standalone installed consumers receive the
required CSS. An inherited root-derived state color is not scope correctness.

## Slice 5 finish R2 preset and composition coverage

Use the [component/preset plan](component-preset-coverage-plan.md) to inventory
the full catalog, eight presets and finite component choices. Every applicable
slot consumes a semantic role or has an explicit justified exception.

Connect density roles to actual Button, Input, Select, Textarea and other
applicable geometry. A lower min-height under an unchanged fixed height is not
a density change. Record Nova metrics and assert declared Mira differences for
each named size without erasing intentional role-specific differences. Measure
actual heights in every renderer, alongside typography and group relationships.

Repair the accessible palette/state combinations. The reviewed contrast ratchet
allows 500 failing pair/configuration entries; that is an inventory to resolve,
not a completed accessibility gate. Preserve initial failures and reduce them
with documented palette changes. Do not raise the budget or accept unexplained
failures to make the suite green.

Provide ordinary strict replacements for all controls, layout and text in each
renderer. Convert form/settings/dashboard acceptance recipes to compose these
APIs, then lint them as strict application source. Existing raw-layout browser
fixtures may remain as renderer tests, but cannot be the strict consumer proof.

Keep docs examples, Show code formatting and the full runnable Foldkit program
at parity across renderers. Produce examples and registry metadata through the
appropriate shared generators. A single component call is insufficient.

Acceptance: coverage has no unexplained gaps, density affects real geometry,
required contrast checks pass and strict recipes lint, compile, build and run.

## Slice 6 portable packed and registry consumers

Scope: F6 and L2 package/CLI/install verification. Use a launcher supported by
Windows and Linux, or resolve package-manager CLI entry points and invoke them
with `process.execPath`. Cover pack/install and manager availability detection;
avoid shell string construction. Assert exit status and retain diagnostics.

Run actual npm and pnpm consumers on Windows and Linux. If a manager is missing,
report missing coverage explicitly; an npm fallback is not a pnpm pass. Exercise
different aliases/directories, TypeScript and supported typed JavaScript, and
package imports/CLI/types outside the monorepo.

Keep small synthetic rule fixtures for focused package tests, and add real
registry-installed components and strict settings/dashboard consumers for all
three renderers. Build their production CSS, launch them and exercise keyboard,
focus, validation and overlay behavior. Test modified owned files, init/doctor
idempotence, incompatible receipts and unsupported setup failures.

Acceptance: the packed source package works without optional browser tooling;
real installed recipes pass lint/types/build/runtime checks; broken strict
consumers fail; both operating systems and both managers have actual evidence.

## R3 verification and CI throughout the slices

Follow the [regression plan](renderer-regression-and-ci-plan.md). Each correction
lands with a permanent regression, rather than postponing verification until
the final slice. Run focused checks during iteration and the full supported
gates once the corresponding delivery is complete.

Keep shared fixtures using actual public components, with comparisons across
renderers/presets and applicable states, RTL, reduced motion, responsive sizes
and forced colors. Computed geometry, real interactions and reviewed visual
baselines prove different things. Screenshot attachments alone are not visual
regression protection. Review baseline changes and explain tolerances.

The review's production builds, 38 lint tests, 16 theme/slot tests, 168 site tests
and eight shared-fixture cases passed at the pinned head. These historical
counts are not future coverage targets or proof that the new corrections pass.
Run the current discovered suites and record actual counts and skips.

Two issues require separate investigation before calling full CI green:

- `npm run check` stops at two pre-existing ECharts import lint errors, unchanged
  against the Pleat base. Resolve or separately track them visibly; do not report
  a stopped command as a passed full check.
- Remote browser CI failed in the standard-origin site suite, leaving critical
  Firefox/WebKit steps skipped. Retrieve its failure artifacts or rerun with the
  expected origins. The local review used isolated ports 4273-4275; six existing
  route/counterpart checks failed because they expect 4173-4175 and the app picks
  5173-5175 for other local ports. Those local failures do not explain remote CI.

Use available expected ports in an isolated environment for those checks, or
make an intentional, tested origin/configuration change. Preserve other user
preview servers. Do not edit assertions simply to hide either failure. Full
typecheck needed an 8 GB Node heap in this review; record the execution resource
requirement and test the chosen CI configuration.

## Completion and reporting

For each slice provide the reproduced before/after behavior, changed exports and
migration impact, focused regression results, real rendered evidence where
applicable, generated-contract diffs and remaining gaps. Link ledger entries to
files and actual implementation commits, not claims in a PR description.

The correction PR can claim F1-F7 fixed when all seven acceptance checks and their
positive counterparts pass. The first strict consumer release additionally
requires complete ordinary replacements, trustworthy metadata/contracts and
real packed/registry settings/dashboard proof in all three renderers. Theme and
preset deliveries require their R1/R2/R3 gates. The optional audit delivery needs
truthful coverage and portable SDK/CLI proof; it need not delay an independently
complete source-only release.

Keep unfinished contracts explicitly planned or in progress. Do not mark them
verified from file creation, synthetic fixtures, skipped browser steps or a
contrast baseline. Preserve the working PR changes and unrelated user work.
This assignment authorizes implementation and verification; commit, merge and
publication remain subject to the authorization given in the implementation
agent's own session.

# Installable Crease UI lint and composition plan

Date: 2026-10-13. Status: implementation plan; milestones below are not complete.

For the combined styling and lint assignment, begin with the
[agent handoff](reliability-and-lint-agent-handoff.md). The
[source delivery plan](consumer-ui-lint-delivery-plan.md) and
[rendered delivery plan](rendered-ui-audit-delivery-plan.md) supply bounded
implementation slices and release proof alongside the detailed
[source implementation brief](consumer-ui-lint-implementation-brief.md).

## Objective

Ship `@creaseui/lint` as an optional, installable quality add-on for Crease UI
consumers. Its starting policy should prevent common generated-UI mistakes and
require application code to use approved Crease controls, layout and text from
the first release. The user selected this full composition requirement on
2026-10-13. `strict` is the default consumer preset; a controls-only release does
not satisfy this decision. Close application styling escape hatches as part of
that boundary.

Raw Foldkit elements and `@foldkit/ui` render primitives remain available inside
designated component implementation files. This exception relaxes only the raw
rendering restriction: implementation files still obey their styling, token,
motion, behavior and accessibility contracts.

The intended workflow is: select an approved page recipe, compose Crease
components with finite variants, run source lint, then audit the actual page in
its required viewport, theme and interactive states. Rules prevent measurable
mistakes; product judgment remains necessary for hierarchy and content.

## Existing foundation and gaps

The current local `packages/lint` package provides Tailwind, StyleX and Pleat
ESLint helpers, component appearance/layout contracts, and optional rendered
checks at `@creaseui/lint/rendered`. Pleat supports configurable literal property
limits. LintApple is an optional pinned tooling dependency of rendered checks.

The current `prefer-composition-primitives` rule recognizes a limited set of
calls on an identifier named `h`; it is not a general consumer boundary rule.
Existing import defaults reflect this repository's `@/ui`, `@/stylex` and
`@/pleat` paths. The browser runner is a repository script and initializes this
repository's theme storage. Neither is sufficient for arbitrary installations.

Tailwind and StyleX already have typed composition primitives and page recipes.
Tailwind reuses several StyleX prop types, but renderer behavior still needs an
explicit parity audit: some choices are missing or differ in meaning. Pleat must
join the same public contracts before full composition enforcement ships. The
independent full Pleat port in PR #27 was reviewed through commit
`69359503e35cb5925426add76aee4aba30d9609a`. Reconcile that revised implementation
with the experimental Pleat contracts in this checkout before implementation.

The [fourth review](../reviews/pleat-pr-27-round-four.md) records fixes to the
earlier rendering, layout-boundary, emitted-program and registry defects. The
[design consistency review](../reviews/pleat-pr-27-design-consistency.md) identifies
remaining shared weaknesses: incomplete preset coverage, scoped hover colors,
unused control-size roles and palette contrast. Preserve completed fixes and
reproduce remaining findings against the current baseline. Release gates must
check styling boundaries, consumer installation, emitted programs, actual CSS
delivery and component states independently.

The existing rendered research and baseline are in
[`../rendered-ui-lint.md`](../rendered-ui-lint.md). The documentation catalog has
known findings and intentional variations; it is not the first zero-finding gate.

## Ownership and enforcement boundaries

| Scope                                        | Raw rendering                                            | Other checks                                                                            |
| -------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Application pages/features                   | Crease controls, layout and text only                    | Component ownership, semantic values, static styling, accessibility and rendered policy |
| Registered component implementations         | Allowed for implementing the component's public contract | Styling/token/motion checks stay enabled; behavior and accessibility tests required     |
| Explicit integration/icon/rendering adapters | Allowed only in the registered adapter files             | Narrow property/binding contracts, lifecycle and applicable accessibility checks        |
| Framework setup, messages and models         | Types and non-rendering framework utilities allowed      | Existing Foldkit/TypeScript architecture rules                                          |

Implementation ownership must come from installed registry metadata and explicit
configuration. Do not exempt all of `src/components`, all local wrappers, or all
files importing Crease. A consumer can register a source-owned extension, but
registration must name its implementation files, exports and applicable policy.

Installed metadata is an ownership/configuration input, not a blanket assertion
that a file is correct. Modified component implementations remain linted and
tested. Paths must resolve within the configured project and honor the project's
aliases; do not depend on this repository's directory layout or ports.

## Consumer product and proposed configuration

Preserve the existing renderer helpers. Add a higher-level consumer configuration
factory returning ESLint flat-config entries for application and implementation
scopes. Its configuration should describe:

- renderer and preset (`strict` by default, or explicit migration policy);
- application file globs and generated/vendor exclusions;
- installed component manifest or explicit implementation files;
- approved component import paths and project alias resolution;
- reviewed adapter files and custom component registrations;
- versioned semantic policy and documented exceptions.

The companion [implementation brief](consumer-ui-lint-implementation-brief.md)
specifies the proposed API, ownership records, rule behavior, work items and
release gates. Do not document these new APIs as already available.

`strict` rejects raw controls, raw layout/text construction, appearance overrides
and direct application styling beyond approved parent-layout contracts.
`migration` applies the same rules at warning level in explicitly selected legacy
files, without weakening new-file error-level scopes. Keep existing lower-level
renderer helpers compatible, but do not present them as the new complete consumer
preset. Required replacements for all three renderers are part of the first
consumer release gate, rather than a later opt-in phase.

Ship a setup command that reads installed paths/configuration, adds the chosen
preset to existing ESLint configuration, and presents a reviewable change. Never
replace the whole configuration or silently exempt broad application directories.
Keep the browser integration optional so source lint does not require Chromium.

## Milestone 1: installable package and full rendering boundary

Implement shared binding-aware rules for raw control, layout and text rendering
in application code. Include button, input, textarea, select/option, links, forms,
semantic containers, lists and typography, plus corresponding headless render
primitives. Ban other native rendering in application scopes; specialized output
uses a registered component or adapter. Preserve framework type imports and
non-rendering utilities; prefer exporting state helpers through Crease where
practical. Missing ordinary replacements are implementation work, not reasons
to weaken the default preset.

Add a companion check for hand-built interactive controls on structural elements,
including interactive roles and pointer/keyboard behavior used to recreate a
button or widget. Supply approved semantic link/form replacements alongside
their bans. Specialized canvas/SVG/third-party rendering uses
registered adapters rather than a global exception.

Do not rely on the text `h` or on a component's local variable name. Track imports,
namespace and named aliases, annotated HtmlBuilder parameters, destructuring,
local aliases and computed constant members. Respect lexical shadowing. Reject
unverifiable dynamic builder access in strict scopes. Add TypeScript-backed,
cached resolution for imported re-exports where syntax alone is insufficient.
State precisely which data flows a rule proves; do not claim complete whole-program
analysis when it only recognizes local syntax.

Every diagnostic should name the forbidden primitive, the installed Crease
replacement and the implementation-file exception. Provide suggestions when
useful; do not automatically rewrite a stateful widget or invent required props.
Errors recommending a missing/uninstalled replacement should explain installation
or the supported adapter path.

Acceptance:

- application `h.button(...)` and a direct headless button render fail;
- approved Crease Button rendering succeeds;
- the same raw call in a registered Button implementation succeeds while raw
  color/token violations there still fail;
- alias, destructuring, re-export and shadowing cases have positive and negative
  fixtures, and unknown strict-mode access does not silently bypass the rule;
- ordinary Foldkit messages, Html/HtmlBuilder types and state updates remain valid;
- packed-package consumer fixtures work outside this repository with different
  directories, aliases and existing ESLint setups.

## Milestone 2: composition and public API parity

Establish shared semantic contracts for Box, Stack, Inline, Grid, Text, Section,
ActionGroup and the first page recipes. Reconcile the existing Tailwind/StyleX
vocabulary and implement it in Pleat, preserving semantic HTML, accessible structure,
responsive behavior and identical finite choices.

Use named spacing, density, typography, width, surface and alignment choices.
Allow parent placement through a constrained layout contract. Avoid arbitrary
class/style props that reopen the same escape hatch the preset is supposed to
close. Business values and interaction state follow existing Foldkit ownership
rules; renderer adapters should not duplicate state-machine behavior.

Start recipes with a settings form and a dashboard/data-list page. Cover ordinary
text, links, lists and forms so strict application code does not need raw elements
for normal content. Fill gaps in core control coverage, especially in Pleat,
as a prerequisite for the first strict consumer release.

Acceptance:

- identical recipe programs compile against all supported renderers;
- all finite choices have matching meanings and responsive behavior;
- strict application fixtures contain no raw control/layout/text rendering;
- named variants and semantic elements remain customizable without appearance
  override props;
- installed standalone previews include everything needed by a consumer rather
  than depending on the docs reset or site shell.

## Milestone 3: component-owned rendered contracts

Emit versioned audit metadata from components/composition where they own the
relationship. Reuse the engine's `data-ui-*` attributes where their semantics fit,
and add Crease contract identifiers when richer expectations are necessary.

| Owner                        | Contract                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------- |
| ActionGroup                  | Normal or joined spacing, density and control target expectations               |
| Stack/Inline/Grid            | Approved spacing; opt-in child alignment rather than arbitrary global alignment |
| Numeric display/table column | Tabular digits and intended numeric alignment                                   |
| Concentric surface component | Outer/inner radius relationship and uniform inset                               |
| Overlay/content region       | Viewport containment, local scrolling and overflow ownership                    |

Normal action gaps, shared-border segments and dense chips must have different
contracts. Do not add global suppression selectors to make those cases pass.
Data attributes are generated by the component, not a manual burden on the agent.
Include stable component/region identifiers in reports so diagnostics point to
source-owned regions rather than only fragile nth-child paths.

Acceptance:

- all renderers emit equivalent semantic contracts;
- normal, joined and dense fixtures pass their own expectations;
- intentional contract violations fail with measured values and specific fixes;
- missing/malformed required metadata is reported rather than producing a false
  impression that the relationship was checked;
- existing valid layouts without an opted-in relationship are not subjected to
  invented alignment or concentric-radius assumptions.

## Milestone 4: portable browser CLI and clean preview gates

Move the reusable browser runner into the installable tooling. Consumer
configuration supplies URL(s), readiness conditions, viewports, themes and named
states. Theme application is configurable for class/data-attribute toggles,
storage initialization or an existing browser setup function; never assume
`creaseui-theme` or fixed local ports in a generic consumer runner.

Keep runtime source assertions available through `@creaseui/lint/rendered` for
existing Playwright tests. Keep page interfaces compatible with the host's
supported Playwright versions, independent of unrelated methods added by the
optional engine. Pin and document the engine baseline and preserve its license
and provenance when distributing dependencies.

Create isolated fixtures for Button, form controls, Combobox and an overlay,
then settings and dashboard blocks. Declare applicable initial, focused, open,
invalid, loading, disabled, empty and long-content states. Include narrow and
desktop widths, light/dark themes, RTL where relevant and reduced motion.
Interaction assertions must verify keyboard behavior, focus containment/return,
Escape and state updates; a post-action screenshot/audit alone is insufficient.

Maintain deliberately broken fixtures for each enforced measurement. Audit
coverage must distinguish checked, unresolved, unsupported and unvisited areas.
Main-document checks do not imply that shadow roots, iframes or hidden interactive
states were traversed. Do not silently pass an unavailable page, timeout or
unresolved contrast measurement. Report exclusions with scoped reasons.

Acceptance:

- clean fixtures yield zero unreviewed findings across their declared matrix;
- each broken fixture produces its expected rule and corrective guidance;
- exit codes distinguish success, findings and incomplete execution;
- reports include engine/policy versions, URL, state, viewport/theme, measurements,
  reviewed exceptions and coverage limitations;
- consumer CI examples operate on their own running application;
- docs/catalog findings remain a separate baseline until their intentional
  variants and shell policy are explicitly classified.

## Milestone 5: shared semantic styling and common generated-UI patterns

Create a renderer-independent policy for typography roles, spacing, density,
surfaces, radii, shadows, layers and motion. Renderer presets map that policy to
their native syntax rather than implementing three unrelated value lists.
Public variants and theme values are customizable within the selected contract.

| Pattern                                         | Preferred enforcement                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| Unstyled or hand-built controls                 | Application rendering boundary plus reviewed Crease implementations      |
| Random sizing/spacing/radii/shadows             | Finite variants, semantic tokens and property limits                     |
| Appearance overrides of approved components     | Component-owned appearance and parent-layout-only overrides              |
| Every region becoming a decorated card          | Named surface levels and page recipes; optional contextual guidance      |
| Unbounded transitions or inconsistent motion    | Explicit property lists and shared motion choices; reduced-motion checks |
| Low-contrast, clipped or offscreen UI           | Actual rendered measurements in declared states                          |
| Weak form labeling and keyboard behavior        | Source contracts where provable plus browser interaction checks          |
| Unstable live totals or unclear numeric columns | Explicit numeric display contracts                                       |

Error-level defaults should address clear violations. Product-specific copy
opinions, decoration density, gradients and visual hierarchy should remain
contextual guidance or optional policies. Do not turn one visual taste into a
universal rule, require one global gap everywhere, or prohibit approved brand
themes merely because their colors differ from the default.

Audit Crease's own defaults before applying stricter policy to consumers, including
transition properties, target areas, fonts and semantic tokens. Lint-clean syntax
alone does not establish accessible or attractive output.

## Exceptions, migration and diagnostics

Prefer a named variant, semantic theme choice or registered extension over a
suppression. Source exceptions name the rule and reason. Rendered exceptions
name a stable selector/contract, rule and reason; reports preserve them. Avoid
broad directory/element exclusions and keep exception ownership reviewable.

Document rule IDs, severity, prerequisites, valid/invalid examples, limitations
and replacement guidance. Include documentation URLs in ESLint rule metadata.
Use normal CLI output for concise diagnostics and JSON for complete agent/CI
reports. Policy versions and severity changes need explicit release notes.

Do not raise existing warning caps to make adoption green. Migrate known findings
by category and component owner, then lower the baseline. New constrained files
should have zero unreviewed violations from their introduction.

## Distribution and release gates

Build and install the packed package into fresh consumer fixtures, not just this
monorepo. Verify at least one project per renderer, custom aliases/directories,
existing flat config, npm and another package manager, optional browser tooling,
and compatible host Playwright versions. Verify type declarations and public
exports alongside runtime behavior.

Source-only consumers must not download/start a browser or load rendered tooling.
The browser add-on documents its Node/browser requirements. Registry install
metadata must identify component implementation ownership and public exports
without leaking repository-only source paths. Test customization and upgrades of
source-owned components as well as initial installation.

Publish only after package/type/consumer tests, relevant component behavior tests,
clean preview gates and release documentation pass. Package policy and component
contracts must have a documented compatibility story. Publishing is a separate
explicit release step; completing this plan document does not authorize a release.

## Suggested implementation sequence and deliverables

Within the combined workstream, use the R0/R1/R2/R3 and L1/L2/A1/A2 dependency
order in the agent handoff. The following describes the lint delivery sequence;
it does not defer regression tests until all styling work is complete.

1. Shared ownership metadata, consumer configuration, full rendering-boundary
   rules and packed consumer fixtures. Deliver the source-lint implementation;
   keep the full strict scope from the start.
2. Core composition/control parity and shared semantic contract definitions.
   Deliver a usable strict preset for all three renderers. Steps 1 and 2 together
   are the first consumer source-lint release gate.
3. Automatic rendered metadata, portable CLI and isolated preview fixtures.
   Deliver measured, reproducible quality checks and consumer CI integration.
4. Broader styling/interaction policies, classified docs cleanup and warning
   ratchets. Deliver stronger defaults backed by real pass/fail evidence.

Track each rule/contract with its owner, implementation status, affected scopes,
positive/negative fixtures, compatibility requirements and documentation. Do not
mark a milestone complete based on breadth, compilation alone, or a handful of
screenshots. Preserve any unresolved findings and coverage limitations in the
handoff.

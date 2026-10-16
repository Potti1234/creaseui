# PR 28 repairs and experiment enforcement handoff

2026-10-16. Implementation assignment for the existing enforcement agent.

Start from the current PR 28 work, preserving its useful repairs. The reviewed
head is a9b270a3b0bab2683c8263c680527c56ee1b845b. If the branch advanced, inspect
the intervening changes and reproduce the cases before editing. Do not reset
the dirty local main workspace or use it as an implementation baseline.

Read this handoff, the [current review](../reviews/pr-28-oct16-review.md), and the
specific source/contracts needed by the current work item. The earlier complete
plans remain reference material; preparing a large new product plan is not a
prerequisite for fixing these defects.

The objective is an installable system that an agent can use in an ordinary new
Foldkit project: find actual Crease components, install and compose them, customize
their owned source when appropriate, and receive failures for appearance/reuse
bypasses. Closed props alone do not establish that boundary.

## Inputs and preserved counterexample

- PR 28 review: a9b270a3b0bab2683c8263c680527c56ee1b845b, Foldkit/UI 0.164.0,
  Effect 4.0.0-rc.117, plugin 0.25.0. Use the coherent lockfile.
- Archived tutorial: creaseui-demo branch archive/tutorial-attempt-01, commit
  f723c380ca66da05acca50727b0f210949840342. Preserve it as failed architecture,
  not an accepted starter. Its foundation is the earlier 244b4c79 commit.
- [Architecture experiment](tutorial-architecture-enforcement-plan.md): global
  component CSS, rebuilt Sidebar, unchecked authoring, broad raw grants and
  instructions that allowed the wrong architecture.
- [Registry discovery research](shadcn-registry-and-foldkit-discovery-plan.md):
  working registry search but misleading project info; missing item metadata;
  CLI/MCP information loss; supported schema/API extension points.
- [Recorded metadata probes](../research/shadcn-registry-2026-10-16/README.md).

The tutorial mistakes are additional requirements exposed by a real consumer.
They are not all regressions introduced by the latest PR commits.

Do not repair the archived attempt in place. Use it as a negative fixture and
create any corrected positive consumer in a separate test project or repair
branch. General enforcement work belongs in Crease; updating the tutorial itself
remains a separate application task.

## Reuse existing checks before adding rules

Direct raw feature rendering and ad hoc component appearance already have rules.
The current doctor also checks for a missing component-contract rule on registered
raw sources and missing typed parser configuration. Our tutorial ran only its
feature lint command, so those doctor checks were not a required gate. Wire the
existing checks into the normal quality path and extend their incomplete export,
renderer and CSS coverage. Do not describe every experiment failure as a wholly
missing rule.

Registry search, source installation and a component catalog also already exist.
Use them. The missing work is accurate Foldkit context, information delivery,
enforcement coverage and reliable execution of that workflow.

## R1 Preserve origins through equivalent export forms

Repair review F1 in the shared resolver. Follow imported namespace bindings when
they are subsequently exported locally, including renames and multi-hop barrels.
Use the same origin representation for styled components and headless rendering.
Do not add a spelling-only exception for Button.

Required pairs:

- Direct import, export-star-as, namespace import then named export, renamed
  export and namespace-consumer forms enforce the same Button contract.
- Identical ad hoc appearance fails in every form; supported named variants pass.
- Supported destructuring and constant member access keep identity.
- Unrelated objects, type exports and non-rendering helpers remain legal.
- Cycles terminate and unsupported contracted access is explicitly unresolved.

Run the review's valid-TypeScript probes and add permanent typed resolver fixtures.

## R2 Establish public export completeness independently

Repair F2 by replacing incomplete initializer-based inference with canonical
installer/export contracts and an independent source/type reconciliation.
The current local factory fix is useful, but both init and doctor using the same
exportedFunctions heuristic conceal missing aliases.

At minimum, cover direct functions, local factories, public aliases, supported
imported factories and named/star/namespace re-exports. Give each supported render
export its actual contract identity. State render kinds explicitly, preserving
non-rendering utilities and types.

Doctor must compare the public rendering surface against the installed manifest,
validate effective enforcement, and fail or report incomplete on uncovered
supported exports. Testing every export already in the manifest is insufficient.
Generate finite choices and source provenance from authoritative inputs; do not
maintain a second hand-written API list to satisfy the coverage test.

The real Button public actionAlias reproduction must either inherit the Button
contract or produce an explicit coverage failure. It must never get an appearance
pass alongside doctor's 0 uncovered UI modules.

Preserve local source customization. A changed source hash records a local
adaptation for upgrades; it does not remove ownership or prove correctness.

## R3 Protect the component geometry actually selected

Repair F3 with component/variant-aware geometry. An icon button owns inline and
block dimensions and its square shape. A normal text button can legitimately fill
its parent where its contract allows that choice.

Check width/inlineSize, min/max dimensions and the relevant Tailwind utilities,
StyleX/Pleat placement constructors and finite conditional variants. Reject
unsupported cases explicitly rather than treating width as universally safe.

Required evidence:

- The real icon button plus w-3 fails lint and cannot silently render 12x36.
- h-3 and size-3 remain rejected.
- Approved named icon sizes render square in each renderer.
- Contracted text-control fill and parent placement remain usable.
- Dynamic finite size choices are checked for every possible applicable branch.

Do not replace named component sizing with a new collection of arbitrary feature
dimensions. Do not ban all widths on every component.

## R4 Make Item grouping express item and separator semantics

Repair F4 across renderers. Opaque Html children do not justify wrapping every
child as a semantic list item. Provide explicit item-versus-separator composition
or another supported structural API, with migration for existing examples.
Do not inspect/clone private VNode structure to infer what a child means.

Verify two entries plus a separator expose exactly two list items. Separators
must remain decorative. Preserve standalone plain/article/link semantics and
grouped ordinary, linked and mixed items. Cover actual accessibility structure,
Tab/Enter, focus treatment and geometry in all three renderers.

## E1 Keep implementation authoring checked

Apply the existing strict policy to the archived tutorial as a negative consumer.
Classify source instead of globally ignoring component implementations.

- Pure product compositions can combine approved components without raw grants.
- Genuine low-level implementations receive only necessary native/primitive
  responsibilities. A small SVG helper cannot authorize unrelated raw controls
  throughout its file.
- Keep supported renderer syntax, semantic tokens, finite variants, owned
  geometry and component contracts checked inside registered implementations.
- Setup, behavior, theme and adapter roles receive their applicable checks.
  Registration does not mean that all restrictions disappear.
- Detect missing effective configuration, disabled applicable rules, ignored
  files and unsupported export coverage. Report feature-only coverage as such.

Do not infer permission merely from a folder name, HtmlBuilder text or a
component-looking filename. Extend the canonical ownership/contract schema,
with a migration when necessary, rather than creating a parallel trust mechanism.

## E2 Check authored CSS and registry-supplied style content

Add a CSS-aware check with actual parsing and import resolution. The theme entry
can contain framework/font imports, semantic definitions/bindings and narrowly
defined base/reset declarations. It cannot contain product/component overrides.

Check component selectors, slots/roles, pseudo states and descendant selectors,
including nesting, media/layer wrappers, local imports and scoped-CSS global
escapes. Validate theme/base properties too; the label @layer base does not make
arbitrary component styling acceptable.

Ordinary Tailwind appearance belongs in its owning TypeScript component's style
map. Rare component CSS needs an exact owner and scoped selectors. Audit registry
css/cssVars and installed style imports through the same policy so installation
cannot bypass the authored-source gate. Preserve valid framework output, vendor
inputs and component-owned runtime geometry through precise declarations.

Do not set a stylesheet line limit as the policy. Reject an invalid short global
override and permit a valid complex owned component.

## E3 Prevent fake component reuse without pretending to infer all design intent

The ordinary agent workflow must inspect suitable existing components before
reimplementing them. Make this easy through discovery and complete examples.
Users do not need to prepare a screen-to-component inventory themselves.

Where a product component declares foundation dependencies, verify resolved
rendering calls or a legitimate in-place adaptation of installed source. An unused
Sidebar import or a self-declared 'based on Sidebar' string is insufficient.

Feature code cannot approve its own raw wrapper by granting rawRendering or
changing the lint scope. System changes remain normal supported work, with the
appropriate source/contract checks. Preserve legitimate new domain patterns such
as an issue row or status glyph.

Static analysis cannot recognize every semantic reinvention. Define supported
proof paths, keep unresolved cases visible and retain source/behavior review.

## E4 Validate changes to enforcement independently

Treat changes to ownership, exceptions, check scripts and policy configuration
according to the existing task scope. A feature task must not pass by changing
those inputs. Provide a diff check that can run against a trusted baseline outside
the untrusted patch, or validate enforcement changes independently.

Document the distinction between lint, agent instructions, runner filesystem
limits and protected integration checks. Configure actual protections only where
the project requests them; do not claim that AGENTS.md or ESLint is a sandbox.
Consumers may change their own design system without upstream approval.

## D1 Reuse the registry and expose Foldkit information

Use standard meta.crease, docs, descriptions/categories, source files and explicit
file targets. Generate them from existing contracts/catalog data. Do not fork the
registry format or create a competing inventory just to carry metadata.

The inspected consumer's shadcn info output reports Radix/React defaults and zero
installed components. Implement Foldkit-aware project information in the existing
Crease CLI: framework versions, selected renderer, actual imports/aliases,
installed artifacts, provenance and local adaptations.

Detailed inspection must expose the exact public exports, complete integration
program, state ownership and update/effect/lifecycle requirements, styling owner,
dependencies and quality limitations. A compact Crease skill uses this path to
find/install/compose/customize real source in ordinary tasks.

The 4.21.5 MCP view probe dropped meta, docs and file contents that CLI view kept.
Use a verified CLI/API route or a small adapter exposing those fields. Reuse the
documented public shadcn APIs. Do not rely on a field being stored to assume that
the agent received it.

Distribute short guides/skill support through registry files where appropriate.
Preserve existing project instructions/configuration rather than overwriting them.
Test dependency-ref resolution: current upstream docs say refs are not inherited,
while the older Crease guide says otherwise. Correct the documented/actual path.

## Acceptance matrix

| Case                                                                      | Required result                                                             |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Review F1-F4 typed/rendered counterexamples                               | Correct diagnostics/semantics plus preserved positive counterparts          |
| Alias omitted from installed contracts                                    | Explicit failure/incomplete; never doctor exit 0 claiming complete coverage |
| Global component CSS, including imported/nested variants                  | Fail the consumer quality gate                                              |
| Component file globally ignored or applicable rule disabled               | Fail/incomplete coverage                                                    |
| Registered renderer abuses unrelated raw controls or arbitrary appearance | Fail applicable authoring/ownership checks                                  |
| Product composition uses approved components                              | Pass without a raw grant                                                    |
| Feature changes ignores, raw grants or check scripts to hide misuse       | Fail independent scope/policy validation                                    |
| Legitimate source customization, theme edits and runtime positioning      | Pass applicable checks; preserve provenance                                 |
| Unused imported foundation with replacement raw rendering                 | Does not satisfy declared composition                                       |
| Metadata survives transport but is omitted by inspection                  | Fail the information-delivery test                                          |
| Missing renderer/API/component                                            | Actionable installation/unsupported explanation, not silent reinvention     |

Run a clean normal-project task: build a Foldkit/Vite dashboard with Crease
Sidebar, a table and charts. Verify actual resolved use, working interactions
and component-owned styling. No mandatory dashboard scaffold, handwritten
stand-ins, product-specific setup document or user-authored component map.
Repeat with a different screen and an addition to an existing consumer.

Keep source lint usable without browser dependencies. Build and run actual fresh
registry consumers per renderer; a source regex or CSS bundle heuristic is not
installed-app runtime evidence. Preserve the upstream release gates already
recorded in the ledger rather than claiming these work items complete them all.

## Delivery and review

Implement R1-R4 first, then E1/E2 with real consumer negatives, then the shared
metadata/discovery integration and independent scope checks. Work can be split
into reviewable commits; keep a single completion matrix with evidence for every
row and accurate partial/incomplete status.

Return the reviewed SHA, compatibility versions, changed APIs, migration,
positive and negative results, clean consumer runtime evidence and remaining
limits. Preserve this review's counterexamples as permanent fixtures.

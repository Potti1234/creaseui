# Crease styling reliability and lint implementation handoff

Date: 2026-10-13. Status: implementation plan. The work packages below are not
completed by creating these documents. Proposed APIs and commands are identified
in their owning plans.

Implement a shared design contract for Tailwind, StyleX and Pleat, make presets
apply coherently across components, and deliver an optional installable lint
add-on. Application code must use Crease controls, layout and text from the
first strict consumer release. Registered implementations may render raw
elements while remaining subject to authoring and quality checks.

Start with the bounded assignment at the end of this document. Use the work
packages in dependency order and deliver evidence with each implementation
slice. This is the entry point for the styling and lint workstream; the numbered
architecture plans remain the authority for Foldkit state and lifecycle design.

## Decisions already made

- Support all three renderers with shared behavior and semantic contracts.
- Switching renderer preserves the declared design; switching preset changes
  named visual roles while preserving behavior and accessibility.
- Strict consumer lint requires Crease controls, composition and typography
  immediately. A controls-only first release does not satisfy the request.
- Customization uses named component variants, registered themes, or registered
  source-owned components and adapters. Application appearance escapes are errors.
- Raw-rendering exceptions identify exact implementation files and exports.
  Registration does not exempt token, variant, behavior or accessibility checks.
- Source lint, rendered measurements and interaction tests prove different
  contracts. A passing source lint result is not a visual or accessibility certificate.
- Ship source lint without browser startup or rendered-tooling requirements.
  Consumer browser audits are a separate optional delivery.
- Preserve unrelated work, use generators for generated output, and leave merge,
  commit and publication as separately authorized actions.

## Baseline and review inputs

The last complete Pleat review used PR #27 commit
`69359503e35cb5925426add76aee4aba30d9609a`. Read the
[fourth code review](../reviews/pleat-pr-27-round-four.md) and
[design consistency review](../reviews/pleat-pr-27-design-consistency.md).
Earlier reviews describe historical defects; several were fixed by that head.
Do not recreate already resolved work or treat historical failures as current.

The main checkout contains experimental Pleat and lint changes. The separately
reviewed PR contains a full Pleat port. Reconcile these inputs explicitly before
implementation; neither directory should silently overwrite the other.

Historical evidence includes 166 passing Pleat site checks, two skipped
StyleX-only checks, and an all-1,524 copied-program startup pass. These counts
describe that reviewed commit. Inventory current examples and tests rather than
hard-coding them as future coverage requirements. Startup success did not prove
complete consumer CSS delivery.

## Plan map and execution order

| Package | Outcome                                                                 | Owning plan                                                                                                                 | Dependency                                |
| ------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| R0      | Reconciled baseline, current inventory and bounded implementation brief | This document and the agent protocol                                                                                        | First task                                |
| R1      | Complete shared themes, scoped state colors and palette validation      | [Theme contract and scoping](theme-contract-and-scoping-plan.md)                                                            | R0                                        |
| R2      | Whole-system preset coverage and strict composition replacements        | [Component and preset coverage](component-preset-coverage-plan.md)                                                          | R1 contract; migrate in component slices  |
| R3      | Permanent comparison fixtures and required CI gates                     | [Renderer regression and CI](renderer-regression-and-ci-plan.md)                                                            | Starts with R1 fixes; expands with R2     |
| L1      | Binding-aware strict source rules and exact ownership                   | [Lint delivery](consumer-ui-lint-delivery-plan.md), [source implementation brief](consumer-ui-lint-implementation-brief.md) | R0 and agreed shared contracts            |
| L2      | Portable setup, doctor and packed consumer proof                        | [Lint delivery](consumer-ui-lint-delivery-plan.md)                                                                          | L1 and ordinary R2 replacements           |
| A1      | Optional portable rendered audit and real interaction checks            | [Rendered audit delivery](rendered-ui-audit-delivery-plan.md)                                                               | Shared R1/R2 contracts; reuse R3 fixtures |
| A2      | Contextual guidance and baseline cleanup                                | [Rendered audit delivery](rendered-ui-audit-delivery-plan.md)                                                               | Classified A1 results                     |

R3 is not a final testing cleanup: every R1/R2 fix lands with its regression
check. L1 may be developed before all R2 components finish, but the strict
consumer release waits for usable ordinary replacements in all three renderers.
Use the same registry/receipt and policy definitions across these packages.

## Work package R0

**Objective:** establish a reproducible implementation baseline and identify
which reviewed findings still exist.

**Scope:** isolated checkout/worktree setup, current source inspection, inventory,
implementation brief and evidence records. Preserve the dirty main checkout.

**Inputs:** the existing `00` through `07` plans, `PRODUCT.md`, architecture and
authoring documents, compatibility metadata, installed Foldkit sources, PR #27
and the existing local lint/rendered SDK work. Follow the full reading and work
item format in [the agent protocol](07-agent-execution-protocol.md).

**State ownership:** no runtime state changes. Record the existing parent/child
boundaries for components selected for the first slice.

**Public API:** inventory current exports and proposed additions; do not document
the plans' illustrative APIs as exports already available.

**Behavior contract:** preserve Foldkit Models, Messages, updates, OutMessages,
primitive attributes and complete example wiring. Do not rewrite interaction
state to solve a theme issue.

**Evidence:** record actual commit/ref, dirty status, installed versions,
renderer/token module locations, current rule IDs, generator inputs and current
tests. Reproduce scoped primary hover and explicit RTL left alignment on the
chosen baseline, or link the newer fix and its regression test if already solved.

**Migration:** select the revised full Pleat port as the renderer input after
checking it, and preserve useful local lint research through a reviewed diff.
Integrate compatibility intentionally; avoid copying entire directories blindly.

**Stop conditions:** conflicting user edits, unavailable baseline sources, or a
required new state-machine design. Routine token naming, file placement and test
organization are implementation choices within the existing contracts.

## Release gates

| Delivery                         | Required proof                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Theme foundation                 | Complete bindings in three adapters; nested/open-overlay scope tests; known color/alignment regressions; palette validation; standalone CSS delivery                           |
| Stable design preset             | Every applicable catalog slot has a role or justified exception; all finite choices covered; preset fixtures and affected interaction checks pass                              |
| First strict source lint release | L1/L2 pass; complete ordinary controls/layout/text replacements in three renderers; settings and dashboard examples lint, compile, build and run from packed/installed sources |
| Optional rendered audit release  | Declared state matrix completes; clean fixtures pass; broken fixtures fail; incomplete execution cannot return success; portable package setup passes                          |

Keep the broader architectural roadmap's stability requirements. A source-lint
release does not automatically promote every component to stable. Source-only
lint need not wait for the later portable audit CLI, but actual component behavior
and styling checks remain necessary for its replacement fixtures.

## Evidence and reporting

Maintain one implementation ledger with package ID, component/contract, status,
commit, compatibility baseline, changed public exports, evidence paths and
remaining findings. Use the repository's existing quality model; do not create a
competing status vocabulary. Link generated coverage to discoverable tests.

Each bounded PR must include the reproduced problem, resulting behavior,
migration impact, focused checks, rendered evidence where applicable, clean
consumer proof, and the next package. Preserve initial failures and traces when
investigating flakes. Baseline updates require an explained design change.

## Assignment to give the agent

> Implement the Crease styling reliability and lint workstream from
> `docs/plan/reliability-and-lint-agent-handoff.md`. Read its linked plans and the
> existing Foldkit architecture/agent contracts before editing. Start with R0,
> then deliver a bounded R1 vertical slice: canonical theme schema and complete
> scoped bindings across Tailwind, StyleX and Pleat, the primary-hover regression,
> explicit left alignment in RTL where still broken, palette/state validation,
> permanent regression tests, updated complete examples and clean-consumer CSS
> proof. Preserve unrelated local changes and the already fixed Pleat PR work.
> Continue with R2/R3, L1/L2 and A1/A2 in the dependency order. Strict consumer lint
> must require Crease controls, layout and text immediately, with raw rendering
> permitted only inside exact registered implementations/adapters and authoring
> checks still active. Deliver bounded, reviewable changes with evidence; do not
> weaken assertions, raise warning budgets, silently skip a renderer, auto-accept
> visual baselines, duplicate behavior, commit, merge or publish without the
> corresponding authorization. Report any missing replacement or unresolved
> contract explicitly and complete the required release gates before claiming a
> delivery finished.

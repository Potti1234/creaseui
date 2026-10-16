# Crease UI Foldkit-native implementation plan

This directory is the execution package for turning Crease UI into a source-owned,
Foldkit-native UI system. It is intentionally stricter than a feature roadmap.
The documents define the product goal, architectural boundaries, public API rules,
distribution model, quality gates, migration sequence, and agent operating protocol.

For the styling reliability, Pleat consistency and installable consumer lint
assignment, start with
[`reliability-and-lint-agent-handoff.md`](reliability-and-lint-agent-handoff.md).
It provides the bounded work packages, dependencies, release gates and assignment
to give the implementation agent. The numbered documents below still govern
Foldkit architecture and lifecycle decisions.

For corrections after the PR #28 review, use
[`pr-28-repair-agent-plan.md`](pr-28-repair-agent-plan.md). It adds the seven
defect acceptance checks and the remaining release work in implementation order.

The latest follow-up is the [October 16 agent plan](pr-28-enforcement-followup-agent-plan.md),
based on [the a9b270a review](../reviews/pr-28-oct16-review.md). It covers the four
remaining reproductions plus the tutorial's authoring/CSS and registry discovery
requirements.

For the complete consumer guide series on creating, enforcing and continuously
maintaining a product design system with Crease, start with
[the guide series plan](design-system-guide-series-plan.md). Its companion
[tutorial specification](design-system-tutorial-spec.md) defines the working
example and renderer checkpoints; the
[policy and AI specification](design-system-policy-and-ai-plan.md) defines local
contracts, custom rules, task permissions and ongoing changes.

The [product discovery and repository plan](tutorial-product-discovery-and-repository-plan.md)
records the user's task-manager brief, separate creaseui-demo repository,
version branches, review workflow and open questions. The
[Linear research](linear-task-manager-design-research.md) supplies sourced
interaction/design principles for the Tailwind-first frontend.

## Start here

An implementation agent must read these files in order before changing source code:

1. [`00-agent-goal.md`](00-agent-goal.md): objective, scope, success criteria, and non-goals.
2. [`01-product-principles.md`](01-product-principles.md): product identity and decision rules.
3. [`02-architecture-contract.md`](02-architecture-contract.md): state ownership, effects, Submodels, rendering, and styling boundaries.
4. [`03-component-authoring-contract.md`](03-component-authoring-contract.md): required APIs and artifacts for every registry item.
5. [`04-registry-cli-and-distribution.md`](04-registry-cli-and-distribution.md): registry schema, configuration, CLI behavior, upgrades, and compatibility.
6. [`05-quality-accessibility-and-testing.md`](05-quality-accessibility-and-testing.md): evidence requirements and release gates.
7. [`06-migration-roadmap.md`](06-migration-roadmap.md): ordered implementation phases and component waves.
8. [`07-agent-execution-protocol.md`](07-agent-execution-protocol.md): work loop, reporting format, stop conditions, and definition of done.

## Additional workstreams

- [Design system guide series](design-system-guide-series-plan.md): fifteen
  chapters, reader outcomes, publication gates and the implementation assignment.
- [Executable design system tutorial](design-system-tutorial-spec.md): one
  consumer-owned example product, real installations, three renderer tracks,
  complete programs and verification.
- [Product policy and AI workflows](design-system-policy-and-ai-plan.md):
  consumer rule extensions, component boundaries, AI edit scopes, repository
  enforcement, migrations and upstream updates.
- [Tutorial product discovery and versions](tutorial-product-discovery-and-repository-plan.md):
  confirmed input, complete questionnaire, separate repository and branch strategy,
  deep tutorial expectations and iterative visual review.
- [Linear task-manager design research](linear-task-manager-design-research.md):
  primary-source findings, proposed product rules and verification mechanisms.
- [Crease Tasks first local slice](linear-first-slice-implementation-brief.md):
  confirmed scope, reviewed source baseline, implemented product patterns,
  lessons from browser checks and the bounded next implementation assignment.
- [Tutorial architecture repair and enforcement](tutorial-architecture-enforcement-plan.md):
  failure analysis of global component CSS and rebuilt foundations, reuse
  inventory, checked authoring scopes and concrete misuse fixtures.
- [Shadcn registry and Foldkit discovery](shadcn-registry-and-foldkit-discovery-plan.md):
  verified metadata extension points, CLI/MCP visibility differences, Foldkit
  project context and a normal new-project acceptance task without bespoke scaffolding.

- [`reliability-and-lint-agent-handoff.md`](reliability-and-lint-agent-handoff.md):
  starting assignment, baseline reconciliation, ordered work packages and
  completion gates for the combined styling/lint workstream.
- [`theme-contract-and-scoping-plan.md`](theme-contract-and-scoping-plan.md):
  canonical visual roles, complete scoped bindings in all three renderers,
  derived state colors, overlays, palette validation and migration.
- [`component-preset-coverage-plan.md`](component-preset-coverage-plan.md):
  whole-system preset coverage, component role inventory, composition
  replacements, documentation parity and component migration waves.
- [`renderer-regression-and-ci-plan.md`](renderer-regression-and-ci-plan.md):
  permanent comparison fixtures, known regression cases, state/browser matrices,
  clean consumer CSS proof, deterministic snapshots and required CI gates.
- [`consumer-ui-lint-delivery-plan.md`](consumer-ui-lint-delivery-plan.md):
  bounded source analysis/rule implementation, portable init/doctor, packaging,
  consumer proof and the first strict source release gate.
- [`rendered-ui-audit-delivery-plan.md`](rendered-ui-audit-delivery-plan.md):
  optional portable audit runner, component-owned measurements, interaction
  assertions, coverage/exit behavior and contextual guidance.
- [`consumer-ui-lint-plan.md`](consumer-ui-lint-plan.md): installable consumer
  lint presets, approved component boundaries, renderer composition parity,
  automatic rendered contracts, browser tooling and release gates.
- [`consumer-ui-lint-implementation-brief.md`](consumer-ui-lint-implementation-brief.md):
  strict controls/layout/text policy from the first release, proposed package API,
  ownership schema, source rule behavior, test matrix and ordered agent tasks.

## Authority order

When sources disagree, use this authority order:

1. The Foldkit and `@foldkit/ui` source and types installed for the active compatibility baseline.
2. Foldkit documentation for that exact version.
3. This planning package.
4. Existing Crease architecture and authoring documentation.
5. Current Crease implementations.
6. shadcn/ui source and documentation.

The visual treatment may follow shadcn/ui. State ownership, effects, accessibility
behavior, and component composition must follow Foldkit.

## Plan-wide invariants

- Do not add new catalog breadth until Phase 2 in the migration roadmap is complete.
- Do not call a component stable without evidence for every applicable quality dimension.
- Do not put durable domain values inside reusable interaction Submodels.
- Do not modify child Model fields from a parent update.
- Do not run effects from views or event translators.
- Do not duplicate behavior between Tailwind, StyleX and Pleat implementations.
- Do not use React, JSX, hooks, contexts, providers, or clone-element patterns.
- Do not treat upstream shadcn parity as proof of Foldkit correctness.
- Preserve source ownership and inspectability in every generated artifact.

## Completion of this plan

The plan is complete only when:

- the compatibility baseline is current and mechanically enforced;
- every registry item has a correct artifact classification;
- every Crease-owned state machine is a real Foldkit Submodel or is reclassified as a recipe;
- flagship components satisfy the full quality contract;
- Tailwind, StyleX and Pleat consume one behavior implementation and one semantic token contract;
- the CLI can diagnose a consumer, install an artifact, show required integration, and preview upgrades safely;
- the documentation teaches complete Foldkit integration using code that compiles against the supported baseline.

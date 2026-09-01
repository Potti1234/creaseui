# Crease UI Foldkit-native implementation plan

This directory is the execution package for turning Crease UI into a source-owned,
Foldkit-native UI system. It is intentionally stricter than a feature roadmap.
The documents define the product goal, architectural boundaries, public API rules,
distribution model, quality gates, migration sequence, and agent operating protocol.

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
- Do not duplicate behavior between Tailwind and StyleX implementations.
- Do not use React, JSX, hooks, contexts, providers, or clone-element patterns.
- Do not treat upstream shadcn parity as proof of Foldkit correctness.
- Preserve source ownership and inspectability in every generated artifact.

## Completion of this plan

The plan is complete only when:

- the compatibility baseline is current and mechanically enforced;
- every registry item has a correct artifact classification;
- every Crease-owned state machine is a real Foldkit Submodel or is reclassified as a recipe;
- flagship components satisfy the full quality contract;
- Tailwind and StyleX consume one behavior implementation and one semantic token contract;
- the CLI can diagnose a consumer, install an artifact, show required integration, and preview upgrades safely;
- the documentation teaches complete Foldkit integration using code that compiles against the supported baseline.


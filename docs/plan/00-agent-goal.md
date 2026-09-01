# Agent goal and delivery contract

## Copy-ready assignment

Use the following as the goal for an implementation agent:

> Execute the Crease UI Foldkit-native implementation plan in `docs/plan/`.
> Read every plan document in its numbered order before editing. Begin with Phase 0
> in `06-migration-roadmap.md`, satisfy its deliverables and exit criteria, then
> continue phase by phase. Treat the exact supported Foldkit and `@foldkit/ui` source
> as the behavioral authority and shadcn/ui as a visual and distribution reference.
> Preserve unrelated worktree changes. Do not add catalog breadth, skip evidence
> requirements, mutate child Models from parents, duplicate behavior between skins,
> or mark quality dimensions verified without linked proof. Complete each component
> as a vertical slice including architecture, source, examples, tests, accessibility,
> visual evidence, registry output, clean-consumer installation, and migration notes.
> Continue until the complete plan is achieved or a documented stop condition
> requires maintainer direction. Report progress and final evidence using
> `07-agent-execution-protocol.md`.

## Objective

Transform the existing Crease UI repository into a Foldkit-native, source-owned UI
system. Retain the useful parts of shadcn/ui, especially registry distribution,
semantic design tokens, familiar visual treatment, variants, editable source, and
complete examples. Replace React-shaped assumptions with explicit Foldkit Models,
Messages, update functions, Commands, Subscriptions, Mounts, Submodels, ViewInputs,
and OutMessages.

The result must make the correct Foldkit architecture easier to adopt than an ad hoc
port. It must not merely make React component names available in TypeScript.

## Starting facts

- The repository currently publishes 65 UI registry modules.
- Documentation and registry presence are broad, but behavioral, visual,
  accessibility, and composition verification are still limited.
- The package baseline and some prose documentation have drifted across Foldkit
  versions.
- Primitive-backed components and Crease-owned state machines do not yet use one
  consistent public Submodel contract.
- Tailwind and StyleX surfaces must converge on shared behavior rather than become
  independently maintained component libraries.
- The worktree may contain user changes. Preserve them and do not reset, overwrite,
  or reformat unrelated files.

## Required outcomes

### 1. Versioned Foldkit authority

- Select one exact Foldkit, `@foldkit/ui`, Effect, and Foldkit Vite plugin baseline.
- Record the baseline in package dependencies, compatibility metadata, generated
  documentation, and test fixtures.
- Add checks that fail when prose, metadata, installed packages, or examples disagree.
- Treat every Foldkit minor upgrade as an explicit compatibility project because the
  framework is pre-1.0.

### 2. Honest artifact taxonomy

Every registry item must be classified as one of:

- render helper;
- controlled helper;
- interaction Submodel;
- lifecycle adapter;
- feature recipe;
- block;
- theme, icon, or tooling support artifact.

The classification must determine required exports, documentation sections, tests,
registry metadata, and installation output. A component may not be called stateful
only because its view receives a Model-shaped object.

### 3. Foldkit-native APIs

- Stateless UI remains a plain typed view helper.
- Controlled values remain in the parent Model.
- Reusable interaction state uses Schema-defined Models and Messages.
- Stateful views use `Submodel.defineView` and are embedded through `h.submodel`.
- Parent delegation uses `Update.foldChild` or the current baseline equivalent.
- Child domain facts leave through typed OutMessages.
- Parent-initiated child transitions use exported update entry points.
- Effects use Commands, Subscriptions, Mounts, or managed resources.
- Generic selection components bind item types once at module scope.

### 4. One behavior layer, multiple skins

- Tailwind and StyleX implementations share behavior, Models, Messages, updates,
  OutMessages, accessibility semantics, and authored examples.
- A semantic slot and state contract sits between behavior and styling.
- Generated style artifacts are clearly marked and never hand-edited.
- Each supported skin must prove equivalent states, dark mode, directionality,
  reduced motion, and responsive behavior.

### 5. Architecture-aware distribution

- Keep the shadcn registry as a transport mechanism.
- Add Crease-owned configuration and diagnostics for Foldkit concerns.
- Make installation reveal whether an artifact requires parent Model, Message,
  update, subscriptions, commands, mounts, services, or CSS.
- Provide optional wiring generation without hiding the resulting code.
- Make upgrades previewable, version-aware, and safe for source-owned local changes.

### 6. Evidence-driven stability

Stable means that source, types, behavior tests, Scene tests, browser tests,
accessibility checks, visual snapshots, documentation, registry metadata, and clean
consumer installation agree. File existence or upstream name parity is insufficient.

## Non-goals

- Do not reproduce React APIs mechanically.
- Do not create a runtime package that consumers must keep opaque.
- Do not hide application state in DOM nodes, closures, module globals, or services.
- Do not reproduce Radix behavior when Foldkit provides a different native primitive.
- Do not promise perfect visual identity where platform-native behavior is more
  accessible or robust.
- Do not migrate all 65 components simultaneously.
- Do not rewrite unrelated documentation or branding during architectural work.
- Do not mark components verified by editing status metadata without new evidence.

## Success metrics

Track these metrics in generated project metadata:

- number of artifacts by classification;
- number of stable artifacts by quality dimension;
- number of components with complete parent integration examples;
- number of Crease-owned state machines using the standard Submodel contract;
- number of components verified in Tailwind and StyleX;
- number of supported Foldkit compatibility baselines;
- clean consumer installation success rate;
- percentage of component docs compiled against the supported baseline;
- accessibility violations by severity;
- visual regression approval coverage by component and state.

Do not use raw component count as the primary success metric.

## Final delivery expected from the implementation agent

The agent must deliver:

1. implementation changes grouped by roadmap phase;
2. migrations for consumer-facing breaking changes;
3. generated compatibility and artifact metadata;
4. updated docs with complete compiling examples;
5. test evidence and rendered visual evidence;
6. a list of intentional limitations;
7. a list of deferred items with specific blockers;
8. no unrelated worktree damage.

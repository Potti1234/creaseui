# Agent execution protocol

## Mandatory reading and setup

Before editing, the agent must:

1. read every file in `docs/plan/`;
2. read `PRODUCT.md`, existing architecture, authoring, registry, compatibility, parity,
   and roadmap documents;
3. inspect repository instructions such as `AGENTS.md` if present;
4. inspect the dirty worktree and preserve unrelated changes;
5. identify the active roadmap phase and exact bounded work item;
6. verify the exact installed Foldkit and `@foldkit/ui` source and types;
7. write a short implementation brief and acceptance checklist.

Do not start with bulk edits.

## Work item format

Every work item must be written as:

```md
### Work item: <name>

Objective:
Concrete outcome, not an activity.

Scope:
Files and artifacts allowed to change.

Inputs:
Exact Foldkit version, primitive source, shadcn reference, and existing Crease API.

State ownership:
Parent-owned, child-owned, and per-render inputs.

Public API:
Exports added, changed, deprecated, or removed.

Behavior contract:
Keyboard, pointer, focus, dismissal, validation, animation, and responsive rules.

Evidence:
Tests, screenshots, generated metadata, and clean consumer proof required.

Migration:
Consumer impact and compatibility strategy.

Stop conditions:
Decisions that require user or maintainer direction.
```

## Execution loop

For each work item:

1. Inspect exact source and current tests.
2. Reproduce or characterize existing behavior.
3. Classify the artifact.
4. Write or update failing contract tests.
5. Implement the smallest complete vertical slice.
6. Generate skin artifacts from shared behavior.
7. Update complete examples.
8. Update registry and metadata through generators.
9. Run focused type, unit, Story, Scene, browser, accessibility, and visual checks.
10. Install into a clean consumer.
11. Review the diff for unrelated or generated noise.
12. Update quality status only for evidence actually produced.
13. Record limitations and the next work item.

Do not postpone tests, documentation, registry output, or migration notes to a future
cleanup phase.

## Required progress reporting

At meaningful checkpoints, report:

- completed outcome;
- files changed;
- tests and rendered evidence produced;
- remaining risks;
- next action;
- whether any plan assumption proved false.

Avoid reporting file creation as progress when behavior is not yet demonstrated.

## Verification commands

Use the repository's current scripts, updating this list when scripts change:

```sh
npm run docs:encoding
npm run docs:metadata
npm run icons:adapters
npm run parity:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:scene
npm run build
npm run test:registry
npm run test:e2e
```

Run focused checks during iteration and the full supported suite at phase gates. Do not
silence failing checks or regenerate expected files without reviewing the differences.

## Evidence report template

```md
## Evidence report

Compatibility baseline:
- Foldkit:
- @foldkit/ui:
- Effect:
- Vite plugin:

Artifact:
- Name:
- Classification:
- Stability before:
- Stability after:

Architecture:
- State ownership:
- Submodel boundary:
- Effects and lifecycle:
- SSR policy:

Verification:
- Typecheck:
- Unit and Story:
- Scene:
- Browser matrix:
- Accessibility:
- Visual snapshots:
- Clean consumer:
- Upgrade preview:

Intentional differences:
- ...

Known limitations:
- ...
```

## Definition of done for one artifact

An artifact is done only when:

- classification is correct;
- public API follows its classification;
- parent and component state ownership is explicit;
- effects use Foldkit lifecycle primitives;
- primitive behavior and attributes are preserved;
- Tailwind and StyleX share behavior;
- complete examples compile;
- required tests pass;
- visual and accessibility evidence exists;
- SSR policy is verified;
- registry metadata is generated and correct;
- a clean consumer installs, compiles, builds, and exercises it;
- migration guidance exists;
- quality metadata links to the produced evidence;
- no unrelated user changes were overwritten.

## Definition of done for a roadmap phase

- every phase exit criterion is satisfied;
- the full repository check passes;
- clean consumer checks pass for supported skins and rendering modes;
- generated artifacts are current;
- quality summaries are recalculated;
- unresolved issues are classified by severity;
- no P0 or P1 issue remains for a stable artifact;
- documentation describes the actual API, not the intended API;
- a maintainer can review the phase through bounded commits or a clearly separated diff.

## Failure handling

When a test fails:

1. determine whether the implementation, test, fixture, or compatibility baseline is wrong;
2. preserve the failure output;
3. fix the cause, not the assertion text;
4. rerun the narrowest relevant test;
5. rerun the phase gate when the narrow test passes.

When Foldkit behavior differs from shadcn:

1. preserve Foldkit and platform correctness;
2. document the intentional difference;
3. adapt the visual treatment around the behavior;
4. mark the dimension `adapted` only after adapted behavior is verified.

When a component cannot be made generic without domain leakage, reclassify it as a
feature recipe. Do not hide domain assumptions behind vague props.

## Source control and worktree safety

- Inspect `git status` before and after every bounded work item.
- Do not reset, discard, or overwrite changes not created for the work item.
- Avoid broad formatting passes.
- Separate generated output from authored changes in review.
- Do not use destructive Git commands.
- Do not commit unless the user explicitly asks.

## Final handoff

The final handoff must lead with the achieved outcome and include:

- phase and artifacts completed;
- public API and migration summary;
- verification results with evidence paths;
- compatibility baseline;
- intentional differences;
- known limitations and deferred work;
- exact next recommended work item;
- confirmation that unrelated worktree changes were preserved.


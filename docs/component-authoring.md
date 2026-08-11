# Component authoring contract

Every Crease UI component is source-owned by the consuming application. The
registry is a delivery mechanism, not a runtime package boundary. A component is
complete only when its source, documentation, capability record, and behavior
tests agree.

## Required artifacts

For a component named `example-widget`, maintain these artifacts together:

- `src/ui/example-widget.ts`: the public, installable implementation.
- `registry.json`: the registry item and its transitive Crease UI dependencies.
- `src/docs/components/definitions/*.ts`: authored examples and explanatory
  copy. These files are grouped alphabetically only to keep merge conflicts
  bounded; they are not generated output.
- `src/docs/components/real-previews.ts`: the real component preview used by
  the shared catalog renderer.
- `docs/component-roadmap.json`: parity status and any intentional gap.
- `test/*.test.ts`: state transition and registry contracts.
- `scene/*.scene.test.ts` or `e2e/*.spec.ts`: rendered interaction and
  accessibility coverage for stateful behavior.

Run `npm run component:create -- example-widget` for the implementation shell.
The command deliberately does not create placeholder documentation: incomplete
catalog entries must fail coverage checks instead of looking finished.

## Public API policy

Use plain typed configuration objects for stateless render helpers. Stateful
controls expose `Model`, `Message`, `init`, `update`, and, when useful,
`OutMessage` and subscriptions. Keep state in the owning Foldkit model.

Use `Option` for fallible public operations and optional state that crosses a
component boundary. Optional configuration properties may use `?` when absence
only means “use the default.” Do not use `null` or `undefined` as an ad-hoc
failure channel in a public operation.

## Generated files

Generated discovery and install artifacts are written only by registry scripts:

- `.registry/**` from `npm run registry:build`.
- `public/r/**` and discovery metadata from `npm run registry:generate`.
- `src/lib/icon-nodes.generated.ts` from `npm run icons:generate`.

Do not hand-edit those outputs. Authored component definitions and previews stay
under source control and must remain readable, reviewable Foldkit code.

## Review sequence

1. Compare the current upstream shadcn source and record its commit or release.
2. Choose the closest Foldkit primitive and model the interaction explicitly.
3. Implement keyboard, focus, dismissal, disabled, responsive, and dark-mode
   behavior that applies to the component.
4. Add examples that exercise meaningful variants rather than visual aliases.
5. Update the roadmap honestly when a behavior remains adapted or incomplete.
6. Run `npm run check:full` and `npm run parity:check` before review.

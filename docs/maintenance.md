# Maintenance policy

## Upstream synchronization

The weekly upstream-parity workflow compares the pinned shadcn/ui inventory and
focused source hashes. A drift report is a review trigger, not permission for an
automatic source overwrite. Update the pin only after classifying each upstream
addition or change in the six parity dimensions and recording intentional
Foldkit adaptations.

## Dependency cadence

- Patch dependency updates can land after `npm run check` and affected browser
  or registry checks pass.
- Foldkit, Effect, Tailwind, Vite, and shadcn CLI minor upgrades require the full
  clean-consumer registry test and an update to `compatibility.json`.
- Major upgrades require a migration note in `CHANGELOG.md` and must not be
  mixed with unrelated component work.

Generated sources are checked, never hand-edited. Update them with the named
`*:generate` scripts and commit the generator, inputs, and outputs together.

## Compatibility and deprecation

Crease UI is pre-1.0, but source-owned consumers still need predictable changes.
Prefer additive APIs, document a replacement before removing an export, and keep
deprecated exports for at least one minor release when practical. A breaking
Foldkit primitive change must update the compatibility matrix and registry
install proof in the same release.

## Triage

Classify reports as behavior, accessibility, visual, composition, documentation,
or registry failures. Reproductions should identify the component, Crease
revision, Foldkit versions, browser, expected shadcn reference, and whether the
issue reproduces in the repository docs or only after registry installation.

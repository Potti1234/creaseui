# Changelog

All notable changes to Crease UI are recorded here. The project follows
[Semantic Versioning](https://semver.org/) once a public release is tagged.

## Unreleased

### Added

- A first-class `crease` CLI with `init`, `add`, `diff`, `upgrade`, and `doctor`
  workflows.
- Foldkit Scene tests and Playwright desktop/mobile accessibility contracts.
- Automated upstream shadcn component-name parity checks.
- Complete 65-item Foldkit registry inventory and source-owned theme.
- Stable, runnable documentation examples and generated API discovery metadata.
- Browser accessibility, interaction, responsive, and visual smoke tests.
- Multidimensional parity contracts pinned to upstream shadcn/ui provenance.
- Compound Dialog and Sheet layout APIs.
- Installable Create presets with five Foldkit-native icon families.

### Changed

- Application startup now receives the selected theme through Foldkit Flags.
- Route URLs are printed by Foldkit's bidirectional routers.
- The documentation application stores only the active route's page model.
- Documentation and landing claims now derive from repository facts.
- CI validates formatting, types, tests, builds, browser journeys, generated
  artifacts, and upstream parity drift.

### Fixed

- Horizontally scrollable documentation code blocks are keyboard focusable.
- Accessible file-input naming, disabled Select options, initial overlay focus,
  keyboard-readable code blocks, and documentation Sheet focus targets.

[Unreleased]: https://github.com/Potti1234/creaseui/compare/main...HEAD

# Changelog

All notable user-visible changes are recorded here. Crease UI follows semantic
versioning once the public CLI and registry reach `1.0.0`.

## Unreleased

### Added

- A first-class `crease` CLI with `init`, `add`, `diff`, `upgrade`, and `doctor`
  workflows.
- Foldkit Scene tests and Playwright desktop/mobile accessibility contracts.
- Automated upstream shadcn component-name parity checks.

### Changed

- Application startup now receives the selected theme through Foldkit Flags.
- Route URLs are printed by Foldkit's bidirectional routers.
- The documentation application stores only the active route's page model.

### Fixed

- Horizontally scrollable documentation code blocks are keyboard focusable.

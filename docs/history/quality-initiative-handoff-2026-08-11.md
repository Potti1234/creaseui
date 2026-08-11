# Crease UI quality initiative — handoff

> Historical record: this handoff described the uncommitted archive imported
> into the main repository on 2026-08-11. Its Git status, process IDs, and
> commit-reconstruction instructions are no longer current.

## 1. Executive summary

This work upgraded Crease UI from an early shadcn-inspired Foldkit port into a
much more auditable, installable, and maintainable port. The implementation was
guided by the fidelity and documentation quality of
[`axadrn/shadcn-templ`](https://github.com/axadrn/shadcn-templ), while preserving
Foldkit rather than copying Go templ or React architecture.

The result now has:

- a complete registry inventory covering all 62 recorded upstream shadcn/ui
  components plus three Crease recipes;
- stable, readable source for 420 runnable documentation examples;
- production browser, accessibility, keyboard, responsive, and visual smoke
  tests;
- machine-readable parity contracts across six independent quality dimensions;
- additive Foldkit-native compound APIs for Dialog and Sheet;
- an executable preset compiler with five real installable icon families;
- generated API tables and machine-readable/LLM-readable documentation;
- release, security, maintenance, contribution, and ownership policies; and
- a nine-part logical commit journal for reconstructing commits later.

No Git commits were created. The working tree is intentionally dirty and the
base revision remains:

```text
878765a069669f6f23794833a24d4606705050b8
chore(lint): enforce side-effect-safe type imports
```

Use [`COMMIT_JOURNAL.md`](COMMIT_JOURNAL.md) as the authoritative staging and
commit guide. It lists suggested messages, files, overlapping hunks,
dependencies, and verification evidence for every logical commit.

## 2. Reference projects and fidelity policy

The following upstream revisions were inspected during the work:

- shadcn/ui: `41bbc12cfd39ed8d9cb8da04275479ee7ecc0612`
- shadcn-templ: `e066f0ba1f3b690d5661647e74f313cde67f7a67`

The shadcn/ui registry at the pinned revision contains 62 relevant items. Crease
publishes 65 UI registry entries because it additionally includes the
`data-table`, `date-picker`, and `typography` recipes.

The guiding rule is:

> shadcn/ui defines the visual language and expected interaction; Foldkit and
> Foldkit UI define state ownership, messages, commands, subscriptions, focus,
> and accessibility architecture.

React/Radix APIs were therefore not transliterated blindly. Stateful controls
remain explicit Foldkit submodels. Visual fidelity is tracked separately from
behavior, accessibility, composition, documentation, and registry fidelity.

The parity contract deliberately records most visual status as `unverified`.
The browser suite supplies strong smoke-test evidence, but this work does not
claim certified pixel parity with every upstream shadcn state.

## 3. Work completed, in implementation order

### 3.1 Baseline and no-commit workflow

- Created [`COMMIT_JOURNAL.md`](COMMIT_JOURNAL.md).
- Recorded the base revision and initial test/build results.
- Aligned CI with the repository quality gates.
- Preserved the user's requirement not to create commits on this device.

Suggested logical commit:

```text
chore(quality): establish implementation journal and baseline gates
```

### 3.2 Stable documentation source and UTF-8 integrity

The documentation previously depended on runtime function stringification.
That produces unreadable/minified code in production and is not a stable source
contract.

Implemented:

- [`scripts/generate-doc-example-sources.mjs`](scripts/generate-doc-example-sources.mjs)
  parses all documentation definition files and materializes stable source;
- [`src/docs/components/generated-example-sources.ts`](src/docs/components/generated-example-sources.ts)
  now contains 420 checked examples;
- [`scripts/normalize-doc-encoding.mjs`](scripts/normalize-doc-encoding.mjs)
  detects and optionally repairs common double-encoded UTF-8/mojibake patterns;
- the catalog uses generated source instead of `Function.prototype.toString()`;
- tests reject placeholders, truncated snippets, stale generation, and damaged
  Unicode.

Commands:

```sh
npm run docs:sources
npm run docs:sources:generate
npm run docs:encoding
npm run docs:encoding:fix
```

Generated files must not be edited manually.

Suggested logical commit:

```text
fix(docs): render examples from stable source files
```

### 3.3 Accurate landing page, deployment facts, and provenance

The public site had stale counts, registry placeholder language, inaccurate
parity claims, and navigation targets that did not represent the available
project.

Implemented:

- repository-derived facts for 65 components, 70 chart examples, 33 showcase
  cards, and 16 sidebar blocks;
- working shadcn registry installation commands;
- accurate source-ownership and Foldkit architecture explanations;
- corrected component navigation;
- build revision metadata with a `+dirty` marker for local builds;
- repository/source tests for every public inventory claim;
- complete third-party attribution for shadcn/ui, Foldkit UI, ECharts, Lucide,
  Hugeicons, Tabler, Phosphor, and Remix Icon.

Manual deployment follow-up remains: set the GitHub repository homepage to the
canonical deployed documentation URL and confirm the deployed footer revision
matches its build commit.

Suggested logical commit:

```text
fix(site): align landing content and deployment metadata
```

### 3.4 Production browser, accessibility, and visual validation

Added Playwright and axe coverage in:

- [`playwright.config.ts`](playwright.config.ts)
- [`e2e/site.spec.ts`](e2e/site.spec.ts)

The suite currently covers:

- landing content and navigation;
- light and dark desktop screenshots;
- 390×844 mobile containment and navigation;
- production source readability and valid Unicode;
- generated component API tables and discovery endpoints;
- Create preset Shuffle/output behavior;
- Dialog focus trap, initial focus, Escape close, and trigger restoration;
- Sheet compound structure and focus behavior; and
- WCAG 2.0/2.1 A/AA axe scans for the landing and flagship documentation pages.

Accessibility fixes made while building the suite include:

- keyboard-scrollable code regions;
- a proper label for the file input example;
- Foldkit Dialog title/description/initial-focus attributes;
- reliable initial focus and focus restoration; and
- a genuine disabled Select option instead of a visual-only simulation.

CI installs Chromium, runs the browser suite, and uploads reports, screenshots,
and traces for 14 days.

Command:

```sh
npm run test:browser
```

Suggested logical commit:

```text
test(browser): cover accessibility and visual fidelity
```

### 3.5 Multidimensional parity and upstream drift

Name-only component coverage can hide major differences. The new contract tracks
each component independently across:

1. visual fidelity;
2. behavior;
3. accessibility;
4. composition;
5. documentation; and
6. registry/install fidelity.

Important files:

- [`docs/component-parity.json`](docs/component-parity.json)
- [`docs/component-parity.schema.json`](docs/component-parity.schema.json)
- [`docs/component-parity.md`](docs/component-parity.md)
- [`docs/upstream-shadcn.json`](docs/upstream-shadcn.json)
- [`docs/component-roadmap.json`](docs/component-roadmap.json)
- [`scripts/generate-parity-contract.mjs`](scripts/generate-parity-contract.mjs)
- [`scripts/sync-upstream-parity.mjs`](scripts/sync-upstream-parity.mjs)
- [`.github/workflows/upstream-parity.yml`](.github/workflows/upstream-parity.yml)

The weekly workflow reports upstream drift without automatically overwriting
Foldkit source. A maintainer must classify the changes and update the pinned
contract intentionally.

Commands:

```sh
npm run parity:check
npm run parity:generate
npm run parity:upstream
npm run parity:upstream:update
```

Suggested logical commit:

```text
docs(parity): separate visual behavior and composition contracts
```

### 3.6 Foldkit-native compound composition APIs

Dialog and Sheet now expose additive `layout(parts)` callbacks. Bound part
builders provide familiar shadcn-style composition without hiding Foldkit's
model/update/message architecture.

Available parts include:

- header;
- title;
- description;
- footer; and
- close.

The builders automatically apply the primitive's ARIA and focus attributes.
Existing concise `title`, `content`, and `footer` configuration remains
supported, so this is additive rather than a breaking rewrite.

The documentation includes real compound examples, and Playwright validates
the rendered structure and focus behavior. A Sheet documentation bug was also
fixed where a render-only ID override caused focus commands to target a
different element.

Suggested logical commit:

```text
feat(ui): add compound composition descriptors
```

### 3.7 Executable presets and real icon families

The `/create` interface previously exposed many choices that only affected
preview metadata or approximated a design difference. It now compiles the
selected configuration into installable output.

The compiler supports:

- eight structural styles;
- base, theme, and chart palettes;
- five chart tokens;
- body and heading fonts;
- radius choices;
- subtle/bold menu accents;
- default/inverted and opaque/translucent menu colors; and
- Lucide, Hugeicons, Tabler, Phosphor, or Remix Icon output.

`Copy Registry JSON` returns a complete `registry:style` item. The materializer
also writes:

- `registry-item.json`;
- `crease-preset.css`; and
- `crease-preset.json`.

Example:

```sh
npm run preset:build -- --preset b27GcrRo --output ./generated-preset
```

The Shuffle button now changes the full preset deterministically and keeps it
round-trippable through the shadcn-compatible preset code.

#### Icon adapter implementation

Five adapters are generated from licensed Iconify datasets. Each implements the
same canonical 76-icon `@/lib/icon` API with Foldkit-native SVG constructors:

- `icons-lucide`
- `icons-hugeicons`
- `icons-tabler`
- `icons-phosphor`
- `icons-remixicon`

The mapping is checked in at
[`scripts/icon-adapter-map.json`](scripts/icon-adapter-map.json). Generated
adapter source lives under [`registry/icons`](registry/icons).

Commands:

```sh
npm run icons:adapters
npm run icons:adapters:generate
npm run registry:build
npm run test:registry
```

`test:registry` now installs the full component registry into a clean temporary
consumer, sequentially overwrites `@/lib/icon` through the real shadcn CLI with
all five families, type-checks each replacement, and builds the consumer.

Known preview limitation: the Create board itself still uses the documentation
application's currently bundled Lucide node shapes. The selected icon family is
fully applied to the generated registry artifact; the live board only provides
a stroke-style approximation before installation.

Google Fonts imports are generated for selected font families. Consumers with
offline, privacy, or strict CSP requirements should replace them with self-hosted
font declarations.

See [`docs/create-presets.md`](docs/create-presets.md).

Suggested logical commit:

```text
feat(create): implement installable style and theme presets
```

### 3.8 API reference, search data, and LLM-readable docs

[`scripts/generate-doc-metadata.mjs`](scripts/generate-doc-metadata.mjs) reads
the registry and exported TypeScript declarations. It generates:

- [`src/docs/generated-component-api.ts`](src/docs/generated-component-api.ts)
  for in-browser API tables;
- [`docs/api-reference.md`](docs/api-reference.md) for a repository-readable API
  inventory;
- [`public/docs-index.json`](public/docs-index.json) for structured search and
  tooling;
- [`public/docs-index.schema.json`](public/docs-index.schema.json);
- [`public/llms.txt`](public/llms.txt); and
- [`public/llms-full.txt`](public/llms-full.txt).

Every component page now combines:

- installation commands;
- source-owned usage examples;
- a composition outline;
- multiple runnable examples;
- generated exported symbol/signature tables;
- source links; and
- Foldkit reference links.

[`docs/getting-started.md`](docs/getting-started.md) explains initial setup,
stateless helpers, stateful component integration, and repository validation.

Commands:

```sh
npm run docs:metadata
npm run docs:metadata:generate
```

Suggested logical commit:

```text
docs: expand examples API references and discovery metadata
```

### 3.9 Governance, security, and releases

Added:

- [`CHANGELOG.md`](CHANGELOG.md)
- [`SECURITY.md`](SECURITY.md)
- [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)
- [`docs/maintenance.md`](docs/maintenance.md)
- [`docs/releasing.md`](docs/releasing.md)
- [`.github/CODEOWNERS`](.github/CODEOWNERS)
- structured bug and component-request issue forms;
- a quality-evidence pull request template; and
- [`.github/workflows/release.yml`](.github/workflows/release.yml)

CI now runs the complete source/generation/parity/type/test/build gate. Tagged
release verification additionally runs browser tests, builds the registry,
installs it into a clean consumer, and uploads the site, registry, browser,
compatibility, and parity evidence.

The dependency audit found `nanoid` 3.3.16 through PostCSS. Its compatible
lockfile entry was upgraded to 3.3.18, clearing GHSA-2v37-7h3g-55p8 without
changing declared dependency ranges.

Suggested logical commit:

```text
chore(project): add release security and maintenance policy
```

## 4. Quality command map

The primary local gate is:

```sh
npm run check
```

It runs, in order:

1. documentation encoding validation;
2. stable documentation source validation;
3. API/discovery metadata validation;
4. icon adapter validation;
5. parity contract validation;
6. ESLint;
7. TypeScript;
8. Node tests; and
9. the production Vite build.

Additional gates:

```sh
npm run test:browser   # production Chromium, axe, focus, responsive, screenshots
npm run registry:build # shadcn registry schema/materialization build
npm run test:registry  # clean consumer install, typecheck, and build
npm audit --omit=dev   # dependency advisory check
```

Run `registry:build` before `test:registry`, because the clean-consumer script
serves the generated `.registry` JSON.

## 5. Final verification evidence

The final repository state was verified on 2026-08-11:

- `npm run check`: passed;
- documentation encoding: passed;
- stable examples: 420;
- API/discovery metadata records: 65;
- icon adapters: five families, 76 canonical names each;
- parity contracts: 65;
- ESLint: passed;
- TypeScript: passed;
- Node tests: 49 passed, 0 failed;
- production build: passed;
- Playwright: 8 passed, 0 failed;
- axe WCAG A/AA scans: no reported violations;
- registry build: passed for theme, presets, libraries, all UI modules, and all
  icon adapters;
- clean consumer: every component and every icon family installed and
  type-checked, followed by a successful production build;
- visual review: light desktop, dark desktop, and 390 px mobile screenshots
  reviewed successfully; and
- `npm audit --omit=dev`: zero vulnerabilities.

The production documentation bundle is currently:

```text
JavaScript: 1,839.44 kB / 490.67 kB gzip
CSS:          139.27 kB /  22.23 kB gzip
```

Vite reports the existing >500 kB chunk warning. This is the main known
performance follow-up; route-level or feature-level code splitting would be the
next meaningful optimization.

On Windows, the complete clean-consumer registry verification took roughly nine
minutes because it invokes the shadcn CLI and TypeScript repeatedly. It also
prints Node's `DEP0190` warning because the existing Windows `.cmd` execution
uses `shell: true`; all arguments are repository-controlled, but the launcher can
be refactored later to remove the warning.

Git may print LF-to-CRLF conversion warnings on this Windows checkout. No
whitespace errors were reported by `git diff --check`.

## 6. Commit reconstruction instructions

There are 74 modified/untracked working-tree entries at handoff. Do not use a
broad `git add .` followed by arbitrary splitting: several shared files contain
hunks belonging to different logical commits.

Recommended process on an authenticated machine:

1. Read [`COMMIT_JOURNAL.md`](COMMIT_JOURNAL.md) from top to bottom.
2. Recreate entries 01 through 09 in order.
3. For files listed in more than one entry—especially `package.json`,
   `package-lock.json`, `README.md`, `.github/workflows/ci.yml`,
   `e2e/site.spec.ts`, documentation definitions, and generated files—use:

   ```sh
   git add -p <file>
   ```

4. Add new files explicitly for the entry that introduces them.
5. Inspect the staged patch before every commit:

   ```sh
   git diff --cached --stat
   git diff --cached
   ```

6. Run the entry-specific verification recorded in the journal.
7. After all logical commits are reconstructed, run the complete final gates
   again.

This handoff file can be included with the governance/documentation commit or
committed separately as:

```text
docs(project): add quality initiative handoff
```

Never commit these local artifacts:

- `node_modules/`
- `dist/`
- `.registry/`
- `playwright-report/`
- `test-results/`
- temporary parity clones; or
- temporary preset/registry consumer directories.

## 7. Current local development server

At handoff, the Crease UI Vite server is running at:

```text
http://127.0.0.1:5174/
PID 1584
```

Port 5173 was already occupied by a separate `foldviewer` project and was left
untouched. The Crease process was launched hidden with strict port 5174.

To stop only the verified Crease server in PowerShell:

```powershell
$process = Get-CimInstance Win32_Process -Filter "ProcessId=1584"
if ($process.CommandLine -like '*MaasProjects\\crease*' -and $process.CommandLine -like '*vite*5174*') {
  Stop-Process -Id 1584
}
```

If the PID has changed, resolve port 5174 first and verify its command line
before stopping it.

## 8. Recommended next work

1. Reconstruct and push the nine journaled commits.
2. Let hosted CI and the weekly upstream-parity workflow run from the pushed
   revision.
3. Configure the canonical docs deployment/homepage and private vulnerability
   reporting in GitHub repository settings.
4. Review component parity entries marked `partial`, prioritizing behavior and
   accessibility before visual refinements.
5. Add upstream-referenced screenshots and state matrices before promoting
   visual statuses from `unverified` to `verified`.
6. Implement real icon-family switching in the live Create preview if exact
   pre-install preview fidelity is important.
7. Split the documentation application bundle by route or large feature area.
8. Create the first versioned release using
   [`docs/releasing.md`](docs/releasing.md).

## 9. Source of truth index

| Concern | Source of truth |
| --- | --- |
| Logical commits | [`COMMIT_JOURNAL.md`](COMMIT_JOURNAL.md) |
| Architecture | [`docs/architecture.md`](docs/architecture.md) |
| Getting started | [`docs/getting-started.md`](docs/getting-started.md) |
| Registry installation | [`docs/registry.md`](docs/registry.md) |
| Preset compiler | [`docs/create-presets.md`](docs/create-presets.md) |
| Human parity policy | [`docs/component-parity.md`](docs/component-parity.md) |
| Machine parity | [`docs/component-parity.json`](docs/component-parity.json) |
| Upstream pin/hashes | [`docs/upstream-shadcn.json`](docs/upstream-shadcn.json) |
| Component roadmap | [`docs/component-roadmap.json`](docs/component-roadmap.json) |
| API inventory | [`docs/api-reference.md`](docs/api-reference.md) |
| Machine discovery | [`public/docs-index.json`](public/docs-index.json) |
| LLM discovery | [`public/llms.txt`](public/llms.txt) |
| Maintenance | [`docs/maintenance.md`](docs/maintenance.md) |
| Releases | [`docs/releasing.md`](docs/releasing.md) |
| Security | [`SECURITY.md`](SECURITY.md) |
| Third-party licenses | [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) |

This document describes the state of the repository at the end of the quality
initiative. For exact per-file staging boundaries and historical verification,
the commit journal remains authoritative.

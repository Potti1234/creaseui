# Crease UI implementation journal

> Historical record: these were the planned commits from the offline work
> device. The archive has since been reconciled and committed on the main
> development checkout.

This file records the logical commits for the Crease UI quality initiative.
No commits are created on this work device. When the work is moved to an
authenticated environment, apply the entries in order and commit the listed
files with the suggested messages.

## Working rules

- Base revision: `878765a` (`chore(lint): enforce side-effect-safe type imports`)
- Keep every journal entry independently reviewable where practical.
- Run the entry-specific checks before committing it.
- If a file appears in more than one entry, stage its relevant hunks rather
  than staging the entire file blindly.
- Do not commit browser artifacts, dependency directories, generated local
  caches, or temporary comparison repositories.

## Planned commit sequence

### 01. `chore(quality): establish implementation journal and baseline gates`

Status: ready to commit

Purpose:

- Record the no-commit workflow and the intended dependency order.
- Make the repository quality gates deterministic before changing behavior.

Files:

- `COMMIT_JOURNAL.md`
- `.github/workflows/ci.yml`

Changes:

- Added the lint gate to CI so the hosted workflow matches the documented
  local quality contract.
- Recorded the clean baseline before implementation work begins.

Verification:

- `npm ci --no-audit --no-fund` (pass; 148 packages installed)
- `npm run check` (pass)
  - ESLint: pass
  - TypeScript: pass
  - Node tests: 38 passed, 0 failed
  - Production build: pass
  - Existing advisory: the main JavaScript chunk is 1,655.89 kB
    (463.46 kB gzip), above Vite's 500 kB warning threshold.

### 02. `fix(docs): render examples from stable source files`

Status: ready to commit

Purpose:

- Remove production dependence on `Function.prototype.toString()`.
- Preserve readable, copyable source through production minification.
- Detect stale generated examples and damaged UTF-8 text in CI.

Files:

- `package.json`
- `scripts/generate-doc-example-sources.mjs`
- `scripts/normalize-doc-encoding.mjs`
- `src/docs/components/catalog.ts`
- `src/docs/components/generated-example-sources.ts`
- `src/docs/components/definitions/a-to-command.ts`
- `src/docs/components/definitions/context-to-pagination.ts`
- `src/docs/components/definitions/popover-to-typography.ts`
- `src/docs/components/real-previews.ts`
- `src/ui/combobox.ts`
- `src/ui/command.ts`
- `src/ui/dialog.ts`
- `src/ui/input.ts`
- `src/ui/slider.ts`
- `test/catalog-coverage.test.ts`

Changes:

- Generate 419 documentation snippets across all catalog definition files from
  the TypeScript AST before Vite
  minifies the application, instead of stringifying runtime functions.
- Fail the quality gate when generated sources are stale.
- Repair existing mojibake and fail the quality gate when common double-encoded
  UTF-8 sequences reappear.
- Cover the source-generation contract in the catalog test suite.

Verification:

- `npm run check` (pass)
  - Documentation encoding: pass
  - Generated sources: 419 current examples
  - ESLint and TypeScript: pass
  - Node tests: 39 passed, 0 failed
  - Production build: pass
  - Existing bundle-size advisory after complete source coverage: 1,753.74 kB
    (477.96 kB gzip)
  - Production browser verification: Dialog and Button examples retain readable
    identifiers and repaired Unicode after minification.

### 03. `fix(site): align landing content and deployment metadata`

Status: ready to commit

Purpose:

- Remove stale component counts and “registry coming soon” messaging.
- Correct navigation targets and expose build/source revision metadata.

Files:

- `README.md`
- `src/demo/landing.ts`
- `src/lib/project-facts.ts`
- `src/vite-env.d.ts`
- `test/site-accuracy.test.ts`
- `vite.config.ts`

Changes:

- Publish the verified inventory: 65 components, 70 rendered chart examples,
  33 showcase cards, and 16 sidebar blocks.
- Replace the registry placeholder with the working shadcn CLI command and an
  accurate explanation of installed source ownership.
- Route “Browse Components” and the component statistic to the component docs.
- Replace unqualified pixel-parity and stateless-component claims with language
  supported by the implementation.
- Show the source revision in the footer, including a `+dirty` marker for local
  builds that do not exactly match the linked commit.
- Test public inventory facts against registries, source modules, and route data.

Verification:

- `npm run lint` (pass)
- `npm run typecheck` (pass)
- `npm test` (41 passed, 0 failed)
- `npm run build` (pass)
- Production browser snapshot (pass): corrected links, command, counts, and
  `source 878765a+dirty` metadata are present.

Manual follow-up after pushing:

- Point the GitHub repository homepage field at the canonical deployed docs URL
  and confirm the deployed footer revision matches that deployment's commit.

### 04. `test(browser): cover accessibility and visual fidelity`

Status: ready to commit

Purpose:

- Exercise keyboard, focus, ARIA, responsive, theme, and visual behavior in a
  production build.

Files:

- `.github/workflows/ci.yml`
- `.gitignore`
- `e2e/site.spec.ts`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `src/docs/component-page.ts`
- `src/docs/components/definitions/context-to-pagination.ts`
- `src/docs/components/definitions/popover-to-typography.ts`
- `src/docs/components/generated-example-sources.ts`
- `src/ui/dialog.ts`
- `src/ui/select.ts`

Changes:

- Add production Chromium journeys with axe WCAG 2.0/2.1 A/AA scans, desktop
  and mobile layout assertions, light/dark screenshots, source-integrity checks,
  and dialog keyboard/focus behavior.
- Run the browser suite in CI and retain its HTML report, screenshots, and traces
  for 14 days.
- Make code regions keyboard-scrollable and give the file-input example a label.
- Use Foldkit Dialog's published title, description, and initial-focus attribute
  groups; focus the close control (or the panel when absent), trap focus, and
  restore the trigger on Escape.
- Add a true disabled state to Select instead of visually simulating one with a
  low-contrast wrapper.
- Extend ESLint coverage to browser tests, scripts, and build configuration.

Verification:

- `npx playwright test` (5 passed, 0 failed)
- Axe scans: landing plus Button, Dialog, Input, and Select pass
- Dialog focus/open/Escape/restore journey: pass
- Mobile horizontal-overflow assertion at 390×844: pass
- Light desktop, dark desktop, and light mobile screenshots: captured as test
  report attachments
- `npm run check` (pass; 41 Node tests, production build succeeds)

### 05. `docs(parity): separate visual behavior and composition contracts`

Status: ready to commit

Purpose:

- Replace name-only parity with machine-readable fidelity dimensions.
- Detect upstream shadcn drift explicitly.

Files:

- `.github/workflows/upstream-parity.yml`
- `docs/component-parity.json`
- `docs/component-parity.md`
- `docs/component-parity.schema.json`
- `docs/component-roadmap.json`
- `docs/component-roadmap.schema.json`
- `docs/provenance.md`
- `docs/upstream-shadcn.json`
- `docs/upstream-shadcn.schema.json`
- `package.json`
- `scripts/generate-parity-contract.mjs`
- `scripts/sync-upstream-parity.mjs`
- `test/parity-contract.test.ts`

Changes:

- Refresh the focused upstream baseline to shadcn/ui
  `41bbc12cfd39ed8d9cb8da04275479ee7ecc0612` (2026-08-11): all 62
  upstream registry items are present, plus three Crease recipes.
- Generate one contract for each of 65 entries across visual, behavior,
  accessibility, composition, documentation, and registry dimensions.
- Use a closed status vocabulary and keep visual fidelity explicitly
  unverified until upstream-referenced snapshots provide evidence.
- Record the focused upstream registry/source Git blob ids and check them
  weekly against `main`, surfacing upstream drift without vendoring a checkout.
- Fail the main quality gate when the generated parity contract is stale or an
  upstream item is absent.

Verification:

- `npm run parity:check` (65 contracts pass)
- `npm run parity:upstream` (focused sources match `41bbc12c`)
- `npm run lint` (pass)
- `npm run typecheck` (pass)
- `npm test` (45 passed, 0 failed)

### 06. `feat(ui): add compound composition descriptors`

Status: ready to commit

Purpose:

- Add familiar shadcn-style composition seams while preserving explicit
  Foldkit models and messages.

Files:

- `docs/architecture.md`
- `docs/component-parity.json`
- `docs/component-roadmap.json`
- `e2e/site.spec.ts`
- `src/docs/components/definitions/context-to-pagination.ts`
- `src/docs/components/definitions/popover-to-typography.ts`
- `src/docs/components/generated-example-sources.ts`
- `src/ui/dialog.ts`
- `src/ui/sheet.ts`

Changes:

- Add additive Dialog and Sheet `layout` callbacks with bound header, title,
  description, footer, close, and initial-focus parts.
- Keep existing title/content/footer props intact for concise and existing
  callers; compound parts describe view structure only and do not hide Foldkit
  models, messages, updates, commands, or parent mapping.
- Apply the Foldkit primitive's published ARIA attribute groups through every
  title/description part and guarantee an initial focus target even when a
  layout omits a close control.
- Add concrete, production-readable compound examples for both components and
  promote their composition evidence in the parity contract.
- Fix Sheet documentation models whose render-only ID override caused focus
  commands to target a different element.

Verification:

- `npm run check` (pass; 420 stable examples, 45 Node tests)
- `npx playwright test` (6 passed, 0 failed)
- Dialog and Sheet compound layout, initial focus, Escape close, and return
  focus journeys: pass

### 07. `feat(create): implement installable style and theme presets`

Status: ready to commit

Purpose:

- Make style, icon, font, chart, radius, and menu choices affect generated
  output rather than only preview metadata.

Files:

- `docs/create-presets.md`
- `e2e/site.spec.ts` (Create preset journey hunks)
- `package.json` / `package-lock.json` (Iconify/XML dependencies and scripts)
- `registry.json`
- `registry/icons/registry.json`
- `registry/icons/{lucide,hugeicons,tabler,phosphor,remixicon}/icon.ts`
- `registry/icons/{lucide,hugeicons,tabler,phosphor,remixicon}/icon-nodes.ts`
- `scripts/generate-icon-adapters.mjs`
- `scripts/icon-adapter-map.json`
- `scripts/materialize-create-preset.ts`
- `scripts/verify-registry-install.mjs`
- `src/demo/board.ts`
- `src/demo/create-preset.ts`
- `test/create-preset.test.ts`
- `README.md` and `docs/registry.md` (preset guide link hunks)

Changes:

- Compile shadcn-compatible preset codes into a registry style item, CSS, and
  inspectable JSON manifest.
- Make all eight structural styles, base/theme/chart colors, five chart tokens,
  fonts, heading fonts, radius, menu accent, opaque/translucent menu color, and
  icon library affect generated output.
- Replace the fake icon selector with five registry adapters generated from
  licensed Iconify datasets. Every adapter implements the same 76-name Foldkit
  API with native SVG constructors.
- Add deterministic Shuffle behavior and copy complete registry JSON instead of
  an opaque token.
- Verify adapter drift, materialization, registry schemas, and real shadcn CLI
  overwrite/typecheck behavior in a clean consumer.

Verification:

- `npm run icons:adapters` (5 adapters × 76 icons verified)
- `npm test` (preset compiler, adapter selection, all config dimensions, and
  shuffle round-trip pass)
- `npm run preset:build -- --preset b27GcrRo --output <temp>` (three artifacts)
- `npm run registry:build` (all five adapter items pass)
- `npm run test:registry` (all 65 modules and each adapter install/typecheck;
  clean consumer build passes)
- Playwright Create Shuffle/output journey: pass

### 08. `docs: expand examples API references and discovery metadata`

Status: ready to commit

Purpose:

- Add concise standalone examples, concrete API tables, guides, search data,
  and LLM-readable documentation.

Files:

- `docs/api-reference.md`
- `docs/getting-started.md`
- `public/docs-index.json`
- `public/docs-index.schema.json`
- `public/llms.txt`
- `public/llms-full.txt`
- `scripts/generate-doc-metadata.mjs`
- `src/docs/component-page.ts`
- `src/docs/components/accordion.ts`
- `src/docs/components/calendar.ts`
- `src/docs/components/catalog.ts`
- `src/docs/generated-component-api.ts`
- `test/catalog-coverage.test.ts`
- `e2e/site.spec.ts` (API/discovery journey hunks)
- `package.json` and `README.md` (metadata/check/discovery hunks)

Changes:

- Generate API inventories from exported TypeScript declarations for every
  registry component and show those signatures beside runnable examples.
- Publish a schema-backed search/discovery index with install commands,
  dependencies, examples, sources, and API symbols for all 65 components.
- Publish concise and full LLM-readable documentation entry points.
- Add a first-install guide covering source ownership, stateless helpers,
  stateful Foldkit composition, and validation.
- Fail `npm run check` whenever generated documentation metadata drifts.

Verification:

- `npm run docs:metadata` (65 components verified)
- Node discovery/API coverage contract: pass
- TypeScript/lint: pass
- Playwright API table and static discovery endpoint journey: pass

### 09. `chore(project): add release security and maintenance policy`

Status: ready to commit

Purpose:

- Add changelog, security guidance, release procedure, contribution gates, and
  final upstream synchronization policy.

Files:

- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/component_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/pull_request_template.md`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `THIRD_PARTY_NOTICES.md`
- `package-lock.json` (compatible `nanoid` security refresh hunk)
- `docs/maintenance.md`
- `docs/releasing.md`
- `README.md` (governance link hunks)
- `src/demo/landing.ts` (complete third-party attribution hunk)

Changes:

- Define supported versions, private vulnerability reporting, registry threat
  boundaries, dependency cadence, compatibility, deprecation, and triage rules.
- Add evidence-driven issue/PR templates and repository ownership.
- Document a reproducible release sequence and add a tag-triggered workflow that
  uploads site, registry, browser, compatibility, and parity proof.
- Make CI use the complete drift/parity/source/type/test/build gate.
- Record all third-party icon and chart licenses and complete site attribution.
- Refresh the transitive `nanoid` lock entry from 3.3.16 to 3.3.18 to clear
  GHSA-2v37-7h3g-55p8 without changing declared dependency ranges.

## Final verification

Status: passed on 2026-08-11

- `npm run check`: pass (420 stable examples, 65 API metadata records, five icon
  adapters, 65 parity contracts, lint, types, 49 Node tests, production build)
- `npx playwright test`: 8 passed, 0 failed
- `npm run registry:build`: pass for theme, presets, libraries, 65 UI modules,
  and five icon adapters
- `npm run test:registry`: pass in a clean consumer; all five adapters installed
  and type-checked sequentially; production consumer build passes
- Axe WCAG A/AA scans: no violations on landing and flagship docs routes
- Visual snapshot review: light desktop, dark desktop, and 390 px mobile pass
- `npm audit --omit=dev`: 0 vulnerabilities
- Production docs bundle: 1,839.44 kB JS / 490.67 kB gzip; existing chunk-size
  warning remains and is recorded as future performance work

No Git commits were created in this environment.

### 10. `docs(project): add quality initiative handoff`

Status: ready to commit

Purpose:

- Preserve the complete implementation context, operating instructions, known
  limitations, verification evidence, and recommended follow-up work for the
  next maintainer or authenticated development environment.

Files:

- `HANDOFF.md`
- `COMMIT_JOURNAL.md`

Verification:

- Handoff cross-references checked against the final repository state.
- No Git commit created; base revision remains `878765a`.

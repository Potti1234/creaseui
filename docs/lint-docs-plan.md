# Plan: lint rule documentation (one page per rule, like component docs)

## Goal
Give every rule a docs page in the same style as the component pages. Each page shows:
1. **Bad pattern:** the code an agent or developer tends to write, plus a live preview of the UI it produces (for example, a hand-rolled button that ignores the theme).
2. **How the rule catches it:** the exact ESLint/CLI diagnostic with the offending range highlighted, and the reason behind it.
3. **Good pattern:** the fixed code using the installed Crease component, plus a live preview of the correct UI.
4. **Variations:** the edge cases the rule also covers (aliases, barrels, conditionals), what it does *not* catch, and how to configure or allow-list it.

Each renderer site shows its own examples: the Tailwind site uses `class`/Tailwind, the StyleX site uses `stylex.create`/`layoutStyle`, and the Pleat site uses `Style.make`/`layoutStyle()`.

## Rules to document (about 18 pages, grouped)
**Strict consumer rules (`crease-default-v1`, `packages/lint/rules/strict`)**
- `no-raw-controls`: native button/input/select built with `h.*`
- `no-raw-composition`: raw layout, headings, text, links, lists, tables and SVG in app views
- `no-unapproved-renderer`: headless `@foldkit/ui` views, implementation-only exports, React/lit/etc.
- `no-application-styles`: `h.Class`/`h.Style`, clsx/cva, StyleX/Pleat authoring in app code, DOM style mutation
- `component-contract`: visual `class` tokens, height/size overrides, non-placement `layoutStyle`, unknown variants, bare string children
- `no-unverifiable-ui`: computed builders, `as` casts, untyped linting

**Renderer and component-authoring rules (`packages/lint/rules`)**
- `crease/no-component-restyle`, `crease/require-static-class`, `crease/no-foldkit-inline-style`
- `crease/stylex-component-contract`, `crease/no-stylex-escape`
- `crease/pleat-prop-limits`
- `crease/prefer-composition-primitives`
- `shadcn/no-raw-colors`, `shadcn/no-arbitrary-values` (as configured by Crease)

**CLI checks (not ESLint rules)**
- `creaseui-lint css`: global CSS policy (component selectors in global CSS, `@layer`/`@media`/nesting, registry CSS)
- Theme grammar (`strict/theme`): invalid colours, `color-mix`, `calc`, undefined theme variables
- `doctor`: coverage (ignored files, components installed but missing from `crease.lock.json`, rendering exports with no rules), `foundations` (for example, a component that claims to build on Sidebar must actually render Sidebar)
- `scope --baseline`: loosened ownership or lint config

## Site structure
- New routes `/docs/lint` (overview and a table of all rules) and `/docs/lint/<rule-id>`, with a **Lint rules** group in the docs sidebar under Get Started and Theming.
- A `LintRuleDefinition` per rule in `src/docs/lint/rules/<rule-id>.ts`, mirroring the component `pages/<slug>/{shared,tailwind,stylex,pleat}.ts` split. It holds metadata (id, category, severity, what it protects) and a list of cases. Each case has `bad` and `good` sources per renderer, the expected diagnostic, and preview programs.
- **Previews:** reuse the component page machinery (`definePreviewProgram`, the per-renderer preview manifests, the preview frame and the code block). The bad preview renders the raw pattern inside docs-owned source, which is allowed because docs files are implementation files. That shows what goes wrong visually: theme ignored, dark mode broken, focus ring missing.
- **Diagnostic panel:** a new docs component that shows the bad code with the reported line and column underlined, the message, the rule id and a link to the fix. It is a static view; no ESLint runs in the browser.

## Keeping the docs honest (generated, never hand-written messages)
- A script `scripts/generate-lint-docs.mjs` runs the real `@creaseui/lint` over every `bad` and `good` source in a temporary strict project, with the same setup as the fresh-project lint check.
- It writes `src/docs/lint/generated-diagnostics.ts` with the exact message, line and column for each case.
- A test (`test/lint-docs.test.ts`) fails when any case changes:
  - a `bad` case stops failing with its documented rule;
  - a `good` case reports anything;
  - a rule exists with no docs page.
- It is added to `npm run check` (like `docs:metadata`) so a rule change can't leave the docs out of date. The same output feeds `public/docs-index.json` / `llms-full.txt`, so agents can look rules up too.
- Cases come from the existing rule tests and fixtures (`packages/lint/test/*`, `fixtures/strict-app`, `fixtures/tutorial-attempt-01`), so every documented example is already a tested regression.

## Slices (one commit each)
1. Routing, sidebar group, overview page with the rule table (ids, category, one-line purpose).
2. Rule page view: header, bad/good sections, diagnostic panel, per-renderer code, previews, on Tailwind/StyleX/Pleat.
3. Diagnostics generator, generated file, check and test wiring.
4. Pages for the six strict rules (the most common agent mistakes first: raw controls, application styles, component contract).
5. Pages for the renderer and component-authoring rules.
6. Pages for the CLI checks (css, theme, doctor, scope). These show terminal output instead of ESLint output.
7. Docs search and LLM metadata, then e2e: every rule page renders on the three sites, previews mount, no console errors.

## Open questions for you
1. Should the bad previews really render the broken UI live (most convincing), or only show code and a static screenshot?
2. Should the component-authoring rules (`no-component-restyle`, `stylex-component-contract`, `pleat-prop-limits` and so on) sit in their own "For component authors" section, separate from the app rules?
3. Should rule pages link back from the ESLint diagnostic? `meta.docs.url` would point at `https://creaseui.com/docs/lint/<rule>` (or the matching StyleX/Pleat site), so a message in the editor opens its page.

## Decisions (Lukas, 2026-10-17)
- Bad examples render live.
- Rules are grouped separately in the sidebar, like the component groups (App rules / Component-author rules / CLI checks).
- No docs link in lint messages (do not change `meta.docs.url`).

## Progress
- Branch `devin/1792334251-lint-rule-docs`.
- `src/route.ts`: added `LintRules` and `LintRule { rule }` routes, `lintRulesPath()` and `lintRulePath(rule)`. The parser order is lintRule, then lintRules, before componentDocs.
- Still to wire:
  - `src/app/page.ts`: Page union entries plus route → page init at ~line 168, modelled on `GettingStarted({ codeBlock: CodeBlock.init() })`.
  - `src/main.ts`: view match at ~1352 (GettingStarted/Theming), page title at ~1392, the `GotDocsGuideCodeBlockMessage` guard at ~775.
  - `src/site/chrome.ts`: the Docs nav `active` condition (~line 30).
  - Docs sidebars: guide links at `src/docs/component-page.ts` ~396, `src/site/docs.{stylex,pleat}.ts` ~984/1016, and `src/docs/getting-started-content.ts` `guideLinks` ~744.
- Created src/docs/lint/rules.ts (rule groups and ids). main.ts lintDocsView, chrome active state, and lintView exports in the 3 getting-started view files are wired; still to write: src/docs/lint-content.ts view(rule, h, styles, codeBlock).
- Wrote minimal src/docs/lint-content.ts (sidebar with guide links + lint groups, overview lists, rule page shows summary). Next: rule page design (bad/good live previews per renderer, diagnostic panel), generator script, real cases from packages/lint/test.
- Pushed d12a3ef (routing + overview).
- Generator design: reuse the `lint(code, file, context)` helper pattern from `packages/lint/test/strict.test.js` lines 1-50 (an ESLint `Linter` flat config with the `crease` plugin, the tseslint parser, `settings.creaseui` = the strict context fixture defined at the top of that test). For each documented case: lint `bad` (expect the rule id with its message, line and column) and `good` (expect no messages). Write the results to `src/docs/lint/generated-diagnostics.ts`.
- Next session step: the rule page (task 68). Each rule has cases `{ title, bad: {tailwind, stylex, pleat}, good: {...}, preview programs }`. The bad previews render live in docs-owned source.
- e9c9170: generator + cases (src/docs/lint/cases.ts), `npm run lint-docs:check` in `npm run check`, oxfmt ignores the generated file.
- Rule page design: `src/docs/lint/previews.ts` holds the shared bad/good preview renderers and takes a per-renderer kit `{ button adapter, styles }`.
  - Kits: `src/docs/lint/kit.tailwind.ts`, `src/site/lint-kit.{stylex,pleat}.ts`.
  - `@/ui/heading`, `@/ui/typography` and `@/ui/code-block` are vite-aliased per site.
  - `lint-content.ts` renders the cases filtered by `renderer` from `@/site/config`; diagnostics keyed by `rule/id/renderer`.
- Written (uncommitted): previews.ts, kit.tailwind.ts, site/lint-kit.{stylex,pleat}.ts, rule page in lint-content.ts, kits passed from the 3 getting-started view files. Next: tsc, eslint, screenshots, commit.
- Commits: ab37dce rule pages, 9342e43 CLI pages, 74cbe68 search+e2e, next: docs/lint-rules.md + llms. Then build + test:sites lint-docs spec + full npm run check + PR.

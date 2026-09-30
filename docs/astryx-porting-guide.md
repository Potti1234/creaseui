# Porting an Astryx component to Crease UI

The authoritative checklist for turning a
[facebook/astryx](https://github.com/facebook/astryx) component into a Crease UI
component. Follows `docs/component-authoring.md` — read it too.

The astryx source of truth is a clone of `github.com/facebook/astryx`:

- Component implementation: `packages/core/src/<Name>/<Name>.tsx` (+ sibling
  files: `<Name>Context.ts`, hooks, sub-components)
- Component docs metadata: `packages/core/src/<Name>/<Name>.doc.mjs`
- Examples (authoritative — port these EXACTLY):
  `packages/cli/assets/templates/blocks/components/<Name>/<Example>.tsx`
  with names/descriptions in the sibling `<Example>.doc.mjs`
- Lab components live in `packages/lab/src/<Name>/` with examples under the same
  `templates/blocks/components/` tree.

## Visual contract

Pixel-faithful to astryx's *structure* (sizes, spacing, radii, states, motion)
but expressed with **Crease UI design tokens** — do NOT introduce astryx's
`colorVars`/`spacingVars`/`radiusVars`. Map astryx's token usage to the nearest
Crease UI token:

- Surface/text colors → `--background`, `--card`, `--foreground`,
  `--muted`/`--muted-foreground`, `--primary`/`--primary-foreground`,
  `--secondary`/`--secondary-foreground`, `--accent`, `--destructive`,
  `--border`, `--input`, `--ring`, `--chart-N` (already exposed through
  `src/stylex/tokens.stylex.ts` and the Tailwind theme).
- Radii → `--radius` scale (`rounded-md`, `tokens.controlRadius`, etc.).
- Status hues → reuse the existing soft-surface tokens
  (`--stylex-soft-destructive-surface`, `alertSuccess`, `alertWarning`, …) or
  `color-mix(in oklab, var(--X) P%, transparent)` in the same style as
  `src/stylex/tokens.stylex.ts`.
- Spacing/sizes: copy astryx's computed px values (a 32px control stays 32px).

**Hard lint contract for `src/stylex/*.ts`** (`@stylexjs/valid-styles`
propLimits, errors not warnings):

- Every color property (`color`, `backgroundColor`, `borderColor`, `fill`,
  `stroke`, `*Color`) may only be `'transparent'`, `'currentColor'`, or a
  `tokens.*` member from `tokens.stylex.ts` (their values are `var(--x)`
  references, which is why they pass — `stylex.defineVars` locals with literal
  colors still get resolved to the literal and FAIL).
- `borderRadius`: `'0px'`, `'50%'`, or a shared token
  (`foundationTokens.radius*`).
- `animationDuration`/`animationTimingFunction`/`transitionDuration`/
  `transitionTimingFunction`/`cursor`: ONLY `interactionTokens.*` members from
  `interaction-tokens.stylex.const.ts` (`motionLoopFast/Medium/Slow`,
  `motionFast/Moderate/Slow`, `motionNone`, `easingStandard`, …). Keyframes go
  in `animationName` (see `skeleton.ts`/`spinner.ts` for the
  prefers-reduced-motion pattern).
- `@stylexjs/sort-keys` enforces property ordering — run
  `npx eslint --fix <files>` on everything you write.

If a genuinely needed semantic token does not exist in `tokens.stylex.ts` (a
named CSS var, a `color-mix`, a fixed oklch like a status ink), use the closest
existing token and leave a `/* PORT-NOTE: needs token '<name>' = <value> */`
comment at the usage site plus a line in your final report — the integrator
adds it to `tokens.stylex.ts` in one place. Do NOT edit `tokens.stylex.ts`,
`contracts.ts`, `style.ts`, `foundations-tokens.stylex.ts`,
`interaction-tokens.stylex.const.ts`, or any file owned by another batch —
those files are merge hotspots. (You DO edit the two registration manifests —
`pages/index.ts` and `stylex-provider-manifest.ts` — inserting your entries in
alphabetical order so concurrent batches merge cleanly.)

## File inventory for component `<slug>` (kebab-case)

1. `src/ui/<slug>.ts` — Tailwind renderer. Public API: either a stateless
   render helper `export const <name> = <Msg>(props, h) => Html` or a stateful
   submodel (`Model`, `Message`, `init`, `update`, optional `OutMessage`,
   `subscriptions`). Start every file with a provenance comment:
   `/* Ported from Meta Astryx <Name> (<path>) — examples and visual spec adapted to Crease UI tokens. */`
2. `src/stylex/<slug>.ts` — StyleX renderer, same API surface. Use
   `stylex.create`, `tokens` from `./tokens.stylex`, `foundationTokens`,
   `className` from `./style`, `ComponentLayoutStyle` for `layoutStyle` props.
3. `src/lib/<slug>.ts` — ONLY when the behavior model is renderer-neutral and
   substantial (state machines, reducers, pure logic). Stateful components may
   instead keep Model/update in `src/ui/<slug>.ts` — match whatever the closest
   existing component does.
4. `src/docs/components/pages/<slug>/` — four files:
   - `index.ts` — `authoredPage({ slug, title, kind, previewProgram, definition })`
     with `definition.examples = <slug>Examples('tailwind')` and
     `definition.stylexExamples = <slug>Examples('stylex')`. `kind` is
     `'helper'` (stateless) | `'submodel'` (foldkit state) | `'recipe'`
     (composition). Fill `description`, `architecture`, `styling`,
     `accessibility`, `apiHref` (point at the astryx source file URL on
     github.com/facebook/astryx), `keyboard` when the component has keybindings.
   - `shared.ts` — typed fixtures (one per astryx example block, same example
     names/order/content) + `<slug>Examples(renderer)` producing
     `ReadonlyArray<DocsExample>` via `staticComponentApplication` (generates
     the displayed code). Mirror the `badge` page.
   - `tailwind.ts` — `definePreviewProgram` rendering each fixture.
   - `stylex.ts` — `StyleXExamplePreviewProvider` + stylex code generator.
   - For non-interactive components you may pass `previewMode: 'static'` and
     give each `DocsExample` a `staticPreview` instead of writing a program —
     check how existing static pages do it first.
5. Register the page in `src/docs/components/pages/index.ts` — import +
   `authoredPages` entry (alphabetical).
6. Register the StyleX preview provider in
   `src/docs/components/stylex-provider-manifest.ts` — import
   `<slug>StyleXPreview` and add
   `installStyleXExamplePreviewProvider('<slug>', <slug>StyleXPreview);`.
7. `src/docs/component-page.ts` — add the Title-Case display name to the
   `COMPONENTS` array (sorted, e.g. `'Status Dot'` between `'Spinner'` and
   `'Switch'`). `documentedSlugs` is derived from this list; every docs page
   must have a route here and vice versa.
8. `src/stylex/index.ts` — add `export * as <PascalName> from './<slug>.js'`
   (alphabetical) AND `'<slug>'` in `STYLEX_COMPONENT_NAMES` (same order).
   `test/stylex-catalog.test.ts` enforces the closed tuple, namespace exports,
   and that `src/stylex/<slug>.ts` exists for every registry item.
9. `test/stylex-catalog.test.ts` — two shared edits per new component:
   - `intentionallyRemovedStylingExports`: if your `src/ui/<slug>.ts` exports a
     cva `<name>Variants` value and `<Name>Variants` type, add
     `['<slug>', new Set(['<Name>Variants', '<name>Variants'])]` (StyleX drops
     cva; every other ui export must exist in the stylex file — the test
     diffs the two modules' export names).
   - `assert.equal(componentNames.length, N)` — bump N by your batch size
     (base = 66; the integrator reconciles the final total at merge).
10. `test/parity-contract.test.ts` — insert each new `'<slug>'` (sorted) into
    the hardcoded `creaseOnlyRecipes` array.
11. `src/lib/project-facts.ts` — bump `COMPONENT_COUNT` by your batch size
    (base = 66; reconciled at merge).
12. Add a focused `test/<slug>.test.ts` for any stateful logic (match the
    style of existing tests).

### `src/stylex/<slug>.ts` additional constraints (test-enforced)

- No `class-variance-authority`, no `@/lib/utils`, no `h.Class('…')` string
  literals — StyleX modules must not fall back to Tailwind/class strings.
- Prop-parity test: public prop types present in BOTH ui and stylex must keep
  the same prop names, except `class` (ui) which maps to `layoutStyle`
  (stylex). Keep the two `*Props` types aligned otherwise.
- Do not export public string-based class styling props.

### Docs-page constraints (test-enforced)

- Every page needs ≥ 2 `dedicatedExampleTitles` (the astryx example blocks —
  you will almost always have ≥ 2; a single-example astryx component is NOT
  acceptable alone, combine its real astryx demos or flag it in your report).
- `staticComponentApplication` AUTO-emits `import * as <Name> from
  '@/ui|stylex/<slug>'` — `componentImports` carries only EXTRA imports
  (stylex/styles/etc). Never re-emit the component import: the docs-example
  typecheck fails with `Duplicate identifier`.
- `exactOptionalPropertyTypes` is on: `componentImports` must be a `string`
  (use the `.filter(Boolean).join('\n')` pattern from `badge/shared.ts`), never
  `undefined`.
- If `previewMode: 'static'`, every `DocsExample` needs `staticPreview` set.
- `rendererExamplesAreInParity` — tailwind and stylex examples are generated
  from the same fixtures; keep them 1:1.

## Examples must be astryx's examples

The `shared.ts` fixtures must reproduce each astryx example block
(`<Example>.tsx`) under `templates/blocks/components/<Name>/`: same demo
content, same option combinations, same example order. Example titles use the
`<Example>.doc.mjs` `name`/`displayName`; `description` comes from the doc's
`description`. Do not invent extra shadcn-flavored examples — the point is a
1:1 example mapping so users can compare docs side by side.

## Wiring + checks (run before pushing)

```bash
npm run icons:generate            # only if you referenced new lucide icon names
npm run icons:adapters:generate
npm run registry:generate         # rebuilds src/ui/registry.json
npm run parity:generate           # rebuilds docs/component-parity.json
npm run docs:metadata:generate    # if it exists; otherwise npm run docs:metadata must pass
npm run stylex:adoption:generate  # refreshes docs/stylex-adoption.json
npm run lint                      # eslint; new files must be clean
npm run typecheck
npm test                          # unit + scene tests
npm run build
```

`npm run check` is the full chain — run it before the branch is done.

## API rules (from component-authoring.md)

- Plain typed config objects for helpers; `Model`/`Message`/`init`/`update`
  for stateful controls; state lives in the owning Foldkit model.
- `Option` for fallible operations and optional state crossing a boundary.
- No `null`/`undefined` as ad-hoc failure channels.
- Keyboard, focus, dismissal, disabled, dark-mode behavior must exist where the
  component needs it; astryx's a11y specs (`.doc.mjs` usage/accessibility
  sections, `.spec.md` files) are the reference.
- Keep parity between the two renderers: same props, same DOM roles/states;
  `rendererExamplesAreInParity` is enforced for docs examples.

## What NOT to do

- No React/JSX — foldkit `HtmlBuilder` only.
- No new npm dependencies without asking; prefer `lib/` utilities, `effect`,
  `foldkit`, `@foldkit/ui` primitives already in the repo.
- No edits to shared files outside your batch (see Visual contract).
- Do not copy astryx's StyleX token names or class names
  (`astryx-*`) — translate to Crease UI tokens/utilities.

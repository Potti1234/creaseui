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

If a genuinely needed token is missing, define it *locally* in the component's
stylex file (stylex.defineVars or plain values referencing the CSS vars). Do
NOT edit `src/stylex/tokens.stylex.ts`, `contracts.ts`, `style.ts`,
`foundations-tokens.stylex.ts`, or any file owned by another batch — report the
need instead.

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
7. Registry/examples of consumer-visible behavior tests: add a focused
   `test/<slug>.test.ts` for any stateful logic (match the style of existing
   tests).

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

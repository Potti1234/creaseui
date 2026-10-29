# Strict consumer rules (`crease-default-v1`)

`creaseui(options)` returns flat-config entries that keep application views on
installed Crease components. Raw rendering is allowed only in the exact files
that `crease.lock.json` (or a reviewed `extensions` entry) registers.

```js
import { fileURLToPath } from 'node:url'
import { creaseui } from '@creaseui/lint'

export default [
  ...creaseui({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    renderer: 'pleat',
    files: ['src/**/*.{ts,js}'],
    tsconfig: './tsconfig.json',
    manifest: './crease.lock.json',
  }),
]
```

Entries: `strict/setup` (typed parser), `strict/application` (all six rules),
`strict/implementation` (registered raw-rendering files: renderer rules,
`no-raw-controls`, `no-raw-composition`, `component-contract`,
`no-unverifiable-ui`), `strict/theme`, `strict/setup-entry`
and, only with `preset: 'migration'` plus `migrationFiles`, `strict/migration`
(same rules at warning level).

A file record with `rawRendering: true` grants raw rendering to the whole
file. Add `rawElements` to narrow the grant to the native elements the
implementation needs; any other raw element in that file is reported:

```json
{ "path": "src/design/glyph.ts", "role": "renderer", "rawRendering": true, "rawElements": ["svg", "path"] }
```

An export record may list `foundations`, the contracts it builds on
(`"foundations": ["navigation.sidebar"]`). `doctor` resolves the calls in that
export with the type checker and fails unless each foundation is rendered by an
installed export with that contract, or the export is that contract's in-place
adaptation. An unused import, a comment or a name does not count. Exports
without `foundations` (new domain patterns such as an issue row) are not
affected; semantic reinvention that is not declared still needs review.

`creaseui-lint css` (also run by `doctor`) parses every stylesheet under `src`,
follows local imports and applies the global CSS policy: framework and font
imports, token definitions and bindings, and a narrow base/reset are allowed;
selectors that reach components (classes, slots, roles, ids, pseudo states)
fail, through `@layer`, `@media`, `@supports` and nesting. Stylesheets
registered in the manifest are component CSS and must start from their own
class or `data-slot`. Unparseable or unresolved input is unverifiable (exit 2).

`creaseui-lint doctor` exits 2 with `coverage feature-only` when a registered
implementation or UI module is ignored by the ESLint config, loses its Crease
rules or has rendering exports without a manifest contract.

Configuration problems (relative `rootDir`, renderer conflicts, unsupported
schema/policy versions, globbed, missing, outside-root or symlinked-out paths,
case-only duplicates, conflicting owners, raw grants on theme/setup files)
throw `CreaseConfigError`; they never produce a clean lint result.

## Product rules

`creaseui()` accepts `rootDir`, `renderer`, `files`, `tsconfig`, `manifest`,
`extensions`, `preset`, `typeInformation` and `migrationFiles`; `policy` pins
the receipt's policy version. There is no option that forbids a prop, narrows
a variant list, or scopes placement per product. Until one lands, the
supported routes are the receipt and a plain ESLint config module:

- **Narrow variants in `crease.lock.json`.** An export record's `variants`
  lists the values `component-contract` accepts per prop. Removing a value
  the product does not use turns every call site that passes it into an
  error — for example "feature code may not pass `variant: 'destructive'`
  to `badge`":

  ```json
  {
    "file": "src/design/badge.ts",
    "name": "badge",
    "contract": "display.badge",
    "variants": { "variant": ["default", "secondary", "outline"] }
  }
  ```

  A receipt edit is a design-system change; `creaseui-lint scope` reports it
  against the trusted baseline.

- **Spread product rules after `creaseui()`.** Core rules
  (`no-restricted-imports`, `no-restricted-syntax`,
  `no-restricted-properties`) and custom plugins compose like anywhere else:

  ```js
  import { creaseui } from '@creaseui/lint'

  const product = {
    name: 'product/policy',
    files: ['src/features/**/*.{ts,js}'],
    rules: {
      // Feature code imports the public surface, never behavior internals.
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/design/behavior/*'],
          message: 'Behavior modules are implementation; import the component.',
        }],
      }],
      // Feature code may not pass `variant` to badge at all: the product's
      // tone mapping owns the choice, not the page.
      'no-restricted-syntax': ['error', {
        selector:
          'CallExpression[callee.name="badge"] Property[key.name="variant"]',
        message: 'Pass the product tone prop, not variant, to badge.',
      }],
    },
  }

  export default [
    ...creaseui({ rootDir, files: ['src/**/*.{ts,js}'] }),
    product,
  ]
  ```

A validated `policy` option carrying declarative product restrictions
(forbidden props, per-component placement allowances, structured-content
constraints) is future work — see
`docs/plan/design-system-policy-and-ai-plan.md`, "Common restrictions through
configuration". An unknown `policy` value today is a `CreaseConfigError`,
never a silent no-op.

## no-raw-controls

Native `button`, `input`, `textarea`, `select`, `option`, `optgroup` and
`datalist` built with a Foldkit builder, including `h.keyed('button')`,
aliases, destructuring and constant computed members. The diagnostic names the
installed replacement (`Use button from './design/button'`) or the
`npx shadcn@latest add Potti1234/creaseui/<item>` instruction.

## no-raw-composition

Every other classified tag: layout, sections, headings, text, links, lists,
forms, tables, separators, media, SVG/MathML (adapter contracts) and
`customElement` constructors.

## no-unapproved-renderer

Headless `@foldkit/ui` views (`view` exports, `Dialog.view`), receipt exports
with `visibility: "implementation"`, and external render providers (snabbdom,
lit, preact, react, vue, solid, svelte, hyperscript).

## no-application-styles

`h.Class`, `h.Style`, `h.InnerHTML`, `Attribute`/`Prop` with class/style (or an
unresolvable name), stylesheet imports outside a `setup` file, renderer
authoring APIs (`@stylexjs/stylex`, `@pleat/*`), class helpers (clsx,
tailwind-merge, cva) and DOM style mutation (`innerHTML`, `style.*`,
`classList`, `setAttribute('style')`, `insertAdjacentHTML`,
`document.createElement`).

## component-contract

Calls of receipt exports (resolved through tsconfig paths, relative imports and
barrel re-exports): `style`/`css`/`className`/`attributes` props, Tailwind
`class` tokens that are not placement utilities, `class` on StyleX/Pleat,
`layoutStyle` values that are not `layoutStyle()`/`layoutWhen()` or contain
non-placement properties, variant values outside the receipt's `variants`,
and bare string children in Stack/Grid/Center/Box/Inline.

## no-unverifiable-ui

Missing type information (strict linting is typed), missing `creaseui()`
settings, computed builder access, unresolved `keyed` tags, builder rest
patterns, opaque or `as`-asserted props and forged layout values.

## Supported data flows and limits

Lexical bindings (scope manager), `const` aliases, object/parameter
destructuring, local type aliases to `HtmlBuilder`, inferred parameters through
the TypeScript checker, constant computed keys, object spreads with overwrite
order, conditional branches and barrel re-exports. Not supported (reported as
unverifiable rather than allowed): mutation-based flows, values from function
returns, dynamic imports and general whole-program taint.

## Enforcement changes and what lint is not

`creaseui-lint scope --baseline <trusted ref>` compares the enforcement inputs
(`crease.lock.json` ownership, raw grants, `rawElements`, contracts and
foundations; the creaseui-lint and ESLint configs; `.eslintignore`;
`package.json` scripts; `AGENTS.md`) against a trusted commit. A feature change
that touches them exits 1. A reviewed design-system change reruns it with
`--allow-enforcement-changes`, which lists the same changes for separate review;
consumers stay free to change their own design system.

The layers are different things:

- **Lint and `doctor`** check the code they are given. They run inside the
  patch, so a patch can edit them; they are not a sandbox.
- **Agent instructions** (`AGENTS.md`, skills) steer the agent. They are not
  enforced.
- **Runner filesystem limits** (read-only paths, separate checkouts) are the
  only thing that stops a process from editing files; configure them in the
  runner if you need them.
- **Protected integration checks** run `scope` from a CI job or branch
  protection the patch cannot change, against the merge base. That is where a
  feature task is actually held to its scope.

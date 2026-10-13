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
`component-contract`, `no-unverifiable-ui`), `strict/theme`, `strict/setup-entry`
and, only with `preset: 'migration'` plus `migrationFiles`, `strict/migration`
(same rules at warning level).

Configuration problems (relative `rootDir`, renderer conflicts, unsupported
schema/policy versions, globbed, missing, outside-root or symlinked-out paths,
case-only duplicates, conflicting owners, raw grants on theme/setup files)
throw `CreaseConfigError`; they never produce a clean lint result.

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

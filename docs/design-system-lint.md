# Agent-first design-system linting

Status: implemented
Last verified: 2026-09-15
Package: `@creaseui/lint`
Upstream inspiration: [`@shadcn/lint`](https://github.com/shadcn-ui/lint)

## Purpose

Crease UI has two styling renderers and a non-JSX component API. Tailwind
components receive a `class` property, StyleX components receive constrained
`layoutStyle` properties, and both are called as Foldkit functions:

```ts
button({ class: 'mt-4' }, h)
Card.cardTitle({ class: 'text-lg' }, h)
StyleXButton.button({ layoutStyle: styles.fullWidth }, h)
```

`@shadcn/lint` supplies excellent Tailwind theme analysis, rule contracts,
and agent-oriented diagnostics, but its component ownership analysis targets
JSX and `className`. `@creaseui/lint` adds the Foldkit call-site model and
combines it with the appropriate styling-engine linter.

The goal is not merely to reject code. A diagnostic should tell an agent which
existing decision to use: parent layout, a named variant, a component size,
a semantic token, or a constrained composition primitive.

## Architecture

The package lives in `packages/lint` and exports one ESLint plugin plus three
flat-config helpers:

| Helper | Responsibility |
| --- | --- |
| `tailwind()` | Foldkit component ownership plus `@shadcn/lint` theme-token and arbitrary-value checks. |
| `stylex()` | Foldkit StyleX component contracts plus the official `@stylexjs/eslint-plugin` rules. |
| `constrainedStylex()` | A closed page-composition boundary with no raw StyleX calls, inline styles, or raw structural builders. |

The Foldkit collector understands both named and namespace imports, resolves
the first configuration-object argument, follows same-file variables one hop,
and reads finite conditionals and common class merge helpers.

```ts
import { button as action } from '@/ui/button'
import * as Card from '@/ui/card'

action({ class: 'mt-4' }, h)
Card.cardContent({ class: model.compact ? 'p-2' : 'p-4' }, h)
```

## Rules

### Shared Foldkit rules

| Rule | Contract |
| --- | --- |
| `crease/no-component-restyle` | Tailwind component calls accept only the categories or class patterns declared by their contract. Margin, dimensions, and positioning are parent layout; padding and gap remain component-owned spacing. |
| `crease/require-static-class` | A component class must be statically readable, a same-file constant, or a finite conditional. Runtime-generated classes cannot be verified or reliably extracted by Tailwind. |
| `crease/no-foldkit-inline-style` | Rejects `h.Style(...)` where a strict composition boundary opts into the rule. Dynamic component internals may keep reviewed adapters. |

### StyleX rules

| Rule | Contract |
| --- | --- |
| `crease/stylex-component-contract` | A StyleX component cannot receive `class`; `layoutStyle` and `*LayoutStyle` values must be statically extracted StyleX references. |
| `crease/no-stylex-escape` | Controls where direct `stylex.create()` and `stylex.props()` calls are allowed. Constrained pages allow neither. |
| `crease/prefer-composition-primitives` | Constrained pages use `Box`, `Stack`, `Inline`, `Grid`, `Text`, or `Section` rather than raw layout builders. |

The StyleX preset also enables extension enforcement, selector validation,
conflicting-property detection, unused-style detection, deterministic key
ordering, supported shorthands, and semantic property limits. Crease's limits
require tokens for colors, radii, shadows, motion, easing, and cursors.

### Upstream Tailwind rules

The Tailwind preset enables these upstream rules with all-string scanning so
Foldkit configuration strings are still checked outside JSX:

- `shadcn/no-raw-colors`
- `shadcn/no-arbitrary-values`

Component-specific restyling and static-value enforcement use the Crease
rules because they require Foldkit call recognition. Unknown-class validation
remains Tailwind's build responsibility until the upstream Tailwind oracle
offers a public API that a Foldkit collector can call without duplicating it.

## Crease repository policy

`eslint.config.js` applies four tiers:

1. Tailwind component implementations are strict about semantic colors but
   may contain reviewed structural arbitrary values and do not lint their own
   internal component composition as consumer restyling.
2. Tailwind demos, blocks, and documentation examples use Foldkit component
   contracts at warning level.
3. StyleX component implementations, boards, cards, blocks, and chart pages
   use the strict StyleX preset and semantic property limits.
4. Generated/authored StyleX documentation examples use the StyleX structural
   rules at warning level without the internal-component token limits.

The StyleX type and repository checks remain complementary:

- `ComponentLayoutStyle` limits public overrides to parent-layout properties.
- `check-stylex-contract-flow.mjs` follows those properties through wrappers
  and requires them to be merged last.
- `check-stylex-governance.mjs` controls suppressions, portal safety, and CSS
  fallback declarations.
- `check-constrained-composition.mjs` retains repository-specific structural
  checks that are intentionally more precise than a portable ESLint rule.

## Adoption and warning ratchet

The initial Tailwind and documentation-example audit has 386 warnings. They
represent existing appearance overrides, arbitrary values, and StyleX example
ordering—not 401 newly introduced build failures.

`npm run lint:design-system` uses `--max-warnings 386`. CI therefore fails if
new work increases the count. When violations are fixed, lower the number in
`package.json`; never increase it merely to make CI green.

New constrained StyleX composition is already error-level and has no warning
allowance. New reusable components should likewise be introduced under an
error-level file override before broad adoption.

## Configuration examples

### Tailwind Foldkit application

```js
import tseslint from 'typescript-eslint'
import { tailwind } from '@creaseui/lint'

export default tseslint.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser },
  },
  tailwind({
    files: ['src/pages/**/*.{ts,tsx}'],
    componentImports: ['^@/ui(?:/|$)'],
    contracts: [
      { pattern: '^(CardContent|CardFooter)$', allow: ['layout', 'spacing'] },
      { pattern: '^Avatar$', allow: ['layout', 'size-*'] },
    ],
  }),
)
```

### StyleX Foldkit application

```js
import tseslint from 'typescript-eslint'
import { constrainedStylex, stylex } from '@creaseui/lint'

export default tseslint.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser },
  },
  stylex({
    files: ['src/stylex/**/*.{ts,tsx}'],
    componentImports: ['^@/stylex(?:/|$)'],
    styleResolution: 'property-specificity',
    allowCreateIn: ['/src/stylex/'],
    allowPropsIn: ['/src/stylex/style\\.ts$'],
  }),
  constrainedStylex({ files: ['src/pages/**/*.{ts,tsx}'] }),
)
```

## Adding or changing a contract

Use a named component variant for reusable appearance. Add a contract only
when the caller genuinely owns that styling decision.

```js
{
  pattern: '^CardTitle$',
  allow: ['layout', 'typography'],
}
```

An `allow` list is complete for that component. Include `layout` explicitly
when parent positioning should remain available. Class globs such as `w-*`
and exact classes such as `mt-4` are supported alongside categories.

Every policy change should include rule tests and at least one valid and one
invalid example. Run:

```sh
npm run test:lint-package
npm run lint:design-system
npm run check
```

## Exceptions

Prefer a named variant or semantic token over a suppression. If an exception
is required, keep it on the next line, name the exact rule, and include the
repository's required `-- reason: ...` justification.

```ts
// eslint-disable-next-line crease/no-component-restyle -- reason: partner-owned branding is contractually fixed
partnerBadge({ class: 'bg-[#ff5500]' }, h)
```

Suppression changes are design-system changes and require review. StyleX
suppression and fallback governance continues to be enforced by
`npm run lint:stylex-governance`.

## Publishing

`packages/lint/package.json` is an independent MIT-licensed package manifest.
Before publishing:

1. run the full repository check;
2. update the package version and changelog;
3. verify installation in a fixture using the published tarball;
4. publish `@creaseui/lint` with public access;
5. replace the root `file:packages/lint` development dependency with the
   released version only after the registry artifact is verified.

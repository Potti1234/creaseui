# @creaseui/lint

Agent-first ESLint rules for Foldkit design systems using Tailwind or StyleX.

Unlike JSX-oriented design-system linters, this package understands Foldkit
component calls:

```ts
button({ class: 'mt-4' }, h)
Card.cardTitle({ class: 'text-lg' }, h)
StyleXButton.button({ layoutStyle: styles.fullWidth }, h)
```

It provides three ESLint flat-config helpers:

- `tailwind()` combines Foldkit component contracts with `@shadcn/lint`'s
  Tailwind theme and value rules.
- `stylex()` combines Foldkit component contracts with
  `@stylexjs/eslint-plugin`.
- `constrainedStylex()` closes raw StyleX and Foldkit composition escape
  hatches for agent-authored pages.

See the repository's `docs/design-system-lint.md` for configuration, rule
semantics, adoption, and exception policy.

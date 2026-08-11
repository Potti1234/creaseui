# Contributing

Contributions should keep Foldkit's architecture and shadcn/ui's visual language
clearly separated: Foldkit defines behavior; the upstream shadcn component is the
styling and interaction reference.

## Workflow

1. Create a focused branch and identify the upstream shadcn/ui source and commit.
2. Find the closest Foldkit UI primitive or canonical Foldkit example before
   designing an API.
3. Scaffold a new primitive with `npm run component:create -- component-name`
   when applicable, then implement one coherent component or component family.
4. Add its real preview, component-specific examples, registry metadata, and a
   capability entry in `docs/component-roadmap.json`.
5. Add model tests plus Scene or browser tests for every stateful interaction.
6. Record intentional differences in `docs/component-parity.md`.
7. Run `npm run check:full`.
8. Verify keyboard, focus, accessible naming, light/dark tokens, and the relevant
   responsive states in a browser.

Keep commits small and dependency ordered. A foundation or utility should land
before the components that use it. Avoid mixing generated screenshots, broad
formatting, or unrelated refactors into a component commit.

## Foldkit conventions

- Keep views and updates pure; describe effects through Foldkit commands and
  subscriptions.
- Use stateful Foldkit UI primitives as submodels and stateless helpers as direct
  view functions.
- Merge class fragments into one `h.Class` per element.
- Use the state attributes and class hooks exposed by Foldkit UI rather than
  copying Radix selectors verbatim.
- Preserve primitive-owned positioning styles.
- Respect strict TypeScript settings, including `exactOptionalPropertyTypes`.

Read [docs/architecture.md](docs/architecture.md) and the
[component authoring contract](docs/component-authoring.md) before porting an
interactive component.

## Scope and naming

Use lowercase kebab-case filenames and keep the public name aligned with the
corresponding shadcn/ui component when the concepts match. When the Foldkit API
must differ, favor a clear Foldkit-native API and document the difference instead
of adding a React-shaped compatibility layer.

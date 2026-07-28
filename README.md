# crease/ui

The shadcn/ui design language, rebuilt for [Foldkit](https://foldkit.dev/) and
Foldkit UI.

crease/ui is an independent, MIT-licensed collection of styled Foldkit
components. It keeps shadcn/ui's familiar CSS token contract and copy-the-code
model while using Foldkit's Elm-style architecture for state and behavior. It
does not require React or JSX.

The repository currently contains:

- 49 UI modules, from buttons and fields to dialogs, calendars, and sidebars
- 33 component cards reproducing the shadcn/ui create-board showcase
- 72 Apache ECharts examples styled in the same design language
- 16 complete sidebar block examples
- a Vite-powered documentation and showcase application

## Development

Requirements: a current Node.js release and npm.

```sh
npm install
npm run dev
```

Before submitting a change, run:

```sh
npm run check
```

The initial GitHub registry publishes the Button and Dialog components, their
shared utilities, and the Crease theme:

```sh
npx shadcn@latest add Potti1234/creaseui/button
npx shadcn@latest add Potti1234/creaseui/dialog
```

Registry items copy their source into a Foldkit application so the resulting code
stays owned and editable by that application. Components not yet in the registry
can be copied directly from `src/ui` with their local dependencies; publishing
the remaining modules is ongoing.

## Documentation

- [Architecture](docs/architecture.md) explains how shadcn-style components map
  onto Foldkit UI.
- [Component parity](docs/component-parity.md) records coverage and intentional
  differences from shadcn/ui.
- [Registry installation](docs/registry.md) documents the required shadcn CLI
  configuration and reproducible installation proof.
- [Upstream provenance](docs/provenance.md) records the projects this work builds
  on and the policy for future ports.
- [Contributing](CONTRIBUTING.md) describes the component and commit workflow.

## Credits

crease/ui builds on [Foldkit](https://foldkit.dev/),
[shadcn/ui](https://ui.shadcn.com/), [Apache ECharts](https://echarts.apache.org/),
and [Lucide](https://lucide.dev/). It is not affiliated with shadcn/ui.

Released under the [MIT License](LICENSE).

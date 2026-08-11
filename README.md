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

The registry publishes the component catalog, shared utilities, and the Crease
theme. The dedicated CLI keeps the common workflow concise:

```sh
npx creaseui doctor
npx creaseui init
npx creaseui add button dialog
npx creaseui diff dialog
```

The underlying shadcn CLI remains available directly:

```sh
npx --yes shadcn@latest add Potti1234/creaseui/button --yes
npx --yes shadcn@latest add Potti1234/creaseui/dialog --yes
```

Registry items copy their source into a Foldkit application so the resulting code
stays owned and editable by that application. The registry does not replace the
consumer's Foldkit or Effect versions; consult the compatibility matrix before
installing across a Foldkit API upgrade.

For side-by-side development, install from this checkout without pushing first:

```sh
npm run registry:install-local -- ../consumer button card item
```

The registry guide also documents tag- and commit-pinned installs.

## Documentation

- [Architecture](docs/architecture.md) explains how shadcn-style components map
  onto Foldkit UI.
- [Component authoring](docs/component-authoring.md) defines completion,
  optionality, testing, and generated-file boundaries.
- [Component parity](docs/component-parity.md) records coverage and intentional
  differences from shadcn/ui.
- [Component catalog](docs/component-catalog.md) lists every installable module,
  its category, state ownership, dependencies, and registry address.
- [Registry installation](docs/registry.md) documents the required shadcn CLI
  configuration and reproducible installation proof.
- [Compatibility matrix](compatibility.json) records the framework and tooling
  versions used by the current validation suite.
- [Upstream provenance](docs/provenance.md) records the projects this work builds
  on and the policy for future ports.
- [Contributing](CONTRIBUTING.md) describes the component and commit workflow.
- [Changelog](CHANGELOG.md) records user-visible changes and migration notes.
- [`llms.txt`](public/llms.txt) gives coding agents a compact, canonical map of
  the project and its Foldkit conventions.

## Credits

crease/ui builds on [Foldkit](https://foldkit.dev/),
[shadcn/ui](https://ui.shadcn.com/), [Apache ECharts](https://echarts.apache.org/),
and [Lucide](https://lucide.dev/). It is not affiliated with shadcn/ui.

Released under the [MIT License](LICENSE).

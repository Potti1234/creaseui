# crease/ui

The shadcn/ui design language, rebuilt for [Foldkit](https://foldkit.dev/) and
Foldkit UI.

crease/ui is an independent, MIT-licensed collection of styled Foldkit
components. It keeps shadcn/ui's familiar CSS token contract and copy-the-code
model while using Foldkit's Elm-style architecture for state and behavior. It
does not require React or JSX.

The repository currently contains:

- 121 UI modules, including maps, dialogs, calendars, and sidebars
- 33 component cards reproducing the shadcn/ui create-board showcase
- 70 Apache ECharts examples styled in the same design language
- 16 complete sidebar block examples
- a Vite-powered documentation and showcase application

## Development

Requirements: a current Node.js release and npm.

```sh
npm install
npm run dev:tailwind # http://localhost:5173
npm run dev:stylex   # http://localhost:5174 (in a second terminal)
```

The two sites share content and routes: `creaseui.com` renders Tailwind and
`stylex.creaseui.com` renders StyleX. The header links to the same URL on the
other site. The StyleX site loads no Tailwind CSS or global element reset.

`npm run build` produces `dist/tailwind` and `dist/stylex`. Use
`npm run preview:tailwind` (port 4173) and `npm run preview:stylex` (port 4174)
to inspect the production builds. `npm run dev` and `npm run preview` default
to Tailwind. See [site architecture and hosting](docs/site-architecture.md).

Foldkit DevTools is available through the **DEV** badge in the bottom-right
corner of the site. Local development supports time travel; the published site
uses inspection mode to browse model and message history without pausing the
examples. Embedded block previews hide their own devtools panels.

Before submitting a change, run:

```sh
npm run check
npm run test:sites # build both sites and check all 121 component pages
```

The registry distributes the Tailwind components, shared utilities, and the
Crease theme through the shadcn CLI:

```sh
npx --yes shadcn@latest add Potti1234/creaseui/button --yes
npx --yes shadcn@latest add Potti1234/creaseui/dialog --yes
```

Registry items copy their source into a Foldkit application so the resulting code
stays owned and editable by that application. The registry does not replace the
consumer's Foldkit or Effect versions; consult the compatibility matrix before
installing across a Foldkit API upgrade.

The StyleX components in `src/stylex` are currently copied from this checkout;
they are not included in `registry.json`. See the
[StyleX authoring contract](src/stylex/README.md) for setup requirements.
The local CLI can also be run from a consumer directory with
`node /path/to/creaseui/scripts/crease.mjs doctor` (or `init`, `add`, `diff`).

For side-by-side development, install from this checkout without pushing first:

```sh
npm run registry:install-local -- ../consumer button card item
```

The registry guide also documents tag- and commit-pinned installs.

## Documentation

- [Getting started](docs/getting-started.md) covers first installation,
  stateless rendering, stateful composition, and validation.
- [Architecture](docs/architecture.md) explains how shadcn-style components map
  onto Foldkit UI.
- [Component authoring](docs/component-authoring.md) defines completion,
  optionality, testing, and generated-file boundaries.
- [Component parity](docs/component-parity.md) records coverage and intentional
  differences from shadcn/ui.
- [Component catalog](docs/component-catalog.md) lists every installable module,
  its category, state ownership, dependencies, and registry address.
- [Component API inventory](docs/api-reference.md) lists the exported functions,
  values, schemas, and types generated from every component source file.
- [Registry installation](docs/registry.md) documents the required shadcn CLI
  configuration and reproducible installation proof.
- [Create presets](docs/create-presets.md) documents generated style artifacts
  and the five real Foldkit icon adapters.
- [Constrained StyleX](docs/stylex-agent-safe-design-system.md) documents the
  Polar-inspired AI-safe design-system experiment, its enforcement model, and
  the implementation learnings.
- [Design-system linting](docs/design-system-lint.md) documents the Foldkit-aware
  Tailwind and StyleX lint presets, component contracts, and warning ratchet.
- [Compatibility matrix](compatibility.json) records the framework and tooling
  versions used by the current validation suite.
- [Upstream provenance](docs/provenance.md) records the projects this work builds
  on and the policy for future ports.
- [Contributing](CONTRIBUTING.md) describes the component and commit workflow.
- [Changelog](CHANGELOG.md) records user-visible changes and migration notes.
- [Maintenance](docs/maintenance.md), [releasing](docs/releasing.md), and
  [security](SECURITY.md) define project ownership and support policy.

Tooling and language models can discover the same material through
[`/docs-index.json`](public/docs-index.json), [`/llms.txt`](public/llms.txt), and
[`/llms-full.txt`](public/llms-full.txt).

## Credits

crease/ui builds on [Foldkit](https://foldkit.dev/),
[shadcn/ui](https://ui.shadcn.com/), [Apache ECharts](https://echarts.apache.org/),
and the icon projects credited in the preset guide. It is not affiliated with
shadcn/ui.

Released under the [MIT License](LICENSE).

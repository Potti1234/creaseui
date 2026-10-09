# Registry installation

## Compatibility

The versions used by Crease UI's checks are published in
[`compatibility.json`](../compatibility.json). Registry items deliberately do
not install or replace `effect`, `foldkit`, `@foldkit/ui`, or
`@effect/platform-browser`; the application owns those framework versions.
This prevents a component install from creating a nested, older Foldkit copy.

The validation baseline is the one recorded in `compatibility.json` and the
lockfile; successful reports from other versions do not change that baseline.
Foldkit 0.128 moved durable selection and checked values to parent models;
Crease UI components follow that controlled-state architecture.

Crease UI's public registry is the `Potti1234/creaseui` GitHub repository. The
shadcn CLI reads its root `registry.json`; use the owner/repository/item address
form for installs. The `creaseui.com` website is the documentation site, not a
separate `/r/*.json` registry host.

Inspect and validate the registry with:

```sh
npx shadcn@latest registry validate Potti1234/creaseui
npx shadcn@latest list Potti1234/creaseui
```

Foldkit consumers need a `components.json` with TypeScript output and aliases:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

`tsx` must be `true`: the shadcn CLI uses this flag to select TypeScript output,
even though Crease UI contains no JSX or React.

Install stateless and stateful components with:

```sh
npx --yes shadcn@latest add Potti1234/creaseui/button --yes
npx --yes shadcn@latest add Potti1234/creaseui/accordion --yes
npx --yes shadcn@latest add Potti1234/creaseui/dialog --yes
```

The same item address is used by the component pages and the local `crease`
CLI. For example, `Potti1234/creaseui/button` resolves the `button` item from
this repository's root registry.

The items above install the Tailwind renderer from `src/ui`. StyleX components
are available as `stylex-<component>` items, for example:

```sh
npx --yes shadcn@latest add Potti1234/creaseui/stylex-button --yes
```

StyleX files install in a `stylex` subdirectory of the configured `ui` alias
(for example, `@/ui/stylex`); the registry resolves their shared source
dependencies. Configure the StyleX compiler and supply the CSS theme variables described in the
[authoring contract](../src/stylex/README.md).

Every UI item declares `crease-theme` as a registry dependency. Installing a
component therefore also installs the complete background, card, popover,
control, chart, sidebar, and radius token contract into the configured Tailwind
stylesheet. To install the shared utility plus the production-tested Alert,
Badge, Button, Card, Empty, Input, Item, Separator, and Textarea set at once:

```sh
npx --yes shadcn@latest add Potti1234/creaseui/crease-core --yes
```

The `/create` compiler can pair that core with generated design tokens and a
real Lucide, Hugeicons, Tabler, Phosphor, or Remix Icon adapter. See
[`create-presets.md`](create-presets.md) for the artifact format and local
materialization command.

After installation, inspect the stylesheet selected by `tailwind.css` in
`components.json`. It should contain Crease values for `--popover`,
`--sidebar`, and `--radius`; their presence is a quick validation that the theme
dependency reached the intended stylesheet.

### Pinning a compatible snapshot

GitHub registry addresses accept a branch, tag, or full commit SHA after `#`.
Pin the item itself when an application cannot move to the framework baseline of
the current `main` branch:

```sh
npx --yes shadcn@latest add Potti1234/creaseui/button#v0.1.0 --yes
npx --yes shadcn@latest add Potti1234/creaseui/button#0123456789abcdef0123456789abcdef01234567 --yes
```

Prefer a full commit SHA for a reproducible installation. The selected ref also
applies while the CLI resolves Crease items referenced by that item.

### Installing from a local checkout

To develop Crease UI and an application side by side, build and install one or
more registry items directly from this checkout:

```sh
npm run registry:install-local -- ../fractal button card item
```

The consumer path may be absolute or relative to the Crease UI checkout. The
script builds `.registry`, serves it on an ephemeral loopback port, rewrites
Crease-to-Crease dependencies to that server, and runs the shadcn installer in
the consumer. The consumer must already contain `components.json`; no public
GitHub state is read for the requested Crease items.

The first `--yes` makes package execution non-interactive; the second accepts
the shadcn file-install prompt. Both are useful in scripts and CI.

## Build and test aliases

Configure `@` in every tool that resolves application imports. A Vite alias
does not automatically carry into a separately configured Vitest project.

```ts
// vite.config.ts (and vitest.config.ts when it is separate)
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

The application stylesheet must contain `@import "tailwindcss";`, and Vite
must include the `@tailwindcss/vite` plugin. Keep the same alias in
`tsconfig.json` through `compilerOptions.paths`.

## Component ownership

Crease UI follows Foldkit's two component categories:

- Stateless render helpers such as Button, Input, Textarea, and Field render
  directly from their props.
- Stateful components such as Dialog, Menu, Listbox, and Tabs expose a Model,
  Messages, `update`, and a view embedded with `h.submodel`. Their interaction
  state belongs in the feature Model and their Messages route through the
  feature update function.

For controlled values, the parent owns the durable value and folds the child
OutMessage back into its Model. Browser persistence belongs in flags or
Commands, never in a component's `init` or view.

The repository's end-to-end proof creates a disposable Foldkit/Vite consumer,
installs the locally built registry items, and runs its typecheck and
production build. The default run also installs StyleX Button, Data Table, and
ECharts integration items. Pass item names to target a smaller install:

```sh
npm run test:registry
npm run test:registry -- stylex-data-table stylex-integrations-echarts
```

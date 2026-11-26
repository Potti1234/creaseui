# CreaseUI for Effect UI

The first port covers Button, Dialog, Combobox, and Calendar. The headless behaviors can be installed and composed independently. Tailwind, StyleX, and Pleat use the same Effect UI views and event contracts. Dialog supports controlled or local open state. Combobox and Calendar report single selections to their consumer.

This package uses Effect 4.1.5 and pins both Effect UI packages to snapshot `77dcd92`. It has its own lockfile because the Foldkit application still requires Effect 4.0.0-rc.117.

## Preview locally

From the repository root, run the install once and start the renderer you want to check.

```sh
npm --prefix effect-ui ci
npm --prefix effect-ui run dev -- --port 5181
npm --prefix effect-ui run dev:stylex -- --port 5182
npm --prefix effect-ui run dev:pleat -- --port 5183
```

`npm --prefix effect-ui run build` type-checks the package and builds all three previews. `npm --prefix effect-ui test` checks Calendar rendering and event delivery on Effect UI's test host.

## Install through the local registry

Build the registry with `npm --prefix effect-ui run registry:build`. With the Tailwind preview running, add this registry URL to the consumer's `components.json` under `registries`.

```json
"@crease-effect": "http://127.0.0.1:5181/.registry/{name}.json"
```

```sh
npx shadcn@latest add @crease-effect/effect-button @crease-effect/effect-dialog @crease-effect/effect-combobox @crease-effect/effect-calendar
npx shadcn@latest add @crease-effect/stylex-effect-components
npx shadcn@latest add @crease-effect/pleat-effect-components
```

The first command installs the Tailwind views. The other two install the corresponding renderer and its dependencies. Use the imports under your configured `ui` alias: `effect/ui/<component>`, `effect/stylex`, or `effect/pleat`. For a standalone behavior, append `-behavior` to the corresponding `effect-<component>` registry name.

StyleX consumers need their StyleX compiler enabled. Pleat consumers need a TypeScript and bundler alias from `@pleat/core` to the installed `lib/pleat/core/src/index.ts`, using their configured `lib` path. When server rendering Pleat views, prepend `Sheet.styleTag(rendered.html)` to the document head.

## Upstream reproduction

The [upstream findings](UPSTREAM.md) include tested snapshot SHAs, a standalone reproduction, a passing control, and an issue draft.

The remaining migration includes the rest of the catalog and docs site, the Foldkit consumer lint tools, multi-select Combobox, and Calendar's range and month/year selection modes.

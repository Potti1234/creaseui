# CreaseUI for Effect UI

The port covers Accordion, Button, Calendar, Checkbox, Collapsible, Combobox, Dialog, Popover, Progress, Select, Separator, Switch, Tabs, Toggle, and Tooltip. The behaviors can be installed and composed independently. Tailwind, StyleX, and Pleat use the same Effect UI views and event contracts.

This package uses Effect 4.1.5 and pins both Effect UI packages to snapshot `8986cd7`. It has its own lockfile because the Foldkit application still requires Effect 4.0.0-rc.117.

## Preview locally

From the repository root, run the install once and start the renderer you want to check.

```sh
npm --prefix effect-ui ci
npm --prefix effect-ui run dev -- --port 5181
npm --prefix effect-ui run dev:stylex -- --port 5182
npm --prefix effect-ui run dev:pleat -- --port 5183
```

`npm --prefix effect-ui run build` type-checks the package and builds all three previews. `npm --prefix effect-ui test` runs the port's rendering and behavior tests.

## Install through the local registry

Build the registry with `npm --prefix effect-ui run registry:build`. With the Tailwind preview running, add this registry URL to the consumer's `components.json` under `registries`.

```json
"@crease-effect": "http://127.0.0.1:5181/.registry/{name}.json"
```

```sh
npx shadcn@latest add @crease-effect/effect-button @crease-effect/effect-dialog \
  @crease-effect/effect-combobox @crease-effect/effect-calendar \
  @crease-effect/effect-select @crease-effect/effect-popover \
  @crease-effect/effect-checkbox @crease-effect/effect-switch \
  @crease-effect/effect-tooltip @crease-effect/effect-tabs @crease-effect/effect-accordion \
  @crease-effect/effect-collapsible @crease-effect/effect-progress \
  @crease-effect/effect-separator @crease-effect/effect-toggle
npx shadcn@latest add @crease-effect/stylex-effect-components
npx shadcn@latest add @crease-effect/pleat-effect-components
```

The first command installs the Tailwind views. The other two install the corresponding renderer and its dependencies. Use the imports under your configured `ui` alias: `effect/ui/<component>`, `effect/stylex`, or `effect/pleat`. For a standalone behavior, append `-behavior` to the corresponding `effect-<component>` registry name.

StyleX consumers need their StyleX compiler enabled. Pleat consumers need a TypeScript and bundler alias from `@pleat/core` to the installed `lib/pleat/core/src/index.ts`, using their configured `lib` path. When server rendering Pleat views, prepend `Sheet.styleTag(rendered.html)` to the document head.

Select uses the kit's keyboard navigation, typeahead, disabled options, form integration, and multi-select. Pass `alignItemWithTrigger` in `props` for item-aligned placement. The styled view accepts grouping and item rendering callbacks. Popover exposes the kit's placement, collision, dismissal, and focus options. Pass `props: {}` for local disclosure or supply `open` and handle `RequestedOpen` and `RequestedClose` in the parent.

Checkbox and Switch render labels linked to the native button and optional descriptions. Pass `checked` in `props` and handle Checkbox's `Toggled` event or Switch's `onToggle` callback. The styled controls submit an empty string when unchecked by default, matching the Foldkit versions. Supply `uncheckedValue` to choose a different value.

Tooltip takes a button builder as its trigger. The behavior exposes the kit's hover delay, placement, and visibility options. It adds the text to the trigger's accessible description by default. Set `describesTrigger: false` for a tooltip that repeats the trigger's accessible name. Native link triggers are tracked upstream. [Effect UI #283](https://github.com/Effect-TS/ui/issues/283)

Tabs takes the active `value` from the parent and emits `Selected`. The styled view activates on focus by default. Set `activateOnFocus: false` for manual activation. Effect UI keeps disabled tabs in the arrow-key focus order and prevents them from activating. Accordion can own its open values through `defaultValue` or accept `value` and emit `Toggled` to its parent. Its kit behavior also supports multiple open items and searchable closed panels via `hiddenUntilFound`.

Collapsible accepts `defaultOpen` for local state or `open` with a `Toggled` handler for controlled state. Progress accepts a numeric value or `null` for indeterminate progress. Supply a distinct `key` or `id` when rendering multiple progress bars in one parent. Toggle takes `pressed` and emits the next value through `onToggle`. Separator is decorative by default and exposes separator semantics with `decorative: false`.

## Upstream reproduction

The [upstream findings](UPSTREAM.md) include the published issue, tested fix, snapshot SHAs, and standalone reproduction. The [contribution workflow](CONTRIBUTING.md) records how to report a finding and share the corresponding fix with Effect UI.

The remaining migration includes the rest of the catalog and docs site, the Foldkit consumer lint tools, multi-select Combobox, and Calendar's range and month/year selection modes.

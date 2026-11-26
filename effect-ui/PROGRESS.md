# Effect UI migration progress

Updated 2026-11-26 on `codex/effect-ui-port`. The port uses Effect 4.1.5 and pins `@effect/ui` and `@effect/ui-kit` to snapshot `5ea1d77`.

## Components

All 125 components in the Foldkit installable catalog have Effect UI registry entries for both styled components and standalone behaviors. The registry supports Tailwind, StyleX, and Pleat. The migration report counts 120 complete ports and five partial ports.

| Partial port | Remaining behavior                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| Data Table   | Value submenu with radio choices and the default floating bulk action bar                                 |
| Data Grid    | Insert above or below from the cell context menu and the sort toolbar panel                               |
| Input OTP    | Custom character patterns that permit whitespace. The pinned kit removes whitespace during normalization. |
| Number Input | Integer-only stepping with fractional bounds                                                              |
| Toast        | Per-notification placement with a shared visibility limit and independent lane timing                     |

Recent slices added selection and editing controls, charts and data views, calendar facets and editors, required Sheet dismissal, swipeable toast stacks, and Stepper transition sequencing. The [registry and local setup](README.md) describe how to install a component or behavior. Run `npm --prefix effect-ui run migration:status` to reproduce the counts.

## Documentation

The local docs preserve component paths and aliases and provide a searchable catalog. Button, Accordion, Code Block, Markdown, Overflow List, Lightbox, and Thumbnail have live Effect UI examples. Other component routes show their current documentation status. Getting Started and Theming cover all three renderer setups. The Behavior reference has migrated entries and indicates where a Foldkit entry still awaits an Effect UI reference.

Remaining work includes the other component examples, all legacy example variants, accurate component API and keyboard reference sections, the remaining Behavior guides, and the tutorial, chart gallery, blocks, and lint documentation. Compare each migrated example with the Foldkit reference at desktop and mobile widths and in both color schemes.

Open the [local Effect UI docs](http://127.0.0.1:5181/docs/components/button) or [component preview](http://127.0.0.1:5181/) after starting the local server from the [setup instructions](README.md).

## Verification

- TypeScript and the production builds passed for Tailwind, StyleX, and Pleat. Vite reports large shared catalog and MapLibre chunks.
- All 22 Effect UI tests passed. The suite covers state and rendering for controls, content, charts, data views, and Stepper timing.
- Targeted Chromium checks at desktop and mobile widths covered keyboard selection and focus, calendar and data editing, native multipart files, media overlays, sheet dismissal, and toast swipes. Stepper was checked in all three renderers.
- The Checkbox comparison checked geometry, styling, and keyboard toggling against the Foldkit reference. Browser smoke checks covered the docs catalog, mobile navigation, alias routing, Button, Accordion, and Getting Started. Catalog-wide visual and interaction parity remains open.

The [upstream findings](UPSTREAM.md) track reported defects, standalone reproductions, and adopted fixes. The [contribution workflow](CONTRIBUTING.md) describes how to share an isolated report and its tested fix.

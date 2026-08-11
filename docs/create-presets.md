# Create presets

The `/create` page is an executable preset compiler, not only a visual theme
preview. Its shadcn-compatible preset code round-trips the selected style,
base color, theme, chart palette, icon library, body and heading fonts, radius,
menu accent, and menu color.

## Generated artifact

`Copy Registry JSON` copies a complete `registry:style` item. The item:

- installs the `crease-core` component set;
- installs one of the five Foldkit-native icon adapters;
- writes `@/styles/crease-preset.css` with light and dark tokens, five chart
  colors, typography, radius, menu treatment, and structural style rules; and
- writes `@/crease-preset.json` so the design choice remains inspectable and
  reproducible.

Host the copied JSON as a registry endpoint and add it with the shadcn CLI, or
materialize the same files locally from a preset code:

```sh
npm run preset:build -- --preset b27GcrRo --output ./generated-preset
```

The output directory contains `registry-item.json`, `crease-preset.css`, and
`crease-preset.json`. Import the CSS after Tailwind and the base Crease theme so
the preset values win the cascade:

```css
@import "tailwindcss";
@import "./crease-preset.css";
```

The CSS includes Google Fonts imports for the selected families. Applications
with a self-hosting, offline, or strict content-security-policy requirement can
replace those imports while keeping the generated `--font-sans` and heading
stacks.

## Icon adapters

The preset does not approximate icon families with stroke width alone. Each
choice installs an adapter that preserves Crease's `@/lib/icon` API while
replacing its SVG node data:

| Choice | Registry item | Source data | License |
| --- | --- | --- | --- |
| Lucide | `icons-lucide` | `@iconify-json/lucide` | ISC |
| Hugeicons | `icons-hugeicons` | `@iconify-json/hugeicons` | MIT |
| Tabler Icons | `icons-tabler` | `@iconify-json/tabler` | MIT |
| Phosphor Icons | `icons-phosphor` | `@iconify-json/ph` | MIT |
| Remix Icon | `icons-remixicon` | `@iconify-json/ri` | Apache-2.0 |

The checked-in mapping keeps canonical component icon names stable across all
families. `npm run icons:adapters` fails when generated adapters drift from the
mapping or installed source datasets; regenerate intentionally with
`npm run icons:adapters:generate`.

## Verification

`npm run registry:build` validates all adapter items. `npm run test:registry`
then installs every family into a clean consumer, verifies that it replaces the
generic icon module, and type-checks the installed Foldkit source.

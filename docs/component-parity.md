# Component parity

Verified against [`shadcn-ui/ui@41bbc12c`](https://github.com/shadcn-ui/ui/tree/41bbc12cfd39ed8d9cb8da04275479ee7ecc0612)
on 2026-08-11.

Crease UI contains all 62 items in the recorded `new-york-v4` UI registry.
It additionally ships three documented recipes:

- **Data Table**, **Date Picker**, and **Typography** are Crease recipes built from
  the component primitives.

All 65 entries have a registry item, source module, install target, documentation
route, real preview, and component-specific examples. Toast is present in the
recorded upstream registry and is no longer classified as Crease-only legacy.
Name coverage is not used as a synonym for implementation fidelity.

## Parity classifications

- **Full** — the Foldkit port provides the same user-facing capability and
  comparable composition surface.
- **Adapted** — equivalent use cases are supported through an idiomatic Foldkit
  API, but the underlying React-specific engine or composition mechanism is not
  copied.
- **Recipe** — a documented composition rather than a current upstream registry
  primitive.
- **Legacy** — retained for compatibility with an older shadcn API.

The machine-readable classification and remaining intentional differences live
in [`component-roadmap.json`](component-roadmap.json). The generated
[`component-parity.json`](component-parity.json) expands that policy into one
contract per component.

## Fidelity dimensions

Every component is tracked independently across visual match, behavior,
accessibility, composition, documentation, and registry installation. A status
of **verified** requires linked evidence; **partial** means only a subset is
covered; **adapted** records an intentional Foldkit-native difference;
**unverified** is an explicit open verification task; and **not-applicable** is
reserved for dimensions that do not apply.

The initial contract intentionally marks visual fidelity as unverified until an
upstream-referenced snapshot exists. This prevents inventory completeness from
being presented as pixel parity. Browser and axe evidence currently promotes
Button, Dialog, Input, and Select in the dimensions those tests exercise.

`npm run parity:check` fails when the generated contract is stale or an upstream
registry item is absent. A scheduled workflow compares the recorded upstream UI
file tree with `main`; when it changes, refresh the focused audit with:

```sh
npm run parity:upstream:update -- --upstream-root ../ui
npm run parity:generate
```

## Adapted components

| Component | Foldkit adaptation |
| --- | --- |
| Carousel | Pure controlled model with loop, keyboard, variable-size slides, and multi-slide stepping instead of Embla plugins. |
| Chart | Framework-native SVG/ECharts composition with config, container, legend, and tooltip helpers instead of Recharts. |
| Command | Searchable grouped command surface; global shortcut/dialog lifecycle remains application composition. |
| Context Menu | Dropdown-based menu anchored from secondary pointer coordinates because Foldkit's context-menu event carries no coordinates. |
| Menubar | Typed Dropdown Menu models with an explicit parent coordination seam for wrapping left/right navigation. |
| Navigation Menu | Semantic navigation and Popover disclosure rather than Base UI's linked animated viewport. |
| Resizable | Pure controlled group model with arbitrary panels and explicit measured extent rather than `react-resizable-panels`. |
| Scroll Area | Visible, focusable native scrollbars with orientation control rather than custom scrollbar/thumb parts. |
| Slider | Foldkit single-value primitive plus a controlled horizontal/vertical two-thumb range implementation. |
| Tooltip | Foldkit floating anchor with collision-aware arrow styling rather than a separate Base UI Arrow part. |

These are intentional implementation choices, not missing components. Any future
change that removes a listed capability must add an open fidelity item to the
roadmap instead of leaving the status silently complete.

## Documentation contract

Each component page provides responsive catalog navigation, an on-page table of
contents, permalink headings, previous/next navigation, CLI and manual install
guidance, copyable usage/composition snippets, real preview source, component
source and API links, and an explicit Foldkit-native label. The catalog tests
guard registry/source alignment, standalone pages, example capacity, concrete
source snippets, and roadmap structure.

See [`parity-refresh-2026-08.md`](parity-refresh-2026-08.md) for the implementation
record and verification commands.

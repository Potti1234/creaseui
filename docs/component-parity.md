# Component parity

Verified against [`shadcn-ui/ui@cb2bcd88`](https://github.com/shadcn-ui/ui/tree/cb2bcd88)
on 2026-08-01.

Crease UI contains all 61 components in the current `new-york-v4` UI registry.
It additionally ships four documented compatibility entries:

- **Data Table**, **Date Picker**, and **Typography** are Crease recipes built from
  the component primitives.
- **Toast** is a legacy compatibility alias for Sonner.

All 65 entries have a registry item, source module, install target, documentation
route, real preview, and component-specific examples. Name coverage is not used
as a synonym for implementation fidelity; the classifications below make the
remaining framework adaptations explicit.

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
in [`component-roadmap.json`](component-roadmap.json).

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

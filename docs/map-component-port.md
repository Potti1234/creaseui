# Map component port

Imported from the component-fixes project on 2026-10-08, after the component
fixes recorded in [Component fix port](component-fix-port.md).

The port adds Map, Map Controls, Map Marker, Map Popup, Map Route, Map Arc,
Map GeoJSON, Map Cluster, Map Styles, and Map Localization. Both Tailwind and
StyleX renderers share the same Foldkit Mount and declarative overlay helpers.
MapLibre GL JS owns rendering; OpenFreeMap supplies the default basemaps.

## Commit groups

1. Shared runtime, resource cleanup, viewport/events, layer descriptors,
   palettes, translations, MapLibre dependency, and lifecycle scene tests.
2. Tailwind/StyleX component APIs, marker scopes, exports, and renderer coverage.
3. Ten documentation pages, copyable applications, full-width previews,
   grouped map navigation, and composition/palette tests.
4. Registry adapter and component entries, generated API/discovery metadata,
   parity contracts, provenance, component counts, and this validation record.

Theme-editor and theming-guide changes remain uncommitted. Validation used the
committed map checkout, without those features.

## Validation

- Type checking and ESLint passed.
- All 439 unit tests passed; all copyable documentation applications compiled.
- All 42 scene test files passed, including 11 map lifecycle/interaction tests.
  The suite retains its existing expected-failure and TODO cases.
- Tailwind and StyleX production builds passed.
- API/discovery metadata, parity, and StyleX adoption checks passed for 122
  components.
- All ten map pages rendered live maps in both sites, with full-width preview
  geometry. Both renderers passed keyboard marker movement and dark-mode checks.
- Both renderers passed wheel zoom/reset, popup actions, style and language
  selection, keyboard selection, Escape/focus restoration, and mobile selector
  layout checks at 390px. The probe waited for Foldkit focus transitions before
  issuing the next interaction.
- All ten registry components installed into a separate consumer, then passed
  that consumer's type check and Tailwind production build.

The standard registry verification script encountered npm's `edgesOut`
peer-dependency resolver error while installing the repository's test/tooling
dependencies. The consumer check was rerun with TypeScript, Vite, and the two
build plugins as its dev dependencies; component installation and framework
version checks used the same registry verification logic.

Logs, browser results, and screenshots are retained in the ignored
`output/map-port-validation` directory.

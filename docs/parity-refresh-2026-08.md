# August 2026 parity refresh

This record maps the 2026-08-01 shadcn comparison audit to the implementation
that resolved it. The comparison baseline is
[`shadcn-ui/ui@cb2bcd88`](https://github.com/shadcn-ui/ui/tree/cb2bcd88).

## Implementation slices

### Compound component capability

Commit `f6e2c3a` adds chart configuration/container/legend/tooltip composition,
richer Select and Combobox items, Command compound helpers, configurable Input
OTP patterns, indeterminate Progress, a controlled range Slider, and a
collision-aware Tooltip arrow.

### Documentation navigation and metadata

Commit `0c8b915` adds responsive component navigation, a mobile global menu,
semantic breadcrumbs, on-page tables of contents, permalink headings,
previous/next links, CLI/manual installation guidance, copyable primary
snippets, Foldkit-native and source links, Accordion composition, and baseline
canonical/Open Graph metadata.

### Interaction-heavy components

Commit `87aeefe` adds cursor-anchored Context Menu behavior, variable-size and
multi-step Carousel navigation, arbitrary-panel Resizable groups, Menubar
coordination hooks, Navigation Menu disclosure semantics, visible focusable
Scroll Areas, and model-level regression tests.

### Documentation source quality

Commit `1f0a665` replaces prose-only and abbreviated placeholder snippets with
the concrete Foldkit preview source used by each page.

## Verification contract

The final slice strengthens catalog tests so they verify:

- every registry source file exists and has a matching install target;
- every component has a route, real preview, and dedicated definition;
- standalone Accordion and Calendar pages remain covered;
- definitions cannot exceed the catalog's allocated example state;
- displayed source cannot regress to prose, dangling ellipses, or JSX/HTML
  placeholders;
- fidelity and intentional framework adaptations remain explicit.

Run the release gates with:

```text
npm run typecheck
npm test
npm run build
npm run test:registry
```

The production build still reports the existing large-entry-chunk advisory. It
does not fail the build; code splitting is tracked separately from component
parity.

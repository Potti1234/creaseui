# Viewport

Viewport ports ui-sdk.dev's `createViewport`: a pannable, zoomable canvas whose
`{ x, y, zoom }` lives in `Viewport.Model` (with the measured surface frame,
the active pointer gesture, and the findable pane's rest offset). `x`/`y` place
the canvas origin inside the surface in screen pixels.

- `Viewport.view` hands `toView` attribute bundles for the `surface` (clipped,
  `touch-action: none`, the `Surface` Mount), the `world` (one transform, origin
  `0 0`, `--canvas-zoom`), and an optional findable `pane`. Elements marked
  `data-viewport-item` keep their own presses; empty space pans.
- One pointer drags, two pinch about their center; wheel pans and Ctrl/⌘ wheel
  (or a trackpad pinch) zooms at the pointer; `+`/`-`/`0` zoom at the center.
  Opt out with `wheel: false` / `keys: false` when a component maps them itself.
- Pure operations return `{ model, outMessage }`: `setViewport`, `panBy`,
  `zoomTo`, `zoomBy`, `fit`, `reveal`; readers are `toCanvas`, `toScreen`,
  `rectOf` (from a client rect), `visible`, and `style`.
- Every change emits `ChangedViewport` with ui-sdk's reasons (`wheel`, `drag`,
  `pinch`, `zoom-key`, `focus-in`, `find-in-page`, `imperative`) plus `resize`,
  since surface measurement is a Message here. Zoom keys carry an announcement
  (`message`, default `Zoom 125%`) for the component's live region.
- `canCommit` replaces ui-sdk's vetoing `set`. `bounds` keeps a canvas box
  covering the surface and centers it on any axis where it is smaller; each
  pointer move is applied to the committed viewport, so a bounded drag has no
  dead zone when it reverses.
- `Findable` is `bindFindable`: on an `overflow: scroll` pane it rests the
  scroll far from the origin and turns browser scrolls (find in page, focus,
  links to an id) into pans.

Lightbox is the component proof: its zoom frame is the surface, the image the
world, `bounds` the image's 1x box, zoom fixed to 1–2x. `src/docs/examples/viewport`
demos the full canvas surface. `@foldkit/ui` has no canvas viewport, so this is
a native port rather than a wrapper.

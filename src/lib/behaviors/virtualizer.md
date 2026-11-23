# Virtualizer

CreaseUI owns the Schema Model, Messages, initialization, measurement and
scroll updates, and programmatic scroll Command. The first measurement
restores a nonzero initial offset. Later resize events update the viewport
height, and only a completion with the current scroll version clears the
pending request.

CreaseUI's own layout helpers calculate the visible window independently of
the renderer. Use `Layout.uniform` for equal sizes or `Layout.variable` to
precompute offsets from per-item sizes. `Layout.range` maps an axis offset,
viewport size and overscan to visible indices and spacer sizes. A custom view
can keep the layout while its item sizes stay constant, then use it on either
axis. The included list view uses this calculation to render keyed rows and
spacers in normal vertical flow.

The Foldkit subscription follows DOM scroll and resize events. It reattaches
when the container remounts and releases observers and listeners when stopped.

CreaseUI supplies start/center/end/auto alignment, `isNearEnd`, and
`rowPosition` ARIA position values. Uniform
`scrollToIndex(model, itemCount, index, options?)` needs the count for clamping;
the variable-height counterpart derives it from items. Auto emits no Command
when the row is fully visible. Empty collections are no-ops. Parents track
"once per count" themselves when using `isNearEnd` to load more.
Uniform rows require a positive finite `rowHeightPx`. Callers supply
nonnegative finite variable heights and valid row indices to `rowPosition`.
Components own roles and map position values to ARIA attributes.
Not covered: `scrollMargin` (Foldkit's scroller has no content before the first row),
measured dynamic row heights (`measure`/`reset`; callers supply
heights via `itemToRowHeightPx`), horizontal DOM observation and list rendering, `keep` for non-contiguous
rows, or findable/find-in-page layers.

Try `npm run dev -- --open /src/docs/examples/virtualizer/`.

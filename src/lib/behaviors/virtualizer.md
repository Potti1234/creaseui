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
axis. The included list view renders keyed items and spacers in vertical flow
by default. Use `orientation: 'horizontal'` to place them in a single flex row
with logical scroll offsets measured from the inline start in LTR and RTL.
Set `initialScrollOffset` for either axis.

Set `scrollMargin` to the size of the leading content in the scroller. The
included view reserves that space and can render `leadingContent` inside it.
Set `stickyScrollMargin: true` to pin it to the leading edge and account for
its occlusion when windowing or aligning a scroll. For a custom view, render
the leading space yourself. Layout offsets and spacers are relative to the
first item, while the model's scroll offset includes the margin.

Pass `keep: [index]` to the included view to retain an item outside the
visible window. For custom views, `renderedIndices(range, count, keep)`
returns the sorted union. Size each skipped span using the difference
between its layout offsets. Keep using the viewport range for near-end
checks. To retain focus, keep the focused item's stable key in the parent
model, resolve it to the current index after sorting or filtering, and pass
that index until focus leaves the item. Retained rows use the same ARIA
positions and measurement bindings as visible rows.

The Foldkit subscription follows DOM scroll and resize events. It reattaches
when the container remounts and releases observers and listeners when stopped.

Enable `measureItems: true` at initialization to use intrinsic item sizes.
Set `estimatedItemSize` as a fallback, and optionally pass
`itemToRowHeightPx` to the included view for per-item estimates along the
active axis. Rendered items are observed for size changes. Measurements follow
stable item keys through reordering and survive when items move out of view.
Use `resetMeasurements(model)` when reusing keys for a different collection
or invalidating cached sizes. Measured elements should have a positive size
and no external margins or gaps along the scroll axis.

In a custom view, give the scroller the model ID and attach
`measurementAttributes(h).container(model.id)`. Attach the corresponding
`item(key)` attribute to each intrinsically sized item. Use
`dynamicLayout(model, { items, itemToKey, estimateItemSize })` to combine
measurements and estimates, then pass that layout to `visibleRange` and
`scrollToIndexLayout` so rendering and programmatic scroll share offsets.
The legacy `scrollTop` and `containerHeight` model fields store the active
axis offset and viewport size respectively.

CreaseUI supplies start/center/end/auto alignment, `isNearEnd`, and
`rowPosition` ARIA position values. Uniform
`scrollToIndex(model, itemCount, index, options?)` needs the count for clamping;
the variable-height counterpart derives it from items. Auto emits no Command
when the row is fully visible. Empty collections are no-ops. Parents track
"once per count" themselves when using `isNearEnd` to load more.
Uniform rows require a positive finite `rowHeightPx`. Callers supply
nonnegative finite variable heights and valid row indices to `rowPosition`.
Components own roles and map position values to ARIA attributes.
Find-in-page layers remain open. Dynamic measurement updates offsets
without an explicit scroll-anchor correction when earlier items change size.

Try `npm run dev -- --open /src/docs/examples/virtualizer/`.

# Virtualizer

CreaseUI owns the Schema Model, Messages, initialization, measurement and
scroll updates, and programmatic scroll Command. The first measurement
restores a nonzero initial offset. Later resize events update the viewport
height, and only a completion with the current scroll version clears the
pending request.

The behavior module is the integration boundary for Foldkit VirtualList.
Foldkit supplies the scoped scroll and resize subscription, including
MutationObserver reattachment across mounts and observer/listener cleanup.
It also supplies both window calculations and the keyed spacer view that
uses them, keeping rendered rows in normal flow. The delegates share the
local model shape and emit compatible measurement and scroll messages.
Consumers import these entry points from the CreaseUI behavior.

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
heights via `itemToRowHeightPx`), horizontal lists, `keep` for non-contiguous
rows, or findable/find-in-page layers.

Try `npm run dev -- --open /src/docs/examples/virtualizer/`.

# Virtualizer

Virtualizer wraps Foldkit VirtualList rather than porting ui-sdk's
`createVirtualizer`: it keeps a Schema Model instead of a mutable store and
subscribe, scroll/resize via a scoped Subscription with MutationObserver
reattach across mounts, and a version-guarded programmatic scroll Command.
Spacer layout keeps rows in normal flow without absolute positioning.
The wrapper adds start/center/end/auto alignment, `isNearEnd`, and
`rowPosition` ARIA position values. Uniform
`scrollToIndex(model, itemCount, index, options?)` needs the count for clamping;
the variable-height counterpart derives it from items. Auto emits no Command
when the row is fully visible. Empty collections are no-ops. Parents track
"once per count" themselves when using `isNearEnd` to load more.
Callers supply nonnegative finite dimensions and valid row indices to
`rowPosition`; components own roles and map its values to ARIA attributes.
Not covered: `scrollMargin` (Foldkit's scroller has no content before the first row),
measured dynamic row heights (`measure`/`reset`; callers supply
heights via `itemToRowHeightPx`), horizontal lists, `keep` for non-contiguous
rows, or findable/find-in-page layers.

Try `npm run dev -- --open /src/docs/examples/virtualizer/`.

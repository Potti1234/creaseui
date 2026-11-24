# Cell Range

Store a selection with the `Range` Schema. Call `start(cell)` to set the
anchor and `extend(range, cell)` when pointer or keyboard navigation moves
the end. Use `bounds` and `contains` to render the selection.

`byCellRange(previous, current)` returns disjoint rectangles for the cells
entering and leaving the selection. A grid that tracks cells individually
can update just those rectangles. Use `cellRangeMessage` for a live-region
announcement, and `cellsToText` or `textToCells` at the clipboard boundary.
Data Grid uses the same bounds for selection styling and announces ranges
larger than one cell in all three renderers.

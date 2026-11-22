# UndoStack

UndoStack is pure snapshot history adapted from ui-sdk's UndoStack algorithm.
Keep the present value in the component and push it before an edit; undo and
redo return the next history and present value. New edits discard the redo
branch. Pass an optional non-negative integer `limit` to drop the oldest undo
steps (default 100, matching ui-sdk). Consecutive pushes with the same nonempty
`group` merge while the gap between caller-supplied `now` times is strictly less
than `groupDelay` (default 500 ms), preserving the group's original undo state.
Ungrouped pushes, seal, undo, redo and clear end a group. Data Grid exposes
`config.history.limit`; its discrete commits remain ungrouped because messages
do not carry timestamps. Clear history when replacing a value from outside.

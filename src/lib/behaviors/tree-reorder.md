# Tree Reorder

Tree List can opt into keyboard reordering with `reorderable`. Shift+Space picks up the focused item. Up and Down move it among siblings. Inline-end moves it beneath the previous sibling and inline-start moves it out one level. The whole subtree moves with its root. Enter or Space keeps the change, and Escape discards the draft.

Placement data uses item IDs, so rendering applies it to the current tree and preserves the labels and actions supplied by the parent.

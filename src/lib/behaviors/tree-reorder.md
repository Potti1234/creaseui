# Tree Reorder

Tree List can opt into keyboard reordering with `reorderable`. Shift+Space picks up the focused item. Up and Down move it among siblings. Inline-end moves it beneath the previous sibling and inline-start moves it out one level. The whole subtree moves with its root. Enter or Space keeps the change, and Escape discards the draft.

Placement data uses item IDs, so rendering applies it to the current tree and preserves the labels and actions supplied by the parent.

With a mouse, drag a row over the upper or lower third of another row to insert it beside that row. Drop over the middle third to nest it beneath that item. Dropping outside the tree or onto a descendant leaves the tree in place.

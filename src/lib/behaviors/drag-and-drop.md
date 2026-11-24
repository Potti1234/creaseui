# DragAndDrop

DragAndDrop handles single-item sorting in lists and boards. CreaseUI owns
the Schema Model, Messages and OutMessages, pointer activation threshold,
drag transitions, and drop and cancel intents. The parent applies those
intents to its own order.

The behavior module is the integration boundary for Foldkit DragAndDrop.
Foldkit supplies the scoped document pointer and keyboard subscriptions,
DOM hit testing, temporary document styles, viewport edge scrolling,
keyboard target resolution and focus Commands, and ghost positioning. Those
delegates read the compatible local drag phases and emit messages that the
local update handles. The DOM protocol uses `data-draggable-id` on handles,
`data-sortable-id` on rows, and `data-droppable-id` on containers.

Use [Transfer](transfer.md) for pointer and keyboard drafts with grid layout,
grouped moves, and fixed-position previews. Use [Reorder](reorder.md) for
keyboard-only drafts with grouped moves, rebase, and announcements.

Spread `view` on the focusable handle, `sortable` on each row, and `dropTarget`
on its list. Lift `subscriptions` and the Commands from `update` into the
parent. Supply roles, announcements, and styling (including
`touch-action: none` on the handle) in the component. Use DOM-unique item and
container IDs. Transfer List uses a drop indicator rather than a drag ghost.
This wrapper retains Foldkit's linear hit testing and viewport scrolling; it
does not implement ui-sdk's grid/group moves, nested-scroller auto-scroll,
or pointer-capture/loss handling.

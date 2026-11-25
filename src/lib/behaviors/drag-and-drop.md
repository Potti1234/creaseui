# DragAndDrop

DragAndDrop handles single-item sorting in lists and boards. CreaseUI owns
the Schema Model, Messages and OutMessages, pointer activation threshold,
drag transitions, and drop and cancel intents. The parent applies those
intents to its own order.

Foldkit Subscriptions track the active pointer, keyboard and scroll position.
CreaseUI performs hit testing, edge scrolling, keyboard target resolution,
and ghost positioning. A Command restores focus after the render commit.
The DOM protocol uses `data-draggable-id` on handles,
`data-sortable-id` on rows, and `data-droppable-id` on containers.

Use [Transfer](transfer.md) for pointer and keyboard drafts with grid layout,
grouped moves, and fixed-position previews. Use [Reorder](reorder.md) for
keyboard-only drafts with grouped moves, rebase, and announcements.

Spread `view` on the focusable handle, `sortable` on each row, and `dropTarget`
on its list. Lift `subscriptions` and the Commands from `update` into the
parent. Supply roles, announcements, and styling (including
`touch-action: none` on the handle) in the component. Use DOM-unique item and
container IDs. Transfer List uses a drop indicator rather than a drag ghost.
The single-item behavior uses linear hit testing. Edge scrolling follows the
nearest scrollable ancestor with the viewport as fallback, and rechecks the
drop target after content moves under a stationary pointer. Handles capture
the active pointer when available. Losing capture cancels the drag.

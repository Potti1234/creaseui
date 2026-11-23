# Reorder

Reorder ports ui-sdk's keyboard reordering without a mutable store. Embed
`Reorder.Model`, pass the owner's committed keys to `update`, and render
`order(model, value)`. `Grab` gathers enabled group keys in list order;
`MoveTo` and `Step` change only the draft. `Drop` emits `CommittedOrder`
only when the order changed. `Move` commits immediately with the
`imperative` reason. Route owner changes through `Reflect` to rebase a
draft, or clear it when its grabbed key disappears.

`keydown(model, event)` resolves Space/Enter, arrows, Home/End, Escape and
Tab for vertical, horizontal and grid layouts, including RTL. An active
draft swallows unrelated keys. Do not prevent Tab's default focus move:
its Cancel message has `restoreFocus: false`. Ignore disabled handles
before resolving a grab. Restore focus from `maybeFocus` after keyed DOM
reordering, not before rendering the new order.

Route handle focus and blur through `Focused` and `Blurred`. Run
`reorder-dom.ts`'s `CheckHandleFocus` for `maybeFocusCheck`: it waits for the
render commit so keyed moves can restore focus before departure cancels a draft.

Consume `outMessages` in order: apply committed orders and format
`Announcement` data with the item's label using `reorderMessage` (or a
component-specific formatter), then send the text to Announce with
assertive priority. Components retain ownership of labels, handles,
focus and ARIA semantics. Geometry helpers `dropIndex`, `gridDropIndex`
and `columnsOf` are pure; this module does not track pointer gestures.

# Transfer

Transfer ports ui-sdk's `createTransfer`: items move between named lists
(`Record<string, string[]>`), such as columns on a board. The committed lists
and the in-flight draft live in the Schema Model; the surface Mount only
reports pointer and keyboard facts.

Use Transfer for a sortable list, grid, or board. Transfer List keeps
[`DragAndDrop`](drag-and-drop.md) because its
Astryx rows can be pinned in place, while Transfer moves blocked items aside
for others. Transfer adds what DragAndDrop lacks for multi-list moves:
destination rules (`accepts`), an ordered Left/Right path through lists
(`order`), a draft that survives external list changes (`setLists`),
imperative moves, and per-step announcements.

- Bind key and list unions once with `Transfer.create<Key, List>()`, embed its
  `view` with `h.submodel`, and route messages through `update` with the same
  `Options`. Spread the surface attributes on a common ancestor, each list's
  attributes on its drop area, and each item's attributes on its focusable
  card. Put `touch-action: none` and
  `user-select: none` on cards.
- Render `lists(model)`: the draft while an item moves, else the committed
  lists. `isMoving` marks the picked-up item; `isDragging` marks a pointer
  drag, whose item stays in its draft slot (style it as a placeholder) while
  `maybePreview` gives the fixed-position copy's box. Auto-scroll runs near
  scroller edges unless `autoScroll: false`.
- Set `layout: 'grid'` on the view inputs for wrapped rows. Pointer slots
  follow the rendered row and column geometry. Up and Down move by the
  measured column count, and Left and Right move within the grid in reading
  order. To move between grids, call `moveTo` with a destination list.
- Set `Options.group` to return the selected keys for a picked-up item. The
  group contains eligible items from its source list in source order. Every
  member must pass destination rules. `moveTo` counts positions after
  removing the group. Escape restores the committed order.
- Spread `previewAttributes(preview, h)` on a caller-rendered copy outside
  clipping containers. It supplies fixed coordinates, inert and
  aria-hidden attributes, and a count for styling a group badge. Set
  `preview: false` when the component uses a drop indicator alone.
- Keyboard: Space or Enter picks up and drops, Up/Down move within a list,
  Home/End to its ends, Left/Right to the next list that `accepts` the item
  (mirrored in RTL), Escape puts it back, and Tab puts it back and moves on.
- Handle `OutMessage.Transferred` (committed `lists`, `key`, `from`, `to`,
  `index`, `reason`) and render every `announcement` in an assertive live
  region. `canCommit` vetoes a commit; `disabled` items can't be picked up.
- Use `move` for an immediate move ("Move to Done"), and `grab`, `moveTo`,
  `drop` and `cancel` for a staged one. Call `setLists` when the lists change
  outside Transfer; an in-flight draft is rebased or dropped.
- For an owner-controlled list, pass `controlled: true` to the update. A
  successful drop or imperative move emits the proposed lists and keeps
  them visible while the owner decides. `model.lists` remains the last owner
  value. Use `setLists` to reflect an updated owner value, or `settle(model,
ownerLists)` to explicitly accept, adjust, or reject the proposal. Transfer
  waits for the current proposal to settle before starting another move.

The Sprint board block (`creaseui-kanban-board`) uses Transfer in Tailwind,
StyleX and Pleat: In progress holds at most three cards.

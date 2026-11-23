# Transfer

Transfer ports ui-sdk's `createTransfer`: items move between named lists
(`Record<string, string[]>`), such as columns on a board. The committed lists
and the in-flight draft live in the Schema Model; the surface Mount only
reports pointer and keyboard facts.

Foldkit DragAndDrop remains the better fit for sorting one list (see
[`drag-and-drop.md`](drag-and-drop.md)). Transfer List keeps it because its
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
- Keyboard: Space or Enter picks up and drops, Up/Down move within a list,
  Home/End to its ends, Left/Right to the next list that `accepts` the item
  (mirrored in RTL), Escape puts it back, and Tab puts it back and moves on.
- Handle `OutMessage.Transferred` (committed `lists`, `key`, `from`, `to`,
  `index`, `reason`) and render every `announcement` in an assertive live
  region. `canCommit` vetoes a commit; `disabled` items can't be picked up.
- Use `move` for an immediate move ("Move to Done"), and `grab`, `moveTo`,
  `drop` and `cancel` for a staged one. Call `setLists` when the lists change
  outside Transfer; an in-flight draft is rebased or dropped.

The Sprint board block (`creaseui-kanban-board`) uses Transfer in Tailwind,
StyleX and Pleat: In progress holds at most three cards.

# SwipeActions

SwipeActions ports ui-sdk's horizontal row action reveals. Embed `Model`, route
Messages through `update`, and render `create<Key>().view` with a unique surface
id from `init(id)`. Spread surface, row, content, and `actions(side)` attributes;
make rows focusable and use `touch-action: pan-y`. The Mount measures row/action
widths and RTL direction on press and keyboard input. Actions must remain in
layout when inert so their widths can be measured. Supply the same disabled
predicate to view and update. Hidden actions are inert; components own roles,
labels, transitions, and explicit action buttons.

Exported thresholds are `SWIPE_PROMOTION_SLOP` (8 CSS pixels of Euclidean travel),
`SWIPE_FLICK_VELOCITY` (0.3 pixels/ms), and `DEFAULT_FULL_SWIPE_FRACTION` (0.6).
Unmeasured or zero-width rows cannot swipe or reveal actions. The open-side
model owns action inertness; focus Commands wait for Foldkit's `Render.afterCommit`
before focusing the actions made interactive by that render.

Set `fullSwipeEnabled` to opt a side into full swipes (`fullSwipe` defaults to
0.6 of the row width). Handle `RequestedFullSwipe` in the parent and reply with
`ResolvedFullSwipe` using its version: accept closes, reject settles to the
normal reveal. Stale replies are ignored. Use `show`/`close` for programmatic
control; measure via `MeasuredRow` before showing an unvisited row. Cancel on
row removal with `CancelledSwipe`. Outside presses and taps close the open row;
arrows reveal/focus actions and Escape restores row focus.

Try `/src/docs/examples/swipe-actions/` with `npm run dev` for a renderer-neutral
inbox example.

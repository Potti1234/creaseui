# Behaviors

Behaviors are headless Foldkit Submodels or pure helpers.
State lives in a Schema Model, never in a mutable store or the DOM.
Messages describe facts; update returns the next Model and Commands.
DOM effects belong in Commands; DOM lifecycle resources belong in Mounts.
Views emit attribute bundles and leave roles and ARIA to components.
Components compose behaviors and own selection policy, semantics, and styling.
Bind key unions once with `create<Key>()`; pass item collections as view inputs.
Keep navigation helpers pure and test them independently of rendered views.
RovingFocus establishes this convention for subsequent behavior modules.
Typeahead follows this convention with a version-guarded timeout and pure label search.

Move ports ui-sdk's `createMove` for freeform 2D placement. Foldkit
DragAndDrop remains the better fit for ordering items or transferring them
between containers: it already handles drop targets, the drag ghost, and
keyboard pickup/drop. Move has no drop targets; it changes coordinates.

- Embed `Move.view` with `h.submodel` and route its messages through
  `Move.update`. Spread the surface attributes once on the common ancestor
  and the item attributes on each focusable handle. Put `touch-action: none`
  on those handles (not on the entire scroll surface). Pass the same disabled
  predicate to the view and update; cancel with `CancelledMove` if the active
  handle is removed while the surface stays mounted.
- Render the item's committed `position` and apply its separate draft
  `style` for live translation. Pointer commits snap to `step` and clamp
  to per-item `bounds`; `scale` converts client pixels to position units.
  Alt+arrow nudges the group, Shift uses the larger step, and Escape cancels
  the draft. Unmodified arrow keys remain available for focus navigation.
- Use `moveBy` and `moveTo` for programmatic moves (including disabled
  items); supply `canCommit` to veto a proposal atomically. Render the
  `MovedItems.announcement` in an assertive live region if appropriate.
  Roles, focus, grouping policy, and the live region belong to the caller.

Run `npm run dev` and open `/src/docs/examples/move/` to try the
[renderer-neutral Move example](../../docs/examples/move/main.ts).

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu and Nav Menu use immediate unmount. More Menu, Context Menu
and Menubar's item panels inherit Popup through Dropdown Menu. Nav Menu keeps
hover intent, pinning and focus commands outside Popup. Roles, event detection,
positioning, focus and layering belong to the component; keep Foldkit's Dialog
and Popover for overlays that already use their positioning and focus lifecycle.

Drag follows one pointer with capture and frame-coalesced samples. Use
`observeDrag` in a streaming Mount to convert samples to Schema Messages;
`bindDrag` is the lower-level resource for an already accepted press.
The binding owns listeners and animation frames, not UI state. Consumers
decide whether to react on press, wait for `dragThreshold` (3 CSS pixels
on either axis), or roll back on cancellation. A drop-target surface can
feed client coordinates to `createAutoScroll` and stop it on release,
cancellation, and unmount. Resizable, Drawer, Color Picker, and Lightbox
keep their own sizing, dismissal, channel, and pan policies.

PointerKind tracks primary and attached pointer precision and hover support.
Start with `init()`, or seed it with `pointerKindOf` from a mobile client hint.
Run `ReadPointerKind({})` after the first render to catch up after hydration;
lift `subscriptions` into the parent to follow media-query changes. Route its
messages through `update`. Unknown is not evidence of hover support; components
own the policy for touch fallbacks. `read` is a pure media-query reader.

AvoidKeyboard is a Mount for a bar or footer covered by the on-screen keyboard.
Attach `AvoidKeyboard({})` with `Mount.mapMessage` and handle its completion in
the parent. It owns `translate` while mounted and restores the inline value on
cleanup. Leave translate without a transition; use a padded wrapper for a gap
above the keyboard. `data-keyboard` marks an open keyboard even when the element
needs no lift. Without visualViewport it does nothing. Geometry and translate
helpers are pure; layout space behind the lifted element belongs to the caller.

DragAndDrop wraps Foldkit for single-item pointer sorting in lists and boards.
Prefer it to ui-sdk's `createReorder` for this path: Foldkit already supplies
a Schema Model, typed drag Messages and drop OutMessages, and scoped
subscriptions for thresholded pointer tracking, hit testing, viewport edge
scrolling, and keyboard fallback. The parent applies drop intents to its own
order instead of connecting a mutable store and draft.

Spread `view` on the focusable handle, `sortable` on each row, and `dropTarget`
on its list. Lift `subscriptions` and the Commands from `update` into the
parent. Supply roles, announcements, and styling (including
`touch-action: none` on the handle) in the component. Use DOM-unique item and
container IDs. Transfer List uses a drop indicator rather than a drag ghost.
This wrapper retains Foldkit's linear hit testing and viewport scrolling; it
does not implement ui-sdk's grid/group moves, nested-scroller auto-scroll,
or pointer-capture/loss handling.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

TreeCollection ports [ui-sdk.dev's tree helpers](https://ui-sdk.dev/docs/core/behaviors/trees).
Foldkit UI does not expose a tree collection. Use `createTreeCollection` for
parent, sibling, and descendant lookups and `visibleTreeRows` for flat render
order. Use `visibleTreeRowsBy` with an existing item's key and expansion policy,
as Tree List does. Sidebar navigation uses the same row projection without
adopting tree ARIA or keyboard semantics.

Store expanded and checked values in the parent Schema. Use
`treeCheckedStates` in view and `toggleTreeChecked` in update with the same
strategy (`leaf`, `trunk`, `branch`, or `independent`). Supply `checkable`
to protect locked nodes and their descendants from ancestor toggles. The
collection indexes input data but does not retain the last expansion value.

Spans edits numeric ranges on named tracks, such as room bookings or clips.
Foldkit Slider edits scalar values and DragAndDrop reorders items; neither
models drawing a range, resizing either edge, or testing track overlap. Use
`Spans.create(Booking)` with a Schema extending `Spans.Span.fields`, then
embed its `Model` and route its `Message` through `update`. Render `spansOn`
to show the current draft and consume `ChangedSpans` once on release or for
each keyboard/programmatic edit. A `create` callback returns `Option.none()`
to decline drawing. `ReflectedSpans` reconciles owner edits
without committing a draft. `stackSpans` supplies lanes for overlaps when
allowed.

Use `Pointer` from `spans-pointer.ts` on a stable board element with
`data-span-track` on tracks, `spanAttrs` on spans, and `data-span-edge` on
the optional resize handles. Give tracks `touch-action: none` and
`user-select: none`; the Mount
supplies live geometry, cancellation and optional edge scrolling. Components
route unmodified navigation keys, supply ordered track names and direction,
and own focus, announcements and semantics. `movedTrack` and `spansMessage`
help with focus restoration and live-region text.

Try the [room-booking demo](../../docs/spans-demo.html) locally:
`npm run dev -- --open /src/docs/spans-demo.html`.

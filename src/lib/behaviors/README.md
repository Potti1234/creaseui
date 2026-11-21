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
hover intent, pinning and focus commands outside Popup. Components own roles
and focus policy; compose Position and Layer when a custom popup also needs
geometry or dismissal. Keep Foldkit Dialog and Popover for overlays that
already use their positioning and focus lifecycle.

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

### Position

[ui-sdk position](https://ui-sdk.dev/docs/core/behaviors/popups#placing-a-popup)
is independent of disclosure and dismissal. For an ID-based anchor,
`Position.view({ buttonId, anchor, ... }, send, h)` supplies a scoped Mount
around Foldkit Anchor. Prefer it when you want Foldkit's collision handling,
shadow-root and dialog-aware portals, and focus after first paint. Crease's
theme-preserving overlay boundary composes `Position.bindAnchor` so the
[Popover demo](https://creaseui.com/docs/components/popover) keeps its scoped
theme and focus.

Foldkit Anchor only resolves HTML triggers by ID. For points and live
rectangles, `Position.mountPoint({ point, options })` accepts Schema inputs,
and `Position.position(anchorOrGetter, panel, optionsOrGetter)` uses the same
Floating UI engine without requiring a trigger element. It reports resolved
`data-side` and `data-align`, available size, arrow offsets, and the transform
origin. Dispose it at unmount; `cleanup.place()` requests a fresh placement.
Mount arguments are fixed for the mount lifetime; key the panel anew for a
different model-owned point, or use the getter API in a custom integration.

### Layer

[ui-sdk bindLayer](https://ui-sdk.dev/docs/core/behaviors/popups#layers-of-your-own)
is for floating elements whose open state and layout the owner controls.
`Layer.view({ insideIds: [triggerId], topLayer: true }, send, h)` supplies
a Mount that emits `RequestedDismissal` with Escape, outside press, or
window-blur reasons. Blur and the native top layer are opt-in. The last
mounted layer gets Escape; an outside press can dismiss several layers until
it reaches one it is inside. Modal layers consume the outside press.
`Layer.persistentView` exempts a region from the standalone dismissal stack.
Custom native-layer elements should reset the browser's default popover
inset, margin, padding, border, and background.

Prefer `Layer.Popover` (Foldkit's submodel) or Foldkit Dialog for full
overlays: they already coordinate focus entry and return, modal isolation,
ARIA wiring, and transitions. Neither exposes a standalone dismissal stack.
Layer does not replace their lifecycle or make an element outside a native
modal dialog interactive. Use native Dialog when modal input must be blocked
before handlers on a closed shadow host run. The
[Action Bar demo](https://creaseui.com/docs/components/action-bar) uses Layer
for Escape only and retains parent-owned selection and roving focus.

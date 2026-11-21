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

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

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

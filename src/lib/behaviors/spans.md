# Spans

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

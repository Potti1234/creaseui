# Resize

Use `resizeBox` with a starting box, a handle, a delta, and optional size limits, bounds or an aspect ratio. [UI SDK dragging and resizing guide](https://ui-sdk.dev/docs/core/behaviors/dragging)

For a custom Foldkit view, keep `Resize.Model` in the parent model and forward `Resize.Message` to `Resize.update`. Render `model.draft?.box ?? model.box` while the pointer moves. Finish to commit the draft, or finish with `cancelled: true` to restore the starting box. Send `NudgedBoxResize` for keyboard adjustments.

Wrap `observeResize` in a streaming Foldkit Mount and map pointer start, move, and finish into your own messages or the shared resize messages. It provides deltas from the original pointer position and supports a drag threshold and Escape cancellation. Omit the threshold to start on pointerdown, as Resizable does for live percentage updates.

Use `resizeMessage(model.box, label)` in a status region to announce committed geometry. Supply your own formatter for localized text or other units. The renderer's `resizableBox` uses this contract and announces keyboard adjustments as they commit. Its existing keyboard controls use Shift for a larger step and its pointer controls use Shift to lock the aspect ratio.

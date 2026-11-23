# Resize

[UI SDK Resize](https://ui-sdk.dev/docs/core/behaviors/direct-manipulation) supplies the box geometry. Use `resizeBox` with a starting box, a handle, a delta, and optional size limits, bounds or an aspect ratio.

Resizable passes pointer and keyboard deltas through the east edge of a percentage-sized box. It retains its existing Foldkit drag lifecycle and pane limits.

For a standalone box, use `resizableBox` from the renderer's Resizable entry point. Its parent owns the box model and calls `updateBoxResize` with any constraints. Drag a handle or use the arrow keys to move it. Shift preserves the aspect ratio while dragging and takes a larger step with the arrow keys. Escape cancels an active drag.

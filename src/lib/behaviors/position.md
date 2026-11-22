# Position

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

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
Dropdown Menu uses immediate unmount. Components own roles and focus policy;
compose Position and Layer when the popup also needs geometry or dismissal.

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

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

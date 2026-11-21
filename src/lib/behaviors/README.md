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

SpatialFocus follows the same model and attribute-bundle convention for uneven
layouts. Arrow keys use screen geometry (45° cone first, side distance counted
twice), without wrapping or RTL reversal; Home/End use the supplied document
order. Pass keys in document order and disable unavailable items with
`isDisabled`. Rect reads and focus happen in Commands, never in the view.
Alt/Ctrl/Meta shortcuts are left alone. `arrowDirection`, `nearestInDirection`,
and `spatialTarget` are pure helpers for callers with their own geometry.

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

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

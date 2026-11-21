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

[StickToBottom](https://ui-sdk.dev/docs/core/behaviors/lists#stick-to-bottom)
follows a growing scroll viewport with a configurable bottom threshold (24 px
by default). Use the Schema model and `update`, and bind `viewportMount` to
the element with ID `${id}-viewport`. Mount measures the visible row when
content changes; update decides whether to follow, hold that row in place,
or flag unseen growth. Use `RequestedScroll` to jump and follow again, or
`Released` to stop following. Send `RequestedPrepend` immediately before
adding history above to explicitly preserve the distance from the bottom.
Message Scroller starts pinned; Log Stream opts out by default.

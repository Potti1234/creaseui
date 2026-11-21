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
focus and layering belong to the component.

Dialog and Popover wrap `@foldkit/ui` instead of porting the UI SDK popup
controller. Foldkit Dialog manages the native dialog, focus containment and
restoration, inert background, and scroll locking for the dialog lifetime.
Foldkit Popover already combines collision-aware anchoring, optional modal
resources, and focus restoration with its exit lifecycle. The wrappers keep
these Commands and Mounts intact; each renderer supplies only the skin.

Tooltip wraps Foldkit's focus and Escape handling, versioned show wait, and
anchoring instead of replicating them around a mutable store. The adapter
keeps CreaseUI's close wait and focus-visible policy; the renderers still
own the trigger and tooltip markup.

HoverIntent keeps Foldkit's Schema Model, cancellable waits, focus ownership,
and Escape behavior. UI SDK also keeps the panel open while the pointer
crosses the gap from trigger to panel; `watchPointerDeparture` adds that
geometry and reports a departure only outside the bridge. Acquire it in the
panel Mount and route departure to the same Message as leaving the common
hover region. The watcher ignores touch and cleans up on unmount.
The Hover Card docs use this across Tailwind, StyleX, and Pleat.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

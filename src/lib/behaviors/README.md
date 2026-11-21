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

UndoStack is pure snapshot history adapted from ui-sdk's UndoStack algorithm.
Keep the present value in the component and push it before an edit; undo and
redo return the next history and present value. New edits discard the redo
branch. Pass an optional non-negative integer `limit` to drop the oldest undo
steps; history is unlimited by default to preserve data-grid behavior (ui-sdk
defaults to 100). Grouping, timed merges and snapshot mapping are omitted:
data-grid records discrete commits, not individual keystrokes. Clear history
when replacing the component's value from outside.

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

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

Shortcuts provides pure platform-aware ARIA, display, matching, typing-target
and newest-enabled-binding resolution helpers. ListenShortcuts owns a document
keydown listener for its Mount lifetime and emits PressedShortcut messages.
Layer priority and named scopes are intentionally left to the host application;
item keys metadata does not register application actions automatically.

Announce provides describeList and visually-hidden liveRegionAttributes for
view-derived status text. Its optional Model clears imperative announcements
before a delayed, version-checked completion, so repeated text can be announced
without stale delays overwriting newer requests. Render model.text with the
attributes for model.priority.

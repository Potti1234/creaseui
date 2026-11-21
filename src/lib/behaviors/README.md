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

HoldRepeat ports @ui-sdk/core's bindHold/bindRepeat timing: hold defaults to
500ms, repeat to 400ms then 60ms, without acceleration. Use `init`, `Message`,
`update`, and `attributes(h, toMessage)`. Pass `mode: 'hold'` for hold-only,
`disabled` to cancel, and `canStep: false` to refuse further steps at a bound.
Pointer ownership, keyboard identity, counts and timer versions live in Model;
the Mount only forwards DOM facts and cleans up listeners. Repeat pauses outside
the button and resumes on re-entry. Touch/pen tap on release, mouse/keyboard on
press. Components consume Stepped and own value/boundary policy.

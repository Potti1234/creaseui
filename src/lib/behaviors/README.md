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

InputHistory recalls oldest-first string entries with Up/Down and restores the
draft after the newest entry. Pass entries to `update` and `attributes`; the
component writes `RestoredValue.value` and maps returned Commands. Spread
`attributes(model, inputs, send, h)` on the editor, alongside its ID. The Mount
reads a serialized view projection on each keydown, so its listener never
captures stale state; only a successful navigation prevents the browser key.
State remains in the parent-owned Schema Model (current key, draft, keyed edits).
Send `Reset` after submission or when replacing history. A stable `getEntryKey`
preserves position across rebuilt lists and appended entries without Reset;
the default identity combines index and string. Keys must be unique.
Textarea edges use a layout mirror, including soft wrapping. Custom editors can
use `create({ atEdge })`; they own value rendering and caret placement when the
native input/textarea caret Command does not apply.

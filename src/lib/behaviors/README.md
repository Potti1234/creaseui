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
Typeahead follows this convention with a version-guarded timeout and pure label search.

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

PointerKind tracks primary and attached pointer precision and hover support.
Start with `init()`, or seed it with `pointerKindOf` from a mobile client hint.
Run `ReadPointerKind({})` after the first render to catch up after hydration;
lift `subscriptions` into the parent to follow media-query changes. Route its
messages through `update`. Unknown is not evidence of hover support; components
own the policy for touch fallbacks. `read` is a pure media-query reader.

AvoidKeyboard is a Mount for a bar or footer covered by the on-screen keyboard.
Attach `AvoidKeyboard({})` with `Mount.mapMessage` and handle its completion in
the parent. It owns `translate` while mounted and restores the inline value on
cleanup. Leave translate without a transition; use a padded wrapper for a gap
above the keyboard. `data-keyboard` marks an open keyboard even when the element
needs no lift. Without visualViewport it does nothing. Geometry and translate
helpers are pure; layout space behind the lifted element belongs to the caller.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

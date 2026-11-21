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

Listbox is the headless highlight/filter/navigation layer from ui-sdk.dev.
Bind keys with `Listbox.create<Key>()`, embed its Model (initial highlight is
None), and pass ordered keys and labels as view inputs. `filter` and `count`
accept contains (default), startsWith, or a boolean/score callback; higher
positive scores rank first, zero hides. Empty queries keep the original order.
Real focus uses RovingFocus's item ids and FocusItem Command. Virtual focus
only changes the highlight; point the input's aria-activedescendant at
`activeId(model)`. Home/End and Typeahead apply to Real focus by default;
Virtual consumers can explicitly set `homeEnd: true`. Page navigation uses
`pageSize` enabled options (default 10); components measuring a viewport can
supply its size. `first`/`last` work in either focus mode. Pass only unmodified
printable keys to the view's keydown callback for typeahead.
Pointer highlight does not choose. Pair Listbox with `Selection.create<Key>()`
for choosing, or keep the component's existing selection policy. Roles and
aria-selected belong to that component. Command reuses the pure helpers while
retaining Foldkit Combobox state and its existing accent-sensitive search.
Select stays on @foldkit/ui Listbox for its button/anchor/top-layer/focus
lifecycle; this behavior does not replace that lifecycle.

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu uses immediate unmount. Roles, event detection, positioning,
focus and layering belong to the component; keep Foldkit's Dialog and Popover
for overlays that already use their positioning and focus lifecycle.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

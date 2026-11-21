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

## ScrollPicker

ScrollPicker is a native Foldkit port of `@ui-sdk/core` beta.13's
`bindScrollPicker`, not a wrapper around its mutable binding. `@foldkit/ui`
has no equivalent. The Model owns geometry, the fractional cursor, the last
reported index and the interaction phase. Commands scroll and focus; the
Mount owns measurements, event listeners, pointer capture, observers, animation
frames and their cleanup. The DOM adapter is in `scroll-picker-dom.ts`.

Bind `ScrollPicker.create()` once. Render its list and item attribute bundles
on a listbox and its options. Supply roles, a name, tabindex, `aria-selected`
and `aria-disabled` in the component. Fold `Selected { index, reason }` into
parent-owned selection; the behavior never writes selection or ARIA. Send
`ChangedSelection` for parent-driven changes, or render `aria-selected` and let
the Mount observe it. Indices include disabled options. The initial selection
centers instantly; subsequent external selections glide without reporting the
options passed. Reduced motion disables gliding.

Give the list overflow, a fixed viewport, `scroll-snap-type: y mandatory` and
enough padding at both ends to center the first and last options. Give options
`scroll-snap-align: center`. For horizontal wheels use horizontal orientation,
inline padding and `scroll-snap-type: x mandatory`; RTL is supported. Disable
any composing listbox's automatic keep-in-view effect. `--picker-offset` is
painted on each option for fractional wheel styling. Arrow keys, Home/End,
typeahead and clicks remain the component's responsibility; the Mount handles
PageUp/PageDown, native scrolling/touch and mouse/pen dragging.

Pure helpers (`pickerPosition`, `nearestEnabled`, `pageSize`, `pageTarget`,
`projectRelease`) and update transitions are covered in
`test/scroll-picker.test.ts`. The docs Time Input page demonstrates
parent-owned hour/minute selection in all three renderers.

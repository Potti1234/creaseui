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

## RadioGroup

RadioGroup keeps the `@foldkit/ui` primitive. It already models focus as an
immutable Schema submodel, leaves the selected value with the parent, and
ships the APG-complete parts ui-sdk's radio would need porting for: disabled
and read-only options, Home/End/Page keys, focus Commands, label and
description ids, and the hidden form input. `behaviors/radio-group.ts` is the
seam components import: the primitive's Model, Message, OutMessage and
`init`, plus `create<Value>()`, whose view also accepts `direction` and maps
both arrow axes onto the group's orientation as the APG pattern requires.
The pure `toOrientationKey` holds that key policy. Components still own the
rendered markup, labels, indicator and styling.

## Slider

Slider keeps the `@foldkit/ui` primitive. Its pointer drag is a tagged,
Schema-modelled lifecycle driven by Subscriptions, with Escape cancel,
keyboard steps, pointer-to-value mapping and the hidden form input, which
matches ui-sdk's slider without a mutable store. `behaviors/slider.ts` is the
seam components import: the primitive's API, the range policy ui-sdk keeps in
`@ui-sdk/core/number` (`normalizeRange` and `snapRangeValue` cover its
`scrubTo` ordering, clamping, step grid from `min` and float rounding), and
the multi-thumb submodel the primitive does not ship. Multi-thumb keeps one
primitive Model per thumb, routes track presses to a thumb index, mirrors
values for RTL and aggregates each thumb's drag Subscriptions.

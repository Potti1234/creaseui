# Slider

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

# RadioGroup

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

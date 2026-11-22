# Area

Area ports ui-sdk's `createArea` as a two-axis point picker. Embed its Model,
route Messages through `update`, and consume ChangedValue/CommittedValue
OutMessages. Axis values snap and clamp independently; fractions use y from
the bottom. `reflect` reconciles owner values without emitting a change.
Spread `thumbAttrs` and `thumbStyle` on the focusable thumb, route unmodified
keys with `keyMessage`, and mount `Pointer` on the surface. Set its
`aria-disabled` and `touch-action: none`; pass the same disabled option to
update and thumbAttrs. Components own the accessible name and styling.
Arrows step, Shift multiplies by ten, Page keys move y by a tenth of its
range, and Home/End select x's ends. Set `rtl` for keyboard direction;
the pointer Mount reads the surface direction.

Try the saturation/value pad at `/docs/components/color-picker` with
`npm run dev` (also available on the StyleX and Pleat sites).

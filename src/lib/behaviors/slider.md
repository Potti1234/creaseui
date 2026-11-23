# Slider

CreaseUI owns Slider interaction state in a Foldkit child Model. The parent supplies
the current value or values, handles change OutMessages, and lifts the pointer and
Escape subscriptions. Reflect external bounds with reflectRange or reflectMultiRange
and conform the parent-owned values to those bounds in the same update.

A range or multi-slider uses one interaction Model per thumb and routes track presses
to the nearest thumb. Thumbs can cross while keeping their index, label, and form
field name. The fill spans the outermost values. For horizontal RTL, initialize the
multi-slider with mirrored enabled and render it with direction set to rtl.
Positions use the mirrored axis, while ARIA and form inputs carry logical values.

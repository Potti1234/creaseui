# Calendar

Calendar owns the model and messages, date navigation, focus command, and
accessible grid attributes shared by Tailwind, StyleX, and Pleat. The model
and messages retain their Foldkit Calendar shape so consumers can continue
composing them with the DatePicker submodel.

Pass the parent's selected date as `maybeSelectedDate` and apply
`SelectedDate` out messages in the parent. Use `normalizeRange` and
`rangePosition` for range highlighting, and `isDisabled` to read the
reflected constraints. Use `dateInTimeZone` to convert an instant to a
calendar date at the application boundary.

The renderer's `direction` prop mirrors horizontal keys before forwarding
messages to the parent. For keys routed directly to the behavior, call
`update(model, message, { direction: 'rtl' })` to apply the same translation.
Home and End select a focus target within the current week row according to
the locale and leave focus in place if the whole row is disabled.

The legacy `lib/calendar` module re-exports the behavior.

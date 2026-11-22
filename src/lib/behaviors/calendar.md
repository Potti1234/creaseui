# Calendar and DatePicker

Keep @foldkit/ui rather than porting ui-sdk.dev's Calendar/DatePicker and
@ui-sdk/core/date. Foldkit's declarations expose Schema Model and Message
values, Days/Months/Years ViewMode, locale configuration, min/max and disabled
date/day-of-week reflection, and a FocusGrid Command. Its Calendar view supplies
APG grid attribute bundles; DatePicker embeds that Calendar and a Popover Model
with open/close, focus and animation lifecycle. These fit Foldkit's update and
Command architecture directly. ui-sdk's declarations instead use ISO date strings,
single/multiple/range selection policies, callback-driven options and popup
results; its date foundation adds ISO arithmetic, formatting and parsing.
Those are useful APIs, but not a reason to replace the existing Schema submodels.

Import behaviors/calendar or behaviors/date-picker as a namespace. Route messages
through update(model, message, { direction: 'rtl' }) for mirrored horizontal grid
keys; omit direction for LTR. Both updates keep Home/End within the focused week
row's enabled days (and leave focus unchanged if none are enabled). Month and
year picker keys still defer to Foldkit. Existing renderer updateForRtl adapters
remain compatible; do not mirror the same message twice.

Selection stays parent-owned. Compose CalendarRange, normalizeRange and
rangePosition for range highlighting and policy; use isDisabled for the reflected
calendar constraints. Convert instants at the boundary with dateInTimeZone.
The legacy lib/calendar module re-exports the calendar behavior.

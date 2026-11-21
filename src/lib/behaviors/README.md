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

## Calendar and DatePicker

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

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

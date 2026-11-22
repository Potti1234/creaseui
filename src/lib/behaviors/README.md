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
Use its pure navigation helpers when focus targets belong to another component
(menubar), are supplied as opaque Html (toolbar), or movement delegates to a
mounted resource without moving DOM focus (carousel).

Typeahead follows this convention with a version-guarded timeout and pure label search.

Virtualizer wraps Foldkit VirtualList rather than porting ui-sdk's
`createVirtualizer`: it keeps a Schema Model instead of a mutable store and
subscribe, scroll/resize via a scoped Subscription with MutationObserver
reattach across mounts, and a version-guarded programmatic scroll Command.
Spacer layout keeps rows in normal flow without absolute positioning.
The wrapper adds start/center/end/auto alignment, `isNearEnd`, and
`rowPosition` ARIA position values. Uniform
`scrollToIndex(model, itemCount, index, options?)` needs the count for clamping;
the variable-height counterpart derives it from items. Auto emits no Command
when the row is fully visible. Empty collections are no-ops. Parents track
"once per count" themselves when using `isNearEnd` to load more.
Callers supply nonnegative finite dimensions and valid row indices to
`rowPosition`; components own roles and map its values to ARIA attributes.
Not covered: `scrollMargin` (Foldkit's scroller has no content before the first row),
measured dynamic row heights (`measure`/`reset`; callers supply
heights via `itemToRowHeightPx`), horizontal lists, `keep` for non-contiguous
rows, or findable/find-in-page layers.

Try `npm run dev -- --open /src/docs/examples/virtualizer/`.

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
retaining Foldkit Combobox state with folded fuzzy ranking.

## Text Match

`text-match.ts` provides pure fuzzy scoring, match ranges and display segments.
Length-preserving, collator-based folding respects the runtime locale; pass a
locale or a folder explicitly for deterministic language-specific matching.
Unlike ui-sdk, folding unifies Greek final sigma `ς` with `σ`.
Scoring folds and trims both inputs, while display ranges preserve label offsets.
Command ranks through Listbox’s score callback and highlights matched letters.
Select stays on @foldkit/ui Listbox for its button/anchor/top-layer/focus
lifecycle; this behavior does not replace that lifecycle.

Move ports ui-sdk's `createMove` for freeform 2D placement. Foldkit
DragAndDrop remains the better fit for ordering items or transferring them
between containers: it already handles drop targets, the drag ghost, and
keyboard pickup/drop. Move has no drop targets; it changes coordinates.

- Embed `Move.view` with `h.submodel` and route its messages through
  `Move.update`. Spread the surface attributes once on the common ancestor
  and the item attributes on each focusable handle. Put `touch-action: none`
  on those handles (not on the entire scroll surface). Pass the same disabled
  predicate to the view and update; cancel with `CancelledMove` if the active
  handle is removed while the surface stays mounted.
- Render the item's committed `position` and apply its separate draft
  `style` for live translation. Pointer commits snap to `step` and clamp
  to per-item `bounds`; `scale` converts client pixels to position units.
  Alt+arrow nudges the group, Shift uses the larger step, and Escape cancels
  the draft. Unmodified arrow keys remain available for focus navigation.
- Use `moveBy` and `moveTo` for programmatic moves (including disabled
  items); supply `canCommit` to veto a proposal atomically. Render the
  `MovedItems.announcement` in an assertive live region if appropriate.
  Roles, focus, grouping policy, and the live region belong to the caller.

Run `npm run dev` and open `/src/docs/examples/move/` to try the
[renderer-neutral Move example](../../docs/examples/move/main.ts).

Popup is the pure open/close lifecycle for custom overlays. Route trigger or
explicit requests separately from Escape, outside press, and focus-out dismissal
requests. Read the reason from the OutMessage. For exit transitions, pass
`waitForExit` to update, render while `isMounted(model)`, and send
`CompletedExit` with that exit's `model.exitVersion` when it finishes.
Dropdown Menu and Nav Menu use immediate unmount. More Menu, Context Menu
and Menubar's item panels inherit Popup through Dropdown Menu. Nav Menu keeps
hover intent, pinning and focus commands outside Popup. Roles, event detection,
positioning, focus and layering belong to the component.

Dialog and Popover wrap `@foldkit/ui` instead of porting the UI SDK popup
controller. Foldkit Dialog manages the native dialog, focus containment and
restoration, inert background, and scroll locking for the dialog lifetime.
Foldkit Popover already combines collision-aware anchoring, optional modal
resources, and focus restoration with its exit lifecycle. The wrappers keep
these Commands and Mounts intact; each renderer supplies only the skin.

Tooltip wraps Foldkit's focus and Escape handling, versioned show wait, and
anchoring instead of replicating them around a mutable store. The adapter
keeps CreaseUI's close wait and focus-visible policy; the renderers still
own the trigger and tooltip markup.

HoverIntent keeps Foldkit's Schema Model, cancellable waits, focus ownership,
and Escape behavior. UI SDK also keeps the panel open while the pointer
crosses the gap from trigger to panel; `watchPointerDeparture` adds that
geometry and reports a departure only outside the bridge. Acquire it in the
panel Mount and route departure to the same Message as leaving the common
hover region. The watcher ignores touch and cleans up on unmount.
The Hover Card docs use this across Tailwind, StyleX, and Pleat.

## Observe, History and Agent

Components describe agent-visible state as data owned by the application.
Observe selects Commit changes by default, or Live steps when requested.
The component supplies the Commit's previous value from before the interaction.
History records Observe changes and emits Apply with values to restore.
The app maps those values to its own Messages; History never mutates controls.
Agent plans and validates steps against the current component descriptions.
RunStep asks the app to execute; RequestApproval asks a person to approve.
Report completion or failure back to Agent to advance or finish the run.
Use agentChange for source 'agent', and explicit secret flags for redaction.

Foldkit DevTools remains the better tool for development-time agent inspection.
Its MCP bridge offers Schema-typed Message dispatch and model time travel with
keyframes, and stays as is. It is dev-only and model-level, not the in-app,
user-facing agent and history these modules port: per-control undo by source,
confirmation and redaction.

Drag follows one pointer with capture and frame-coalesced samples. Use
`observeDrag` in a streaming Mount to convert samples to Schema Messages;
`bindDrag` is the lower-level resource for an already accepted press.
The binding owns listeners and animation frames, not UI state. Consumers
decide whether to react on press, wait for `dragThreshold` (3 CSS pixels
on either axis), or roll back on cancellation. A drop-target surface can
feed client coordinates to `createAutoScroll` and stop it on release,
cancellation, and unmount. Resizable, Drawer, Color Picker, and Lightbox
keep their own sizing, dismissal, channel, and pan policies.

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

InlineEdit is the pure in-place editing lifecycle. It owns the editing id,
draft and type-over flag, and reports starts, changed commits, unchanged ends,
cancellation and rejected validation through OutMessages. Use startKey and
inputKey for keyboard intent. Components own editor focus, selection/caret,
focus restoration, roles and ARIA; grids retain navigation and editor policy.

DragAndDrop wraps Foldkit for single-item pointer sorting in lists and boards.
Prefer it to ui-sdk's `createReorder` for this path: Foldkit already supplies
a Schema Model, typed drag Messages and drop OutMessages, and scoped
subscriptions for thresholded pointer tracking, hit testing, viewport edge
scrolling, and keyboard fallback. The parent applies drop intents to its own
order instead of connecting a mutable store and draft.

Spread `view` on the focusable handle, `sortable` on each row, and `dropTarget`
on its list. Lift `subscriptions` and the Commands from `update` into the
parent. Supply roles, announcements, and styling (including
`touch-action: none` on the handle) in the component. Use DOM-unique item and
container IDs. Transfer List uses a drop indicator rather than a drag ghost.
This wrapper retains Foldkit's linear hit testing and viewport scrolling; it
does not implement ui-sdk's grid/group moves, nested-scroller auto-scroll,
or pointer-capture/loss handling.

## Storage, Preference and ColorScheme

Storage descriptors are Schema data: choose local, session or cookie and an id.
Run get, set, remove and available inside Effects or Commands. Failures return
Option.none() or false, never prevent an in-memory preference change. get returns
Option<string>; set and remove return boolean success (cookies are read back
to verify writes). Cookie defaults
are one year, path /, SameSite=Lax and Secure on HTTPS. The changes stream owns
cross-document storage listeners (including clear); cookies have no change stream.
script returns an Option<string> containing a validated data-* attribute pre-paint
script for web storage, or Option.none() for cookies.

Bind allowed strings with Preference.create<Value>({ values, defaultValue,
attribute, storage }). init and decode accept Option<string> from storage, falling back to the
default. RequestedValue persists only actual changes; RestoredValue and
ReceivedStoredValue report restore/storage-sync without writing back. Updates
return ChangedValue OutMessages. attributes exposes a pure data-attribute bundle;
compose changes into the parent's subscriptions and lift command messages.

ColorScheme composes Preference for system, light and dark, defaulting to system.
Its Schema model also tracks the OS scheme (unknown resolves to light). Compose
changes to follow live OS and storage changes. Apply owns the documentElement
dark class and style.colorScheme; updates apply only resolved changes. Initialize
from Storage.get and the OS inside an Effect, never by reading DOM from update.

Selection ports the key-based behavior from [ui-sdk.dev](https://ui-sdk.dev/docs/core/behaviors/selection).
Bind keys with `Selection.create<Key>()` and embed `Selection.Model` in the
parent Schema. Call its pure transitions from update and commit the returned
Model only if the parent accepts the change. Use `reflect` for externally
supplied values; changing the selected keys starts the next range over.
Pass the current ordered keys for ranges or select-all. MultiSelector passes
the visible keys for select-all so a filter never clears hidden choices.

TreeCollection ports [ui-sdk.dev's tree helpers](https://ui-sdk.dev/docs/core/behaviors/trees).
Foldkit UI does not expose a tree collection. Use `createTreeCollection` for
parent, sibling, and descendant lookups and `visibleTreeRows` for flat render
order. Use `visibleTreeRowsBy` with an existing item's key and expansion policy,
as Tree List does. Sidebar navigation uses the same row projection without
adopting tree ARIA or keyboard semantics.

Store expanded and checked values in the parent Schema. Use
`treeCheckedStates` in view and `toggleTreeChecked` in update with the same
strategy (`leaf`, `trunk`, `branch`, or `independent`). Supply `checkable`
to protect locked nodes and their descendants from ancestor toggles. The
collection indexes input data but does not retain the last expansion value.

Spans edits numeric ranges on named tracks, such as room bookings or clips.
Foldkit Slider edits scalar values and DragAndDrop reorders items; neither
models drawing a range, resizing either edge, or testing track overlap. Use
`Spans.create(Booking)` with a Schema extending `Spans.Span.fields`, then
embed its `Model` and route its `Message` through `update`. Render `spansOn`
to show the current draft and consume `ChangedSpans` once on release or for
each keyboard/programmatic edit. A `create` callback returns `Option.none()`
to decline drawing. `ReflectedSpans` reconciles owner edits
without committing a draft. `stackSpans` supplies lanes for overlaps when
allowed.

Use `Pointer` from `spans-pointer.ts` on a stable board element with
`data-span-track` on tracks, `spanAttrs` on spans, and `data-span-edge` on
the optional resize handles. Give tracks `touch-action: none` and
`user-select: none`; the Mount
supplies live geometry, cancellation and optional edge scrolling. Components
route unmodified navigation keys, supply ordered track names and direction,
and own focus, announcements and semantics. `movedTrack` and `spansMessage`
help with focus restoration and live-region text.

Try the [room-booking demo](../../docs/spans-demo.html) locally:
`npm run dev -- --open /src/docs/spans-demo.html`.

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
Command item configs can expose `label` and optional `leadingContent` for an
icon/adornment. Renderers highlight the label automatically; `searchText` can
still extend the searchable text. Legacy rich `content` remains opaque.

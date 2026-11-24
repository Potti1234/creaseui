# HoverIntent

The parent owns the Foldkit Schema model, routes child messages through
`update`, forwards its commands, and handles `Opened` and `Closed` when
visibility changes. Pointer entry and departure default to 200 ms and 300 ms.
Focus opens immediately. Blur schedules a zero-delay close when neither region
is hovered, so focus can move between the trigger and panel before it fires.
Version checks discard stale wait completions.

Use `view` to attach the trigger and panel event attributes. Pass
`focusTriggerSelector` to restore trigger focus when Escape is pressed in the
panel. Escape and programmatic `close` invalidate pending waits and suppress
reopening while the trigger remains engaged.

`watchPointerDeparture` keeps the panel open while the pointer crosses the gap
from trigger to panel. Acquire it in the panel Mount and route departure to
the same message as leaving the common hover region. The watcher ignores touch
and cleans up on unmount. The Hover Card docs use it across Tailwind, StyleX,
and Pleat.

Choose `hoverCardPreset` for an interactive panel whose focus may move inside
during blur. Choose `tooltipPreset` for a trigger-only surface where blur uses
the configured close delay, with immediate closing when that delay is zero.
For a trigger-only surface, route trigger interactions and `Dismissed` only.

Pass the preset to `update` to use the shared Foldkit Commands. Adapters that
already expose their own command messages can call `transition` instead and
schedule the returned wait using its phase, delay, and version.

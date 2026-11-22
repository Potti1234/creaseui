# HoverIntent

HoverIntent keeps Foldkit's Schema Model, cancellable waits, focus ownership,
and Escape behavior. UI SDK also keeps the panel open while the pointer
crosses the gap from trigger to panel; `watchPointerDeparture` adds that
geometry and reports a departure only outside the bridge. Acquire it in the
panel Mount and route departure to the same Message as leaving the common
hover region. The watcher ignores touch and cleans up on unmount.
The Hover Card docs use this across Tailwind, StyleX, and Pleat.

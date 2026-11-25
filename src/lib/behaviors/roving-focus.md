# RovingFocus

RovingFocus establishes this convention for subsequent behavior modules.
Use its pure navigation helpers when focus targets belong to another component
(menubar), are supplied as opaque Html (toolbar), or movement delegates to a
mounted resource without moving DOM focus (carousel).

Set `focusDisabledWithArrows` to let arrow keys reach ARIA-disabled items
and continue navigating from them. Keep the item focusable and guard its
activation in the consumer. The Tab stop, Home, and End still use enabled
items when available. With this option, an all-disabled group can still
give one focusable item the Tab stop. Leaving the option unset preserves
disabled-item skipping and the existing Tab stop policy.

Use `isFocusable` to exclude a rendered item from navigation and the Tab
stop independently of whether it can be activated. Use `remember: false`
on the view to clear its remembered key on blur. The preferred enabled
item then becomes the Tab re-entry point.

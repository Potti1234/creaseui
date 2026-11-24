# RovingFocus

RovingFocus establishes this convention for subsequent behavior modules.
Use its pure navigation helpers when focus targets belong to another component
(menubar), are supplied as opaque Html (toolbar), or movement delegates to a
mounted resource without moving DOM focus (carousel).

Set `focusDisabledWithArrows` to let arrow keys reach ARIA-disabled items
and continue navigating from them. Keep the item focusable and guard its
activation in the consumer. The Tab stop, Home, and End still use enabled
items, and leaving the option unset preserves disabled-item skipping.

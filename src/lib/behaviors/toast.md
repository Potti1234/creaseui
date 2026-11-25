# Toast

Toast owns a keyed notification queue. Each item has a lifetime, transition,
and optional action. The application decides what displaying a notification
or handling its action means for its domain.

## Compose notifications

Keep the Toast Model in the parent and route messages through update. Lift
the returned Commands for timers and animation. Pass a sticky notification
when the user needs time to read or act. Timer versions keep old completions
from dismissing items whose lifetime has since changed.

The renderers position the queue, expose status or alert semantics, and pass
pause and swipe events into the same behavior.

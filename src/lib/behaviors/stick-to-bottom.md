# StickToBottom

[StickToBottom](https://ui-sdk.dev/docs/core/behaviors/lists#stick-to-bottom)
follows a growing scroll viewport with a configurable bottom threshold (24 px
by default). Use the Schema model and `update`, and bind `viewportMount` to
the element with ID `${id}-viewport`. The Mount measures the visible row when
content changes; update decides whether to follow, hold that row in place,
or flag unseen growth.

Use `RequestedScroll` to jump and follow again, or `Released` to stop
following. Send `RequestedPrepend` immediately before adding history above to
preserve the distance from the bottom explicitly. Message Scroller starts
pinned; Log Stream opts out by default.

# PointerKind

PointerKind tracks primary and attached pointer precision and hover support.
Start with `init()`, or seed it with `pointerKindOf` from a mobile client hint.
Run `ReadPointerKind({})` after the first render to catch up after hydration;
lift `subscriptions` into the parent to follow media-query changes. Route its
messages through `update`. Unknown is not evidence of hover support; components
own the policy for touch fallbacks. `read` is a pure media-query reader.

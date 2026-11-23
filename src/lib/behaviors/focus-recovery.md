# FocusRecovery

FocusRecovery tracks focus by stable key in a Schema Model. Bind keys once
with `create<Key>()`, report focus and blur facts, and pass the previous and
next key order to `recover` after a removal. It picks the next surviving
enabled key, then the previous, or requests a component-owned fallback.
Map that result to `RecoverFocus` with target and lost element IDs. The Command
waits for the render commit and never steals focus from another connected
element. Components own element IDs, fallback targets, and disabled policy.
For parent-owned collections, `CollectionModel` and `collectionMount` report
accepted keyed DOM changes back to update. `updateCollection` applies the same
pure recovery policy only after reconciliation, never on removal requests.
It retains ownership of pending item targets so further removals before focus
commits can recover again; new focus or blur facts replace that ownership.

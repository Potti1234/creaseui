# TreeCollection

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

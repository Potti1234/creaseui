# SpatialFocus

SpatialFocus follows the same model and attribute-bundle convention for uneven
layouts. Arrow keys use screen geometry (45° cone first, side distance counted
twice), without wrapping or RTL reversal; Home/End use the supplied document
order. Pass keys in document order and disable unavailable items with
`isDisabled`. Rect reads and focus happen in Commands, never in the view.
Alt/Ctrl/Meta shortcuts are left alone. `arrowDirection`, `nearestInDirection`,
and `spatialTarget` are pure helpers for callers with their own geometry.

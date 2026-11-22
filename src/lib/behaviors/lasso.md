# Lasso

Lasso draws a surface-relative selection rectangle after a three-pixel drag.
Spread its surface, item, and rectangle attribute bundles onto component parts.
Pass current `selected` keys and optional `selectable` to update; Shift keeps
the base selection. The parent applies `Selected({ keys })`; `Canceled` clears
only the draft. A Mount tracks document pointer and Escape events, and a Command
measures owned items once per drag. Keep the surface positioned and disable
touch panning in component styles. Roles and keyboard selection belong to the
component. Announce `selectionMessage(count, override)` in its live region;
the behavior does not announce. See Grid's Lasso Selection demo on all renderers.

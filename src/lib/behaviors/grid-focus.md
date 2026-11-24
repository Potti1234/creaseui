# GridFocus

GridFocus provides non-wrapping two-dimensional navigation, disabled-cell
skipping, RTL arrows, row/grid boundaries and page jumps. Use `init`, route
messages through `update`, and render `create().view` cell attributes with your
own grid semantics. `navigate` and `tabStop` are pure; Data Grid maps its
column ids to indexes and delegates keyboard navigation to `navigate`.

For offscreen cells, pass `requiresReveal(cell)` to `update` or `focus`.
Handle the resulting `RequestedReveal` by revealing or rendering the cell.
Send `RevealedCell({ version })` once that cell is mounted and ready for
focus, or `CanceledReveal({ version })` if the request cannot finish or
focus leaves the grid. The version belongs to the original request.
The previous cell remains active until the current reveal completes.

Data Grid keeps DOM focus on its grid root and renders the active row even
outside the current window. `observeActiveDescendant` reveals the mounted
cell and then publishes it as the root's accessible active descendant.
Set `focusDisabledWithArrows` on a custom grid to let arrows reach
ARIA-disabled cells while keeping the Tab stop on an enabled cell.

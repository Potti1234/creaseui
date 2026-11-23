# GridFocus

GridFocus provides non-wrapping two-dimensional navigation, disabled-cell
skipping, RTL arrows, row/grid boundaries and page jumps. Use `init`, route
messages through `update`, and render `create().view` cell attributes with your
own grid semantics. `navigate` and `tabStop` are pure; Data Grid maps its
column ids to indexes and delegates keyboard navigation to `navigate`.

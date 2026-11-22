# InlineEdit

InlineEdit is the pure in-place editing lifecycle. It owns the editing id,
draft and type-over flag, and reports starts, changed commits, unchanged ends,
cancellation and rejected validation through OutMessages. Use startKey and
inputKey for keyboard intent. Components own editor focus, selection/caret,
focus restoration, roles and ARIA; grids retain navigation and editor policy.

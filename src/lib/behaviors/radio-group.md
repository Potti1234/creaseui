# Radio Group

CreaseUI owns the Foldkit interaction model, focus command, and behavior
attributes in `behaviors/radio-group.ts`. The parent passes `selectedValue`
and handles the `Selected` out-message. The child model tracks the roving
focus index when focus moves independently in a read-only group.

Both arrow axes wrap and skip disabled options. Inline arrows follow
`direction`. Home and Page Up move to the first enabled option, and End and
Page Down move to the last. Space selects the current option in editable groups.

The shared renderer assembles the buttons, labels, descriptions, indicators,
and hidden form input. Tailwind, StyleX, and Pleat supply their own visual
attributes. The shared behavior depends directly on `foldkit` and `effect`.

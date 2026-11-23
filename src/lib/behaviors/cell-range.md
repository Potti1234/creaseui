# Cell Range

[UI SDK Cell Range](https://ui-sdk.dev/docs/core/behaviors/selection) supplies the rectangular bounds and tab-delimited clipboard format. Data Grid stores the anchor and end as row indices and column IDs, and resolves them against the rendered column order.

Shift+Arrow and Shift-click extend the range. Ordinary navigation starts a new range. Copy reads the displayed cells, including virtualized rows. Paste starts at the focused cell, skips read-only columns, and saves the entire edit as one undo step. Cell editors keep their own clipboard behavior.

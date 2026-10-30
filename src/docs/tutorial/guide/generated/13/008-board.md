# 008: The board

Product decision: "All issues can be shown as a board, one column per status, each issue a card." Implemented as a new pattern in `src/design` and a new decision, D12. No component, theme, receipt (`crease.lock.json`) or lint change.

## Why

`patterns.md` listed a board as a request that does not fit the vocabulary, and `IssueRow` said a card was still to be decided. A board needs both: a column layout and a card. The card cannot follow D1 (a row never wraps), so the exception is written down as D12 instead of being left to the pattern's comment.

## What changed

- `design-system/principles.md`: D12. On a board an issue is a card with the row's parts in the row's order on three lines; its title (and its labels) may wrap. D1 to D11 are unchanged; D1 stays the rule for rows.
- `src/design/issue-board.ts`: `IssueBoard` and `IssueCard`.
  - Columns follow the workflow order (`STATUSES_IN_ORDER`, D10), all five always shown, so a card whose status changes always has a column to land in.
  - Columns share the board's width equally, down to a minimum of 180px (a 180px basis that every column grows from by the same share, and none shrinks below). Five minimum columns plus gaps need 948px; the content area beside the sidebar at 1280px is about 1000px, so all five columns show there. Only below the minimum does the board scroll sideways, inside its own region (`overflow: auto` on the board); the page never scrolls sideways (the content area is `min-w-0`).
  - The column header is the muted `item` row `IssueGroup` uses, without the collapse button.
  - The card is an `outline` `item` with the row's parts in the row's order (D3, D12), metadata in the small secondary style and labels as `outline` badges (D2), and the three PropertyPickers (D7): changing the status moves the card to that column and returns focus to its glyph. The labels wrap rather than push the assignee out of a narrow card.
- `src/design/issue-collection.ts`: a fourth body, `board`.
- `src/model.ts`, `src/features/issues.ts`: All issues has a layout toggle (`Layout: List` / `Layout: Board`); the grouping control shows only for the list, and the grouping choice survives a trip to the board.
- `design-system/patterns.md`: `IssueBoard` and `IssueCard` rows, with the width rule and D12; the board steps under "Enforced by".

## Checks

- `scripts/check-browser.mjs`, four new steps: the toggle shows five columns in workflow order and hides the grouping control; at 1280px all five columns are inside the board and the viewport, of equal width, with no sideways scrolling of the page or the board; at 900px the page does not scroll sideways while the board scrolls in its own region with columns of at least 180px; a status change on a card (CRE-131 to In Review) moves it to the In Review column with focus back on its status glyph. With the proposal's fixed 272px columns restored, the 1280px step fails ("board scrolls 400px sideways").
- `test/update.test.ts`: Stories for the layout toggle (starts as a list, switches and back keeping grouping; an ungrouped list stays ungrouped; switching produces no Command, so nothing is saved) and for a status change on a card committing and saving like a row.

## Not part of this change (accepted in review)

- No drag and drop between columns (CRE-120). The status picker on each card is the pointer route and the keyboard route (D9).
- The layout choice is not kept after a reload: the page opens as a list, like grouping and sort, which are not kept either. A Story asserts that switching layouts saves nothing.
- `design-system/verification.md` still describes the browser check without the board steps; it was outside this change's authorised files and should name them in a follow-up.

## Migration

None for data: the layout is not stored, and saved issues (`crease-tasks/v1`) are unchanged. For code: `CollectionBody` has a fourth case, `board`, so any `switch` over it must handle it (TypeScript reports a missing case). A view that wants a board passes `{ kind: 'board', issues }` to `IssueCollection`; it does not build columns or cards itself, and it does not import `@/ui/item`. Any later board (My issues, saved views) uses `IssueBoard`/`IssueCard` and inherits D12; a card that differs from it is a design-system change.

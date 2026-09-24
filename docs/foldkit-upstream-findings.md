# Foldkit upstream findings

Issues found in foldkit / @foldkit/ui while interactively hardening the
creaseui docs. Review before filing issues upstream.

Status (foldkit 0.163):

- Enter-on-empty combobox: already fixed upstream on 0.163 (the commit
  adds a bounds check on the active index).
- Slider readonly arrows: already fixed upstream (keydown gated behind
  `isInteractive`).
- The remaining four are fixed on `Potti1234/foldkit` branch
  `devin/fix-upstream-findings` (combobox `inputValue` seed, anchor
  `shift` crossAxis, closed-listbox typeahead, tooltip mount
  hover-sync); each fix ships a repro page under
  `examples/findings-repro/` there.

## Combobox

- **Enter on an empty list throws `Schema validation failed` per press.**
  The primitive arms `maybeActiveItemIndex = -1` and builds
  `RequestedItemClick({index:-1})` inside its own keydown handler — needs
  a guard that skips the commit when the active index is out of bounds.
- **Committed value is not seeded into `inputValue`.**
  A pre-selected combobox shows the placeholder until you open+close
  once: `h.Value(model.inputValue)` starts at `''` and is never seeded
  from the committed option (`@foldkit/ui/dist/combobox/shared.js`).

## Popover

- **`side: 'right'` overflows at 390px.**
  Anchor flip/shift clips against the *document* instead of the viewport
  and lacks a crossAxis shift, so a right-side popover still overflows
  the right edge on a narrow viewport.

## Select

- **Closed-state typeahead is inert.**
  `handleButtonKeyDown` maps only Enter/Space/arrows while closed, so
  typing a letter on the closed trigger does not move the highlighted
  option (native `<select>` matches by prefix).

## Slider

- **Readonly thumb still consumes arrow keys without acting.**
  The keydown is gated behind `isInteractive`, so arrows neither change
  the value nor scroll the page. Borderline by-design — native readonly
  ranges aren't focusable at all.

## Tooltip

- **Stale generation wedge after a preview remount.**
  Under rapid interaction + a renderer toggle, tooltips wedge dead until
  reload — suspected stale delayed-Command / `isDismissed` /
  `pendingShowVersion` race crossing the remount
  (`@foldkit/ui/dist/tooltip/tooltip.js`). Not deterministically
  reproducible.

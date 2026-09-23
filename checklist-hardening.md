# Component docs hardening checklist

Full interactive pass over every example on each component docs page
(`/docs/components/<name>`), tracking what was exercised and every issue
found. Each fix lands as its own commit on the hardening branch.

Legend: ✅ tested clean · ⚠️ findings (see Findings) · ⏭ pending

## Coverage

| # | Component | Status | Examples/interactions exercised | Findings |
|---|-----------|--------|----------------------------------|----------|
| 1 | accordion | ✅ | open/close items, single vs multiple mode, keyboard nav, disabled item | — |
| 2 | alert | ✅ | variants, icon/title/description composition, dismissible close | — |
| 3 | alert-dialog | ⚠️ | open, confirm→pending→complete, cancel, Escape, backdrop, focus restore, compact decision | F1 |
| 4 | aspect-ratio | ✅ | ratio variants, resize, image fit | — |
| 5 | attachment | ⚠️ | lifecycle states, actions, Remove click, keyboard focus | F2 |
| 6 | avatar | ✅ | image/fallback, sizes, group overflow | — |
| 7 | badge | ✅ | variants, icon, as-link | — |
| 8 | breadcrumb | ✅ | links, ellipsis, separator variants, dropdown | — |
| 9 | bubble | ✅ | sender variants, alignment, long text wrap | — |
| 10 | button | ⚠️ | variants, sizes, click/Enter/Space/rapid/dbl-click counter, loading disabled, as-link, back/next group, RTL | F3 |
| 11 | button-group | ✅ | horizontal + vertical orientation, role=group, rapid clicks, Enter/Space, tab order | — |
| 12 | calendar | ⚠️ | day select, disabled Sundays, Days→Months→Years picker, nav buttons, PgUp/PgDn, APG roving grid, range, comfortable cells, RTL, Home/End/arrows | F4, F5 |
| 13 | card | ✅ | render, inert-by-design NoOp, article semantics | — |
| 14 | carousel | ✅ | next/prev + boundary disable, slide counter, Home/End/arrows, real drag swipe + snap-back, ARIA roles, second instance independence | — |
| 15 | chart | ✅ | SVG bar/area, quarters↔months toggle, loading/empty/error, 7 ECharts canvases, hover tooltips, role=img names | — |
| 16 | checkbox | ⚠️ | Terms toggle click/label/Space/rapid, Indeterminate, Disabled, ReadOnly inert | F9 |
| 17 | collapsible | ✅ | trigger + external open/close no desync, open-by-default, disabled, hidden panel verified | — |
| 18 | combobox | ⚠️ | focus-open, filter, arrow nav + wrap, Enter select, Esc, blur/reopen, groups, empty state, readonly RTL | F6 (upstream), F10 |
| 19 | command | ✅ | palette, filter, arrows, Enter→action, Esc restore, groups+shortcuts, no-match status, loading, windowed maxVisibleItems + aria-live | — |
| 20 | context-menu | ⚠️ | right-click open, disabled item, click/Enter/Esc/click-outside close, Shift+F10, focus return, selection, bottom-edge | F7, F8 |
| 21 | data-table | ⚠️ | header sort cycles + aria-sort, row + select-all checkboxes, Columns menu toggle/last-visible guard, page-size select, First/Prev/Next/Last, filter (regex chars, long string, fast clear), rapid sort/paginate, server-mode pager math, 390px h-scroll | F11, F12 |
| 22 | date-picker | ⚠️ | trigger open, day pick commits input+label+hidden input, Esc/outside close + focus return, live query parse, invalid → aria-invalid + role=alert, Load saved date, Enter-in-query submit, grid arrows/PgUp/PgDn, mobile dialog 390px | F14 |
| 23 | dialog | ⚠️ | open trigger, initial focus, Tab/Shift+Tab trap cycle both dirs, Esc, backdrop dismiss, X close, footer Cancel+Save close, focus return, body scroll-lock, rapid mid-animation open/close, 390px | F16 |
| 24 | direction | ⚠️ | RTL arrow order, dir=rtl/ltr attrs, mixed bidi token, button click feedback, 390px | F13 |
| 25 | drawer | ✅ | open, title/desc/content, Save goal/Cancel, Esc, backdrop, focus return, drag-to-dismiss (≥120px dismiss / <120px snap-back), right-drawer axis clamp, 390px bottom sheet | F17 |
| 26 | dropdown-menu | ⚠️ | click/keys/typeahead/submenu/RTL/disabled/Esc/outside/focus-return, viewport-edge flip, StyleX + 390px tap | F19, F20 |
| 27 | empty | ⚠️ | all 4 previews render/click + StyleX + 390px | F25 |
| 28 | field | ⚠️ | label→input focus, typing, error display, field-group independence, async validation | F24, F26 |
| 29 | form | ⚠️ | empty/invalid/valid submits, Enter submit, summary link→focus, async validation | F18, F26(form) |
| 30 | hover-card | ⚠️ | hover-open delay, pointer bridge, leave-close, focus-open, Esc, focus-return, both sides, StyleX + 390px | F28 |
| 31 | input | ✅ | typing→model, label focus, disabled inert, readonly, aria-invalid, autocomplete/inputMode/name/form, describedby | — |
| 32 | input-group | ⚠️ | typing, leading/trailing addons, role=group, accessible name, addon→focus | F22, F23 |
| 33 | input-otp | ⚠️ | fill, per-char pattern filter, Backspace, maxlength, autocomplete, inputmode, separator, caret position | F21 |
| 34 | item | ✅ | group collection, outline, header/footer variants (static by design) | — |
| 35 | kbd | ✅ | inline key, kbdGroup combo semantics (static) | — |
| 36 | label | ✅ | label-click→input focus (desktop+390), hint text, typing | — |
| 37 | marker | ✅ | separator/icon/border variants, role=note, aria-hidden icon (static) | — |
| 38 | menubar | ⚠️ | click-switch, Esc/click-outside close+focus-return, ArrowRight/Down nav, disabled skip, RTL mirroring, submenu reach, hover-switch, selection feedback | F29, F30, F31, F32, F33 |
| 39 | message | ⚠️ | incoming/outgoing align, live recovery aria (live=polite, role=status), Retry delivery feedback | F34 |
| 40 | message-scroller | ✅ | bottom-anchor init, scroll-away→jump button fades in, click smooth-scrolls both directions, a11y-tree exit when inactive | — |
| 41 | native-select | ✅ | native picker open/select, optgroups, label/describedby wiring, state across renderer toggle | — |
| 42 | navigation-menu | ⚠️ | route toggle aria-current, hover/Enter open, Esc/outside close, 390px stack fallback, RTL contained scroll+drag, disclosure keyboard reach | F35, F36, F39 |
| 43 | pagination | ⚠️ | page select, Prev/Next, boundary disabled, inert ellipsis, link-kind nav | F35 |
| 44 | popover | ⚠️ | open, Esc+focus return, outside-dismiss, portal, side/align, interactive content, aria-haspopup, 390px side placement | F37, F38, F39 |
| 45 | progress | ✅ | value bars, indeterminate omits aria-valuenow, progressbar ARIA, motion-reduce | — |
| 46 | radio-group | ⚠️ | click/arrows/roving/wrap/Space, disabled inert, readonly focus-only, label click-select, RTL mirror | F40, F41 |
| 47 | resizable | ⚠️ | mouse drag commit, max clamp, Arrow ±2%, Home/End→min/max, axis-lock, tabindex/aria-value*, StyleX, 390px | F42 |
| 48 | scroll-area | ✅ | wheel + Arrow scroll, h-scroll ArrowRight, overflow fall-through at max, aria-label, StyleX, 390px | — |
| 49 | select | ⚠️ | click/Enter/Space/ArrowDown open, listbox aria-*, arrow data-active, Enter commit+focus-return, Esc no-commit, click-outside, Home/End, open typeahead, hidden form input, group headers, disabled skip, readonly RTL inspect-only, 390px | F43 (upstream), F44 (invalid — aria-readonly already on listbox, invalid role on button) |
| 50 | separator | ✅ | decorative role=none, vertical role=separator + aria-orientation, 390px | — |
| 51 | sheet | ✅ | 4 sides open, dialog+aria-labelledby, initial focus, focus trap Tab-wrap, Esc+focus-return, scroll-lock, backdrop dismiss, footer buttons, StyleX, 390px | — |
| 52 | sidebar | ⚠️ | ⌘B icon-rail + cookie persist, edge-trigger, inert '#' nav, badges, menu scroll, mobile off-canvas + backdrop dismiss + Esc, disclosure toggle, account menu, search filter, all fixture variants, 390px | F45, F46, F47, F48 |
| 53 | skeleton | ✅ | 2 static pulse previews, presentational | — |
| 54 | slider | ✅ | drag down+move+up, arrows ±step, Home/End/PgUp/PgDn, controlled bound, readonly non-editable, RTL, vertical, normalized bounds, clamp | F52 (nit, upstream) |
| 55 | sonner | ⚠️ | fire/stack/sticky/imperative/async/roles | F49, F50 |
| 56 | spinner | ✅ | 2 static previews (SVG + label) | — |
| 57 | switch | ⚠️ | click/Space toggle aria-checked, disabled inert, readonly no-toggle, RTL, hidden form name, label click | F51 |
| 58 | table | ✅ | semantic markup, footer, dense internal-scroll, empty state, 390px | — |
| 59 | tabs | ✅ | auto-activate vs manual focus-then-Enter, disabled-skip, Home/End, RTL mirror, roles | — |
| 60 | textarea | ✅ | bound typing unicode/long/regex, aria-invalid+error, disabled, form/name attrs, field-sizing auto-grow | — |
| 61 | toast | ⚠️ | fire/lifecycle/Retry-in-DOM/role=status/stacking | F49, F50 |
| 62 | toggle | ⚠️ | click+Enter/Space toggle data-state/aria-pressed, disabled inert, live≠snippet | F53 |
| 63 | toggle-group | ✅ | single exclusive, multiple independent, RTL, disabled-skip, roving, no-submit intent | — |
| 64 | tooltip | ⚠️ | hover/focus/Esc/blur lifecycle, aria-describedby, side placement, disabled-suppression, Tailwind+StyleX | F54 (unstable, upstream) |
| 65 | typography | ✅ | 3 static semantic previews | — |

## Findings

- **F1 — alert-dialog (med, fixed ec391c6):** `applyDialog` reset
  `status` to `'idle'` on any non-Confirm OutMessage, so cancelling a
  reopened dialog reverted a completed action to "No action taken."
  Cancel now preserves a completed/idle status and only clears pending.
- **F3 — button (med, fixed 2cd97f7):** `h.Target` intermittently dropped
  the `target="_blank"` DOM attribute (~1-in-8 loads) on the "As Link"
  example — `rel` stayed but clicks navigated same-tab. `target` is now
  emitted as a raw attribute in `renderButtonLink` and the gallery's
  open-in-new-tab link.
- **F4 — calendar (med, fixed 2c9938b):** RTL calendars mirrored the
  grids visually but ArrowRight still advanced the logical date (visually
  left). `toParentMessage` now swaps ArrowLeft/ArrowRight under
  `direction: 'rtl'` in both renderers.
- **F5 — calendar (low, fixed 6e845c6):** Home on a disabled week-edge
  day (e.g. all Sundays) walked the skip backward into the adjacent
  month, leaving the cursor outside the row. The wrapped `update` targets
  the first/last enabled day inside the week row via `focusDate`.
- **F6 — combobox (upstream, no repo fix):** ArrowDown+Enter on the
  statically-empty list throws `Schema validation failed` per press —
  foldkit arms `maybeActiveItemIndex=-1` and builds
  `RequestedItemClick({index:-1})` inside the primitive's keydown. Needs
  an upstream foldkit guard (skip commit when the active index is out of
  bounds).
- **F7 — context-menu (med, fixed 7943767):** the preview dropped
  `ContextMenu.update`'s `Selected` OutMessage (destructured only
  `[model, commands]`) — selecting an item did nothing. Now stores and
  renders the last action.
- **F8 — context-menu/dropdown-menu (med, fixed df97e02):** anchored
  menus clamped top to `100vh-48px` regardless of height, opening fully
  off-viewport near the bottom edge. Now translates by the overflow
  percentage so the menu stays inside the viewport (both renderers).
- **F9 — checkbox (low-med, fixed fc1b21e):** the Indeterminate example
  hardcoded `isIndeterminate: true` — clicks never resolved
  `aria-checked="mixed"`. The flag is now cleared on first toggle.
- **F10 — combobox (low, fixed 5c729e0):** the Read only example claimed
  a committed value but initialized to none → placeholder. Now starts
  selected (preview + sample code).
- **F2 — attachment (low-med, fixed 8ab4d2d):** the "Uploaded file"
  example rendered a focusable `Remove` ghost button with no handler.
  The preview is now a live program — Remove emits
  `RemovedAttachmentFile`, shows "Removed project-brief.pdf.", and a
  Restore action resets it; the code sample wires `onClick` too.
- **F11 — data-table (med, fixed 9849165):** filtering to 0 matches
  left the pager on the unfiltered count — "Page 1 of 2" with
  enabled-but-inert Next/Last. Page count now derives from the filtered
  row model and the page index clamps in-range.
- **F12 — data-table (med, fixed 3c68b6f):** the Columns menu was a
  native `<details>` — no Escape or click-outside dismissal, unlike
  every other docs overlay. Now model-driven (`columnsMenuOpen`):
  button toggles with `aria-expanded`/`aria-haspopup="menu"`, plus a
  click-outside backdrop and Escape close in both renderers.
- **F13 — direction (low, fixed 479bf0d):** the RTL example's live
  button incremented `interactionCount` but rendered nothing — visibly
  dead. Both renderers now show `Clicked N times` beside the button.
- **F14 — date-picker (low, fixed ddea824):** `ClearedDate` was handled
  but unreachable — no UI clear affordance, so a committed value could
  never return to placeholder. Added a "Clear date" action (both
  renderers) wired to `DatePicker.clear`, disabled when nothing is set.
- **F15 — combobox (low residual, upstream):** the Read only example's
  seeded "Next.js" only renders after one open+close — the primitive
  binds `h.Value(model.inputValue)` initialized to `''` and never seeds
  it from the committed option (`@foldkit/ui/dist/combobox/shared.js`).
  Needs an upstream foldkit seed; documented with F6.
- **F16 — dialog (low, fixed cb90378):** example 1's live preview
  claimed `initialFocusAttributes` nowhere, so initial focus fell on
  the X close button while the displayed snippet claims it on the first
  footer button. The preview now always claims initial focus there,
  matching the snippet.
- **F17 — drawer (low, fixed 15de76d):** both example snippets
  initialized `id: 'goal-drawer'` — pasting both gives duplicate ids
  (and diverged from the preview's per-index id). Snippet ids are now
  unique per fixture.

### Batch 5 findings (dropdown-menu…input-otp)
- F18 [MED] form error-summary `#controlId` anchors triggered SPA remount wiping all page state → `onErrorLink` prop + `OnClickFocus`/`OnKeyDownFocus` (2c090c1)
- F19 [MED] dropdown-menu dropped the `Selected` out-message — no feedback on select → destructured 3-tuple + status line (6081564)
- F20 [MED] dropdown-menu clipped 142px at viewport bottom → CSS anchor positioning + `position-try` flip (4d03a2f)
- F21 [MED] input-otp fake caret rendered at `value.length` while the real caret could move mid-string → caret pinned to end via `onselect` (36f48a4)
- F22 [LOW-MED] input-group inputs had no accessible name and the API couldn't express one → `ariaLabel` prop (b6a62b2, ee96de5)
- F23 [LOW-MED] input-group addon click hole — `cursor:text` zone didn't focus the control → `focusControlId`/`onFocus` wired in docs (ee96de5)
- F24 [LOW-MED] field-group First/Last shared one model value (mirrored typing) → independent fields + source (31bbaab)
- F25 [LOW] empty action buttons looked dead — click feedback rendered (2b2657c)
- F26 [LOW] field async-validation example was synchronous → real versioned Command (9dabd19); same fix on form page (7cb4812)
- F28 [LOW] hover-card generated examples shared one id → per-fixture ids (e706350)
- F29 [MED] regression from F20: `overflow-y: auto` on the anchored panel clipped nested submenus → submenu panels anchored outside the scroll box (23c63e7)

### Batch 6 findings (item…message-scroller)

- F30 [MED] menubar second-trigger click closed all menus instead of switching (backdrop sat above sibling triggers) → z-50 wrappers while open + page-level exclusivity (65d8358)
- F31 [MED] menubar submenu unreachable by keyboard — Enter on a submenu parent fell through to the trigger's native click and closed everything → Enter/Space emit OpenedSubmenu (1a1ed51)
- F32 [LOW] menubar hover didn't switch while a menu was open → behavior emits Focused on mouseenter when hoverFocus (92a118b)
- F33 [LOW] menubar maybeLastAction tracked but never rendered → status line in both renderers (c24cd95)
- F34 [LOW] message Retry delivery click did nothing visible → 'Retried N times' status (df900bd)

### Batch 7 findings (native-select…radio-group)

- F35 [MED] nav-menu + pagination fixture links navigated the docs SPA to dead routes ('No page at /X') → inert '#' hrefs in live views, real hrefs kept in snippets (fe4ffb9)
- F36 [MED] nav-menu disclosure panel was keyboard-unreachable — no focus path into the portaled panel → exposed `focusSelector` on popover; disclosure focuses the first link (74eec3b)
- F37 [MED] popover fixtures showed a Width input that the live render omitted → input added + focusSelector:'input' (9a819db)
- F38 [MED] popover side:'right' overflows at 390px — upstream @foldkit/ui anchor flip/shift clips against the document not the viewport and lacks crossAxis shift → logged upstream (fix belongs in foldkit)
- F39 [LOW] disclosure triggers lacked aria-haspopup → aria-haspopup=dialog (c5e225c)
- F40 [LOW] radio labels didn't click-select → for=<optionId> on the label (4b8f8ae)
- F41 [LOW] readonly radios lacked per-item aria-readonly → emit on the option button (5b9640f)
- OBS: form error summary only reachable via empty submit (native email validation, no novalidate); input invalid example shows hint not error

### Batch 8 findings (resizable…sidebar)

- F42 [LOW] resizable handle treated Ctrl+Home/End as plain Home/End and preventDefaulted, hijacking browser scroll shortcuts → bail on ctrl/alt/meta modifiers (both renderers) (f779584)
- F43 [LOW] select closed-state typeahead inert — @foldkit/ui listbox handleButtonKeyDown maps only Enter/Space/arrows when closed; closed-state type-to-select is an upstream gap → logged upstream
- F44 [LOW] select readonly trigger lacks aria-readonly — INVALID on review: aria-readonly already present on role=listbox container (upstream); aria-readonly is not a supported attribute on role=button per ARIA 1.2 → no fix, verified correct semantics
- F45 [LOW] sidebar Documentation row + account tile looked interactive but were inert → Documentation toggles submenu (ariaExpanded prop + rotating chevron), account tile opens real account dropdown (both renderers) (9505cc0)
- F46 [LOW] sidebar search input unlabeled + filtered nothing → ariaLabel prop on sidebarInput + query now filters Platform nav w/ empty-state row (both renderers) (7e3854f)
- F47 [MED] dropdown-menu align:end rendered items fully off-screen — anchored box stretched to viewport edge then translateX(-100%) → pin right/bottom edge for end + max-content sizing (both renderers) (70730c5)
- F48 [MED] sidebar mobile overlay ignored Escape and wasn't a dialog → role=dialog + aria-modal + Esc handler on panel + backdrop (both renderers) (1f97d6a)

### Batch 9 findings (skeleton…typography) — FINAL

- F49 [MED] toast/sonner timed fixture expired in 700ms (action unreachable) + drifted from its shown snippet → live fixtures match snippets: actionLabel Undo + duration '4 seconds' (ab85edd)
- F50 [LOW] every fixture's aria-live viewport pinned to the same fixed corner → offset the second fixture's region by 6rem in both renderers (ca55fb3)
- F51 [LOW] switch label text didn't click-toggle → stable id on the button + label for= (75142a9)
- F52 [nit] readonly slider arrows scroll page — upstream @foldkit/ui gates thumb keydown behind isInteractive → logged upstream (borderline by-design: native readonly ranges aren't focusable)
- F53 [LOW] toggle Outline/Compact shown code mismatched live labels → snippet interpolates shared toggleChildren (9bbea84)
- F54 [LOW—unstable] both renderers' tooltips wedged dead once under rapid interaction + renderer toggle until reload — suspected stale delayed-Command/generation race crossing a preview remount in upstream foldkit; not deterministically reproducible → logged upstream
- OBS: sonner group headers role=presentation — consistent with shadcn

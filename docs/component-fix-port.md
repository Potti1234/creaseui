# Component fixes imported on 2026-10-08

Source: `C:\Users\lukas\Downloads\creaseuicomponent-fixes\creaseuicomponent-fixes`.
Starting commit: `03c8a1a`.

The source project was copied into this checkout while retaining this checkout's
Git metadata, dependencies, and generated build/test directories. The source's
`output/playwright` reports and probes were also copied; `output` remains ignored.

`checklist-hardening.md` and `docs/foldkit-upstream-findings.md` were identical
in both projects. Their repository fixes were already in the starting commit's
history, including the attachment fix under `daf8485` rather than the checklist's
older hash. The commits below import the additional component fixes found in
the source diff and its browser reports.

## Imported fixes

| #   | Commit    | Component             | Change                                                                                                                                                                                                  |
| --- | --------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `c372c90` | Select                | Align StyleX option labels and selected checkmarks.                                                                                                                                                     |
| 2   | `20f2a56` | Select                | Match the StyleX popup width to its trigger.                                                                                                                                                            |
| 3   | `9b35903` | Alert Dialog          | Match media layouts, small dialog sizing, and action button styles across renderers.                                                                                                                    |
| 4   | `41c3c6a` | Bubble                | Rotate the StyleX disclosure chevron when expanded, with reduced-motion support.                                                                                                                        |
| 5   | `a77eeb6` | Menus                 | Avoid treating `data-active="false"` as an active item in StyleX.                                                                                                                                       |
| 6   | `b8e8695` | Dropdown Menu         | Preserve destructive text and background colors when an item is active.                                                                                                                                 |
| 7   | `033a563` | Dropdown Menu         | Use checkmarks for selected radio items in both renderers.                                                                                                                                              |
| 8   | `4d60091` | Calendar              | Preserve selected day, month, and year colors during hover.                                                                                                                                             |
| 9   | `23821f6` | Calendar              | Highlight range endpoints, including dates outside the displayed month.                                                                                                                                 |
| 10  | `e2abcef` | Combobox              | Match the StyleX popup width to the input.                                                                                                                                                              |
| 11  | `39c04db` | Date Input            | Remove extra StyleX calendar popup padding and fit its width to the calendar.                                                                                                                           |
| 12  | `a8e61e5` | Date Picker           | Constrain mobile calendar popups and prevent StyleX documentation frames from clipping them.                                                                                                            |
| 13  | `5b7f3da` | Time Input            | Add themed hour/minute/second/period selectors, controlled-value messages, constraints, accessible labels, and matching date-picker examples. Include registry dependencies and generated API metadata. |
| 14  | `213c032` | Date Range Input      | Stack presets above the calendar on mobile and constrain the popup to the viewport.                                                                                                                     |
| 15  | `dded88c` | Dialog                | Use shared button styles for footer hover/focus feedback and update the copyable snippets.                                                                                                              |
| 16  | `1cc149c` | Registry verification | Build the installed Tailwind consumer with the Tailwind entry instead of requiring a StyleX entry.                                                                                                      |

Each row corresponds to one fix commit. The time-picker commit also corrects a
source snippet that passed internal flex styles to `ComponentLayoutStyle`; the
snippet now puts those styles on its own layout element.

## Remaining copied additions

The map component family, map documentation, theme editor, theming guide, and
their integration/dependency changes remain uncommitted for separate review.
They are present in the working tree and visible through `git diff` and
`git status`.

## Validation

The committed fixes were checked in a detached validation worktree, without
the uncommitted map and theme-editor features:

- Type checking, formatting, and ESLint passed.
- API/discovery metadata and component parity checks passed for 112 components.
- All 433 unit tests passed.
- Every copyable documentation application passed the compilation test with
  Node's 8 GiB heap setting. The initial default-heap run exhausted memory.
- All 41 scene test files passed: 1,556 passing tests, 294 existing expected
  failures, and 474 existing TODO cases.
- Tailwind and StyleX production builds passed.
- Eight targeted Playwright journeys passed: Select, Alert Dialog, Bubble,
  Dropdown Menu, Calendar, Combobox, Date Picker, and Dialog.
- Fifteen direct browser probe runs passed, covering layouts, hover/selection
  colors, disclosure motion, checkmarks, control widths, and range selection
  in light/dark mode at desktop and mobile widths.

The additional browser-test commit `b61e9b6` verifies checkbox/radio changes
while the menu remains open, then closes and reopens it to check persistence.
The prior test tried to reopen the fixture without closing it, despite its
`keepOpenOnCheckableSelect: true` configuration.

The imported visual probes needed browser-normalized color comparisons and
waits for Foldkit's asynchronous rerenders. Their final results are summarized
in `output/port-validation/visual-summary.json`; the preceding attempts are
retained alongside the successful rechecks.

Detailed logs, probe results, and screenshots are retained in the ignored
`output/port-validation` directory.

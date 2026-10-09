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

The map component family and its documentation/registry integration were
subsequently imported in four commits. See [Map component port](map-component-port.md).
The theme editor, theming guide, and their integration changes remain
uncommitted and visible through `git diff` and `git status`.

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

## Follow-up import on 2026-10-09

Source: `C:\Users\lukas\Downloads\creaseuicomponent-fixes\creaseuicomponent-fixes`.
Starting commit: `5ee4f0b`.

Imported the ten dashboard findings documented in
[checklist-dashboard-hardening.md](../checklist-dashboard-hardening.md) and the
component changes recorded in source browser reports 17-31. The original
`checklist-hardening.md` was unchanged. The source also retires Tour; its source,
exports, routes, registry entry, and generated discovery metadata were removed
together. The previously committed fixes remain in place, and existing stashes
were preserved.

Each logical fix or addition has its own commit; browser regression coverage is
recorded separately. Generated files were rebuilt from the combined source.

| Commit    | Change                                                                  |
| --------- | ----------------------------------------------------------------------- |
| `42bbd5b` | fix(test): run unit tests portably with worker heap limits              |
| `a34a161` | fix(avatar): meet contrast requirements for fallback text               |
| `4b11d11` | fix(registry): derive complete dependency graphs from source imports    |
| `e3650b1` | fix(data-table): compose custom filters in the shared toolbar           |
| `5ce41d1` | fix(data-table): filter columns without sortable accessors              |
| `312e63b` | fix(chart): expose precise axis and grid composition types              |
| `375daa4` | fix(icons): publish complete adapter inventories and visible fallbacks  |
| `13e56e3` | fix(switch): support composed labels and descriptions                   |
| `32f462b` | feat(dashboard): add a complete installable application recipe          |
| `dcf798a` | fix(registry): verify clean consumer imports and dependencies           |
| `dc26eef` | fix(number-input): step from pending edits without losing focus         |
| `6f150f1` | fix(sidebar): synchronize collapse motion across all elements           |
| `bb78b87` | fix(sheet): prevent focus scrolling from fighting panel slides          |
| `b3e7017` | fix(sheet): animate backdrop fading and release transitions             |
| `83d9f05` | fix(sidebar): keep hover menus open across the pointer bridge           |
| `89aa7a0` | fix(sidebar): keep the profile footer compact and aligned               |
| `034c0d6` | fix(timestamp): size detail cards naturally and wrap long values        |
| `f1f58e3` | fix(timestamp): isolate detail-card IDs across examples                 |
| `7a97cdd` | fix(toast): restore stacked layouts, visible limits and timer ownership |
| `916e3be` | fix(toast): enable pointer capture for swipe dismissal                  |
| `f4d3ad3` | fix(tokenizer): anchor full-width popups and preserve portal themes     |
| `69133e8` | fix(tokenizer): clear successful creation queries for the next token    |
| `55737f1` | fix(toolbar): handle embedded controls and responsive filter layouts    |
| `7fdf76b` | fix(top-nav): keep anchored panels outside clipping containers          |
| `4e724ca` | fix(thumbnail): wire previews, removal and scoped hover controls        |
| `9f6d6ad` | fix(catalog): remove the retired Tour component and discovery entries   |
| `3c989ed` | test(docs): cover the imported component hardening fixes                |
| `09ab485` | fix(icons): preserve supplied public aliases during regeneration        |

Validation of the combined checkout:

- Full TypeScript check, ESLint, formatting, and generated API/discovery checks
  passed.
- All 479 unit tests passed, including copyable documentation compilation.
- All 44 scene suites passed: 1,598 passing tests, 292 existing expected failures,
  and 470 existing TODO cases.
- Tailwind and StyleX production builds passed.
- Thirteen imported browser journeys passed across both renderers, covering avatar
  contrast, Tour removal, thumbnails, top navigation, timestamps, toolbar filters,
  tokenizers, toast stacks, swipe dismissal, and number-input stepper focus.
- The clean registry consumer installed all 121 components and dashboard-01,
  passed installed-import checks and six TypeScript checks across all five icon
  adapters, and built successfully with consumer-only dependencies.
- The icon inventory retains all 240 supplied default names and 98 shared adapter
  names within the existing bundle budget.

Logs and browser artifacts are retained under the ignored `output/new-port-*`
paths and Playwright output directories.

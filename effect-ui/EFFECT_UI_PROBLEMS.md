# Effect UI problems found during the docs migration

- `Link`'s `tooltip` option mounts a `Tooltip` child internally. Rendering multiple tooltip links in one parent view fails with “two children at CreaseTooltip[]” because the consumer cannot key those internal tooltip children. The docs currently work around this by placing each tooltip link inside its own keyed demo component.

- Effect HTML element builders frequently expose their environment parameter as `any` or infer it as `unknown` after ordinary composition, even for static content. Strict `View.Input<Msg, never>` example types therefore reject otherwise valid composed `Button`/`Icon` content unless helpers are explicitly typed with the docs message type.

- `Tooltip` trigger input is typed as a button or anchor element only. The Foldkit docs' disabled-button example uses a non-focusable `span` trigger so the explanation remains hoverable while the action is unavailable; the Effect API cannot express that trigger type directly, so the port currently uses a disabled button approximation.

- `DropdownMenu`'s backdrop is rendered as a manual popover. Because the styled wrapper originally gave it no background class, the browser's popover user-agent background painted the whole page white while a menu was open. The branch now overrides it with `bg-transparent`.

- `DropdownMenu`'s styled menu composition diverged from the Foldkit/shadcn reference in several details: minimum width, group-label size/color, missing separators between groups, check/radio indicator structure, label wrapping, shortcut tracking, and disabled/icon CSS. The branch aligns those styles and item composition with the reference implementation.

- `DropdownMenu` submenu triggers are consumer-provided elements. Unlike ordinary items, they do not automatically receive the standard menu-item data attributes or the trailing chevron, so the docs must remember to compose the chevron themselves and the rendered submenu trigger still lacks the same `data-slot` surface as ordinary items.

## Popover styled popup styling diverges from Foldkit

`effect-ui/src/ui/popover.ts` originally added `grid`, `gap-2`, `text-sm`, sizing clamps, and scrolling behavior that the Foldkit/shadcn-style popover does not have. That compressed custom content and changed inherited heading text from 16px to 14px. The branch now aligns the styled popup classes with the Foldkit implementation.

## Select styled trigger, popup, and item styling diverge from Foldkit

`effect-ui/src/ui/select.ts` originally used fixed-height/background trigger classes, allowed the popup to size itself independently of the trigger anchor, and used flatter menu-item padding. This made the same docs fixture render a 384px trigger/popup where Foldkit renders the shrink-to-fit 129px control. The branch now aligns the styled trigger, popup width, and option padding with the Foldkit implementation, although the inner option DOM still differs because the Effect kit exposes item parts differently.

## Tabs styled sizing diverges from Foldkit

`effect-ui/src/ui/tabs.ts` originally used a larger root gap, 4px list padding, always-on trigger gaps, fixed minimum-height triggers, and text underline styling for the line variant. This made the basic demo 214px high with a 327px tab list where Foldkit renders 206px and 313px. The branch now aligns the styled root/list/trigger sizing and line indicator treatment with the Foldkit implementation while retaining the kit's `data-active` state attribute.

## Tree List styled row metrics diverge from Foldkit

`effect-ui/src/ui/tree-list.ts` originally used 6px row padding, minimum-height rows, 24px toggle glyphs, extra action padding, and no per-row gap. The same project-file tree rendered 324px high with labels shifted 8px to the right versus Foldkit's 342px tree. The branch now aligns row padding, vertical pitch, toggle/spacer geometry, and horizontal label position with the Foldkit implementation, although Effect still uses nested button/anchor controls where Foldkit makes the row itself clickable.

## Navigation Menu disclosure is not a real Popover

`effect-ui/src/ui/navigation-menu.ts` composes disclosure entries with `CollapsibleBehavior` inline inside the navigation list. The Foldkit version uses the real Popover child integration with overlay positioning, hover-and-press intent, animated transitions, content focus, and a chevron trigger. The docs port can reproduce the basic disclosure content and links, but not the exact interaction surface or positioning.

## Stepper geometry and collapse behavior diverge from Foldkit

`effect-ui/src/ui/stepper.ts` uses a different DOM structure (`stepper` root containing a `stepper-list`) and different horizontal/on-track geometry from the Foldkit primitive. Basic vertical rows now match the Foldkit 156px four-step fixture, but horizontal examples shrink to different intrinsic widths, on-track labels do not occupy the same vertical space, and compact-collapse behavior does not reproduce the Foldkit examples exactly. The docs port keeps the same fixture data and interactions but cannot yet be considered pixel-identical for horizontal steppers.

## Date Range Input status affordances are structurally incomplete

`effect-ui/src/ui/date-range-input.ts` now matches the Foldkit field, wrapper, trigger, and preset-panel geometry, but its public `status` API is only arbitrary message content. It does not expose the Foldkit status type or render the semantic status icon inside the input wrapper, and its calendar icon is decorative rather than a second working toggle button. Validation examples therefore match the message colors and layout but not the complete Foldkit DOM/interaction structure.

## Date Time Input is only a loose date-plus-time composition

`effect-ui/src/ui/date-time-input.ts` is a stateless wrapper that places separate `DateInput` and `TimeInput` controls in a two-column row. The Foldkit component is one combined date-time field with a calendar+time popover, adaptive bottom sheet behavior, integrated clear/status affordances, and a single committed value model. The docs port preserves the fixture values and time-option coverage, but the control structure, popover behavior, and validation presentation are substantially different.

## Grid spatial-focus and lasso behaviors are missing

The Foldkit grid documentation uses the `SpatialFocus` and `Lasso` headless behaviors for physical arrow-key navigation and pointer rectangle selection. `effect-ui/src/behaviors` has no corresponding implementations. The Effect docs currently reproduce the board/tile geometry and instructional copy statically, but arrow-key spatial movement, disabled-item skipping, drag selection, Shift-add, Escape-cancel, selection state, and live selection announcements are not yet ported.

## Dialog styled composition is still narrower than Foldkit

`effect-ui/src/ui/dialog.ts` now supports panel classes, a hideable close button, semantic slots, and an icon close button, but it still exposes only a trigger/title/description/content convenience shape. Foldkit's Dialog renderer exposes bound header, footer, close, close-button attribute, and initial-focus part composition. The Effect docs recreate the same visual footer and form examples manually inside `content`; they cannot yet reuse the same part-level composition API or mark footer buttons as dialog initial focus.

## Data Grid is structurally different from the Foldkit grid

`effect-ui/src/ui/data-grid.ts` still renders a native table rather than Foldkit's custom virtualized `div` grid. The docs now match the spreadsheet-like clipped frame, fixed column widths, row-number/selection cells, toolbar overflow placement, empty grid surface, and Add row treatment closely, but important behavior remains different: header buttons sort directly instead of opening the column menu with explicit ascending/descending/remove/hide actions, the direction toolbar button is presentational because direction is a prop rather than grid state, and Foldkit's full focus movement, range highlighting, editor layering, undo/redo controls, and toolbar panel behavior are not completely ported.

## Empty composition is convenience-based rather than part-based

Foldkit's Empty renderer exposes explicit root children plus an `emptyContent` part, so actions and trailing links can occupy different structural positions. Effect's styled Empty historically wrapped every child in `empty-content`; the branch adds a `footer` escape hatch to match the docs, but the public API still does not expose the same part-level composition as Foldkit.

## Toast provider positioning and helpers are narrower than Foldkit

`effect-ui/src/ui/toast.ts` positions the whole provider viewport, while the Foldkit toast model stores a position on each toast. The Effect docs therefore render the Position example's controls but every toast appears in the provider's single bottom-end position. Effect also has no promise-toast helper that resolves a loading toast into success, and action callbacks cannot easily target dismissal from the child control that posted the toast. The docs currently show a static loading toast for Promise and omit the Basic example's visible Undo action.

## Calendar locale support is not a true alternate-calendar implementation

Effect `Calendar` accepts an Intl locale, so `fa-IR-u-ca-persian` localizes labels, but its month grid arithmetic remains Gregorian rather than implementing the Foldkit docs' Jalali conversion helpers. The Effect docs expose the same Persian example surface, but the dates are not a correct Jalali calendar. Cell sizing is also only adjustable through consumer CSS because the styled calendar does not expose Foldkit's cell-size token as a component option.

## Input Group addon composition is presentational only

Effect `InputGroup` exposes addon slots and control parts, but it has no built-in input-group button or menu composition beyond class helpers. The docs reproduce the Dropdown, Button, copy, password-toggle, favorite, and info-popover examples visually with static buttons; those controls do not yet have the Foldkit examples' working menu, popover, copy, favorite, and password state interactions.

## Combobox styled API lacks several documented composition hooks

Effect `Combobox` owns popup/draft state but exposes only plain item labels. It has no consumer item renderer for the Custom Items example's flag/name/continent rows, no invalid prop or aria-invalid styling hook, and no auto-highlight option. The Effect docs reproduce those examples with plain items and static appearance. Input Group composition is also manual because the styled combobox cannot yet render through the input-group control part without a nested wrapper.

- Color Picker's styled API only exposes swatch/button/input trigger variants and fixed panel composition; unlike Foldkit it does not expose composable area/channel/input/preset parts for custom arrangements or localization.
- Date Picker exposes only a single-date popover composite; Foldkit docs' true range picker, date-plus-time composition, and natural-language parsing require manual composition in Effect UI.
- Pointer Kind and Avoid Keyboard have no Effect UI behavior implementations; their docs examples cannot yet reproduce the live media-query/viewport behavior of the Foldkit versions.
- Connect has no Effect UI behavior implementation; keyboard/pointer connection examples are visual documentation placeholders rather than interactive port-connection drafts.
- Effect UI now has an ECharts lifecycle adapter used by the Chart docs, but synchronized interactive examples and some advanced option compositions are still approximated rather than full ports of the Foldkit examples.
- Tutorial chapter pages currently migrate navigation, summaries and repository checkpoints, but the Foldkit interactive essay runtimes remain unported.
- Chart gallery pages now mount live Apache ECharts instances in the correct full-width gallery shell, but many per-variant option details, interactive controls, icons, labels, and exact card footers remain approximations rather than ports of the individual Foldkit card modules.
- Blocks now matches the catalog-row shell, but previews are static skeletons; live block preview pages, working category filters, copyable per-renderer source, and open/full-screen actions remain unported.
- Create now matches the broad theme-editor/preview layout, but token editing, theme application, presets, shuffle/reset/copy actions, and the interactive preview components remain static placeholders.
- Agent and History behaviors are not implemented in Effect UI, so the Get Started guide cannot yet include the Foldkit agent/history walkthrough or live behavior demo.

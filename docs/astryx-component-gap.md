# Astryx component gap analysis

Audit of [facebook/astryx](https://github.com/facebook/astryx) (`packages/core/src`,
`packages/lab/src`) against the Crease UI catalog, to decide which components to
port into Foldkit.

Crease UI already covers the shadcn/ui catalog (65 components). Astryx shares a
large middle layer with shadcn (buttons, dialogs, popovers, tables, ...) but adds
a second generation of components that shadcn does not ship: layout primitives,
status indicators, token inputs, segmented date/time inputs, navigation chrome,
and agent-era displays (ChatReasoning, LogStream, PowerSearch).

## Coverage status

### Already covered (no action)

Astryx name → Crease UI equivalent.

| Astryx                              | Crease UI                                             |
| ----------------------------------- | ----------------------------------------------------- |
| AlertDialog                         | `alert-dialog`                                        |
| AspectRatio                         | `aspect-ratio`                                        |
| Avatar                              | `avatar`                                              |
| Badge                               | `badge`                                               |
| Breadcrumbs                         | `breadcrumb`                                          |
| Button                              | `button`                                              |
| ButtonGroup                         | `button-group`                                        |
| Calendar                            | `calendar`                                            |
| Card                                | `card`                                                |
| Carousel                            | `carousel`                                            |
| Chat (ChatMessage, ChatComposer, …) | `message`, `bubble`, `message-scroller`, `attachment` |
| CheckboxInput                       | `checkbox`                                            |
| Collapsible                         | `collapsible`                                         |
| CommandPalette                      | `command`                                             |
| ContextMenu                         | `context-menu`                                        |
| Dialog                              | `dialog`                                              |
| Divider                             | `separator`                                           |
| DropdownMenu                        | `dropdown-menu`                                       |
| EmptyState                          | `empty`                                               |
| Field / FieldLabel                  | `field`                                               |
| FormLayout                          | `form`                                                |
| HoverCard                           | `hover-card`                                          |
| Icon                                | `lib/icon` (Lucide pipeline)                          |
| InputGroup                          | `input-group`                                         |
| Item                                | `item`                                                |
| Kbd                                 | `kbd`                                                 |
| NavMenu                             | `navigation-menu`, `menubar`                          |
| Pagination                          | `pagination`                                          |
| Popover                             | `popover`                                             |
| ProgressBar                         | `progress`                                            |
| RadioList                           | `radio-group`                                         |
| Resizable                           | `resizable`                                           |
| ScrollableArea                      | `scroll-area`                                         |
| Selector / SelectorOption           | `select`, `native-select`                             |
| Skeleton                            | `skeleton`                                            |
| Slider                              | `slider`                                              |
| Spinner                             | `spinner`                                             |
| Switch                              | `switch`                                              |
| TabList / Tab / TabMenu             | `tabs`                                                |
| Table                               | `table`, `data-table`                                 |
| TextArea                            | `textarea`                                            |
| TextInput                           | `input`                                               |
| Toast                               | `toast`, `sonner`                                     |
| ToggleButton                        | `toggle`                                              |
| ToggleButtonGroup                   | `toggle-group`                                        |
| Tooltip                             | `tooltip`                                             |
| Typeahead / BaseTypeahead           | `combobox`                                            |
| Chart package                       | `chart` (echarts adapter)                             |
| Drawer (lab)                        | `drawer`                                              |

### Skipped intentionally

| Astryx                                                                                  | Reason                                                                                                                                  |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| CodeEditor (lab)                                                                        | Requires a heavy editor engine (CodeMirror/Monaco-class); out of scope for a token-level port.                                          |
| RichTextEditor                                                                          | Lexical-based React editor; not a visual port target.                                                                                   |
| ThreeD (lab)                                                                            | WebGL/three.js surface.                                                                                                                 |
| Sankey / Radial / Chart stream (lab)                                                    | `chart` already covers arbitrary series via the echarts adapter.                                                                        |
| Layer, Overlay, Outline, InteractiveRoleContext, SizeContext, LinkProvider, i18n, hooks | Internal primitives/contexts, not product components.                                                                                   |
| MobileTokenizer                                                                         | Covered by `tokenizer`.                                                                                                                 |
| Theme / SyntaxTheme                                                                     | Theme infra; Crease UI uses its own token pipeline.                                                                                     |
| ComplexSelector                                                                         | A composition of Field + Selector + Popover already expressible with `combobox`/`select`; multi-value case covered by `multi-selector`. |
| VisuallyHidden?                                                                         | — included below as a real component.                                                                                                   |

### Components to port (49)

Batches are work units; slugs are the Crease UI names.

**Typography & content**

| Slug         | Astryx source | Notes                                                                                     |
| ------------ | ------------- | ----------------------------------------------------------------------------------------- |
| `text`       | `Text`        | Typescale roles (primary/secondary/supporting × sizes).                                   |
| `heading`    | `Heading`     | Semantic level + visual type scale.                                                       |
| `link`       | `Link`        | Inline link variants + underline modes.                                                   |
| `blockquote` | `Blockquote`  | Quote with cite/footer.                                                                   |
| `code`       | `Code`        | Inline code.                                                                              |
| `code-block` | `CodeBlock`   | Fenced block: header, language tag, copy.                                                 |
| `list`       | `List`        | Ordered/unordered/none markers.                                                           |
| `markdown`   | `Markdown`    | Markdown renderer built on the ported primitives (subset of astryx's remark feature set). |

**Layout primitives**

| Slug              | Astryx source               | Notes                                                  |
| ----------------- | --------------------------- | ------------------------------------------------------ |
| `stack`           | `Stack`, `HStack`, `VStack` | One component with direction prop + gap/align/justify. |
| `grid`            | `Grid`, `GridSpan`          | Columns + spans.                                       |
| `center`          | `Center`                    | Max-width centering.                                   |
| `section`         | `Section`                   | Page section w/ heading slot.                          |
| `visually-hidden` | `VisuallyHidden`            | sr-only utility.                                       |

**Status & display**

| Slug                | Astryx source                                            | Notes                                                         |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `status-dot`        | `StatusDot`                                              | Dot + pulse + status colors.                                  |
| `indicator`         | `Indicator`                                              | Positioned count/dot on a child (avatar/badge-style overlay). |
| `stat`              | `Stat` (lab)                                             | KPI: label, value, delta/trend.                               |
| `circular-progress` | `CircularProgress` (lab)                                 | Ring progress, determinate + indeterminate.                   |
| `thumbnail`         | `Thumbnail`                                              | Media frame w/ fallback.                                      |
| `avatar-group`      | `AvatarGroup` + `AvatarGroupOverflow`, `AvatarStatusDot` | Grouped avatars w/ overflow + status dot.                     |
| `token`             | `Token`                                                  | Pill/chip used by Tokenizer/PowerSearch.                      |

**Cards, banners & metadata**

| Slug              | Astryx source                       | Notes                                   |
| ----------------- | ----------------------------------- | --------------------------------------- |
| `banner`          | `Banner`                            | Page-level dismissible notice.          |
| `selectable-card` | `SelectableCard`                    | Card with selection affordance.         |
| `metadata-list`   | `MetadataList` + `MetadataListItem` | Term/description grid.                  |
| `more-menu`       | `MoreMenu`                          | “…” overflow menu trigger.              |
| `overflow-list`   | `OverflowList`                      | Responsive item overflow into MoreMenu. |
| `field-status`    | `FieldStatus`                       | Validation icon/message under inputs.   |

**Inputs**

| Slug               | Astryx source     | Notes                                                       |
| ------------------ | ----------------- | ----------------------------------------------------------- |
| `file-input`       | `FileInput`       | File select/dropzone.                                       |
| `number-input`     | `NumberInput`     | Stepper input.                                              |
| `time-input`       | `TimeInput`       | Segmented time entry.                                       |
| `list-input`       | `ListInput` (lab) | Freeform list-entry input.                                  |
| `date-input`       | `DateInput`       | Segmented date entry (distinct from `date-picker` popover). |
| `date-range-input` | `DateRangeInput`  | Two-segment range entry.                                    |
| `date-time-input`  | `DateTimeInput`   | Date + time segments.                                       |
| `tokenizer`        | `Tokenizer`       | Token/chip entry input.                                     |
| `multi-selector`   | `MultiSelector`   | Multi-value selector w/ tokens.                             |

**Selection & disclosure**

| Slug                | Astryx source                               | Notes                                                                   |
| ------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| `segmented-control` | `SegmentedControl` + `SegmentedControlItem` | iOS-style sliding segment picker (distinct visual from `toggle-group`). |
| `stepper`           | `Stepper` + `Step`                          | Multi-step progress, orientations, statuses, collapse.                  |
| `toolbar`           | `Toolbar`                                   | Action/formatting toolbar w/ groups.                                    |
| `info-tip`          | `InfoTip` (lab)                             | Icon-triggered tooltip.                                                 |

**Overlays & guided UI**

| Slug           | Astryx source                   | Notes                                                                                |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| `lightbox`     | `Lightbox`                      | Media viewer overlay.                                                                |
| `bottom-sheet` | `BottomSheet`                   | Mobile sheet w/ snap offsets + switcher (different interaction model than `drawer`). |
| `mobile-nav`   | `MobileNav` + `MobileNavToggle` | Mobile nav drawer.                                                                   |
| `tour`         | `Tour` (lab)                    | Anchored step-by-step tour.                                                          |

**Navigation chrome**

| Slug        | Astryx source                             | Notes                                            |
| ----------- | ----------------------------------------- | ------------------------------------------------ |
| `top-nav`   | `TopNav` + mega menu pieces               | Header nav w/ dropdown + mega menu.              |
| `side-nav`  | `SideNav` + section/heading/item/collapse | Left product nav (lighter than `sidebar` shell). |
| `tree-list` | `TreeList`                                | Expandable tree view.                            |

**Composite & agent-era**

| Slug             | Astryx source         | Notes                                   |
| ---------------- | --------------------- | --------------------------------------- |
| `power-search`   | `PowerSearch`         | Faceted filter search w/ token editors. |
| `transfer-list`  | `TransferList` (lab)  | Dual-list move control.                 |
| `log-stream`     | `LogStream` (lab)     | Scrolling log display w/ levels.        |
| `timestamp`      | `Timestamp`           | Absolute/relative time display.         |
| `timer`          | `Timer`               | Live elapsed/countdown.                 |
| `chat-reasoning` | `ChatReasoning` (lab) | Collapsible reasoning trace block.      |

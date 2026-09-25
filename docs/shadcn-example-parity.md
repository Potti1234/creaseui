# shadcn docs example parity

Tracks how closely the named examples on each component docs page match the
sections on the corresponding [ui.shadcn.com](https://ui.shadcn.com) docs page
(`apps/v4/content/docs/components/radix/*.mdx` in `shadcn-ui/ui`, compared
against a local clone at `71e5095`). The first example of every page also
renders as a heading-less hero preview directly under the page header, matching
shadcn's unnamed top preview.

Status legend: **done** = every upstream section name has a matching example;
**todo** = one or more upstream sections missing (names listed);
**crease-only** = no upstream example sections (creaseui-native page).

Current: 53 done · 8 todo · 3 crease-only

| Component | Ours | Upstream sections | Status |
| --- | --- | --- | --- |
| `accordion` | 7 | Basic<br>Multiple<br>Disabled<br>Borders<br>Card<br>RTL | done |
| `alert` | 11 | Basic<br>Destructive<br>Action<br>Custom Colors<br>RTL | done |
| `alert-dialog` | 7 | Basic<br>Small<br>Media<br>Small with Media<br>Destructive<br>RTL | done |
| `aspect-ratio` | 3 | Square<br>Portrait<br>RTL | done |
| `attachment` | 6 | Image<br>States<br>Sizes<br>Group<br>Trigger | done |
| `avatar` | 10 | Basic<br>Badge<br>Badge with Icon<br>Avatar Group<br>Avatar Group Count<br>Avatar Group with Icon<br>Sizes<br>Dropdown<br>RTL | done |
| `badge` | 7 | Variants<br>With Icon<br>With Spinner<br>Link<br>Custom Colors<br>RTL | done |
| `breadcrumb` | 7 | Basic<br>Custom separator<br>Dropdown<br>Collapsed<br>Link component<br>RTL | done |
| `bubble` | 10 | Variants<br>Alignment<br>Bubble Group<br>Links and Buttons<br>Reactions<br>Show More / Collapsible<br>Tooltip<br>Popover | done |
| `button` | 17 | Size<br>Default<br>Outline<br>Secondary<br>Ghost<br>Destructive<br>Link<br>Icon<br>With Icon<br>Rounded<br>Spinner<br>Button Group<br>As Child<br>RTL | done |
| `button-group` | 12 | Orientation<br>Size<br>Nested<br>Separator<br>Split<br>Input<br>Input Group<br>Dropdown Menu<br>Select<br>Popover<br>RTL | done |
| `calendar` | 10 | Persian / Hijri / Jalali Calendar<br>Basic<br>Range Calendar<br>Month and Year Selector<br>Presets<br>Date and Time Picker<br>Booked dates<br>Custom Cell Size<br>Week Numbers<br>RTL | todo (missing: Persian / Hijri / Jalali Calendar) |
| `card` | 11 | Size<br>Spacing<br>Spacing<br>Image<br>RTL | done |
| `carousel` | 8 | Sizes<br>Spacing<br>Orientation<br>API<br>Plugins<br>RTL | done |
| `chart` | 25 | Your First Chart<br>Your First Chart<br>Your First Chart<br>Your First Chart<br>Your First Chart<br>Tooltip<br>RTL | done |
| `checkbox` | 14 | Invalid State<br>Basic<br>Description<br>Disabled<br>Group<br>Table<br>RTL | done |
| `collapsible` | 14 | Basic<br>Settings Panel<br>File Tree<br>RTL | done |
| `combobox` | 9 | Basic<br>Multiple<br>Clear Button<br>Groups<br>Custom Items<br>Invalid<br>Disabled<br>Auto Highlight<br>Popup<br>Input Group<br>RTL | todo (missing: Multiple, Auto Highlight, Popup) |
| `command` | 7 | Basic<br>Shortcuts<br>Groups<br>Scrollable<br>RTL | done |
| `context-menu` | 10 | Basic<br>Submenu<br>Shortcuts<br>Groups<br>Icons<br>Checkboxes<br>Radio<br>Destructive<br>RTL | done |
| `data-table` | 4 | RTL | done |
| `date-picker` | 2 | Basic<br>Range Picker<br>Date of Birth<br>Input<br>Time Picker<br>Natural Language Picker<br>RTL | todo (missing: Basic, Range Picker, Date of Birth, Input, Time Picker, Natural Language Picker, RTL) |
| `dialog` | 7 | Custom Close Button<br>No Close Button<br>Sticky Footer<br>Scrollable Content<br>RTL | done |
| `direction` | 2 | — | crease-only |
| `drawer` | 11 | Scrollable Content<br>Sides<br>Responsive Dialog<br>RTL | done |
| `dropdown-menu` | 12 | Basic<br>Submenu<br>Shortcuts<br>Icons<br>Checkboxes<br>Checkboxes Icons<br>Radio Group<br>Radio Icons<br>Destructive<br>Avatar<br>Complex<br>RTL | done |
| `empty` | 8 | Outline<br>Background<br>Avatar<br>Avatar Group<br>InputGroup<br>RTL | done |
| `field` | 13 | Input<br>Textarea<br>Select<br>Slider<br>Fieldset<br>Checkbox<br>Radio<br>Switch<br>Choice Card<br>Field Group<br>RTL<br>Responsive Layout | done |
| `hover-card` | 5 | Basic<br>Sides<br>RTL | done |
| `input` | 14 | Basic<br>Field<br>Field Group<br>Disabled<br>Invalid<br>File<br>Inline<br>Grid<br>Required<br>Badge<br>Input Group<br>Button Group<br>Form<br>RTL | done |
| `input-group` | 11 | Align<br>Align<br>Align<br>Align<br>Icon<br>Text<br>Button<br>Kbd<br>Dropdown<br>Spinner<br>Textarea<br>Custom Input<br>RTL | done |
| `input-otp` | 10 | Pattern<br>Separator<br>Disabled<br>Controlled<br>Invalid<br>Four Digits<br>Alphanumeric<br>Form<br>RTL | done |
| `item` | 17 | Variant<br>Size<br>Icon<br>Avatar<br>Image<br>Group<br>Header<br>Link<br>Dropdown<br>RTL | done |
| `kbd` | 6 | Group<br>Button<br>Tooltip<br>Input Group<br>RTL | done |
| `label` | 3 | Label in Field<br>RTL | done |
| `marker` | 9 | Variants<br>Status<br>Shimmer<br>Separator<br>Border<br>With Icon<br>Links and Buttons | done |
| `menubar` | 6 | Checkbox<br>Radio<br>Submenu<br>With Icons<br>RTL | done |
| `message` | 6 | Avatar<br>Group<br>Header and Footer<br>Actions<br>Attachment | done |
| `message-scroller` | 2 | Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts<br>Core Concepts | todo (missing: Core Concepts, Core Concepts, Core Concepts, Core Concepts, Core Concepts, Core Concepts, Core Concepts, Core Concepts, Core Concepts, Core Concepts) |
| `native-select` | 5 | Groups<br>Disabled<br>Invalid<br>RTL | done |
| `navigation-menu` | 6 | RTL | done |
| `pagination` | 9 | Simple<br>Icons Only<br>RTL | done |
| `popover` | 10 | Basic<br>Align<br>With Form<br>RTL | done |
| `progress` | 7 | Label<br>Controlled<br>RTL | done |
| `radio-group` | 8 | Description<br>Choice Card<br>Fieldset<br>Disabled<br>Invalid<br>RTL | done |
| `resizable` | 4 | Vertical<br>Handle<br>RTL | done |
| `scroll-area` | 3 | Horizontal<br>RTL | done |
| `select` | 6 | Align Item With Trigger<br>Groups<br>Scrollable<br>Disabled<br>Invalid<br>RTL | todo (missing: Align Item With Trigger) |
| `separator` | 9 | Vertical<br>Menu<br>List<br>RTL | done |
| `sheet` | 4 | Side<br>No Close Button<br>RTL | done |
| `sidebar` | 12 | — | crease-only |
| `skeleton` | 7 | Avatar<br>Card<br>Text<br>Form<br>Table<br>RTL | done |
| `slider` | 5 | Range<br>Multiple Thumbs<br>Vertical<br>Controlled<br>Disabled<br>RTL | todo (missing: Range, Multiple Thumbs, Vertical, Controlled, Disabled, RTL) |
| `sonner` | 7 | Types<br>Description<br>Position | done |
| `spinner` | 2 | Customization<br>Size<br>Button<br>Badge<br>Input Group<br>Empty<br>RTL | todo (missing: Customization, Size, Button, Badge, Input Group, Empty, RTL) |
| `switch` | 7 | Description<br>Choice Card<br>Disabled<br>Invalid<br>Size<br>RTL | done |
| `table` | 10 | Footer<br>Actions<br>RTL | done |
| `tabs` | 15 | Line<br>Vertical<br>Disabled<br>Icons<br>RTL | done |
| `textarea` | 7 | Field<br>Disabled<br>Invalid<br>Button<br>RTL | done |
| `toast` | 1 | — | crease-only |
| `toggle` | 6 | Outline<br>With Text<br>Size<br>Disabled<br>RTL | done |
| `toggle-group` | 8 | Outline<br>Size<br>Spacing<br>Vertical<br>Disabled<br>Custom<br>RTL | done |
| `tooltip` | 5 | Side<br>With Keyboard Shortcut<br>Disabled Button<br>RTL | done |
| `typography` | 3 | h1<br>h2<br>h3<br>h4<br>p<br>blockquote<br>table<br>list<br>Inline code<br>Lead<br>Large<br>Small<br>Muted<br>RTL | todo (missing: h1, h2, h3, h4, p, blockquote, table, list, Lead, Large, Small, Muted, RTL) |

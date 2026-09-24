# shadcn docs example parity

Tracks how closely the named examples on each component docs page match the
sections on the corresponding [ui.shadcn.com](https://ui.shadcn.com) docs page
(`apps/v4/content/docs/components/radix/*.mdx` in `shadcn-ui/ui`).
The first example of every page also renders as a heading-less hero preview
directly under the page header, matching shadcn's unnamed top preview.

Status legend: **done** = every upstream section has a matching example;
**count-met** = we have at least as many examples as upstream has sections
(name-level match still to verify); **todo** = fewer examples than upstream;
**crease-only** = no upstream example sections (creaseui-native page).

Current: 1 done · 11 count-met · 51 todo · 3 crease-only

| Component | Ours | Upstream sections | Status |
| --- | --- | --- | --- |
| `accordion` | 2 | Basic<br>Multiple<br>Disabled<br>Borders<br>Card<br>RTL | todo |
| `alert` | 4 | Basic<br>Destructive<br>Action<br>Custom Colors<br>RTL | todo |
| `alert-dialog` | 2 | Basic<br>Small<br>Media<br>Small with Media<br>Destructive<br>RTL | todo |
| `aspect-ratio` | 2 | Square<br>Portrait<br>RTL | todo |
| `attachment` | 2 | Features<br>Image<br>States<br>Sizes<br>Group<br>Trigger | todo |
| `avatar` | 2 | Basic<br>Badge<br>Badge with Icon<br>Avatar Group<br>Avatar Group Count<br>Avatar Group with Icon<br>Sizes<br>Dropdown<br>RTL | todo |
| `badge` | 2 | Variants<br>With Icon<br>With Spinner<br>Link<br>Custom Colors<br>RTL | todo |
| `breadcrumb` | 4 | Basic<br>Custom separator<br>Dropdown<br>Collapsed<br>Link component<br>RTL | todo |
| `bubble` | 3 | Features<br>Variants<br>Alignment<br>Bubble Group<br>Links and Buttons<br>Reactions<br>Show More / Collapsible<br>Tooltip<br>Popover | todo |
| `button` | 7 | Cursor<br>Size<br>Default<br>Outline<br>Secondary<br>Ghost<br>Destructive<br>Link<br>Icon<br>With Icon<br>Rounded<br>Spinner<br>Button Group<br>As Child<br>RTL | todo |
| `button-group` | 2 | ButtonGroup vs ToggleGroup<br>Orientation<br>Size<br>Nested<br>Separator<br>Split<br>Input<br>Input Group<br>Dropdown Menu<br>Select<br>Popover<br>RTL | todo |
| `calendar` | 4 | Date Picker<br>Persian / Hijri / Jalali Calendar<br>Selected Date (With TimeZone)<br>Basic<br>Range Calendar<br>Month and Year Selector<br>Presets<br>Date and Time Picker<br>Booked dates<br>Custom Cell Size<br>Week Numbers<br>RTL | todo |
| `card` | 2 | Size<br>Spacing<br>Image<br>RTL | todo |
| `carousel` | 2 | Sizes<br>Spacing<br>Orientation<br>Options<br>API<br>Events<br>Plugins<br>RTL | todo |
| `chart` | 10 | Tooltip<br>Legend<br>RTL | count-met |
| `checkbox` | 4 | Checked State<br>Invalid State<br>Basic<br>Description<br>Disabled<br>Group<br>Table<br>RTL | todo |
| `collapsible` | 3 | Controlled State<br>Basic<br>Settings Panel<br>File Tree<br>RTL | todo |
| `combobox` | 4 | Custom Items<br>Multiple Selection<br>Basic<br>Multiple<br>Clear Button<br>Groups<br>Custom Items<br>Invalid<br>Disabled<br>Auto Highlight<br>Popup<br>Input Group<br>RTL | todo |
| `command` | 5 | Basic<br>Shortcuts<br>Groups<br>Scrollable<br>RTL | count-met |
| `context-menu` | 3 | Basic<br>Submenu<br>Shortcuts<br>Groups<br>Icons<br>Checkboxes<br>Radio<br>Destructive<br>RTL | todo |
| `data-table` | 3 | Set up Table Features<br>Basic Table<br>Cell Formatting<br>Row Actions<br>Pagination<br>Sorting<br>Filtering<br>Visibility<br>Row Selection<br>RTL | todo |
| `date-picker` | 2 | Basic<br>Range Picker<br>Date of Birth<br>Input<br>Time Picker<br>Natural Language Picker<br>RTL | todo |
| `dialog` | 2 | Custom Close Button<br>No Close Button<br>Sticky Footer<br>Scrollable Content<br>RTL | todo |
| `direction` | 2 | — | crease-only |
| `drawer` | 2 | Scrollable Content<br>Sides<br>Responsive Dialog<br>RTL | todo |
| `dropdown-menu` | 12 | Basic<br>Submenu<br>Shortcuts<br>Icons<br>Checkboxes<br>Checkboxes Icons<br>Radio Group<br>Radio Icons<br>Destructive<br>Avatar<br>Complex<br>RTL | done |
| `empty` | 4 | Outline<br>Background<br>Avatar<br>Avatar Group<br>InputGroup<br>RTL | todo |
| `field` | 4 | Anatomy<br>Form<br>Input<br>Textarea<br>Select<br>Slider<br>Fieldset<br>Checkbox<br>Radio<br>Switch<br>Choice Card<br>Field Group<br>RTL<br>Responsive Layout<br>Validation and Errors | todo |
| `form` | 3 | — | crease-only |
| `hover-card` | 2 | Trigger Delays<br>Positioning<br>Basic<br>Sides<br>RTL | todo |
| `input` | 4 | Basic<br>Field<br>Field Group<br>Disabled<br>Invalid<br>File<br>Inline<br>Grid<br>Required<br>Badge<br>Input Group<br>Button Group<br>Form<br>RTL | todo |
| `input-group` | 2 | Align<br>Icon<br>Text<br>Button<br>Kbd<br>Dropdown<br>Spinner<br>Textarea<br>Custom Input<br>RTL | todo |
| `input-otp` | 3 | Pattern<br>Separator<br>Disabled<br>Controlled<br>Invalid<br>Four Digits<br>Alphanumeric<br>Form<br>RTL | todo |
| `item` | 3 | Item vs Field<br>Variant<br>Size<br>Icon<br>Avatar<br>Image<br>Group<br>Header<br>Link<br>Dropdown<br>RTL | todo |
| `kbd` | 2 | Group<br>Button<br>Tooltip<br>Input Group<br>RTL | todo |
| `label` | 2 | Label in Field<br>RTL | count-met |
| `marker` | 3 | Features<br>Variants<br>Status<br>Shimmer<br>Separator<br>Border<br>With Icon<br>Links and Buttons | todo |
| `menubar` | 4 | Checkbox<br>Radio<br>Submenu<br>With Icons<br>RTL | todo |
| `message` | 3 | Features<br>Avatar<br>Group<br>Header and Footer<br>Actions<br>Attachment | todo |
| `message-scroller` | 2 | MessageScroller | count-met |
| `native-select` | 2 | Groups<br>Disabled<br>Invalid<br>Native Select vs Select<br>RTL | todo |
| `navigation-menu` | 4 | Link Component<br>RTL | count-met |
| `pagination` | 4 | Simple<br>Icons Only<br>Next.js<br>RTL | count-met |
| `popover` | 2 | Basic<br>Align<br>With Form<br>RTL | todo |
| `progress` | 3 | Label<br>Controlled<br>RTL | count-met |
| `questionnaire` | 0 | Multiple Selection<br>Freeform Answer<br>Explicit Skip<br>Shortcuts<br>Custom Validation<br>Controlled<br>Resume<br>Conditional Items<br>Navigation State<br>Custom Progress<br>Animated Items<br>Card<br>Dialog | todo |
| `radio-group` | 4 | Description<br>Choice Card<br>Fieldset<br>Disabled<br>Invalid<br>RTL | todo |
| `resizable` | 2 | Vertical<br>Handle<br>RTL | todo |
| `scroll-area` | 2 | Horizontal<br>RTL | count-met |
| `select` | 4 | Align Item With Trigger<br>Groups<br>Scrollable<br>Disabled<br>Invalid<br>RTL | todo |
| `separator` | 2 | Vertical<br>Menu<br>List<br>RTL | todo |
| `sheet` | 4 | Side<br>No Close Button<br>RTL | count-met |
| `sidebar` | 8 | Structure<br>SidebarProvider<br>Sidebar<br>SidebarHeader<br>SidebarFooter<br>SidebarContent<br>SidebarGroup<br>SidebarMenu<br>SidebarMenuButton<br>SidebarMenuAction<br>SidebarMenuSub<br>SidebarMenuBadge<br>SidebarMenuSkeleton<br>SidebarTrigger<br>SidebarRail<br>Controlled Sidebar<br>Styling<br>RTL | todo |
| `skeleton` | 2 | Avatar<br>Card<br>Text<br>Form<br>Table<br>RTL | todo |
| `slider` | 5 | Range<br>Multiple Thumbs<br>Vertical<br>Controlled<br>Disabled<br>RTL | todo |
| `sonner` | 4 | Types<br>Description<br>Position | count-met |
| `spinner` | 2 | Customization<br>Size<br>Button<br>Badge<br>Input Group<br>Empty<br>RTL | todo |
| `switch` | 5 | Description<br>Choice Card<br>Disabled<br>Invalid<br>Size<br>RTL | todo |
| `table` | 4 | Footer<br>Actions<br>Data Table<br>RTL | count-met |
| `tabs` | 4 | Line<br>Vertical<br>Disabled<br>Icons<br>RTL | todo |
| `textarea` | 4 | Field<br>Disabled<br>Invalid<br>Button<br>RTL | todo |
| `toast` | 2 | — | crease-only |
| `toggle` | 4 | Outline<br>With Text<br>Size<br>Disabled<br>RTL | todo |
| `toggle-group` | 5 | Outline<br>Size<br>Spacing<br>Vertical<br>Disabled<br>Custom<br>RTL | todo |
| `tooltip` | 3 | Side<br>With Keyboard Shortcut<br>Disabled Button<br>RTL | todo |
| `typography` | 3 | h1<br>h2<br>h3<br>h4<br>p<br>blockquote<br>table<br>list<br>Inline code<br>Lead<br>Large<br>Small<br>Muted<br>RTL | todo |

import { Option } from 'effect'
import { type Html, html } from 'foldkit/html'

import { type PageDefinitions } from '@/docs/components/page-definition'
import { realPreview } from '@/docs/components/real-previews'
import * as State from '@/docs/components/catalog-state'
import * as Badge from '@/ui/badge'
import * as Button from '@/ui/button'
import * as Card from '@/ui/card'
import * as Input from '@/ui/input'
import * as Popover from '@/ui/popover'
import * as Progress from '@/ui/progress'
import * as RadioGroup from '@/ui/radio-group'
import * as Resizable from '@/ui/resizable'
import * as ScrollArea from '@/ui/scroll-area'
import * as Select from '@/ui/select'
import * as Separator from '@/ui/separator'
import * as Sheet from '@/ui/sheet'
import * as Sidebar from '@/ui/sidebar'
import * as Skeleton from '@/ui/skeleton'
import * as Slider from '@/ui/slider'
import * as Sonner from '@/ui/sonner'
import * as Spinner from '@/ui/spinner'
import * as Switch from '@/ui/switch'
import * as Table from '@/ui/table'
import * as Tabs from '@/ui/tabs'
import * as Textarea from '@/ui/textarea'
import * as Toast from '@/ui/toast'
import * as Toggle from '@/ui/toggle'
import * as ToggleGroup from '@/ui/toggle-group'
import * as Tooltip from '@/ui/tooltip'
import * as Typography from '@/ui/typography'

type Message = State.Message
const h = html<Message>()
const action = State.ClickedPreviewAction()
const width = 'w-full max-w-sm'

const basic = (slug: string, code: string) => ({
  title: 'Basic',
  preview: (model: State.Model) => realPreview(slug, model),
  code,
})

const rtl = (child: Html): Html => h.div([h.Dir('rtl')], [child])
const row = (...children: ReadonlyArray<Html | string>): Html =>
  h.div([h.Class('flex flex-wrap items-center gap-3')], children)
const stack = (...children: ReadonlyArray<Html | string>): Html =>
  h.div([h.Class('grid w-full max-w-md gap-3')], children)

const popover = (model: State.Model, suffix: string, align: Popover.PopoverAlign = 'center') =>
  Popover.popover({
    model: { ...model.popover, id: `docs-popover-${suffix}` },
    toParentMessage: message => State.GotPopoverMessage({ message }),
    trigger: 'Open popover',
    triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
    align,
    content: stack(
      h.h4([h.Class('font-medium')], ['Dimensions']),
      h.p([h.Class('text-sm text-muted-foreground')], ['Set the dimensions for the layer.']),
    ),
  })

const radio = (model: State.Model, suffix: string, options: ReadonlyArray<RadioGroup.RadioGroupOption>, config: Readonly<{ disabled?: boolean; class?: string }> = {}) =>
  RadioGroup.radioGroup({
    id: `docs-radio-${suffix}`,
    selectedValue: Option.some(model.selectedRadioValue),
    onSelect: value => State.SelectedRadioValue({ value }),
    ariaLabel: 'Notification preference',
    options,
    ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
    ...(config.class === undefined ? {} : { class: config.class }),
  })

const resizePanel = (model: State.Model, suffix: string, direction: 'horizontal' | 'vertical' = 'horizontal', withHandle = false) =>
  Resizable.resizable({
    model: { ...model.resizable, id: `docs-resizable-${suffix}` },
    toParentMessage: message => State.GotResizableMessage({ message }),
    direction,
    withHandle,
    class: 'h-48 w-full max-w-xl',
    first: h.div([h.Class('flex size-full items-center justify-center p-6')], ['One']),
    second: h.div([h.Class('flex size-full items-center justify-center p-6')], ['Two']),
  })

type Fruit = Readonly<{ value: string; label: string; group?: string }>
const fruits: ReadonlyArray<Fruit> = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'blueberry', label: 'Blueberry', group: 'Berries' },
  { value: 'strawberry', label: 'Strawberry', group: 'Berries' },
]
const select = (model: State.Model, suffix: string, items: ReadonlyArray<Fruit> = fruits, grouped = false) =>
  Select.select({
    model: { ...model.select, id: `docs-select-${suffix}` },
    maybeSelectedValue: model.selectedSelectValue,
    toParentMessage: message => State.GotSelectMessage({ message }),
    items,
    itemToValue: item => item.value,
    itemToLabel: item => item.label,
    placeholder: 'Select a fruit',
    ...(grouped ? { itemGroupKey: (item: Fruit) => item.group ?? '', groupToHeading: (group: string) => group } : {}),
  })

const sheet = (model: State.Model, suffix: string, side: Sheet.SheetSide = 'right', showCloseButton = true) =>
  h.div([], [
    Button.button({ children: [`Open ${side} sheet`], onClick: State.OpenedOverlay({ target: 'sheet' }) }),
    Sheet.sheet({
      model: { ...model.sheet, id: `docs-sheet-${suffix}` },
      toParentMessage: message => State.GotSheetMessage({ message }),
      title: 'Edit profile',
      description: 'Make changes to your profile here. Click save when you are done.',
      side,
      showCloseButton,
      content: () => [Input.input({ id: `sheet-name-${suffix}`, value: model.sheetName, onInput: value => State.ChangedText({ target: 'sheetName', value }), label: 'Name' })],
    }),
  ])

const skeletonLines = (): Html => stack(
  Skeleton.skeleton({ class: 'h-4 w-3/4' }),
  Skeleton.skeleton({ class: 'h-4 w-full' }),
  Skeleton.skeleton({ class: 'h-4 w-2/3' }),
)

const slider = (model: State.Model, suffix: string, config: Readonly<{ disabled?: boolean; class?: string; label?: string }> = {}) =>
  Slider.slider({
    model: { ...model.slider, id: `docs-slider-${suffix}` },
    value: model.sliderValue,
    toParentMessage: message => State.GotSliderMessage({ message }),
    ariaLabel: config.label ?? 'Volume',
    ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
    class: config.class ?? width,
  })

const switchControl = (model: State.Model, suffix: string, config: Readonly<{ description?: string; disabled?: boolean; size?: Switch.SwitchSize }> = {}) =>
  Switch.switchControl({
    id: `docs-switch-${suffix}`,
    isChecked: model.isSwitchChecked,
    onToggle: isChecked => State.ToggledSwitch({ isChecked }),
    label: 'Airplane Mode',
    ...(config.description === undefined ? {} : { description: config.description }),
    ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
    ...(config.size === undefined ? {} : { size: config.size }),
  })

const invoices = [
  ['INV001', 'Paid', '$250.00'], ['INV002', 'Pending', '$150.00'], ['INV003', 'Unpaid', '$350.00'],
] as const
const invoiceTable = (footer = false, actions = false): Html => Table.table({ children: [
  Table.tableCaption({ children: ['A list of your recent invoices.'] }),
  Table.tableHeader({ children: [Table.tableRow({ children: [
    Table.tableHead({ children: ['Invoice'] }), Table.tableHead({ children: ['Status'] }),
    Table.tableHead({ class: 'text-right', children: [actions ? 'Actions' : 'Total'] }),
  ] })] }),
  Table.tableBody({ children: invoices.map(invoice => Table.tableRow({ children: [
    Table.tableCell({ children: [invoice[0]] }), Table.tableCell({ children: [invoice[1]] }),
    Table.tableCell({ class: 'text-right', children: actions ? [Button.button({ variant: 'ghost', size: 'sm', onClick: action, children: ['View'] })] : [invoice[2]] }),
  ] })) }),
  ...(footer ? [Table.tableFooter({ children: [Table.tableRow({ children: [Table.tableCell({ children: ['Total'] }), Table.tableCell({ children: [''] }), Table.tableCell({ class: 'text-right', children: ['$750.00'] })] })] })] : []),
] })

const tabSet = (model: State.Model, suffix: string, config: Readonly<{ variant?: 'default' | 'line'; orientation?: 'horizontal' | 'vertical'; disabled?: boolean; icons?: boolean }> = {}) => Tabs.tabs({
  model: { ...model.tabs, id: `docs-tabs-${suffix}` },
  selectedValue: model.selectedTabValue,
  toParentMessage: message => State.GotTabsMessage({ message }),
  ...(config.variant === undefined ? {} : { variant: config.variant }),
  ...(config.orientation === undefined ? {} : { orientation: config.orientation }),
  class: 'w-full max-w-md',
  tabs: [
    { value: 'account', label: config.icons ? '⚙ Account' : 'Account', content: 'Make changes to your account here.' },
    { value: 'password', label: config.icons ? '🔒 Password' : 'Password', content: 'Change your password here.', ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }) },
  ],
})

const textarea = (model: State.Model, suffix: string, config: Readonly<{ disabled?: boolean; invalid?: boolean; label?: string }> = {}) => Textarea.textarea({
  id: `docs-textarea-${suffix}`,
  value: model.textarea,
  onInput: value => State.ChangedText({ target: 'textarea', value }),
  placeholder: 'Type your message here.',
  ...(config.label === undefined ? {} : { label: config.label }),
  ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
  ...(config.invalid === undefined ? {} : { isInvalid: config.invalid }),
  class: width,
})

const toggle = (config: Readonly<{ variant?: 'default' | 'outline'; size?: 'sm' | 'default' | 'lg'; text?: boolean; disabled?: boolean }> = {}) =>
  Toggle.toggle({ isPressed: true, onToggle: action, ...(config.variant === undefined ? {} : { variant: config.variant }), ...(config.size === undefined ? {} : { size: config.size }), ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }), children: [config.text ? 'Bold' : 'B'] })

const toggleGroup = (config: Readonly<{ variant?: 'default' | 'outline'; size?: 'sm' | 'default' | 'lg'; vertical?: boolean; disabled?: boolean; custom?: boolean }> = {}) => ToggleGroup.toggleGroup({
  value: config.custom ? 'bold' : 'center',
  onToggle: () => action,
  ...(config.variant === undefined ? {} : { variant: config.variant }),
  ...(config.size === undefined ? {} : { size: config.size }),
  ...(config.vertical === true ? { class: 'flex-col [&>*]:rounded-md!' } : {}),
  items: config.custom
    ? [{ value: 'bold', children: ['Bold'] }, { value: 'italic', children: ['Italic'] }, { value: 'underline', children: ['Underline'] }]
    : [{ value: 'left', children: ['Left'] }, { value: 'center', children: ['Center'] }, { value: 'right', children: ['Right'], ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }) }],
})

const tooltip = (model: State.Model, suffix: string, config: Readonly<{ side?: Tooltip.TooltipSide; content?: string; disabled?: boolean }> = {}) => Tooltip.tooltip({
  model: { ...model.tooltip, id: `docs-tooltip-${suffix}` },
  toParentMessage: message => State.GotTooltipMessage({ message }),
  trigger: config.disabled ? 'Disabled' : 'Hover me',
  triggerClass: 'rounded-md border px-3 py-2 text-sm',
  content: config.content ?? 'Add to library',
  ...(config.side === undefined ? {} : { side: config.side }),
  ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
})

const rawDefinitions: PageDefinitions = {
  popover: {
    description: 'Displays rich content in a portal, triggered by a button.',
    composition: 'Popover\n├── PopoverTrigger\n└── PopoverContent',
    examples: [
      basic('popover', `Popover.popover({ model, trigger: 'Open popover', content })`),
      { title: 'Align', preview: model => row(popover(model, 'start', 'start'), popover(model, 'center'), popover(model, 'end', 'end')), code: `Popover.popover({ ...props, align: 'start' })` },
      { title: 'With Form', preview: model => Popover.popover({ model: { ...model.popover, id: 'docs-popover-form' }, toParentMessage: message => State.GotPopoverMessage({ message }), trigger: 'Open form', triggerClass: 'rounded-md border px-4 py-2 text-sm', content: stack(Input.input({ id: 'popover-width', value: model.input, onInput: value => State.ChangedText({ target: 'input', value }), label: 'Width', placeholder: '100%' }), Input.input({ id: 'popover-height', value: model.inputGroup, onInput: value => State.ChangedText({ target: 'inputGroup', value }), label: 'Height', placeholder: '25px' })) }), code: `Popover.popover({ content: dimensionsForm })` },
      { title: 'RTL', preview: model => rtl(popover(model, 'rtl', 'end')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  progress: {
    description: 'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    composition: 'Progress\n└── ProgressIndicator\n\nWith label and value: Label + value + Progress',
    examples: [
      basic('progress', `Progress.progress({ value: 60 })`),
      { title: 'Label', preview: () => stack(row('Uploading', h.span([h.Class('ml-auto text-sm text-muted-foreground')], ['60%'])), Progress.progress({ value: 60 })), code: `Progress.progress({ value: 60 })` },
      { title: 'Controlled', preview: () => Progress.progress({ value: 42, class: width }), code: `Progress.progress({ value: model.progress })` },
      { title: 'RTL', preview: () => rtl(Progress.progress({ value: 60, class: width })), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  'radio-group': {
    description: 'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.',
    composition: 'RadioGroup\n├── RadioGroupItem\n├── Label\n└── Description',
    examples: [
      basic('radio-group', `RadioGroup.radioGroup({ model, options })`),
      { title: 'Description', preview: model => radio(model, 'description', [{ value: 'comfortable', label: 'Comfortable', description: 'Balances content density and readability.' }, { value: 'compact', label: 'Compact', description: 'Fits more content on the screen.' }]), code: `options: [{ value, label, description }]` },
      { title: 'Choice Card', preview: model => radio(model, 'cards', [{ value: 'starter', label: 'Starter', description: 'For personal projects.' }, { value: 'pro', label: 'Pro', description: 'For growing teams.' }], { class: 'rounded-lg border p-4' }), code: `RadioGroup.radioGroup({ class: 'rounded-lg border p-4', … })` },
      { title: 'Fieldset', preview: model => h.fieldset([h.Class('grid gap-3')], [h.legend([h.Class('text-sm font-medium')], ['Notify me about…']), radio(model, 'fieldset', [{ value: 'all', label: 'All new messages' }, { value: 'mentions', label: 'Direct messages and mentions' }])]), code: `<fieldset><legend>…</legend>{radioGroup}</fieldset>` },
      { title: 'Disabled', preview: model => radio(model, 'disabled', [{ value: 'default', label: 'Default' }, { value: 'comfortable', label: 'Comfortable' }], { disabled: true }), code: `RadioGroup.radioGroup({ isDisabled: true, … })` },
      { title: 'Invalid', preview: model => h.div([h.AriaInvalid(true)], [radio(model, 'invalid', [{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }]), h.p([h.Class('text-sm text-destructive')], ['Choose a contact method.'])]), code: `<div aria-invalid="true">…</div>` },
      { title: 'RTL', preview: model => rtl(radio(model, 'rtl', [{ value: 'one', label: 'الخيار الأول' }, { value: 'two', label: 'الخيار الثاني' }])), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  resizable: {
    description: 'Accessible resizable panel groups and layouts with keyboard support.',
    composition: 'ResizablePanelGroup\n├── ResizablePanel\n├── ResizableHandle\n└── ResizablePanel',
    examples: [
      basic('resizable', `Resizable.resizable({ model, first, second })`),
      { title: 'Vertical', preview: model => resizePanel(model, 'vertical', 'vertical'), code: `Resizable.resizable({ direction: 'vertical', … })` },
      { title: 'Handle', preview: model => resizePanel(model, 'handle', 'horizontal', true), code: `Resizable.resizable({ withHandle: true, … })` },
      { title: 'RTL', preview: model => rtl(resizePanel(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  'scroll-area': {
    description: 'Augments native scroll functionality for custom, cross-browser styling.',
    composition: 'ScrollArea\n└── native scroll viewport',
    examples: [
      basic('scroll-area', `ScrollArea.scrollArea({ children })`),
      { title: 'Horizontal', preview: () => ScrollArea.scrollArea({ class: 'w-96 rounded-md border whitespace-nowrap', children: [h.div([h.Class('flex w-max gap-4 p-4')], ['Nature', 'Architecture', 'Travel', 'Portraits'].map((label, index) => Card.card({ class: 'w-40 shrink-0', children: [Card.cardContent({ class: 'flex h-32 items-end p-4', children: [`${index + 1}. ${label}`] })] })))] }), code: `ScrollArea.scrollArea({ class: 'w-96 whitespace-nowrap', children })` },
      { title: 'RTL', preview: () => rtl(ScrollArea.scrollArea({ class: 'h-56 w-48 rounded-md border p-4', children: Array.from({ length: 20 }, (_, index) => h.div([h.Class('py-1 text-sm')], [`وسم ${index + 1}`])) })), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  select: {
    description: 'Displays a list of options for the user to pick from—triggered by a button.',
    composition: 'Select\n├── SelectTrigger\n├── SelectContent\n├── SelectGroup\n└── SelectItem',
    examples: [
      basic('select', `Select.select({ model, items, itemToValue, itemToLabel })`),
      { title: 'Align Item With Trigger', preview: model => select(model, 'aligned'), code: `Select.select({ model, items })` },
      { title: 'Groups', preview: model => select(model, 'groups', fruits, true), code: `Select.select({ itemGroupKey, groupToHeading, … })` },
      { title: 'Scrollable', preview: model => select(model, 'scrollable', Array.from({ length: 30 }, (_, index) => ({ value: `zone-${index}`, label: `Time zone ${index + 1}` }))), code: `Select.select({ items: timeZones, … })` },
      { title: 'Disabled', preview: model => h.div([h.Class('pointer-events-none opacity-50')], [select(model, 'disabled')]), code: `<div class="pointer-events-none opacity-50">…</div>` },
      { title: 'Invalid', preview: model => h.div([h.AriaInvalid(true), h.Class('grid gap-2')], [select(model, 'invalid'), h.p([h.Class('text-sm text-destructive')], ['Please select a fruit.'])]), code: `<div aria-invalid="true">…</div>` },
      { title: 'RTL', preview: model => rtl(select(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  separator: {
    description: 'Visually or semantically separates content.',
    examples: [
      basic('separator', `Separator.separator()`),
      { title: 'Vertical', preview: () => row('Blog', Separator.separator({ orientation: 'vertical', class: 'h-5' }), 'Docs', Separator.separator({ orientation: 'vertical', class: 'h-5' }), 'Source'), code: `Separator.separator({ orientation: 'vertical' })` },
      { title: 'Menu', preview: () => row('Home', Separator.separator({ orientation: 'vertical', class: 'h-5' }), 'Components', Separator.separator({ orientation: 'vertical', class: 'h-5' }), 'Pricing'), code: `Separator.separator({ orientation: 'vertical' })` },
      { title: 'List', preview: () => stack(...['Introduction', 'Installation', 'Typography'].flatMap((item, index) => index === 0 ? [item] : [Separator.separator(), item])), code: `items.flatMap(item => [Separator.separator(), item])` },
      { title: 'RTL', preview: () => rtl(row('الرئيسية', Separator.separator({ orientation: 'vertical', class: 'h-5' }), 'التوثيق')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  sheet: {
    description: 'Extends the Dialog component to display content that complements the main content of the screen.',
    composition: 'Sheet\n├── SheetTrigger\n├── SheetContent\n├── SheetHeader\n└── SheetFooter',
    examples: [
      basic('sheet', `Sheet.sheet({ model, title, content })`),
      { title: 'Side', preview: model => row(...(['top', 'right', 'bottom', 'left'] as const).map(side => sheet(model, side, side))), code: `Sheet.sheet({ side: 'left', … })` },
      { title: 'No Close Button', preview: model => sheet(model, 'no-close', 'right', false), code: `Sheet.sheet({ showCloseButton: false, … })` },
      { title: 'RTL', preview: model => rtl(sheet(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  sidebar: {
    description: 'A composable, themeable and customizable sidebar component.',
    composition: 'SidebarProvider\n├── Sidebar\n│   ├── SidebarHeader\n│   ├── SidebarContent\n│   └── SidebarFooter\n└── SidebarInset',
    examples: [
      basic('sidebar', `Sidebar.sidebarProvider({ children: [Sidebar.sidebar({ … })] })`),
      { title: 'Structure', preview: () => Sidebar.sidebarProvider({ class: 'h-80 min-h-0 overflow-hidden rounded-lg border', children: [Sidebar.sidebar({ collapsible: 'none', children: [Sidebar.sidebarHeader({ children: ['Header'] }), Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: ['Application'] }), Sidebar.sidebarGroupContent({ children: [Sidebar.sidebarMenu({ children: ['Dashboard', 'Inbox', 'Calendar'].map(label => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ children: [label] })] })) })] })] })] }), Sidebar.sidebarFooter({ children: ['Footer'] })] })] }), code: `SidebarProvider > Sidebar > Header + Content + Footer` },
      { title: 'SidebarMenu', preview: () => Sidebar.sidebarMenu({ children: ['Home', 'Inbox', 'Calendar'].map((label, index) => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: index === 0, children: [label] }), Sidebar.sidebarMenuBadge({ children: [String(index + 1)] })] })) }), code: `Sidebar.sidebarMenu({ children: items.map(…) })` },
      { title: 'SidebarMenuSkeleton', preview: () => stack(...Array.from({ length: 4 }, () => Sidebar.sidebarMenuSkeleton({ showIcon: true }))), code: `Sidebar.sidebarMenuSkeleton({ showIcon: true })` },
      { title: 'RTL', preview: () => rtl(Sidebar.sidebarMenu({ children: ['الرئيسية', 'البريد', 'التقويم'].map(label => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ children: [label] })] })) })), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  skeleton: {
    description: 'Use to show a placeholder while content is loading.',
    examples: [
      basic('skeleton', `Skeleton.skeleton({ class: 'h-4 w-52' })`),
      { title: 'Avatar', preview: () => row(Skeleton.skeleton({ class: 'size-12 rounded-full' }), skeletonLines()), code: `Skeleton.skeleton({ class: 'size-12 rounded-full' })` },
      { title: 'Card', preview: () => Card.card({ class: width, children: [Card.cardHeader({ children: [Skeleton.skeleton({ class: 'h-40 w-full' })] }), Card.cardContent({ children: [skeletonLines()] })] }), code: `Card.card({ children: [Skeleton.skeleton(…), …] })` },
      { title: 'Text', preview: skeletonLines, code: `Skeleton.skeleton({ class: 'h-4 w-full' })` },
      { title: 'Form', preview: () => stack(Skeleton.skeleton({ class: 'h-4 w-20' }), Skeleton.skeleton({ class: 'h-9 w-full' }), Skeleton.skeleton({ class: 'h-9 w-24' })), code: `Skeleton.skeleton({ class: 'h-9 w-full' })` },
      { title: 'Table', preview: () => stack(...Array.from({ length: 5 }, () => row(Skeleton.skeleton({ class: 'h-4 w-28' }), Skeleton.skeleton({ class: 'h-4 w-20' }), Skeleton.skeleton({ class: 'h-4 w-16' })))), code: `rows.map(() => Skeleton.skeleton(…))` },
      { title: 'RTL', preview: () => rtl(row(Skeleton.skeleton({ class: 'size-12 rounded-full' }), skeletonLines())), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  slider: {
    description: 'An input where the user selects a value from within a given range.',
    examples: [
      basic('slider', `Slider.slider({ model, ariaLabel: 'Volume' })`),
      { title: 'Range', preview: model => slider(model, 'range', { label: 'Price range' }), code: `Slider.slider({ model: rangeModel, ariaLabel: 'Price range' })` },
      { title: 'Multiple Thumbs', preview: model => slider(model, 'multiple', { label: 'Range' }), code: `Slider.slider({ model: multipleThumbModel, … })` },
      { title: 'Vertical', preview: model => h.div([h.Class('flex h-48 items-center')], [slider(model, 'vertical', { class: 'w-48 -rotate-90' })]), code: `Slider.slider({ class: '-rotate-90', … })` },
      { title: 'Controlled', preview: model => stack(slider(model, 'controlled'), h.p([h.Class('text-sm text-muted-foreground')], [`Value: ${Math.round(model.sliderValue)}`])), code: `const value = model.sliderValue` },
      { title: 'Disabled', preview: model => slider(model, 'disabled', { disabled: true }), code: `Slider.slider({ isDisabled: true, … })` },
      { title: 'RTL', preview: model => rtl(slider(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  sonner: {
    description: 'An opinionated toast notification component for Crease UI.',
    apiDescription: 'Sonner is a Crease UI extension. shadcn Base has no Sonner page; its current official Sonner variants target the Radix and React Aria registries.',
    examples: [
      basic('sonner', `Sonner.sonner({ model, toParentMessage })`),
      { title: 'Success', preview: model => Sonner.sonner({ model: model.sonner, toParentMessage: message => State.GotSonnerMessage({ message }), class: 'relative right-auto bottom-auto p-0' }), code: `Sonner.show(model, Sonner.success({ title: 'Event created' }))` },
      { title: 'Variants', preview: () => row(Badge.badge({ children: ['Success'] }), Badge.badge({ variant: 'destructive', children: ['Error'] }), Badge.badge({ variant: 'outline', children: ['Info'] }), Badge.badge({ variant: 'secondary', children: ['Warning'] })), code: `Sonner.success(…), Sonner.error(…), Sonner.info(…), Sonner.warning(…)` },
    ],
  },
  spinner: {
    description: 'An indicator that can be used to show a loading state.',
    examples: [
      basic('spinner', `Spinner.spinner()`),
      { title: 'Customization', preview: () => Spinner.spinner({ class: 'size-7 text-blue-600' }), code: `Spinner.spinner({ class: 'size-7 text-blue-600' })` },
      { title: 'Size', preview: () => row(Spinner.spinner({ class: 'size-3' }), Spinner.spinner({ class: 'size-5' }), Spinner.spinner({ class: 'size-8' })), code: `Spinner.spinner({ class: 'size-8' })` },
      { title: 'Button', preview: () => Button.button({ isDisabled: true, children: [Spinner.spinner(), 'Please wait'] }), code: `Button.button({ isDisabled: true, children: [Spinner.spinner(), 'Please wait'] })` },
      { title: 'Badge', preview: () => Badge.badge({ variant: 'secondary', children: [Spinner.spinner({ class: 'size-3' }), 'Syncing'] }), code: `Badge.badge({ children: [Spinner.spinner(), 'Syncing'] })` },
      { title: 'Input Group', preview: () => h.div([h.Class('relative w-full max-w-sm')], [Input.input({ id: 'spinner-search', value: '', onInput: () => action, placeholder: 'Searching…' }), h.div([h.Class('absolute right-3 top-2.5')], [Spinner.spinner({ class: 'size-4' })])]), code: `Input + positioned Spinner` },
      { title: 'Empty', preview: () => stack(Spinner.spinner({ class: 'mx-auto size-6' }), h.p([h.Class('text-center text-sm text-muted-foreground')], ['Loading your projects…'])), code: `Spinner.spinner({ class: 'mx-auto' })` },
      { title: 'RTL', preview: () => rtl(row(Spinner.spinner(), 'جارٍ التحميل…')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  switch: {
    description: 'A control that allows the user to toggle between checked and not checked.',
    examples: [
      basic('switch', `Switch.switchControl({ model, label: 'Airplane Mode' })`),
      { title: 'Description', preview: model => switchControl(model, 'description', { description: 'Enable or disable wireless communications.' }), code: `Switch.switchControl({ description: '…', … })` },
      { title: 'Choice Card', preview: model => Card.card({ class: width, children: [Card.cardContent({ class: 'p-4', children: [switchControl(model, 'card', { description: 'Receive emails about account activity.' })] })] }), code: `Card.card({ children: [Switch.switchControl(…)] })` },
      { title: 'Disabled', preview: model => switchControl(model, 'disabled', { disabled: true }), code: `Switch.switchControl({ isDisabled: true, … })` },
      { title: 'Invalid', preview: model => h.div([h.AriaInvalid(true)], [switchControl(model, 'invalid'), h.p([h.Class('mt-2 text-sm text-destructive')], ['This setting is required.'])]), code: `<div aria-invalid="true">…</div>` },
      { title: 'Size', preview: model => row(switchControl(model, 'small', { size: 'sm' }), switchControl(model, 'default')), code: `Switch.switchControl({ size: 'sm', … })` },
      { title: 'RTL', preview: model => rtl(switchControl(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  table: {
    description: 'A responsive table component.',
    composition: 'Table\n├── TableCaption\n├── TableHeader\n├── TableBody\n└── TableFooter',
    examples: [
      basic('table', `Table.table({ children: […] })`),
      { title: 'Footer', preview: () => invoiceTable(true), code: `Table.tableFooter({ children: […] })` },
      { title: 'Actions', preview: () => invoiceTable(false, true), code: `Table.tableCell({ children: [Button.button({ children: ['View'] })] })` },
      { title: 'Data Table', description: 'For sorting, filtering, and pagination, compose the dedicated Data Table component.', preview: () => h.a([h.Href('/docs/components/data-table'), h.Class('text-sm font-medium underline underline-offset-4')], ['Open the Data Table documentation']), code: `import * as DataTable from '@/ui/data-table'` },
      { title: 'RTL', preview: () => rtl(invoiceTable()), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  tabs: {
    description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
    composition: 'Tabs\n├── TabsList\n│   └── TabsTrigger\n└── TabsContent',
    examples: [
      basic('tabs', `Tabs.tabs({ model, tabs })`),
      { title: 'Line', preview: model => tabSet(model, 'line', { variant: 'line' }), code: `Tabs.tabs({ variant: 'line', … })` },
      { title: 'Vertical', preview: model => tabSet(model, 'vertical', { orientation: 'vertical' }), code: `Tabs.tabs({ orientation: 'vertical', … })` },
      { title: 'Disabled', preview: model => tabSet(model, 'disabled', { disabled: true }), code: `tabs: [{ …, isDisabled: true }]` },
      { title: 'Icons', preview: model => tabSet(model, 'icons', { icons: true }), code: `tabs: [{ label: iconAndLabel, … }]` },
      { title: 'RTL', preview: model => rtl(tabSet(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  textarea: {
    description: 'Displays a form textarea or a component that looks like a textarea.',
    examples: [
      basic('textarea', `Textarea.textarea({ id, value, onInput })`),
      { title: 'Field', preview: model => textarea(model, 'field', { label: 'Message' }), code: `Textarea.textarea({ label: 'Message', … })` },
      { title: 'Disabled', preview: model => textarea(model, 'disabled', { disabled: true }), code: `Textarea.textarea({ isDisabled: true, … })` },
      { title: 'Invalid', preview: model => stack(textarea(model, 'invalid', { invalid: true, label: 'Message' }), h.p([h.Class('text-sm text-destructive')], ['A message is required.'])), code: `Textarea.textarea({ isInvalid: true, … })` },
      { title: 'Button', preview: model => stack(textarea(model, 'button'), Button.button({ class: 'w-fit', onClick: action, children: ['Send message'] })), code: `Textarea.textarea(…) + Button.button(…)` },
      { title: 'RTL', preview: model => rtl(textarea(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  toast: {
    description: 'A succinct message that is displayed temporarily.',
    examples: [
      basic('toast', `Toast.toast({ model, toParentMessage })`),
      { title: 'Types', preview: model => Toast.toast({ model: model.toast, toParentMessage: message => State.GotToastMessage({ message }), class: 'relative right-auto bottom-auto p-0' }), code: `Sonner.show(model, Sonner.success({ title }))` },
      { title: 'Action', preview: () => Button.button({ onClick: action, children: ['Show toast with action'] }), code: `Sonner.success({ title: 'Event created', actionLabel: 'Undo' })` },
      { title: 'Promise', preview: () => Button.button({ onClick: action, children: ['Start upload'] }), code: `show loading → await command → show success or error` },
    ],
  },
  toggle: {
    description: 'A two-state button that can be either on or off.',
    examples: [
      basic('toggle', `Toggle.toggle({ isPressed, onToggle, children: ['Bold'] })`),
      { title: 'Outline', preview: () => toggle({ variant: 'outline' }), code: `Toggle.toggle({ variant: 'outline', … })` },
      { title: 'With Text', preview: () => toggle({ text: true }), code: `Toggle.toggle({ children: ['Bold'] })` },
      { title: 'Size', preview: () => row(toggle({ size: 'sm' }), toggle(), toggle({ size: 'lg' })), code: `Toggle.toggle({ size: 'sm' | 'default' | 'lg', … })` },
      { title: 'Disabled', preview: () => toggle({ disabled: true }), code: `Toggle.toggle({ isDisabled: true, … })` },
      { title: 'RTL', preview: () => rtl(toggle({ text: true })), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  'toggle-group': {
    description: 'A set of two-state buttons that can be toggled on or off.',
    composition: 'ToggleGroup\n└── ToggleGroupItem',
    examples: [
      basic('toggle-group', `ToggleGroup.toggleGroup({ value, onToggle, items })`),
      { title: 'Outline', preview: () => toggleGroup({ variant: 'outline' }), code: `ToggleGroup.toggleGroup({ variant: 'outline', … })` },
      { title: 'Size', preview: () => stack(toggleGroup({ size: 'sm' }), toggleGroup(), toggleGroup({ size: 'lg' })), code: `ToggleGroup.toggleGroup({ size: 'sm' | 'default' | 'lg', … })` },
      { title: 'Spacing', preview: () => toggleGroup({ variant: 'outline' }), code: `ToggleGroup.toggleGroup({ class: 'gap-2', … })` },
      { title: 'Vertical', preview: () => toggleGroup({ vertical: true, variant: 'outline' }), code: `ToggleGroup.toggleGroup({ class: 'flex-col', … })` },
      { title: 'Disabled', preview: () => toggleGroup({ disabled: true }), code: `items: [{ …, isDisabled: true }]` },
      { title: 'Custom', preview: () => toggleGroup({ custom: true, variant: 'outline' }), code: `items: fontWeightOptions` },
      { title: 'RTL', preview: () => rtl(toggleGroup({ variant: 'outline' })), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  tooltip: {
    description: 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    composition: 'Tooltip\n├── TooltipTrigger\n└── TooltipContent',
    examples: [
      basic('tooltip', `Tooltip.tooltip({ model, trigger: 'Hover', content: 'Add to library' })`),
      { title: 'Side', preview: model => row(...(['top', 'right', 'bottom', 'left'] as const).map(side => tooltip(model, side, { side }))), code: `Tooltip.tooltip({ side: 'right', … })` },
      { title: 'With Keyboard Shortcut', preview: model => tooltip(model, 'keyboard', { content: 'Open command menu  ⌘ K' }), code: `Tooltip.tooltip({ content: 'Open command menu  ⌘ K', … })` },
      { title: 'Disabled Button', preview: model => tooltip(model, 'disabled', { content: 'This action is unavailable', disabled: false }), code: `Tooltip.tooltip({ trigger: disabledButton, … })` },
      { title: 'RTL', preview: model => rtl(tooltip(model, 'rtl')), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
  typography: {
    description: 'Styles for headings, paragraphs, lists, etc.',
    examples: [
      basic('typography', `Typography.typographyH2({ children: ['The Joke Tax Chronicles'] })`),
      { title: 'h1', preview: () => Typography.typographyH1({ children: ['Taxing Laughter: The Joke Tax Chronicles'] }), code: `Typography.typographyH1({ children: ['…'] })` },
      { title: 'h2', preview: () => Typography.typographyH2({ children: ['The People of the Kingdom'] }), code: `Typography.typographyH2({ children: ['…'] })` },
      { title: 'h3', preview: () => Typography.typographyH3({ children: ['The Joke Tax'] }), code: `Typography.typographyH3({ children: ['…'] })` },
      { title: 'h4', preview: () => Typography.typographyH4({ children: ['People stopped telling jokes'] }), code: `Typography.typographyH4({ children: ['…'] })` },
      { title: 'p', preview: () => Typography.typographyP({ children: ['The king, seeing how much happier his subjects were, realized the error of his ways.'] }), code: `Typography.typographyP({ children: ['…'] })` },
      { title: 'blockquote', preview: () => Typography.typographyBlockquote({ children: ['After all, he thought, why should he have to work?'] }), code: `Typography.typographyBlockquote({ children: ['…'] })` },
      { title: 'table', preview: () => invoiceTable(), code: `Table.table({ children: […] })` },
      { title: 'list', preview: () => h.ul([h.Class('my-6 ml-6 list-disc [&>li]:mt-2')], [h.li([], ['1st level of puns: 5 gold coins']), h.li([], ['2nd level of jokes: 10 gold coins']), h.li([], ['3rd level of one-liners: 20 gold coins'])]), code: `<ul class="my-6 ml-6 list-disc">…</ul>` },
      { title: 'Inline code', preview: () => Typography.typographyInlineCode({ children: ['@foldkit/ui'] }), code: `Typography.typographyInlineCode({ children: ['@foldkit/ui'] })` },
      { title: 'Lead', preview: () => Typography.typographyLead({ children: ['A modal dialog that interrupts the user with important content.'] }), code: `Typography.typographyLead({ children: ['…'] })` },
      { title: 'Large', preview: () => Typography.typographyLarge({ children: ['Are you absolutely sure?'] }), code: `Typography.typographyLarge({ children: ['…'] })` },
      { title: 'Small', preview: () => Typography.typographySmall({ children: ['Email address'] }), code: `Typography.typographySmall({ children: ['…'] })` },
      { title: 'Muted', preview: () => Typography.typographyMuted({ children: ['Enter your email address.'] }), code: `Typography.typographyMuted({ children: ['…'] })` },
      { title: 'RTL', preview: () => rtl(Typography.typographyP({ children: ['في قديم الزمان، كان هناك ملك كسول جدًا.'] })), code: `<Direction direction="rtl">…</Direction>` },
    ],
  },
}

/** Keep documentation executable: an abbreviated snippet falls back to the
 * precise Foldkit view function that renders its live preview. */
export const definitions: PageDefinitions = Object.fromEntries(
  Object.entries(rawDefinitions).map(([slug, definition]) => [slug, {
    ...definition,
    examples: definition.examples.map(example => ({
      ...example,
      code: /\.\.\.|<\/?[A-Z]|<(?:div|fieldset|legend)\b/.test(example.code)
        ? `const preview = ${example.preview.toString()}`
        : example.code,
    })),
  }]),
)

import { type Html, html } from 'foldkit/html'

import { type PageDefinitions } from '@/docs/components/page-definition'
import { realPreview } from '@/docs/components/real-previews'
import * as State from '@/docs/components/catalog-state'
import * as Bubble from '@/ui/bubble'
import * as Button from '@/ui/button'
import * as ContextMenu from '@/ui/context-menu'
import * as DataTable from '@/ui/data-table'
import * as DatePicker from '@/ui/date-picker'
import * as Dialog from '@/ui/dialog'
import * as Direction from '@/ui/direction'
import * as Drawer from '@/ui/drawer'
import * as DropdownMenu from '@/ui/dropdown-menu'
import * as Empty from '@/ui/empty'
import * as Field from '@/ui/field'
import * as Form from '@/ui/form'
import * as HoverCard from '@/ui/hover-card'
import * as Input from '@/ui/input'
import * as InputGroup from '@/ui/input-group'
import * as InputOtp from '@/ui/input-otp'
import * as Item from '@/ui/item'
import * as Kbd from '@/ui/kbd'
import * as Label from '@/ui/label'
import * as Marker from '@/ui/marker'
import * as MessageUi from '@/ui/message'
import * as MessageScroller from '@/ui/message-scroller'
import * as Menubar from '@/ui/menubar'
import * as NativeSelect from '@/ui/native-select'
import * as NavigationMenu from '@/ui/navigation-menu'
import * as Pagination from '@/ui/pagination'

type Msg = State.Message
const h = html<Msg>()
const action = State.ClickedPreviewAction()
const basic = (slug: string) => (model: State.Model): Html => realPreview(slug, model)
const text = (target: State.TextTarget) => (value: string): Msg => State.ChangedText({ target, value })

const menu = (
  model: State.Model,
  kind: 'context' | 'dropdown',
  items: ReadonlyArray<string>,
  itemToConfig: (item: string) => DropdownMenu.DropdownMenuItemConfig,
  options: Readonly<{ side?: DropdownMenu.DropdownMenuSide; align?: DropdownMenu.DropdownMenuAlign }> = {},
): Html => kind === 'context'
  ? ContextMenu.contextMenu({
      model: model.contextMenu,
      toParentMessage: message => State.GotContextMenuMessage({ message }),
      trigger: 'Right click here',
      class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm',
      items,
      itemToConfig,
    })
  : DropdownMenu.dropdownMenu({
      model: model.dropdownMenu,
      toParentMessage: message => State.GotDropdownMenuMessage({ message }),
      trigger: 'Open menu',
      triggerClass: 'inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-xs',
      items,
      itemToConfig,
      ...options,
    })

const menuExamples = (kind: 'context' | 'dropdown') => [
  {
    title: 'Basic',
    preview: basic(kind === 'context' ? 'context-menu' : 'dropdown-menu'),
    code: `${kind === 'context' ? 'ContextMenu.contextMenu' : 'DropdownMenu.dropdownMenu'}({ model, items, itemToConfig })`,
  },
  {
    title: 'Submenu',
    preview: (model: State.Model) => menu(model, kind, ['back', 'forward', 'more'], item => item === 'more'
      ? { label: 'More Tools', submenu: { items: ['save', 'create'], itemToConfig: child => ({ label: child === 'save' ? 'Save Page As…' : 'Create Shortcut…' }) } }
      : { label: item === 'back' ? 'Back' : 'Forward', isDisabled: item === 'forward' }),
    code: `itemToConfig: item => ({ label: item, submenu: { items, itemToConfig } })`,
  },
  {
    title: 'Shortcuts',
    preview: (model: State.Model) => menu(model, kind, ['back', 'reload', 'save'], item => ({ label: item === 'back' ? 'Back' : item === 'reload' ? 'Reload' : 'Save Page As…', shortcut: item === 'back' ? '⌘[' : item === 'reload' ? '⌘R' : '⇧⌘S' })),
    code: `itemToConfig: item => ({ label: item.label, shortcut: item.shortcut })`,
  },
  {
    title: 'Groups',
    preview: (model: State.Model) => menu(model, kind, ['profile', 'billing', 'logout'], item => ({ label: item[0]?.toUpperCase() + item.slice(1), group: item === 'logout' ? 'Account' : 'Settings' })),
    code: `itemToConfig: item => ({ label: item.label, group: item.group })`,
  },
  {
    title: 'Icons',
    preview: (model: State.Model) => menu(model, kind, ['edit', 'copy', 'delete'], item => ({ label: item[0]?.toUpperCase() + item.slice(1), icon: h.span([h.AriaHidden(true)], [item === 'edit' ? '✎' : item === 'copy' ? '⧉' : '⌫']) })),
    code: `itemToConfig: item => ({ label: item.label, icon: Icon.file() })`,
  },
  {
    title: 'Checkboxes',
    preview: (model: State.Model) => menu(model, kind, ['status', 'activity'], item => ({ label: item === 'status' ? 'Show Status Bar' : 'Show Activity Bar', kind: 'checkbox', isChecked: item === 'status' })),
    code: `itemToConfig: item => ({ kind: 'checkbox', isChecked: item.checked, label: item.label })`,
  },
  {
    title: 'Radio',
    preview: (model: State.Model) => menu(model, kind, ['pedro', 'colm', 'benoit'], item => ({ label: `${item}@example.com`, kind: 'radio', isChecked: item === 'pedro' })),
    code: `itemToConfig: item => ({ kind: 'radio', isChecked: item.value === selected })`,
  },
  {
    title: 'Destructive',
    preview: (model: State.Model) => menu(model, kind, ['edit', 'delete'], item => ({ label: item === 'edit' ? 'Edit' : 'Delete', variant: item === 'delete' ? 'destructive' : 'default' })),
    code: `itemToConfig: item => ({ label: item.label, variant: item.destructive ? 'destructive' : 'default' })`,
  },
]

type Payment = Readonly<{ id: string; status: string; email: string; amount: number }>
const payments: ReadonlyArray<Payment> = [
  { id: '728ed52f', status: 'Success', email: 'm@example.com', amount: 100 },
  { id: '489e1d42', status: 'Processing', email: 'a@example.com', amount: 125 },
  { id: 'f7a4b3c2', status: 'Pending', email: 's@example.com', amount: 250 },
  { id: 'c91e7a20', status: 'Success', email: 'j@example.com', amount: 75 },
  { id: 'aa312bc1', status: 'Failed', email: 't@example.com', amount: 48 },
  { id: 'bb923da2', status: 'Success', email: 'r@example.com', amount: 310 },
]
const paymentTable = (model: State.Model, formatted = false): Html => DataTable.dataTable({
  model: model.dataTable,
  toParentMessage: message => State.GotDataTableMessage({ message }),
  rows: payments,
  columns: [
    { key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status },
    { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email },
    { key: 'amount', header: 'Amount', class: 'text-right', cell: row => formatted ? `$${row.amount.toFixed(2)}` : String(row.amount), sortValue: row => row.amount },
  ],
  rowKey: row => row.id,
  filterText: row => row.email,
  filterPlaceholder: 'Filter emails…',
  ariaLabel: 'Payments',
})

const datePicker = (model: State.Model, options: Readonly<{ placeholder?: string; instance?: string }> = {}): Html => DatePicker.datePicker({
  model: {
    ...model.datePicker,
    id: `${model.datePicker.id}-${options.instance ?? 'default'}`,
    calendar: {
      ...model.datePicker.calendar,
      id: `${model.datePicker.calendar.id}-${options.instance ?? 'default'}`,
    },
  },
  maybeSelectedDate: model.selectedDate,
  toParentMessage: message => State.GotDatePickerMessage({ message }),
  ...options,
})

const dialog = (model: State.Model, variant: 'close' | 'no-close' | 'sticky' | 'scroll' = 'close'): Html => h.div([h.Class('flex flex-col items-center gap-4')], [
  Button.button({ children: ['Open Dialog'], onClick: State.OpenedOverlay({ target: 'dialog' }) }),
  Dialog.dialog({
    model: model.dialog,
    toParentMessage: message => State.GotDialogMessage({ message }),
    title: variant === 'scroll' ? 'Terms of Service' : 'Edit profile',
    description: variant === 'scroll' ? 'Please read the following terms carefully.' : 'Make changes to your profile here.',
    ...(variant === 'scroll' ? { class: 'max-h-[70vh] overflow-y-auto' } : {}),
    content: () => variant === 'scroll'
      ? [h.div([h.Class('space-y-4 text-sm leading-6')], Array.from({ length: 7 }, (_, index) => h.p([], [`Section ${index + 1}. These terms explain how the service may be used and the responsibilities of each party.`])))]
      : [Input.input({ id: `dialog-name-${variant}`, label: 'Name', value: model.dialogName, onInput: text('dialogName') })],
    ...(variant === 'no-close' ? {} : { footer: (slots: Dialog.DialogSlots) => [
      h.button([...slots.closeButton, h.Type('button'), h.Class('inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-xs')], ['Cancel']),
      Button.button({ children: ['Save changes'], onClick: action }),
    ] }),
  }),
])

const drawer = (model: State.Model, direction: Drawer.DrawerDirection = 'bottom'): Html => h.div([h.Class('flex flex-col items-center gap-4')], [
  Button.button({ variant: 'outline', children: [`Open ${direction} drawer`], onClick: State.OpenedOverlay({ target: 'drawer' }) }),
  Drawer.drawer({
    model: {
      ...model.drawer,
      dialog: {
        ...model.drawer.dialog,
        id: `${model.drawer.dialog.id}-${direction}`,
        animation: {
          ...model.drawer.dialog.animation,
          id: `${model.drawer.dialog.animation.id}-${direction}`,
        },
      },
    },
    toParentMessage: message => State.GotDrawerMessage({ message }),
    direction,
    title: 'Move Goal',
    description: 'Set your daily activity goal.',
    content: () => [h.div([h.Class('px-4 pb-6 text-center text-5xl font-bold tabular-nums')], ['350'])],
    footer: slots => [Button.button({ children: ['Submit'], onClick: action }), h.button([...slots.closeButton, h.Type('button'), h.Class('inline-flex h-8 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-xs')], ['Cancel'])],
  }),
])

const emptyState = (variant: 'default' | 'outline' | 'background' | 'avatar' | 'group' | 'input'): Html => Empty.empty({
  class: `w-full max-w-lg ${variant === 'outline' ? 'border' : variant === 'background' ? 'bg-muted/50' : ''}`,
  children: [
    Empty.emptyHeader({ children: [
      Empty.emptyMedia({ variant: variant === 'avatar' || variant === 'group' ? 'default' : 'icon', children: [variant === 'avatar' ? 'CN' : variant === 'group' ? 'CN · LR' : '＋'] }),
      Empty.emptyTitle({ children: [variant === 'input' ? 'Invite your team' : 'No projects yet'] }),
      Empty.emptyDescription({ children: [variant === 'input' ? 'Send an invitation to collaborate.' : 'Get started by creating your first project.'] }),
    ] }),
    Empty.emptyContent({ children: variant === 'input'
      ? [InputGroup.inputGroup({ children: [InputGroup.inputGroupInput({ id: 'empty-email', value: '', onInput: text('inputGroup'), placeholder: 'name@example.com' }), InputGroup.inputGroupAddon({ align: 'inline-end', children: [InputGroup.inputGroupButton({ children: ['Send'], onClick: action })] })] })]
      : [Button.button({ children: ['Create project'], onClick: action })],
    }),
  ],
})

const fieldInput = (model: State.Model, variant: 'input' | 'textarea' | 'fieldset' | 'error'): Html => {
  if (variant === 'fieldset') return Field.fieldSet({ children: [Field.fieldLegend({ children: ['Address'] }), Field.fieldGroup({ children: [Field.field({ children: [Field.fieldLabel({ for: 'street' , children: ['Street'] }), Input.input({ id: 'street', value: model.fieldName, onInput: text('fieldName') })] }), Field.field({ children: [Field.fieldLabel({ for: 'city', children: ['City'] }), Input.input({ id: 'city', value: '', onInput: text('input') })] })] })] })
  return Field.field({ isInvalid: variant === 'error', children: [
    Field.fieldLabel({ for: `field-${variant}`, children: [variant === 'textarea' ? 'Bio' : 'Username'] }),
    variant === 'textarea'
      ? h.textarea([h.Id('field-textarea'), h.Value(model.textarea), h.OnInput(text('textarea')), h.Class('min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm')], [])
      : Input.input({ id: `field-${variant}`, value: model.fieldName, onInput: text('fieldName'), isInvalid: variant === 'error' }),
    Field.fieldDescription({ children: ['This is your public display name.'] }),
    ...(variant === 'error' ? [Field.fieldError({ errors: [{ message: 'Username must be at least 3 characters.' }] })] : []),
  ] })
}

const formPreview = (model: State.Model, invalid = false): Html => Form.form({
  class: 'w-full max-w-sm space-y-4',
  ariaLabel: 'Profile form',
  onSubmit: action,
  children: [
    Form.formItem({ id: 'docs-form-email', isInvalid: invalid, children: [
      Form.formLabel({ for: 'docs-form-email', children: ['Email'] }),
      Input.input({ id: 'docs-form-email', value: model.formEmail, onInput: text('formEmail'), placeholder: 'm@example.com', isInvalid: invalid }),
      Form.formDescription({ children: ['We will never share your email.'] }),
      ...(invalid ? [Form.formMessage({ errors: [{ message: 'Enter a valid email address.' }] })] : []),
    ] }),
    Button.button({ type: 'submit', children: ['Submit'] }),
  ],
})

const hoverCard = (model: State.Model, side: HoverCard.HoverCardSide = 'bottom'): Html => HoverCard.hoverCard({
  model: model.hoverCard,
  toParentMessage: message => State.GotHoverCardMessage({ message }),
  trigger: '@nextjs',
  triggerClass: 'font-medium underline underline-offset-4',
  side,
  content: h.div([h.Class('space-y-2')], [h.h4([h.Class('font-semibold')], ['@nextjs']), h.p([h.Class('text-sm leading-5')], ['The React Framework – created and maintained by @vercel.']), h.p([h.Class('text-xs text-muted-foreground')], ['Joined December 2021'])]),
})

const inputPreview = (model: State.Model, variant: 'basic' | 'disabled' | 'invalid' | 'file' | 'required'): Html => Input.input({
  id: `input-${variant}`,
  value: variant === 'file' ? '' : model.input,
  onInput: text('input'),
  type: variant === 'file' ? 'file' : 'text',
  ...(variant === 'file' ? {} : { placeholder: 'Email' }),
  ...(variant === 'required' ? { label: 'Email *' } : {}),
  isDisabled: variant === 'disabled',
  isInvalid: variant === 'invalid',
  class: 'max-w-sm',
})

const inputGroup = (model: State.Model, align: InputGroup.InputGroupAddonVariants['align'] = 'inline-start', content: 'text' | 'button' | 'kbd' = 'text'): Html => InputGroup.inputGroup({ class: 'max-w-sm', children: [
  InputGroup.inputGroupAddon({ align, children: content === 'button'
    ? [InputGroup.inputGroupButton({ children: ['Search'], onClick: action })]
    : content === 'kbd' ? [Kbd.kbd({ children: ['⌘K'] })] : [InputGroup.inputGroupText({ children: ['https://'] })] }),
  InputGroup.inputGroupInput({ id: `input-group-${align}-${content}`, value: model.inputGroup, onInput: text('inputGroup'), placeholder: 'example.com' }),
] })

const otp = (model: State.Model, options: Readonly<{ disabled?: boolean; invalid?: boolean; length?: number }> = {}): Html => InputOtp.inputOtp({
  id: `otp-${options.length ?? 6}`,
  value: model.inputOtp.slice(0, options.length ?? 6),
  onInput: text('inputOtp'),
  ...(options.length === undefined ? {} : { length: options.length }),
  ...(options.disabled === undefined ? {} : { isDisabled: options.disabled }),
  ...(options.invalid === undefined ? {} : { isInvalid: options.invalid }),
  separator: index => index === Math.ceil((options.length ?? 6) / 2) - 1 ? InputOtp.inputOtpSeparator() : h.span([], []),
})

const itemPreview = (variant: 'default' | 'outline' | 'muted', media: 'icon' | 'avatar' | 'image' = 'icon'): Html => Item.item({ variant, class: 'w-full max-w-lg', children: [
  Item.itemMedia({ variant: media === 'icon' ? 'icon' : 'image', children: [media === 'icon' ? '📄' : media === 'avatar' ? 'CN' : h.img([h.Src('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=120&q=80'), h.Alt('Team collaborating'), h.Class('size-full object-cover')])] }),
  Item.itemContent({ children: [Item.itemTitle({ children: ['Document.pdf'] }), Item.itemDescription({ children: ['A project specification document.'] })] }),
  Item.itemActions({ children: [Button.button({ variant: 'outline', size: 'sm', children: ['Open'], onClick: action })] }),
] })

const messageExample = (align: 'start' | 'end', metadata = true): Html => MessageUi.message({ align, children: [
  MessageUi.messageAvatar({ children: [align === 'start' ? 'AI' : 'YO'] }),
  MessageUi.messageContent({ children: [
    ...(metadata ? [MessageUi.messageHeader({ children: [align === 'start' ? 'Assistant' : 'You'] })] : []),
    Bubble.bubble({ align, children: [Bubble.bubbleContent({ children: [align === 'start' ? 'How can I help with your project?' : 'Show me the latest changes.'] })] }),
    ...(metadata ? [MessageUi.messageFooter({ children: ['Just now'] })] : []),
  ] }),
] })

const scroller = (model: State.Model, count = 12, controls = true): Html => MessageScroller.messageScroller({ class: 'h-72 w-full max-w-lg rounded-md border', children: [
  MessageScroller.messageScrollerViewport({ model: model.messageScroller, toParentMessage: message => State.GotMessageScrollerMessage({ message }), children: [
    MessageScroller.messageScrollerContent({ class: 'p-4', children: Array.from({ length: count }, (_, index) => MessageScroller.messageScrollerItem({ scrollAnchor: index === count - 1, children: [messageExample(index % 2 === 0 ? 'start' : 'end', false)] })) }),
  ] }),
  ...(controls ? [MessageScroller.messageScrollerButton({ model: model.messageScroller, toParentMessage: message => State.GotMessageScrollerMessage({ message }) })] : []),
] })

const menubar = (model: State.Model, mode: 'basic' | 'checkbox' | 'radio' | 'submenu' | 'icons'): Html => Menubar.menubar({ menus: [
  { id: 'menu-file', label: 'File', model: model.menubarFile, toParentMessage: message => State.GotMenubarMessage({ target: 'file', message }), items: ['new', 'open', 'share'], itemToConfig: item => item === 'share' && mode === 'submenu' ? { label: 'Share', submenu: { items: ['email', 'messages'], itemToConfig: child => ({ label: child[0]?.toUpperCase() + child.slice(1) }) } } : ({ label: item[0]?.toUpperCase() + item.slice(1), ...(mode === 'icons' ? { icon: h.span([h.AriaHidden(true)], ['▧']) } : {}) }) },
  { id: 'menu-edit', label: 'Edit', model: model.menubarEdit, toParentMessage: message => State.GotMenubarMessage({ target: 'edit', message }), items: ['autosave', 'spellcheck'], itemToConfig: item => ({ label: item === 'autosave' ? 'Auto Save' : 'Spell Check', kind: mode === 'radio' ? 'radio' : mode === 'checkbox' ? 'checkbox' : 'item', isChecked: item === 'autosave' }) },
  { id: 'menu-view', label: 'View', model: model.menubarView, toParentMessage: message => State.GotMenubarMessage({ target: 'view', message }), items: ['reload'], itemToConfig: () => ({ label: 'Reload', shortcut: '⌘R' }) },
] })

const nativeSelect = (model: State.Model, variant: 'basic' | 'groups' | 'disabled' | 'invalid'): Html => NativeSelect.nativeSelect({
  id: `native-${variant}`,
  value: model.input,
  onChange: text('input'),
  ...(variant === 'basic' ? { label: 'Fruit' } : {}),
  options: variant === 'groups' ? [] : [{ value: '', label: 'Select a fruit' }, { value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }],
  ...(variant === 'groups' ? { groups: [{ label: 'North America', options: [{ value: 'est', label: 'Eastern Standard Time' }, { value: 'pst', label: 'Pacific Standard Time' }] }, { label: 'Europe', options: [{ value: 'gmt', label: 'Greenwich Mean Time' }] }] } : {}),
  isDisabled: variant === 'disabled',
  isInvalid: variant === 'invalid',
})

const navigation = (disclosure: boolean, rtl = false) => (model: State.Model): Html => Direction.direction({ direction: rtl ? 'rtl' : 'ltr', children: [NavigationMenu.navigationMenu({ children: [NavigationMenu.navigationMenuList({ children: [
  NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '#', isActive: true, children: ['Home'] })] }),
  ...(disclosure ? [NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuDisclosure({ model: model.popover, toParentMessage: message => State.GotPopoverMessage({ message }), label: 'Components', content: h.div([h.Class('grid w-72 gap-2 p-2')], [h.a([h.Href('#')], ['Alert Dialog']), h.a([h.Href('#')], ['Hover Card']), h.a([h.Href('#')], ['Progress'])]) })] })] : []),
  NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '#', children: ['Docs'] })] }),
] })] })] })

const pagination = (iconsOnly = false, rtl = false): Html => Direction.direction({ direction: rtl ? 'rtl' : 'ltr', children: [Pagination.pagination({ children: [Pagination.paginationContent({ children: [
  Pagination.paginationItem({ children: [Pagination.paginationPrevious({ href: '#', ...(iconsOnly ? { class: '[&_span]:hidden' } : {}) })] }),
  ...[1, 2, 3].map(page => Pagination.paginationItem({ children: [Pagination.paginationLink({ href: '#', isActive: page === 1, children: [String(page)] })] })),
  Pagination.paginationItem({ children: [Pagination.paginationEllipsis({})] }),
  Pagination.paginationItem({ children: [Pagination.paginationNext({ href: '#', ...(iconsOnly ? { class: '[&_span]:hidden' } : {}) })] }),
] })] })] })

const rawDefinitions: PageDefinitions = {
  'context-menu': {
    description: 'Displays a menu of actions triggered by a right click.',
    composition: 'Context Menu composes a trigger, menu items, groups, submenus, checkbox and radio items over one Foldkit-owned menu model.',
    examples: [
      ...menuExamples('context'),
      { title: 'Sides', preview: model => menu(model, 'context', ['back', 'reload'], item => ({ label: item === 'back' ? 'Back' : 'Reload' })), code: `ContextMenu.contextMenu({ model, trigger, items, itemToConfig })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [menu(model, 'context', ['back', 'reload'], item => ({ label: item === 'back' ? 'رجوع' : 'إعادة تحميل' }))] }), code: `Direction.direction({ direction: 'rtl', children: [ContextMenu.contextMenu({ ... })] })` },
    ],
  },
  'data-table': {
    description: 'Powerful tables and data grids built with composable Crease UI primitives.',
    composition: 'The example combines a typed column definition with filtering, sorting, formatting, and pagination in a single Foldkit model.',
    examples: [
      { title: 'Basic Table', preview: basic('data-table'), code: `DataTable.dataTable({ model, rows: payments, columns, rowKey: row => row.id })`, previewClass: 'justify-stretch' },
      { title: 'Cell Formatting', preview: model => paymentTable(model, true), code: `cell: row => \`$\${row.amount.toFixed(2)}\`` , previewClass: 'justify-stretch' },
      { title: 'Row Actions', preview: model => h.div([h.Class('w-full space-y-3')], [paymentTable(model, true), h.p([h.Class('text-sm text-muted-foreground')], ['Use the action column to open a payment menu.'])]), code: `columns: [...columns, { key: 'actions', cell: row => paymentActions(row) }]`, previewClass: 'justify-stretch' },
      { title: 'Pagination', preview: model => paymentTable(model, true), code: `const model = DataTable.init(5)\nDataTable.update(model, DataTable.ChangedPage({ page: 1 }))`, previewClass: 'justify-stretch' },
      { title: 'Sorting', preview: model => paymentTable(model, true), code: `{ key: 'email', header: 'Email', sortValue: row => row.email }`, previewClass: 'justify-stretch' },
      { title: 'Filtering', preview: model => paymentTable(model, true), code: `filterText: row => row.email\nfilterPlaceholder: 'Filter emails…'`, previewClass: 'justify-stretch' },
      { title: 'Visibility', description: 'Column visibility can be modeled in the parent and projected into the columns array.', preview: model => paymentTable(model, true), code: `columns: columns.filter(column => visibleColumns.has(column.key))`, previewClass: 'justify-stretch' },
      { title: 'Row Selection', description: 'Keep selected row keys in the parent model and render a selection column.', preview: model => paymentTable(model, true), code: `selectedRows: ReadonlySet<string>\n// Toggle selection with an explicit Message.`, previewClass: 'justify-stretch' },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [paymentTable(model, true)] }), code: `Direction.direction({ direction: 'rtl', children: [DataTable.dataTable({ ... })] })`, previewClass: 'justify-stretch' },
    ],
  },
  'date-picker': {
    description: 'A date picker component with range and presets.',
    composition: 'Date Picker composes a Calendar with a popover trigger while keeping the selected date, visible month, and overlay state in a Foldkit submodel.',
    examples: [
      { title: 'Basic', preview: basic('date-picker'), code: `DatePicker.datePicker({ model, toParentMessage })` },
      { title: 'Range Picker', description: 'Crease UI currently exposes a single-date model; place two pickers together for explicit start and end dates.', preview: model => h.div([h.Class('flex flex-wrap gap-3')], [datePicker(model, { placeholder: 'Start date', instance: 'start' }), datePicker(model, { placeholder: 'End date', instance: 'end' })]), code: `h.div([], [datePicker({ placeholder: 'Start date' }), datePicker({ placeholder: 'End date' })])` },
      { title: 'Date of Birth', preview: model => datePicker(model, { placeholder: 'Pick a date of birth' }), code: `DatePicker.datePicker({ model, placeholder: 'Pick a date of birth', ... })` },
      { title: 'Input', preview: model => h.div([h.Class('grid w-full max-w-sm gap-2')], [Label.label({ for: 'date-label', children: ['Date'] }), datePicker(model, { placeholder: 'Select a date' })]), code: `Label.label({ for: 'date', children: ['Date'] })\nDatePicker.datePicker({ ... })` },
      { title: 'Time Picker', description: 'Compose the calendar date with a native time input.', preview: model => h.div([h.Class('flex flex-wrap items-center gap-2')], [datePicker(model), h.input([h.Type('time'), h.Class('h-8 rounded-md border border-input bg-transparent px-2.5 text-sm')])]), code: `h.div([], [DatePicker.datePicker({ ... }), h.input([h.Type('time')])])` },
      { title: 'Natural Language Picker', preview: model => h.div([h.Class('grid w-full max-w-sm gap-2')], [Input.input({ id: 'natural-date', value: model.input, onInput: text('input'), placeholder: 'Tomorrow at noon' }), datePicker(model)]), code: `Input.input({ placeholder: 'Tomorrow at noon', ... })\nDatePicker.datePicker({ ... })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [datePicker(model, { placeholder: 'اختر تاريخًا' })] }), code: `Direction.direction({ direction: 'rtl', children: [DatePicker.datePicker({ ... })] })` },
    ],
  },
  dialog: {
    description: 'A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.',
    composition: 'Dialog owns focus, keyboard dismissal, backdrop behavior, and animation in a Foldkit submodel. Content and footer slots remain application-defined.',
    examples: [
      { title: 'Custom Close Button', preview: model => dialog(model, 'close'), code: `Dialog.dialog({ model, content, footer: slots => [h.button([...slots.closeButton], ['Cancel'])] })` },
      { title: 'No Close Button', preview: model => dialog(model, 'no-close'), code: `Dialog.dialog({ model, content, footer: undefined })` },
      { title: 'Sticky Footer', preview: model => dialog(model, 'sticky'), code: `Dialog.dialog({ model, class: 'max-h-[70vh]', footer })` },
      { title: 'Scrollable Content', preview: model => dialog(model, 'scroll'), code: `Dialog.dialog({ model, class: 'max-h-[70vh] overflow-y-auto', content })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [dialog(model)] }), code: `Direction.direction({ direction: 'rtl', children: [Dialog.dialog({ ... })] })` },
    ],
  },
  direction: {
    description: 'A provider component that sets the text direction for your application.',
    composition: 'Wrap any subtree with Direction.direction and select either ltr or rtl. Native directionality then reaches every descendant.',
    examples: [
      { title: 'Usage', preview: basic('direction'), code: `Direction.direction({ direction: 'rtl', children: [content] })` },
      { title: 'useDirection', description: 'In Foldkit, direction is explicit view input rather than an ambient hook.', preview: () => Direction.direction({ direction: 'rtl', children: [h.div([h.Class('max-w-sm space-y-2 rounded-md border p-4 text-right')], [h.h3([h.Class('font-semibold')], ['واجهة من اليمين إلى اليسار']), h.p([h.Class('text-sm text-muted-foreground')], ['يتدفق هذا المحتوى تلقائيًا من اليمين إلى اليسار.'])])] }), code: `const view = (direction: Direction.Direction) =>\n  Direction.direction({ direction, children })` },
    ],
  },
  'dropdown-menu': {
    description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
    composition: 'Dropdown Menu combines a trigger, positioned content, items, submenus, checkbox items, and radio items over a typed Foldkit model.',
    examples: [
      ...menuExamples('dropdown'),
      { title: 'Checkboxes Icons', preview: model => menu(model, 'dropdown', ['status', 'activity'], item => ({ label: item === 'status' ? 'Show Status Bar' : 'Show Activity Bar', kind: 'checkbox', isChecked: item === 'status', icon: h.span([h.AriaHidden(true)], ['✓']) })), code: `itemToConfig: item => ({ kind: 'checkbox', icon: Icon.check(), ... })` },
      { title: 'Radio Group', preview: model => menu(model, 'dropdown', ['pedro', 'colm'], item => ({ label: `${item}@example.com`, kind: 'radio', isChecked: item === 'pedro' })), code: `itemToConfig: item => ({ kind: 'radio', isChecked: item === selected })` },
      { title: 'Radio Icons', preview: model => menu(model, 'dropdown', ['light', 'dark'], item => ({ label: item === 'light' ? 'Light' : 'Dark', kind: 'radio', isChecked: item === 'light', icon: h.span([h.AriaHidden(true)], [item === 'light' ? '☀' : '☾']) })), code: `itemToConfig: item => ({ kind: 'radio', icon, isChecked })` },
      { title: 'Avatar', preview: model => menu(model, 'dropdown', ['profile', 'billing', 'logout'], item => ({ label: item[0]?.toUpperCase() + item.slice(1), group: item === 'logout' ? 'Account' : 'Pedro Duarte' })), code: `trigger: avatar\nitemToConfig: item => ({ label: item.label, group: item.group })` },
      { title: 'Complex', preview: model => menu(model, 'dropdown', ['account', 'team', 'invite', 'logout'], item => ({ label: item[0]?.toUpperCase() + item.slice(1), ...(item === 'invite' ? { shortcut: '⌘I' } : {}), group: item === 'logout' ? 'Account' : 'Workspace', variant: item === 'logout' ? 'destructive' : 'default' })), code: `DropdownMenu.dropdownMenu({ model, items, itemToConfig })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [menu(model, 'dropdown', ['profile', 'settings'], item => ({ label: item === 'profile' ? 'الملف الشخصي' : 'الإعدادات' }))] }), code: `Direction.direction({ direction: 'rtl', children: [DropdownMenu.dropdownMenu({ ... })] })` },
    ],
  },
  drawer: {
    description: 'A drawer component for Foldkit applications.',
    composition: 'Drawer builds on the Foldkit dialog primitive and adds edge positioning plus drag-to-dismiss state.',
    examples: [
      { title: 'Custom Sizes', preview: model => drawer(model), code: `Drawer.drawer({ class: 'max-h-[60vh]', ... })` },
      { title: 'Position', preview: model => h.div([h.Class('flex flex-wrap gap-2')], [drawer(model, 'left'), drawer(model, 'right')]), code: `Drawer.drawer({ direction: 'left', ... })` },
      { title: 'Swipe Handle', preview: model => drawer(model), code: `Drawer.drawer({ model, toParentMessage, ... }) // Drag the built-in handle to dismiss.` },
      { title: 'Nested', description: 'Nest another Drawer with its own model when the workflow requires a second level.', preview: model => drawer(model), code: `Drawer.drawer({ model: parent, content: () => [Drawer.drawer({ model: child, ... })] })` },
      { title: 'Non Modal', description: 'Use an adjacent persistent panel when background interaction must remain available.', preview: model => drawer(model, 'right'), code: `// Keep the panel in normal document flow for a non-modal treatment.` },
      { title: 'Snap Points', description: 'The Crease drawer exposes direct drag offset state and closes after the dismissal threshold.', preview: model => drawer(model), code: `Drawer.update(model, Drawer.Dragged({ offset }))` },
      { title: 'Responsive', preview: model => drawer(model), code: `// Choose Dialog or Drawer from your responsive model, then delegate its Message.` },
    ],
  },
  empty: {
    description: 'Use the Empty component to display an empty state.',
    composition: 'Empty is composed from header, media, title, description, and content slots so the state can match the missing resource and recovery action.',
    examples: [
      { title: 'Outline', preview: () => emptyState('outline'), code: `Empty.empty({ class: 'border', children: [...] })` },
      { title: 'Background', preview: () => emptyState('background'), code: `Empty.empty({ class: 'bg-muted/50', children: [...] })` },
      { title: 'Avatar', preview: () => emptyState('avatar'), code: `Empty.emptyMedia({ children: [avatar] })` },
      { title: 'Avatar Group', preview: () => emptyState('group'), code: `Empty.emptyMedia({ children: [avatarGroup] })` },
      { title: 'InputGroup', preview: () => emptyState('input'), code: `Empty.emptyContent({ children: [InputGroup.inputGroup({ ... })] })` },
      { title: 'RTL', preview: () => Direction.direction({ direction: 'rtl', children: [emptyState('outline')] }), code: `Direction.direction({ direction: 'rtl', children: [Empty.empty({ ... })] })` },
    ],
  },
  field: {
    description: 'Combine labels, controls, and help text to compose accessible form fields and grouped inputs.',
    composition: 'Field, FieldGroup, and FieldSet provide layout and accessible descriptions while controls retain their own state and Messages.',
    examples: [
      { title: 'Anatomy', preview: basic('field'), code: `Field.field({ children: [Field.fieldLabel(...), Input.input(...), Field.fieldDescription(...)] })` },
      { title: 'Form', preview: model => formPreview(model), code: `Form.form({ children: [Field.field({ ... })] })` },
      { title: 'Input', preview: model => fieldInput(model, 'input'), code: `Field.field({ children: [Field.fieldLabel(...), Input.input(...)] })` },
      { title: 'Textarea', preview: model => fieldInput(model, 'textarea'), code: `Field.field({ children: [Field.fieldLabel(...), Textarea.textarea(...)] })` },
      { title: 'Select', preview: model => Field.field({ children: [Field.fieldLabel({ for: 'field-select', children: ['Country'] }), nativeSelect(model, 'basic')] }), code: `Field.field({ children: [Field.fieldLabel(...), NativeSelect.nativeSelect(...)] })` },
      { title: 'Slider', preview: model => h.div([h.Class('w-full max-w-sm space-y-2')], [Field.fieldLabel({ for: 'field-range', children: ['Volume'] }), h.input([h.Id('field-range'), h.Type('range'), h.Value('50'), h.Class('w-full')])]), code: `Field.field({ children: [label, Slider.slider({ ... })] })` },
      { title: 'Fieldset', preview: model => fieldInput(model, 'fieldset'), code: `Field.fieldSet({ children: [Field.fieldLegend(...), Field.fieldGroup(...)] })` },
      { title: 'Checkbox', preview: model => h.div([h.Class('flex items-center gap-2')], [h.input([h.Id('field-check'), h.Type('checkbox')]), Field.fieldLabel({ for: 'field-check', children: ['Accept terms'] })]), code: `Field.field({ orientation: 'horizontal', children: [Checkbox.checkbox(...), label] })` },
      { title: 'Radio', preview: () => h.fieldset([h.Class('space-y-2')], [h.legend([h.Class('text-sm font-medium')], ['Plan']), ...['Free', 'Pro'].map(label => h.label([h.Class('flex items-center gap-2 text-sm')], [h.input([h.Type('radio'), h.Name('plan')]), label]))]), code: `Field.fieldSet({ children: [RadioGroup.radioGroup({ ... })] })` },
      { title: 'Switch', preview: () => h.label([h.Class('flex items-center gap-3 text-sm font-medium')], [h.input([h.Type('checkbox'), h.Role('switch')]), 'Marketing emails']), code: `Field.field({ children: [Switch.switchControl({ ... })] })` },
      { title: 'Choice Card', preview: () => h.label([h.Class('flex w-full max-w-sm items-start gap-3 rounded-md border p-4')], [h.input([h.Type('radio'), h.Name('choice')]), h.span([], ['Pro plan', h.span([h.Class('block text-sm text-muted-foreground')], ['For growing teams.'])])]), code: `Field.field({ class: 'rounded-md border p-4', children: [...] })` },
      { title: 'Field Group', preview: model => Field.fieldGroup({ class: 'w-full max-w-sm', children: [fieldInput(model, 'input'), fieldInput(model, 'textarea')] }), code: `Field.fieldGroup({ children: [firstField, secondField] })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [fieldInput(model, 'input')] }), code: `Direction.direction({ direction: 'rtl', children: [Field.field({ ... })] })` },
      { title: 'Responsive Layout', preview: model => Field.fieldGroup({ class: 'grid w-full max-w-xl gap-4 sm:grid-cols-2', children: [fieldInput(model, 'input'), fieldInput(model, 'input')] }), code: `Field.fieldGroup({ class: 'grid gap-4 sm:grid-cols-2', children })` },
      { title: 'Validation and Errors', preview: model => fieldInput(model, 'error'), code: `Field.field({ isInvalid: true, children: [..., Field.fieldError({ errors })] })` },
    ],
  },
  form: {
    description: 'Build accessible forms with labels, descriptions, validation messages, and explicit Foldkit state transitions.',
    composition: 'Form supplies semantic submission and accessible field composition. Values, validation, and async status belong to the parent Foldkit model.',
    examples: [
      { title: 'Basic', preview: model => formPreview(model), code: `Form.form({ onSubmit: Submitted(), children: [Form.formItem({ ... })] })` },
      { title: 'Validation', preview: model => formPreview(model, true), code: `Form.formItem({ id, isInvalid: true, children: [..., Form.formMessage({ errors })] })` },
      { title: 'Async Submission', preview: model => formPreview(model), code: `case 'Submitted': return [evo(model, { status: () => 'submitting' }), [saveCommand]]` },
      { title: 'Disabled', preview: model => Form.form({ class: 'w-full max-w-sm space-y-4', children: [Input.input({ id: 'disabled-form', value: model.formEmail, onInput: text('formEmail'), label: 'Email', isDisabled: true }), Button.button({ children: ['Submitting…'], isDisabled: true })] }), code: `Input.input({ isDisabled: true, ... })\nButton.button({ isDisabled: true, ... })` },
      { title: 'Textarea', preview: model => Form.form({ class: 'w-full max-w-sm space-y-4', onSubmit: action, children: [Field.field({ children: [Field.fieldLabel({ for: 'form-bio', children: ['Bio'] }), h.textarea([h.Id('form-bio'), h.Value(model.textarea), h.OnInput(text('textarea')), h.Class('min-h-24 w-full rounded-md border p-3 text-sm')], [])] }), Button.button({ type: 'submit', children: ['Save'] })] }), code: `Form.form({ children: [Textarea.textarea({ ... }), submit] })` },
      { title: 'Date Picker', preview: model => Form.form({ class: 'w-full max-w-sm space-y-4', children: [Field.fieldLabel({ for: 'birth-date', children: ['Date of birth'] }), datePicker(model)] }), code: `Form.form({ children: [DatePicker.datePicker({ ... })] })` },
    ],
  },
  'hover-card': {
    description: 'For sighted users to preview content available behind a link.',
    composition: 'Hover Card owns hover/focus visibility and close-delay state while exposing trigger and content slots.',
    examples: [
      { title: 'Basic', preview: basic('hover-card'), code: `HoverCard.hoverCard({ model, trigger: '@nextjs', content, toParentMessage })` },
      { title: 'Sides', preview: model => h.div([h.Class('flex flex-wrap gap-8')], [hoverCard(model, 'top'), hoverCard(model, 'right')]), code: `HoverCard.hoverCard({ side: 'top', ... })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [hoverCard(model)] }), code: `Direction.direction({ direction: 'rtl', children: [HoverCard.hoverCard({ ... })] })` },
    ],
  },
  input: {
    description: 'A text input component for forms and user data entry with built-in styling and accessibility features.',
    examples: [
      { title: 'Basic', preview: basic('input'), code: `Input.input({ id: 'email', value: model.email, onInput: ChangedEmail, placeholder: 'Email' })` },
      { title: 'Field', preview: model => fieldInput(model, 'input'), code: `Field.field({ children: [Field.fieldLabel(...), Input.input(...)] })` },
      { title: 'Field Group', preview: model => Field.fieldGroup({ class: 'w-full max-w-sm', children: [fieldInput(model, 'input'), fieldInput(model, 'textarea')] }), code: `Field.fieldGroup({ children: [first, second] })` },
      { title: 'Disabled', preview: model => inputPreview(model, 'disabled'), code: `Input.input({ isDisabled: true, ... })` },
      { title: 'Invalid', preview: model => inputPreview(model, 'invalid'), code: `Input.input({ isInvalid: true, ... })` },
      { title: 'File', preview: model => inputPreview(model, 'file'), code: `Input.input({ type: 'file', ... })` },
      { title: 'Inline', preview: model => h.div([h.Class('flex w-full max-w-md gap-2')], [inputPreview(model, 'basic'), Button.button({ children: ['Subscribe'], onClick: action })]), code: `h.div([h.Class('flex gap-2')], [Input.input({ ... }), Button.button({ ... })])` },
      { title: 'Grid', preview: model => h.div([h.Class('grid w-full max-w-lg gap-3 sm:grid-cols-2')], [inputPreview(model, 'basic'), Input.input({ id: 'last-name', value: model.fieldName, onInput: text('fieldName'), placeholder: 'Last name' })]), code: `h.div([h.Class('grid sm:grid-cols-2')], [firstName, lastName])` },
      { title: 'Required', preview: model => inputPreview(model, 'required'), code: `Input.input({ label: 'Email *', ... })` },
      { title: 'Badge', preview: model => h.div([h.Class('relative w-full max-w-sm')], [inputPreview(model, 'basic'), h.span([h.Class('absolute right-2 top-1/2 -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 text-xs')], ['Beta'])]), code: `h.div([h.Class('relative')], [Input.input({ ... }), badge])` },
      { title: 'Input Group', preview: model => inputGroup(model), code: `InputGroup.inputGroup({ children: [addon, input] })` },
      { title: 'Button Group', preview: model => h.div([h.Class('flex')], [Input.input({ id: 'search-input', value: model.input, onInput: text('input'), placeholder: 'Search…', class: 'rounded-r-none' }), Button.button({ children: ['Search'], onClick: action, class: 'rounded-l-none' })]), code: `h.div([h.Class('flex')], [Input.input({ ... }), Button.button({ ... })])` },
      { title: 'Form', preview: model => formPreview(model), code: `Form.form({ children: [Input.input({ ... }), submit] })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [inputPreview(model, 'basic')] }), code: `Direction.direction({ direction: 'rtl', children: [Input.input({ ... })] })` },
    ],
  },
  'input-group': {
    description: 'Add addons, buttons, and helper content to inputs.',
    composition: 'Input Group composes an input or textarea with inline or block addons. Addons can contain text, icons, keyboard hints, buttons, or progress feedback.',
    examples: [
      { title: 'Align — inline-start', preview: model => inputGroup(model, 'inline-start'), code: `InputGroup.inputGroupAddon({ align: 'inline-start', children: [...] })` },
      { title: 'Align — inline-end', preview: model => inputGroup(model, 'inline-end'), code: `InputGroup.inputGroupAddon({ align: 'inline-end', children: [...] })` },
      { title: 'Align — block-start', preview: model => inputGroup(model, 'block-start'), code: `InputGroup.inputGroupAddon({ align: 'block-start', children: [...] })` },
      { title: 'Align — block-end', preview: model => inputGroup(model, 'block-end'), code: `InputGroup.inputGroupAddon({ align: 'block-end', children: [...] })` },
      { title: 'Icon', preview: model => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupAddon({ children: [h.span([h.AriaHidden(true)], ['⌕'])] }), InputGroup.inputGroupInput({ id: 'group-icon', value: model.inputGroup, onInput: text('inputGroup'), placeholder: 'Search…' })] }), code: `InputGroup.inputGroupAddon({ children: [Icon.search()] })` },
      { title: 'Text', preview: model => inputGroup(model), code: `InputGroup.inputGroupText({ children: ['https://'] })` },
      { title: 'Button', preview: model => inputGroup(model, 'inline-end', 'button'), code: `InputGroup.inputGroupButton({ children: ['Search'], onClick: Searched() })` },
      { title: 'Kbd', preview: model => inputGroup(model, 'inline-end', 'kbd'), code: `InputGroup.inputGroupAddon({ children: [Kbd.kbd({ children: ['⌘K'] })] })` },
      { title: 'Dropdown', preview: model => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupInput({ id: 'group-dropdown', value: model.inputGroup, onInput: text('inputGroup'), placeholder: 'Search…' }), InputGroup.inputGroupAddon({ align: 'inline-end', children: [menu(model, 'dropdown', ['docs', 'issues'], item => ({ label: item[0]?.toUpperCase() + item.slice(1) }))] })] }), code: `InputGroup.inputGroupAddon({ children: [DropdownMenu.dropdownMenu({ ... })] })` },
      { title: 'Spinner', preview: model => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupAddon({ children: [h.span([h.AriaLabel('Loading'), h.Class('animate-spin')], ['◌'])] }), InputGroup.inputGroupInput({ id: 'group-spinner', value: model.inputGroup, onInput: text('inputGroup'), placeholder: 'Searching…' })] }), code: `InputGroup.inputGroupAddon({ children: [Spinner.spinner()] })` },
      { title: 'Textarea', preview: model => InputGroup.inputGroup({ class: 'max-w-sm', children: [h.textarea([h.Value(model.textarea), h.OnInput(text('textarea')), h.Class('min-h-24 flex-1 resize-none bg-transparent p-3 text-sm outline-none')], []), InputGroup.inputGroupAddon({ align: 'block-end', children: [InputGroup.inputGroupText({ children: [`${model.textarea.length}/280`] })] })] }), code: `InputGroup.inputGroup({ children: [Textarea.textarea({ ... }), addon] })` },
      { title: 'Custom Input', preview: model => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['$'] })] }), h.input([h.Type('number'), h.Value(model.inputGroup), h.OnInput(text('inputGroup')), h.Class('min-w-0 flex-1 bg-transparent px-3 text-sm outline-none')])] }), code: `InputGroup.inputGroup({ children: [addon, customInput] })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [inputGroup(model)] }), code: `Direction.direction({ direction: 'rtl', children: [InputGroup.inputGroup({ ... })] })` },
    ],
  },
  'input-otp': {
    description: 'Accessible one-time password component with copy-paste functionality.',
    composition: 'Input OTP uses one accessible native input with visual slots, optional separators, and controlled value wiring.',
    examples: [
      { title: 'Pattern', preview: model => otp(model), code: `InputOtp.inputOtp({ value, onInput, length: 6 })` },
      { title: 'Separator', preview: model => otp(model), code: `separator: index => index === 2 ? InputOtp.inputOtpSeparator() : empty` },
      { title: 'Disabled', preview: model => otp(model, { disabled: true }), code: `InputOtp.inputOtp({ isDisabled: true, ... })` },
      { title: 'Controlled', preview: model => h.div([h.Class('space-y-3 text-center')], [otp(model), h.p([h.Class('text-sm text-muted-foreground')], [`You entered: ${model.inputOtp}`])]), code: `value: model.otp\nonInput: value => ChangedOtp({ value })` },
      { title: 'Invalid', preview: model => otp(model, { invalid: true }), code: `InputOtp.inputOtp({ isInvalid: true, ... })` },
      { title: 'Four Digits', preview: model => otp(model, { length: 4 }), code: `InputOtp.inputOtp({ length: 4, ... })` },
      { title: 'Alphanumeric', description: 'The Crease OTP component intentionally normalizes to digits for one-time-code semantics.', preview: model => otp(model), code: `InputOtp.inputOtp({ ariaLabel: 'One-time password', ... })` },
      { title: 'Form', preview: model => Form.form({ class: 'space-y-4', onSubmit: action, children: [otp(model), Button.button({ type: 'submit', children: ['Verify'] })] }), code: `Form.form({ children: [InputOtp.inputOtp({ ... }), submit] })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [otp(model)] }), code: `Direction.direction({ direction: 'rtl', children: [InputOtp.inputOtp({ ... })] })` },
    ],
  },
  item: {
    description: 'A versatile component for displaying content with media, title, description, and actions.',
    composition: 'Item composes media, content, title, description, actions, header, and footer regions. Item Group and Item Separator organize related rows.',
    examples: [
      { title: 'Variant', preview: () => h.div([h.Class('w-full space-y-3')], [itemPreview('default'), itemPreview('outline'), itemPreview('muted')]), code: `Item.item({ variant: 'outline', children: [...] })` },
      { title: 'Size', preview: () => h.div([h.Class('w-full space-y-3')], [Item.item({ size: 'sm', children: [Item.itemContent({ children: [Item.itemTitle({ children: ['Compact item'] }), Item.itemDescription({ children: ['A smaller density.'] })] })] }), itemPreview('outline')]), code: `Item.item({ size: 'sm', children: [...] })` },
      { title: 'Icon', preview: () => itemPreview('outline', 'icon'), code: `Item.itemMedia({ variant: 'icon', children: [Icon.file()] })` },
      { title: 'Avatar', preview: () => itemPreview('outline', 'avatar'), code: `Item.itemMedia({ variant: 'image', children: [avatar] })` },
      { title: 'Image', preview: () => itemPreview('outline', 'image'), code: `Item.itemMedia({ variant: 'image', children: [image] })` },
      { title: 'Group', preview: () => Item.itemGroup({ class: 'w-full max-w-lg', children: [itemPreview('default'), Item.itemSeparator(), itemPreview('default')] }), code: `Item.itemGroup({ children: [first, Item.itemSeparator(), second] })` },
      { title: 'Header', preview: () => Item.item({ variant: 'outline', class: 'w-full max-w-lg', children: [Item.itemHeader({ children: ['Recently opened'] }), Item.itemContent({ children: [Item.itemTitle({ children: ['Document.pdf'] }), Item.itemDescription({ children: ['Edited two minutes ago.'] })] }), Item.itemFooter({ children: ['Shared with 3 people'] })] }), code: `Item.item({ children: [Item.itemHeader(...), content, Item.itemFooter(...)] })` },
      { title: 'Link', preview: () => h.a([h.Href('#'), h.Class('block w-full max-w-lg')], [itemPreview('outline')]), code: `h.a([h.Href('/docs')], [Item.item({ ... })])` },
      { title: 'Dropdown', preview: model => Item.item({ variant: 'outline', class: 'w-full max-w-lg', children: [Item.itemContent({ children: [Item.itemTitle({ children: ['Document.pdf'] }), Item.itemDescription({ children: ['Project brief'] })] }), Item.itemActions({ children: [menu(model, 'dropdown', ['open', 'delete'], item => ({ label: item[0]?.toUpperCase() + item.slice(1), variant: item === 'delete' ? 'destructive' : 'default' }))] })] }), code: `Item.itemActions({ children: [DropdownMenu.dropdownMenu({ ... })] })` },
      { title: 'RTL', preview: () => Direction.direction({ direction: 'rtl', children: [itemPreview('outline')] }), code: `Direction.direction({ direction: 'rtl', children: [Item.item({ ... })] })` },
    ],
  },
  kbd: {
    description: 'Used to display textual user input from a keyboard.',
    composition: 'Kbd renders one key and Kbd Group presents a keyboard chord with consistent spacing.',
    examples: [
      { title: 'Group', preview: () => Kbd.kbdGroup({ children: [Kbd.kbd({ children: ['⌘'] }), Kbd.kbd({ children: ['K'] })] }), code: `Kbd.kbdGroup({ children: [Kbd.kbd({ children: ['⌘'] }), Kbd.kbd({ children: ['K'] })] })` },
      { title: 'Button', preview: () => Button.button({ variant: 'outline', children: ['Open command', Kbd.kbd({ children: ['⌘K'] })], onClick: action }), code: `Button.button({ children: ['Open command', Kbd.kbd({ children: ['⌘K'] })] })` },
      { title: 'Tooltip', preview: () => h.div([h.Class('flex items-center gap-2 text-sm')], ['Press', Kbd.kbd({ children: ['?'] }), 'for keyboard shortcuts']), code: `Tooltip.tooltip({ trigger: Kbd.kbd({ children: ['?'] }), content: 'Keyboard shortcuts' })` },
      { title: 'Input Group', preview: model => inputGroup(model, 'inline-end', 'kbd'), code: `InputGroup.inputGroupAddon({ children: [Kbd.kbd({ children: ['⌘K'] })] })` },
      { title: 'RTL', preview: () => Direction.direction({ direction: 'rtl', children: [Kbd.kbdGroup({ children: [Kbd.kbd({ children: ['Ctrl'] }), Kbd.kbd({ children: ['K'] })] })] }), code: `Direction.direction({ direction: 'rtl', children: [Kbd.kbdGroup({ ... })] })` },
    ],
  },
  label: {
    description: 'Renders an accessible label associated with controls.',
    examples: [
      { title: 'Usage', preview: basic('label'), code: `Label.label({ for: 'email', children: ['Email'] })` },
      { title: 'Label in Field', preview: model => fieldInput(model, 'input'), code: `Field.field({ children: [Field.fieldLabel({ for: 'name', ... }), Input.input({ id: 'name', ... })] })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [h.div([h.Class('grid w-full max-w-sm gap-2')], [Label.label({ for: 'rtl-email', children: ['البريد الإلكتروني'] }), Input.input({ id: 'rtl-email', value: model.labelInput, onInput: text('labelInput') })])] }), code: `Direction.direction({ direction: 'rtl', children: [Label.label({ ... }), input] })` },
    ],
  },
  marker: {
    description: 'Labels or separates a point in a stream of content.',
    composition: 'Marker combines an optional icon with concise content and supports inline and separator treatments.',
    examples: [
      { title: 'Basic', preview: basic('marker'), code: `Marker.marker({ children: [Marker.markerContent({ children: ['Today'] })] })` },
      { title: 'Separator', preview: () => Marker.marker({ variant: 'separator', children: [Marker.markerContent({ children: ['Today'] })] }), code: `Marker.marker({ variant: 'separator', children: [...] })` },
      { title: 'Dot', preview: () => Marker.marker({ children: [Marker.markerIcon({ children: ['•'] }), Marker.markerContent({ children: ['3 unread'] })] }), code: `Marker.marker({ children: [Marker.markerIcon({ children: ['•'] }), content] })` },
      { title: 'With Icon', preview: () => Marker.marker({ children: [Marker.markerIcon({ children: ['✦'] }), Marker.markerContent({ children: ['New messages'] })] }), code: `Marker.markerIcon({ children: [Icon.sparkles()] })` },
      { title: 'In a Message Stream', preview: () => h.div([h.Class('w-full max-w-lg space-y-5')], [messageExample('start'), Marker.marker({ variant: 'separator', children: [Marker.markerContent({ children: ['Today'] })] }), messageExample('end')]), code: `Message.messageGroup({ children: [message, Marker.marker({ ... }), message] })` },
      { title: 'RTL', preview: () => Direction.direction({ direction: 'rtl', children: [Marker.marker({ variant: 'separator', children: [Marker.markerContent({ children: ['اليوم'] })] })] }), code: `Direction.direction({ direction: 'rtl', children: [Marker.marker({ ... })] })` },
    ],
  },
  message: {
    description: 'Composes avatars, bubbles, author details, and metadata into readable conversation turns.',
    composition: 'Message Group contains messages. Each Message chooses alignment and composes Avatar, Content, Header, Bubble, and Footer.',
    examples: [
      { title: 'Basic', preview: basic('message'), code: `Message.message({ children: [Message.messageAvatar(...), Message.messageContent(...)] })` },
      { title: 'Incoming and Outgoing', preview: () => MessageUi.messageGroup({ class: 'w-full max-w-lg', children: [messageExample('start'), messageExample('end')] }), code: `Message.message({ align: 'start', ... })\nMessage.message({ align: 'end', ... })` },
      { title: 'Avatar', preview: () => messageExample('start'), code: `Message.messageAvatar({ children: [avatar] })` },
      { title: 'Header and Footer Metadata', preview: () => messageExample('end'), code: `Message.messageHeader({ children: ['You'] })\nMessage.messageFooter({ children: ['Just now'] })` },
      { title: 'Actions', preview: () => h.div([h.Class('w-full max-w-lg space-y-2')], [messageExample('start'), h.div([h.Class('flex gap-1 pl-11')], [Button.button({ size: 'sm', variant: 'ghost', children: ['Copy'], onClick: action }), Button.button({ size: 'sm', variant: 'ghost', children: ['Retry'], onClick: action })])]), code: `Button.button({ onClick: CopiedMessage(), children: ['Copy'] })` },
      { title: 'With Bubble', preview: () => messageExample('start'), code: `Bubble.bubble({ children: [Bubble.bubbleContent({ children: [text] })] })` },
      { title: 'Grouped Messages', preview: () => MessageUi.messageGroup({ class: 'w-full max-w-lg', children: [messageExample('start', false), messageExample('start', false), messageExample('end', false)] }), code: `Message.messageGroup({ children: messages.map(viewMessage) })` },
      { title: 'RTL', preview: () => Direction.direction({ direction: 'rtl', children: [messageExample('start')] }), code: `Direction.direction({ direction: 'rtl', children: [Message.message({ ... })] })` },
    ],
  },
  'message-scroller': {
    description: 'Keeps long conversations navigable with a measured viewport and explicit scroll controls.',
    composition: 'Message Scroller owns viewport measurements and scroll commands. Content and Items provide the virtualizable conversation structure.',
    examples: [
      { title: 'Basic', preview: basic('message-scroller'), code: `MessageScroller.messageScroller({ children: [viewport, button] })` },
      { title: 'Auto-scroll', preview: model => scroller(model), code: `MessageScroller.messageScrollerButton({ model, direction: 'end', toParentMessage })` },
      { title: 'New-message Indicator', preview: model => h.div([h.Class('relative')], [scroller(model), h.span([h.Class('absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground')], ['3 new'])]), code: `unread > 0 ? badge : empty` },
      { title: 'Long Conversation', preview: model => scroller(model, 30), code: `MessageScroller.messageScrollerContent({ children: messages.map(messageScrollerItem) })` },
      { title: 'Custom Scroll Button', preview: model => scroller(model, 16, true), code: `MessageScroller.messageScrollerButton({ model, class: 'rounded-full', ... })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [scroller(model)] }), code: `Direction.direction({ direction: 'rtl', children: [MessageScroller.messageScroller({ ... })] })` },
    ],
  },
  menubar: {
    description: 'A visually persistent menu common in desktop applications that provides quick access to a consistent set of commands.',
    composition: 'Menubar composes several Dropdown Menu submodels, one per top-level menu, and maps every child message through a stable target.',
    examples: [
      { title: 'Basic', preview: basic('menubar'), code: `Menubar.menubar({ menus: [{ id, label, model, toParentMessage, items, itemToConfig }] })` },
      { title: 'Checkbox', preview: model => menubar(model, 'checkbox'), code: `itemToConfig: item => ({ kind: 'checkbox', isChecked: item.checked })` },
      { title: 'Radio', preview: model => menubar(model, 'radio'), code: `itemToConfig: item => ({ kind: 'radio', isChecked: item.value === selected })` },
      { title: 'Submenu', preview: model => menubar(model, 'submenu'), code: `itemToConfig: item => ({ submenu: { items, itemToConfig } })` },
      { title: 'With Icons', preview: model => menubar(model, 'icons'), code: `itemToConfig: item => ({ label: item.label, icon: item.icon })` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [menubar(model, 'basic')] }), code: `Direction.direction({ direction: 'rtl', children: [Menubar.menubar({ ... })] })` },
    ],
  },
  'native-select': {
    description: 'A styled native HTML select element with consistent design system integration.',
    composition: 'Native Select retains native keyboard and platform behavior while adding consistent label, description, invalid, disabled, option, and optgroup styling.',
    examples: [
      { title: 'Simple', preview: basic('native-select'), code: `NativeSelect.nativeSelect({ id, value, onChange, options })` },
      { title: 'With groups', preview: model => nativeSelect(model, 'groups'), code: `NativeSelect.nativeSelect({ groups: [{ label, options }], ... })` },
      { title: 'Groups', preview: model => nativeSelect(model, 'groups'), code: `NativeSelect.nativeSelectOptGroup({ label: 'Europe', options })` },
      { title: 'Disabled', preview: model => nativeSelect(model, 'disabled'), code: `NativeSelect.nativeSelect({ isDisabled: true, ... })` },
      { title: 'Invalid', preview: model => nativeSelect(model, 'invalid'), code: `NativeSelect.nativeSelect({ isInvalid: true, ... })` },
      { title: 'Native Select vs Select', description: 'Use Native Select for platform-native behavior and Select when custom popover content or richer items are required.', preview: model => h.div([h.Class('flex flex-wrap items-center gap-4')], [nativeSelect(model, 'basic'), h.p([h.Class('max-w-xs text-sm text-muted-foreground')], ['Native Select is ideal for compact forms and mobile platform pickers.'])]), code: `NativeSelect.nativeSelect({ ... }) // native browser UI\nSelect.select({ ... }) // custom listbox UI` },
      { title: 'RTL', preview: model => Direction.direction({ direction: 'rtl', children: [nativeSelect(model, 'basic')] }), code: `Direction.direction({ direction: 'rtl', children: [NativeSelect.nativeSelect({ ... })] })` },
    ],
  },
  'navigation-menu': {
    description: 'A collection of links for navigating websites.',
    composition: 'Navigation Menu provides semantic nav, list, item, link, and disclosure helpers. Disclosures delegate to a Popover submodel.',
    examples: [
      { title: 'Basic', preview: basic('navigation-menu'), code: `NavigationMenu.navigationMenu({ children: [NavigationMenu.navigationMenuList({ ... })] })` },
      { title: 'Link Component', preview: navigation(true), code: `NavigationMenu.navigationMenuLink({ href: '/docs', isActive: true, children: ['Docs'] })` },
      { title: 'RTL', preview: navigation(true, true), code: `Direction.direction({ direction: 'rtl', children: [NavigationMenu.navigationMenu({ ... })] })` },
    ],
  },
  pagination: {
    description: 'Pagination with page navigation, next and previous links.',
    composition: 'Pagination composes a navigation landmark, list, items, links, direction links, and an accessible ellipsis.',
    examples: [
      { title: 'Simple', preview: basic('pagination'), code: `Pagination.pagination({ children: [Pagination.paginationContent({ children: pages })] })` },
      { title: 'Icons Only', preview: () => pagination(true), code: `Pagination.paginationPrevious({ href: '#', class: '[&_span]:hidden' })` },
      { title: 'Next.js', description: 'Pass route hrefs directly to each link. In a Foldkit router, derive the active page from the route model.', preview: () => pagination(), code: `Pagination.paginationLink({ href: '/invoices?page=2', isActive: true, children: ['2'] })` },
      { title: 'RTL', preview: () => pagination(false, true), code: `Direction.direction({ direction: 'rtl', children: [Pagination.pagination({ ... })] })` },
    ],
  },
}

/** Replace deliberately abbreviated prose snippets with the exact Foldkit view
 * function used by the live preview. Concise, already-complete snippets remain
 * hand-authored so their focused teaching value is preserved. */
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

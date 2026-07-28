import { type Html, html } from 'foldkit/html'

import * as State from '@/docs/components/catalog-state'

import * as Alert from '@/ui/alert'
import * as AlertDialog from '@/ui/alert-dialog'
import * as Attachment from '@/ui/attachment'
import * as Avatar from '@/ui/avatar'
import * as AspectRatio from '@/ui/aspect-ratio'
import * as Badge from '@/ui/badge'
import * as Breadcrumb from '@/ui/breadcrumb'
import * as Button from '@/ui/button'
import * as ButtonGroup from '@/ui/button-group'
import * as Bubble from '@/ui/bubble'
import * as Card from '@/ui/card'
import * as Carousel from '@/ui/carousel'
import * as Chart from '@/ui/chart'
import * as Checkbox from '@/ui/checkbox'
import * as Collapsible from '@/ui/collapsible'
import * as Combobox from '@/ui/combobox'
import * as CommandMenu from '@/ui/command'
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
import * as Kbd from '@/ui/kbd'
import * as Label from '@/ui/label'
import * as Item from '@/ui/item'
import * as Marker from '@/ui/marker'
import * as MessageUi from '@/ui/message'
import * as MessageScroller from '@/ui/message-scroller'
import * as Menubar from '@/ui/menubar'
import * as NativeSelect from '@/ui/native-select'
import * as NavigationMenu from '@/ui/navigation-menu'
import * as Pagination from '@/ui/pagination'
import * as Progress from '@/ui/progress'
import * as Popover from '@/ui/popover'
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
import * as Typography from '@/ui/typography'
import * as Tooltip from '@/ui/tooltip'

type PreviewMessage = State.Message
const interacted: PreviewMessage = State.ClickedPreviewAction()
const today = { year: 2026, month: 7, day: 28 }

const invoiceTable = (): Html =>
  Table.table<PreviewMessage>({ children: [
    Table.tableCaption({ children: ['A list of your recent invoices.'] }),
    Table.tableHeader({ children: [Table.tableRow({ children: [
      Table.tableHead({ children: ['Invoice'] }),
      Table.tableHead({ children: ['Status'] }),
      Table.tableHead({ class: 'text-right', children: ['Total'] }),
    ] })] }),
    Table.tableBody({ children: [
      ['INV001', 'Paid', '$250.00'],
      ['INV002', 'Pending', '$150.00'],
      ['INV003', 'Unpaid', '$350.00'],
    ].map(row => Table.tableRow({ children: row.map((cell, index) =>
      Table.tableCell({ ...(index === 2 ? { class: 'text-right' } : {}), children: [cell] }),
    ) })) }),
  ] })

export const hasRealPreview = (slug: string): boolean => slug in previews

export const realPreview = (slug: string, model: State.Model): Html => previews[slug]?.(model) ?? html<PreviewMessage>().div([], [])

const previews: Readonly<Record<string, (model: State.Model) => Html>> = {
  alert: () => Alert.alert({ children: [
    Alert.alertTitle({ children: ['Heads up!'] }),
    Alert.alertDescription({ children: ['You can add components to your app using the CLI.'] }),
  ] }),
  attachment: () => Attachment.attachment({ state: 'done', children: [Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }), Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['project-brief.pdf'] }), Attachment.attachmentDescription({ children: ['2.4 MB · Uploaded'] })] }), Attachment.attachmentActions({ children: [Button.button({ variant: 'ghost', size: 'sm', children: ['Remove'], onClick: interacted })] })] }),
  avatar: () => Avatar.avatar({ size: 'lg', children: [Avatar.avatarImage({ src: 'https://github.com/shadcn.png', alt: '@shadcn' }), Avatar.avatarFallback({ children: ['CN'] })] }),
  'aspect-ratio': () => AspectRatio.aspectRatio({ ratio: 16 / 9, class: 'w-full max-w-md overflow-hidden rounded-lg bg-muted', children: [
    html<PreviewMessage>().img([html<PreviewMessage>().Src('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80'), html<PreviewMessage>().Alt('Mountain landscape'), html<PreviewMessage>().Class('size-full object-cover')]),
  ] }),
  badge: () => html<PreviewMessage>().div([html<PreviewMessage>().Class('flex flex-wrap gap-2')], [
    Badge.badge({ children: ['Badge'] }), Badge.badge({ variant: 'secondary', children: ['Secondary'] }), Badge.badge({ variant: 'outline', children: ['Outline'] }), Badge.badge({ variant: 'destructive', children: ['Destructive'] }),
  ]),
  breadcrumb: () => Breadcrumb.breadcrumb({ children: [Breadcrumb.breadcrumbList({ children: [
    Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbLink({ href: '/', children: ['Home'] })] }),
    Breadcrumb.breadcrumbSeparator(),
    Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbLink({ href: '/docs', children: ['Components'] })] }),
    Breadcrumb.breadcrumbSeparator(),
    Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbPage({ children: ['Breadcrumb'] })] }),
  ] })] }),
  button: () => html<PreviewMessage>().div([html<PreviewMessage>().Class('flex flex-wrap gap-3')], [
    Button.button({ children: ['Button'], onClick: interacted }),
    Button.button({ variant: 'secondary', children: ['Secondary'], onClick: interacted }),
    Button.button({ variant: 'outline', children: ['Outline'], onClick: interacted }),
    Button.button({ variant: 'ghost', children: ['Ghost'], onClick: interacted }),
  ]),
  'button-group': () => ButtonGroup.buttonGroup({ children: [
    Button.button({ variant: 'outline', children: ['Previous'], onClick: interacted }),
    Button.button({ variant: 'outline', children: ['Next'], onClick: interacted }),
  ] }),
  bubble: () => Bubble.bubbleGroup({ class: 'w-full max-w-md', children: [Bubble.bubble({ align: 'start', children: [Bubble.bubbleContent({ children: ['Hey! How can I help you today?'] })] }), Bubble.bubble({ align: 'end', variant: 'tinted', children: [Bubble.bubbleContent({ children: ['Show me how Crease UI works.'] })] })] }),
  card: model => Card.card({ class: 'w-full max-w-sm', children: [
    Card.cardHeader({ children: [Card.cardTitle({ children: ['Login to your account'] }), Card.cardDescription({ children: ['Enter your email below to login.'] })] }),
    Card.cardContent({ children: [Input.input({ id: 'card-email', value: model.cardEmail, onInput: value => State.ChangedText({ target: 'cardEmail', value }), label: 'Email', placeholder: 'm@example.com' })] }),
    Card.cardFooter({ children: [Button.button({ class: 'w-full', children: ['Login'], onClick: interacted })] }),
  ] }),
  carousel: model => Carousel.carousel({ model: model.carousel, toParentMessage: message => State.GotCarouselMessage({ message }), class: 'w-full max-w-xs', items: [1, 2, 3].map(number => Card.card({ children: [Card.cardContent({ class: 'flex aspect-square items-center justify-center p-6 text-4xl font-semibold', children: [String(number)] })] })) }),
  chart: () => Chart.barChart({ class: 'max-w-xl', data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }, { label: 'Apr', value: 73 }, { label: 'May', value: 209 }, { label: 'Jun', value: 214 }] }),
  checkbox: model => Checkbox.checkbox({ model: model.checkbox, toParentMessage: message => State.GotCheckboxMessage({ message }), label: 'Accept terms and conditions', description: 'You agree to our Terms of Service and Privacy Policy.' }),
  collapsible: model => Collapsible.collapsible({ model: model.collapsible, toParentMessage: message => State.GotCollapsibleMessage({ message }), class: 'w-full max-w-sm space-y-2', triggerClass: 'flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-semibold', trigger: '@peduarte starred 3 repositories', contentClass: 'space-y-2', content: html<PreviewMessage>().div([html<PreviewMessage>().Class('rounded-md border px-4 py-3 text-sm')], ['@radix-ui/primitives']) }),
  direction: () => Direction.direction({ direction: 'rtl', children: [Card.card({ class: 'w-full max-w-sm', children: [Card.cardHeader({ children: [Card.cardTitle({ children: ['اتجاه من اليمين إلى اليسار'] }), Card.cardDescription({ children: ['هذا المحتوى يستخدم اتجاه RTL.'] })] })] })] }),
  'data-table': model => DataTable.dataTable({ model: model.dataTable, toParentMessage: message => State.GotDataTableMessage({ message }), rows: [{ id: '728ed52f', status: 'success', email: 'm@example.com', amount: 100 }, { id: '489e1d42', status: 'pending', email: 'a@example.com', amount: 125 }, { id: 'f7a4b3c2', status: 'processing', email: 's@example.com', amount: 250 }], columns: [{ key: 'status', header: 'Status', cell: row => row.status, sortValue: row => row.status }, { key: 'email', header: 'Email', cell: row => row.email, sortValue: row => row.email }, { key: 'amount', header: 'Amount', class: 'text-right', cell: row => `$${row.amount.toFixed(2)}`, sortValue: row => row.amount }], rowKey: row => row.id, filterText: row => `${row.status} ${row.email}`, filterPlaceholder: 'Filter emails…' }),
  empty: () => Empty.empty({ class: 'w-full max-w-md border', children: [Empty.emptyHeader({ children: [Empty.emptyMedia({ variant: 'icon', children: ['＋'] }), Empty.emptyTitle({ children: ['No projects yet'] }), Empty.emptyDescription({ children: ['Get started by creating your first project.'] })] }), Empty.emptyContent({ children: [Button.button({ children: ['Create project'], onClick: interacted })] })] }),
  field: model => Field.fieldGroup({ class: 'w-full max-w-sm', children: [Field.field({ children: [Field.fieldLabel({ for: 'docs-field-name', children: ['Name'] }), Input.input({ id: 'docs-field-name', value: model.fieldName, onInput: value => State.ChangedText({ target: 'fieldName', value }), placeholder: 'Evil Rabbit' }), Field.fieldDescription({ children: ['This is your public display name.'] })] })] }),
  form: model => Form.form({ class: 'w-full max-w-sm', onSubmit: interacted, children: [Form.formItem({ id: 'docs-form-email', children: [Form.formLabel({ for: 'docs-form-email', children: ['Email'] }), Input.input({ id: 'docs-form-email', value: model.formEmail, onInput: value => State.ChangedText({ target: 'formEmail', value }), placeholder: 'm@example.com' }), Form.formDescription({ children: ['We will never share your email.'] })] }), Button.button({ type: 'submit', children: ['Submit'] })] }),
  input: model => Input.input({ id: 'docs-input', value: model.input, onInput: value => State.ChangedText({ target: 'input', value }), placeholder: 'Email', class: 'max-w-sm' }),
  'input-group': model => InputGroup.inputGroup({ class: 'max-w-sm', children: [InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['https://'] })] }), InputGroup.inputGroupInput({ id: 'docs-input-group', value: model.inputGroup, onInput: value => State.ChangedText({ target: 'inputGroup', value }), placeholder: 'example.com' })] }),
  'input-otp': model => InputOtp.inputOtp({ id: 'docs-otp', value: model.inputOtp, onInput: value => State.ChangedText({ target: 'inputOtp', value }), separator: index => index === 2 ? InputOtp.inputOtpSeparator() : html<PreviewMessage>().span([], []) }),
  kbd: () => html<PreviewMessage>().div([html<PreviewMessage>().Class('flex items-center gap-2 text-sm')], ['Press', Kbd.kbd({ children: ['⌘'] }), Kbd.kbd({ children: ['K'] }), 'to open the command menu']),
  label: model => html<PreviewMessage>().div([html<PreviewMessage>().Class('grid w-full max-w-sm gap-2')], [Label.label({ for: 'docs-label-input', children: ['Email'] }), Input.input({ id: 'docs-label-input', value: model.labelInput, onInput: value => State.ChangedText({ target: 'labelInput', value }), placeholder: 'Email' })]),
  item: () => Item.item({ variant: 'outline', class: 'w-full max-w-md', children: [Item.itemMedia({ variant: 'icon', children: ['📄'] }), Item.itemContent({ children: [Item.itemTitle({ children: ['Document.pdf'] }), Item.itemDescription({ children: ['A project specification document.'] })] }), Item.itemActions({ children: [Button.button({ variant: 'outline', size: 'sm', children: ['Open'], onClick: interacted })] })] }),
  marker: () => Marker.marker({ variant: 'separator', class: 'max-w-md', children: [Marker.markerContent({ children: ['Today'] })] }),
  message: () => MessageUi.message({ class: 'max-w-md', children: [MessageUi.messageAvatar({ children: ['AI'] }), MessageUi.messageContent({ children: [MessageUi.messageHeader({ children: ['Assistant'] }), Bubble.bubble({ children: [Bubble.bubbleContent({ children: ['How can I help with your project?'] })] }), MessageUi.messageFooter({ children: ['Just now'] })] })] }),
  'native-select': model => NativeSelect.nativeSelect({ id: 'docs-native-select', value: model.nativeSelect, onChange: value => State.ChangedNativeSelect({ value }), options: [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }, { value: 'blueberry', label: 'Blueberry' }], class: 'max-w-xs' }),
  pagination: () => Pagination.pagination({ children: [Pagination.paginationContent({ children: [Pagination.paginationItem({ children: [Pagination.paginationPrevious({ href: '#' })] }), ...[1, 2, 3].map(page => Pagination.paginationItem({ children: [Pagination.paginationLink({ href: '#', isActive: page === 1, children: [String(page)] })] })), Pagination.paginationItem({ children: [Pagination.paginationNext({ href: '#' })] })] })] }),
  progress: () => Progress.progress({ value: 60, class: 'w-full max-w-sm' }),
  'radio-group': model => RadioGroup.radioGroup({ model: model.radioGroup, toParentMessage: message => State.GotRadioGroupMessage({ message }), ariaLabel: 'Density', options: [{ value: 'default', label: 'Default' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }] }),
  resizable: model => Resizable.resizable({ model: model.resizable, toParentMessage: message => State.GotResizableMessage({ message }), class: 'h-48 w-full max-w-xl', withHandle: true, first: html<PreviewMessage>().div([html<PreviewMessage>().Class('flex size-full items-center justify-center p-6')], ['One']), second: html<PreviewMessage>().div([html<PreviewMessage>().Class('flex size-full items-center justify-center p-6')], ['Two']) }),
  'scroll-area': () => ScrollArea.scrollArea({ class: 'h-72 w-48 rounded-md border p-4', children: Array.from({ length: 30 }, (_, index) => html<PreviewMessage>().div([html<PreviewMessage>().Class('py-1 text-sm')], [`Tag ${index + 1}`])) }),
  separator: () => html<PreviewMessage>().div([html<PreviewMessage>().Class('w-full max-w-sm')], [html<PreviewMessage>().h4([html<PreviewMessage>().Class('text-sm font-medium')], ['Radix Primitives']), html<PreviewMessage>().p([html<PreviewMessage>().Class('text-sm text-muted-foreground')], ['An open-source UI component library.']), Separator.separator({ class: 'my-4' }), html<PreviewMessage>().div([html<PreviewMessage>().Class('flex h-5 items-center gap-4 text-sm')], ['Blog', Separator.separator({ orientation: 'vertical' }), 'Docs', Separator.separator({ orientation: 'vertical' }), 'Source'])]),
  skeleton: () => html<PreviewMessage>().div([html<PreviewMessage>().Class('flex items-center gap-4')], [Skeleton.skeleton({ class: 'size-12 rounded-full' }), html<PreviewMessage>().div([html<PreviewMessage>().Class('space-y-2')], [Skeleton.skeleton({ class: 'h-4 w-52' }), Skeleton.skeleton({ class: 'h-4 w-40' })])]),
  slider: model => Slider.slider({ model: model.slider, toParentMessage: message => State.GotSliderMessage({ message }), ariaLabel: 'Volume', class: 'w-full max-w-sm' }),
  spinner: () => Spinner.spinner({ class: 'size-6' }),
  switch: model => Switch.switchControl({ model: model.switchControl, toParentMessage: message => State.GotSwitchMessage({ message }), label: 'Airplane Mode' }),
  table: invoiceTable,
  tabs: model => Tabs.tabs({ model: model.tabs, toParentMessage: message => State.GotTabsMessage({ message }), class: 'w-full max-w-md', tabs: [{ value: 'account', label: 'Account', content: Card.card({ children: [Card.cardHeader({ children: [Card.cardTitle({ children: ['Account'] }), Card.cardDescription({ children: ['Make changes to your account here.'] })] })] }) }, { value: 'password', label: 'Password', content: Card.card({ children: [Card.cardHeader({ children: [Card.cardTitle({ children: ['Password'] }), Card.cardDescription({ children: ['Change your password here.'] })] })] }) }] }),
  textarea: model => Textarea.textarea({ id: 'docs-textarea', value: model.textarea, onInput: value => State.ChangedText({ target: 'textarea', value }), placeholder: 'Type your message here.', class: 'max-w-sm' }),
  toggle: model => Toggle.toggle({ isPressed: model.togglePressed, onToggle: State.ToggledPreview(), children: ['Bold'] }),
  'toggle-group': model => ToggleGroup.toggleGroup({ value: model.toggleGroupValue, onToggle: value => State.ChangedToggleGroup({ value }), variant: 'outline', items: [{ value: 'left', children: ['Left'] }, { value: 'center', children: ['Center'] }, { value: 'right', children: ['Right'] }] }),
  typography: () => html<PreviewMessage>().article([html<PreviewMessage>().Class('max-w-lg space-y-4')], [Typography.typographyH2({ children: ['The Joke Tax Chronicles'] }), Typography.typographyP({ children: ['Once upon a time, in a far-off land, there was a very lazy king.'] }), Typography.typographyBlockquote({ children: ['After all, he thought, why should he have to work?'] })]),
  'alert-dialog': model => html<PreviewMessage>().div([], [Button.button({ children: ['Show dialog'], onClick: State.OpenedOverlay({ target: 'alertDialog' }) }), AlertDialog.alertDialog({ model: model.alertDialog, toParentMessage: message => State.GotAlertDialogMessage({ message }), title: 'Are you absolutely sure?', description: 'This action cannot be undone. This will permanently delete your account.', actionLabel: 'Continue' })]),
  combobox: model => Combobox.combobox({ model: model.combobox, toParentMessage: message => State.GotComboboxMessage({ message }), items: [{ value: 'next', label: 'Next.js' }, { value: 'svelte', label: 'SvelteKit' }, { value: 'nuxt', label: 'Nuxt.js' }], itemToValue: item => item.value, itemToLabel: item => item.label, placeholder: 'Select framework…' }),
  command: model => CommandMenu.command({ model: model.command, toParentMessage: message => State.GotCommandMessage({ message }), class: 'w-full max-w-md border shadow-md', items: ['calendar', 'search', 'settings'], itemToConfig: item => ({ content: item[0]?.toUpperCase() + item.slice(1) }), placeholder: 'Type a command or search…' }),
  'context-menu': model => ContextMenu.contextMenu({ model: model.contextMenu, toParentMessage: message => State.GotContextMenuMessage({ message }), class: 'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm', trigger: 'Right click here', items: ['back', 'forward', 'reload'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1) }) }),
  'date-picker': model => DatePicker.datePicker({ model: model.datePicker, toParentMessage: message => State.GotDatePickerMessage({ message }) }),
  dialog: model => html<PreviewMessage>().div([], [Button.button({ children: ['Edit profile'], onClick: State.OpenedOverlay({ target: 'dialog' }) }), Dialog.dialog({ model: model.dialog, toParentMessage: message => State.GotDialogMessage({ message }), title: 'Edit profile', description: 'Make changes to your profile here. Click save when you’re done.', content: () => [Input.input({ id: 'docs-dialog-name', value: model.dialogName, onInput: value => State.ChangedText({ target: 'dialogName', value }), label: 'Name' })], footer: () => [Button.button({ children: ['Save changes'], onClick: interacted })] })]),
  drawer: model => html<PreviewMessage>().div([], [Button.button({ children: ['Open drawer'], onClick: State.OpenedOverlay({ target: 'drawer' }) }), Drawer.drawer({ model: model.drawer, toParentMessage: message => State.GotDrawerMessage({ message }), title: 'Move Goal', description: 'Set your daily activity goal.', content: () => [html<PreviewMessage>().div([html<PreviewMessage>().Class('px-4 pb-6 text-center text-5xl font-bold')], ['350'])] })]),
  'dropdown-menu': model => DropdownMenu.dropdownMenu({ model: model.dropdownMenu, toParentMessage: message => State.GotDropdownMenuMessage({ message }), triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium shadow-xs', trigger: 'Open', items: ['profile', 'billing', 'settings', 'logout'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1), separatorBefore: item === 'logout' }) }),
  'hover-card': model => HoverCard.hoverCard({ model: model.hoverCard, toParentMessage: message => State.GotHoverCardMessage({ message }), triggerClass: 'underline underline-offset-4', trigger: '@nextjs', content: html<PreviewMessage>().div([html<PreviewMessage>().Class('space-y-1')], [html<PreviewMessage>().h4([html<PreviewMessage>().Class('font-semibold')], ['@nextjs']), html<PreviewMessage>().p([html<PreviewMessage>().Class('text-sm')], ['The React Framework – created and maintained by @vercel.'])]) }),
  'message-scroller': model => MessageScroller.messageScroller({ class: 'relative h-72 w-full max-w-md rounded-md border', children: [MessageScroller.messageScrollerViewport({ model: model.messageScroller, toParentMessage: message => State.GotMessageScrollerMessage({ message }), children: [MessageScroller.messageScrollerContent({ children: Array.from({ length: 18 }, (_, index) => MessageScroller.messageScrollerItem({ scrollAnchor: index === 17, children: [Bubble.bubble({ align: index % 2 === 0 ? 'start' : 'end', children: [Bubble.bubbleContent({ children: [`Message ${index + 1}`] })] })] })) })] }), MessageScroller.messageScrollerButton({ model: model.messageScroller, toParentMessage: message => State.GotMessageScrollerMessage({ message }), direction: 'end' })] }),
  menubar: model => Menubar.menubar<string, PreviewMessage>({ menus: ([['file', 'File', model.menubarFile], ['edit', 'Edit', model.menubarEdit], ['view', 'View', model.menubarView]] as const).map(([target, label, menu]) => ({ id: `docs-menubar-${target}`, label, model: menu, toParentMessage: message => State.GotMenubarMessage({ target, message }), items: ['new', 'open', 'save'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1) }) })) }),
  popover: model => Popover.popover({ model: model.popover, toParentMessage: message => State.GotPopoverMessage({ message }), triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium', trigger: 'Open popover', content: html<PreviewMessage>().div([html<PreviewMessage>().Class('grid gap-2')], [html<PreviewMessage>().h4([html<PreviewMessage>().Class('font-medium')], ['Dimensions']), html<PreviewMessage>().p([html<PreviewMessage>().Class('text-sm text-muted-foreground')], ['Set the dimensions for the layer.'])]) }),
  select: model => Select.select({ model: model.select, toParentMessage: message => State.GotSelectMessage({ message }), items: [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }, { value: 'blueberry', label: 'Blueberry' }], itemToValue: item => item.value, itemToLabel: item => item.label, placeholder: 'Select a fruit' }),
  sheet: model => html<PreviewMessage>().div([], [Button.button({ children: ['Open sheet'], onClick: State.OpenedOverlay({ target: 'sheet' }) }), Sheet.sheet({ model: model.sheet, toParentMessage: message => State.GotSheetMessage({ message }), title: 'Edit profile', description: 'Make changes to your profile here.', content: () => [Input.input({ id: 'docs-sheet-name', value: model.sheetName, onInput: value => State.ChangedText({ target: 'sheetName', value }), label: 'Name' })] })]),
  tooltip: model => Tooltip.tooltip({ model: model.tooltip, toParentMessage: message => State.GotTooltipMessage({ message }), triggerClass: 'rounded-md border px-3 py-2 text-sm', trigger: 'Hover', content: 'Add to library' }),
  'navigation-menu': () => NavigationMenu.navigationMenu({ children: [NavigationMenu.navigationMenuList({ children: ['Home', 'Components', 'Docs'].map((label, index) => NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '#', isActive: index === 0, children: [label] })] })) })] }),
  sidebar: () => Sidebar.sidebarProvider({ class: 'h-80 min-h-0 w-full max-w-2xl overflow-hidden rounded-lg border', children: [Sidebar.sidebar({ collapsible: 'none', children: [Sidebar.sidebarHeader({ children: [html<PreviewMessage>().div([html<PreviewMessage>().Class('px-2 py-1 font-semibold')], ['Acme Inc.'])] }), Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: ['Platform'] }), Sidebar.sidebarGroupContent({ children: [Sidebar.sidebarMenu({ children: ['Playground', 'Models', 'Documentation'].map(label => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: label === 'Playground', children: [label] })] })) })] })] })] })] })] }),
  sonner: model => Sonner.sonner({ model: model.sonner, toParentMessage: message => State.GotSonnerMessage({ message }), class: 'relative right-auto bottom-auto p-0' }),
  toast: model => Toast.toast({ model: model.toast, toParentMessage: message => State.GotToastMessage({ message }), class: 'relative right-auto bottom-auto p-0' }),
}

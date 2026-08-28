import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Accordion from '@/stylex/accordion'
import * as Alert from '@/stylex/alert'
import * as AlertDialog from '@/stylex/alert-dialog'
import * as AspectRatio from '@/stylex/aspect-ratio'
import * as Attachment from '@/stylex/attachment'
import * as Avatar from '@/stylex/avatar'
import * as Badge from '@/stylex/badge'
import * as Breadcrumb from '@/stylex/breadcrumb'
import * as Bubble from '@/stylex/bubble'
import * as Button from '@/stylex/button'
import * as ButtonGroup from '@/stylex/button-group'
import * as Calendar from '@/stylex/calendar'
import * as Card from '@/stylex/card'
import * as Carousel from '@/stylex/carousel'
import * as Chart from '@/stylex/chart'
import * as Checkbox from '@/stylex/checkbox'
import * as Collapsible from '@/stylex/collapsible'
import * as Combobox from '@/stylex/combobox'
import * as Command from '@/stylex/command'
import * as ContextMenu from '@/stylex/context-menu'
import * as DataTable from '@/stylex/data-table'
import * as DatePicker from '@/stylex/date-picker'
import * as Dialog from '@/stylex/dialog'
import * as Direction from '@/stylex/direction'
import * as Drawer from '@/stylex/drawer'
import * as DropdownMenu from '@/stylex/dropdown-menu'
import * as Empty from '@/stylex/empty'
import * as Field from '@/stylex/field'
import * as Form from '@/stylex/form'
import * as HoverCard from '@/stylex/hover-card'
import * as Input from '@/stylex/input'
import * as InputGroup from '@/stylex/input-group'
import * as InputOtp from '@/stylex/input-otp'
import * as Item from '@/stylex/item'
import * as Kbd from '@/stylex/kbd'
import * as Label from '@/stylex/label'
import * as Marker from '@/stylex/marker'
import * as Menubar from '@/stylex/menubar'
import * as Message from '@/stylex/message'
import * as MessageScroller from '@/stylex/message-scroller'
import * as NativeSelect from '@/stylex/native-select'
import * as NavigationMenu from '@/stylex/navigation-menu'
import * as Pagination from '@/stylex/pagination'
import * as Popover from '@/stylex/popover'
import * as Progress from '@/stylex/progress'
import * as RadioGroup from '@/stylex/radio-group'
import * as Resizable from '@/stylex/resizable'
import * as ScrollArea from '@/stylex/scroll-area'
import * as Select from '@/stylex/select'
import * as Separator from '@/stylex/separator'
import * as Sheet from '@/stylex/sheet'
import * as Sidebar from '@/stylex/sidebar'
import * as Skeleton from '@/stylex/skeleton'
import * as Slider from '@/stylex/slider'
import * as Sonner from '@/stylex/sonner'
import * as Spinner from '@/stylex/spinner'
import * as Switch from '@/stylex/switch'
import * as Table from '@/stylex/table'
import * as Tabs from '@/stylex/tabs'
import * as Textarea from '@/stylex/textarea'
import * as Toast from '@/stylex/toast'
import * as Toggle from '@/stylex/toggle'
import * as ToggleGroup from '@/stylex/toggle-group'
import * as Tooltip from '@/stylex/tooltip'
import * as Typography from '@/stylex/typography'

export const STYLEX_CATALOG_NAMES = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'attachment', 'avatar',
  'badge', 'breadcrumb', 'bubble', 'button', 'button-group', 'calendar', 'card',
  'carousel', 'chart', 'checkbox', 'collapsible', 'combobox', 'command',
  'context-menu', 'data-table', 'date-picker', 'dialog', 'direction', 'drawer',
  'dropdown-menu', 'empty', 'field', 'form', 'hover-card', 'input', 'input-group',
  'input-otp', 'item', 'kbd', 'label', 'marker', 'menubar', 'message',
  'message-scroller', 'native-select', 'navigation-menu', 'pagination', 'popover',
  'progress', 'radio-group', 'resizable', 'scroll-area', 'select', 'separator',
  'sheet', 'sidebar', 'skeleton', 'slider', 'sonner', 'spinner', 'switch', 'table',
  'tabs', 'textarea', 'toast', 'toggle', 'toggle-group', 'tooltip', 'typography',
] as const

type CatalogName = (typeof STYLEX_CATALOG_NAMES)[number]
type Specimen = Readonly<{ name: CatalogName; note: string; view: Html }>

const staticState = <Msg>(label: string, detail: string, h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('grid gap-1 rounded-md border border-dashed p-3')], [
    h.span([h.Class('text-sm font-medium')], [label]),
    h.span([h.Class('text-xs text-muted-foreground')], [detail]),
  ])

const toastModel = (id: string): Sonner.Model =>
  Sonner.show(Sonner.init({ id }), Sonner.info({ title: 'StyleX notification', description: 'Static catalog state.' }))[0]

export const catalogSpecimens = <Msg>(
  noOpMessage: Msg,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Specimen> => {
  const noop = <Message>(_message: Message): Msg => noOpMessage
  const accordionItems = [{ value: 'constraints', trigger: 'Why StyleX?', content: 'Static extraction narrows the styling grammar.', isOpen: true }]
  const accordionModel = Accordion.init({ id: 'stylex-catalog-accordion', items: accordionItems })
  const calendarModel = Calendar.init({ id: 'stylex-catalog-calendar', today: { year: 2026, month: 8, day: 25 }, initialViewDate: { year: 2026, month: 8, day: 25 } })
  const selectedDate = Option.some({ year: 2026, month: 8, day: 25 })
  const messageScrollerModel = MessageScroller.init('stylex-catalog-messages')

  return [
    { name: 'accordion', note: 'Static open state', view: Accordion.accordion({ model: accordionModel, items: accordionItems, toParentMessage: noop }, h) },
    { name: 'alert', note: 'Destructive variant', view: Alert.alert({ variant: 'destructive', children: [Alert.alertTitle({ children: ['Heads up'] }, h), Alert.alertDescription({ children: ['Agent constraints are enforced at lint time.'] }, h)] }, h) },
    { name: 'alert-dialog', note: 'Initialized closed modal', view: h.div([], [staticState('Confirmation dialog', 'Closed static-state specimen; behavior is covered in component docs.', h), AlertDialog.alertDialog({ model: AlertDialog.init({ id: 'stylex-catalog-alert-dialog', isAnimated: true }), toParentMessage: noop, title: 'Delete project?', description: 'This action cannot be undone.', actionLabel: 'Delete' }, h)]) },
    { name: 'aspect-ratio', note: '16:9 media frame', view: AspectRatio.aspectRatio({ ratio: 16 / 9, children: [h.div([h.Class('grid h-full place-items-center rounded-md bg-muted text-xs text-foreground')], ['16:9'])] }, h) },
    { name: 'attachment', note: 'Completed upload', view: Attachment.attachment({ state: 'done', children: [Attachment.attachmentMedia({ children: ['PDF'] }, h), Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['agent-contract.pdf'] }, h), Attachment.attachmentDescription({ children: ['Uploaded · 240 KB'] }, h)] }, h)] }, h) },
    { name: 'avatar', note: 'Static initials', view: Avatar.avatar({ children: [h.span([h.AriaLabel('Foldkit avatar'), h.Role('img'), h.Class('grid size-full place-items-center bg-muted text-sm font-medium text-foreground')], ['FK'])] }, h) },
    { name: 'badge', note: 'Secondary status', view: Badge.badge({ variant: 'secondary', children: ['Stable'] }, h) },
    { name: 'breadcrumb', note: 'Semantic navigation', view: Breadcrumb.breadcrumb({ children: [Breadcrumb.breadcrumbList({ children: [Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbLink({ href: '/stylex', children: ['StyleX'] }, h)] }, h), Breadcrumb.breadcrumbSeparator({}, h), Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbPage({ children: ['Catalog'] }, h)] }, h)] }, h)] }, h) },
    { name: 'bubble', note: 'Secondary message', view: Bubble.bubble({ variant: 'secondary', children: [Bubble.bubbleContent({ variant: 'secondary', children: ['Typed styles, explicit state.'] }, h)] }, h) },
    { name: 'button', note: 'Primary and outline', view: ButtonGroup.buttonGroup({ children: [Button.button({ children: ['Continue'] }, h), Button.button({ variant: 'outline', children: ['Cancel'] }, h)] }, h) },
    { name: 'button-group', note: 'Grouped actions', view: ButtonGroup.buttonGroup({ children: [Button.button({ variant: 'outline', children: ['Back'] }, h), Button.button({ variant: 'outline', children: ['Next'] }, h)] }, h) },
    { name: 'calendar', note: 'Static selected date', view: Calendar.calendar({ model: calendarModel, maybeSelectedDate: selectedDate, toParentMessage: noop }, h) },
    { name: 'card', note: 'Full composition', view: Card.card({ children: [Card.cardHeader({ children: [Card.cardTitle({ children: ['Style contract'] }, h), Card.cardDescription({ children: ['Static extraction and semantic tokens.'] }, h)] }, h), Card.cardContent({ children: ['Agent-authored styles have one canonical form.'] }, h)] }, h) },
    { name: 'carousel', note: 'Static first slide', view: Carousel.carousel({ model: Carousel.init('stylex-catalog-carousel', 2), toParentMessage: noop, items: ['First typed slide', 'Second typed slide'], ariaLabel: 'StyleX examples' }, h) },
    { name: 'chart', note: 'Compact bar chart', view: Chart.barChart({ data: [{ label: 'A', value: 44 }, { label: 'B', value: 72 }, { label: 'C', value: 58 }], isCompact: true }, h) },
    { name: 'checkbox', note: 'Controlled checked state', view: Checkbox.checkbox({ id: 'stylex-catalog-checkbox', isChecked: true, onToggle: noop, label: 'Use semantic tokens' }, h) },
    { name: 'collapsible', note: 'Static open state', view: Collapsible.collapsible({ id: 'stylex-catalog-collapsible', isOpen: true, onToggle: noop, trigger: 'Implementation details', content: 'Foldkit owns disclosure state.' }, h) },
    { name: 'combobox', note: 'Static searchable input', view: Combobox.combobox({ model: Combobox.init({ id: 'stylex-catalog-combobox', isAnimated: true }), maybeSelectedValue: Option.none(), restingInputValue: '', toParentMessage: noop, items: ['Foldkit', 'Elm', 'StyleX'], itemToValue: item => item, itemToLabel: item => item, placeholder: 'Search frameworks', ariaLabel: 'Framework' }, h) },
    { name: 'command', note: 'Static command search', view: Command.command({ model: Command.init({ id: 'stylex-catalog-command', isAnimated: false }), maybeSelectedValue: Option.none(), restingInputValue: '', toParentMessage: noop, items: ['Open', 'Save'], itemToConfig: item => ({ content: item }), ariaLabel: 'Commands' }, h) },
    { name: 'context-menu', note: 'Static trigger surface', view: staticState('Right-click target', `Initialized: ${ContextMenu.init({ id: 'stylex-catalog-context', isAnimated: true }).id}`, h) },
    { name: 'data-table', note: 'Two-row data view', view: DataTable.dataTable({ model: DataTable.init(5), toParentMessage: noop, rows: [{ id: '1', name: 'Button' }, { id: '2', name: 'Dialog' }], columns: [{ key: 'name', header: 'Component', cell: row => row.name }], rowKey: row => row.id, ariaLabel: 'StyleX components' }, h) },
    { name: 'date-picker', note: 'Initialized disclosure', view: staticState('August 25, 2026', `Initialized: ${DatePicker.init({ id: 'stylex-catalog-date-picker', today: { year: 2026, month: 8, day: 25 } }).popover.id}`, h) },
    { name: 'dialog', note: 'Compound header part', view: Dialog.dialogHeader({ children: [h.strong([], ['Dialog title']), h.p([h.Class('text-xs text-muted-foreground')], ['Modal behavior uses a child model.'])] }, h) },
    { name: 'direction', note: 'RTL containment', view: Direction.direction({ direction: 'rtl', children: ['واجهة من اليمين إلى اليسار'] }, h) },
    { name: 'drawer', note: 'Initialized closed drawer', view: h.div([], [staticState('Bottom drawer', 'Closed static-state specimen; behavior is covered in component docs.', h), Drawer.drawer({ model: Drawer.init({ id: 'stylex-catalog-drawer', isAnimated: true }), toParentMessage: noop, title: 'Drawer title', description: 'Bottom-sheet composition.' }, h)]) },
    { name: 'dropdown-menu', note: 'Initialized menu state', view: staticState('Account actions', `Initialized: ${DropdownMenu.init({ id: 'stylex-catalog-menu', isAnimated: true }).id}`, h) },
    { name: 'empty', note: 'Actionable empty state', view: Empty.empty({ children: [Empty.emptyHeader({ children: [Empty.emptyTitle({ children: ['No generated drift'] }, h), Empty.emptyDescription({ children: ['Lint rules keep agent output consistent.'] }, h)] }, h)] }, h) },
    { name: 'field', note: 'Label and description', view: Field.field({ children: [Field.fieldLabel({ for: 'stylex-field', children: ['Repository'] }, h), Field.fieldDescription({ children: ['A semantic field composition.'] }, h)] }, h) },
    { name: 'form', note: 'Semantic form group', view: Form.form({ ariaLabel: 'Catalog form', children: [Form.formLabel({ for: 'stylex-form-input', children: ['Project name'] }, h), Form.formDescription({ children: ['Used for generated artifacts.'] }, h)] }, h) },
    { name: 'hover-card', note: 'Focus or hover trigger', view: HoverCard.hoverCard({ model: HoverCard.init({ id: 'stylex-catalog-hover-card' }), toParentMessage: noop, trigger: '@foldkit', content: 'Elm architecture for TypeScript.', ariaLabel: 'Preview Foldkit' }, h) },
    { name: 'input', note: 'Labeled control', view: Input.input({ id: 'stylex-catalog-input', value: '', onInput: noop, label: 'Agent email', placeholder: 'agent@example.com' }, h) },
    { name: 'input-group', note: 'Prefix composition', view: h.div([h.Class('grid gap-2')], [h.label([h.For('stylex-catalog-url'), h.Class('text-sm font-medium')], ['Project URL']), InputGroup.inputGroup({ children: [InputGroup.inputGroupAddon({ children: ['https://'] }, h), InputGroup.inputGroupInput({ id: 'stylex-catalog-url', value: 'crease.dev', onInput: noop }, h)] }, h)]) },
    { name: 'input-otp', note: 'Six-digit code', view: InputOtp.inputOtp({ id: 'stylex-catalog-otp', value: '420', onInput: noop, ariaLabel: 'Verification code' }, h) },
    { name: 'item', note: 'Structured list item', view: Item.itemGroup({ children: [Item.item({ variant: 'outline', children: [Item.itemContent({ children: [Item.itemTitle({ children: ['Button'] }, h), Item.itemDescription({ children: ['Primary action primitive'] }, h)] }, h), Item.itemActions({ children: [Badge.badge({ variant: 'outline', children: ['StyleX'] }, h)] }, h)] }, h)] }, h) },
    { name: 'kbd', note: 'Keyboard hint', view: Kbd.kbdGroup({ children: [Kbd.kbd({ children: ['⌘'] }, h), Kbd.kbd({ children: ['K'] }, h)] }, h) },
    { name: 'label', note: 'Form label', view: Label.label({ for: 'stylex-label-example', children: ['Semantic label'] }, h) },
    { name: 'marker', note: 'Section marker', view: Marker.marker({ variant: 'border', children: [Marker.markerContent({ children: ['Stable contract'] }, h)] }, h) },
    { name: 'menubar', note: 'Static menu triggers', view: h.div([h.AriaHidden(true)], [Menubar.menubar({ ariaLabel: 'Application menu', menus: [{ id: 'file', label: 'File', model: DropdownMenu.init({ id: 'stylex-catalog-file-menu', isAnimated: true }), toParentMessage: noop, items: ['New', 'Save'], itemToConfig: item => ({ label: item }) }] }, h)]) },
    { name: 'message', note: 'Message composition', view: Message.message({ children: [Message.messageAvatar({ children: ['AI'] }, h), Message.messageContent({ children: [Message.messageHeader({ children: ['Agent'] }, h), Bubble.bubbleContent({ variant: 'muted', children: ['One styling grammar.'] }, h)] }, h)] }, h) },
    { name: 'message-scroller', note: 'Static viewport', view: MessageScroller.messageScroller({ children: [MessageScroller.messageScrollerViewport({ model: messageScrollerModel, toParentMessage: noop, children: [MessageScroller.messageScrollerContent({ children: [MessageScroller.messageScrollerItem({ children: ['Latest message'] }, h)] }, h)] }, h)] }, h) },
    { name: 'native-select', note: 'Native platform control', view: NativeSelect.nativeSelect({ id: 'stylex-catalog-native-select', value: 'stylex', onChange: noop, label: 'Styling engine', options: [{ value: 'stylex', label: 'StyleX' }, { value: 'tailwind', label: 'Tailwind' }] }, h) },
    { name: 'navigation-menu', note: 'Semantic navigation', view: NavigationMenu.navigationMenu({ ariaLabel: 'Catalog navigation', children: [NavigationMenu.navigationMenuList({ children: [NavigationMenu.navigationMenuItem({ children: [NavigationMenu.navigationMenuLink({ href: '/stylex', isActive: true, children: ['Catalog'] }, h)] }, h)] }, h)] }, h) },
    { name: 'pagination', note: 'Current page', view: Pagination.pagination({ children: [Pagination.paginationContent({ children: [Pagination.paginationItem({ children: [Pagination.paginationPrevious({ href: '/stylex' }, h)] }, h), Pagination.paginationItem({ children: [Pagination.paginationLink({ href: '/stylex', isActive: true, children: ['1'] }, h)] }, h), Pagination.paginationItem({ children: [Pagination.paginationNext({ href: '/stylex' }, h)] }, h)] }, h)] }, h) },
    { name: 'popover', note: 'Static disclosure trigger', view: Popover.popover({ model: Popover.init({ id: 'stylex-catalog-popover', isAnimated: true, contentFocus: true }), toParentMessage: noop, trigger: 'Open details', content: 'Typed popover content.' }, h) },
    { name: 'progress', note: '72 percent complete', view: h.div([h.Class('grid w-full gap-2')], [h.span([h.Class('text-xs font-medium')], ['72% complete']), h.div([h.AriaHidden(true)], [Progress.progress({ value: 72 }, h)])]) },
    { name: 'radio-group', note: 'Static selected option', view: RadioGroup.radioGroup({ model: RadioGroup.init({ id: 'stylex-catalog-radio' }), toParentMessage: noop, selectedValue: Option.some('strict'), ariaLabel: 'Constraint level', options: [{ value: 'strict', label: 'Strict' }, { value: 'flexible', label: 'Flexible' }] }, h) },
    { name: 'resizable', note: 'Static split panel', view: Resizable.resizable({ model: Resizable.init('stylex-catalog-resizable', 45), toParentMessage: noop, first: 'Source', second: 'Preview', extent: 320, withHandle: true }, h) },
    { name: 'scroll-area', note: 'Contained overflow', view: ScrollArea.scrollArea({ ariaLabel: 'Token list', children: ['background · foreground · primary · accent · destructive'] }, h) },
    { name: 'select', note: 'Static typed selection', view: Select.select({ model: Select.init({ id: 'stylex-catalog-select', isAnimated: true }), maybeSelectedValue: Option.some('stylex'), toParentMessage: noop, items: ['stylex', 'tailwind'], itemToValue: item => item, itemToLabel: item => item === 'stylex' ? 'StyleX' : 'Tailwind', ariaLabel: 'Styling engine' }, h) },
    { name: 'separator', note: 'Semantic divider', view: Separator.separator({}, h) },
    { name: 'sheet', note: 'Compound header part', view: Sheet.sheetHeader({ children: [h.strong([], ['Sheet title']), h.p([h.Class('text-xs text-muted-foreground')], ['Side-panel composition.'])] }, h) },
    { name: 'sidebar', note: 'Menu item composition', view: Sidebar.sidebarMenu({ children: [Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: true, children: ['Components'] }, h)] }, h)] }, h) },
    { name: 'skeleton', note: 'Loading placeholder', view: h.div([h.Class('h-8 w-full')], [Skeleton.skeleton({}, h)]) },
    { name: 'slider', note: 'Range control', view: Slider.rangeSlider({ values: [25, 70], min: 0, max: 100, onInput: noop, ariaLabels: ['Minimum', 'Maximum'] }, h) },
    { name: 'sonner', note: 'Static notification', view: Sonner.sonner({ model: toastModel('stylex-catalog-sonner'), toParentMessage: noop, ariaLabel: 'Sonner notifications' }, h) },
    { name: 'spinner', note: 'Busy state', view: Spinner.spinner({ label: 'Loading catalog' }, h) },
    { name: 'switch', note: 'Controlled enabled state', view: Switch.switch({ id: 'stylex-catalog-switch', isChecked: true, onToggle: noop, label: 'Strict linting' }, h) },
    { name: 'table', note: 'Semantic data table', view: Table.table({ children: [Table.tableHeader({ children: [Table.tableRow({ children: [Table.tableHead({ children: ['Rule'] }, h), Table.tableHead({ children: ['Level'] }, h)] }, h)] }, h), Table.tableBody({ children: [Table.tableRow({ children: [Table.tableCell({ children: ['valid-styles'] }, h), Table.tableCell({ children: ['error'] }, h)] }, h)] }, h)] }, h) },
    { name: 'tabs', note: 'Static selected tab', view: Tabs.tabs({ model: Tabs.init({ id: 'stylex-catalog-tabs' }), selectedValue: 'preview', toParentMessage: noop, tabs: [{ value: 'preview', label: 'Preview', content: 'Rendered StyleX output' }, { value: 'source', label: 'Source', content: 'Typed style objects' }] }, h) },
    { name: 'textarea', note: 'Labeled multiline control', view: Textarea.textarea({ id: 'stylex-catalog-textarea', value: 'One canonical styling grammar.', onInput: noop, label: 'Agent note', rows: 2 }, h) },
    { name: 'toast', note: 'Compatibility alias', view: Toast.sonner({ model: toastModel('stylex-catalog-toast'), toParentMessage: noop, ariaLabel: 'Toast notifications' }, h) },
    { name: 'toggle', note: 'Pressed state', view: Toggle.toggle({ isPressed: true, onToggle: noOpMessage, children: ['Bold'] }, h) },
    { name: 'toggle-group', note: 'Single selection', view: ToggleGroup.toggleGroup({ value: 'center', onToggle: noop, items: [{ value: 'left', children: ['Left'] }, { value: 'center', children: ['Center'] }, { value: 'right', children: ['Right'] }] }, h) },
    { name: 'tooltip', note: 'Focus or hover trigger', view: Tooltip.tooltip({ model: Tooltip.init({ id: 'stylex-catalog-tooltip', showDelay: 0 }), toParentMessage: noop, trigger: 'Hover for context', content: 'StyleX tooltip', portal: false }, h) },
    { name: 'typography', note: 'Type hierarchy', view: h.div([h.Class('grid gap-2')], [Typography.typographyH4({ children: ['Typed interface'] }, h), Typography.typographyMuted({ children: ['Quiet, familiar, inspectable.'] }, h)]) },
  ]
}

export const stylexCatalog = <Msg>(
  query: string,
  onQuery: (value: string) => Msg,
  noOpMessage: Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const normalized = query.trim().toLocaleLowerCase()
  const specimens = catalogSpecimens(noOpMessage, h).filter(specimen => specimen.name.includes(normalized))

  return h.section([h.AriaLabel('StyleX component catalog'), h.Class('mt-16')], [
    h.div([h.Class('flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between')], [
      h.div([h.Class('grid gap-2')], [
        h.h2([h.Class('text-2xl font-semibold tracking-tight')], ['Full StyleX catalog']),
        h.p([h.Class('max-w-[70ch] text-sm leading-6 text-muted-foreground')], ['All 65 modules are rendered below. Stateful specimens use initialized static state unless their interaction can be represented without expanding the page model.']),
      ]),
      h.label([h.Class('grid gap-1 text-xs font-medium')], ['Filter components', h.input([h.Type('search'), h.Value(query), h.OnInput(onQuery), h.Placeholder('Search 65 components…'), h.AriaLabel('Filter StyleX components'), h.Class('h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 sm:w-64')])]),
    ]),
    h.p([h.Role('status'), h.Class('mt-4 text-xs text-muted-foreground')], [`Showing ${specimens.length} of 65 components`]),
    h.div([h.Class('mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3')], specimens.map(specimen =>
      h.article([h.DataAttribute('stylex-component', specimen.name), h.Class('min-w-0 overflow-hidden rounded-xl border bg-card')], [
        h.div([h.Class('flex items-start justify-between gap-3 border-b px-4 py-3')], [h.h3([h.Class('font-mono text-sm font-semibold')], [specimen.name]), Badge.badge({ variant: 'outline', children: ['StyleX'] }, h)]),
        h.div([h.Class('grid min-h-32 place-items-center overflow-auto p-5')], [specimen.view]),
        h.p([h.Class('border-t px-4 py-3 text-xs text-muted-foreground')], [specimen.note]),
      ]),
    )),
  ])
}


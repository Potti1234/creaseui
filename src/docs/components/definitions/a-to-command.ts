import { type Html, html } from 'foldkit/html'

import { type PageDefinitions } from '@/docs/components/page-definition'
import { realPreview } from '@/docs/components/real-previews'
import * as State from '@/docs/components/catalog-state'
import * as Alert from '@/ui/alert'
import * as AlertDialog from '@/ui/alert-dialog'
import * as AspectRatio from '@/ui/aspect-ratio'
import * as Attachment from '@/ui/attachment'
import * as Avatar from '@/ui/avatar'
import * as Badge from '@/ui/badge'
import * as Breadcrumb from '@/ui/breadcrumb'
import * as Bubble from '@/ui/bubble'
import * as Button from '@/ui/button'
import * as ButtonGroup from '@/ui/button-group'
import * as Card from '@/ui/card'
import * as Carousel from '@/ui/carousel'
import * as Chart from '@/ui/chart'
import * as Checkbox from '@/ui/checkbox'
import * as Collapsible from '@/ui/collapsible'
import * as Combobox from '@/ui/combobox'
import * as CommandMenu from '@/ui/command'
import * as DropdownMenu from '@/ui/dropdown-menu'
import * as Input from '@/ui/input'
import * as InputGroup from '@/ui/input-group'
import * as Popover from '@/ui/popover'
import * as Select from '@/ui/select'
import * as Spinner from '@/ui/spinner'
import * as Tooltip from '@/ui/tooltip'

type Msg = State.Message

const h = html<Msg>()
const clicked = State.ClickedPreviewAction()
const code = (component: string, preview: (model: State.Model) => Html): string =>
  `import * as ${component} from '@/ui/${component.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}'\n\nconst preview = ${preview.toString()}`

const basic = (slug: string, component: string) => {
  const preview = (model: State.Model) => realPreview(slug, model)
  return {
  title: 'Basic',
  preview,
  code: code(component, preview),
  }
}

const staticExample = (
  title: string,
  component: string,
  preview: () => Html,
  description?: string,
) => ({ title, ...(description === undefined ? {} : { description }), preview, code: code(component, preview) })

const statefulExample = (
  title: string,
  component: string,
  preview: (model: State.Model) => Html,
  description?: string,
) => ({ title, ...(description === undefined ? {} : { description }), preview, code: code(component, preview) })

const row = (children: ReadonlyArray<Html | string>, className = ''): Html =>
  h.div([h.Class(`flex flex-wrap items-center justify-center gap-3 ${className}`)], children)

const stack = (children: ReadonlyArray<Html | string>, className = ''): Html =>
  h.div([h.Class(`grid w-full max-w-md gap-3 ${className}`)], children)

const alertPreview = (variant: 'default' | 'destructive', action = false, custom = false): Html =>
  Alert.alert({ variant, ...(custom ? { class: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300' } : {}), children: [
    Alert.alertTitle({ children: [variant === 'destructive' ? 'Error' : 'Heads up!'] }),
    Alert.alertDescription({ children: [variant === 'destructive' ? 'Your session has expired. Please log in again.' : 'You can add components to your app using the CLI.'] }),
    ...(action ? [Button.button({ variant: 'outline', size: 'sm', class: 'mt-3', onClick: clicked, children: ['Upgrade'] })] : []),
  ] })

const alertDialogPreview = (
  model: State.Model,
  options: Readonly<{ size?: 'default' | 'sm'; media?: boolean; destructive?: boolean; rtl?: boolean }> = {},
): Html => h.div([...(options.rtl ? [h.Dir('rtl')] : [])], [
  Button.button({ variant: 'outline', onClick: State.OpenedOverlay({ target: 'alertDialog' }), children: ['Show Dialog'] }),
  AlertDialog.alertDialog({
    model: model.alertDialog,
    toParentMessage: message => State.GotAlertDialogMessage({ message }),
    title: options.destructive ? 'Delete project?' : 'Are you absolutely sure?',
    description: options.destructive ? 'This permanently deletes the project and all of its data.' : 'This action cannot be undone. This will permanently delete your account.',
    actionLabel: options.destructive ? 'Delete' : 'Continue',
    ...(options.size === undefined ? {} : { size: options.size }),
    ...(options.destructive ? { actionClass: 'bg-destructive text-white hover:bg-destructive/90' } : {}),
    ...(options.media ? { media: ['!'] } : {}),
  }),
])

const aspectPreview = (ratio: number, className: string): Html =>
  AspectRatio.aspectRatio({ ratio, class: `w-full max-w-md overflow-hidden rounded-lg ${className}`, children: [
    h.div([h.Class('flex size-full items-end bg-gradient-to-br from-sky-300 via-indigo-300 to-fuchsia-300 p-5')], [
      h.span([h.Class('rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur')], [`${ratio}:1`]),
    ]),
  ] })

const attachmentPreview = (state: Attachment.AttachmentState = 'done', size: 'sm' | 'default' = 'default'): Html =>
  Attachment.attachment({ state, size, children: [
    Attachment.attachmentMedia({ variant: 'icon', children: [state === 'error' ? '!' : 'PDF'] }),
    Attachment.attachmentContent({ children: [
      Attachment.attachmentTitle({ children: ['project-brief.pdf'] }),
      Attachment.attachmentDescription({ children: [state === 'uploading' ? 'Uploading 64%' : state === 'error' ? 'Upload failed' : '2.4 MB · PDF'] }),
    ] }),
    Attachment.attachmentActions({ children: [Button.button({ variant: 'ghost', size: 'sm', onClick: clicked, children: ['Remove'] })] }),
  ] })

const avatar = (initials: string, size: 'default' | 'sm' | 'lg' = 'default'): Html =>
  Avatar.avatar({ size, children: [
    Avatar.avatarImage({ src: `https://github.com/${initials === 'CN' ? 'shadcn' : 'vercel'}.png`, alt: initials }),
    Avatar.avatarFallback({ children: [initials] }),
  ] })

const breadcrumbPreview = (separator = '/', collapsed = false): Html =>
  Breadcrumb.breadcrumb({ children: [Breadcrumb.breadcrumbList({ children: [
    Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbLink({ href: '/', children: ['Home'] })] }),
    Breadcrumb.breadcrumbSeparator({ children: [separator] }),
    ...(collapsed ? [Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbEllipsis()] }), Breadcrumb.breadcrumbSeparator({ children: [separator] })] : [
      Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbLink({ href: '/docs', children: ['Components'] })] }),
      Breadcrumb.breadcrumbSeparator({ children: [separator] }),
    ]),
    Breadcrumb.breadcrumbItem({ children: [Breadcrumb.breadcrumbPage({ children: ['Breadcrumb'] })] }),
  ] })] })

const buttonPreview = (variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link', label: string, className?: string): Html =>
  Button.button({ variant, ...(className === undefined ? {} : { class: className }), onClick: clicked, children: [label] })

const bubblePreview = (variant: 'default' | 'tinted' | 'outline' = 'default', align: 'start' | 'end' = 'start', text = 'Hey! How can I help you today?'): Html =>
  Bubble.bubble({ variant, align, children: [Bubble.bubbleContent({ children: [text] })] })

const cardPreview = (options: Readonly<{ small?: boolean; image?: boolean; rtl?: boolean; edge?: boolean }> = {}): Html =>
  Card.card({ class: `${options.small ? 'max-w-xs' : 'max-w-sm'} w-full ${options.rtl ? 'text-right' : ''}`, children: [
    ...(options.image ? [h.div([h.Class('mx-4 aspect-video rounded-lg bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300')], [])] : []),
    Card.cardHeader({ children: [
      Card.cardTitle({ children: [options.image ? 'Beautiful destination' : 'Login to your account'] }),
      Card.cardDescription({ children: [options.image ? 'Plan your next weekend away.' : 'Enter your email below to login.'] }),
      Card.cardAction({ children: [Button.button({ variant: 'ghost', size: 'sm', onClick: clicked, children: ['Sign Up'] })] }),
    ] }),
    Card.cardContent({ ...(options.edge ? { class: 'px-0' } : {}), children: [h.p([h.Class(options.edge ? 'border-y px-4 py-4 text-sm text-muted-foreground' : 'text-sm text-muted-foreground')], ['Source-owned components you can compose and customize.'])] }),
    Card.cardFooter({ children: [Button.button({ class: 'w-full', onClick: clicked, children: ['Continue'] })] }),
  ] })

const carouselPreview = (model: State.Model, options: Readonly<{ orientation?: 'horizontal' | 'vertical'; compact?: boolean; spacing?: boolean }> = {}): Html =>
  Carousel.carousel({
    model: model.carousel,
    toParentMessage: message => State.GotCarouselMessage({ message }),
    ...(options.orientation === undefined ? {} : { orientation: options.orientation }),
    class: options.orientation === 'vertical' ? 'h-56 w-56' : options.compact ? 'w-56' : 'w-full max-w-xs',
    items: [1, 2, 3].map(number => Card.card({ class: options.spacing ? 'mx-2' : '', children: [Card.cardContent({ class: 'flex aspect-square items-center justify-center p-6 text-4xl font-semibold', children: [String(number)] })] })),
  })

const checkboxPreview = (model: State.Model, options: Readonly<{ description?: boolean; disabled?: boolean; invalid?: boolean; label?: string; instance?: string }> = {}): Html =>
  Checkbox.checkbox({
    model: { ...model.checkbox, id: `${model.checkbox.id}-${options.instance ?? 'default'}` },
    toParentMessage: message => State.GotCheckboxMessage({ message }),
    label: options.label ?? 'Accept terms and conditions',
    ...(options.description ? { description: 'You agree to our Terms of Service and Privacy Policy.' } : {}),
    ...(options.disabled ? { isDisabled: true } : {}),
    ...(options.invalid ? { class: 'aria-invalid:border-destructive aria-invalid:ring-destructive/20' } : {}),
  })

const collapsiblePreview = (model: State.Model, kind: 'basic' | 'settings' | 'tree' = 'basic'): Html =>
  Collapsible.collapsible({
    model: model.collapsible,
    toParentMessage: message => State.GotCollapsibleMessage({ message }),
    class: 'w-full max-w-sm space-y-2',
    triggerClass: 'flex w-full items-center justify-between rounded-md border px-4 py-2 text-left text-sm font-semibold',
    trigger: kind === 'settings' ? 'Notification settings' : kind === 'tree' ? 'src' : '@peduarte starred 3 repositories',
    contentClass: 'space-y-2 rounded-md border px-4 py-3 text-sm',
    content: kind === 'settings' ? 'Email · Push · Weekly digest' : kind === 'tree' ? 'components/\nlib/\nmain.ts' : '@radix-ui/primitives',
  })

type Framework = 'next' | 'svelte' | 'nuxt' | 'remix' | 'astro'
const frameworks: ReadonlyArray<Readonly<{ value: Framework; label: string; group: string }>> = [
  { value: 'next', label: 'Next.js', group: 'React' },
  { value: 'remix', label: 'Remix', group: 'React' },
  { value: 'svelte', label: 'SvelteKit', group: 'Svelte' },
  { value: 'nuxt', label: 'Nuxt.js', group: 'Vue' },
  { value: 'astro', label: 'Astro', group: 'Other' },
]

const comboboxPreview = (model: State.Model, options: Readonly<{ disabled?: boolean; groups?: boolean; clear?: boolean; popup?: boolean }> = {}): Html =>
  Combobox.combobox<(typeof frameworks)[number], Framework, Msg>({
    model: model.combobox,
    toParentMessage: message => State.GotComboboxMessage({ message }),
    items: frameworks,
    itemToValue: item => item.value,
    itemToLabel: item => item.label,
    placeholder: options.popup ? 'Search commands…' : 'Select framework…',
    ...(options.disabled ? { triggerClass: 'pointer-events-none opacity-50' } : options.clear ? { triggerClass: 'pr-10' } : {}),
    ...(options.groups ? { itemGroupKey: item => item.group, groupToHeading: group => group } : {}),
  })

type CommandItem = 'calendar' | 'search' | 'calculator' | 'profile' | 'settings'
const commandItems: ReadonlyArray<CommandItem> = ['calendar', 'search', 'calculator', 'profile', 'settings']
const commandPreview = (model: State.Model, options: Readonly<{ shortcuts?: boolean; groups?: boolean; scrollable?: boolean; rtl?: boolean }> = {}): Html =>
  h.div([...(options.rtl ? [h.Dir('rtl')] : []), h.Class(options.scrollable ? 'max-h-56 w-full max-w-md overflow-y-auto' : 'w-full max-w-md')], [
    CommandMenu.command({
      model: model.command,
      toParentMessage: message => State.GotCommandMessage({ message }),
      class: 'border shadow-md',
      items: commandItems,
      itemToConfig: item => ({ content: item[0]?.toUpperCase() + item.slice(1), ...(options.shortcuts ? { shortcut: item === 'settings' ? '⌘,' : '⌘K' } : {}) }),
      placeholder: 'Type a command or search…',
      ...(options.groups ? { itemGroupKey: item => ['profile', 'settings'].includes(item) ? 'Settings' : 'Suggestions', groupToHeading: group => group } : {}),
    }),
  ])

export const definitions: PageDefinitions = {
  alert: {
    description: 'Displays a callout for user attention.',
    composition: 'Alert\n├── AlertTitle\n├── AlertDescription\n└── AlertAction',
    examples: [
      basic('alert', 'Alert'),
      staticExample('Destructive', 'Alert', () => alertPreview('destructive')),
      staticExample('Action', 'Alert', () => alertPreview('default', true)),
      staticExample('Custom Colors', 'Alert', () => alertPreview('default', false, true)),
      staticExample('RTL', 'Alert', () => h.div([h.Dir('rtl')], [alertPreview('default')])),
    ],
  },
  'alert-dialog': {
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
    composition: 'AlertDialog\n├── Trigger\n├── Content\n│   ├── Header / Media / Title / Description\n│   └── Footer / Cancel / Action',
    examples: [
      basic('alert-dialog', 'AlertDialog'),
      statefulExample('Small', 'AlertDialog', model => alertDialogPreview(model, { size: 'sm' })),
      statefulExample('Media', 'AlertDialog', model => alertDialogPreview(model, { media: true })),
      statefulExample('Small with Media', 'AlertDialog', model => alertDialogPreview(model, { size: 'sm', media: true })),
      statefulExample('Destructive', 'AlertDialog', model => alertDialogPreview(model, { destructive: true })),
      statefulExample('RTL', 'AlertDialog', model => alertDialogPreview(model, { rtl: true })),
    ],
  },
  'aspect-ratio': {
    description: 'Displays content within a desired ratio.',
    examples: [
      basic('aspect-ratio', 'AspectRatio'),
      staticExample('Square', 'AspectRatio', () => aspectPreview(1, 'aspect-square')),
      staticExample('Portrait', 'AspectRatio', () => aspectPreview(3 / 4, 'max-w-xs')),
      staticExample('RTL', 'AspectRatio', () => h.div([h.Dir('rtl'), h.Class('w-full')], [aspectPreview(16 / 9, '')])),
    ],
  },
  attachment: {
    description: 'Displays a file or image attachment with media, metadata, upload state, and actions.',
    composition: 'Attachment\n├── AttachmentMedia\n├── AttachmentContent\n│   ├── AttachmentTitle\n│   └── AttachmentDescription\n└── AttachmentActions',
    examples: [
      basic('attachment', 'Attachment'),
      staticExample('Image', 'Attachment', () => Attachment.attachment({ state: 'done', children: [Attachment.attachmentMedia({ variant: 'image', children: [h.div([h.Class('size-full bg-gradient-to-br from-cyan-300 to-blue-500')], [])] }), Attachment.attachmentContent({ children: [Attachment.attachmentTitle({ children: ['mountains.jpg'] }), Attachment.attachmentDescription({ children: ['1.8 MB · Image'] })] })] })),
      staticExample('States', 'Attachment', () => stack(['uploading', 'processing', 'error', 'done'].map(state => attachmentPreview(state as Attachment.AttachmentState)))),
      staticExample('Sizes', 'Attachment', () => stack([attachmentPreview('done', 'sm'), attachmentPreview('done')])),
      staticExample('Group', 'Attachment', () => Attachment.attachmentGroup({ children: [attachmentPreview(), attachmentPreview('processing'), attachmentPreview('error')] })),
      staticExample('Trigger', 'Attachment', () => Attachment.attachmentTrigger({ label: 'Add attachment', onClick: clicked })),
    ],
  },
  avatar: {
    description: 'An image element with a fallback for representing the user.',
    composition: 'Avatar\n├── AvatarImage\n└── AvatarFallback',
    examples: [
      basic('avatar', 'Avatar'),
      staticExample('Badge', 'Avatar', () => h.div([h.Class('relative')], [avatar('CN', 'lg'), Badge.badge({ class: 'absolute -right-3 -bottom-2 px-1', children: ['New'] })])),
      staticExample('Badge with Icon', 'Avatar', () => h.div([h.Class('relative')], [avatar('CN', 'lg'), Badge.badge({ class: 'absolute -right-1 -bottom-1 size-4 rounded-full p-0', children: ['✓'] })])),
      staticExample('Avatar Group', 'Avatar', () => row([avatar('CN'), avatar('VC'), avatar('CN')], '-space-x-5 gap-0')),
      staticExample('Avatar Group Count', 'Avatar', () => row([avatar('CN'), avatar('VC'), Avatar.avatar({ children: [Avatar.avatarFallback({ children: ['+3'] })] })], '-space-x-5 gap-0')),
      staticExample('Avatar Group with Icon', 'Avatar', () => row([avatar('CN'), avatar('VC'), Avatar.avatar({ children: [Avatar.avatarFallback({ children: ['…'] })] })], '-space-x-5 gap-0')),
      staticExample('Sizes', 'Avatar', () => row([avatar('CN', 'sm'), avatar('CN'), avatar('CN', 'lg')])),
      statefulExample('Dropdown', 'Avatar', model => DropdownMenu.dropdownMenu({ model: model.dropdownMenu, toParentMessage: message => State.GotDropdownMenuMessage({ message }), trigger: avatar('CN', 'lg'), triggerClass: 'rounded-full', items: ['profile', 'billing', 'logout'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1), separatorBefore: item === 'logout' }) })),
      staticExample('RTL', 'Avatar', () => h.div([h.Dir('rtl')], [row([avatar('CN'), avatar('VC')])])),
    ],
  },
  badge: {
    description: 'Displays a badge or a component that looks like a badge.',
    examples: [
      basic('badge', 'Badge'),
      staticExample('Variants', 'Badge', () => row([Badge.badge({ children: ['Default'] }), Badge.badge({ variant: 'secondary', children: ['Secondary'] }), Badge.badge({ variant: 'outline', children: ['Outline'] }), Badge.badge({ variant: 'destructive', children: ['Destructive'] })])),
      staticExample('With Icon', 'Badge', () => Badge.badge({ children: ['✓', 'Verified'] })),
      staticExample('With Spinner', 'Badge', () => Badge.badge({ variant: 'secondary', children: [Spinner.spinner({ class: 'size-3' }), 'Syncing'] })),
      staticExample('Link', 'Badge', () => Badge.badge({ variant: 'outline', children: ['View documentation', '↗'] })),
      staticExample('Custom Colors', 'Badge', () => row([Badge.badge({ class: 'border-transparent bg-blue-500 text-white', children: ['Blue'] }), Badge.badge({ class: 'border-transparent bg-emerald-500 text-white', children: ['Green'] })])),
      staticExample('RTL', 'Badge', () => h.div([h.Dir('rtl')], [Badge.badge({ children: ['تم التحقق', '✓'] })])),
    ],
  },
  breadcrumb: {
    description: 'Displays the path to the current resource using a hierarchy of links.',
    composition: 'Breadcrumb\n└── BreadcrumbList\n    ├── BreadcrumbItem / BreadcrumbLink / BreadcrumbPage\n    ├── BreadcrumbSeparator\n    └── BreadcrumbEllipsis',
    examples: [
      basic('breadcrumb', 'Breadcrumb'),
      staticExample('Custom separator', 'Breadcrumb', () => breadcrumbPreview('›')),
      statefulExample('Dropdown', 'Breadcrumb', model => row([breadcrumbPreview(), DropdownMenu.dropdownMenu({ model: model.dropdownMenu, toParentMessage: message => State.GotDropdownMenuMessage({ message }), trigger: 'More', triggerClass: 'rounded-md border px-2 py-1 text-sm', items: ['documentation', 'themes', 'github'], itemToConfig: item => ({ label: item[0]?.toUpperCase() + item.slice(1) }) })])),
      staticExample('Collapsed', 'Breadcrumb', () => breadcrumbPreview('/', true)),
      staticExample('Link component', 'Breadcrumb', () => breadcrumbPreview('→')),
      staticExample('RTL', 'Breadcrumb', () => h.div([h.Dir('rtl')], [breadcrumbPreview('‹')])),
    ],
  },
  button: {
    description: 'Displays a button or a component that looks like a button.',
    examples: [
      basic('button', 'Button'),
      staticExample('Size', 'Button', () => row([Button.button({ size: 'sm', onClick: clicked, children: ['Small'] }), Button.button({ onClick: clicked, children: ['Default'] }), Button.button({ size: 'lg', onClick: clicked, children: ['Large'] })])),
      staticExample('Default', 'Button', () => buttonPreview('default', 'Button')),
      staticExample('Outline', 'Button', () => buttonPreview('outline', 'Outline')),
      staticExample('Secondary', 'Button', () => buttonPreview('secondary', 'Secondary')),
      staticExample('Ghost', 'Button', () => buttonPreview('ghost', 'Ghost')),
      staticExample('Destructive', 'Button', () => buttonPreview('destructive', 'Delete')),
      staticExample('Link', 'Button', () => buttonPreview('link', 'Learn more')),
      staticExample('Icon', 'Button', () => Button.button({ size: 'icon', onClick: clicked, children: ['＋'] })),
      staticExample('With Icon', 'Button', () => Button.button({ onClick: clicked, children: ['✉', 'Login with Email'] })),
      staticExample('Rounded', 'Button', () => buttonPreview('default', 'Rounded', 'rounded-full')),
      staticExample('Spinner', 'Button', () => Button.button({ isDisabled: true, children: [Spinner.spinner({ class: 'size-4' }), 'Please wait'] })),
      staticExample('Button Group', 'Button', () => ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Back'), buttonPreview('outline', 'Next')] })),
      staticExample('As Link', 'Button', () => buttonPreview('link', 'Open documentation ↗')),
      staticExample('RTL', 'Button', () => h.div([h.Dir('rtl')], [Button.button({ onClick: clicked, children: ['التالي', '←'] })])),
    ],
  },
  'button-group': {
    description: 'A container that groups related buttons together with consistent styling.',
    composition: 'ButtonGroup\n├── Button / Input / Select\n├── ButtonGroupSeparator\n└── ButtonGroupText',
    examples: [
      basic('button-group', 'ButtonGroup'),
      staticExample('Orientation', 'ButtonGroup', () => row([ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Left'), buttonPreview('outline', 'Center'), buttonPreview('outline', 'Right')] }), ButtonGroup.buttonGroup({ orientation: 'vertical', children: [buttonPreview('outline', 'Top'), buttonPreview('outline', 'Middle'), buttonPreview('outline', 'Bottom')] })])),
      staticExample('Size', 'ButtonGroup', () => stack([ButtonGroup.buttonGroup({ children: [Button.button({ size: 'sm', variant: 'outline', onClick: clicked, children: ['One'] }), Button.button({ size: 'sm', variant: 'outline', onClick: clicked, children: ['Two'] })] }), ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'One'), buttonPreview('outline', 'Two')] })])),
      staticExample('Nested', 'ButtonGroup', () => ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Save'), ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Undo'), buttonPreview('outline', 'Redo')] })] })),
      staticExample('Separator', 'ButtonGroup', () => ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Copy'), ButtonGroup.buttonGroupSeparator(), buttonPreview('outline', 'Paste')] })),
      staticExample('Split', 'ButtonGroup', () => ButtonGroup.buttonGroup({ children: [buttonPreview('default', 'Create'), Button.button({ onClick: clicked, children: ['⌄'] })] })),
      statefulExample('Input', 'ButtonGroup', model => ButtonGroup.buttonGroup({ class: 'w-full max-w-sm', children: [ButtonGroup.buttonGroupText({ children: ['@'] }), Input.input({ id: 'button-group-input', value: model.inputGroup, onInput: value => State.ChangedText({ target: 'inputGroup', value }), placeholder: 'username' })] })),
      statefulExample('Input Group', 'ButtonGroup', model => ButtonGroup.buttonGroup({ class: 'w-full max-w-sm', children: [InputGroup.inputGroup({ children: [InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['https://'] })] }), InputGroup.inputGroupInput({ id: 'button-group-url', value: model.inputGroup, onInput: value => State.ChangedText({ target: 'inputGroup', value }), placeholder: 'example.com' })] }), Button.button({ onClick: clicked, children: ['Go'] })] })),
      statefulExample('Dropdown Menu', 'ButtonGroup', model => ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Save'), DropdownMenu.dropdownMenu({ model: model.dropdownMenu, toParentMessage: message => State.GotDropdownMenuMessage({ message }), trigger: '⌄', triggerClass: 'rounded-md border px-3', items: ['save-as', 'export'], itemToConfig: item => ({ label: item === 'save-as' ? 'Save as…' : 'Export' }) })] })),
      statefulExample('Select', 'ButtonGroup', model => ButtonGroup.buttonGroup({ children: [ButtonGroup.buttonGroupText({ children: ['Framework'] }), Select.select({ model: model.select, toParentMessage: message => State.GotSelectMessage({ message }), items: [{ value: 'apple', label: 'Next.js' }, { value: 'banana', label: 'SvelteKit' }], itemToValue: item => item.value, itemToLabel: item => item.label })] })),
      statefulExample('Popover', 'ButtonGroup', model => ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'Share'), Popover.popover({ model: model.popover, toParentMessage: message => State.GotPopoverMessage({ message }), trigger: 'Options', triggerClass: 'rounded-md border px-3 text-sm', content: 'Anyone with the link can view.' })] })),
      staticExample('RTL', 'ButtonGroup', () => h.div([h.Dir('rtl')], [ButtonGroup.buttonGroup({ children: [buttonPreview('outline', 'السابق'), buttonPreview('outline', 'التالي')] })])),
    ],
  },
  bubble: {
    description: 'Displays conversational content in a message bubble. Supports variants, alignment, grouping, reactions, and collapsible content.',
    composition: 'BubbleGroup\n└── Bubble\n    ├── BubbleContent\n    └── BubbleReactions',
    examples: [
      basic('bubble', 'Bubble'),
      staticExample('Variants', 'Bubble', () => stack([bubblePreview(), bubblePreview('tinted'), bubblePreview('outline')])),
      staticExample('Alignment', 'Bubble', () => Bubble.bubbleGroup({ children: [bubblePreview('default', 'start'), bubblePreview('tinted', 'end', 'Show me how it works.')] })),
      staticExample('Bubble Group', 'Bubble', () => Bubble.bubbleGroup({ children: [bubblePreview('default', 'start', 'First message'), bubblePreview('default', 'start', 'A related follow-up'), bubblePreview('tinted', 'end', 'Thanks!')] })),
      staticExample('Links and Buttons', 'Bubble', () => Bubble.bubble({ children: [Bubble.bubbleContent({ children: ['Read the guide ', Button.button({ variant: 'link', size: 'sm', onClick: clicked, children: ['Documentation'] })] })] })),
      staticExample('Reactions', 'Bubble', () => Bubble.bubble({ children: [Bubble.bubbleContent({ children: ['Was this helpful?'] }), Bubble.bubbleReactions({ children: [Button.button({ variant: 'outline', size: 'sm', onClick: clicked, children: ['👍 12'] }), Button.button({ variant: 'outline', size: 'sm', onClick: clicked, children: ['👎'] })] })] })),
      statefulExample('Show More / Collapsible', 'Bubble', model => Bubble.bubble({ children: [Bubble.bubbleContent({ children: [Collapsible.collapsible({ model: model.collapsible, toParentMessage: message => State.GotCollapsibleMessage({ message }), trigger: 'Show more', triggerClass: 'font-medium underline underline-offset-4', content: 'Here is the rest of this longer conversational response.', contentClass: 'mt-2' })] })] })),
      statefulExample('Tooltip', 'Bubble', model => Bubble.bubble({ children: [Bubble.bubbleContent({ children: ['Hover over the reaction.'] }), Bubble.bubbleReactions({ children: [Tooltip.tooltip({ model: model.tooltip, toParentMessage: message => State.GotTooltipMessage({ message }), trigger: '👍', triggerClass: 'rounded-md border px-2 py-1', content: 'Helpful' })] })] })),
      statefulExample('Popover', 'Bubble', model => Bubble.bubble({ children: [Bubble.bubbleContent({ children: ['Open message actions.'] }), Bubble.bubbleReactions({ children: [Popover.popover({ model: model.popover, toParentMessage: message => State.GotPopoverMessage({ message }), trigger: '•••', triggerClass: 'rounded-md border px-2 py-1', content: 'Copy · Reply · Delete' })] })] })),
    ],
  },
  carousel: {
    description: 'A carousel with motion and swipe built using Embla.',
    composition: 'Carousel\n├── CarouselContent\n│   └── CarouselItem\n├── CarouselPrevious\n└── CarouselNext',
    examples: [
      basic('carousel', 'Carousel'),
      statefulExample('Sizes', 'Carousel', model => carouselPreview(model, { compact: true })),
      statefulExample('Spacing', 'Carousel', model => carouselPreview(model, { spacing: true })),
      statefulExample('Orientation', 'Carousel', model => carouselPreview(model, { orientation: 'vertical' })),
      statefulExample('API', 'Carousel', model => stack([carouselPreview(model), h.p([h.Class('text-center text-sm text-muted-foreground')], [`Slide ${model.carousel.index + 1} of ${model.carousel.count}`])])),
      statefulExample('Plugins', 'Carousel', model => carouselPreview(model), 'Use the same Foldkit messages to compose autoplay or other application-level behavior.'),
      statefulExample('RTL', 'Carousel', model => h.div([h.Dir('rtl'), h.Class('w-full')], [carouselPreview(model)])),
    ],
  },
  card: {
    description: 'Displays a card with header, content, and footer.',
    composition: 'Card\n├── CardHeader\n│   ├── CardTitle\n│   ├── CardDescription\n│   └── CardAction\n├── CardContent\n└── CardFooter',
    examples: [
      basic('card', 'Card'),
      staticExample('Size', 'Card', () => cardPreview({ small: true })),
      statefulExample('Spacing', 'Card', model => Card.card({ class: 'w-full max-w-sm gap-8 py-8', children: [Card.cardHeader({ class: 'px-8', children: [Card.cardTitle({ children: ['Sign in'] }), Card.cardDescription({ children: ['Use custom spacing without changing the composition.'] })] }), Card.cardContent({ class: 'px-8', children: [Input.input({ id: 'card-spacing-email', value: model.cardEmail, onInput: value => State.ChangedText({ target: 'cardEmail', value }), placeholder: 'm@example.com' })] }), Card.cardFooter({ class: 'px-8', children: [Button.button({ class: 'w-full', onClick: clicked, children: ['Continue'] })] })] })),
      staticExample('Edge to Edge', 'Card', () => cardPreview({ edge: true })),
      staticExample('Image', 'Card', () => cardPreview({ image: true })),
      staticExample('RTL', 'Card', () => h.div([h.Dir('rtl'), h.Class('w-full')], [cardPreview({ rtl: true })])),
    ],
  },
  chart: {
    description: 'Beautiful charts. Built using Recharts. Copy and paste into your apps.',
    examples: [
      basic('chart', 'Chart'),
      staticExample('Your First Chart', 'Chart', () => Chart.barChart({ data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }] })),
      staticExample('Add a Grid', 'Chart', () => Chart.barChart({ class: 'rounded-lg border bg-card p-4', data: [{ label: 'Jan', value: 186 }, { label: 'Feb', value: 305 }, { label: 'Mar', value: 237 }] })),
      staticExample('Add an Axis', 'Chart', () => Chart.areaChart({ data: [86, 205, 137, 173] })),
      staticExample('Add Tooltip', 'Chart', () => Chart.areaChart({ class: 'rounded-lg border p-4', data: [120, 210, 160] })),
      staticExample('Add Legend', 'Chart', () => stack([Chart.barChart({ data: [{ label: 'Desktop', value: 275 }, { label: 'Mobile', value: 200 }] }), row([Badge.badge({ children: ['Desktop'] }), Badge.badge({ variant: 'secondary', children: ['Mobile'] })])])),
      staticExample('Tooltip', 'Chart', () => Chart.areaChart({ data: [186, 305, 237] })),
      staticExample('RTL', 'Chart', () => h.div([h.Dir('rtl'), h.Class('w-full')], [Chart.barChart({ data: [{ label: 'يناير', value: 186 }, { label: 'فبراير', value: 305 }, { label: 'مارس', value: 237 }] })])),
    ],
  },
  checkbox: {
    description: 'A control that allows the user to toggle between checked and not checked.',
    examples: [
      basic('checkbox', 'Checkbox'),
      statefulExample('Invalid State', 'Checkbox', model => checkboxPreview(model, { invalid: true, label: 'Accept the terms to continue' })),
      statefulExample('Description', 'Checkbox', model => checkboxPreview(model, { description: true })),
      statefulExample('Disabled', 'Checkbox', model => checkboxPreview(model, { disabled: true, label: 'Enable notifications' })),
      statefulExample('Group', 'Checkbox', model => stack([checkboxPreview(model, { label: 'Email', instance: 'email' }), checkboxPreview(model, { label: 'SMS', instance: 'sms' }), checkboxPreview(model, { label: 'Push notifications', instance: 'push' })])),
      statefulExample('Table', 'Checkbox', model => h.div([h.Class('w-full max-w-md overflow-hidden rounded-md border')], [h.div([h.Class('grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b p-3 font-medium')], [checkboxPreview(model, { label: 'Select all', instance: 'all' }), 'Status']), h.div([h.Class('grid grid-cols-[auto_1fr] items-center gap-4 p-3')], [checkboxPreview(model, { label: 'Invoice #001', instance: 'invoice' }), Badge.badge({ children: ['Paid'] })])])),
      statefulExample('RTL', 'Checkbox', model => h.div([h.Dir('rtl')], [checkboxPreview(model, { description: true, label: 'قبول الشروط والأحكام' })])),
    ],
  },
  collapsible: {
    description: 'An interactive component which expands/collapses a panel.',
    composition: 'Collapsible\n├── CollapsibleTrigger\n└── CollapsibleContent',
    examples: [
      basic('collapsible', 'Collapsible'),
      statefulExample('Settings Panel', 'Collapsible', model => collapsiblePreview(model, 'settings')),
      statefulExample('File Tree', 'Collapsible', model => collapsiblePreview(model, 'tree')),
      statefulExample('RTL', 'Collapsible', model => h.div([h.Dir('rtl'), h.Class('w-full')], [collapsiblePreview(model)])),
    ],
  },
  combobox: {
    description: 'Autocomplete input with a list of suggestions.',
    composition: 'Combobox\n├── ComboboxInput / Trigger\n├── ComboboxContent\n└── ComboboxItem / Group',
    examples: [
      basic('combobox', 'Combobox'),
      statefulExample('Multiple', 'Combobox', model => stack([comboboxPreview(model), row([Badge.badge({ children: ['Next.js'] }), Badge.badge({ variant: 'secondary', children: ['SvelteKit'] })])]), 'Selected values are represented as removable badges while the combobox remains searchable.'),
      statefulExample('Clear Button', 'Combobox', model => row([comboboxPreview(model, { clear: true }), Button.button({ variant: 'ghost', size: 'sm', onClick: clicked, children: ['Clear'] })])),
      statefulExample('Groups', 'Combobox', model => comboboxPreview(model, { groups: true })),
      statefulExample('Custom Items', 'Combobox', model => comboboxPreview(model, { groups: true })),
      statefulExample('Invalid', 'Combobox', model => h.div([h.Class('w-full max-w-sm rounded-md ring-2 ring-destructive/30')], [comboboxPreview(model)])),
      statefulExample('Disabled', 'Combobox', model => comboboxPreview(model, { disabled: true })),
      statefulExample('Auto Highlight', 'Combobox', model => comboboxPreview(model)),
      statefulExample('Popup', 'Combobox', model => comboboxPreview(model, { popup: true })),
      statefulExample('Input Group', 'Combobox', model => InputGroup.inputGroup({ class: 'w-full max-w-sm', children: [InputGroup.inputGroupAddon({ children: [InputGroup.inputGroupText({ children: ['⌕'] })] }), comboboxPreview(model)] })),
      statefulExample('RTL', 'Combobox', model => h.div([h.Dir('rtl'), h.Class('w-full')], [comboboxPreview(model, { groups: true })])),
    ],
  },
  command: {
    description: 'Command menu for search and quick actions.',
    composition: 'Command\n├── CommandInput\n├── CommandList / Empty / Group / Separator\n└── CommandItem / Shortcut',
    examples: [
      basic('command', 'Command'),
      statefulExample('Shortcuts', 'Command', model => commandPreview(model, { shortcuts: true })),
      statefulExample('Groups', 'Command', model => commandPreview(model, { groups: true })),
      statefulExample('Scrollable', 'Command', model => commandPreview(model, { scrollable: true, groups: true })),
      statefulExample('RTL', 'Command', model => commandPreview(model, { rtl: true, shortcuts: true })),
    ],
  },
}

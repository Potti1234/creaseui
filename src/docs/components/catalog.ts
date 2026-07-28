import { type Html, html } from 'foldkit/html'

import {
  componentPage,
  componentTitle,
  example,
} from '@/docs/component-page'

const descriptions: Readonly<Record<string, string>> = {
  alert: 'Displays a callout for important contextual information.',
  'alert-dialog': 'A modal dialog that interrupts the user with important content and expects a response.',
  'aspect-ratio': 'Displays content within a desired ratio.',
  attachment: 'Displays files, uploads, and processing state in a compact attachment surface.',
  avatar: 'An image element with a fallback for representing a user.',
  badge: 'Displays a badge or a component that looks like a badge.',
  breadcrumb: 'Displays the path to the current resource using a hierarchy of links.',
  button: 'Displays a button or a component that looks like a button.',
  'button-group': 'Groups related buttons with connected visual treatment.',
  bubble: 'Displays conversational content in aligned message bubbles.',
  calendar: 'A date field component that allows users to enter and edit dates.',
  carousel: 'A keyboard-accessible carousel with horizontal and vertical layouts.',
  card: 'Displays a card with header, content, and footer.',
  chart: 'Beautiful charts built with Apache ECharts and Foldkit.',
  checkbox: 'A control that allows the user to toggle between checked and unchecked.',
  collapsible: 'An interactive component which expands and collapses a panel.',
  combobox: 'An autocomplete input and command palette with a list of suggestions.',
  command: 'A fast, composable command menu for Foldkit applications.',
  'context-menu': 'Displays a menu of actions at a contextual trigger.',
  'data-table': 'Powerful tabular data with filtering, sorting, and pagination.',
  'date-picker': 'A date picker composed from a trigger, popover, and calendar.',
  dialog: 'A window overlaid on the primary window, rendering the content underneath inert.',
  direction: 'Scopes left-to-right or right-to-left document direction.',
  drawer: 'A panel that slides from an edge of the screen.',
  'dropdown-menu': 'Displays a menu to the user triggered by a button.',
  empty: 'An empty state for unavailable or not-yet-created content.',
  field: 'Composes labels, controls, descriptions, and validation messages.',
  form: 'Builds accessible forms from Foldkit state, validation, and field primitives.',
  'hover-card': 'A preview card revealed from an interactive trigger.',
  input: 'Displays a form input field.',
  'input-group': 'Adds icons, buttons, and text around an input.',
  'input-otp': 'An accessible one-time password input with individually styled slots.',
  item: 'A flexible row for displaying content, media, and actions.',
  kbd: 'Displays keyboard input using a compact key treatment.',
  label: 'Renders an accessible label associated with a control.',
  marker: 'Labels or separates a point in a stream of content.',
  message: 'Composes avatars, metadata, content, and footers for conversations.',
  'message-scroller': 'Keeps long conversations scrollable and provides controls for jumping to either edge.',
  menubar: 'A persistent horizontal set of application menus with keyboard-aware menu behavior.',
  'native-select': 'A styled native select control.',
  'navigation-menu': 'A collection of links and disclosures for navigating a website.',
  pagination: 'Pagination with page and navigation links.',
  popover: 'Displays rich content in a portal, triggered by a button.',
  progress: 'Displays an indicator showing task completion.',
  'radio-group': 'A set of checkable buttons where only one can be selected.',
  resizable: 'Accessible two-panel layouts with pointer and keyboard resizing.',
  'scroll-area': 'Augments native scrolling with a consistent viewport treatment.',
  select: 'Displays a list of options for the user to pick from.',
  separator: 'Visually or semantically separates content.',
  sheet: 'Extends Dialog with content anchored to an edge of the screen.',
  sidebar: 'A composable, responsive application sidebar system.',
  skeleton: 'A placeholder used while content is loading.',
  slider: 'An input where the user selects a value from a range.',
  sonner: 'An opinionated toast notification component.',
  spinner: 'An animated indicator for indeterminate progress.',
  switch: 'A control that toggles between checked and unchecked.',
  table: 'A responsive table component.',
  tabs: 'Layered sections of content displayed one at a time.',
  textarea: 'Displays a multiline text input.',
  toast: 'A succinct notification surface backed by the Foldkit toast state machine.',
  toggle: 'A two-state button that can be on or off.',
  'toggle-group': 'A set of two-state buttons with shared styling.',
  tooltip: 'A popup that displays information related to an element on hover or focus.',
  typography: 'Consistent prose styles for headings, paragraphs, quotes, and inline code.',
}

export const hasCatalogPage = (slug: string): boolean =>
  componentTitle(slug) !== undefined

export const titleFor = componentTitle

export const view = (slug: string): Html => {
  const name = componentTitle(slug) ?? slug
  const description = descriptions[slug] ?? `The Crease UI ${name} component.`

  return componentPage<never>({
    name,
    description,
    installation: `npx shadcn@latest add Potti1234/creaseui/${slug}`,
    usage: usageFor(slug, name),
    composition: `${name}\n├── Model / init / update\n├── ${primaryExport(slug)} view\n└── Source-owned styles and composition`,
    examples: [
      example<never>({
        title: 'Basic',
        description: `A representative ${name} composition using the default Crease UI theme.`,
        preview: previewFor(slug, name),
        code: `import * as ${name.replaceAll(' ', '')} from '@/ui/${slug}'\n\n// The installed source is yours to compose and edit.`,
        previewClass: 'min-h-48',
      }),
    ],
    apiHref: 'https://foldkit.dev/ui/overview',
    apiDescription: `${name} is source-owned after installation. Its public model, messages, update function, and view helpers are documented directly in the installed TypeScript source.`,
  })
}

const exportOverrides: Readonly<Record<string, string>> = {
  'alert-dialog': 'alertDialog', 'aspect-ratio': 'aspectRatio', 'button-group': 'buttonGroup',
  'context-menu': 'contextMenu', 'data-table': 'dataTable', 'date-picker': 'datePicker',
  chart: 'barChart',
  'dropdown-menu': 'dropdownMenu', 'hover-card': 'hoverCard', 'input-group': 'inputGroup',
  'input-otp': 'inputOtp', 'message-scroller': 'messageScroller', 'native-select': 'nativeSelect',
  'navigation-menu': 'navigationMenu', 'radio-group': 'radioGroup', 'scroll-area': 'scrollArea',
  'toggle-group': 'toggleGroup', typography: 'typographyH1',
  switch: 'switchControl',
}

const primaryExport = (slug: string): string =>
  exportOverrides[slug] ?? slug.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())

const usageFor = (slug: string, name: string): string => {
  const namespace = name.replaceAll(' ', '')
  return `import * as ${namespace} from '@/ui/${slug}'\n\n${namespace}.${primaryExport(slug)}({\n  // Pass model, messages, and content as described by the source types.\n})`
}

const previewFor = (slug: string, name: string): Html => {
  const h = html<never>()

  if (slug === 'typography') return h.article([h.Class('max-w-lg space-y-3')], [
    h.h2([h.Class('text-3xl font-semibold tracking-tight')], ['The Joke Tax Chronicles']),
    h.p([h.Class('text-muted-foreground')], ['Once upon a time, in a far-off land, there was a very lazy king.']),
    h.blockquote([h.Class('border-l-2 pl-4 italic')], ['After all, he thought, why should he have to work?']),
  ])

  if (new Set(['button', 'button-group', 'checkbox', 'radio-group', 'slider', 'switch', 'toggle', 'toggle-group']).has(slug)) {
    return h.div([h.Class('flex flex-wrap items-center gap-3')], [
      h.button([h.Type('button'), h.Class('inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs')], [name]),
      h.button([h.Type('button'), h.Class('inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs')], ['Secondary']),
    ])
  }

  if (new Set(['field', 'form', 'input', 'input-group', 'input-otp', 'label', 'native-select', 'select', 'textarea', 'combobox', 'command', 'date-picker']).has(slug)) {
    return h.div([h.Class('grid w-full max-w-sm gap-2')], [
      h.label([h.For(`preview-${slug}`), h.Class('text-sm font-medium')], [name]),
      h.input([h.Id(`preview-${slug}`), h.Placeholder(`Enter ${name.toLowerCase()}…`), h.Class('h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50')]),
      h.p([h.Class('text-sm text-muted-foreground')], ['Clear labels and connected validation keep controls accessible.']),
    ])
  }

  if (new Set(['alert-dialog', 'context-menu', 'dialog', 'drawer', 'dropdown-menu', 'hover-card', 'menubar', 'popover', 'sheet', 'tooltip']).has(slug)) {
    return h.div([h.Class('relative flex min-h-36 w-full max-w-md items-start justify-center')], [
      h.button([h.Type('button'), h.Class('h-9 rounded-md border bg-background px-4 text-sm font-medium shadow-xs')], [`Open ${name}`]),
      h.div([h.Class('absolute top-14 w-56 rounded-md border bg-popover p-3 text-popover-foreground shadow-md')], [h.p([h.Class('text-sm font-medium')], [name]), h.p([h.Class('mt-1 text-xs leading-5 text-muted-foreground')], ['Focused, dismissible content positioned relative to its trigger.'])]),
    ])
  }

  if (new Set(['accordion', 'breadcrumb', 'collapsible', 'navigation-menu', 'pagination', 'sidebar', 'tabs']).has(slug)) {
    return h.nav([h.AriaLabel(`${name} preview`), h.Class('flex w-full max-w-lg items-center gap-1 rounded-md border p-1')], ['Overview', 'Components', 'Examples'].map((label, index) => h.a([h.Href('#'), h.Class(index === 0 ? 'rounded-sm bg-muted px-3 py-2 text-sm font-medium' : 'rounded-sm px-3 py-2 text-sm text-muted-foreground')], [label])))
  }

  if (new Set(['alert', 'empty', 'progress', 'skeleton', 'sonner', 'spinner', 'toast']).has(slug)) {
    return h.div([h.Class('w-full max-w-md rounded-lg border bg-background p-4 shadow-sm')], [
      h.div([h.Class('flex items-center gap-3')], [h.div([h.Class(slug === 'spinner' ? 'size-5 animate-spin rounded-full border-2 border-muted border-t-foreground' : 'size-9 rounded-full bg-muted')], []), h.div([h.Class('flex-1 space-y-1')], [h.p([h.Class('text-sm font-medium')], [name]), h.p([h.Class('text-sm text-muted-foreground')], ['Your changes have been saved successfully.'])])]),
      ...(slug === 'progress' ? [h.div([h.Class('mt-4 h-2 overflow-hidden rounded-full bg-muted')], [h.div([h.Class('h-full w-2/3 bg-primary')], [])])] : []),
    ])
  }

  if (new Set(['calendar', 'carousel', 'chart', 'data-table', 'table']).has(slug)) {
    return h.div([h.Class('w-full max-w-lg overflow-hidden rounded-lg border')], [
      h.div([h.Class('grid grid-cols-3 border-b bg-muted/50 px-4 py-2 text-xs font-medium')], ['Name', 'Status', 'Value'].map(value => h.span([], [value]))),
      ...['Alpha', 'Beta', 'Gamma'].map((value, index) => h.div([h.Class('grid grid-cols-3 px-4 py-3 text-sm not-last:border-b')], [value, index === 1 ? 'Pending' : 'Active', `${(index + 1) * 24}%`].map(cell => h.span([], [cell])))),
    ])
  }

  if (new Set(['attachment', 'avatar', 'bubble', 'marker', 'message', 'message-scroller']).has(slug)) {
    return h.div([h.Class('flex w-full max-w-md items-start gap-3')], [
      h.div([h.Class('flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium')], ['CU']),
      h.div([h.Class('rounded-2xl rounded-tl-sm bg-muted px-4 py-3')], [h.p([h.Class('text-sm font-medium')], [name]), h.p([h.Class('mt-1 text-sm text-muted-foreground')], ['Conversational content with supporting metadata.'])]),
    ])
  }

  return h.div([h.Class('w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm')], [
    h.p([h.Class('text-lg font-semibold')], [name]),
    h.p([h.Class('mt-2 text-sm leading-6 text-muted-foreground')], [descriptions[slug] ?? `The Crease UI ${name} component.`]),
  ])
}

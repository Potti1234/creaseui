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
  card: 'Displays a card with header, content, and footer.',
  chart: 'Beautiful charts built with Apache ECharts and Foldkit.',
  checkbox: 'A control that allows the user to toggle between checked and unchecked.',
  collapsible: 'An interactive component which expands and collapses a panel.',
  combobox: 'An autocomplete input and command palette with a list of suggestions.',
  command: 'A fast, composable command menu for Foldkit applications.',
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
  'native-select': 'A styled native select control.',
  pagination: 'Pagination with page and navigation links.',
  popover: 'Displays rich content in a portal, triggered by a button.',
  progress: 'Displays an indicator showing task completion.',
  'radio-group': 'A set of checkable buttons where only one can be selected.',
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
  toggle: 'A two-state button that can be on or off.',
  'toggle-group': 'A set of two-state buttons with shared styling.',
  tooltip: 'A popup that displays information related to an element on hover or focus.',
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
    usage: `import * as ${name.replaceAll(' ', '')} from '@/ui/${slug}'`,
    examples: [
      example<never>({
        title: 'Source-owned',
        description:
          'The shadcn CLI copies this component into your Foldkit application. You can inspect, edit, and compose the installed source directly.',
        preview: componentPageNotice(name),
        code: `npx shadcn@latest view Potti1234/creaseui/${slug}`,
        previewClass: 'min-h-48',
      }),
    ],
    apiHref: 'https://foldkit.dev/ui/overview',
  })
}

const componentPageNotice = (name: string): Html => {
  const h = html<never>()

  return h.div(
    [h.Class('max-w-md space-y-2 text-center')],
    [
      h.p([h.Class('text-sm font-medium')], [`${name} is available from the registry.`]),
      h.p(
        [h.Class('text-sm leading-6 text-muted-foreground')],
        ['Live examples and detailed API notes are being verified against the current shadcn reference.'],
      ),
    ],
  )
}

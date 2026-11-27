import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Command, Dialog, Icon } from '#components'
import type { IconName } from '../../behaviors/icon'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Item = {
  value: string
  icon?: IconName
  keys?: string
  group: string
}
const basicItems: readonly Item[] = [
  { value: 'Calendar', icon: 'calendar', group: 'Suggestions' },
  { value: 'Search Emoji', icon: 'smile', group: 'Suggestions' },
  { value: 'Calculator', icon: 'calculator', group: 'Suggestions' },
]
const shortcutItems: readonly Item[] = [
  { value: 'Profile', icon: 'user', keys: 'mod+P', group: 'Settings' },
  { value: 'Billing', icon: 'credit-card', keys: 'mod+B', group: 'Settings' },
  { value: 'Settings', icon: 'settings', keys: 'mod+S', group: 'Settings' },
]
const groupItems: readonly Item[] = [...basicItems, ...shortcutItems]
const scrollableItems: readonly Item[] = [
  { value: 'Home', icon: 'house', keys: 'mod+H', group: 'Navigation' },
  { value: 'Inbox', icon: 'inbox', group: 'Navigation' },
  { value: 'Search', icon: 'search', keys: 'mod+F', group: 'Navigation' },
  { value: 'Files', icon: 'folder', group: 'Navigation' },
  { value: 'Images', icon: 'image', group: 'Navigation' },
  { value: 'Music', icon: 'music', group: 'Navigation' },
  { value: 'Videos', icon: 'video', group: 'Navigation' },
  { value: 'Documents', icon: 'file-text', group: 'Navigation' },
  { value: 'Downloads', icon: 'download', group: 'Navigation' },
  { value: 'Trash', icon: 'trash-2', group: 'Navigation' },
  {
    value: 'New Folder',
    icon: 'folder-plus',
    keys: 'mod+shift+N',
    group: 'Actions',
  },
  {
    value: 'Copy Path',
    icon: 'clipboard',
    keys: 'mod+shift+C',
    group: 'Actions',
  },
  { value: 'Paste', icon: 'clipboard-paste', keys: 'mod+V', group: 'Actions' },
]
const rtlItems: readonly Item[] = [
  { value: 'التقويم', icon: 'calendar', group: 'اقتراحات' },
  { value: 'بحث عن إيموجي', icon: 'smile', group: 'اقتراحات' },
  { value: 'الآلة الحاسبة', icon: 'calculator', group: 'اقتراحات' },
]
const itemsFor = (kind: string) =>
  kind === 'shortcuts'
    ? shortcutItems
    : kind === 'groups'
      ? groupItems
      : kind === 'scrollable'
        ? scrollableItems
        : kind === 'rtl'
          ? rtlItems
          : basicItems

const apple = () =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/u.test(navigator.platform || navigator.userAgent)
const shortcut = (keys: string) => {
  const parts = keys.split('+').map(part => {
    if (part === 'mod') return apple() ? '⌘' : 'Ctrl'
    if (part === 'shift') return apple() ? '⇧' : 'Shift'
    return part.length === 1 ? part.toUpperCase() : part
  })
  return `\u2066${parts.join(apple() ? '' : '+')}\u2069`
}

const Message = UiSchema.TaggedEnum({
  OpenedDialog: {},
  ClosedDialog: {},
  PickedCommand: { value: Schema.String },
})
const CommandDemo = Html.component({
  name: 'DocsCommandDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    open: Schema.Boolean,
    value: Schema.NullOr(Schema.String),
  }),
  message: Message,
}).make({
  init: () => ({ open: false, value: null }),
  update: {
    OpenedDialog: $ => $.evolve({ open: true }),
    ClosedDialog: $ => $.evolve({ open: false }),
    PickedCommand: ($, { value }) => $.evolve({ open: false, value }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const rtl = kind === 'rtl'
    const items = itemsFor(kind)
    const palette = Command(h, {
      key: `${h.props.idPrefix}-palette`,
      placeholder: rtl ? 'اكتب أمرًا أو ابحث...' : 'Type a command or search...',
      label: rtl ? 'قائمة الأوامر' : 'Command menu',
      emptyContent: 'No results found.',
      groupHeading: group => group,
      decorateItem: item => {
        const source = items.find(entry => entry.value === item.value)
        return {
          ...(source?.icon === undefined
            ? {}
            : { leadingContent: Icon(h, { name: source.icon, size: 'sm' }) }),
          ...(source?.keys === undefined
            ? {}
            : { shortcut: shortcut(source.keys), keys: source.keys }),
        }
      },
      props: {
        items: items.map(item => ({
          value: item.value,
          label: item.value,
          group: item.group,
        })),
        value: model.value,
        ...(rtl ? { dir: 'rtl' as const } : {}),
      },
      onEmit: {
        Edited: () => undefined,
        Picked: ({ value }) => Message.PickedCommand({ value }),
      },
    })
    return h.div
      .attrs({ dir: rtl ? 'rtl' : undefined })
      .class('flex flex-col gap-4')
      .children(
        Dialog(h, {
          key: `${h.props.idPrefix}-dialog`,
          title: rtl ? 'قائمة الأوامر' : 'Command menu',
          trigger: Button(h, { variant: 'outline' })
            .class('w-fit')
            .children('Open Menu'),
          content: palette,
          props: { open: model.open },
          onEmit: {
            Opened: () => Message.OpenedDialog(),
            Closed: () => Message.ClosedDialog(),
          },
        }),
      )
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    CommandDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { Button, Command, Dialog } from '@/ui/effect/ui'`,
  body: `Dialog(h, {
  key: 'command-dialog',
  title: 'Command menu',
  trigger: Button(h, { variant: 'outline' }).children('Open Menu'),
  content: Command(h, {
    key: 'command-menu',
    placeholder: 'Type a command or search...',
    props: { items, value },
    onEmit: { Picked: ({ value }) => PickedCommand({ value }) },
  }),
  props: { open },
  onEmit: { Opened: () => OpenedDialog(), Closed: () => ClosedDialog() },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Command } from '@/ui/effect/ui'\n\nCommand(h, { key, placeholder, props, onEmit })`,
  examples: [
    { title: 'Demo', view: view('basic'), source },
    { title: 'Basic', view: view('basic'), source },
    { title: 'Shortcuts', view: view('shortcuts'), source },
    { title: 'Groups', view: view('groups'), source },
    { title: 'Scrollable', view: view('scrollable'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})

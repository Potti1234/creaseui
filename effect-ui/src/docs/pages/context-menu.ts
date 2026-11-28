import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { ContextMenu, DropdownMenu, Icon } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './context-menu.css'

type ItemSpec = Readonly<{
  value: string
  label: string
  icon?: string
  keys?: string
  shortcut?: string
  kind?: 'checkbox' | 'radio'
  variant?: 'destructive'
  isDisabled?: boolean
  group?: string
  submenu?: ReadonlyArray<ItemSpec>
}>
type Fixture = Readonly<{
  title: string
  description?: string
  heroOnly?: boolean
  items: ReadonlyArray<ItemSpec>
  checkedValues?: ReadonlyArray<string>
  peopleValue?: string
  themeValue?: string
  direction?: 'ltr' | 'rtl'
  keepOpenOnCheckableSelect?: boolean
}>

const fixtures: ReadonlyArray<Fixture> = [
  {
    title: 'Demo',
    heroOnly: true,
    items: [
      {
        value: 'back',
        label: 'Back',
      },
      {
        value: 'forward',
        label: 'Forward',
        isDisabled: true,
      },
      {
        value: 'reload',
        label: 'Reload',
      },
    ],
  },
  {
    title: 'Basic',
    description: 'Right-clicking the target opens a grouped action menu.',
    items: [
      {
        value: 'back',
        label: 'Back',
        group: 'Actions',
      },
      {
        value: 'forward',
        label: 'Forward',
        isDisabled: true,
      },
      {
        value: 'reload',
        label: 'Reload',
      },
    ],
  },
  {
    title: 'Submenu',
    description:
      'Items can open nested submenus with their own groups and separators.',
    items: [
      {
        value: 'copy',
        label: 'Copy',
        shortcut: '⌘C',
      },
      {
        value: 'cut',
        label: 'Cut',
        shortcut: '⌘X',
      },
      {
        value: 'more-tools',
        label: 'More Tools',
        submenu: [
          {
            value: 'save-page',
            label: 'Save Page...',
            group: 'Page',
          },
          {
            value: 'create-shortcut',
            label: 'Create Shortcut...',
          },
          {
            value: 'name-window',
            label: 'Name Window...',
          },
          {
            value: 'developer-tools',
            label: 'Developer Tools',
            group: 'Developer',
          },
          {
            value: 'delete',
            label: 'Delete',
            variant: 'destructive',
            group: 'Danger',
          },
        ],
      },
    ],
  },
  {
    title: 'Shortcuts',
    description: 'The shortcut field renders a right-aligned keyboard hint.',
    items: [
      {
        value: 'back',
        label: 'Back',
        shortcut: '⌘[',
        group: 'Navigate',
      },
      {
        value: 'forward',
        label: 'Forward',
        shortcut: '⌘]',
        isDisabled: true,
      },
      {
        value: 'reload',
        label: 'Reload',
        shortcut: '⌘R',
      },
      {
        value: 'save',
        label: 'Save',
        shortcut: '⌘S',
        group: 'File',
      },
      {
        value: 'save-as',
        label: 'Save As...',
        shortcut: '⇧⌘S',
      },
    ],
  },
  {
    title: 'Groups',
    description: 'Labeled groups and separators organize related actions.',
    items: [
      {
        value: 'new-file',
        label: 'New File',
        shortcut: '⌘N',
        group: 'File',
      },
      {
        value: 'open-file',
        label: 'Open File',
        shortcut: '⌘O',
      },
      {
        value: 'save',
        label: 'Save',
        shortcut: '⌘S',
      },
      {
        value: 'undo',
        label: 'Undo',
        shortcut: '⌘Z',
        group: 'Edit',
      },
      {
        value: 'redo',
        label: 'Redo',
        shortcut: '⇧⌘Z',
      },
      {
        value: 'cut',
        label: 'Cut',
        shortcut: '⌘X',
        group: 'Clipboard',
      },
      {
        value: 'copy',
        label: 'Copy',
        shortcut: '⌘C',
      },
      {
        value: 'paste',
        label: 'Paste',
        shortcut: '⌘V',
      },
      {
        value: 'delete',
        label: 'Delete',
        variant: 'destructive',
        group: 'Danger',
      },
    ],
  },
  {
    title: 'Icons',
    description: 'Items render a leading Lucide icon before the label.',
    items: [
      {
        value: 'copy',
        label: 'Copy',
        icon: 'copy',
      },
      {
        value: 'cut',
        label: 'Cut',
        icon: 'scissors',
      },
      {
        value: 'paste',
        label: 'Paste',
        icon: 'clipboard-paste',
      },
      {
        value: 'delete',
        label: 'Delete',
        icon: 'trash-2',
        variant: 'destructive',
        group: 'Danger',
      },
    ],
  },
  {
    title: 'Checkboxes',
    description:
      "kind: 'checkbox' items carry checked state; the parent owns the toggle. keepOpenOnCheckableSelect keeps the menu open between picks.",
    keepOpenOnCheckableSelect: true,
    checkedValues: ['bookmarks-bar', 'developer-tools'],
    items: [
      {
        value: 'bookmarks-bar',
        label: 'Show Bookmarks Bar',
        kind: 'checkbox',
        group: 'View',
      },
      {
        value: 'full-urls',
        label: 'Show Full URLs',
        kind: 'checkbox',
      },
      {
        value: 'developer-tools',
        label: 'Show Developer Tools',
        kind: 'checkbox',
      },
    ],
  },
  {
    title: 'Radio',
    description:
      'Independent radio groups keep one selection each, scoped by group. keepOpenOnCheckableSelect keeps the menu open between picks.',
    keepOpenOnCheckableSelect: true,
    peopleValue: 'pedro',
    themeValue: 'system',
    items: [
      {
        value: 'pedro',
        label: 'Pedro Duarte',
        kind: 'radio',
        group: 'People',
      },
      {
        value: 'colm',
        label: 'Colm Tuite',
        kind: 'radio',
        group: 'People',
      },
      {
        value: 'light',
        label: 'Light',
        kind: 'radio',
        group: 'Theme',
      },
      {
        value: 'dark',
        label: 'Dark',
        kind: 'radio',
        group: 'Theme',
      },
      {
        value: 'system',
        label: 'System',
        kind: 'radio',
        group: 'Theme',
      },
    ],
  },
  {
    title: 'Destructive',
    description: "variant: 'destructive' styles the item in the danger color.",
    items: [
      {
        value: 'edit',
        label: 'Edit',
        icon: 'pencil',
      },
      {
        value: 'share',
        label: 'Share',
        icon: 'share',
      },
      {
        value: 'delete',
        label: 'Delete',
        icon: 'trash-2',
        variant: 'destructive',
        group: 'Danger',
      },
    ],
  },
  {
    title: 'RTL',
    description:
      "direction: 'rtl' mirrors items, icons and submenus for right-to-left layouts.",
    direction: 'rtl',
    items: [
      {
        value: 'navigation',
        label: 'التنقل',
        submenu: [
          {
            value: 'back',
            label: 'رجوع',
            icon: 'arrow-left',
            shortcut: '⌘[',
            group: 'التنقل',
          },
          {
            value: 'forward',
            label: 'للأمام',
            icon: 'arrow-right',
            shortcut: '⌘]',
            isDisabled: true,
          },
          {
            value: 'reload',
            label: 'إعادة تحميل',
            icon: 'rotate-cw',
            shortcut: '⌘R',
          },
        ],
      },
      {
        value: 'more-tools',
        label: 'المزيد من الأدوات',
        submenu: [
          {
            value: 'save-page',
            label: 'حفظ الصفحة',
            group: 'الصفحة',
          },
          {
            value: 'create-shortcut',
            label: 'إنشاء اختصار',
          },
          {
            value: 'name-window',
            label: 'تسمية النافذة',
          },
          {
            value: 'developer-tools',
            label: 'أدوات المطور',
            group: 'المطور',
          },
          {
            value: 'delete',
            label: 'حذف',
            variant: 'destructive',
            group: 'خطر',
          },
        ],
      },
    ],
  },
]
const fixtureAt = (index: number): Fixture =>
  fixtures[index] ?? (fixtures[0] as Fixture)
const flatItems = (items: ReadonlyArray<ItemSpec>): ReadonlyArray<ItemSpec> =>
  items.flatMap(item => [item, ...(item.submenu ?? [])])
const fixtureLabel = (fixture: Fixture, value: string): string =>
  flatItems(fixture.items).find(item => item.value === value)?.label ?? value

const Message = UiSchema.TaggedEnum({
  RequestedOpenMenu: {},
  RequestedCloseMenu: {},
  RequestedOpenSubmenu: {},
  RequestedCloseSubmenu: {},
  PickedMenuItem: { value: Schema.String },
})

const ContextMenuDemo = Html.component({
  name: 'DocsContextMenuDemo',
  props: Schema.Struct({
    idPrefix: Schema.String,
    fixtureIndex: Schema.Number,
  }),
  model: Schema.Struct({
    open: Schema.Boolean,
    submenuOpen: Schema.Boolean,
    checkedValues: Schema.Array(Schema.String),
    peopleValue: Schema.NullOr(Schema.String),
    themeValue: Schema.NullOr(Schema.String),
    lastAction: Schema.NullOr(Schema.String),
  }),
  message: Message,
}).make({
  init: ({ props }) => {
    const fixture = fixtureAt(props.fixtureIndex)
    return {
      open: false,
      submenuOpen: false,
      checkedValues: [...(fixture.checkedValues ?? [])],
      peopleValue: fixture.peopleValue ?? null,
      themeValue: fixture.themeValue ?? null,
      lastAction: null,
    }
  },
  update: {
    RequestedOpenMenu: $ => $.evolve({ open: true }),
    RequestedCloseMenu: $ => $.evolve({ open: false, submenuOpen: false }),
    RequestedOpenSubmenu: $ => $.evolve({ submenuOpen: true }),
    RequestedCloseSubmenu: $ => $.evolve({ submenuOpen: false }),
    PickedMenuItem: ($, { value }) => {
      const fixture = fixtureAt($.props.fixtureIndex)
      const spec = flatItems(fixture.items).find(item => item.value === value)
      return $.evolve({
        lastAction: value,
        checkedValues:
          spec?.kind === 'checkbox'
            ? $.model.checkedValues.includes(value)
              ? $.model.checkedValues.filter(entry => entry !== value)
              : [...$.model.checkedValues, value]
            : $.model.checkedValues,
        peopleValue:
          spec?.kind === 'radio' && spec.group === 'People'
            ? value
            : $.model.peopleValue,
        themeValue:
          spec?.kind === 'radio' && spec.group === 'Theme'
            ? value
            : $.model.themeValue,
      })
    },
  },
  view: (h, model) => {
    const fixture = fixtureAt(h.props.fixtureIndex)
    const appearance = (
      spec: ItemSpec | undefined,
    ): Record<string, unknown> => {
      if (spec === undefined) return {}
      const shared = {
        ...(spec.group === undefined ? {} : { group: spec.group }),
        ...(spec.icon === undefined
          ? {}
          : { icon: Icon(h, { name: spec.icon as never, size: 'sm' }) }),
        ...(spec.keys === undefined ? {} : { keys: spec.keys }),
        ...(spec.shortcut === undefined ? {} : { shortcut: spec.shortcut }),
        ...(spec.variant === 'destructive'
          ? { tone: 'destructive' as const }
          : {}),
        ...(spec.kind === undefined
          ? {}
          : {
              inset: true,
              closeOnClick:
                fixture.keepOpenOnCheckableSelect === true ? false : undefined,
            }),
      }
      if (spec.kind === 'checkbox')
        return {
          ...shared,
          kind: 'checkbox' as const,
          checked: model.checkedValues.includes(spec.value),
        }
      if (spec.kind === 'radio')
        return {
          ...shared,
          kind: 'radio' as const,
          selectedValue:
            spec.group === 'People' ? model.peopleValue : model.themeValue,
        }
      if (spec.submenu !== undefined)
        return {
          ...shared,
          kind: 'submenu' as const,
          render: (item: { value: string }, parentMenu: never) =>
            ContextMenuSubmenu(h, {
              key: `${h.props.idPrefix}-${item.value}-submenu`,
              label: spec.label,
              spec,
              open: model.submenuOpen,
              parentItem: item.value,
              parentMenu,
              appearance,
            }),
        }
      return shared
    }
    return h.div.class('context-menu-docs-demo').children(
      ContextMenu(h, {
        key: `${h.props.idPrefix}-menu`,
        label: `${fixture.title} menu`,
        triggerLabel: `${fixture.title} context menu target`,
        triggerClassName:
          'flex aspect-video w-80 items-center justify-center rounded-xl border border-dashed text-sm',
        trigger: 'Right click here',
        ...(fixture.direction === undefined
          ? {}
          : { direction: fixture.direction }),
        props: {
          open: model.open,
          items: fixture.items.map(item => ({
            value: item.value,
            label: item.label,
            ...(item.isDisabled === undefined
              ? {}
              : { disabled: item.isDisabled }),
          })),
        },
        decorateItem: ({ value }) =>
          appearance(fixture.items.find(item => item.value === value)) as never,
        onEmit: {
          RequestedOpen: () => Message.RequestedOpenMenu(),
          RequestedClose: () => Message.RequestedCloseMenu(),
          Picked: ({ value }) => Message.PickedMenuItem({ value }),
          Highlighted: () => undefined,
          Settled: () => undefined,
        },
      }),
      h.p
        .attrs({ role: 'status' })
        .class('context-menu-docs-status')
        .children(
          model.lastAction === null
            ? 'No action selected.'
            : `Last action: ${fixtureLabel(fixture, model.lastAction)}`,
        ),
    )
  },
})

const ContextMenuSubmenu = (
  h: Html.H<typeof Message.Type>,
  {
    key,
    label,
    spec,
    open,
    parentItem,
    parentMenu,
    appearance,
  }: Readonly<{
    key: string
    label: string
    spec: ItemSpec
    open: boolean
    parentItem: string
    parentMenu: never
    appearance: (spec: ItemSpec | undefined) => Record<string, unknown>
  }>,
) =>
  DropdownMenu(h, {
    key,
    label,
    submenuTrigger: h.div.children(
      spec.icon === undefined
        ? undefined
        : Icon(h, { name: spec.icon as never, size: 'sm' }),
      spec.label,
      Icon(h, {
        name: 'chevron-right',
        size: 'sm',
        className: 'ml-auto size-4',
      }),
    ),
    parentMenu,
    props: {
      open,
      parentItem,
      items: (spec.submenu ?? []).map(child => ({
        value: child.value,
        label: child.label,
        ...(child.isDisabled === undefined
          ? {}
          : { disabled: child.isDisabled }),
      })),
    },
    decorateItem: ({ value }) =>
      appearance(
        (spec.submenu ?? []).find(child => child.value === value),
      ) as never,
    onEmit: {
      RequestedOpen: () => Message.RequestedOpenSubmenu(),
      RequestedClose: () => Message.RequestedCloseSubmenu(),
      Picked: ({ value }) => Message.PickedMenuItem({ value }),
      Highlighted: () => undefined,
      RequestedQuery: () => undefined,
      Settled: () => undefined,
    },
  })

const example =
  (fixtureIndex: number): DocsExampleImplementation['view'] =>
  (h, context) =>
    ContextMenuDemo(h, {
      key: `${context.idPrefix}-context-menu`,
      props: { idPrefix: context.idPrefix, fixtureIndex },
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { ContextMenu } from '@/ui/effect/ui'`,
  body: `ContextMenu(h, {
  key: 'editor-actions',
  label: 'Editor actions',
  trigger: 'Right click here',
  props: { open: model.open, items },
  decorateItem,
  onEmit,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { ContextMenu } from '@/ui/effect/ui'\n\nContextMenu(h, { key, label, trigger, props, decorateItem, onEmit })`,
  examples: fixtures.map((fixture, index) => ({
    title: fixture.title,
    view: example(index),
    source,
  })),
})

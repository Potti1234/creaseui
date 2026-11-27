import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Avatar, DropdownMenu, Icon } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './dropdown-menu.css'

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
  trigger: Readonly<
    { kind: 'button'; label: string } | { kind: 'avatar'; initials: string }
  >
  items: ReadonlyArray<ItemSpec>
  checkedValues?: ReadonlyArray<string>
  radioValue?: string
  direction?: 'ltr' | 'rtl'
  keepOpenOnCheckableSelect?: boolean
  activateOnHover?: boolean
}>

const fixtures: ReadonlyArray<Fixture> = [
  {
    title: 'Basic',
    description:
      'A basic dropdown menu: a labeled group and a separator between sections.',
    trigger: {
      kind: 'button',
      label: 'Open',
    },
    items: [
      {
        value: 'profile',
        label: 'Profile',
        group: 'My Account',
      },
      {
        value: 'billing',
        label: 'Billing',
        group: 'My Account',
      },
      {
        value: 'team',
        label: 'Team',
      },
      {
        value: 'subscription',
        label: 'Subscription',
      },
    ],
  },
  {
    title: 'Hover Without Activation',
    description:
      'activateOnHover: false styles hover in CSS and lets only the keys move the active item, so the pointer sends no Message per item crossed. For menus whose update runs on a server.',
    activateOnHover: false,
    trigger: {
      kind: 'button',
      label: 'Open',
    },
    items: [
      {
        value: 'profile',
        label: 'Profile',
        group: 'My Account',
      },
      {
        value: 'billing',
        label: 'Billing',
        group: 'My Account',
      },
      {
        value: 'team',
        label: 'Team',
      },
      {
        value: 'subscription',
        label: 'Subscription',
      },
    ],
  },
  {
    title: 'Submenu',
    description:
      'An item can open a nested submenu; submenu children use their own itemToConfig.',
    trigger: {
      kind: 'button',
      label: 'Open',
    },
    items: [
      {
        value: 'profile',
        label: 'Profile',
        group: 'My Account',
      },
      {
        value: 'billing',
        label: 'Billing',
        group: 'My Account',
      },
      {
        value: 'invite',
        label: 'Invite users',
        group: 'My Account',
        submenu: [
          {
            value: 'invite-email',
            label: 'Invite by email',
          },
          {
            value: 'invite-message',
            label: 'Invite via message',
          },
          {
            value: 'invite-more',
            label: 'More options…',
          },
        ],
      },
    ],
  },
  {
    title: 'Shortcuts',
    description:
      'Display-only keyboard hints; applications register shortcut actions separately.',
    trigger: {
      kind: 'button',
      label: 'Open',
    },
    items: [
      {
        value: 'back',
        label: 'Back',
        keys: 'mod+[',
        group: 'Browser',
      },
      {
        value: 'forward',
        label: 'Forward',
        keys: 'mod+]',
      },
      {
        value: 'reload',
        label: 'Reload',
        keys: 'mod+R',
      },
      {
        value: 'more-tools',
        label: 'More tools',
        submenu: [
          {
            value: 'save-page',
            label: 'Save page',
            keys: 'mod+S',
          },
          {
            value: 'create-shortcut',
            label: 'Create shortcut',
          },
          {
            value: 'name-window',
            label: 'Name window',
            isDisabled: true,
          },
          {
            value: 'developer-tools',
            label: 'Developer tools',
            keys: 'mod+I',
          },
        ],
      },
      {
        value: 'show-bookmarks',
        label: 'Show bookmarks',
        keys: 'mod+shift+B',
        group: 'View',
      },
      {
        value: 'show-full-urls',
        label: 'Show full URLs',
      },
    ],
  },
  {
    title: 'Icons',
    description: 'Items render a leading Lucide icon before the label.',
    trigger: {
      kind: 'button',
      label: 'Open',
    },
    items: [
      {
        value: 'profile',
        label: 'Profile',
        icon: 'user',
        group: 'My Account',
      },
      {
        value: 'billing',
        label: 'Billing',
        icon: 'credit-card',
      },
      {
        value: 'settings',
        label: 'Settings',
        icon: 'settings',
      },
      {
        value: 'shortcuts',
        label: 'Keyboard shortcuts',
        icon: 'keyboard',
      },
      {
        value: 'logout',
        label: 'Log out',
        icon: 'log-out',
        group: 'Session',
      },
    ],
  },
  {
    title: 'Checkboxes',
    description:
      "kind: 'checkbox' items carry checked state; isInset leaves room for the check indicator. keepOpenOnCheckableSelect keeps the menu open between picks.",
    keepOpenOnCheckableSelect: true,
    trigger: {
      kind: 'button',
      label: 'View options',
    },
    checkedValues: ['status-bar', 'activity-bar'],
    items: [
      {
        value: 'status-bar',
        label: 'Status Bar',
        kind: 'checkbox',
        group: 'Panels',
      },
      {
        value: 'activity-bar',
        label: 'Activity Bar',
        kind: 'checkbox',
      },
      {
        value: 'panel',
        label: 'Panel',
        kind: 'checkbox',
      },
      {
        value: 'minimap',
        label: 'Minimap',
        kind: 'checkbox',
      },
    ],
  },
  {
    title: 'Checkboxes Icons',
    description:
      'Checkbox items with leading icons, like notification filters. keepOpenOnCheckableSelect keeps the menu open between picks.',
    keepOpenOnCheckableSelect: true,
    trigger: {
      kind: 'button',
      label: 'Notifications',
    },
    checkedValues: ['comments'],
    items: [
      {
        value: 'comments',
        label: 'Comments and mentions',
        kind: 'checkbox',
        icon: 'message-square',
      },
      {
        value: 'activity',
        label: 'All activity',
        kind: 'checkbox',
        icon: 'activity',
      },
      {
        value: 'mentions',
        label: 'Mentions only',
        kind: 'checkbox',
        icon: 'bell',
      },
    ],
  },
  {
    title: 'Radio Group',
    description:
      "kind: 'radio' items implement a single selection within the menu. keepOpenOnCheckableSelect keeps the menu open between picks.",
    keepOpenOnCheckableSelect: true,
    trigger: {
      kind: 'button',
      label: 'Open',
    },
    radioValue: 'top',
    items: [
      {
        value: 'top',
        label: 'Top',
        kind: 'radio',
        group: 'Panel Position',
      },
      {
        value: 'bottom',
        label: 'Bottom',
        kind: 'radio',
      },
      {
        value: 'right',
        label: 'Right',
        kind: 'radio',
      },
    ],
  },
  {
    title: 'Radio Icons',
    description:
      'Radio items with icons for a single-choice picker, like payment methods. keepOpenOnCheckableSelect keeps the menu open between picks.',
    keepOpenOnCheckableSelect: true,
    trigger: {
      kind: 'button',
      label: 'Payment Method',
    },
    radioValue: 'card',
    items: [
      {
        value: 'card',
        label: 'Card',
        kind: 'radio',
        icon: 'credit-card',
      },
      {
        value: 'paypal',
        label: 'PayPal',
        kind: 'radio',
        icon: 'wallet',
      },
      {
        value: 'apple',
        label: 'Apple Pay',
        kind: 'radio',
        icon: 'wallet',
      },
    ],
  },
  {
    title: 'Destructive',
    description:
      "variant: 'destructive' styles the item in the danger color; selection still emits the typed action.",
    trigger: {
      kind: 'button',
      label: 'Actions',
    },
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
      },
    ],
  },
  {
    title: 'Avatar',
    description:
      'Any Html works as the trigger — here an avatar, like an account switcher.',
    trigger: {
      kind: 'avatar',
      initials: 'LP',
    },
    items: [
      {
        value: 'profile',
        label: 'Profile',
        icon: 'user',
        group: 'Lukas Pottner',
      },
      {
        value: 'billing',
        label: 'Billing',
        icon: 'credit-card',
      },
      {
        value: 'switch-account',
        label: 'Switch account',
        icon: 'refresh-cw',
      },
      {
        value: 'logout',
        label: 'Log out',
        icon: 'log-out',
      },
    ],
  },
  {
    title: 'Complex',
    description:
      'Group labels, icons, shortcuts, a submenu and a destructive item in one menu.',
    trigger: {
      kind: 'button',
      label: 'Complex Menu',
    },
    items: [
      {
        value: 'profile',
        label: 'Profile',
        icon: 'user',
        keys: 'mod+shift+P',
        group: 'My Account',
      },
      {
        value: 'billing',
        label: 'Billing',
        icon: 'credit-card',
        keys: 'mod+B',
      },
      {
        value: 'settings',
        label: 'Settings',
        icon: 'settings',
        keys: 'mod+S',
      },
      {
        value: 'shortcuts',
        label: 'Keyboard shortcuts',
        icon: 'keyboard',
        keys: 'mod+K',
      },
      {
        value: 'team',
        label: 'Team',
        icon: 'users',
        group: 'Team',
      },
      {
        value: 'invite',
        label: 'Invite users',
        icon: 'user-plus',
        submenu: [
          {
            value: 'invite-email',
            label: 'Email',
          },
          {
            value: 'invite-message',
            label: 'Message',
          },
          {
            value: 'invite-more',
            label: 'More…',
          },
        ],
      },
      {
        value: 'new-team',
        label: 'New Team',
        icon: 'plus',
        keys: 'mod+T',
      },
      {
        value: 'logout',
        label: 'Log out',
        icon: 'log-out',
        keys: 'mod+shift+Q',
        variant: 'destructive',
      },
    ],
  },
  {
    title: 'RTL',
    description:
      "direction: 'rtl' mirrors items, icons and the submenu for right-to-left layouts.",
    trigger: {
      kind: 'button',
      label: 'افتح القائمة',
    },
    direction: 'rtl',
    items: [
      {
        value: 'profile',
        label: 'الملف الشخصي',
        icon: 'user',
        group: 'حسابي',
      },
      {
        value: 'billing',
        label: 'الفواتير',
        icon: 'credit-card',
      },
      {
        value: 'invite',
        label: 'دعوة مستخدمين',
        icon: 'user-plus',
        submenu: [
          {
            value: 'invite-email',
            label: 'البريد الإلكتروني',
          },
          {
            value: 'invite-message',
            label: 'رسالة',
          },
          {
            value: 'invite-more',
            label: 'المزيد…',
          },
        ],
      },
      {
        value: 'logout',
        label: 'تسجيل الخروج',
        icon: 'log-out',
      },
    ],
  },
]

const fixtureAt = (index: number): Fixture =>
  fixtures[index] ?? (fixtures[0] as Fixture)

const keyNames: Readonly<Record<string, string>> = {
  alt: 'Alt',
  option: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  enter: 'Enter',
  return: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
}
const glyphs: Readonly<Record<string, string>> = {
  Meta: '⌘',
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Backspace: '⌫',
  Delete: '⌦',
  Enter: '↩',
  Escape: '⎋',
  Tab: '⇥',
  Space: '␣',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  PageUp: '⇞',
  PageDown: '⇟',
  Home: '↖',
  End: '↘',
}
const names: Readonly<Record<string, string>> = {
  Control: 'Ctrl',
  Delete: 'Del',
  Escape: 'Esc',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
}
const currentPlatform = (): 'apple' | 'other' =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/u.test(navigator.platform || navigator.userAgent)
    ? 'apple'
    : 'other'
const toAriaKeyshortcuts = (
  keys: string,
  platform: 'apple' | 'other',
): string =>
  keys
    .split('+')
    .map(key =>
      key.toLowerCase() === 'mod'
        ? platform === 'apple'
          ? 'Meta'
          : 'Control'
        : (keyNames[key.toLowerCase()] ??
          (key.length === 1
            ? key.toUpperCase()
            : key.charAt(0).toUpperCase() + key.slice(1))),
    )
    .join('+')
const formatShortcut = (keys: string): string => {
  const platform = currentPlatform()
  return `\u2066${toAriaKeyshortcuts(keys, platform)
    .split('+')
    .map(key => (platform === 'apple' ? glyphs[key] : names[key]) ?? key)
    .join(platform === 'apple' ? '' : '+')}\u2069`
}

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

const DropdownDemo = Html.component({
  name: 'DocsDropdownMenuDemo',
  props: Schema.Struct({
    idPrefix: Schema.String,
    fixtureIndex: Schema.Number,
  }),
  model: Schema.Struct({
    open: Schema.Boolean,
    submenuOpen: Schema.Boolean,
    checkedValues: Schema.Array(Schema.String),
    radioValue: Schema.NullOr(Schema.String),
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
      radioValue: fixture.radioValue ?? null,
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
        radioValue: spec?.kind === 'radio' ? value : $.model.radioValue,
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
        ...(spec.keys === undefined
          ? {}
          : { keys: spec.keys, shortcut: formatShortcut(spec.keys) }),
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
          selectedValue: model.radioValue,
        }
      if (spec.submenu !== undefined)
        return {
          ...shared,
          kind: 'submenu' as const,
          render: (item: { value: string }, parentMenu: never) =>
            DropdownMenu(h, {
              key: `${h.props.idPrefix}-${item.value}-submenu`,
              label: spec.label,
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
                open: model.submenuOpen,
                parentItem: item.value,
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
                  spec.submenu?.find(child => child.value === value),
                ) as never,
              onEmit: {
                RequestedOpen: () => Message.RequestedOpenSubmenu(),
                RequestedClose: () => Message.RequestedCloseSubmenu(),
                Picked: ({ value }) => Message.PickedMenuItem({ value }),
                Highlighted: () => undefined,
                RequestedQuery: () => undefined,
                Settled: () => undefined,
              },
            }),
        }
      return shared
    }
    const trigger =
      fixture.trigger.kind === 'avatar'
        ? h.button
            .attrs({ type: 'button', 'aria-label': `${fixture.title} menu` })
            .class('rounded-full')
            .children(
              Avatar(h, {
                key: `${h.props.idPrefix}-trigger-avatar`,
                props: {},
                alt: 'Lukas Pottner',
                fallbackContent: [fixture.trigger.initials],
              }),
            )
        : h.button
            .attrs({ type: 'button' })
            .class('rounded-md border px-4 py-2 text-sm font-medium')
            .children(fixture.trigger.label)
    return h.div.class('dropdown-menu-docs-demo').children(
      DropdownMenu(h, {
        key: `${h.props.idPrefix}-menu`,
        label: `${fixture.title} menu`,
        trigger: trigger as never,
        ...(fixture.direction === undefined
          ? {}
          : { direction: fixture.direction }),
        props: {
          open: model.open,
          align: 'start',
          sideOffset: 4,
          ...(fixture.activateOnHover === false
            ? { highlightItemOnHover: false }
            : {}),
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
          RequestedQuery: () => undefined,
          Settled: () => undefined,
        },
      }),
      h.p
        .attrs({ role: 'status' })
        .class('dropdown-menu-docs-status')
        .children(
          model.lastAction === null
            ? 'No action selected.'
            : `Last action: ${fixtureLabel(fixture, model.lastAction)}`,
        ),
    )
  },
})

const example =
  (fixtureIndex: number): DocsExampleImplementation['view'] =>
  (h, context) =>
    DropdownDemo(h, {
      key: `${context.idPrefix}-dropdown-menu`,
      props: { idPrefix: context.idPrefix, fixtureIndex },
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { DropdownMenu } from '@/ui/effect/ui'`,
  body: `DropdownMenu(h, {
  key: 'account-menu',
  label: 'Account menu',
  trigger: h.button.class('rounded-md border px-4 py-2 text-sm font-medium').children('Open'),
  props: { open: model.open, sideOffset: 4, items },
  decorateItem: item => ({ label: item.label }),
  onEmit,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { DropdownMenu } from '@/ui/effect/ui'\n\nDropdownMenu(h, { key, label, trigger, props, decorateItem, onEmit })`,
  examples: fixtures.map((fixture, index) => ({
    title: fixture.title,
    view: example(index),
    source,
  })),
})

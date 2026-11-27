import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Avatar,
  AvatarGroup,
  AvatarGroupOverflow,
  DropdownMenu,
  Icon,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './avatar.css'

type Item = Readonly<{
  key: string
  src: string
  alt: string
  fallback: string
  size?: 'sm' | 'default' | 'lg'
  badge?: 'green' | 'icon'
  grayscale?: 'image' | 'avatar'
}>

const CREASEUI: Item = {
  key: 'creaseui',
  src: '/logo-mark.svg',
  alt: '@creaseui',
  fallback: 'CU',
}
const FOLDKIT: Item = {
  key: 'foldkit',
  src: 'https://github.com/foldkit.png',
  alt: '@foldkit',
  fallback: 'FK',
}
const DEVIN: Item = {
  key: 'devin',
  src: 'https://avatars.githubusercontent.com/in/811515?v=4',
  alt: 'Devin',
  fallback: 'DV',
}
const GROUP = [CREASEUI, FOLDKIT, DEVIN] as const

const avatar = <Msg>(h: Html.H<Msg>, item: Item, prefix = '') =>
  Avatar(h, {
    key: `${prefix}${item.key}`,
    props: { src: item.src },
    alt: item.alt,
    fallbackContent: [item.fallback],
    ...(item.size === undefined || item.size === 'default'
      ? {}
      : { size: item.size }),
    ...(item.badge === undefined
      ? {}
      : {
          badge:
            item.badge === 'green'
              ? []
              : [Icon(h, { name: 'plus', size: 'xs' })],
        }),
    ...(item.grayscale === 'avatar'
      ? { className: 'avatar-docs-grayscale' }
      : {}),
  })

const group = <Msg>(
  h: Html.H<Msg>,
  items: ReadonlyArray<Item>,
  count?: string,
  countIcon = false,
  prefix = '',
) =>
  AvatarGroup(h, {
    className: 'avatar-docs-grayscale',
    children: [
      ...items.map(item => avatar(h, item, prefix)),
      count === undefined && !countIcon
        ? undefined
        : AvatarGroupOverflow(h, {
            children: countIcon
              ? [Icon(h, { name: 'plus', size: 'xs' })]
              : [count ?? ''],
          }),
    ],
  })

const demo = <Msg>(h: Html.H<Msg>, count: string, prefix = '') => [
  h.div.children(avatar(h, { ...CREASEUI, grayscale: 'avatar' }, prefix)),
  h.div.children(avatar(h, { ...DEVIN, badge: 'green' }, prefix)),
  group(h, GROUP, count, false, prefix),
]

const DropdownMessage = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
  PickedMenuItem: { value: Schema.String },
})

const AvatarDropdown = Html.component({
  name: 'DocsAvatarDropdown',
  props: Schema.Null,
  model: Schema.Struct({ open: Schema.Boolean }),
  message: DropdownMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    RequestedOpen: $ => $.evolve({ open: true }),
    RequestedClose: $ => $.evolve({ open: false }),
    PickedMenuItem: $ => $.evolve({ open: false }),
  },
  view: (h, model) =>
    DropdownMenu(h, {
      key: 'menu',
      label: 'Avatar menu',
      trigger: h.button
        .class('avatar-docs-trigger')
        .attrs({ type: 'button' })
        .children(avatar(h, CREASEUI)),
      props: {
        open: model.open,
        items: [
          { value: 'profile', label: 'Profile' },
          { value: 'billing', label: 'Billing' },
          { value: 'settings', label: 'Settings' },
          { value: 'logout', label: 'Log out' },
        ],
      },
      decorateItem: ({ value }) =>
        value === 'logout' ? { tone: 'destructive' as const } : {},
      onEmit: {
        RequestedOpen: () => DropdownMessage.RequestedOpen(),
        RequestedClose: () => DropdownMessage.RequestedClose(),
        Picked: ({ value }) => DropdownMessage.PickedMenuItem({ value }),
        Highlighted: () => undefined,
        RequestedQuery: () => undefined,
        Settled: () => undefined,
      },
    }),
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) => {
    if (kind === 'basic')
      return h.div
        .class('avatar-docs-plain')
        .children(
          avatar(
            h,
            { ...CREASEUI, grayscale: 'avatar' },
            `${context.idPrefix}-`,
          ),
        )
    if (kind === 'badge')
      return h.div
        .class('avatar-docs-plain')
        .children(
          avatar(h, { ...CREASEUI, badge: 'green' }, `${context.idPrefix}-`),
        )
    if (kind === 'badgeIcon')
      return h.div
        .class('avatar-docs-plain')
        .children(
          avatar(
            h,
            { ...FOLDKIT, badge: 'icon', grayscale: 'avatar' },
            `${context.idPrefix}-`,
          ),
        )
    if (kind === 'group')
      return h.div
        .class('avatar-docs-plain')
        .children(group(h, GROUP, undefined, false, `${context.idPrefix}-`))
    if (kind === 'groupCount')
      return h.div
        .class('avatar-docs-plain')
        .children(group(h, GROUP, '+3', false, `${context.idPrefix}-`))
    if (kind === 'groupCountIcon')
      return h.div
        .class('avatar-docs-plain')
        .children(group(h, GROUP, undefined, true, `${context.idPrefix}-`))
    if (kind === 'sizes')
      return h.div
        .class('avatar-docs-sizes')
        .children(
          avatar(
            h,
            { ...CREASEUI, key: 'sm', size: 'sm' },
            `${context.idPrefix}-`,
          ),
          avatar(h, CREASEUI, `${context.idPrefix}-`),
          avatar(
            h,
            { ...CREASEUI, key: 'lg', size: 'lg' },
            `${context.idPrefix}-`,
          ),
        )
    if (kind === 'dropdown')
      return h.div.class('avatar-docs-plain').children(
        AvatarDropdown(h, {
          key: `${context.idPrefix}-avatar-menu`,
          props: null,
        }),
      )
    return h.div
      .class('avatar-docs-hero', kind === 'rtl' ? 'avatar-docs-rtl' : undefined)
      .children(demo(h, kind === 'rtl' ? '+٣' : '+3'))
  }

const source = exampleApplicationSource({
  imports: `import { Avatar, AvatarGroup, AvatarGroupOverflow } from '@/ui/effect/ui'
import './avatar.css'`,
  body: `AvatarGroup(h, {
  children: [
    Avatar(h, { key: 'creaseui', src: '/logo-mark.svg', alt: '@creaseui', fallbackContent: 'CU' }),
    AvatarGroupOverflow(h, { children: ['+3'] }),
  ],
})`,
})

const examples: ReadonlyArray<readonly [string, string]> = [
  ['Demo', 'demo'],
  ['Basic', 'basic'],
  ['Badge', 'badge'],
  ['Badge with Icon', 'badgeIcon'],
  ['Avatar Group', 'group'],
  ['Avatar Group Count', 'groupCount'],
  ['Avatar Group with Icon', 'groupCountIcon'],
  ['Sizes', 'sizes'],
  ['Dropdown', 'dropdown'],
  ['RTL', 'rtl'],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Avatar } from '@/ui/effect/ui'

Avatar(h, { key: 'avatar', src: '/logo-mark.svg', alt: '@creaseui', fallbackContent: 'CU' })`,
  examples: examples.map(([title, kind]) => ({
    title,
    view: view(kind),
    source,
  })),
})

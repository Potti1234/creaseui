import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Avatar,
  Button,
  DropdownMenu,
  Icon,
  Item,
  ItemGroup,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './item.css'

const people = [
  {
    username: 'CreaseUI',
    avatar: '/logo-mark.svg',
    email: 'creaseui@example.com',
  },
  {
    username: 'maxleiter',
    avatar: 'https://github.com/maxleiter.png',
    email: 'maxleiter@vercel.com',
  },
  {
    username: 'evilrabbit',
    avatar: 'https://github.com/evilrabbit.png',
    email: 'evilrabbit@vercel.com',
  },
] as const
const music = [
  {
    title: 'Midnight City Lights',
    artist: 'Neon Dreams',
    album: 'Electric Nights',
    duration: '3:45',
  },
  {
    title: 'Coffee Shop Conversations',
    artist: 'The Morning Brew',
    album: 'Urban Stories',
    duration: '4:05',
  },
  {
    title: 'Digital Rain',
    artist: 'Cyber Symphony',
    album: 'Binary Beats',
    duration: '3:30',
  },
] as const
const models = [
  {
    name: 'v0-1.5-sm',
    description: 'Everyday tasks and UI generation.',
    image:
      'https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop',
  },
  {
    name: 'v0-1.5-lg',
    description: 'Advanced thinking or reasoning.',
    image:
      'https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop',
  },
  {
    name: 'v0-2.0-mini',
    description: 'Open Source model for everyone.',
    image:
      'https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop',
  },
] as const
const rtlCopy = {
  basicItem: 'عنصر أساسي',
  basicItemDesc: 'عنصر بسيط يحتوي على عنوان ووصف.',
  action: 'إجراء',
  verifiedTitle: 'تم التحقق من ملفك الشخصي.',
}

const avatar = <Msg>(
  h: Html.H<Msg>,
  key: string,
  src: string,
  alt: string,
  fallback: string,
  className?: string,
): View.Content<Msg> =>
  Avatar(h, {
    key,
    props: { src },
    alt,
    fallbackContent: [fallback],
    ...(className === undefined ? {} : { className }),
  }) as unknown as View.Content<Msg>
const plusButton = (
  h: Html.H<DocsMessage>,
  label: string,
  size: 'icon' | 'icon-sm' = 'icon',
) =>
  Button(h, {
    variant: 'outline',
    size,
    element: h.button.attrs({ 'aria-label': label }),
  })
    .class('rounded-full')
    .children(Icon(h, { name: 'plus' }))

const basic =
  (rtlMode: boolean): DocsExampleImplementation['view'] =>
  h => {
    const body = h.div.class('item-docs-stack').children(
      Item(h, {
        variant: 'outline',
        children: item => [
          item.content({
            children: [
              item.title({
                children: [rtlMode ? rtlCopy.basicItem : 'Basic Item'],
              }),
              item.description({
                children: [
                  rtlMode
                    ? rtlCopy.basicItemDesc
                    : 'A simple item with title and description.',
                ],
              }),
            ],
          }),
          item.actions({
            children: [
              Button(h, { variant: 'outline', size: 'sm' }).children(
                rtlMode ? rtlCopy.action : 'Action',
              ),
            ],
          }),
        ],
      }),
      Item(h, {
        variant: 'outline',
        size: 'sm',
        element: 'a',
        href: '#',
        children: item => [
          item.media({
            children: [Icon(h, { name: 'badge-check', size: 'md' })],
          }),
          item.content({
            children: [
              item.title({
                children: [
                  rtlMode
                    ? rtlCopy.verifiedTitle
                    : 'Your profile has been verified.',
                ],
              }),
            ],
          }),
          item.actions({
            children: [Icon(h, { name: 'chevron-right', size: 'sm' })],
          }),
        ],
      }),
    )
    return rtlMode
      ? h.div.attrs({ dir: 'rtl' }).class('contents').children(body)
      : body
  }
const rows =
  (kind: 'variant' | 'size'): DocsExampleImplementation['view'] =>
  h => {
    const data = (
      kind === 'variant'
        ? [
            [{}, 'Default Variant', 'Transparent background with no border.'],
            [
              { variant: 'outline' as const },
              'Outline Variant',
              'Outlined style with a visible border.',
            ],
            [
              { variant: 'muted' as const },
              'Muted Variant',
              'Muted background for secondary content.',
            ],
          ]
        : [
            [
              { variant: 'outline' as const },
              'Default Size',
              'The standard size for most use cases.',
            ],
            [
              { variant: 'outline' as const, size: 'sm' as const },
              'Small Size',
              'A compact size for dense layouts.',
            ],
            [
              { variant: 'outline' as const, size: 'xs' as const },
              'Extra Small Size',
              'The most compact size available.',
            ],
          ]
    ) as ReadonlyArray<
      readonly [
        Readonly<{ variant?: 'outline' | 'muted'; size?: 'sm' | 'xs' }>,
        string,
        string,
      ]
    >
    return h.div.class('item-docs-stack').children(
      data.map(([props, title, description]) =>
        Item(h, {
          ...props,
          children: item => [
            item.media({
              variant: 'icon',
              children: [Icon(h, { name: 'inbox' })],
            }),
            item.content({
              children: [
                item.title({ children: [title] }),
                item.description({ children: [description] }),
              ],
            }),
          ],
        }),
      ),
    )
  }
const iconExample: DocsExampleImplementation['view'] = h =>
  h.div.class('item-docs-stack', 'item-docs-stack-lg').children(
    Item(h, {
      variant: 'outline',
      children: item => [
        item.media({
          variant: 'icon',
          children: [Icon(h, { name: 'shield-alert' })],
        }),
        item.content({
          children: [
            item.title({ children: ['Security Alert'] }),
            item.description({
              children: ['New login detected from unknown device.'],
            }),
          ],
        }),
        item.actions({
          children: [
            Button(h, { variant: 'outline', size: 'sm' }).children('Review'),
          ],
        }),
      ],
    }),
  )
const avatarExample: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('item-docs-stack', 'item-docs-stack-lg').children(
    Item(h, {
      variant: 'outline',
      children: item => [
        item.media({
          children: [
            avatar(
              h,
              `${context.idPrefix}-er`,
              'https://github.com/evilrabbit.png',
              'Evil Rabbit',
              'ER',
            ),
          ],
        }),
        item.content({
          children: [
            item.title({ children: ['Evil Rabbit'] }),
            item.description({ children: ['Last seen 5 months ago'] }),
          ],
        }),
        item.actions({ children: [plusButton(h, 'Invite', 'icon-sm')] }),
      ],
    }),
    Item(h, {
      variant: 'outline',
      children: item => [
        item.media({
          children: [
            h.div
              .class('item-docs-avatar-stack')
              .children(
                avatar(
                  h,
                  `${context.idPrefix}-crease`,
                  '/logo-mark.svg',
                  '@creaseui',
                  'CU',
                  'hidden sm:flex',
                ),
                avatar(
                  h,
                  `${context.idPrefix}-max`,
                  'https://github.com/maxleiter.png',
                  '@maxleiter',
                  'LR',
                  'hidden sm:flex',
                ),
                avatar(
                  h,
                  `${context.idPrefix}-rabbit`,
                  'https://github.com/evilrabbit.png',
                  '@evilrabbit',
                  'ER',
                ),
              ),
          ],
        }),
        item.content({
          children: [
            item.title({ children: ['No Team Members'] }),
            item.description({
              children: ['Invite your team to collaborate on this project.'],
            }),
          ],
        }),
        item.actions({
          children: [
            Button(h, { variant: 'outline', size: 'sm' }).children('Invite'),
          ],
        }),
      ],
    }),
  )
const imageExample: DocsExampleImplementation['view'] = h =>
  h.div.class('item-docs-stack').children(
    ItemGroup(h, {
      className: 'gap-4',
      entries: music.map(song => ({
        key: song.title,
        children: [
          Item(h, {
            variant: 'outline',
            element: 'a',
            href: '#',
            children: item => [
              item.media({
                variant: 'image',
                children: [
                  h.img.attrs({
                    src: `https://avatar.vercel.sh/${song.title}`,
                    alt: song.title,
                    class: 'item-docs-song-img',
                  }),
                ],
              }),
              item.content({
                children: [
                  item.title({
                    className: 'line-clamp-1',
                    children: [
                      `${song.title} - `,
                      h.span
                        .class('text-muted-foreground')
                        .children(song.album),
                    ],
                  }),
                  item.description({ children: [song.artist] }),
                ],
              }),
              item.content({
                className: 'flex-none text-center',
                children: [item.description({ children: [song.duration] })],
              }),
            ],
          }),
        ],
      })),
    }),
  ) as unknown as View.Input<DocsMessage>
const groupExample: DocsExampleImplementation['view'] = (h, context) =>
  ItemGroup(h, {
    className: 'max-w-sm',
    entries: people.map(person => ({
      key: person.username,
      children: [
        Item(h, {
          variant: 'outline',
          children: item => [
            item.media({
              children: [
                avatar(
                  h,
                  `${context.idPrefix}-${person.username}`,
                  person.avatar,
                  `@${person.username}`,
                  person.username.charAt(0),
                  'size-10 grayscale',
                ),
              ],
            }),
            item.content({
              children: [
                item.title({ children: [person.username] }),
                item.description({ children: [person.email] }),
              ],
            }),
            item.actions({
              children: [plusButton(h, `Invite ${person.username}`)],
            }),
          ],
        }),
      ],
    })),
  })
const headerExample: DocsExampleImplementation['view'] = h =>
  h.div.class('item-docs-grid').children(
    ItemGroup(h, {
      className: 'grid grid-cols-3 gap-4',
      entries: models.map(entry => ({
        key: entry.name,
        children: [
          Item(h, {
            variant: 'outline',
            children: item => [
              item.header({
                children: [
                  h.img.attrs({
                    src: entry.image,
                    alt: entry.name,
                    class: 'item-docs-model-img',
                  }),
                ],
              }),
              item.content({
                children: [
                  item.title({ children: [entry.name] }),
                  item.description({ children: [entry.description] }),
                ],
              }),
            ],
          }),
        ],
      })),
    }),
  ) as unknown as View.Input<DocsMessage>
const linkExample: DocsExampleImplementation['view'] = h =>
  h.div.class('item-docs-stack').children(
    Item(h, {
      element: 'a',
      href: '#',
      children: item => [
        item.content({
          children: [
            item.title({ children: ['Visit our documentation'] }),
            item.description({
              children: ['Learn how to get started with our components.'],
            }),
          ],
        }),
        item.actions({
          children: [Icon(h, { name: 'chevron-right', size: 'sm' })],
        }),
      ],
    }),
    Item(h, {
      variant: 'outline',
      element: 'a',
      href: '#',
      target: '_blank',
      rel: 'noopener noreferrer',
      children: item => [
        item.content({
          children: [
            item.title({ children: ['External resource'] }),
            item.description({
              children: ['Opens in a new tab with security attributes.'],
            }),
          ],
        }),
        item.actions({
          children: [Icon(h, { name: 'external-link', size: 'sm' })],
        }),
      ],
    }),
  )

const MenuMessage = UiSchema.TaggedEnum({
  OpenedMenu: {},
  ClosedMenu: {},
  PickedPerson: { value: Schema.String },
})
const DropdownDemo = Html.component({
  name: 'DocsItemDropdown',
  props: Schema.Struct({ idPrefix: Schema.String }),
  model: Schema.Struct({ open: Schema.Boolean }),
  message: MenuMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    OpenedMenu: $ => $.evolve({ open: true }),
    ClosedMenu: $ => $.evolve({ open: false }),
    PickedPerson: $ => $.evolve({ open: false }),
  },
  view: (h, model) =>
    DropdownMenu(h, {
      key: `${h.props.idPrefix}-people`,
      label: 'Select a person',
      trigger: Button(h, { variant: 'outline' }).children(
        'Select',
        Icon(h, { name: 'chevron-down', size: 'sm' }),
      ),
      props: {
        open: model.open,
        align: 'end',
        items: people.map(person => ({
          value: person.username,
          label: person.username,
        })),
      },
      decorateItem: item => {
        const person =
          people.find(candidate => candidate.username === item.value) ??
          people[0]
        return {
          label: Item(h, {
            size: 'xs',
            className: 'w-full p-2',
            children: parts => [
              parts.media({
                children: [
                  avatar(
                    h,
                    `${h.props.idPrefix}-menu-${person.username}`,
                    person.avatar,
                    `@${person.username}`,
                    person.username.charAt(0),
                    'size-6.5 grayscale',
                  ),
                ],
              }),
              parts.content({
                children: [
                  parts.title({ children: [person.username] }),
                  parts.description({
                    className: 'leading-none',
                    children: [person.email],
                  }),
                ],
              }),
            ],
          }),
        }
      },
      onEmit: {
        RequestedOpen: () => MenuMessage.OpenedMenu(),
        RequestedClose: () => MenuMessage.ClosedMenu(),
        Picked: ({ value }) => MenuMessage.PickedPerson({ value }),
        Highlighted: () => undefined,
        RequestedQuery: () => undefined,
        Settled: () => undefined,
      },
    }),
})
const dropdownExample: DocsExampleImplementation['view'] = (h, context) =>
  DropdownDemo(h, {
    key: `${context.idPrefix}-dropdown`,
    props: { idPrefix: context.idPrefix },
  })

const source = exampleApplicationSource({
  imports: `import { Item } from '@/ui/effect/ui'
import './item.css'`,
  body: `Item(h, {
  variant: 'outline',
  children: item => [
    item.content({ children: [item.title({ children: ['Basic Item'] })] }),
  ],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Item } from '@/ui/effect/ui'\n\nItem(h, { variant: 'outline', children })`,
  examples: [
    { title: 'Basic', view: basic(false), source },
    { title: 'Variant', view: rows('variant'), source },
    { title: 'Size', view: rows('size'), source },
    { title: 'Icon', view: iconExample, source },
    { title: 'Avatar', view: avatarExample, source },
    { title: 'Image', view: imageExample, source },
    { title: 'Group', view: groupExample, source },
    { title: 'Header', view: headerExample, source },
    { title: 'Link', view: linkExample, source },
    { title: 'Dropdown', view: dropdownExample, source },
    { title: 'RTL', view: basic(true), source },
  ],
})

import type { View } from '@effect/ui'

import {
  Avatar,
  AvatarGroup,
  Button,
  Empty,
  Icon,
  InputGroup,
  Kbd,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './empty.css'

type H = import('@effect/ui/html').Html.H<DocsMessage>
const action = (
  h: H,
  variant: 'default' | 'outline',
  label: string,
  icon?: View.Input<DocsMessage>,
) =>
  Button<DocsMessage>(h, { variant }).children(
    ...(icon === undefined ? [label] : [icon, label]),
  ) as View.Content<DocsMessage, never>
const linkRow = (h: H, label: string) =>
  h.a
    .class('empty-docs-link')
    .attrs({ href: '#' })
    .children(label, Icon<DocsMessage>(h, { name: 'arrow-up-right' }))
const project =
  (rtl = false): DocsExampleImplementation['view'] =>
  h =>
    h.div.class(rtl ? 'empty-docs-rtl' : undefined).children(
      Empty<DocsMessage>(h, {
        className: 'empty-docs-shell',
        media: Icon<DocsMessage>(h, { name: 'folder-code', size: 'md' }),
        mediaVariant: 'icon',
        title: rtl ? 'لا توجد مشاريع بعد' : 'No Projects Yet',
        description: rtl
          ? 'لم تقم بإنشاء أي مشاريع بعد. ابدأ بإنشاء مشروعك الأول.'
          : "You haven't created any projects yet. Get started by creating your first project.",
        children: [
          h.div
            .class('empty-docs-actions')
            .children(
              action(h, 'default', rtl ? 'إنشاء مشروع' : 'Create Project'),
              action(h, 'outline', rtl ? 'استيراد مشروع' : 'Import Project'),
            ) as View.Content<DocsMessage, never>,
          linkRow(h, rtl ? 'تعرف على المزيد' : 'Learn More'),
        ],
      }),
    )

const outline: DocsExampleImplementation['view'] = h =>
  h.div.class('empty-docs-dashed').children(
    Empty<DocsMessage>(h, {
      className: 'empty-docs-shell',
      media: Icon<DocsMessage>(h, { name: 'cloud' }),
      mediaVariant: 'icon',
      title: 'Cloud Storage Empty',
      description:
        'Upload files to your cloud storage to access them anywhere.',
      children: [action(h, 'outline', 'Upload Files')],
    }),
  )

const background: DocsExampleImplementation['view'] = h =>
  h.div.class('empty-docs-background').children(
    Empty<DocsMessage>(h, {
      className: 'empty-docs-shell',
      media: Icon<DocsMessage>(h, { name: 'bell' }),
      mediaVariant: 'icon',
      title: 'No Notifications',
      description: "You're all caught up. New notifications will appear here.",
      children: [
        action(
          h,
          'outline',
          'Refresh',
          Icon<DocsMessage>(h, { name: 'refresh-ccw' }),
        ),
      ],
    }),
  )

const avatarExample: DocsExampleImplementation['view'] = (h, context) =>
  Empty<DocsMessage>(h, {
    className: 'empty-docs-shell',
    media: Avatar<DocsMessage>(h, {
      key: `${context.idPrefix}-offline-avatar`,
      props: {},
      alt: '@creaseui',
      fallbackContent: ['LR'],
      className: 'empty-docs-avatar',
    }),
    title: 'User Offline',
    description:
      'This user is currently offline. You can leave a message to notify them or try again later.',
    children: [action(h, 'default', 'Leave Message')],
  })

const avatarGroupExample: DocsExampleImplementation['view'] = (h, context) =>
  Empty<DocsMessage>(h, {
    className: 'empty-docs-shell',
    media: AvatarGroup<DocsMessage>(h, {
      ariaLabel: 'Team members',
      className: 'empty-docs-group-avatar',
      children: (
        [
          ['creaseui', 'CU'],
          ['maxleiter', 'LR'],
          ['evilrabbit', 'ER'],
        ] as const
      ).map(([name, fallback]) =>
        Avatar<DocsMessage>(h, {
          key: `${context.idPrefix}-${name}`,
          props: {},
          alt: `@${name}`,
          fallbackContent: [fallback],
        }),
      ),
    }),
    title: 'No Team Members',
    description: 'Invite your team to collaborate on this project.',
    children: [
      action(
        h,
        'default',
        'Invite Members',
        Icon<DocsMessage>(h, { name: 'plus' }),
      ),
    ],
  })

const inputGroupExample: DocsExampleImplementation['view'] = h =>
  Empty<DocsMessage>(h, {
    className: 'empty-docs-shell',
    title: '404 - Not Found',
    description:
      "The page you're looking for doesn't exist. Try searching for what you need below.",
    children: [
      InputGroup<DocsMessage>(h, {
        className: 'empty-docs-input-width',
        focusControlId: 'docs-empty-search',
        addOns: {
          'inline-start': Icon<DocsMessage>(h, { name: 'search' }),
          'inline-end': Kbd<DocsMessage>(h, { children: ['/'] }),
        },
        control: group =>
          group.input(
            h.input.attrs({
              id: 'docs-empty-search',
              placeholder: 'Try searching for pages...',
            }),
          ),
      }),
      h.div
        .class('empty-docs-support')
        .children(
          h.span.children(
            'Need help? ',
            h.a.attrs({ href: '#' }).children('Contact support'),
          ),
        ),
    ],
  })

const emptySource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Avatar, Button, Empty, Icon, InputGroup, Kbd } from '@/ui/effect/ui'
import './empty.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Empty } from '@/ui/effect/ui'

Empty<DocsMessage>(h, { title: 'No results', description: 'Try another search.' })`,
  examples: [
    {
      title: 'Create a project',
      view: project(),
      source: emptySource(`Empty<DocsMessage>(h, {
  media: Icon<DocsMessage>(h, { name: 'folder-code', size: 'md' }),
  mediaVariant: 'icon',
  title: 'No Projects Yet',
  description: "You haven't created any projects yet.",
})`),
    },
    {
      title: 'Outline',
      view: outline,
      source: emptySource(`h.div.class('empty-docs-dashed').children(
  Empty<DocsMessage>(h, { media: Icon<DocsMessage>(h, { name: 'cloud' }), mediaVariant: 'icon', title: 'Cloud Storage Empty' }),
)`),
    },
    {
      title: 'Background',
      view: background,
      source: emptySource(`h.div.class('empty-docs-background').children(
  Empty<DocsMessage>(h, { media: Icon<DocsMessage>(h, { name: 'bell' }), mediaVariant: 'icon', title: 'No Notifications' }),
)`),
    },
    {
      title: 'Avatar',
      view: avatarExample,
      source: emptySource(`Empty<DocsMessage>(h, {
  media: Avatar<DocsMessage>(h, { props: {}, alt: '@creaseui', fallbackContent: ['LR'] }),
  title: 'User Offline',
})`),
    },
    {
      title: 'Avatar Group',
      view: avatarGroupExample,
      source: emptySource(`Empty<DocsMessage>(h, {
  media: AvatarGroup<DocsMessage>(h, { ariaLabel: 'Team members', children: avatars }),
  title: 'No Team Members',
})`),
    },
    {
      title: 'InputGroup',
      view: inputGroupExample,
      source: emptySource(`Empty<DocsMessage>(h, {
  title: '404 - Not Found',
  children: [InputGroup<DocsMessage>(h, { control: group => group.input(h.input) })],
})`),
    },
    {
      title: 'RTL',
      view: project(true),
      source: emptySource(`h.div.class('empty-docs-rtl').children(
  Empty<DocsMessage>(h, { title: 'لا توجد مشاريع بعد' }),
)`),
    },
  ],
})

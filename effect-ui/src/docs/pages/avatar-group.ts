import type { Html } from '@effect/ui/html'

import {
  Avatar,
  AvatarGroup,
  AvatarGroupOverflow,
  AvatarStatusDot,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './avatar-group.css'

const sources = {
  Foldkit: 'https://github.com/foldkit.png',
  Devin: 'https://avatars.githubusercontent.com/in/811515?v=4',
  'Cognition AI': 'https://github.com/cognition-ai.png',
  'Crease UI': '/logo-mark.svg',
} as const

type Entry = Readonly<{ name: string; src?: string }>
type Section = Readonly<{
  label: string
  size: 'sm' | 'default' | 'lg'
  avatars: ReadonlyArray<Entry>
  overflow?: number
}>

const team = ['Foldkit', 'Devin', 'Cognition AI', 'Crease UI', 'Astryx'].map(
  name => ({ name }),
)
const members = team.slice(0, 3)
const photos = ['Foldkit', 'Devin', 'Cognition AI', 'Crease UI'].map(name => ({
  name,
  src: sources[name as keyof typeof sources],
}))

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)

const avatar = <Msg>(
  h: Html.H<Msg>,
  entry: Entry,
  key: string,
  size: Section['size'],
) =>
  Avatar(h, {
    key,
    props: entry.src === undefined ? {} : { src: entry.src },
    alt: entry.name,
    fallbackContent: [initials(entry.name)],
    ...(size === 'default' ? {} : { size }),
  })

const renderGroups =
  (sections: ReadonlyArray<Section>): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div.class('avatar-group-docs-stack').children(
      sections.map((section, sectionIndex) =>
        h.div.class('avatar-group-docs-section').children(
          h.div.class('avatar-group-docs-label').children(section.label),
          AvatarGroup(h, {
            ariaLabel: section.label,
            avatarSize: section.size === 'default' ? 'md' : section.size,
            children: [
              ...section.avatars.map((entry, index) =>
                avatar(
                  h,
                  entry,
                  `${context.idPrefix}-${sectionIndex}-${index}`,
                  section.size,
                ),
              ),
              section.overflow === undefined
                ? undefined
                : AvatarGroupOverflow(h, {
                    count: section.overflow,
                    avatarSize:
                      section.size === 'default' ? 'md' : section.size,
                  }),
            ],
          }),
        ),
      ),
    )

const renderStatus: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('avatar-group-docs-stack').children(
    (
      [
        ['Foldkit', 'success', 'Online'],
        ['Devin', 'neutral', 'Offline'],
        ['Cognition AI', 'error', 'Busy'],
      ] as const
    ).map(([name, variant, label], index) =>
      h.div.class('avatar-group-docs-status').children(
        Avatar(h, {
          key: `${context.idPrefix}-status-${index}`,
          props: {},
          alt: name,
          fallbackContent: [initials(name)],
          badge: [
            AvatarStatusDot(h, {
              variant: variant as 'success' | 'neutral' | 'error',
              ariaLabel: label,
            }),
          ],
        }),
        h.span.children(label),
      ),
    ),
  )

const source = exampleApplicationSource({
  imports: `import { Avatar, AvatarGroup, AvatarGroupOverflow } from '@/ui/effect/ui'
import './avatar-group.css'`,
  body: `AvatarGroup(h, {
  ariaLabel: 'Team members',
  children: [
    Avatar(h, { key: 'member', props: {}, alt: 'Foldkit', fallbackContent: ['F'] }),
    AvatarGroupOverflow(h, { count: 2 }),
  ],
})`,
})

const examples: ReadonlyArray<
  readonly [string, DocsExampleImplementation['view']]
> = [
  [
    'Avatar Group',
    renderGroups([
      { label: 'Team members', size: 'lg', avatars: team },
      {
        label: 'With overflow',
        size: 'lg',
        avatars: team.slice(0, 3),
        overflow: 2,
      },
    ]),
  ],
  [
    'Avatar Group — Interactive',
    renderGroups([
      { label: 'Reviewers', size: 'lg', avatars: members, overflow: 15 },
      { label: 'Compact, static', size: 'sm', avatars: members, overflow: 15 },
    ]),
  ],
  [
    'Avatar — Group',
    renderGroups([
      { label: 'Team members', size: 'lg', avatars: photos, overflow: 3 },
      {
        label: 'Larger group',
        size: 'lg',
        avatars: photos.slice(0, 3),
        overflow: 8,
      },
    ]),
  ],
  ['Avatar — Status Dot', renderStatus],
]

export const componentDocs = defineComponentDocs({
  usage: `import { AvatarGroup } from '@/ui/effect/ui'

AvatarGroup(h, { children: [] })`,
  examples: examples.map(([title, view]) => ({ title, view, source })),
})

import type { Html } from '@effect/ui/html'

import { Button, HStack, Icon, Section, VStack } from '#components'
import { defineComponentDocs, type DocsMessage } from '../types'
import { exampleApplicationSource } from './source'
import './section.css'

const features = [
  '10 team members',
  'Unlimited projects',
  'Priority support',
  'Advanced analytics',
]

const text = (h: Html.H<DocsMessage>, className: string, content: string) =>
  h.p.class(className).children(content)
const bold = (h: Html.H<DocsMessage>, content: string) =>
  text(h, 'section-docs-bold', content)
const supporting = (h: Html.H<DocsMessage>, content: string) =>
  text(h, 'section-docs-supporting', content)
const muted = (h: Html.H<DocsMessage>, content: string) =>
  text(h, 'section-docs-muted', content)
const body = (h: Html.H<DocsMessage>, content: string) =>
  text(h, 'section-docs-body', content)
const display = (h: Html.H<DocsMessage>, content: string) =>
  text(h, 'section-docs-display', content)

const sectionSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Button, HStack, Icon, Section, VStack } from '@/ui/effect/ui'
import './section.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Section } from '@/ui/effect/ui'

Section(h, { variant: 'muted', padding: 5, children: ['Content'] })`,
  examples: [
    {
      title: 'Section — Variants',
      view: h => {
        const inner = (title: string, description: string) =>
          VStack(h, {
            gap: 1,
            children: [bold(h, title), supporting(h, description)],
          })
        return VStack(h, {
          gap: 6,
          children: [
            Section(h, {
              variant: 'section',
              padding: 5,
              children: [inner('Section', 'White background.')],
            }),
            Section(h, {
              variant: 'muted',
              padding: 5,
              children: [inner('Wash', 'Gray background.')],
            }),
            Section(h, {
              variant: 'transparent',
              padding: 5,
              children: [
                inner(
                  'Transparent',
                  'No background, shows the color behind it.',
                ),
              ],
            }),
          ],
        })
      },
      source: sectionSource(`VStack(h, {
  gap: 6,
  children: [
    Section(h, { variant: 'section', padding: 5, children: ['Section'] }),
    Section(h, { variant: 'muted', padding: 5, children: ['Wash'] }),
  ],
})`),
    },
    {
      title: 'Section — Default with Wash',
      view: h =>
        VStack(h, {
          gap: 2,
          children: [
            Section(h, {
              variant: 'section',
              padding: 4,
              children: [
                VStack(h, {
                  gap: 3,
                  hAlign: 'center',
                  children: [
                    VStack(h, {
                      gap: 1,
                      hAlign: 'center',
                      children: [
                        display(h, 'Pro Plan'),
                        muted(h, 'Everything you need to scale your team.'),
                      ],
                    }),
                    VStack(h, {
                      gap: 2,
                      children: features.map(feature =>
                        HStack(h, {
                          gap: 2,
                          vAlign: 'center',
                          children: [
                            Icon(h, { name: 'check', size: 'sm' }),
                            body(h, feature),
                          ],
                        }),
                      ),
                    }),
                  ],
                }),
              ],
            }),
            Section(h, {
              variant: 'muted',
              padding: 6,
              children: [
                VStack(h, {
                  gap: 2,
                  hAlign: 'center',
                  children: [
                    HStack(h, {
                      gap: 2,
                      vAlign: 'center',
                      children: [display(h, '$49'), supporting(h, '/ month')],
                    }),
                    Button(h).children('Upgrade'),
                  ],
                }),
              ],
            }),
          ],
        }),
      source: sectionSource(`VStack(h, {
  gap: 2,
  children: [
    Section(h, { variant: 'section', padding: 4, children: ['Pro Plan'] }),
    Section(h, { variant: 'muted', padding: 6, children: [Button(h).children('Upgrade')] }),
  ],
})`),
    },
    {
      title: 'Section — With Dividers',
      view: h => {
        const row = (
          title: string,
          description: string,
          dividers?: ReadonlyArray<'bottom'>,
        ) =>
          Section(h, {
            variant: 'section',
            padding: 5,
            ...(dividers === undefined ? {} : { dividers }),
            children: [
              VStack(h, {
                gap: 1,
                children: [bold(h, title), muted(h, description)],
              }),
            ],
          })
        return VStack(h, {
          gap: 0,
          children: [
            row('Account', 'Manage your profile, email, and password.', [
              'bottom',
            ]),
            row('Notifications', 'Choose what updates you receive and how.', [
              'bottom',
            ]),
            row('Privacy', 'Control who can see your activity and data.'),
          ],
        })
      },
      source: sectionSource(`VStack(h, {
  gap: 0,
  children: [
    Section(h, { variant: 'section', padding: 5, dividers: ['bottom'], children: ['Account'] }),
    Section(h, { variant: 'section', padding: 5, children: ['Privacy'] }),
  ],
})`),
    },
  ],
})

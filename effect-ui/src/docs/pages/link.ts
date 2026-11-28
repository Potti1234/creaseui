import { Html } from '@effect/ui/html'
import { Schema } from 'effect'
import { Link, Text } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './link.css'

const externalLinks = [
  ['GitHub', 'https://github.com', false],
  ['MDN', 'https://developer.mozilla.org', false],
  ['Foldkit', 'https://foldkit.dev', true],
] as const
const tooltipLinks = [
  ['Settings', '/settings', 'Manage your application preferences'],
  ['Profile', '/profile', 'View and edit your profile'],
  ['Help', '/help', 'Browse help articles and support'],
] as const

const viewExternal: DocsExampleImplementation['view'] = h =>
  h.div.class('link-docs-column').children(
    externalLinks.map(([label, href, underlined]) =>
      Link(h, {
        href,
        external: true,
        standalone: true,
        ...(underlined ? { variant: 'underlined' as const } : {}),
        children: [label],
      }),
    ),
  )

const tooltipLink = (
  name: string,
  label: string,
  href: string,
  content: string,
  secondary = false,
) =>
  Html.component({
    name,
    model: Schema.Null,
    message: Schema.Never,
  }).make({
    init: () => null,
    update: $ => $.model,
    view: h =>
      Link(h, {
        href,
        standalone: true,
        tooltip: { content },
        ...(secondary ? { color: 'secondary' as const } : {}),
        children: [label],
      }),
  })

const tooltipLinkComponents = tooltipLinks.map(
  ([label, href, content], index) =>
    tooltipLink(`DocsLinkTooltip${index}`, label, href, content, index === 2),
)

const viewTooltips: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('link-docs-column').children(
    tooltipLinkComponents.map((component, index) =>
      component(h, {
        key: `${context.idPrefix}-tooltip-link-${String(index)}`,
        props: {},
      }),
    ),
  )

const linkSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Link, Text } from '@/ui/effect/ui'
import './link.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Link } from '@/ui/effect/ui'

Link(h, { href: '/docs', standalone: true, children: ['Documentation'] })`,
  examples: [
    {
      title: 'Link',
      view: h =>
        Link(h, {
          href: '#',
          standalone: true,
          children: ['Documentation'],
        }),
      source: linkSource(
        `Link(h, { href: '#', standalone: true, children: ['Documentation'] })`,
      ),
    },
    {
      title: 'Link — Inline Text',
      view: h =>
        Text(h, {
          type: 'body',
          display: 'block',
          children: [
            'Browse the ',
            Link(h, { href: '#', children: ['documentation'] }),
            ' for installation steps.',
          ],
        }),
      source: linkSource(`Text(h, {
  type: 'body',
  display: 'block',
  children: [
    'Browse the ',
    Link(h, { href: '#', children: ['documentation'] }),
    ' for installation steps.',
  ],
})`),
    },
    {
      title: 'Link — External Links',
      view: viewExternal,
      source: linkSource(`h.div.class('link-docs-column').children(
  Link(h, { href: 'https://github.com', external: true, standalone: true, children: ['GitHub'] }),
  Link(h, { href: 'https://developer.mozilla.org', external: true, standalone: true, children: ['MDN'] }),
)`),
    },
    {
      title: 'Link — Underlined',
      view: h =>
        Link(h, {
          href: '#',
          variant: 'underlined',
          standalone: true,
          children: ['Underlined documentation'],
        }),
      source: linkSource(
        `Link(h, { href: '#', variant: 'underlined', standalone: true, children: ['Underlined documentation'] })`,
      ),
    },
    {
      title: 'Link — With Tooltips',
      view: viewTooltips,
      source: linkSource(`h.div.class('link-docs-column').children(
  Link(h, {
    href: '/settings',
    standalone: true,
    tooltip: { content: 'Manage your application preferences' },
    children: ['Settings'],
  }),
)`),
    },
  ],
})

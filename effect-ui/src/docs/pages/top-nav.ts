import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Icon, TopNav } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedOpenMenu: { key: Schema.NullOr(Schema.String) },
})
const items = [
  { key: 'home', label: 'Home', href: '#', active: true },
  { key: 'products', label: 'Products', href: '#' },
  { key: 'about', label: 'About', href: '#' },
] as const
const menuItems = [
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Track product usage',
    href: '#',
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Protect customer data',
    href: '#',
  },
  {
    key: 'automation',
    label: 'Automation',
    description: 'Automate recurring work',
    href: '#',
  },
] as const
const TopNavDemo = Html.component({
  name: 'DocsTopNavDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ open: Schema.NullOr(Schema.String) }),
  message: Message,
}).make({
  init: () => ({ open: null }),
  update: { ChangedOpenMenu: ($, { key }) => $.evolve({ open: key }) },
  view: (h, model) => {
    const kind = h.props.kind
    const nav = (
      label: string,
      center = false,
      logo = false,
      extra: Record<string, unknown> = {},
    ) =>
      TopNav(h, {
        key: `${label}-${kind}`,
        label,
        openMenu: model.open,
        onOpenChange: (key: string | null) => Message.ChangedOpenMenu({ key }),
        heading: {
          text: logo ? 'Acme Inc' : 'My App',
          logo: logo ? Icon(h, { name: 'package', size: 'sm' }) : undefined,
          logoLabel: logo ? 'Acme' : undefined,
          subtitle:
            kind === 'heading' || kind === 'topHeading'
              ? 'Product documentation'
              : undefined,
          overline:
            kind === 'heading' || kind === 'topHeading'
              ? 'Platform'
              : undefined,
        },
        startItems: center ? [] : items,
        centerItems: center ? items : [],
        endContent: h.div
          .class('flex items-center gap-2')
          .children(
            Button(h, { variant: 'ghost', size: 'sm' }).children('Sign in'),
            Button(h, { size: 'sm' }).children('Get started'),
          ),
        ...extra,
      } as any)
    const menuNav = (label: string, mega = false, multiple = false) =>
      nav(label, false, false, {
        centerItems: [
          {
            kind: mega ? 'mega-menu' : 'menu',
            key: 'platform',
            label: 'Platform',
            items: menuItems,
            ...(mega
              ? {
                  featured: {
                    title: 'Global Network',
                    description: 'Deploy close to your users.',
                    linkLabel: 'Learn more',
                    href: '#',
                  },
                }
              : {}),
          },
          ...(multiple
            ? [
                {
                  kind: 'menu' as const,
                  key: 'resources',
                  label: 'Resources',
                  items: [
                    { key: 'docs', label: 'Documentation', href: '#' },
                    { key: 'api', label: 'API Reference', href: '#' },
                    { key: 'community', label: 'Community Forum', href: '#' },
                  ],
                },
              ]
            : []),
        ],
        startItems: items.slice(0, 1),
      })
    if (kind === 'centered') return nav('Centered navigation', true)
    if (kind === 'enterprise') return nav('Enterprise dashboard', false, true)
    if (kind === 'hover') return menuNav('Hover menu')
    if (kind === 'mega') return menuNav('Mega menu', true)
    if (kind === 'multiple') return menuNav('Multiple dropdowns', false, true)
    if (kind === 'logo') return nav('Navigation with logo', false, true)
    if (kind === 'megaItems')
      return h.div.class('grid w-full max-w-md gap-2').children(
        menuItems.map(item =>
          h.a
            .key(item.key)
            .class('flex gap-3 rounded-md p-3 hover:bg-accent')
            .attrs({ href: '#' })
            .children(
              Icon(h, { name: 'chart-bar-stacked', size: 'sm' }) as never,
              h.span.children(
                h.strong.class('block text-sm').children(item.label),
                h.span
                  .class('text-xs text-muted-foreground')
                  .children(item.description),
              ),
            ),
        ),
      )
    if (kind === 'featured')
      return h.div
        .class('grid w-full max-w-xs gap-2 rounded-md bg-muted p-3')
        .children(
          h.div.class('aspect-video rounded-sm bg-primary/20'),
          h.strong.children('Global Network'),
          h.p
            .class('text-sm text-muted-foreground')
            .children('Deploy close to your users.'),
          h.a
            .class('text-sm font-medium underline')
            .attr('href', '#')
            .children('Learn more'),
        )
    return nav('Main navigation')
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    TopNavDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Button, TopNav } from '@/ui/effect/ui'`,
  body: `TopNav(h, {
  label: 'Main navigation',
  openMenu: model.openMenu,
  onOpenChange: key => ChangedOpenMenu({ key }),
  heading: { text: 'My App' },
  startItems: [{ key: 'home', label: 'Home', href: '/' }],
  endContent: Button(h, { size: 'sm' }).children('Get started'),
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { TopNav } from '@/ui/effect/ui'\n\nTopNav(h, { label, openMenu, onOpenChange, startItems })`,
  examples: [
    { title: 'Top Nav', view: view('basic'), source },
    { title: 'TopNav — Centered Navigation', view: view('centered'), source },
    {
      title: 'TopNav — Enterprise Dashboard',
      view: view('enterprise'),
      source,
    },
    { title: 'TopNav — Hover Menu', view: view('hover'), source },
    { title: 'TopNav — Mega Menu', view: view('mega'), source },
    { title: 'TopNav — Multiple Dropdowns', view: view('multiple'), source },
    { title: 'TopNav — With Logo', view: view('logo'), source },
    { title: 'TopNavHeading — Basic', view: view('heading'), source },
    { title: 'Top Nav Heading', view: view('topHeading'), source },
    { title: 'TopNavItem — Basic', view: view('item'), source },
    { title: 'Top Nav Item', view: view('topItem'), source },
    { title: 'TopNavMegaMenu — Basic', view: view('mega'), source },
    { title: 'Top Nav Mega Menu', view: view('mega'), source },
    {
      title: 'TopNavMegaMenuFeaturedCard — Basic',
      view: view('featured'),
      source,
    },
    {
      title: 'Top Nav Mega Menu Featured Card',
      view: view('featured'),
      source,
    },
    { title: 'TopNavMegaMenuItem — Basic', view: view('megaItems'), source },
    { title: 'Top Nav Mega Menu Item', view: view('megaItems'), source },
    { title: 'TopNavMenu — Basic', view: view('hover'), source },
    { title: 'Top Nav Menu', view: view('hover'), source },
  ],
})

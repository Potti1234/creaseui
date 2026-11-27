import { Separator } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './separator.css'

type SeparatorKind = 'demo' | 'vertical' | 'menu' | 'list' | 'rtl'

type SeparatorFixture = Readonly<{
  title: string
  kind: SeparatorKind
}>

const fixtures: ReadonlyArray<SeparatorFixture> = [
  { title: 'Basic', kind: 'demo' },
  { title: 'Vertical', kind: 'vertical' },
  { title: 'Menu', kind: 'menu' },
  { title: 'List', kind: 'list' },
  { title: 'RTL', kind: 'rtl' },
]

const copy = (rtl: boolean) =>
  rtl
    ? {
        title: 'CreaseUI',
        subtitle: 'الأساس لنظام التصميم الخاص بك',
        description:
          'مجموعة من المكونات المصممة بشكل جميل يمكنك تخصيصها وتوسيعها والبناء عليها.',
      }
    : {
        title: 'CreaseUI',
        subtitle: 'The Foundation for your Design System',
        description:
          'A set of beautifully designed components that you can customize, extend, and build on.',
      }

const menuItems = [
  { heading: 'Settings', note: 'Manage preferences' },
  { heading: 'Account', note: 'Profile & security' },
  { heading: 'Help', note: 'Support & docs' },
] as const

const listItems = [
  { item: 'Item 1', value: 'Value 1' },
  { item: 'Item 2', value: 'Value 2' },
  { item: 'Item 3', value: 'Value 3' },
] as const

const card = (rtl: boolean): DocsExampleImplementation['view'] => {
  return h => {
    const content = copy(rtl)
    return h.div
      .class('separator-docs-card')
      .attrs(rtl ? { dir: 'rtl' } : {})
      .children(
        h.div
          .class('separator-docs-header')
          .children(
            h.div.class('separator-docs-title').children(content.title),
            h.div.class('separator-docs-muted').children(content.subtitle),
          ),
        Separator(h),
        h.div.children(content.description),
      )
  }
}

const menuItem = (
  h: Parameters<DocsExampleImplementation['view']>[0],
  heading: string,
  note: string,
  hidden: boolean,
) =>
  h.div
    .class(
      'separator-docs-menu-item',
      hidden ? 'separator-docs-md-hidden' : undefined,
    )
    .children(
      h.span.class('separator-docs-title').children(heading),
      h.span.class('separator-docs-menu-note').children(note),
    )

const render: Record<SeparatorKind, DocsExampleImplementation['view']> = {
  demo: card(false),
  rtl: card(true),
  vertical: h =>
    h.div
      .class('separator-docs-vertical')
      .children(
        h.div.children('Blog'),
        Separator(h, { orientation: 'vertical' }),
        h.div.children('Docs'),
        Separator(h, { orientation: 'vertical' }),
        h.div.children('Source'),
      ),
  menu: h =>
    h.div.class('separator-docs-menu').children(
      menuItem(h, menuItems[0].heading, menuItems[0].note, false),
      Separator(h, {
        orientation: 'vertical',
        className: 'separator-docs-menu-separator',
      }),
      menuItem(h, menuItems[1].heading, menuItems[1].note, false),
      Separator(h, {
        orientation: 'vertical',
        className: 'separator-docs-menu-separator separator-docs-md-hidden',
      }),
      menuItem(h, menuItems[2].heading, menuItems[2].note, true),
    ),
  list: h =>
    h.div
      .class('separator-docs-list')
      .children(
        listItems.flatMap((entry, index) => [
          ...(index === 0 ? [] : [Separator(h)]),
          h.dl
            .class('separator-docs-list-row')
            .children(
              h.dt.children(entry.item),
              h.dd.class('separator-docs-muted').children(entry.value),
            ),
        ]),
      ),
}

const bodies: Record<SeparatorKind, string> = {
  demo: `h.div.class('separator-docs-card').children(
  h.div.class('separator-docs-header').children(
    h.div.class('separator-docs-title').children('CreaseUI'),
    h.div.class('separator-docs-muted').children('The Foundation for your Design System'),
  ),
  Separator(h),
  h.div.children('A set of beautifully designed components that you can customize, extend, and build on.'),
)`,
  vertical: `h.div.class('separator-docs-vertical').children(
  h.div.children('Blog'),
  Separator(h, { orientation: 'vertical' }),
  h.div.children('Docs'),
  Separator(h, { orientation: 'vertical' }),
  h.div.children('Source'),
)`,
  menu: `h.div.class('separator-docs-menu').children(
  menuItem(h, 'Settings', 'Manage preferences', false),
  Separator(h, { orientation: 'vertical', className: 'separator-docs-menu-separator' }),
  menuItem(h, 'Account', 'Profile & security', false),
  Separator(h, { orientation: 'vertical', className: 'separator-docs-menu-separator separator-docs-md-hidden' }),
  menuItem(h, 'Help', 'Support & docs', true),
)`,
  list: `h.div.class('separator-docs-list').children(
  items.flatMap((entry, index) => [
    ...(index === 0 ? [] : [Separator(h)]),
    h.dl.class('separator-docs-list-row').children(
      h.dt.children(entry.item),
      h.dd.class('separator-docs-muted').children(entry.value),
    ),
  ]),
)`,
  rtl: `h.div.class('separator-docs-card').attrs({ dir: 'rtl' }).children(
  h.div.class('separator-docs-header').children(
    h.div.class('separator-docs-title').children('CreaseUI'),
    h.div.class('separator-docs-muted').children('الأساس لنظام التصميم الخاص بك'),
  ),
  Separator(h),
  h.div.children('مجموعة من المكونات المصممة بشكل جميل يمكنك تخصيصها وتوسيعها والبناء عليها.'),
)`,
}

export const componentDocs = defineComponentDocs({
  usage: `import { Separator } from '@/ui/effect/ui'

Separator(h)
Separator(h, { orientation: 'vertical' })`,
  examples: fixtures.map(fixture => ({
    title: fixture.title,
    view: render[fixture.kind],
    source: exampleApplicationSource({
      imports: `import { Separator } from '@/ui/effect/ui'
import './separator.css'`,
      body: bodies[fixture.kind],
    }),
  })),
})

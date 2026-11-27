import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Icon, Sidebar } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedSidebar: { open: Schema.Boolean },
  ChangedQuery: { value: Schema.String },
  PressedProjectActions: {},
})
const SidebarDemo = Html.component({
  name: 'DocsSidebarDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ open: Schema.Boolean, query: Schema.String }),
  message: Message,
}).make({
  init: () => ({ open: true, query: '' }),
  update: {
    ChangedSidebar: ($, { open }) => $.evolve({ open }),
    ChangedQuery: ($, { value }) => $.evolve({ query: value }),
    PressedProjectActions: $ => $,
  },
  view: (h, model) => {
    const kind = h.props.kind
    const navigation = (sidebar: any) => {
      const link = (
        label: string,
        icon: string,
        active = false,
        badge?: unknown,
      ) =>
        sidebar.item({
          key: label,
          children: [
            sidebar.link({
              label,
              href: '#',
              active,
              icon: Icon(h, { name: icon as never, size: 'sm' }),
              ...(badge === undefined ? {} : { badge }),
            }),
            label === 'Projects' && kind === 'application'
              ? sidebar.action({
                  label: 'Project actions',
                  onSelect: Message.PressedProjectActions(),
                  children: Icon(h, { name: 'ellipsis', size: 'sm' }),
                })
              : undefined,
          ],
        })
      const platformMenu = sidebar.menu({
        children: [
          link('Dashboard', 'gauge', true),
          link('Inbox', 'inbox', false, '12'),
          link('Projects', 'book-open'),
          link('Calendar', 'calendar'),
        ],
      })
      const documentation = sidebar.item({
        key: 'documentation',
        children: [
          sidebar.link({
            label: 'Documentation',
            href: '#',
            icon: Icon(h, { name: 'book-open', size: 'sm' }),
            badge: Icon(h, { name: 'chevron-down', size: 'sm' }),
            expanded: kind === 'nested',
          }),
          kind === 'nested'
            ? sidebar.subMenu({
                children: ['Introduction', 'Components', 'Changelog'].map(
                  (label, index) =>
                    sidebar.item({
                      key: label,
                      children: [
                        sidebar.link({
                          label,
                          href: '#',
                          active: index === 1,
                          size: 'sm',
                        }),
                      ],
                    }),
                ),
              })
            : undefined,
        ],
      })
      if (kind === 'loading')
        return sidebar.content({
          children: [
            sidebar.group({
              children: [
                sidebar.groupLabel({ children: ['Projects'] }),
                sidebar.menu({
                  children: ['82%', '68%', '76%', '58%'].map(width =>
                    sidebar.item({
                      key: width,
                      children: [sidebar.skeleton(width)],
                    }),
                  ),
                }),
              ],
            }),
          ],
        })
      return h.div.class('flex min-h-full flex-col').children(
        kind === 'application' ||
          kind === 'floating' ||
          kind === 'inset' ||
          kind === 'offcanvas' ||
          kind === 'right'
          ? sidebar.header({
              children: [
                h.div
                  .class('flex items-center gap-2 px-1 py-1')
                  .children(
                    h.div
                      .class(
                        'grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground',
                      )
                      .children('C'),
                    h.span
                      .class('truncate text-sm font-semibold')
                      .children('Crease Workspace'),
                  ),
                sidebar.input(
                  h.input
                    .attrs({
                      type: 'search',
                      placeholder: 'Search navigation',
                      'aria-label': 'Search navigation',
                    })
                    .class('h-9')
                    .value(model.query)
                    .on('input', ({ value }) =>
                      Message.ChangedQuery({ value }),
                    ),
                ),
              ],
            })
          : undefined,
        sidebar.content({
          children: [
            sidebar.group({
              children: [
                sidebar.groupLabel({ children: ['Platform'] }),
                platformMenu,
              ],
            }),
            sidebar.group({
              children: [
                sidebar.groupLabel({ children: ['Learn'] }),
                sidebar.menu({ children: [documentation] }),
              ],
            }),
          ],
        }),
        kind === 'application' ||
          kind === 'floating' ||
          kind === 'inset' ||
          kind === 'offcanvas' ||
          kind === 'right'
          ? sidebar.footer({
              children: [
                sidebar.menu({
                  children: [
                    sidebar.item({
                      key: 'account',
                      children: [
                        sidebar.link({
                          label: 'Ada Lovelace',
                          href: '#',
                          size: 'lg',
                          icon: h.span
                            .class(
                              'grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground',
                            )
                            .children('AL'),
                          badge: Icon(h, {
                            name: 'chevrons-up-down',
                            size: 'sm',
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          : undefined,
      )
    }
    return Sidebar(h, {
      key: `${h.props.idPrefix}-${kind}`,
      label: 'Workspace navigation',
      variant:
        kind === 'floating'
          ? 'floating'
          : kind === 'inset'
            ? 'inset'
            : 'sidebar',
      collapsible:
        kind === 'offcanvas'
          ? 'offcanvas'
          : kind === 'primitives'
            ? 'none'
            : 'icon',
      width: kind === 'right' ? '19rem' : '16rem',
      ...(kind === 'right'
        ? { mobileWidth: '20rem', iconWidth: '3.25rem' }
        : {}),
      presentation: 'contained',
      rail: true,
      props: {
        id: `${h.props.idPrefix}-${kind}`,
        open: model.open,
        side: kind === 'right' ? 'right' : 'left',
      },
      navigation,
      insetHeader: h.strong
        .class('text-sm font-semibold')
        .children('Product overview'),
      children: h.div
        .class('grid gap-4 p-2')
        .children(
          h.div
            .class('grid gap-4 md:grid-cols-2')
            .children(
              h.div.class('h-24 rounded-xl bg-muted').children(),
              h.div.class('h-24 rounded-xl bg-muted').children(),
            ),
          h.div.class('h-32 rounded-xl bg-muted').children(),
        ),
      onEmit: {
        Changed: ({ open }: any) => Message.ChangedSidebar({ open }),
        MobileChanged: ({ open }: any) => Message.ChangedSidebar({ open }),
      },
    } as any)
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    SidebarDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Icon, Sidebar } from '@/ui/effect/ui'`,
  body: `Sidebar(h, {
  props: { id: 'workspace', open: model.open },
  navigation: sidebar => sidebar.content({
    children: [sidebar.menu({ children: [sidebar.item({ children: [sidebar.link({ label: 'Dashboard', href: '/' })] })] })],
  }),
  children: MainContent(h),
  onEmit,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Sidebar } from '@/ui/effect/ui'\n\nSidebar(h, { props: { id, open }, navigation, children, onEmit })`,
  examples: [
    { title: 'Application shell', view: view('application'), source },
    { title: 'Floating sidebar', view: view('floating'), source },
    { title: 'Inset sidebar', view: view('inset'), source },
    { title: 'Off-canvas collapse', view: view('offcanvas'), source },
    { title: 'Menu primitives', view: view('primitives'), source },
    { title: 'Nested navigation', view: view('nested'), source },
    { title: 'Loading navigation', view: view('loading'), source },
    { title: 'Right side and custom width', view: view('right'), source },
  ],
})

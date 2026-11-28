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
const staticIcon = (h: Html.H<DocsMessage>, name: string) =>
  h.span
    .class('inline-grid shrink-0 place-items-center')
    .attr('aria-hidden', 'true')
    .children(Icon(h, { name: name as never, size: 'sm' }))

const staticRow = (
  h: Html.H<DocsMessage>,
  options: {
    readonly label: string
    readonly icon: string
    readonly active?: boolean
    readonly variant?: 'outline' | 'primary'
    readonly badge?: string
    readonly action?: boolean
  },
) =>
  h.li.class('relative min-w-0').children(
    h.button
      .class(
        options.variant === 'primary'
          ? 'flex h-8 w-full min-w-0 items-center gap-2 rounded-md border-0 bg-primary p-2 text-start text-sm font-semibold text-primary-foreground'
          : options.variant === 'outline'
            ? 'flex h-8 w-full min-w-0 items-center gap-2 rounded-md border-0 bg-background p-2 text-start text-sm shadow-[0_0_0_1px_var(--sidebar-border)]'
            : options.active === true
              ? 'flex h-8 w-full min-w-0 items-center gap-2 rounded-md border-0 bg-sidebar-accent p-2 text-start text-sm font-medium'
              : 'flex h-8 w-full min-w-0 items-center gap-2 rounded-md border-0 bg-transparent p-2 text-start text-sm',
      )
      .attrs({ type: 'button' })
      .children(
        staticIcon(h, options.icon),
        h.span.class('min-w-0 truncate').children(options.label),
        options.badge === undefined
          ? undefined
          : h.span
              .class('ms-auto shrink-0 px-1 text-xs tabular-nums')
              .children(options.badge),
      ),
    options.action === true
      ? h.button
          .class(
            'absolute end-1 top-1.5 flex size-5 items-center justify-center rounded-md border-0 bg-transparent p-0 hover:bg-sidebar-accent',
          )
          .attrs({ type: 'button', 'aria-label': `${options.label} actions` })
          .children(Icon(h, { name: 'ellipsis', size: 'sm' }))
      : undefined,
  )

const staticPanel = (h: Html.H<DocsMessage>, kind: string) => {
  const workspaceRow = staticRow(h, {
    label: 'Overview',
    icon: 'gauge',
    active: true,
    badge: '12',
  })
  const rows =
    kind === 'primitives'
      ? [
          workspaceRow,
          staticRow(h, {
            label: 'Inbox',
            icon: 'inbox',
            variant: 'outline',
            action: true,
          }),
          staticRow(h, {
            label: 'Create project',
            icon: 'plus',
            variant: 'primary',
          }),
        ]
      : kind === 'nested'
        ? [
            h.li.class('relative min-w-0').children(
              h.button
                .class(
                  'flex h-8 w-full min-w-0 items-center gap-2 rounded-md border-0 bg-transparent p-2 text-start text-sm',
                )
                .attrs({ type: 'button', 'aria-expanded': 'true' })
                .children(
                  staticIcon(h, 'book-open'),
                  h.span.class('min-w-0 truncate').children('Documentation'),
                  h.span
                    .class('ms-auto shrink-0 px-1')
                    .children(Icon(h, { name: 'chevron-down', size: 'sm' })),
                ),
              h.ul
                .class(
                  'ms-3 grid min-w-0 list-none gap-0.5 border-s border-sidebar-border ps-2',
                )
                .children(
                  ['Introduction', 'Components', 'Changelog'].map(label =>
                    h.li
                      .key(label)
                      .class('relative min-w-0')
                      .children(
                        h.a
                          .class(
                            label === 'Components'
                              ? 'flex min-h-7 w-full min-w-0 items-center rounded-md bg-sidebar-accent p-2 text-start text-sm font-medium'
                              : 'flex min-h-7 w-full min-w-0 items-center rounded-md px-2 py-1 text-start text-sm',
                          )
                          .attr('href', '#')
                          .children(label),
                      ),
                  ),
                ),
            ),
          ]
        : ['82%', '68%', '76%', '58%'].map(width =>
            h.li
              .key(width)
              .class('relative min-w-0')
              .children(
                h.div
                  .class('flex min-h-8 items-center gap-2 px-2 py-1')
                  .children(
                    h.span.class(
                      'size-4 shrink-0 rounded-md bg-sidebar-accent',
                    ),
                    h.span
                      .class(
                        'h-3 rounded-sm bg-sidebar-accent motion-safe:animate-pulse',
                      )
                      .style({ width }),
                  ),
              ),
          )
  return h.div
    .class('flex h-80 w-full items-stretch justify-center bg-muted/30 p-4')
    .children(
      h.div
        .class(
          'h-full min-h-0 w-full max-w-[18rem] overflow-hidden rounded-lg border bg-background',
        )
        .children(
          h.div
            .class(
              'flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground',
            )
            .children(
              h.div
                .class('flex min-w-0 flex-col gap-2 p-2')
                .children(
                  h.div
                    .class('px-2 py-1 text-sm font-semibold')
                    .children(
                      kind === 'loading'
                        ? 'Loading projects'
                        : 'Crease Workspace',
                    ),
                ),
              h.div
                .class(
                  'flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-auto p-2',
                )
                .children(
                  h.div
                    .class('grid min-w-0 gap-1')
                    .children(
                      h.div
                        .class(
                          'truncate px-2 py-1 text-xs font-medium text-sidebar-foreground/70',
                        )
                        .children(
                          kind === 'nested' ? 'Resources' : 'Workspace',
                        ),
                      h.ul
                        .class(
                          'm-0 flex w-full min-w-0 list-none flex-col gap-1 p-0',
                        )
                        .attr('role', 'list')
                        .children(rows),
                    ),
                ),
            ),
        ),
    )
}

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    kind === 'primitives' || kind === 'nested' || kind === 'loading'
      ? staticPanel(h, kind)
      : h.div
          .class(
            'relative h-[26rem] min-h-0 w-full overflow-hidden rounded-lg border bg-background',
          )
          .children(
            SidebarDemo(h, {
              key: `${context.idPrefix}-${kind}`,
              props: { kind, idPrefix: context.idPrefix },
            }) as never,
          )
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

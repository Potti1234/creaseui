import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Icon from '@/lib/icon'
import {
  breadcrumb,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbSeparator,
} from '@/ui/breadcrumb'
import * as Collapsible from '@/ui/collapsible'
import { separator } from '@/ui/separator'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarGroupContent,
  sidebarHeader,
  sidebarInput,
  sidebarInset,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarMenuSub,
  sidebarMenuSubButton,
  sidebarMenuSubItem,
  sidebarProvider,
  sidebarRail,
  sidebarTrigger,
} from '@/ui/sidebar'

type NavGroup = Readonly<{
  title: string
  url: string
  items: ReadonlyArray<
    Readonly<{
      title: string
      url: string
      isActive?: boolean
    }>
  >
}>

// This is sample data copied from the source block.
const data = {
  navMain: [
    {
      title: 'Getting Started',
      url: '#',
      items: [
        { title: 'Installation', url: '#' },
        { title: 'Project Structure', url: '#' },
      ],
    },
    {
      title: 'Build Your Application',
      url: '#',
      items: [
        { title: 'Routing', url: '#' },
        { title: 'Data Fetching', url: '#', isActive: true },
        { title: 'Rendering', url: '#' },
        { title: 'Caching', url: '#' },
        { title: 'Styling', url: '#' },
        { title: 'Optimizing', url: '#' },
        { title: 'Configuring', url: '#' },
        { title: 'Testing', url: '#' },
        { title: 'Authentication', url: '#' },
        { title: 'Deploying', url: '#' },
        { title: 'Upgrading', url: '#' },
        { title: 'Examples', url: '#' },
      ],
    },
    {
      title: 'API Reference',
      url: '#',
      items: [
        { title: 'Components', url: '#' },
        { title: 'File Conventions', url: '#' },
        { title: 'Functions', url: '#' },
        { title: 'next.config.js Options', url: '#' },
        { title: 'CLI', url: '#' },
        { title: 'Edge Runtime', url: '#' },
      ],
    },
    {
      title: 'Architecture',
      url: '#',
      items: [
        { title: 'Accessibility', url: '#' },
        { title: 'Fast Refresh', url: '#' },
        { title: 'Next.js Compiler', url: '#' },
        { title: 'Supported Browsers', url: '#' },
        { title: 'Turbopack', url: '#' },
      ],
    },
    {
      title: 'Community',
      url: '#',
      items: [{ title: 'Contribution Guide', url: '#' }],
    },
  ] satisfies ReadonlyArray<NavGroup>,
}

// MODEL

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  navMain: S.Array(Collapsible.Model),
})
export type Model = typeof Model.Type

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar')
export const GotNavMainMessage = m('GotNavMainMessage', {
  index: S.Number,
  message: Collapsible.Message,
})

export const Message = S.Union([ToggledSidebar, GotNavMainMessage])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  isSidebarOpen: true,
  navMain: data.navMain.map((_, index) =>
    Collapsible.init({
      id: `sidebar-05-nav-main-${index}`,
      isOpen: index === 1,
    }),
  ),
})

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledSidebar: () => [
        evo(model, { isSidebarOpen: current => !current }),
        [],
      ],
      GotNavMainMessage: ({ index, message: childMessage }) => {
        const current = model.navMain[index]

        if (current === undefined) {
          return [model, []]
        }

        const [next, commands] = Collapsible.update(current, childMessage)

        return [
          evo(model, {
            navMain: groups =>
              groups.map((group, groupIndex) =>
                groupIndex === index ? next : group,
              ),
          }),
          Command.mapMessages(commands, nextMessage =>
            GotNavMainMessage({ index, message: nextMessage }),
          ),
        ]
      },
    }),
  )

// VIEW

const brand = (): Html => {
  const h = html<Message>()

  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          sidebarMenuButton({
            size: 'lg',
            href: '#',
            children: [
              h.div(
                [
                  h.Class(
                    'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground',
                  ),
                ],
                [Icon.icon('gallery-vertical-end', { class: 'size-4' })],
              ),
              h.div(
                [h.Class('flex flex-col gap-0.5 leading-none')],
                [
                  h.span([h.Class('font-medium')], ['Documentation']),
                  h.span([], ['v1.0.0']),
                ],
              ),
            ],
          }),
        ],
      }),
    ],
  })
}

const searchForm = (): Html => {
  const h = html<Message>()

  return h.form(
    [],
    [
      sidebarGroup({
        class: 'py-0',
        children: [
          sidebarGroupContent({
            class: 'relative',
            children: [
              h.label(
                [h.For('sidebar-05-search'), h.Class('sr-only')],
                ['Search'],
              ),
              sidebarInput({
                id: 'sidebar-05-search',
                placeholder: 'Search the docs...',
                class: 'pl-8',
              }),
              Icon.search({
                class:
                  'pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none',
              }),
            ],
          }),
        ],
      }),
    ],
  )
}

const navMain = (models: ReadonlyArray<Collapsible.Model>): Html =>
  sidebarGroup<Message>({
    children: [
      sidebarMenu({
        children: data.navMain.flatMap((group, index) => {
          const model = models[index]

          if (model === undefined) {
            return []
          }

          const h = html<Message>()
          const trigger = h.span(
            [h.Class('contents')],
            [
              group.title,
              model.isOpen
                ? Icon.minus({ class: 'ml-auto size-4' })
                : Icon.plus({ class: 'ml-auto size-4' }),
            ],
          )
          const content = sidebarMenuSub<Message>({
            children: group.items.map(item =>
              sidebarMenuSubItem({
                children: [
                  sidebarMenuSubButton({
                    href: item.url,
                    isActive: item.isActive ?? false,
                    children: [item.title],
                  }),
                ],
              }),
            ),
          })

          return [
            sidebarMenuItem({
              children: [
                Collapsible.collapsible({
                  model,
                  toParentMessage: message =>
                    GotNavMainMessage({ index, message }),
                  class: 'group/collapsible',
                  trigger,
                  triggerClass: sidebarMenuButtonVariants(),
                  content,
                }),
              ],
            }),
          ]
        }),
      }),
    ],
  })

const appSidebar = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'

  return sidebar<Message>({
    state,
    children: [
      sidebarHeader({ children: [brand(), searchForm()] }),
      sidebarContent({ children: [navMain(model.navMain)] }),
      sidebarRail({ onClick: ToggledSidebar() }),
    ],
  })
}

const pageContent = (): Html => {
  const h = html<Message>()

  return sidebarInset({
    children: [
      h.header(
        [h.Class('flex h-16 shrink-0 items-center gap-2 border-b px-4')],
        [
          sidebarTrigger({ onClick: ToggledSidebar(), class: '-ml-1' }),
          separator({
            orientation: 'vertical',
            class: 'mr-2 data-[orientation=vertical]:h-4',
          }),
          breadcrumb({
            children: [
              breadcrumbList({
                children: [
                  breadcrumbItem({
                    class: 'hidden md:block',
                    children: [
                      breadcrumbLink({
                        href: '#',
                        children: ['Build Your Application'],
                      }),
                    ],
                  }),
                  breadcrumbSeparator({ class: 'hidden md:block' }),
                  breadcrumbItem({
                    children: [
                      breadcrumbPage({ children: ['Data Fetching'] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      ),
      h.div(
        [h.Class('flex flex-1 flex-col gap-4 p-4')],
        [
          h.div(
            [h.Class('grid auto-rows-min gap-4 md:grid-cols-3')],
            [
              h.div([h.Class('aspect-video rounded-xl bg-muted/50')], []),
              h.div([h.Class('aspect-video rounded-xl bg-muted/50')], []),
              h.div([h.Class('aspect-video rounded-xl bg-muted/50')], []),
            ],
          ),
          h.div(
            [
              h.Class(
                'min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min',
              ),
            ],
            [],
          ),
        ],
      ),
    ],
  })
}

export const view = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'

  return sidebarProvider<Message>({
    state,
    children: [appSidebar(model), pageContent()],
  })
}

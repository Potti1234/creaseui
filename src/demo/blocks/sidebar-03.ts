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
import { separator } from '@/ui/separator'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarHeader,
  sidebarInset,
  sidebarMenu,
  sidebarMenuButton,
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
})
export type Model = typeof Model.Type

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar')

export const Message = S.Union([ToggledSidebar])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({ isSidebarOpen: true })

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

const navMain = (): Html => {
  return sidebarGroup({
    children: [
      sidebarMenu({
        children: data.navMain.map(group =>
          sidebarMenuItem({
            children: [
              sidebarMenuButton({
                href: group.url,
                class: 'font-medium',
                children: [group.title],
              }),
              sidebarMenuSub({
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
              }),
            ],
          }),
        ),
      }),
    ],
  })
}

const appSidebar = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'

  return sidebar<Message>({
    state,
    children: [
      sidebarHeader({ children: [brand()] }),
      sidebarContent({ children: [navMain()] }),
      sidebarRail({ onClick: ToggledSidebar() }),
    ],
  })
}

const pageContent = (): Html => {
  const h = html<Message>()

  return sidebarInset({
    children: [
      h.header(
        [h.Class('flex h-16 shrink-0 items-center gap-2 border-b')],
        [
          h.div(
            [h.Class('flex items-center gap-2 px-3')],
            [
              sidebarTrigger({ onClick: ToggledSidebar() }),
              separator({ orientation: 'vertical', class: 'mr-2 h-4' }),
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

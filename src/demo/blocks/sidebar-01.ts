import { Match as M, Option, Schema as S } from 'effect'
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
import * as DropdownMenu from '@/ui/dropdown-menu'
import { separator } from '@/ui/separator'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarGroupContent,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInput,
  sidebarInset,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarProvider,
  sidebarRail,
  sidebarTrigger,
} from '@/ui/sidebar'

type Version = '1.0.1' | '1.1.0-alpha' | '2.0.0-beta1'

type NavItem = Readonly<{
  title: string
  url: string
  isActive?: boolean
}>

type NavGroup = Readonly<{
  title: string
  url: string
  items: ReadonlyArray<NavItem>
}>

// This is sample data copied from the source block.
const data = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'] satisfies ReadonlyArray<Version>,
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
  ] satisfies ReadonlyArray<NavGroup>,
}

const VersionMenu = DropdownMenu.create<Version>()

// MODEL

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  selectedVersion: S.String,
  versionMenu: DropdownMenu.Model,
})
export type Model = typeof Model.Type

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar')
export const GotVersionMenuMessage = m('GotVersionMenuMessage', {
  message: DropdownMenu.Message,
})

export const Message = S.Union([ToggledSidebar, GotVersionMenuMessage])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  isSidebarOpen: true,
  selectedVersion: data.versions[0] ?? '1.0.1',
  versionMenu: DropdownMenu.init({
    id: 'sidebar-01-version-switcher',
    isAnimated: true,
  }),
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
      GotVersionMenuMessage: ({ message: childMessage }) => {
        const [versionMenu, commands, maybeSelection] = VersionMenu.update(
          model.versionMenu,
          childMessage,
        )
        const selectedVersion = Option.match(maybeSelection, {
          onNone: () => model.selectedVersion,
          onSome: ({ value }) => value,
        })

        return [
          evo(model, {
            versionMenu: () => versionMenu,
            selectedVersion: () => selectedVersion,
          }),
          Command.mapMessages(commands, nextMessage =>
            GotVersionMenuMessage({ message: nextMessage }),
          ),
        ]
      },
    }),
  )

// VIEW

const versionSwitcher = (model: Model): Html => {
  const h = html<Message>()
  const trigger = h.span(
    [h.Class('contents')],
    [
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
          h.span([], [`v${model.selectedVersion}`]),
        ],
      ),
      Icon.chevronsUpDown({ class: 'ml-auto size-4' }),
    ],
  )

  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          DropdownMenu.dropdownMenu<Version, Message>({
            model: model.versionMenu,
            toParentMessage: message => GotVersionMenuMessage({ message }),
            trigger,
            triggerClass: sidebarMenuButtonVariants({
              size: 'lg',
              class:
                'data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground',
            }),
            items: data.versions,
            itemToConfig: version => ({
              label: h.span(
                [h.Class('contents')],
                [
                  `v${version}`,
                  ...(version === model.selectedVersion
                    ? [Icon.check({ class: 'ml-auto size-4' })]
                    : []),
                ],
              ),
            }),
            align: 'start',
            ariaLabel: 'Select documentation version',
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
                [h.For('sidebar-01-search'), h.Class('sr-only')],
                ['Search'],
              ),
              sidebarInput({
                id: 'sidebar-01-search',
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

const navMain = (): Html =>
  sidebarContent<Message>({
    children: data.navMain.map(group =>
      sidebarGroup({
        children: [
          sidebarGroupLabel({ children: [group.title] }),
          sidebarGroupContent({
            children: [
              sidebarMenu({
                children: group.items.map(item =>
                  sidebarMenuItem({
                    children: [
                      sidebarMenuButton({
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
        ],
      }),
    ),
  })

const appSidebar = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'

  return sidebar<Message>({
    state,
    children: [
      sidebarHeader({
        children: [versionSwitcher(model), searchForm()],
      }),
      navMain(),
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

// PORT NOTE: foldkit Menu owns panel width through anchor positioning, so the
// source's Radix-only trigger-width CSS variable is not available.

import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Icon from '@/lib/icon'
import { avatar, avatarFallback } from '@/ui/avatar'
import {
  breadcrumb,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbSeparator,
} from '@/ui/breadcrumb'
import * as Collapsible from '@/ui/collapsible'
import * as DropdownMenu from '@/ui/dropdown-menu'
import { separator } from '@/ui/separator'
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarGroupContent,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInset,
  sidebarInput,
  sidebarMenu,
  sidebarMenuAction,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarMenuSub,
  sidebarMenuSubButton,
  sidebarMenuSubItem,
  sidebarProvider,
  sidebarTrigger,
} from '@/ui/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: 'square-terminal',
      isActive: true,
      items: [
        { title: 'History', url: '#' },
        { title: 'Starred', url: '#' },
        { title: 'Settings', url: '#' },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: 'bot',
      items: [
        { title: 'Genesis', url: '#' },
        { title: 'Explorer', url: '#' },
        { title: 'Quantum', url: '#' },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: 'book-open',
      items: [
        { title: 'Introduction', url: '#' },
        { title: 'Get Started', url: '#' },
        { title: 'Tutorials', url: '#' },
        { title: 'Changelog', url: '#' },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: 'settings-2',
      items: [
        { title: 'General', url: '#' },
        { title: 'Team', url: '#' },
        { title: 'Billing', url: '#' },
        { title: 'Limits', url: '#' },
      ],
    },
  ],
  navSecondary: [
    { title: 'Support', url: '#', icon: 'life-buoy' },
    { title: 'Feedback', url: '#', icon: 'send' },
  ],
  projects: [
    { name: 'Design Engineering', url: '#', icon: 'frame' },
    { name: 'Sales & Marketing', url: '#', icon: 'chart-pie' },
    { name: 'Travel', url: '#', icon: 'map' },
  ],
}

type UserItem =
  | 'upgrade'
  | 'account'
  | 'billing'
  | 'notifications'
  | 'log-out'
const USER_ITEMS: ReadonlyArray<UserItem> = [
  'upgrade',
  'account',
  'billing',
  'notifications',
  'log-out',
]
const UserMenu = DropdownMenu.create<UserItem>()

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  search: S.String,
  navMain: S.Array(Collapsible.Model),
  userMenu: DropdownMenu.Model,
})
export type Model = typeof Model.Type

export const ToggledSidebar = m('ToggledSidebar')
export const ChangedSearch = m('ChangedSearch', { value: S.String })
export const GotNavMainMessage = m('GotNavMainMessage', {
  index: S.Number,
  message: Collapsible.Message,
})
export const GotUserMenuMessage = m('GotUserMenuMessage', {
  message: DropdownMenu.Message,
})
export const Message = S.Union([
  ToggledSidebar,
  ChangedSearch,
  GotNavMainMessage,
  GotUserMenuMessage,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
  isSidebarOpen: true,
  search: '',
  navMain: data.navMain.map((item, index) =>
    Collapsible.init({
      id: `sidebar-16-nav-main-${index}`,
      isOpen: item.isActive ?? false,
    }),
  ),
  userMenu: DropdownMenu.init({
    id: 'sidebar-16-user-menu',
    isAnimated: true,
  }),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]
export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledSidebar: () => [
        evo(model, { isSidebarOpen: current => !current }),
        [],
      ],
      ChangedSearch: ({ value }) => [
        evo(model, { search: () => value }),
        [],
      ],
      GotNavMainMessage: ({ index, message: childMessage }) => {
        const current = model.navMain[index]
        if (current === undefined) return [model, []]
        const [next, commands] = Collapsible.update(current, childMessage)
        return [
          evo(model, {
            navMain: items =>
              items.map((item, itemIndex) =>
                itemIndex === index ? next : item,
              ),
          }),
          Command.mapMessages(commands, nextMessage =>
            GotNavMainMessage({ index, message: nextMessage }),
          ),
        ]
      },
      GotUserMenuMessage: ({ message: childMessage }) => {
        const [userMenu, commands] = UserMenu.update(
          model.userMenu,
          childMessage,
        )
        return [
          evo(model, { userMenu: () => userMenu }),
          Command.mapMessages(commands, next =>
            GotUserMenuMessage({ message: next }),
          ),
        ]
      },
    }),
  )

const navMain = (models: ReadonlyArray<Collapsible.Model>): Html =>
  sidebarGroup<Message>({
    children: [
      sidebarGroupLabel({ children: ['Platform'] }),
      sidebarMenu({
        children: data.navMain.flatMap((item, index) => {
          const model = models[index]
          if (model === undefined) return []
          return [
            sidebarMenuItem({
              children: [
                Collapsible.collapsible({
                  model,
                  toParentMessage: message =>
                    GotNavMainMessage({ index, message }),
                  trigger: html<Message>().span(
                    [html<Message>().Class('contents')],
                    [
                      Icon.icon(item.icon, { class: 'size-4 shrink-0' }),
                      html<Message>().span([], [item.title]),
                      Icon.chevronRight({
                        class: model.isOpen
                          ? 'ml-auto size-4 rotate-90 transition-transform'
                          : 'ml-auto size-4 transition-transform',
                      }),
                    ],
                  ),
                  triggerClass: sidebarMenuButtonVariants(),
                  content: sidebarMenuSub({
                    children: item.items.map(subItem =>
                      sidebarMenuSubItem({
                        children: [
                          sidebarMenuSubButton({
                            href: subItem.url,
                            children: [subItem.title],
                          }),
                        ],
                      }),
                    ),
                  }),
                }),
              ],
            }),
          ]
        }),
      }),
    ],
  })

const navProjects = (): Html => {
  const h = html<Message>()
  return sidebarGroup({
    class: 'group-data-[collapsible=icon]:hidden',
    children: [
      sidebarGroupLabel({ children: ['Projects'] }),
      sidebarMenu({
        children: [
          ...data.projects.map(project =>
            sidebarMenuItem({
              children: [
                sidebarMenuButton({
                  href: project.url,
                  children: [Icon.icon(project.icon), project.name],
                }),
                sidebarMenuAction({
                  showOnHover: true,
                  children: [
                    Icon.moreHorizontal(),
                    h.span([h.Class('sr-only')], ['More']),
                  ],
                }),
              ],
            }),
          ),
          sidebarMenuItem({
            children: [
              sidebarMenuButton({
                children: [Icon.moreHorizontal(), 'More'],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

const navSecondary = (): Html =>
  sidebarGroup<Message>({
    class: 'mt-auto',
    children: [
      sidebarGroupContent({
        children: [
          sidebarMenu({
            children: data.navSecondary.map(item =>
              sidebarMenuItem({
                children: [
                  sidebarMenuButton({
                    href: item.url,
                    size: 'sm',
                    children: [Icon.icon(item.icon), item.title],
                  }),
                ],
              }),
            ),
          }),
        ],
      }),
    ],
  })

const userSummary = (): Html => {
  const h = html<Message>()
  return h.span(
    [h.Class('contents')],
    [
      avatar({
        class: 'size-8 rounded-lg',
        children: [
          avatarFallback({ class: 'rounded-lg', children: ['CN'] }),
        ],
      }),
      h.div(
        [h.Class('grid flex-1 text-left text-sm leading-tight')],
        [
          h.span([h.Class('truncate font-medium')], [data.user.name]),
          h.span([h.Class('truncate text-xs')], [data.user.email]),
        ],
      ),
    ],
  )
}

const navUser = (model: DropdownMenu.Model): Html => {
  const h = html<Message>()
  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          DropdownMenu.dropdownMenu<UserItem, Message>({
            model,
            toParentMessage: message => GotUserMenuMessage({ message }),
            trigger: h.span(
              [h.Class('contents')],
              [
                userSummary(),
                Icon.chevronsUpDown({ class: 'ml-auto size-4' }),
              ],
            ),
            triggerClass: sidebarMenuButtonVariants({
              size: 'lg',
              class:
                'data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground',
            }),
            items: USER_ITEMS,
            itemToConfig: item =>
              M.value(item).pipe(
                M.withReturnType<DropdownMenu.DropdownMenuItemConfig>(),
                M.when('upgrade', () => ({
                  label: 'Upgrade to Pro',
                  icon: Icon.icon('sparkles'),
                  group: 'shadcn · m@example.com',
                })),
                M.when('account', () => ({
                  label: 'Account',
                  icon: Icon.icon('badge-check'),
                  group: 'Account',
                })),
                M.when('billing', () => ({
                  label: 'Billing',
                  icon: Icon.icon('credit-card'),
                  group: 'Account',
                })),
                M.when('notifications', () => ({
                  label: 'Notifications',
                  icon: Icon.icon('bell'),
                  group: 'Account',
                })),
                M.when('log-out', () => ({
                  label: 'Log out',
                  icon: Icon.icon('log-out'),
                  group: '',
                })),
                M.exhaustive,
              ),
            side: 'right',
            align: 'end',
            ariaLabel: 'User menu',
          }),
        ],
      }),
    ],
  })
}

const appSidebar = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'
  const h = html<Message>()
  return sidebar<Message>({
    state,
    collapsible: 'icon',
    class:
      'top-(--header-height) h-[calc(100svh-var(--header-height))]!',
    children: [
      sidebarHeader({
        children: [
          sidebarMenu({
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
                        [Icon.icon('command', { class: 'size-4' })],
                      ),
                      h.div(
                        [
                          h.Class(
                            'grid flex-1 text-left text-sm leading-tight',
                          ),
                        ],
                        [
                          h.span(
                            [h.Class('truncate font-medium')],
                            ['Acme Inc'],
                          ),
                          h.span(
                            [h.Class('truncate text-xs')],
                            ['Enterprise'],
                          ),
                        ],
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sidebarContent({
        children: [
          navMain(model.navMain),
          navProjects(),
          navSecondary(),
        ],
      }),
      sidebarFooter({ children: [navUser(model.userMenu)] }),
    ],
  })
}

const searchForm = (value: string): Html => {
  const h = html<Message>()
  return h.form(
    [h.Class('w-full sm:ml-auto sm:w-auto')],
    [
      h.div(
        [h.Class('relative')],
        [
          h.label(
            [h.For('sidebar-16-search'), h.Class('sr-only')],
            ['Search'],
          ),
          sidebarInput({
            id: 'sidebar-16-search',
            value,
            onInput: next => ChangedSearch({ value: next }),
            placeholder: 'Type to search...',
            class: 'h-8 pl-7',
          }),
          Icon.search({
            class:
              'pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none',
          }),
        ],
      ),
    ],
  )
}

const siteHeader = (model: Model): Html => {
  const h = html<Message>()
  return h.header(
    [
      h.Class(
        'sticky top-0 z-50 flex w-full items-center border-b bg-background',
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'flex h-(--header-height) w-full items-center gap-2 px-4',
          ),
        ],
        [
          sidebarTrigger({
            onClick: ToggledSidebar(),
            class: 'size-8',
          }),
          separator({
            orientation: 'vertical',
            class: 'mr-2 h-4',
          }),
          breadcrumb({
            class: 'hidden sm:block',
            children: [
              breadcrumbList({
                children: [
                  breadcrumbItem({
                    children: [
                      breadcrumbLink({
                        href: '#',
                        children: ['Build Your Application'],
                      }),
                    ],
                  }),
                  breadcrumbSeparator(),
                  breadcrumbItem({
                    children: [
                      breadcrumbPage({ children: ['Data Fetching'] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          searchForm(model.search),
        ],
      ),
    ],
  )
}

const pageContent = (): Html => {
  const h = html<Message>()
  return sidebarInset({
    children: [
      h.div(
        [h.Class('flex flex-1 flex-col gap-4 p-4')],
        [
          h.div(
            [h.Class('grid auto-rows-min gap-4 md:grid-cols-3')],
            Array.from({ length: 3 }, () =>
              h.div(
                [h.Class('aspect-video rounded-xl bg-muted/50')],
                [],
              ),
            ),
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
  const h = html<Message>()
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'
  return h.div(
    [h.Class('[--header-height:calc(--spacing(14))]')],
    [
      sidebarProvider({
        state,
        class: 'flex flex-col',
        children: [
          siteHeader(model),
          h.div(
            [h.Class('flex flex-1')],
            [appSidebar(model), pageContent()],
          ),
        ],
      }),
    ],
  )
}

// PORT NOTE: Avatar images are not bundled, so the source image uses its CN
// fallback. Per-project action menus use the accepted static ellipsis action.

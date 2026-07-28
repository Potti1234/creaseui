import { Match as M, Option, Schema as S } from 'effect'
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
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInset,
  sidebarMenu,
  sidebarMenuAction,
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

type Team = Readonly<{
  name: string
  logo: string
  plan: string
}>

type NavMainItem = Readonly<{
  title: string
  url: string
  icon: string
  isActive?: boolean
  items: ReadonlyArray<
    Readonly<{
      title: string
      url: string
    }>
  >
}>

type Project = Readonly<{
  name: string
  url: string
  icon: string
}>

// Sample data copied from the source block; icon components become their
// equivalent lucide-static names for foldkit's icon renderer.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: 'gallery-vertical-end',
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: 'audio-waveform',
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: 'command',
      plan: 'Free',
    },
  ] satisfies ReadonlyArray<Team>,
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
  ] satisfies ReadonlyArray<NavMainItem>,
  projects: [
    { name: 'Design Engineering', url: '#', icon: 'frame' },
    { name: 'Sales & Marketing', url: '#', icon: 'chart-pie' },
    { name: 'Travel', url: '#', icon: 'map' },
  ] satisfies ReadonlyArray<Project>,
}

type TeamMenuItem = 'team-0' | 'team-1' | 'team-2' | 'add-team'
type UserMenuItem =
  | 'upgrade'
  | 'account'
  | 'billing'
  | 'notifications'
  | 'log-out'

const TEAM_MENU_ITEMS: ReadonlyArray<TeamMenuItem> = [
  'team-0',
  'team-1',
  'team-2',
  'add-team',
]

const USER_MENU_ITEMS: ReadonlyArray<UserMenuItem> = [
  'upgrade',
  'account',
  'billing',
  'notifications',
  'log-out',
]

const TeamMenu = DropdownMenu.create<TeamMenuItem>()
const UserMenu = DropdownMenu.create<UserMenuItem>()

// MODEL

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  activeTeamIndex: S.Number,
  navMain: S.Array(Collapsible.Model),
  teamMenu: DropdownMenu.Model,
  userMenu: DropdownMenu.Model,
})
export type Model = typeof Model.Type

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar')
export const GotNavMainMessage = m('GotNavMainMessage', {
  index: S.Number,
  message: Collapsible.Message,
})
export const GotTeamMenuMessage = m('GotTeamMenuMessage', {
  message: DropdownMenu.Message,
})
export const GotUserMenuMessage = m('GotUserMenuMessage', {
  message: DropdownMenu.Message,
})

export const Message = S.Union([
  ToggledSidebar,
  GotNavMainMessage,
  GotTeamMenuMessage,
  GotUserMenuMessage,
])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  isSidebarOpen: true,
  activeTeamIndex: 0,
  navMain: data.navMain.map((item, index) =>
    Collapsible.init({
      id: `sidebar-07-nav-main-${index}`,
      isOpen: item.isActive ?? false,
    }),
  ),
  teamMenu: DropdownMenu.init({
    id: 'sidebar-07-team-switcher',
    isAnimated: true,
  }),
  userMenu: DropdownMenu.init({
    id: 'sidebar-07-user-menu',
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
      GotNavMainMessage: ({ index, message: childMessage }) => {
        const current = model.navMain[index]

        if (current === undefined) {
          return [model, []]
        }

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
      GotTeamMenuMessage: ({ message: childMessage }) => {
        const [teamMenu, commands, maybeSelection] = TeamMenu.update(
          model.teamMenu,
          childMessage,
        )
        const activeTeamIndex = Option.match(maybeSelection, {
          onNone: () => model.activeTeamIndex,
          onSome: ({ value }) =>
            value === 'team-0'
              ? 0
              : value === 'team-1'
                ? 1
                : value === 'team-2'
                  ? 2
                  : model.activeTeamIndex,
        })

        return [
          evo(model, {
            teamMenu: () => teamMenu,
            activeTeamIndex: () => activeTeamIndex,
          }),
          Command.mapMessages(commands, nextMessage =>
            GotTeamMenuMessage({ message: nextMessage }),
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
          Command.mapMessages(commands, nextMessage =>
            GotUserMenuMessage({ message: nextMessage }),
          ),
        ]
      },
    }),
  )

// VIEW

const teamLogo = (team: Team, className: string): Html =>
  Icon.icon<Message>(team.logo, { class: className })

const teamSwitcher = (model: Model): Html => {
  const h = html<Message>()
  const activeTeam = data.teams[model.activeTeamIndex] ?? data.teams[0]

  if (activeTeam === undefined) {
    return h.div([], [])
  }

  const trigger = h.span(
    [h.Class('contents')],
    [
      h.div(
        [
          h.Class(
            'flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground',
          ),
        ],
        [teamLogo(activeTeam, 'size-4')],
      ),
      h.div(
        [h.Class('grid flex-1 text-left text-sm leading-tight')],
        [
          h.span([h.Class('truncate font-medium')], [activeTeam.name]),
          h.span([h.Class('truncate text-xs')], [activeTeam.plan]),
        ],
      ),
      Icon.chevronsUpDown({ class: 'ml-auto size-4 shrink-0' }),
    ],
  )

  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          DropdownMenu.dropdownMenu<TeamMenuItem, Message>({
            model: model.teamMenu,
            toParentMessage: message => GotTeamMenuMessage({ message }),
            trigger,
            triggerClass: sidebarMenuButtonVariants({
              size: 'lg',
              class:
                'data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground',
            }),
            items: TEAM_MENU_ITEMS,
            itemToConfig: item => {
              if (item === 'add-team') {
                return {
                  label: h.span(
                    [h.Class('font-medium text-muted-foreground')],
                    ['Add team'],
                  ),
                  icon: h.div(
                    [
                      h.Class(
                        'flex size-6 items-center justify-center rounded-md border bg-transparent',
                      ),
                    ],
                    [Icon.plus({ class: 'size-4' })],
                  ),
                  group: '',
                }
              }

              const teamIndex =
                item === 'team-0' ? 0 : item === 'team-1' ? 1 : 2
              const team = data.teams[teamIndex]

              return {
                label: team?.name ?? '',
                ...(team === undefined
                  ? {}
                  : {
                      icon: h.div(
                        [
                          h.Class(
                            'flex size-6 items-center justify-center rounded-md border',
                          ),
                        ],
                        [teamLogo(team, 'size-3.5 shrink-0')],
                      ),
                    }),
                shortcut: `⌘${teamIndex + 1}`,
                group: 'Teams',
              }
            },
            side: 'right',
            align: 'start',
            ariaLabel: 'Switch team',
          }),
        ],
      }),
    ],
  })
}

const navMain = (models: ReadonlyArray<Collapsible.Model>): Html =>
  sidebarGroup<Message>({
    children: [
      sidebarGroupLabel({ children: ['Platform'] }),
      sidebarMenu({
        children: data.navMain.flatMap((item, index) => {
          const model = models[index]

          if (model === undefined) {
            return []
          }

          const trigger = html<Message>().span(
            [html<Message>().Class('contents')],
            [
              Icon.icon(item.icon, { class: 'size-4 shrink-0' }),
              html<Message>().span([], [item.title]),
              Icon.chevronRight({
                class: `ml-auto size-4 shrink-0 transition-transform duration-200${
                  model.isOpen ? ' rotate-90' : ''
                }`,
              }),
            ],
          )
          const content = sidebarMenuSub<Message>({
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
          })

          // The shared Collapsible owns the actual trigger button. Applying
          // SidebarMenuButton's exported variants avoids nested buttons while
          // retaining the source block's menu-button appearance.
          return [
            sidebarMenuItem({
              children: [
                Collapsible.collapsible<Message>({
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
                  children: [
                    Icon.icon(project.icon),
                    h.span([], [project.name]),
                  ],
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
                class: 'text-sidebar-foreground/70',
                children: [
                  Icon.moreHorizontal({
                    class: 'text-sidebar-foreground/70',
                  }),
                  h.span([], ['More']),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

const userSummary = (): Html => {
  const h = html<Message>()

  return h.span(
    [h.Class('contents')],
    [
      avatar({
        class: 'size-8 rounded-lg',
        children: [
          avatarFallback({
            class: 'rounded-lg',
            children: ['CN'],
          }),
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
  const trigger = h.span(
    [h.Class('contents')],
    [userSummary(), Icon.chevronsUpDown({ class: 'ml-auto size-4' })],
  )

  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          DropdownMenu.dropdownMenu<UserMenuItem, Message>({
            model,
            toParentMessage: message => GotUserMenuMessage({ message }),
            trigger,
            triggerClass: sidebarMenuButtonVariants({
              size: 'lg',
              class:
                'data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground',
            }),
            items: USER_MENU_ITEMS,
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

  return sidebar<Message>({
    state,
    collapsible: 'icon',
    children: [
      sidebarHeader({ children: [teamSwitcher(model)] }),
      sidebarContent({
        children: [navMain(model.navMain), navProjects()],
      }),
      sidebarFooter({ children: [navUser(model.userMenu)] }),
      sidebarRail({ onClick: ToggledSidebar() }),
    ],
  })
}

const pageContent = (): Html => {
  const h = html<Message>()

  return sidebarInset({
    children: [
      h.header(
        [
          h.Class(
            'flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
          ),
        ],
        [
          h.div(
            [h.Class('flex items-center gap-2 px-4')],
            [
              sidebarTrigger({
                onClick: ToggledSidebar(),
                class: '-ml-1',
              }),
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
                      breadcrumbSeparator({
                        class: 'hidden md:block',
                      }),
                      breadcrumbItem({
                        children: [
                          breadcrumbPage({
                            children: ['Data Fetching'],
                          }),
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
        [h.Class('flex flex-1 flex-col gap-4 p-4 pt-0')],
        [
          h.div(
            [h.Class('grid auto-rows-min gap-4 md:grid-cols-3')],
            [
              h.div(
                [h.Class('aspect-video rounded-xl bg-muted/50')],
                [],
              ),
              h.div(
                [h.Class('aspect-video rounded-xl bg-muted/50')],
                [],
              ),
              h.div(
                [h.Class('aspect-video rounded-xl bg-muted/50')],
                [],
              ),
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

// PORT NOTE: Avatar files are not bundled, so the source image is represented
// by its CN fallback. The dropdown wrapper cannot render the source's rich
// non-selectable user label, so the same identity is shown in the trigger and
// summarized as the first menu group heading.
// PORT NOTE: Per-project dropdowns are intentionally represented by static
// ellipsis actions, as allowed by the block task, to avoid three extra models.

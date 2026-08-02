import { Match as M, Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import * as FoldkitCalendar from 'foldkit/calendar'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Icon from '@/lib/icon'
import { avatar, avatarFallback } from '@/ui/avatar'
import {
  breadcrumb,
  breadcrumbItem,
  breadcrumbList,
  breadcrumbPage,
} from '@/ui/breadcrumb'
import * as Calendar from '@/ui/calendar'
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
  sidebarSeparator,
  sidebarTrigger,
} from '@/ui/sidebar'

const leftData = {
  teams: [
    { name: 'Acme Inc', logo: 'command', plan: 'Enterprise' },
    { name: 'Acme Corp.', logo: 'audio-waveform', plan: 'Startup' },
    { name: 'Evil Corp.', logo: 'command', plan: 'Free' },
  ],
  navMain: [
    { title: 'Search', url: '#', icon: 'search' },
    { title: 'Ask AI', url: '#', icon: 'sparkles' },
    { title: 'Home', url: '#', icon: 'house', isActive: true },
    { title: 'Inbox', url: '#', icon: 'inbox', badge: '10' },
  ],
  navSecondary: [
    { title: 'Calendar', url: '#', icon: 'calendar' },
    { title: 'Settings', url: '#', icon: 'settings-2' },
    { title: 'Templates', url: '#', icon: 'blocks' },
    { title: 'Trash', url: '#', icon: 'trash-2' },
    { title: 'Help', url: '#', icon: 'message-circle-question' },
  ],
  favorites: [
    { name: 'Project Management & Task Tracking', url: '#', emoji: '📊' },
    {
      name: 'Family Recipe Collection & Meal Planning',
      url: '#',
      emoji: '🍳',
    },
    { name: 'Fitness Tracker & Workout Routines', url: '#', emoji: '💪' },
    { name: 'Book Notes & Reading List', url: '#', emoji: '📚' },
    {
      name: 'Sustainable Gardening Tips & Plant Care',
      url: '#',
      emoji: '🌱',
    },
    {
      name: 'Language Learning Progress & Resources',
      url: '#',
      emoji: '🗣️',
    },
    {
      name: 'Home Renovation Ideas & Budget Tracker',
      url: '#',
      emoji: '🏠',
    },
    {
      name: 'Personal Finance & Investment Portfolio',
      url: '#',
      emoji: '💰',
    },
    {
      name: 'Movie & TV Show Watchlist with Reviews',
      url: '#',
      emoji: '🎬',
    },
    { name: 'Daily Habit Tracker & Goal Setting', url: '#', emoji: '✅' },
  ],
  workspaces: [
    {
      name: 'Personal Life Management',
      emoji: '🏠',
      pages: [
        { name: 'Daily Journal & Reflection', url: '#', emoji: '📔' },
        { name: 'Health & Wellness Tracker', url: '#', emoji: '🍏' },
        {
          name: 'Personal Growth & Learning Goals',
          url: '#',
          emoji: '🌟',
        },
      ],
    },
    {
      name: 'Professional Development',
      emoji: '💼',
      pages: [
        { name: 'Career Objectives & Milestones', url: '#', emoji: '🎯' },
        {
          name: 'Skill Acquisition & Training Log',
          url: '#',
          emoji: '🧠',
        },
        { name: 'Networking Contacts & Events', url: '#', emoji: '🤝' },
      ],
    },
    {
      name: 'Creative Projects',
      emoji: '🎨',
      pages: [
        { name: 'Writing Ideas & Story Outlines', url: '#', emoji: '✍️' },
        { name: 'Art & Design Portfolio', url: '#', emoji: '🖼️' },
        {
          name: 'Music Composition & Practice Log',
          url: '#',
          emoji: '🎵',
        },
      ],
    },
    {
      name: 'Home Management',
      emoji: '🏡',
      pages: [
        {
          name: 'Household Budget & Expense Tracking',
          url: '#',
          emoji: '💰',
        },
        {
          name: 'Home Maintenance Schedule & Tasks',
          url: '#',
          emoji: '🔧',
        },
        {
          name: 'Family Calendar & Event Planning',
          url: '#',
          emoji: '📅',
        },
      ],
    },
    {
      name: 'Travel & Adventure',
      emoji: '🧳',
      pages: [
        { name: 'Trip Planning & Itineraries', url: '#', emoji: '🗺️' },
        {
          name: 'Travel Bucket List & Inspiration',
          url: '#',
          emoji: '🌎',
        },
        {
          name: 'Travel Journal & Photo Gallery',
          url: '#',
          emoji: '📸',
        },
      ],
    },
  ],
}

const rightData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  calendars: [
    { name: 'My Calendars', items: ['Personal', 'Work', 'Family'] },
    { name: 'Favorites', items: ['Holidays', 'Birthdays'] },
    { name: 'Other', items: ['Travel', 'Reminders', 'Deadlines'] },
  ],
}

type TeamItem = 'team-0' | 'team-1' | 'team-2' | 'add-team'
type UserItem =
  | 'upgrade'
  | 'account'
  | 'billing'
  | 'notifications'
  | 'log-out'
const TEAM_ITEMS: ReadonlyArray<TeamItem> = [
  'team-0',
  'team-1',
  'team-2',
  'add-team',
]
const USER_ITEMS: ReadonlyArray<UserItem> = [
  'upgrade',
  'account',
  'billing',
  'notifications',
  'log-out',
]
const TeamMenu = DropdownMenu.create<TeamItem>()
const UserMenu = DropdownMenu.create<UserItem>()

export const Model = S.Struct({
  isLeftSidebarOpen: S.Boolean,
  isRightSidebarOpen: S.Boolean,
  activeTeamIndex: S.Number,
  teamMenu: DropdownMenu.Model,
  userMenu: DropdownMenu.Model,
  workspaceOpen: S.Array(S.Boolean),
  calendar: Calendar.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
  calendarGroupsOpen: S.Array(S.Boolean),
})
export type Model = typeof Model.Type

export const ToggledSidebar = m('ToggledSidebar')
export const GotTeamMenuMessage = m('GotTeamMenuMessage', {
  message: DropdownMenu.Message,
})
export const GotUserMenuMessage = m('GotUserMenuMessage', {
  message: DropdownMenu.Message,
})
export const ToggledWorkspace = m('ToggledWorkspace', {
  index: S.Number,
  isOpen: S.Boolean,
})
export const GotCalendarMessage = m('GotCalendarMessage', {
  message: Calendar.Message,
})
export const ToggledCalendarGroup = m('ToggledCalendarGroup', {
  index: S.Number,
  isOpen: S.Boolean,
})
export const Message = S.Union([
  ToggledSidebar,
  GotTeamMenuMessage,
  GotUserMenuMessage,
  ToggledWorkspace,
  GotCalendarMessage,
  ToggledCalendarGroup,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  activeTeamIndex: 0,
  teamMenu: DropdownMenu.init({
    id: 'sidebar-15-left-team-menu',
    isAnimated: true,
  }),
  userMenu: DropdownMenu.init({
    id: 'sidebar-15-right-user-menu',
    isAnimated: true,
  }),
  workspaceOpen: leftData.workspaces.map(() => false),
  calendar: Calendar.init({
    id: 'sidebar-15-right-calendar',
    today: { year: 2024, month: 10, day: 15 },
  }),
  selectedDate: Option.none(),
  calendarGroupsOpen: rightData.calendars.map((_, index) => index === 0),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]
export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledSidebar: () => [
        evo(model, { isLeftSidebarOpen: current => !current }),
        [],
      ],
      GotTeamMenuMessage: ({ message: childMessage }) => {
        const [teamMenu, commands, selection] = TeamMenu.update(
          model.teamMenu,
          childMessage,
        )
        const activeTeamIndex = Option.match(selection, {
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
          Command.mapMessages(commands, next =>
            GotTeamMenuMessage({ message: next }),
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
      ToggledWorkspace: ({ index, isOpen }) => {
        if (model.workspaceOpen[index] === undefined) return [model, []]
        return [
          evo(model, {
            workspaceOpen: items =>
              items.map((open, itemIndex) =>
                itemIndex === index ? isOpen : open,
              ),
          }),
          [],
        ]
      },
      GotCalendarMessage: ({ message: childMessage }) => {
        const [calendar, commands, maybeSelection] = Calendar.update(
          model.calendar,
          childMessage,
        )
        return [
          evo(model, { calendar: () => calendar, selectedDate: current => Option.match(maybeSelection, { onNone: () => current, onSome: selection => selection._tag === 'SelectedDate' ? Option.some(selection.date) : current }) }),
          Command.mapMessages(commands, next =>
            GotCalendarMessage({ message: next }),
          ),
        ]
      },
      ToggledCalendarGroup: ({ index, isOpen }) => {
        if (model.calendarGroupsOpen[index] === undefined) return [model, []]
        return [
          evo(model, {
            calendarGroupsOpen: groups =>
              groups.map((open, groupIndex) =>
                groupIndex === index ? isOpen : open,
              ),
          }),
          [],
        ]
      },
    }),
  )

const teamSwitcher = (model: Model): Html => {
  const h = html<Message>()
  const active = leftData.teams[model.activeTeamIndex] ?? leftData.teams[0]
  if (active === undefined) return h.div([], [])
  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          DropdownMenu.dropdownMenu<TeamItem, Message>({
            model: model.teamMenu,
            toParentMessage: message => GotTeamMenuMessage({ message }),
            trigger: h.span(
              [h.Class('contents')],
              [
                h.div(
                  [
                    h.Class(
                      'flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground',
                    ),
                  ],
                  [Icon.icon(active.logo, { class: 'size-3' })],
                ),
                h.span([h.Class('truncate font-medium')], [active.name]),
                Icon.chevronDown({ class: 'size-4 opacity-50' }),
              ],
            ),
            triggerClass: sidebarMenuButtonVariants({
              class: 'w-fit px-1.5',
            }),
            items: TEAM_ITEMS,
            itemToConfig: item => {
              if (item === 'add-team') {
                return {
                  label: 'Add team',
                  icon: Icon.plus(),
                  group: '',
                }
              }
              const index =
                item === 'team-0' ? 0 : item === 'team-1' ? 1 : 2
              const team = leftData.teams[index]
              return {
                label: team?.name ?? '',
                ...(team === undefined
                  ? {}
                  : { icon: Icon.icon(team.logo) }),
                shortcut: `⌘${index + 1}`,
                group: 'Teams',
              }
            },
            side: 'bottom',
            align: 'start',
            ariaLabel: 'Switch team',
          }),
        ],
      }),
    ],
  })
}

const navMain = (): Html =>
  sidebarMenu<Message>({
    children: leftData.navMain.map(item =>
      sidebarMenuItem({
        children: [
          sidebarMenuButton({
            href: item.url,
            isActive: 'isActive' in item && item.isActive === true,
            children: [Icon.icon(item.icon), item.title],
          }),
        ],
      }),
    ),
  })

const navFavorites = (): Html => {
  const h = html<Message>()
  return sidebarGroup({
    class: 'group-data-[collapsible=icon]:hidden',
    children: [
      sidebarGroupLabel({ children: ['Favorites'] }),
      sidebarMenu({
        children: [
          ...leftData.favorites.map(item =>
            sidebarMenuItem({
              children: [
                sidebarMenuButton({
                  href: item.url,
                  children: [
                    h.span([], [item.emoji]),
                    h.span([], [item.name]),
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
                children: [Icon.moreHorizontal(), 'More'],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

const navWorkspaces = (
  openStates: ReadonlyArray<boolean>,
): Html => {
  const h = html<Message>()
  return sidebarGroup({
    children: [
      sidebarGroupLabel({ children: ['Workspaces'] }),
      sidebarGroupContent({
        children: [
          sidebarMenu({
            children: [
              ...leftData.workspaces.flatMap((workspace, index) => {
                const isOpen = openStates[index]
                if (isOpen === undefined) return []
                return [
                  sidebarMenuItem({
                    children: [
                      Collapsible.collapsible({
                        id: `sidebar-15-left-workspace-${index}`,
                        isOpen,
                        onToggle: nextIsOpen => ToggledWorkspace({ index, isOpen: nextIsOpen }),
                        trigger: h.span(
                          [h.Class('contents')],
                          [
                            h.span([], [workspace.emoji]),
                            h.span([], [workspace.name]),
                            Icon.chevronRight({
                              class: isOpen
                                ? 'ml-auto size-4 rotate-90 transition-transform'
                                : 'ml-auto size-4 transition-transform',
                            }),
                          ],
                        ),
                        triggerClass: sidebarMenuButtonVariants(),
                        content: sidebarMenuSub({
                          children: workspace.pages.map(page =>
                            sidebarMenuSubItem({
                              children: [
                                sidebarMenuSubButton({
                                  href: page.url,
                                  children: [
                                    h.span([], [page.emoji]),
                                    h.span([], [page.name]),
                                  ],
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
              sidebarMenuItem({
                children: [
                  sidebarMenuButton({
                    class: 'text-sidebar-foreground/70',
                    children: [Icon.moreHorizontal(), 'More'],
                  }),
                ],
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
            children: leftData.navSecondary.map(item =>
              sidebarMenuItem({
                children: [
                  sidebarMenuButton({
                    href: item.url,
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

const sidebarLeft = (model: Model): Html => {
  const state = model.isLeftSidebarOpen ? 'expanded' : 'collapsed'
  return sidebar<Message>({
    state,
    class: 'border-r-0',
    children: [
      sidebarHeader({
        children: [teamSwitcher(model), navMain()],
      }),
      sidebarContent({
        children: [
          navFavorites(),
          navWorkspaces(model.workspaceOpen),
          navSecondary(),
        ],
      }),
      sidebarRail({ onClick: ToggledSidebar() }),
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
          avatarFallback({ class: 'rounded-lg', children: ['CN'] }),
        ],
      }),
      h.div(
        [h.Class('grid flex-1 text-left text-sm leading-tight')],
        [
          h.span([h.Class('truncate font-medium')], [rightData.user.name]),
          h.span([h.Class('truncate text-xs')], [rightData.user.email]),
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
            side: 'left',
            align: 'start',
            ariaLabel: 'User menu',
          }),
        ],
      }),
    ],
  })
}

const rightCalendars = (
  openStates: ReadonlyArray<boolean>,
): ReadonlyArray<Html> => {
  const h = html<Message>()
  return rightData.calendars.flatMap((calendar, index) => {
    const isOpen = openStates[index]
    if (isOpen === undefined) return []
    return [
      sidebarGroup({
        class: 'py-0',
        children: [
          Collapsible.collapsible({
            id: `sidebar-15-right-calendar-group-${index}`,
            isOpen,
            onToggle: nextIsOpen => ToggledCalendarGroup({ index, isOpen: nextIsOpen }),
            class: 'group/collapsible',
            trigger: h.span(
              [h.Class('contents')],
              [
                calendar.name,
                Icon.chevronRight({
                  class: isOpen
                    ? 'ml-auto size-4 shrink-0 rotate-90 transition-transform'
                    : 'ml-auto size-4 shrink-0 transition-transform',
                }),
              ],
            ),
            triggerClass:
              'group/label flex h-8 w-full shrink-0 items-center rounded-md px-2 text-sm font-medium text-sidebar-foreground outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2',
            content: sidebarGroupContent({
              children: [
                sidebarMenu({
                  children: calendar.items.map((item, itemIndex) =>
                    sidebarMenuItem({
                      children: [
                        sidebarMenuButton({
                          children: [
                            h.div(
                              [
                                ...(itemIndex < 2
                                  ? [h.DataAttribute('active', '')]
                                  : []),
                                h.Class(
                                  'group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active]:border-sidebar-primary data-[active]:bg-sidebar-primary',
                                ),
                              ],
                              [
                                Icon.check({
                                  class:
                                    'hidden size-3 group-data-[active]/calendar-item:block',
                                }),
                              ],
                            ),
                            item,
                          ],
                        }),
                      ],
                    }),
                  ),
                }),
              ],
            }),
          }),
        ],
      }),
      sidebarSeparator({ class: 'mx-0' }),
    ]
  })
}

const sidebarRight = (model: Model): Html =>
  sidebar<Message>({
    state: model.isRightSidebarOpen ? 'expanded' : 'collapsed',
    side: 'right',
    collapsible: 'none',
    class: 'sticky top-0 hidden h-svh border-l lg:flex',
    children: [
      sidebarHeader({
        class: 'h-16 border-b border-sidebar-border',
        children: [navUser(model.userMenu)],
      }),
      sidebarContent({
        children: [
          sidebarGroup({
            class: 'px-0',
            children: [
              sidebarGroupContent({
                children: [
                  Calendar.calendar({
                    model: model.calendar,
                    maybeSelectedDate: model.selectedDate,
                    toParentMessage: message =>
                      GotCalendarMessage({ message }),
                    class:
                      '[&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground',
                  }),
                ],
              }),
            ],
          }),
          sidebarSeparator({ class: 'mx-0' }),
          ...rightCalendars(model.calendarGroupsOpen),
        ],
      }),
      sidebarFooter({
        children: [
          sidebarMenu({
            children: [
              sidebarMenuItem({
                children: [
                  sidebarMenuButton({
                    children: [Icon.plus(), 'New Calendar'],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })

const pageContent = (): Html => {
  const h = html<Message>()
  return sidebarInset({
    children: [
      h.header(
        [
          h.Class(
            'sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background',
          ),
        ],
        [
          h.div(
            [h.Class('flex flex-1 items-center gap-2 px-3')],
            [
              sidebarTrigger({ onClick: ToggledSidebar() }),
              separator({
                orientation: 'vertical',
                class: 'mr-2 data-[orientation=vertical]:h-4',
              }),
              breadcrumb({
                children: [
                  breadcrumbList({
                    children: [
                      breadcrumbItem({
                        children: [
                          breadcrumbPage({
                            class: 'line-clamp-1',
                            children: [
                              'Project Management & Task Tracking',
                            ],
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
        [h.Class('flex flex-1 flex-col gap-4 p-4')],
        [
          h.div(
            [
              h.Class(
                'mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50',
              ),
            ],
            [],
          ),
          h.div(
            [
              h.Class(
                'mx-auto h-[100vh] w-full max-w-3xl rounded-xl bg-muted/50',
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
  const leftState = model.isLeftSidebarOpen ? 'expanded' : 'collapsed'
  const rightState = model.isRightSidebarOpen ? 'expanded' : 'collapsed'
  return sidebarProvider<Message>({
    state: leftState,
    children: [
      sidebarLeft(model),
      sidebarProvider<Message>({
        state: rightState,
        class: 'min-h-0',
        children: [pageContent(), sidebarRight(model)],
      }),
    ],
  })
}

// PORT NOTE: Avatar images are not bundled, so the source image uses its CN
// fallback. Per-favorite action menus are represented by their ellipsis
// actions; team/user menus and all disclosure/calendar interactions are live.

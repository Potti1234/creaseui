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
import * as DropdownMenu from '@/ui/dropdown-menu'
import { separator } from '@/ui/separator'
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarGroupContent,
  sidebarHeader,
  sidebarInset,
  sidebarInput,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarTrigger,
} from '@/ui/sidebar'
import * as Switch from '@/ui/switch'

type NavItem = Readonly<{
  title: string
  url: string
  icon: string
  isActive: boolean
}>

type Mail = Readonly<{
  name: string
  email: string
  subject: string
  date: string
  teaser: string
}>

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Inbox',
      url: '#',
      icon: 'inbox',
      isActive: true,
    },
    {
      title: 'Drafts',
      url: '#',
      icon: 'file',
      isActive: false,
    },
    {
      title: 'Sent',
      url: '#',
      icon: 'send',
      isActive: false,
    },
    {
      title: 'Junk',
      url: '#',
      icon: 'archive-x',
      isActive: false,
    },
    {
      title: 'Trash',
      url: '#',
      icon: 'trash-2',
      isActive: false,
    },
  ] satisfies ReadonlyArray<NavItem>,
  mails: [
    {
      name: 'William Smith',
      email: 'williamsmith@example.com',
      subject: 'Meeting Tomorrow',
      date: '09:34 AM',
      teaser:
        'Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.',
    },
    {
      name: 'Alice Smith',
      email: 'alicesmith@example.com',
      subject: 'Re: Project Update',
      date: 'Yesterday',
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: 'Bob Johnson',
      email: 'bobjohnson@example.com',
      subject: 'Weekend Plans',
      date: '2 days ago',
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: 'Emily Davis',
      email: 'emilydavis@example.com',
      subject: 'Re: Question about Budget',
      date: '2 days ago',
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: 'Michael Wilson',
      email: 'michaelwilson@example.com',
      subject: 'Important Announcement',
      date: '1 week ago',
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: 'Sarah Brown',
      email: 'sarahbrown@example.com',
      subject: 'Re: Feedback on Proposal',
      date: '1 week ago',
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: 'David Lee',
      email: 'davidlee@example.com',
      subject: 'New Project Idea',
      date: '1 week ago',
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: 'Olivia Wilson',
      email: 'oliviawilson@example.com',
      subject: 'Vacation Plans',
      date: '1 week ago',
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: 'James Martin',
      email: 'jamesmartin@example.com',
      subject: 'Re: Conference Registration',
      date: '1 week ago',
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: 'Sophia White',
      email: 'sophiawhite@example.com',
      subject: 'Team Dinner',
      date: '1 week ago',
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ] satisfies ReadonlyArray<Mail>,
}

type UserAction =
  | 'upgrade'
  | 'account'
  | 'billing'
  | 'notifications'
  | 'log-out'

const USER_ACTIONS: ReadonlyArray<UserAction> = [
  'upgrade',
  'account',
  'billing',
  'notifications',
  'log-out',
]

const UserMenu = DropdownMenu.create<UserAction>()

// MODEL

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  activeNavIndex: S.Number,
  unreadOnly: S.Boolean,
  userMenu: DropdownMenu.Model,
})
export type Model = typeof Model.Type

// MESSAGE

export const ToggledSidebar = m('ToggledSidebar')
export const SelectedNavItem = m('SelectedNavItem', {
  index: S.Number,
})
export const ToggledUnread = m('ToggledUnread', { isChecked: S.Boolean })
export const GotUserMenuMessage = m('GotUserMenuMessage', {
  message: DropdownMenu.Message,
})

export const Message = S.Union([
  ToggledSidebar,
  SelectedNavItem,
  ToggledUnread,
  GotUserMenuMessage,
])
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  isSidebarOpen: true,
  activeNavIndex: 0,
  unreadOnly: false,
  userMenu: DropdownMenu.init({
    id: 'sidebar-09-user-menu',
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
      SelectedNavItem: ({ index }) => [
        evo(model, {
          activeNavIndex: () => index,
          isSidebarOpen: () => true,
        }),
        [],
      ],
      ToggledUnread: ({ isChecked }) => [{ ...model, unreadOnly: isChecked }, []],
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

const userSummary = (): Html => {
  const h = html<Message>()

  return h.span(
    [h.Class('contents')],
    [
      avatar({
        class: 'h-8 w-8 rounded-lg',
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

const userActionConfig = (
  action: UserAction,
): DropdownMenu.DropdownMenuItemConfig =>
  M.value(action).pipe(
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
  )

const navUser = (model: DropdownMenu.Model): Html => {
  const h = html<Message>()

  return sidebarMenu({
    children: [
      sidebarMenuItem({
        children: [
          DropdownMenu.dropdownMenu<UserAction, Message>({
            model,
            toParentMessage: message =>
              GotUserMenuMessage({ message }),
            trigger: h.span(
              [h.Class('contents')],
              [
                userSummary(),
                Icon.chevronsUpDown({
                  class: 'ml-auto size-4 shrink-0',
                }),
              ],
            ),
            triggerClass: sidebarMenuButtonVariants({
              size: 'lg',
              class:
                'data-[open]:bg-sidebar-accent data-[open]:text-sidebar-accent-foreground md:h-8 md:p-0',
            }),
            items: USER_ACTIONS,
            itemToConfig: userActionConfig,
            side: 'right',
            align: 'end',
            ariaLabel: 'User menu',
          }),
        ],
      }),
    ],
  })
}

const iconSidebar = (model: Model): Html => {
  const h = html<Message>()

  return sidebar({
    collapsible: 'none',
    class:
      'w-[calc(var(--sidebar-width-icon)+1px)]! border-r',
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
                    class: 'md:h-8 md:p-0',
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
          sidebarGroup({
            children: [
              sidebarGroupContent({
                class: 'px-1.5 md:px-0',
                children: [
                  sidebarMenu({
                    children: data.navMain.map((item, index) =>
                      sidebarMenuItem({
                        children: [
                          sidebarMenuButton({
                            onClick: SelectedNavItem({ index }),
                            isActive:
                              model.activeNavIndex === index,
                            tooltip: item.title,
                            class: 'px-2.5 md:px-2',
                            children: [
                              Icon.icon(item.icon),
                              h.span([], [item.title]),
                            ],
                          }),
                        ],
                      }),
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sidebarFooter({ children: [navUser(model.userMenu)] }),
    ],
  })
}

const mailView = (mail: Mail): Html => {
  const h = html<Message>()

  return h.a(
    [
      h.Href('#'),
      h.Class(
        'flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      ),
    ],
    [
      h.div(
        [h.Class('flex w-full items-center gap-2')],
        [
          h.span([], [mail.name]),
          h.span([h.Class('ml-auto text-xs')], [mail.date]),
        ],
      ),
      h.span([h.Class('font-medium')], [mail.subject]),
      h.span(
        [
          h.Class(
            'line-clamp-2 w-[260px] text-xs whitespace-break-spaces',
          ),
        ],
        [mail.teaser],
      ),
    ],
  )
}

const mailSidebar = (model: Model): Html => {
  const h = html<Message>()
  const activeItem =
    data.navMain[model.activeNavIndex] ?? data.navMain[0]

  return sidebar({
    collapsible: 'none',
    class: 'hidden flex-1 md:flex',
    children: [
      sidebarHeader({
        class: 'gap-3.5 border-b p-4',
        children: [
          h.div(
            [h.Class('flex w-full items-center justify-between')],
            [
              h.div(
                [h.Class('text-base font-medium text-foreground')],
                [activeItem?.title ?? 'Inbox'],
              ),
              h.div(
                [
                  h.Class(
                    'flex items-center gap-2 text-sm [&_[data-slot=switch]+div]:sr-only',
                  ),
                ],
                [
                  h.span([], ['Unreads']),
                  Switch.switch({
                    id: 'sidebar-09-unread-switch',
                    isChecked: model.unreadOnly,
                    onToggle: isChecked => ToggledUnread({ isChecked }),
                    label: 'Toggle unread mail',
                    class: 'shadow-none',
                  }),
                ],
              ),
            ],
          ),
          sidebarInput({
            id: 'sidebar-09-mail-search',
            placeholder: 'Type to search...',
          }),
        ],
      }),
      sidebarContent({
        children: [
          sidebarGroup({
            class: 'px-0',
            children: [
              sidebarGroupContent({
                children: data.mails.map(mailView),
              }),
            ],
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
    class:
      'overflow-hidden *:data-[sidebar=sidebar]:flex-row',
    children: [iconSidebar(model), mailSidebar(model)],
  })
}

const pageContent = (): Html => {
  const h = html<Message>()

  return sidebarInset({
    children: [
      h.header(
        [
          h.Class(
            'sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4',
          ),
        ],
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
                        children: ['All Inboxes'],
                      }),
                    ],
                  }),
                  breadcrumbSeparator({ class: 'hidden md:block' }),
                  breadcrumbItem({
                    children: [
                      breadcrumbPage({ children: ['Inbox'] }),
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
        Array.from({ length: 24 }, () =>
          h.div(
            [
              h.Class(
                'aspect-video h-12 w-full rounded-lg bg-muted/50',
              ),
            ],
            [],
          ),
        ),
      ),
    ],
  })
}

const blockSidebarProvider = (
  state: 'expanded' | 'collapsed',
  children: ReadonlyArray<Html>,
): Html => {
  const h = html<Message>()

  return h.div(
    [
      h.DataAttribute('slot', 'sidebar-wrapper'),
      h.DataAttribute('state', state),
      h.Style({
        '--sidebar-width': '350px',
        '--sidebar-width-icon': '3rem',
      }),
      h.Class(
        'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
      ),
    ],
    [...children],
  )
}

export const view = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'

  return blockSidebarProvider(state, [
    appSidebar(model),
    pageContent(),
  ])
}

// PORT NOTE: The shared sidebarProvider fixes --sidebar-width at 16rem, so
// this block reproduces its wrapper locally to preserve the source's 350px
// nested-sidebar width. Mail ordering stays deterministic instead of using
// the source demo's random shuffle when a mailbox is selected.
// PORT NOTE: Avatar files are not bundled, so the source image is represented
// by its CN fallback.

/* Minimal interactive wiring:
   const model = init()
   const [nextModel, commands] = update(model, ToggledSidebar())
   view(nextModel)
*/

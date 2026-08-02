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
  sidebarHeader,
  sidebarInset,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuButtonVariants,
  sidebarMenuItem,
  sidebarProvider,
  sidebarRail,
  sidebarSeparator,
  sidebarTrigger,
} from '@/ui/sidebar'

const data = {
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

type UserMenuItem =
  | 'upgrade'
  | 'account'
  | 'billing'
  | 'notifications'
  | 'log-out'

const USER_MENU_ITEMS: ReadonlyArray<UserMenuItem> = [
  'upgrade',
  'account',
  'billing',
  'notifications',
  'log-out',
]
const UserMenu = DropdownMenu.create<UserMenuItem>()

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  calendar: Calendar.Model,
  selectedDate: S.Option(FoldkitCalendar.CalendarDate),
  calendarGroupsOpen: S.Array(S.Boolean),
  userMenu: DropdownMenu.Model,
})
export type Model = typeof Model.Type

export const ToggledSidebar = m('ToggledSidebar')
export const GotCalendarMessage = m('GotCalendarMessage', {
  message: Calendar.Message,
})
export const ToggledCalendarGroup = m('ToggledCalendarGroup', {
  index: S.Number,
  isOpen: S.Boolean,
})
export const GotUserMenuMessage = m('GotUserMenuMessage', {
  message: DropdownMenu.Message,
})
export const Message = S.Union([
  ToggledSidebar,
  GotCalendarMessage,
  ToggledCalendarGroup,
  GotUserMenuMessage,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
  isSidebarOpen: true,
  calendar: Calendar.init({
    id: 'sidebar-12-calendar',
    today: { year: 2024, month: 10, day: 15 },
  }),
  selectedDate: Option.none(),
  calendarGroupsOpen: data.calendars.map((_, index) => index === 0),
  userMenu: DropdownMenu.init({
    id: 'sidebar-12-user-menu',
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
          DropdownMenu.dropdownMenu<UserMenuItem, Message>({
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
            align: 'start',
            ariaLabel: 'User menu',
          }),
        ],
      }),
    ],
  })
}

const datePicker = (model: Calendar.Model, maybeSelectedDate: Option.Option<FoldkitCalendar.CalendarDate>): Html =>
  sidebarGroup<Message>({
    class: 'px-0',
    children: [
      sidebarGroupContent({
        children: [
          Calendar.calendar({
            model,
            maybeSelectedDate,
            toParentMessage: message => GotCalendarMessage({ message }),
            class:
              '[&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground',
          }),
        ],
      }),
    ],
  })

const calendars = (
  openStates: ReadonlyArray<boolean>,
): ReadonlyArray<Html> => {
  const h = html<Message>()
  return data.calendars.flatMap((calendar, index) => {
    const isOpen = openStates[index]
    if (isOpen === undefined) return []
    return [
      sidebarGroup({
        class: 'py-0',
        children: [
          Collapsible.collapsible({
            id: `sidebar-12-calendar-group-${index}`,
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
              'group/label flex h-8 w-full shrink-0 items-center rounded-md px-2 text-sm font-medium text-sidebar-foreground outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
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
                                  'group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active]:border-sidebar-primary data-[active]:bg-sidebar-primary',
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

const appSidebar = (model: Model): Html => {
  const state = model.isSidebarOpen ? 'expanded' : 'collapsed'
  return sidebar<Message>({
    state,
    children: [
      sidebarHeader({
        class: 'h-16 border-b border-sidebar-border',
        children: [navUser(model.userMenu)],
      }),
      sidebarContent({
        children: [
          datePicker(model.calendar, model.selectedDate),
          sidebarSeparator({ class: 'mx-0' }),
          ...calendars(model.calendarGroupsOpen),
        ],
      }),
      sidebarFooter({
        children: [
          sidebarMenu({
            children: [
              sidebarMenuItem({
                children: [
                  sidebarMenuButton({
                    children: [Icon.plus(), hSpan('New Calendar')],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      sidebarRail({ onClick: ToggledSidebar() }),
    ],
  })
}

const hSpan = (text: string): Html => {
  const h = html<Message>()
  return h.span([], [text])
}

const pageContent = (): Html => {
  const h = html<Message>()
  return sidebarInset({
    children: [
      h.header(
        [
          h.Class(
            'sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4',
          ),
        ],
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
                    children: [
                      breadcrumbPage({ children: ['October 2024'] }),
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
            [h.Class('grid auto-rows-min gap-4 md:grid-cols-5')],
            Array.from({ length: 20 }, () =>
              h.div(
                [h.Class('aspect-square rounded-xl bg-muted/50')],
                [],
              ),
            ),
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

// PORT NOTE: Avatar images are not bundled, so the source image uses its CN
// fallback. The calendar is interactive and initialized to October 2024.

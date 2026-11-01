// @ts-nocheck: snapshot of creaseui-demo chapter-09:src/design/app-sidebar.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Person } from '../domain'
import { avatar, avatarFallback } from '../ui/avatar'
import { type IconName, icon } from '../ui/icon'
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarMenu,
  sidebarMenuBadge,
  sidebarMenuButton,
  sidebarMenuItem,
} from '../ui/sidebar'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/**
 * AppSidebar: the navigation of every page.
 *
 * Rules:
 * - Top to bottom: the workspace name with its actions, the personal links
 *   (My issues, All issues), "Your teams", "Views", then the signed-in
 *   person with their actions. Sections without entries are left out.
 * - A link is an icon, a label and, where it helps, a count of open issues.
 *   All issues and saved views show no count.
 * - A team is its initial and name, not a link. Its pages are indented links
 *   below it (Issues, and later Board).
 * - Actions are icon buttons with a name; the pattern places them, the page
 *   decides which exist.
 */

export type NavLink<Msg> = Readonly<{
  label: string
  icon: IconName
  isActive: boolean
  onClick: Msg
  count?: number
}>

export type NavTeam<Msg> = Readonly<{
  name: string
  initial: string
  links: ReadonlyArray<NavLink<Msg>>
}>

const link = <Msg>(
  each: NavLink<Msg>,
  h: HtmlBuilder<Msg>,
  indent = false,
): Html =>
  sidebarMenuItem(
    {
      children: [
        sidebarMenuButton(
          {
            isActive: each.isActive,
            indent,
            onClick: each.onClick,
            children: [
              icon({ name: each.icon }, h),
              text({ children: [each.label] }, h),
            ],
          },
          h,
        ),
        ...(each.count === undefined
          ? []
          : [sidebarMenuBadge({ children: [String(each.count)] }, h)]),
      ],
    },
    h,
  )

const initialAvatar = <Msg>(initials: string, h: HtmlBuilder<Msg>): Html =>
  avatar(
    {
      size: 'sm',
      children: [avatarFallback({ tone: 'accent', children: [initials] }, h)],
    },
    h,
  )

const group = <Msg>(
  label: string | undefined,
  items: ReadonlyArray<Html>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> =>
  items.length === 0
    ? []
    : [
        sidebarGroup(
          {
            children: [
              ...(label === undefined
                ? []
                : [sidebarGroupLabel({ children: [label] }, h)]),
              sidebarMenu({ children: items }, h),
            ],
          },
          h,
        ),
      ]

const team = <Msg>(
  each: NavTeam<Msg>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> => [
  sidebarMenuItem(
    {
      children: [
        stack(
          {
            direction: 'horizontal',
            align: 'center',
            gap: 2,
            paddingInline: 2,
            paddingBlock: 1,
            children: [
              initialAvatar(each.initial, h),
              text({ weight: 'medium', children: [each.name] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  ),
  ...each.links.map(each => link(each, h, true)),
]

export const appSidebar = <Msg>(
  props: Readonly<{
    workspace: string
    headerActions: ReadonlyArray<Html>
    links: ReadonlyArray<NavLink<Msg>>
    teams: ReadonlyArray<NavTeam<Msg>>
    views: ReadonlyArray<NavLink<Msg>>
    person: Person
    footerActions: ReadonlyArray<Html>
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  sidebar(
    {
      children: [
        sidebarHeader(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  justify: 'between',
                  gap: 2,
                  children: [
                    text(
                      { weight: 'semibold', children: [props.workspace] },
                      h,
                    ),
                    stack(
                      {
                        direction: 'horizontal',
                        gap: 1,
                        children: props.headerActions,
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        sidebarContent(
          {
            children: [
              ...group(
                undefined,
                props.links.map(each => link(each, h)),
                h,
              ),
              ...group(
                'Your teams',
                props.teams.flatMap(each => team(each, h)),
                h,
              ),
              ...group(
                'Views',
                props.views.map(each => link(each, h)),
                h,
              ),
            ],
          },
          h,
        ),
        sidebarFooter(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  justify: 'between',
                  gap: 2,
                  children: [
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 2,
                        children: [
                          initialAvatar(props.person.initials, h),
                          text(
                            { weight: 'medium', children: [props.person.name] },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    stack(
                      {
                        direction: 'horizontal',
                        gap: 1,
                        children: props.footerActions,
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

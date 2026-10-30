// @ts-nocheck: snapshot of creaseui-demo chapter-04:src/view.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { ME } from './domain'
import { allIssuesView } from './features/issues'
import { myIssuesView } from './features/my-issues'
import { searchView } from './features/search'
import { type Message, Message as M, type Model } from './model'
import { button } from './ui/button'
import { heading } from './ui/heading'
import { icon } from './ui/icon'
import { input } from './ui/input'
import {
  sidebar,
  sidebarContent,
  sidebarFooter,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInset,
  sidebarMenu,
  sidebarMenuBadge,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarProvider,
} from './ui/sidebar'
import { stack } from './ui/stack'
import { text } from './ui/text'

const openCount = (model: Model, mine: boolean): number =>
  model.issues.filter(
    issue => issue.status !== 'done' && (!mine || issue.assigneeId === ME),
  ).length

const navItem = (
  model: Model,
  view: Model['view'],
  label: string,
  iconName: 'list' | 'circle-user',
  h: HtmlBuilder<Message>,
): Html =>
  sidebarMenuItem(
    {
      children: [
        sidebarMenuButton(
          {
            isActive: model.view === view && model.query === '',
            onClick: M.SelectedView({ view }),
            children: [
              icon({ name: iconName }, h),
              text({ children: [label] }, h),
            ],
          },
          h,
        ),
        sidebarMenuBadge(
          { children: [String(openCount(model, view === 'mine'))] },
          h,
        ),
      ],
    },
    h,
  )

const themeToggle = (model: Model, h: HtmlBuilder<Message>): Html =>
  button(
    {
      variant: 'ghost',
      size: 'icon-sm',
      ariaLabel: model.isDark ? 'Use light theme' : 'Use dark theme',
      onClick: M.ToggledTheme(),
      children: [icon({ name: model.isDark ? 'sun' : 'moon' }, h)],
    },
    h,
  )

const title = (model: Model): string =>
  model.query !== ''
    ? 'Search'
    : model.view === 'mine'
      ? 'My issues'
      : 'All issues'

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  sidebarProvider(
    {
      children: [
        sidebar(
          {
            children: [
              sidebarHeader(
                {
                  children: [
                    text({ weight: 'semibold', children: ['Crease Tasks'] }, h),
                  ],
                },
                h,
              ),
              sidebarContent(
                {
                  children: [
                    sidebarGroup(
                      {
                        children: [
                          sidebarGroupLabel({ children: ['Workspace'] }, h),
                          sidebarMenu(
                            {
                              children: [
                                navItem(model, 'all', 'All issues', 'list', h),
                                navItem(
                                  model,
                                  'mine',
                                  'My issues',
                                  'circle-user',
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
              ),
              sidebarFooter({ children: [themeToggle(model, h)] }, h),
            ],
          },
          h,
        ),
        sidebarInset(
          {
            children: [
              stack(
                {
                  as: 'header',
                  direction: 'horizontal',
                  align: 'center',
                  justify: 'between',
                  gap: 3,
                  paddingInline: 4,
                  paddingBlock: 2,
                  children: [
                    heading(
                      {
                        level: 4,
                        accessibilityLevel: 1,
                        children: [title(model)],
                      },
                      h,
                    ),
                    input(
                      {
                        id: 'search',
                        value: model.query,
                        onInput: query => M.ChangedQuery({ query }),
                        placeholder: 'Search issues',
                        ariaLabel: 'Search issues',
                        role: 'searchbox',
                        class: 'h-7 w-56 text-xs',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              model.query !== ''
                ? searchView(model, h)
                : model.view === 'mine'
                  ? myIssuesView(model, h)
                  : allIssuesView(model, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

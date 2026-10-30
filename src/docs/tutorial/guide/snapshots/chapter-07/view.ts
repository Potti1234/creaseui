// @ts-nocheck: snapshot of creaseui-demo chapter-07:src/view.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, ME, TEAMS, personOf } from './domain'
import { appSidebar } from './design/app-sidebar'
import { allIssuesView } from './features/issues'
import { myIssuesView } from './features/my-issues'
import { searchView } from './features/search'
import { SAVED_VIEWS, savedView, savedViewOf } from './features/views'
import { type Message, Message as M, type Model, type View } from './model'
import { button } from './ui/button'
import { heading } from './ui/heading'
import { icon } from './ui/icon'
import { input } from './ui/input'
import { sidebarInset, sidebarProvider } from './ui/sidebar'
import { stack } from './ui/stack'

const isOpen = (issue: Issue): boolean => issue.status !== 'done'

const teamView = (teamId: string): View =>
  teamId === 'eng' ? 'team:eng' : 'team:des'

const teamIssues = (model: Model, teamId: string): ReadonlyArray<Issue> =>
  model.issues.filter(issue => issue.teamId === teamId)

const isShown = (model: Model, view: View): boolean =>
  model.view === view && model.query === ''

const themeToggle = (model: Model, h: HtmlBuilder<Message>): Html =>
  button(
    {
      shape: 'icon',
      ariaLabel: model.isDark ? 'Use light theme' : 'Use dark theme',
      onClick: M.ToggledTheme(),
      children: [icon({ name: model.isDark ? 'sun' : 'moon' }, h)],
    },
    h,
  )

const navigation = (model: Model, h: HtmlBuilder<Message>): Html =>
  appSidebar(
    {
      workspace: 'Crease Tasks',
      headerActions: [],
      links: [
        {
          label: 'My issues',
          icon: 'circle-user',
          isActive: isShown(model, 'mine'),
          onClick: M.SelectedView({ view: 'mine' }),
          count: model.issues.filter(
            issue => isOpen(issue) && issue.assigneeId === ME,
          ).length,
        },
        {
          label: 'All issues',
          icon: 'layout-grid',
          isActive: isShown(model, 'all'),
          onClick: M.SelectedView({ view: 'all' }),
        },
      ],
      teams: TEAMS.map(team => ({
        name: team.name,
        initial: team.initial,
        links: [
          {
            label: 'Issues',
            icon: 'list',
            isActive: isShown(model, teamView(team.id)),
            onClick: M.SelectedView({ view: teamView(team.id) }),
            count: teamIssues(model, team.id).filter(isOpen).length,
          },
        ],
      })),
      views: SAVED_VIEWS.map(saved => ({
        label: saved.label,
        icon: saved.icon,
        isActive: isShown(model, saved.view),
        onClick: M.SelectedView({ view: saved.view }),
      })),
      person: personOf(ME) ?? { id: ME, name: ME, initials: '?' },
      footerActions: [themeToggle(model, h)],
    },
    h,
  )

const title = (model: Model): string => {
  if (model.query !== '') return 'Search'
  if (model.view === 'mine') return 'My issues'
  if (model.view === 'all') return 'All issues'
  const team = TEAMS.find(each => teamView(each.id) === model.view)
  return team === undefined
    ? (savedViewOf(model.view)?.label ?? 'All issues')
    : `${team.name} · Issues`
}

const main = (model: Model, h: HtmlBuilder<Message>): Html => {
  if (model.query !== '') return searchView(model, h)
  if (model.view === 'mine') return myIssuesView(model, h)
  const saved = savedViewOf(model.view)
  if (saved !== undefined) return savedView(model, saved, h)
  const team = TEAMS.find(each => teamView(each.id) === model.view)
  return allIssuesView(
    model,
    team === undefined ? model.issues : teamIssues(model, team.id),
    h,
  )
}

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  sidebarProvider(
    {
      children: [
        navigation(model, h),
        sidebarInset(
          {
            // Rows never wrap (D1), so the content area must be allowed to
            // shrink below their single-line width.
            class: 'min-w-0',
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
                        class: 'w-56',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              main(model, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

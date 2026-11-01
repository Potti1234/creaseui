// @ts-nocheck: snapshot of creaseui-demo chapter-15:src/view.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, ME, TEAMS, type Team, personOf } from './domain'
import { appSidebar } from './design/app-sidebar'
import { issuePage } from './features/issue'
import { allIssuesView } from './features/issues'
import { myIssuesView } from './features/my-issues'
import { searchView } from './features/search'
import { SAVED_VIEWS, savedView, savedViewOf } from './features/views'
import { type CommandEntry, commandMenu } from './design/command-menu'
import { issueComposer } from './design/issue-composer'
import { saveNotice } from './design/save-notice'
import {
  type Message,
  Message as M,
  type Model,
  type View,
  isBoardView,
  pickersOf,
  teamIdOf,
  teamPage,
} from './model'
import { button } from './ui/button'
import { heading } from './ui/heading'
import { icon } from './ui/icon'
import { input } from './ui/input'
import { sidebarInset, sidebarProvider } from './ui/sidebar'
import { stack } from './ui/stack'

const isOpen = (issue: Issue): boolean => issue.status !== 'done'

const teamOf = (view: View): Team | undefined =>
  TEAMS.find(each => each.id === teamIdOf(view))

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
      headerActions: [
        button(
          {
            shape: 'icon',
            ariaLabel: 'Command menu (Ctrl+K)',
            onClick: M.ClickedCommandMenu(),
            children: [icon({ name: 'search' }, h)],
          },
          h,
        ),
        button(
          {
            shape: 'icon',
            ariaLabel: 'New issue (C)',
            onClick: M.ClickedNewIssue(),
            children: [icon({ name: 'pencil' }, h)],
          },
          h,
        ),
      ],
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
            isActive: isShown(model, teamPage(team.id, 'list')),
            onClick: M.SelectedView({ view: teamPage(team.id, 'list') }),
            count: teamIssues(model, team.id).filter(isOpen).length,
          },
          {
            label: 'Board',
            icon: 'kanban',
            isActive: isShown(model, teamPage(team.id, 'board')),
            onClick: M.SelectedView({ view: teamPage(team.id, 'board') }),
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

const openIssue = (model: Model): Issue | undefined =>
  model.openIssueId === null
    ? undefined
    : model.issues.find(issue => issue.id === model.openIssueId)

const commandEntries = (model: Model): ReadonlyArray<CommandEntry> => [
  { id: 'new-issue', label: 'New issue', group: 'Actions', shortcut: 'C' },
  {
    id: 'theme',
    label: model.isDark ? 'Use light theme' : 'Use dark theme',
    group: 'Actions',
  },
  { id: 'go:mine', label: 'My issues', group: 'Go to' },
  { id: 'go:all', label: 'All issues', group: 'Go to' },
  ...TEAMS.flatMap(team => [
    {
      id: `go:${teamPage(team.id, 'list')}`,
      label: `${team.name} · Issues`,
      group: 'Go to' as const,
    },
    {
      id: `go:${teamPage(team.id, 'board')}`,
      label: `${team.name} · Board`,
      group: 'Go to' as const,
    },
  ]),
  ...SAVED_VIEWS.map(saved => ({
    id: `go:${saved.view}`,
    label: saved.label,
    group: 'Go to' as const,
  })),
  ...model.issues.map(issue => ({
    id: `issue:${issue.id}`,
    label: `${issue.id} ${issue.title}`,
    group: 'Issues' as const,
  })),
]

const listTitle = (model: Model): string => {
  if (model.query !== '') return 'Search'
  if (model.view === 'mine') return 'My issues'
  if (model.view === 'all') return 'All issues'
  const team = teamOf(model.view)
  if (team === undefined) return savedViewOf(model.view)?.label ?? 'All issues'
  return isBoardView(model.view)
    ? `${team.name} · Board`
    : `${team.name} · Issues`
}

const title = (model: Model): string => {
  const issue = openIssue(model)
  return issue === undefined
    ? listTitle(model)
    : `${listTitle(model)} › ${issue.id}`
}

const main = (model: Model, h: HtmlBuilder<Message>): Html => {
  const issue = openIssue(model)
  if (issue !== undefined) return issuePage(model, issue, listTitle(model), h)
  if (model.query !== '') return searchView(model, h)
  if (model.view === 'mine') return myIssuesView(model, h)
  const saved = savedViewOf(model.view)
  if (saved !== undefined) return savedView(model, saved, h)
  const team = teamOf(model.view)
  return allIssuesView(
    model,
    team === undefined ? model.issues : teamIssues(model, team.id),
    h,
  )
}

const notices = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> =>
  model.save === 'failed'
    ? [
        saveNotice(
          {
            title: 'Your last change was not saved',
            description:
              'The browser refused to store it. Your changes are still on this page; they are lost if you reload before a save succeeds.',
            onRetry: M.RetriedSave(),
          },
          h,
        ),
      ]
    : model.loadNotice === null
      ? []
      : [
          saveNotice(
            {
              title: 'Saved issues could not be read',
              description: model.loadNotice,
            },
            h,
          ),
        ]

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
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 2,
                        children: [
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
                          // The page's one main action (D4, D6).
                          button(
                            {
                              id: 'new-issue',
                              intent: 'primary',
                              onClick: M.ClickedNewIssue(),
                              children: [
                                model.draft.title.trim() === ''
                                  ? 'New issue'
                                  : 'New issue (draft)',
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
              ...notices(model, h),
              main(model, h),
              issueComposer(
                {
                  dialog: model.composer,
                  toDialogMessage: message => M.GotComposerMessage({ message }),
                  draft: model.draft,
                  titleError: model.titleError,
                  onTitle: title => M.ChangedDraftTitle({ title }),
                  onCreate: M.SubmittedComposer(),
                  onCancel: M.CancelledComposer(),
                  pickers: pickersOf(model),
                },
                h,
              ),
              commandMenu(
                {
                  dialog: model.menu,
                  command: model.menuSearch,
                  toDialogMessage: message => M.GotMenuMessage({ message }),
                  toCommandMessage: message =>
                    M.GotMenuSearchMessage({ message }),
                  entries: commandEntries(model),
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

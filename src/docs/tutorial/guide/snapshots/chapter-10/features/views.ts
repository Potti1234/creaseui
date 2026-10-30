// @ts-nocheck: snapshot of creaseui-demo chapter-10:src/features/views.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, STATUSES } from '../domain'
import { issueCollection } from '../design/issue-collection'
import {
  type Message,
  Message as M,
  type Model,
  type View,
  pickersOf,
} from '../model'
import type { IconName } from '../ui/icon'

/* Saved views: a name, an icon and the issues they list, grouped by status. */

export type SavedView = Readonly<{
  view: View
  label: string
  icon: IconName
  matches: (issue: Issue) => boolean
}>

export const SAVED_VIEWS: ReadonlyArray<SavedView> = [
  {
    view: 'urgent',
    label: 'Urgent & high',
    icon: 'zap',
    matches: issue =>
      (issue.priority === 'urgent' || issue.priority === 'high') &&
      issue.status !== 'done',
  },
  {
    view: 'unassigned',
    label: 'Unassigned',
    icon: 'user-round-x',
    matches: issue =>
      issue.assigneeId === null &&
      (issue.status === 'backlog' || issue.status === 'todo'),
  },
]

export const savedViewOf = (view: View): SavedView | undefined =>
  SAVED_VIEWS.find(each => each.view === view)

export const savedView = (
  model: Model,
  saved: SavedView,
  h: HtmlBuilder<Message>,
): Html => {
  const issues = model.issues.filter(saved.matches)
  return issueCollection(
    {
      controls: [],
      body:
        issues.length === 0
          ? {
              kind: 'empty',
              title: `No issues in ${saved.label}`,
              description: 'Issues show up here when they match this view.',
            }
          : {
              kind: 'groups',
              groups: STATUSES.map(status => ({
                status,
                issues: issues.filter(issue => issue.status === status),
                isCollapsed: model.collapsed.includes(status),
                onToggle: M.ToggledGroup({ status }),
              })),
            },
      pickers: pickersOf(model),
      onOpen: id => M.OpenedIssue({ id }),
    },
    h,
  )
}

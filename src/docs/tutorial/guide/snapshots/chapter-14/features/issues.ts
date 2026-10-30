// @ts-nocheck: snapshot of creaseui-demo chapter-14:src/features/issues.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, STATUSES } from '../domain'
import { issueCollection } from '../design/issue-collection'
import {
  type Message,
  Message as M,
  type Model,
  isBoardView,
  pickersOf,
  teamIdOf,
} from '../model'

/* All issues, or one team's. A list is grouped by status or flat; a team's
   page can also show its issues as a board. The Layout switch sends
   ToggledLayout, which opens the same view as the sidebar's other link. */

export const allIssuesView = (
  model: Model,
  issues: ReadonlyArray<Issue>,
  h: HtmlBuilder<Message>,
): Html => {
  const isTeamPage = teamIdOf(model.view) !== undefined
  const isBoard = isBoardView(model.view)
  return issueCollection(
    {
      display: [
        ...(isTeamPage
          ? [
              {
                name: 'Layout' as const,
                value: isBoard ? 'Board' : 'List',
                onChange: M.ToggledLayout(),
              },
            ]
          : []),
        // A board always has one column per status; grouping is a list's choice.
        ...(isBoard
          ? []
          : [
              {
                name: 'Grouping' as const,
                value: model.isGrouped ? 'Status' : 'None',
                onChange: M.ToggledGrouping(),
              },
            ]),
      ],
      body: isBoard
        ? { kind: 'board', issues }
        : model.isGrouped
          ? {
              kind: 'groups',
              groups: STATUSES.map(status => ({
                status,
                issues: issues.filter(issue => issue.status === status),
                isCollapsed: model.collapsed.includes(status),
                onToggle: M.ToggledGroup({ status }),
              })),
            }
          : { kind: 'rows', issues },
      pickers: pickersOf(model),
      onOpen: id => M.OpenedIssue({ id }),
    },
    h,
  )
}

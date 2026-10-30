// @ts-nocheck: snapshot of creaseui-demo chapter-13:src/features/issues.ts
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
import { button } from '../ui/button'

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
      controls: [
        ...(isTeamPage
          ? [
              button(
                {
                  onClick: M.ToggledLayout(),
                  children: [isBoard ? 'Layout: Board' : 'Layout: List'],
                },
                h,
              ),
            ]
          : []),
        // A board always has one column per status; grouping is a list's choice.
        ...(isBoard
          ? []
          : [
              button(
                {
                  onClick: M.ToggledGrouping(),
                  children: [
                    model.isGrouped ? 'Grouped by status' : 'Not grouped',
                  ],
                },
                h,
              ),
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

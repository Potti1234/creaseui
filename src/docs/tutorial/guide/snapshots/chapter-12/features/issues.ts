// @ts-nocheck: snapshot of creaseui-demo chapter-12:src/features/issues.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, STATUSES } from '../domain'
import { issueCollection } from '../design/issue-collection'
import { type Message, Message as M, type Model, pickersOf } from '../model'
import { button } from '../ui/button'

/* All issues, or one team's, grouped by status or as one list. */

export const allIssuesView = (
  model: Model,
  issues: ReadonlyArray<Issue>,
  h: HtmlBuilder<Message>,
): Html =>
  issueCollection(
    {
      controls: [
        button(
          {
            onClick: M.ToggledGrouping(),
            children: [model.isGrouped ? 'Grouped by status' : 'Not grouped'],
          },
          h,
        ),
      ],
      body: model.isGrouped
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

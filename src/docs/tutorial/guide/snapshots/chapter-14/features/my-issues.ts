// @ts-nocheck: snapshot of creaseui-demo chapter-14:src/features/my-issues.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, ME, PRIORITY_RANK } from '../domain'
import { issueCollection } from '../design/issue-collection'
import { type Message, Message as M, type Model, pickersOf } from '../model'

/* The signed-in person's open issues, as one list. */

const issueNumber = (issue: Issue): number => Number(issue.id.split('-')[1])

const sorted = (model: Model): ReadonlyArray<Issue> =>
  model.issues
    .filter(issue => issue.assigneeId === ME && issue.status !== 'done')
    .toSorted((a, b) =>
      model.sort === 'priority'
        ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        : issueNumber(b) - issueNumber(a),
    )

export const myIssuesView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const issues = sorted(model)
  return issueCollection(
    {
      display: [
        {
          name: 'Order',
          value: model.sort === 'priority' ? 'Priority' : 'Newest',
          onChange: M.ToggledSort(),
        },
      ],
      body:
        issues.length === 0
          ? {
              kind: 'empty',
              title: 'Nothing assigned to you',
              description:
                'Issues you are assigned to and have not finished show up here.',
            }
          : { kind: 'rows', issues },
      pickers: pickersOf(model),
      onOpen: id => M.OpenedIssue({ id }),
    },
    h,
  )
}

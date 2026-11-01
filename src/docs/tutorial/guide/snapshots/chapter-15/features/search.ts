// @ts-nocheck: snapshot of creaseui-demo chapter-15:src/features/search.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue } from '../domain'
import { issueCollection } from '../design/issue-collection'
import { type Message, Message as M, type Model, pickersOf } from '../model'

/* Search results: issues whose identifier or title contains the query. */

const matches = (issue: Issue, query: string): boolean => {
  const needle = query.trim().toLowerCase()
  return (
    issue.id.toLowerCase().includes(needle) ||
    issue.title.toLowerCase().includes(needle)
  )
}

export const searchView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const results = model.issues.filter(issue => matches(issue, model.query))
  return issueCollection(
    {
      actions: [{ label: 'Clear search', onClick: M.ClearedQuery() }],
      summary: `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${model.query}”`,
      body:
        results.length === 0
          ? {
              kind: 'empty',
              title: 'No issues match',
              description:
                'Try an identifier like CRE-131 or a word from the title.',
            }
          : { kind: 'rows', issues: results },
      pickers: pickersOf(model),
      onOpen: id => M.OpenedIssue({ id }),
    },
    h,
  )
}

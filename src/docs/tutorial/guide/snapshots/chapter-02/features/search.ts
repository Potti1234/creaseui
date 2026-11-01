// @ts-nocheck: snapshot of creaseui-demo chapter-02:src/features/search.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue } from '../domain'
import { type Message, Message as M, type Model } from '../model'
import { statusGlyph } from './glyphs'
import { button } from '../ui/button'
import { empty, emptyDescription, emptyHeader, emptyTitle } from '../ui/empty'
import { item, itemContent, itemGroup, itemMedia, itemTitle } from '../ui/item'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/* Search results: issues whose identifier or title contains the query. */

const matches = (issue: Issue, query: string): boolean => {
  const needle = query.trim().toLowerCase()
  return (
    issue.id.toLowerCase().includes(needle) ||
    issue.title.toLowerCase().includes(needle)
  )
}

export const result = (issue: Issue, h: HtmlBuilder<Message>): Html =>
  item(
    {
      size: 'xs',
      class: 'flex-nowrap h-9 px-3 hover:bg-accent',
      children: [
        itemMedia({ children: [statusGlyph(issue.status, h)] }, h),
        itemContent(
          {
            class: 'min-w-0 flex-row items-baseline gap-2',
            children: [
              text(
                {
                  size: 'xsm',
                  color: 'secondary',
                  hasTabularNumbers: true,
                  children: [issue.id],
                },
                h,
              ),
              itemTitle({ class: 'truncate', children: [issue.title] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

export const searchView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const results = model.issues.filter(issue => matches(issue, model.query))
  return stack(
    {
      paddingInline: 2,
      children: [
        stack(
          {
            direction: 'horizontal',
            align: 'center',
            gap: 2,
            paddingInline: 2,
            paddingBlockEnd: 2,
            children: [
              text(
                {
                  size: 'xsm',
                  color: 'secondary',
                  children: [
                    `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${model.query}”`,
                  ],
                },
                h,
              ),
              button(
                {
                  variant: 'link',
                  size: 'xs',
                  class: 'px-0',
                  onClick: M.ClearedQuery(),
                  children: ['Clear search'],
                },
                h,
              ),
            ],
          },
          h,
        ),
        results.length === 0
          ? empty(
              {
                children: [
                  emptyHeader(
                    {
                      children: [
                        emptyTitle({ children: ['No issues match'] }, h),
                        emptyDescription(
                          {
                            children: [
                              'Try an identifier like CRE-131 or a word from the title.',
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
          : itemGroup({ children: results.map(issue => result(issue, h)) }, h),
      ],
    },
    h,
  )
}

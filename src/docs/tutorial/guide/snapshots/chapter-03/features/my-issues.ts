// @ts-nocheck: snapshot of creaseui-demo chapter-03:src/features/my-issues.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, ME, PRIORITY_RANK } from '../domain'
import { type Message, Message as M, type Model } from '../model'
import { priorityGlyph, statusGlyph } from './glyphs'
import { badge } from '../ui/badge'
import { button } from '../ui/button'
import {
  item,
  itemActions,
  itemContent,
  itemGroup,
  itemMedia,
  itemTitle,
} from '../ui/item'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

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

export const myRow = (issue: Issue, h: HtmlBuilder<Message>): Html =>
  item(
    {
      size: 'sm',
      class: 'flex-nowrap gap-2 py-1.5',
      children: [
        itemMedia(
          {
            children: [
              statusGlyph(issue.status, h),
              priorityGlyph(issue.priority, h),
            ],
          },
          h,
        ),
        itemContent(
          {
            class: 'min-w-0',
            children: [
              itemTitle({ class: 'truncate', children: [issue.title] }, h),
            ],
          },
          h,
        ),
        itemActions(
          {
            children: [
              ...issue.labels.map(label =>
                badge({ variant: 'secondary', children: [label] }, h),
              ),
              text(
                {
                  size: 'xsm',
                  color: 'secondary',
                  hasTabularNumbers: true,
                  children: [issue.id],
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

export const myIssuesView = (model: Model, h: HtmlBuilder<Message>): Html =>
  stack(
    {
      paddingInline: 2,
      children: [
        stack(
          {
            direction: 'horizontal',
            paddingInline: 2,
            paddingBlockEnd: 2,
            children: [
              button(
                {
                  variant: 'outline',
                  size: 'sm',
                  class: 'h-7 rounded-md',
                  onClick: M.ToggledSort(),
                  children: [
                    model.sort === 'priority'
                      ? 'Sort: Priority'
                      : 'Sort: Newest',
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        itemGroup({ children: sorted(model).map(issue => myRow(issue, h)) }, h),
      ],
    },
    h,
  )

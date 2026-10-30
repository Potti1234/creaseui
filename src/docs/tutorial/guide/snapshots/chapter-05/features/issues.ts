// @ts-nocheck: snapshot of creaseui-demo chapter-05:src/features/issues.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, STATUSES, STATUS_LABEL, personOf } from '../domain'
import { type Message, Message as M, type Model } from '../model'
import { priorityGlyph, statusGlyph } from './glyphs'
import { avatar, avatarFallback } from '../ui/avatar'
import { badge } from '../ui/badge'
import { button } from '../ui/button'
import {
  item,
  itemActions,
  itemContent,
  itemGroup,
  itemGroupSeparator,
  itemMedia,
  itemTitle,
} from '../ui/item'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/* All issues, grouped by status. */

export const row = (issue: Issue, h: HtmlBuilder<Message>): Html => {
  const assignee = personOf(issue.assigneeId)
  return item(
    {
      size: 'xs',
      layout: 'inline',
      children: [
        itemMedia(
          {
            children: [
              priorityGlyph(issue.priority, h),
              text(
                {
                  size: 'xsm',
                  color: 'secondary',
                  hasTabularNumbers: true,
                  children: [issue.id],
                },
                h,
              ),
              statusGlyph(issue.status, h),
            ],
          },
          h,
        ),
        itemContent(
          { children: [itemTitle({ children: [issue.title] }, h)] },
          h,
        ),
        itemActions(
          {
            children: [
              ...issue.labels.map(label =>
                badge({ variant: 'outline', children: [label] }, h),
              ),
              text(
                { size: 'xsm', color: 'secondary', children: [issue.updated] },
                h,
              ),
              avatar(
                {
                  size: 'sm',
                  children: [
                    avatarFallback(
                      { children: [assignee?.initials ?? '–'] },
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
      ],
    },
    h,
  )
}

const rows = (issues: ReadonlyArray<Issue>, h: HtmlBuilder<Message>): Html =>
  itemGroup(
    {
      children: issues.flatMap((issue, index) =>
        index === 0 ? [row(issue, h)] : [itemGroupSeparator(), row(issue, h)],
      ),
    },
    h,
  )

const group = (
  label: string,
  issues: ReadonlyArray<Issue>,
  h: HtmlBuilder<Message>,
): Html =>
  stack(
    {
      children: [
        stack(
          {
            direction: 'horizontal',
            align: 'center',
            gap: 2,
            paddingInline: 4,
            paddingBlock: 1.5,
            class: 'bg-muted',
            children: [
              text({ size: 'xsm', weight: 'medium', children: [label] }, h),
              text(
                {
                  size: 'xsm',
                  color: 'secondary',
                  children: [String(issues.length)],
                },
                h,
              ),
            ],
          },
          h,
        ),
        stack({ paddingInline: 2, children: [rows(issues, h)] }, h),
      ],
    },
    h,
  )

export const allIssuesView = (model: Model, h: HtmlBuilder<Message>): Html =>
  stack(
    {
      children: [
        stack(
          {
            direction: 'horizontal',
            gap: 2,
            paddingInline: 4,
            paddingBlockEnd: 2,
            children: [
              button(
                {
                  onClick: M.ToggledGrouping(),
                  children: [
                    model.isGrouped ? 'Grouped by status' : 'Not grouped',
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        model.isGrouped
          ? stack(
              {
                children: STATUSES.flatMap(status => {
                  const issues = model.issues.filter(
                    issue => issue.status === status,
                  )
                  return issues.length === 0
                    ? []
                    : [group(STATUS_LABEL[status], issues, h)]
                }),
              },
              h,
            )
          : stack({ paddingInline: 2, children: [rows(model.issues, h)] }, h),
      ],
    },
    h,
  )

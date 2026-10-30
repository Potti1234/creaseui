// @ts-nocheck: snapshot of creaseui-demo chapter-15:src/design/issue-card.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue } from '../domain'
import { type PickerContext, propertyPicker } from './property-picker'
import { badge } from '../ui/badge'
import {
  item,
  itemContent,
  itemFooter,
  itemHeader,
  itemTitle,
} from '../ui/item'
import { link } from '../ui/link'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/**
 * IssueCard: one issue on a board.
 *
 * Rules (decisions D2, D7, D12):
 * - Every board uses this card, and only a board does; lists use IssueRow.
 *   A card shows the same parts as the row, in the same order, on three
 *   lines: priority, identifier and status; the title; labels, date and
 *   assignee.
 * - A part with no value keeps its place (an unassigned issue shows the
 *   empty assignee).
 * - The title is a link to the issue's own page (IssueDetail), drawn in
 *   the card's text colour; it is the card's only way in.
 * - Unlike a row (D1), the title and the labels may wrap: the column is
 *   narrow and the title is what a person reads first. The date follows
 *   the labels; the assignee stays at the end of the last line. The first
 *   line never wraps.
 * - Metadata (identifier, date) uses the small secondary text style.
 * - Priority, status and assignee are PropertyPickers: they change the
 *   issue in place (D7), and focus returns to the picker's trigger in the
 *   card. Changing the status moves the card to the column of its new
 *   status; that is the pointer route between columns (D9). There is no
 *   drag and drop.
 *
 * A board decides which issues to show and in which order. This card
 * decides how each one appears.
 */
export const issueCard = <Msg>(
  props: Readonly<{
    issue: Issue
    pickers: PickerContext<Msg>
    onOpen: (id: string) => Msg
  }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { issue, pickers } = props
  return item(
    {
      variant: 'outline',
      size: 'sm',
      element: 'article',
      children: [
        itemHeader(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  gap: 2,
                  children: [
                    propertyPicker(
                      { issue, field: 'priority', context: pickers },
                      h,
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
                    propertyPicker(
                      { issue, field: 'status', context: pickers },
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
        itemContent(
          {
            children: [
              itemTitle(
                {
                  children: [
                    link(
                      {
                        href: `#${issue.id}`,
                        color: 'inherit',
                        onClick: props.onOpen(issue.id),
                        children: [issue.title],
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
        itemFooter(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  gap: 2,
                  wrap: 'wrap',
                  children: [
                    ...issue.labels.map(label =>
                      badge({ variant: 'outline', children: [label] }, h),
                    ),
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        children: [issue.updated],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              propertyPicker({ issue, field: 'assignee', context: pickers }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

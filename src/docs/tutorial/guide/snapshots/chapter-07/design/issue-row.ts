// @ts-nocheck: snapshot of creaseui-demo chapter-07:src/design/issue-row.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue } from '../domain'
import { type PickerContext, propertyPicker } from './property-picker'
import { badge } from '../ui/badge'
import {
  item,
  itemActions,
  itemContent,
  itemMedia,
  itemTitle,
} from '../ui/item'
import { text } from '../ui/text'

/**
 * IssueRow: one issue in any list.
 *
 * Rules (decisions D1, D2, D3):
 * - Every view that lists issues uses this row. There is no second row
 *   layout for a "compact" or "search" case.
 * - The parts and their order are fixed: priority, identifier, status,
 *   title, labels, date, assignee. A part with no value keeps its place
 *   (an unassigned issue shows the empty assignee).
 * - The row is 36px and never wraps. The title is the only part that
 *   gives way: it truncates first.
 * - Metadata (identifier, date) uses the small secondary text style.
 * - Priority, status and assignee are PropertyPickers: they change the
 *   issue in place (D7).
 *
 * A view decides which issues to show and in which order. This row decides
 * how each one appears.
 */
export const issueRow = <Msg>(
  props: Readonly<{ issue: Issue; pickers: PickerContext<Msg> }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { issue, pickers } = props
  return item(
    {
      size: 'xs',
      layout: 'inline',
      children: [
        itemMedia(
          {
            children: [
              propertyPicker({ issue, field: 'priority', context: pickers }, h),
              text(
                {
                  size: 'xsm',
                  color: 'secondary',
                  hasTabularNumbers: true,
                  children: [issue.id],
                },
                h,
              ),
              propertyPicker({ issue, field: 'status', context: pickers }, h),
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

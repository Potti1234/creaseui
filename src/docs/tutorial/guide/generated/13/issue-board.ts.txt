import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, STATUSES_IN_ORDER, STATUS_LABEL, type Status } from '../domain'
import { statusGlyph } from './glyphs'
import { type PickerContext, propertyPicker } from './property-picker'
import { badge } from '@/ui/badge'
import { item, itemContent, itemFooter, itemHeader, itemMedia, itemTitle } from '@/ui/item'
import { stack } from '@/ui/stack'
import { text } from '@/ui/text'

/**
 * IssueBoard: issues as cards, in one column per status.
 *
 * Rules:
 * - Columns follow the workflow order (Backlog to Done, D10), left to
 *   right, and every status has a column, empty or not: a card that
 *   changes status always has a column to land in, and the board does not
 *   shift when one empties.
 * - A column's header is a muted `item` row, like IssueGroup's: status
 *   glyph, status name, number of issues. Columns do not collapse.
 * - Columns share the width the board has, equally, down to a minimum
 *   (COLUMN_MIN_WIDTH). Only when the board is narrower than five minimum
 *   columns does it scroll sideways, inside its own region; the page never
 *   scrolls sideways. At 1280px all five columns are visible.
 * - Inside a column, issues keep the order the view gave them.
 * - Every issue is an IssueCard.
 *
 * IssueCard: one issue on a board.
 *
 * Rules (decisions D2, D3, D7, D12):
 * - The parts and their order are the row's: priority, identifier, status,
 *   then the title, then labels, date, assignee. The card only stacks them
 *   on three lines: metadata, title, footer.
 * - Unlike a row (D1), the title wraps (D12). A card has a width, not a
 *   fixed height; truncating would hide most of a title in a narrow
 *   column. Labels wrap too rather than push the assignee out of the card.
 * - Metadata uses the small secondary text style; labels the `outline`
 *   badge (D2).
 * - Priority, status and assignee are PropertyPickers (D7). Changing the
 *   status moves the card to that column.
 *
 * Whoever renders the board decides which issues show and how they are
 * ordered. These rules decide how they appear.
 */

/* Five columns of this width plus their gaps (5 × 180 + 4 × 12 = 948px)
   fit the content area of a 1280px window (about 1000px beside the
   sidebar). Narrower than that, the board scrolls inside its own region. */
const COLUMN_MIN_WIDTH = 180

export const issueCard = <Msg>(
  props: Readonly<{ issue: Issue; pickers: PickerContext<Msg> }>,
  h: HtmlBuilder<Msg>,
): Html => {
  const { issue, pickers } = props
  return item(
    {
      variant: 'outline',
      size: 'sm',
      element: 'li',
      children: [
        itemHeader(
          {
            children: [
              itemMedia(
                {
                  children: [
                    propertyPicker({ issue, field: 'priority', context: pickers }, h),
                    text({ size: 'xsm', color: 'secondary', hasTabularNumbers: true, children: [issue.id] }, h),
                    propertyPicker({ issue, field: 'status', context: pickers }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        itemContent({ children: [itemTitle({ children: [issue.title] }, h)] }, h),
        itemFooter(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  align: 'center',
                  gap: 2,
                  wrap: 'wrap',
                  class: 'min-w-0',
                  children: [
                    ...issue.labels.map(label => badge({ variant: 'outline', children: [label] }, h)),
                    text({ size: 'xsm', color: 'secondary', children: [issue.updated] }, h),
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

const column = <Msg>(
  status: Status,
  issues: ReadonlyArray<Issue>,
  pickers: PickerContext<Msg>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      as: 'section',
      gap: 2,
      // The minimum is the basis; every column grows by the same share of
      // the space left over, and none shrinks below the minimum.
      width: COLUMN_MIN_WIDTH,
      class: 'grow shrink-0',
      children: [
        item(
          {
            variant: 'muted',
            size: 'xs',
            layout: 'inline',
            children: [
              itemMedia({ children: [statusGlyph(status, h)] }, h),
              itemContent(
                {
                  children: [
                    itemTitle({ children: [STATUS_LABEL[status]] }, h),
                    text({ size: 'xsm', color: 'secondary', hasTabularNumbers: true, children: [String(issues.length)] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        ...(issues.length === 0
          ? []
          : [stack({ as: 'ul', gap: 2, children: issues.map(issue => issueCard({ issue, pickers }, h)) }, h)]),
      ],
    },
    h,
  )

export const issueBoard = <Msg>(
  props: Readonly<{ issues: ReadonlyArray<Issue>; pickers: PickerContext<Msg> }>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      direction: 'horizontal',
      align: 'start',
      gap: 3,
      paddingBlockEnd: 4,
      isScrollable: true,
      children: STATUSES_IN_ORDER.map(status =>
        column(
          status,
          props.issues.filter(issue => issue.status === status),
          props.pickers,
          h,
        ),
      ),
    },
    h,
  )

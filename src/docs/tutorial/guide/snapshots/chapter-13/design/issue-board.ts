// @ts-nocheck: snapshot of creaseui-demo chapter-13:src/design/issue-board.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import {
  type Issue,
  STATUSES_IN_ORDER,
  STATUS_LABEL,
  type Status,
} from '../domain'
import { statusGlyph } from './glyphs'
import { issueCard } from './issue-card'
import type { PickerContext } from './property-picker'
import { item, itemContent, itemMedia, itemTitle } from '../ui/item'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/**
 * IssueBoard: issues as cards, in one column per status.
 *
 * Rules (decision D12 for the cards):
 * - One column for every status, in workflow order (Backlog to Done, as
 *   the picker offers them). Unlike groups, an empty column is shown: it
 *   is a place an issue can move to.
 * - A column's header is the group header without its collapse button: a
 *   muted `item` row with the status glyph, the status name and the number
 *   of issues.
 * - Cards are IssueCards, one below the other. An empty column says so in
 *   the small secondary text style.
 * - Columns share the width of the board equally, down to a minimum of
 *   176px (`min-w-44`). Only when five columns at their minimum do not fit
 *   does the board scroll sideways, inside its own region; the page never
 *   does. At 1280px with the sidebar open all five columns fit.
 * - There is no drag and drop: a card moves to another column when its
 *   status changes through its picker (D7, D9).
 *
 * The view decides which issues show and in which order; each column keeps
 * that order. The board decides the columns.
 */

type BoardColumn = Readonly<{ status: Status; issues: ReadonlyArray<Issue> }>

const column = <Msg>(
  props: BoardColumn &
    Readonly<{ pickers: PickerContext<Msg>; onOpen: (id: string) => Msg }>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      as: 'section',
      gap: 2,
      // Equal shares of the board's width (flex: 1 1 0), never narrower
      // than the minimum; below it the board scrolls, the columns do not shrink.
      class: 'flex-1 min-w-44',
      children: [
        item(
          {
            variant: 'muted',
            size: 'xs',
            layout: 'inline',
            children: [
              itemMedia({ children: [statusGlyph(props.status, h)] }, h),
              itemContent(
                {
                  children: [
                    itemTitle({ children: [STATUS_LABEL[props.status]] }, h),
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        hasTabularNumbers: true,
                        children: [String(props.issues.length)],
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
        ...(props.issues.length === 0
          ? [
              stack(
                {
                  paddingInline: 2,
                  children: [
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        children: ['No issues'],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ]
          : props.issues.map(issue =>
              issueCard(
                { issue, pickers: props.pickers, onOpen: props.onOpen },
                h,
              ),
            )),
      ],
    },
    h,
  )

export const issueBoard = <Msg>(
  props: Readonly<{
    issues: ReadonlyArray<Issue>
    pickers: PickerContext<Msg>
    onOpen: (id: string) => Msg
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      direction: 'horizontal',
      align: 'start',
      gap: 3,
      paddingBlockEnd: 2,
      // The board's own sideways scroll region: the columns' minimum widths
      // overflow into it, never into the page.
      isScrollable: true,
      children: STATUSES_IN_ORDER.map(status =>
        column(
          {
            status,
            issues: props.issues.filter(issue => issue.status === status),
            pickers: props.pickers,
            onOpen: props.onOpen,
          },
          h,
        ),
      ),
    },
    h,
  )

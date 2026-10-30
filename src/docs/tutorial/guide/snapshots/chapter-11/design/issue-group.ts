// @ts-nocheck: snapshot of creaseui-demo chapter-11:src/design/issue-group.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, STATUS_LABEL, type Status } from '../domain'
import { statusGlyph } from './glyphs'
import { issueRow } from './issue-row'
import type { PickerContext } from './property-picker'
import { button } from '../ui/button'
import { icon } from '../ui/icon'
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

/**
 * IssueGroup: the issues of one status, under a header.
 *
 * Rules:
 * - The header shows the status glyph, the status name and the number of
 *   issues, and a button that collapses the group. It is a muted `item`
 *   row, the same height as an issue row.
 * - A collapsed group keeps its header and count.
 * - An empty group is not rendered; the collection leaves it out.
 * - Rows are IssueRows with a line between them.
 */
export const issueGroup = <Msg>(
  props: Readonly<{
    status: Status
    issues: ReadonlyArray<Issue>
    isCollapsed: boolean
    onToggle: Msg
    pickers: PickerContext<Msg>
    onOpen: (id: string) => Msg
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      as: 'section',
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
              itemActions(
                {
                  children: [
                    button(
                      {
                        shape: 'icon',
                        ariaLabel: `${props.isCollapsed ? 'Expand' : 'Collapse'} ${STATUS_LABEL[props.status]}`,
                        ariaExpanded: !props.isCollapsed,
                        onClick: props.onToggle,
                        children: [
                          icon(
                            {
                              name: props.isCollapsed
                                ? 'chevron-right'
                                : 'chevron-down',
                              size: 'sm',
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
            ],
          },
          h,
        ),
        ...(props.isCollapsed
          ? []
          : [
              itemGroup(
                {
                  children: props.issues.flatMap((issue, index) => {
                    const row = issueRow(
                      { issue, pickers: props.pickers, onOpen: props.onOpen },
                      h,
                    )
                    return index === 0 ? [row] : [itemGroupSeparator(), row]
                  }),
                },
                h,
              ),
            ]),
      ],
    },
    h,
  )

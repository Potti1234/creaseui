// @ts-nocheck: snapshot of creaseui-demo chapter-07:src/design/issue-collection.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue, Status } from '../domain'
import { issueGroup } from './issue-group'
import { issueRow } from './issue-row'
import type { PickerContext } from './property-picker'
import { empty, emptyDescription, emptyHeader, emptyTitle } from '../ui/empty'
import { itemGroup, itemGroupSeparator } from '../ui/item'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/**
 * IssueCollection: the body of every page that lists issues (All issues,
 * My issues, search results, and later saved views).
 *
 * Rules:
 * - One bar above the list. Display controls (grouping, ordering) sit at
 *   its start; a summary of what is shown ("6 results for …") sits after
 *   them. Filters join this bar in a later chapter.
 * - The body is one of three things: groups by status, a flat list, or an
 *   empty state that says what to try instead. A view picks one; it does
 *   not build its own list.
 * - Groups follow the workflow order the domain defines and leave out
 *   empty statuses.
 * - Rows are always IssueRows, separated by a line, inset from the page
 *   edge by the collection, not by the row.
 *
 * The view decides which issues show and how they are ordered. These rules
 * decide how they appear.
 */

export type CollectionBody<Msg> =
  | Readonly<{
      kind: 'groups'
      groups: ReadonlyArray<
        Readonly<{
          status: Status
          issues: ReadonlyArray<Issue>
          isCollapsed: boolean
          onToggle: Msg
        }>
      >
    }>
  | Readonly<{ kind: 'rows'; issues: ReadonlyArray<Issue> }>
  | Readonly<{ kind: 'empty'; title: string; description: string }>

export const issueCollection = <Msg>(
  props: Readonly<{
    controls: ReadonlyArray<Html>
    summary?: string
    body: CollectionBody<Msg>
    pickers: PickerContext<Msg>
  }>,
  h: HtmlBuilder<Msg>,
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
            paddingBlockEnd: 2,
            children: [
              ...props.controls,
              ...(props.summary === undefined
                ? []
                : [
                    text(
                      {
                        size: 'xsm',
                        color: 'secondary',
                        children: [props.summary],
                      },
                      h,
                    ),
                  ]),
            ],
          },
          h,
        ),
        stack(
          { paddingInline: 2, children: [body(props.body, props.pickers, h)] },
          h,
        ),
      ],
    },
    h,
  )

const body = <Msg>(
  content: CollectionBody<Msg>,
  pickers: PickerContext<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (content.kind) {
    case 'groups':
      return stack(
        {
          gap: 1,
          children: content.groups
            .filter(group => group.issues.length > 0)
            .map(group => issueGroup({ ...group, pickers }, h)),
        },
        h,
      )
    case 'rows':
      return itemGroup(
        {
          children: content.issues.flatMap((issue, index) => {
            const row = issueRow({ issue, pickers }, h)
            return index === 0 ? [row] : [itemGroupSeparator(), row]
          }),
        },
        h,
      )
    case 'empty':
      return empty(
        {
          children: [
            emptyHeader(
              {
                children: [
                  emptyTitle({ children: [content.title] }, h),
                  emptyDescription({ children: [content.description] }, h),
                ],
              },
              h,
            ),
          ],
        },
        h,
      )
  }
}

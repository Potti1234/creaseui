// @ts-nocheck: snapshot of creaseui-demo chapter-14:src/design/issue-collection.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { Issue, Status } from '../domain'
import { issueBoard } from './issue-board'
import { issueGroup } from './issue-group'
import { issueRow } from './issue-row'
import type { PickerContext } from './property-picker'
import { button } from '../ui/button'
import { empty, emptyDescription, emptyHeader, emptyTitle } from '../ui/empty'
import { itemGroup, itemGroupSeparator } from '../ui/item'
import { stack } from '../ui/stack'
import { text } from '../ui/text'

/**
 * IssueCollection: the body of every page that lists issues (All issues,
 * My issues, search results, and later saved views).
 *
 * Rules:
 * - One bar above the list (decision D13). Display options come first, as
 *   "Name: value" buttons in the order Layout, Grouping, Order; then the
 *   summary of what is shown ("6 results for …"); then actions on the list
 *   itself ("Clear search"). A view passes data; the collection draws the
 *   bar, so every list page has the same one.
 * - The body is one of four things: groups by status, a flat list, a
 *   board (IssueBoard, one column per status), or an empty state that says
 *   what to try instead. A view picks one; it does not build its own list.
 *   A board is never replaced by the empty state: its empty columns are
 *   where new issues go.
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
  | Readonly<{ kind: 'board'; issues: ReadonlyArray<Issue> }>
  | Readonly<{ kind: 'empty'; title: string; description: string }>

/** A display option: how the list is shown, not which issues it shows. */
export type DisplayOption<Msg> = Readonly<{
  name: 'Layout' | 'Grouping' | 'Order'
  value: string
  onChange: Msg
}>

/** An action on the list itself, such as clearing a search. */
export type CollectionAction<Msg> = Readonly<{ label: string; onClick: Msg }>

const DISPLAY_ORDER: ReadonlyArray<DisplayOption<never>['name']> = [
  'Layout',
  'Grouping',
  'Order',
]

const displayButtons = <Msg>(
  options: ReadonlyArray<DisplayOption<Msg>>,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Html> =>
  DISPLAY_ORDER.flatMap(name =>
    options
      .filter(option => option.name === name)
      .map(option =>
        button(
          {
            onClick: option.onChange,
            children: [`${option.name}: ${option.value}`],
          },
          h,
        ),
      ),
  )

export const issueCollection = <Msg>(
  props: Readonly<{
    display?: ReadonlyArray<DisplayOption<Msg>>
    actions?: ReadonlyArray<CollectionAction<Msg>>
    summary?: string
    body: CollectionBody<Msg>
    pickers: PickerContext<Msg>
    /** Opens an issue on its own page; the row's title links to it. */
    onOpen: (id: string) => Msg
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
              ...displayButtons(props.display ?? [], h),
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
              ...(props.actions ?? []).map(action =>
                button(
                  { onClick: action.onClick, children: [action.label] },
                  h,
                ),
              ),
            ],
          },
          h,
        ),
        stack(
          {
            paddingInline: 2,
            children: [body(props.body, props.pickers, props.onOpen, h)],
          },
          h,
        ),
      ],
    },
    h,
  )

const body = <Msg>(
  content: CollectionBody<Msg>,
  pickers: PickerContext<Msg>,
  onOpen: (id: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (content.kind) {
    case 'groups':
      return stack(
        {
          gap: 1,
          children: content.groups
            .filter(group => group.issues.length > 0)
            .map(group => issueGroup({ ...group, pickers, onOpen }, h)),
        },
        h,
      )
    case 'rows':
      return itemGroup(
        {
          children: content.issues.flatMap((issue, index) => {
            const row = issueRow({ issue, pickers, onOpen }, h)
            return index === 0 ? [row] : [itemGroupSeparator(), row]
          }),
        },
        h,
      )
    case 'board':
      return issueBoard({ issues: content.issues, pickers, onOpen }, h)
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

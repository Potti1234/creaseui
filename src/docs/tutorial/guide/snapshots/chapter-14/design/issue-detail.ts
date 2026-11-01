// @ts-nocheck: snapshot of creaseui-demo chapter-14:src/design/issue-detail.ts
import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, TEAMS } from '../domain'
import { type PickerContext, propertyPicker } from './property-picker'
import { badge } from '../ui/badge'
import { button } from '../ui/button'
import { fieldError } from '../ui/field'
import { icon } from '../ui/icon'
import { input } from '../ui/input'
import { stack } from '../ui/stack'
import { text } from '../ui/text'
import { textarea } from '../ui/textarea'

/**
 * IssueDetail: one issue on its own page.
 *
 * Rules:
 * - A back button to the list the issue was opened from, then the
 *   identifier, the title and the description. Title and description are
 *   edited in place and saved as you type; there is no Save button.
 * - An empty title is not saved. The field shows why, and the last valid
 *   title stays on the issue until the field is valid again.
 * - Status, priority and assignee change through the same PropertyPicker
 *   as in the row (D7), listed below the description with labels, team and
 *   the last update.
 */

export const TITLE_FIELD_ID = 'issue-title'

const property = <Msg>(label: string, value: Html, h: HtmlBuilder<Msg>): Html =>
  stack(
    {
      direction: 'horizontal',
      align: 'center',
      gap: 2,
      children: [
        text({ size: 'xsm', color: 'secondary', children: [label] }, h),
        value,
      ],
    },
    h,
  )

export const issueDetail = <Msg>(
  props: Readonly<{
    issue: Issue
    title: string
    titleError: string | null
    backLabel: string
    onBack: Msg
    onTitle: (title: string) => Msg
    onDescription: (description: string) => Msg
    pickers: PickerContext<Msg>
  }>,
  h: HtmlBuilder<Msg>,
): Html =>
  stack(
    {
      gap: 4,
      paddingInline: 4,
      paddingBlock: 2,
      children: [
        stack(
          {
            direction: 'horizontal',
            align: 'center',
            gap: 2,
            children: [
              button(
                {
                  onClick: props.onBack,
                  children: [icon({ name: 'arrow-left' }, h), props.backLabel],
                },
                h,
              ),
              text(
                { size: 'xsm', color: 'secondary', children: [props.issue.id] },
                h,
              ),
            ],
          },
          h,
        ),
        stack(
          {
            gap: 1.5,
            children: [
              input(
                {
                  id: TITLE_FIELD_ID,
                  value: props.title,
                  ariaLabel: 'Title',
                  onInput: props.onTitle,
                  isRequired: true,
                  isInvalid: props.titleError !== null,
                  ...(props.titleError === null
                    ? {}
                    : { describedBy: `${TITLE_FIELD_ID}-error` }),
                },
                h,
              ),
              ...(props.titleError === null
                ? []
                : [fieldError({ children: [props.titleError] }, h)]),
            ],
          },
          h,
        ),
        textarea(
          {
            id: 'issue-description',
            value: props.issue.description,
            label: 'Description',
            placeholder: 'Add a description',
            rows: 6,
            onInput: props.onDescription,
          },
          h,
        ),
        stack(
          {
            direction: 'horizontal',
            align: 'center',
            gap: 4,
            children: [
              property(
                'Status',
                propertyPicker(
                  {
                    issue: props.issue,
                    field: 'status',
                    context: props.pickers,
                  },
                  h,
                ),
                h,
              ),
              property(
                'Priority',
                propertyPicker(
                  {
                    issue: props.issue,
                    field: 'priority',
                    context: props.pickers,
                  },
                  h,
                ),
                h,
              ),
              property(
                'Assignee',
                propertyPicker(
                  {
                    issue: props.issue,
                    field: 'assignee',
                    context: props.pickers,
                  },
                  h,
                ),
                h,
              ),
              property(
                'Team',
                text(
                  {
                    size: 'sm',
                    children: [
                      TEAMS.find(team => team.id === props.issue.teamId)
                        ?.name ?? props.issue.teamId,
                    ],
                  },
                  h,
                ),
                h,
              ),
              ...(props.issue.labels.length === 0
                ? []
                : [
                    property(
                      'Labels',
                      stack(
                        {
                          direction: 'horizontal',
                          gap: 1,
                          children: props.issue.labels.map(label =>
                            badge({ variant: 'outline', children: [label] }, h),
                          ),
                        },
                        h,
                      ),
                      h,
                    ),
                  ]),
              property(
                'Updated',
                text({ size: 'sm', children: [props.issue.updated] }, h),
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

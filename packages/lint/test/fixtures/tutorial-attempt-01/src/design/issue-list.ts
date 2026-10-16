import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Button from '@/ui/button'
import * as Empty from '@/ui/empty'
import { type Status } from '@/data'
import { glyph, iconAction, statusIcon } from './primitives'

export const issueCollection = <M>(
  props: Readonly<{
    children: ReadonlyArray<Html>
    count: number
    isSaved: boolean
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.section(
    [
      h.Class('issue-collection'),
      h.AriaLabel('Issues'),
      h.Id('issue-collection'),
    ],
    [
      ...props.children,
      h.div(
        [h.Class('collection-footer')],
        [
          h.span([], [String(props.count) + ' issues']),
          h.span(
            [],
            [
              props.isSaved
                ? 'Changes saved on this device'
                : 'Changes could not be saved',
            ],
          ),
        ],
      ),
    ],
  )

export const issueGroup = <M>(
  props: Readonly<{
    status: Status
    label: string
    count: number
    collapsed: boolean
    onToggle: M
    onCreate: M
    children: ReadonlyArray<Html>
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.section(
    [h.Class('issue-group'), h.AriaLabel(props.label)],
    [
      h.div(
        [h.Class('group-heading')],
        [
          Button.button(
            {
              variant: 'taskGroup',
              onClick: props.onToggle,
              buttonAttributes: [
                h.AriaExpanded(!props.collapsed),
                h.AriaControls('group-' + props.status),
              ],
              children: [
                h.span(
                  [
                    h.Class(
                      props.collapsed
                        ? 'group-chevron'
                        : 'group-chevron is-open',
                    ),
                  ],
                  [glyph('chevron-right', h)],
                ),
                statusIcon(props.status, h),
                h.span([h.Class('group-name')], [props.label]),
                h.span([h.Class('group-count')], [String(props.count)]),
              ],
            },
            h,
          ),
          iconAction(
            {
              label: 'Create issue in ' + props.label,
              icon: 'plus',
              onClick: props.onCreate,
            },
            h,
          ),
        ],
      ),
      h.div(
        [
          h.Id('group-' + props.status),
          h.Role('list'),
          h.AriaLabel(props.label + ' issues'),
          ...(props.collapsed ? [h.Hidden(true)] : []),
        ],
        [...props.children],
      ),
    ],
  )

export const issueRow = <M>(
  props: Readonly<{
    id: string
    title: string
    label: string
    project: string
    status: Status
    isSelected: boolean
    statusControl: Html
    priorityControl: Html
    assigneeControl: Html
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.keyed('div')(
    props.id,
    [
      h.Role('listitem'),
      h.Class('issue-row'),
      h.DataAttribute('issue-id', props.id),
      h.DataAttribute('status', props.status),
      h.DataAttribute('selected', String(props.isSelected)),
    ],
    [
      props.statusControl,
      h.span([h.Class('issue-id')], [props.id]),
      h.div(
        [h.Class('issue-subject')],
        [
          h.span([h.Class('issue-title'), h.Title(props.title)], [props.title]),
          ...(props.label
            ? [
                h.span(
                  [h.Class('issue-label label-' + props.label.toLowerCase())],
                  [
                    h.span([h.Class('label-dot'), h.AriaHidden(true)], []),
                    props.label,
                  ],
                ),
              ]
            : []),
        ],
      ),
      h.span(
        [h.Class('issue-project')],
        [
          glyph(
            props.project === 'Editor' ? 'square-terminal' : 'app-window',
            h,
          ),
          props.project,
        ],
      ),
      props.priorityControl,
      props.assigneeControl,
    ],
  )

export const emptyIssues = <M>(
  props: Readonly<{ isFiltered: boolean; onClear: M; onCreate: M }>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class('product-empty')],
    [
      Empty.empty(
        {
          children: [
            Empty.emptyHeader(
              {
                children: [
                  Empty.emptyMedia(
                    {
                      variant: 'icon',
                      children: [
                        glyph(props.isFiltered ? 'search' : 'layout-grid', h),
                      ],
                    },
                    h,
                  ),
                  Empty.emptyTitle(
                    {
                      children: [
                        props.isFiltered
                          ? 'No issues match your view'
                          : 'A clear place to start',
                      ],
                    },
                    h,
                  ),
                  Empty.emptyDescription(
                    {
                      children: [
                        props.isFiltered
                          ? 'Try a different search or remove your filter.'
                          : 'Create an issue to capture the next thing to work on.',
                      ],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
            Button.button(
              {
                variant: 'taskOutline',
                size: 'sm',
                ariaLabel: props.isFiltered
                  ? 'Clear search and filters'
                  : 'Create issue',
                onClick: props.isFiltered ? props.onClear : props.onCreate,
                children: [
                  props.isFiltered
                    ? 'Clear search and filters'
                    : 'Create issue',
                ],
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  )

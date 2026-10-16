import type { Html, HtmlBuilder } from 'foldkit/html'
import * as Button from '@/ui/button'
import * as Input from '@/ui/input'
import type { IconName } from '@/lib/icon'
import { type View } from '@/model'
import { brand, glyph, iconAction, person, shortcut } from './primitives'

export const appShell = <M>(
  props: Readonly<{
    sidebar: Html
    header: Html
    toolbar: Html
    content: Html
    overlays: ReadonlyArray<Html>
    notice: Html
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class('app-shell')],
    [
      props.sidebar,
      h.main(
        [h.Class('workspace'), h.Id('main-content')],
        [props.header, props.toolbar, props.content],
      ),
      ...props.overlays,
      props.notice,
    ],
  )

type SidebarProps<M> = Readonly<{
  view: View
  counts: Readonly<Record<string, number>>
  onNavigate: (view: View) => M
  onSearch: M
  onCreate: M
  onReset: M
}>

export const sidebar = <M>(props: SidebarProps<M>, h: HtmlBuilder<M>): Html => {
  const item = (view: View, label: string, icon: IconName, count?: number) =>
    Button.button(
      {
        variant: 'taskNavigation',
        onClick: props.onNavigate(view),
        ariaLabel: label,
        buttonAttributes: props.view === view ? [h.AriaCurrent('page')] : [],
        children: [
          glyph(icon, h),
          h.span([h.Class('nav-label')], [label]),
          ...(count === undefined
            ? []
            : [h.span([h.Class('nav-count')], [String(count)])]),
        ],
      },
      h,
    )
  return h.aside(
    [h.Class('sidebar'), h.AriaLabel('Workspace navigation')],
    [
      h.div(
        [h.Class('workspace-brand')],
        [
          brand(h),
          h.span([h.Class('workspace-name')], ['Crease Tasks']),
          iconAction(
            {
              label: 'Create issue',
              icon: 'file-pen-line',
              onClick: props.onCreate,
            },
            h,
          ),
        ],
      ),
      Button.button(
        {
          variant: 'taskSearch',
          ariaLabel: 'Search issues',
          onClick: props.onSearch,
          children: [
            glyph('search', h),
            h.span([h.Class('nav-label')], ['Search issues']),
            shortcut('/', h),
          ],
        },
        h,
      ),
      h.nav(
        [h.Class('sidebar-nav'), h.AriaLabel('Issues')],
        [
          item('mine', 'My issues', 'circle-user', props.counts.mine),
          h.div([h.Class('nav-section-label')], ['Workspace']),
          item('all', 'All issues', 'layout-grid', props.counts.all),
          item('active', 'Active issues', 'circle-dot', props.counts.active),
          h.div([h.Class('nav-section-label project-section')], ['Projects']),
          item('workspace', 'Workspace experience', 'app-window'),
          item('editor', 'Editor', 'square-terminal'),
        ],
      ),
      h.div(
        [h.Class('sidebar-bottom')],
        [
          h.div(
            [h.Class('account-row')],
            [
              person('alex', h),
              h.div(
                [h.Class('account-copy')],
                [
                  h.span([], ['Alex Morgan']),
                  h.span([], ['Personal workspace']),
                ],
              ),
              iconAction(
                {
                  label: 'Reset sample workspace',
                  icon: 'rotate-ccw',
                  onClick: props.onReset,
                },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

export const pageHeader = <M>(
  props: Readonly<{ title: string; count: number; action: Html }>,
  h: HtmlBuilder<M>,
): Html =>
  h.header(
    [h.Class('page-header')],
    [
      h.div(
        [h.Class('location')],
        [
          h.span([h.Class('team-mark')], [glyph('layout-grid', h)]),
          h.span([], ['Product']),
          h.span([h.Class('breadcrumb-divider'), h.AriaHidden(true)], ['/']),
          h.h1([h.Id('issue-list-heading'), h.Tabindex(-1)], [props.title]),
          h.span(
            [h.Class('view-count')],
            [String(props.count), h.span([h.Class('sr-only')], [' issues'])],
          ),
        ],
      ),
      props.action,
    ],
  )

export const toolbar = <M>(
  props: Readonly<{
    filter: Html
    display: Html
    query: string
    filterLabel: string
    onQuery: (value: string) => M
    onClear: M
  }>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class('view-toolbar')],
    [
      h.div(
        [h.Class('toolbar-left')],
        [
          props.filter,
          ...(props.filterLabel
            ? [
                Button.button(
                  {
                    variant: 'taskFilter',
                    onClick: props.onClear,
                    ariaLabel: 'Remove ' + props.filterLabel + ' filter',
                    children: [props.filterLabel, glyph('x', h)],
                  },
                  h,
                ),
              ]
            : []),
        ],
      ),
      h.div(
        [h.Class('toolbar-right')],
        [
          h.div(
            [h.Class('search-field')],
            [
              glyph('search', h),
              Input.input(
                {
                  id: 'issue-search',
                  ariaLabel: 'Search issues in this view',
                  type: 'search',
                  value: props.query,
                  placeholder: 'Search issues...',
                  onInput: props.onQuery,
                  appearance: 'search',
                },
                h,
              ),
              ...(props.query ? [] : [shortcut('/', h)]),
            ],
          ),
          props.display,
        ],
      ),
    ],
  )

export const feedback = <M>(
  props: Readonly<{ notice: string; storageNotice: string; onDismiss: M }>,
  h: HtmlBuilder<M>,
): Html =>
  h.div(
    [h.Class('feedback-host'), h.AriaLive('polite'), h.Role('status')],
    props.notice || props.storageNotice
      ? [
          h.div(
            [h.Class('feedback-toast')],
            [
              glyph(props.storageNotice ? 'circle-alert' : 'circle-check', h),
              h.span([], [props.storageNotice || props.notice]),
              ...(props.storageNotice
                ? []
                : [
                    iconAction(
                      {
                        label: 'Dismiss notification',
                        icon: 'x',
                        onClick: props.onDismiss,
                      },
                      h,
                    ),
                  ]),
            ],
          ),
        ]
      : [],
  )

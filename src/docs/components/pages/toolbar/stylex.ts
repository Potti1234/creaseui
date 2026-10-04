import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition'
import {
  FILTER_FIELDS,
  JOBS,
  toolbarFixtures,
  type FilterField,
  type Job,
} from '@/docs/components/pages/toolbar/shared'
import * as Icon from '@/lib/icon'
import { badge } from '@/stylex/badge'
import { button } from '@/stylex/button'
import { checkbox } from '@/stylex/checkbox'
import { input } from '@/stylex/input'
import { nativeSelect } from '@/stylex/native-select'
import {
  table,
  tableBody,
  tableCell,
  tableHead,
  tableHeader,
  tableRow,
} from '@/stylex/table'
import * as Tabs from '@/stylex/tabs'
import * as Toolbar from '@/stylex/toolbar'
import { className } from '@/stylex/style'
import { tokens } from '../../../../stylex/tokens.stylex'

const styles = stylex.create({
  card: {
    borderColor: tokens.border,
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: tokens.card,
  },
  iconMd: {
    flexShrink: 0,
    pointerEvents: 'none',
    height: '1rem',
    width: '1rem',
  },
  w600: { width: '600px' },
  w500: { width: '500px' },
  w640: { width: '640px' },
  w760: { width: '760px' },
  column: { gap: '1rem', display: 'flex', flexDirection: 'column' },
  body: { padding: '1rem', height: '10rem' },
  bodySm: { padding: '1rem', height: '8rem' },
  heading: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: '1.5rem',
  },
  readout: {
    color: tokens.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    whiteSpace: 'nowrap',
  },
  searchWidth: { width: '10rem' },
  headCheck: { width: '2rem' },
  emptyState: {
    padding: '2rem',
    gap: '0.75rem',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.25rem',
  },
  tableBottom: {
    borderColor: tokens.border,
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: tokens.card,
    borderBottomLeftRadius: 'calc(var(--radius) + 4px)',
    borderBottomRightRadius: 'calc(var(--radius) + 4px)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
})

interface PreviewShape {
  readonly tabs: Tabs.Model
  readonly selectedTab: string
  readonly selectedRows: ReadonlyArray<string>
  readonly search: string
  readonly status: string
  readonly priority: string
  readonly customer: string
}

const heading = <Msg>(text: string, h: HtmlBuilder<Msg>): Html =>
  h.h4([h.Class(className(styles.heading))], [text])

const ghostIconButton = <Msg>(
  name: string,
  ariaLabel: string,
  h: HtmlBuilder<Msg>,
  edgeComp = false,
): Html =>
  h.div(edgeComp ? [h.DataAttribute('crease-edge-comp', '')] : [], [
    button<Msg>(
      {
        variant: 'ghost',
        size: 'icon-sm',
        ariaLabel,
        leadingIcon: Icon.icon(name, { class: className(styles.iconMd) }, h),
        children: [],
      },
      h,
    ),
  ])

const jobsTable = <Msg>(
  rows: ReadonlyArray<Job>,
  model: PreviewShape,
  withSelection: boolean,
  onToggle: (id: string, isChecked: boolean) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  table(
    {
      children: [
        tableHeader(
          {
            children: [
              tableRow(
                {
                  children: [
                    ...(withSelection
                      ? [
                          tableHead(
                            { children: [''], layoutStyle: styles.headCheck },
                            h,
                          ),
                        ]
                      : []),
                    tableHead({ children: ['Job'] }, h),
                    tableHead({ children: ['Customer'] }, h),
                    tableHead({ children: ['Status'] }, h),
                    tableHead({ children: ['Priority'] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        tableBody(
          {
            children: rows.map(job =>
              tableRow(
                {
                  children: [
                    ...(withSelection
                      ? [
                          tableCell(
                            {
                              children: [
                                checkbox<Msg>(
                                  {
                                    id: `row-${job.id}`,
                                    isChecked: model.selectedRows.includes(
                                      job.id,
                                    ),
                                    onToggle: isChecked =>
                                      onToggle(job.id, isChecked),
                                    label: `Select ${job.job}`,
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                        ]
                      : []),
                    tableCell({ children: [job.job] }, h),
                    tableCell({ children: [job.customer] }, h),
                    tableCell({ children: [job.status] }, h),
                    tableCell({ children: [job.priority] }, h),
                  ],
                },
                h,
              ),
            ),
          },
          h,
        ),
      ],
    },
    h,
  )

const filterRows = (model: PreviewShape): ReadonlyArray<Job> => {
  const query = model.search.trim().toLowerCase()
  return JOBS.filter(
    row =>
      (query === '' ||
        `${row.job} ${row.customer}`.toLowerCase().includes(query)) &&
      FILTER_FIELDS.every(
        field => model[field.key] === '' || row[field.key] === model[field.key],
      ),
  )
}

const bodyFor = <Msg>(
  fixture: (typeof toolbarFixtures)[number],
  model: PreviewShape,
  toToolbarMessage: (message: Toolbar.Message) => Msg,
  toTabsMessage: (message: Tabs.Message) => Msg,
  toToggle: (id: string, isChecked: boolean) => Msg,
  deselectAll: Msg,
  toChangedSearch: (value: string) => Msg,
  toChangedClause: (field: FilterField, value: string) => Msg,
  clearFilters: Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  switch (fixture.kind) {
    case 'threeSlot':
      return h.div(
        [h.Class(className(styles.card, styles.w600))],
        [
          Toolbar.toolbar<Msg>(
            {
              label: 'Document toolbar',
              dividers: ['bottom'],
              toParentMessage: toToolbarMessage,
              startContent: [ghostIconButton('arrow-left', 'Back', h, true)],
              centerContent: heading('Title', h),
              endContent: [
                button<Msg>({ variant: 'secondary', children: ['Discard'] }, h),
                button<Msg>({ variant: 'default', children: ['Save'] }, h),
              ],
            },
            h,
          ),
          h.div([h.Class(className(styles.body))], []),
        ],
      )
    case 'cardHeader':
      return h.div(
        [h.Class(className(styles.card, styles.w500))],
        [
          Toolbar.toolbar<Msg>(
            {
              label: 'User list actions',
              size: 'sm',
              dividers: ['bottom'],
              toParentMessage: toToolbarMessage,
              startContent: [heading('Card title', h)],
              endContent: [
                ghostIconButton('funnel', 'Filter', h, true),
                button<Msg>(
                  {
                    variant: 'default',
                    size: 'icon-sm',
                    ariaLabel: 'Add user',
                    leadingIcon: Icon.icon(
                      'plus',
                      { class: className(styles.iconMd) },
                      h,
                    ),
                    children: [],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          h.div([h.Class(className(styles.bodySm))], []),
        ],
      )
    case 'sizes':
      return h.div(
        [h.Class(className(styles.column, styles.w500))],
        (
          [
            ['sm', 'Small'],
            ['md', 'Medium'],
            ['lg', 'Large'],
          ] as const
        ).map(([size, label]) =>
          h.div(
            [h.Class(className(styles.card))],
            [
              Toolbar.toolbar<Msg>(
                {
                  label: `${label} toolbar`,
                  size,
                  toParentMessage: toToolbarMessage,
                  startContent: [heading(label, h)],
                  endContent: [
                    ghostIconButton('funnel', 'Filter', h, true),
                    button<Msg>(
                      {
                        variant: 'default',
                        size: size === 'sm' ? 'sm' : 'default',
                        leadingIcon: Icon.icon(
                          'plus',
                          { class: className(styles.iconMd) },
                          h,
                        ),
                        children: ['Add'],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          ),
        ),
      )
    case 'tabs':
      return h.div(
        [h.Class(className(styles.card, styles.w600))],
        [
          Toolbar.toolbar<Msg>(
            {
              label: 'Section navigation',
              dividers: ['bottom'],
              toParentMessage: toToolbarMessage,
              startContent: [
                h.div(
                  [h.DataAttribute('crease-edge-comp', '')],
                  [
                    Tabs.tabs<Msg>(
                      {
                        model: model.tabs,
                        selectedValue: model.selectedTab,
                        toParentMessage: toTabsMessage,
                        tabs: [
                          { value: 'overview', label: 'Overview', content: '' },
                          {
                            value: 'analytics',
                            label: 'Analytics',
                            content: '',
                          },
                          { value: 'settings', label: 'Settings', content: '' },
                        ],
                      },
                      h,
                    ),
                  ],
                ),
              ],
              endContent: [
                button<Msg>(
                  {
                    variant: 'default',
                    size: 'icon-sm',
                    ariaLabel: 'New item',
                    leadingIcon: Icon.icon(
                      'plus',
                      { class: className(styles.iconMd) },
                      h,
                    ),
                    children: [],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          h.div([h.Class(className(styles.bodySm))], []),
        ],
      )
    case 'bulk':
      return h.div(
        [h.Class(className(styles.w640))],
        [
          ...(model.selectedRows.length === 0
            ? []
            : [
                Toolbar.toolbar<Msg>(
                  {
                    label: 'Bulk actions',
                    size: 'sm',
                    variant: 'muted',
                    dividers: ['bottom'],
                    toParentMessage: toToolbarMessage,
                    startContent: [
                      badge<Msg>(
                        {
                          variant: 'secondary',
                          children: [`${model.selectedRows.length} selected`],
                        },
                        h,
                      ),
                      ghostIconButton('trash-2', 'Delete', h),
                      ghostIconButton('archive', 'Archive', h),
                    ],
                    endContent: [
                      button<Msg>(
                        {
                          variant: 'ghost',
                          size: 'sm',
                          onClick: deselectAll,
                          children: ['Deselect all'],
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ]),
          h.div(
            [h.Class(className(styles.tableBottom))],
            [jobsTable(JOBS, model, true, toToggle, h)],
          ),
        ],
      )
    case 'filter': {
      const results = filterRows(model)
      const hasFilters =
        model.search !== '' ||
        model.status !== '' ||
        model.priority !== '' ||
        model.customer !== ''
      return h.div(
        [h.Class(className(styles.card, styles.w760))],
        [
          Toolbar.toolbar<Msg>(
            {
              label: 'Job filters',
              size: 'sm',
              dividers: ['bottom'],
              toParentMessage: toToolbarMessage,
              startContent: [
                input<Msg>(
                  {
                    id: 'filter-search',
                    label: 'Search jobs',
                    placeholder: 'Search',
                    value: model.search,
                    onInput: value => toChangedSearch(value),
                    layoutStyle: styles.searchWidth,
                  },
                  h,
                ),
                ...FILTER_FIELDS.map(field =>
                  nativeSelect<Msg>(
                    {
                      id: `filter-${field.key}`,
                      label: field.label,
                      value: model[field.key],
                      onChange: value => toChangedClause(field.key, value),
                      size: 'sm',
                      options: [
                        { value: '', label: field.label },
                        ...field.options.map(option => ({
                          value: option,
                          label: option,
                        })),
                      ],
                    },
                    h,
                  ),
                ),
                h.span(
                  [h.Class(className(styles.readout))],
                  [`${results.length} of ${JOBS.length}`],
                ),
                ...(hasFilters
                  ? [
                      button<Msg>(
                        {
                          variant: 'link',
                          size: 'sm',
                          onClick: clearFilters,
                          children: ['Clear all'],
                        },
                        h,
                      ),
                    ]
                  : []),
              ],
              endContent: [ghostIconButton('columns-3-cog', 'View options', h)],
            },
            h,
          ),
          results.length === 0
            ? h.div(
                [h.Class(className(styles.emptyState))],
                [
                  h.p(
                    [h.Class(className(styles.emptyTitle))],
                    ['No jobs match these filters'],
                  ),
                  button<Msg>(
                    {
                      variant: 'secondary',
                      size: 'sm',
                      onClick: clearFilters,
                      children: ['Clear all'],
                    },
                    h,
                  ),
                ],
              )
            : jobsTable(results, model, false, toToggle, h),
        ],
      )
    }
  }
}

export const toolbarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const preview = model as PreviewShape
  const fixture = toolbarFixtures[exampleIndex] ?? toolbarFixtures[0]
  const send = (tag: string, fields: Record<string, unknown> = {}): Msg =>
    onMessageJson(JSON.stringify({ _tag: tag, ...fields }))
  return bodyFor(
    fixture,
    preview,
    message => send('GotToolbarMessage', { message }),
    message => send('GotTabsMessage', { message }),
    (id, isChecked) => send('ToggledJobRow', { id, isChecked }),
    send('ClickedDeselectAll'),
    value => send('ChangedSearch', { value }),
    (field, value) => send('ChangedClause', { field, value }),
    send('ClickedClearFilters'),
    h,
  )
}

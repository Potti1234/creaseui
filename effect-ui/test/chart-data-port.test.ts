import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { TestHost } from '@effect/ui/testing'
import { Effect, Schema } from 'effect'

import { AreaChart, EChart } from '../src/ui/chart'
import { DataGrid } from '../src/ui/data-grid'
import { DataTable } from '../src/ui/data-table'
import {
  DataTableAction,
  initDataTable,
  projectDataTable,
  updateDataTable,
} from '../src/behaviors/data-table'
import { parseGridClipboard } from '../src/behaviors/data-grid'

test('table projection applies options, numeric and date filters while server mode keeps its supplied page', () => {
  const rows = [
    { id: '1', name: 'A1', status: 'Open', amount: 10, date: '2027-02-01' },
    { id: '2', name: 'A2', status: 'Closed', amount: 20, date: '2027-02-03' },
    { id: '3', name: 'A10', status: 'Open', amount: 30, date: '2027-02-10' },
  ]
  const config = {
    rowKey: (row: (typeof rows)[number]) => row.id,
    columns: [
      {
        key: 'name',
        header: 'Name',
        sortValue: (row: (typeof rows)[number]) => row.name,
      },
      {
        key: 'status',
        header: 'Status',
        get: (row: (typeof rows)[number]) => row.status,
      },
      {
        key: 'amount',
        header: 'Amount',
        getNumber: (row: (typeof rows)[number]) => row.amount,
      },
      {
        key: 'date',
        header: 'Date',
        getDate: (row: (typeof rows)[number]) => Date.parse(row.date),
      },
    ],
  }
  const state = [
    DataTableAction.FilterOptionToggled({ column: 'status', value: 'Open' }),
    DataTableAction.RangeChanged({
      column: 'amount',
      endpoint: 'min',
      value: 20,
    }),
    DataTableAction.DateChanged({
      column: 'date',
      endpoint: 'to',
      value: '2027-02-10',
    }),
  ].reduce(updateDataTable, initDataTable(2, [{ id: 'name', desc: false }]))
  assert.deepEqual(
    projectDataTable({ rows, config, state }).rows.map(row => row.id),
    ['3'],
  )
  const server = projectDataTable({
    rows: [rows[1]!],
    config,
    state: { ...state, page: 4 },
    mode: 'server',
    rowCount: 20,
  })
  assert.deepEqual(
    server.rows.map(row => row.id),
    ['2'],
  )
  assert.equal(server.page, 4)
  assert.equal(server.pageCount, 10)
})

const names = [
  { id: '3', name: 'Charlie' },
  { id: '1', name: 'Ada' },
  { id: '2', name: 'Ben' },
]
const TableFixture = Html.component({
  name: 'CreaseDataTablePortFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    DataTable(h, {
      ariaLabel: 'People',
      rows: names,
      rowKey: row => row.id,
      columns: [
        {
          key: 'name',
          header: 'Name',
          get: row => row.name,
          sortValue: row => row.name,
          cell: row => row.name,
        },
      ],
      props: { defaultState: initDataTable(2) },
      filterText: row => row.name,
      enableRowSelection: true,
    }),
})

test('data table sorts, selects visible rows, and paginates using its local model', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const play = yield* HtmlPlay.make(TableFixture, {})
        yield* play.click(HtmlLocator.role('button', { name: 'Sort by Name' }))
        yield* play
          .expect(HtmlLocator.role('cell', { name: 'Ben' }))
          .toHaveCount(1)
        yield* play
          .expect(HtmlLocator.role('cell', { name: 'Charlie' }))
          .toHaveCount(0)
        yield* play.click(
          HtmlLocator.role('checkbox', { name: 'Select all rows' }),
        )
        yield* play
          .expect(HtmlLocator.role('status'))
          .toHaveText('2 of 3 rows selected.')
        yield* play.click(HtmlLocator.role('button', { name: 'Next' }))
        yield* play
          .expect(HtmlLocator.role('cell', { name: 'Charlie' }))
          .toHaveCount(1)
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))

const GridFixture = Html.component({
  name: 'CreaseDataGridPortFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    DataGrid(h, {
      height: 120,
      rows: Array.from({ length: 100 }, (_, index) => ({
        id: String(index),
        name: `Person ${index}`,
      })),
      rowKey: row => row.id,
      columns: [
        {
          id: 'name',
          header: 'Name',
          variant: 'text',
          width: 144,
          get: row => row.name,
        },
      ],
    }),
})

test('data grid renders a bounded virtual table with full row counts', async () => {
  const { html } = await Effect.runPromise(
    HtmlServer.renderToHtml(GridFixture, {}),
  )
  assert.match(html, /role="grid"/)
  assert.match(html, /aria-rowcount="101"/)
  assert.match(html, /aria-rowindex="2"/)
  assert.match(html, /Person 0/)
  assert.doesNotMatch(html, /Person 99/)
  assert.deepEqual(
    parseGridClipboard('"one\tinside"\tvalue\r\n"with\nnewline"\t""'),
    [
      ['one\tinside', 'value'],
      ['with\nnewline', ''],
    ],
  )
})

const ChartFixture = Html.component({
  name: 'CreaseChartPortFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.div(
      AreaChart(h, {
        id: 'visitors',
        ariaLabel: 'Visitors',
        data: [10, 40, 20],
      }),
      AreaChart(h, { id: 'sales', ariaLabel: 'Sales', data: [12, 4, 18] }),
      EChart(h, {
        hostId: 'unused-loading-canvas',
        ariaLabel: 'Monthly visits',
        state: 'loading',
        accessibleAlternative: h.p.children('January 10, February 40.'),
        toMessage: () => {
          throw new Error('A loading state must not start a canvas mount')
        },
      }),
    ),
})

test('chart server output scopes SVG gradients and retains the canvas alternative', async () => {
  const { html } = await Effect.runPromise(
    HtmlServer.renderToHtml(ChartFixture, {}),
  )
  const ids = [...html.matchAll(/<linearGradient[^>]*\bid="([^"]+)"/g)].map(
    match => match[1],
  )
  assert.equal(ids.length, 2)
  assert.equal(new Set(ids).size, 2)
  assert.match(html, /aria-label="Visitors"/)
  assert.match(html, /aria-label="Sales"/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /January 10, February 40\./)
})

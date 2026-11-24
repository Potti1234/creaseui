import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as CellRange from '@/lib/behaviors/cell-range'
import * as Grid from '@/lib/data-grid'

type Row = { id: string; name: string; done: boolean }

const config: Grid.DataGridConfig<Row> = {
  columns: [
    {
      id: 'name',
      header: 'Name',
      iconName: 'user',
      width: 200,
      variant: 'text',
      get: row => row.name,
      set: (row, name) => ({ ...row, name }),
    },
    {
      id: 'done',
      header: 'Done',
      iconName: 'check',
      width: 80,
      variant: 'checkbox',
      get: row => String(row.done),
      getBoolean: row => row.done,
      set: (row, value) => ({ ...row, done: value === 'true' }),
    },
  ],
  rowKey: row => row.id,
  createRow: id => ({ id, name: 'New', done: false }),
}

const rows: ReadonlyArray<Row> = [
  { id: 'z', name: 'Zeta', done: false },
  { id: 'a', name: 'Alpha', done: false },
  { id: 'm', name: 'Mu', done: false },
]

const step = (model: Grid.Model, ...messages: ReadonlyArray<Grid.Message>) =>
  messages.reduce(
    (current, message) => Grid.update(current, message, config),
    model,
  )

const sortedByName = () =>
  step(
    Grid.init(config, rows),
    Grid.Message.SetSorting({ column: 'name', desc: false }),
  )

const byId = (model: Grid.Model, id: string) =>
  (model.rows as ReadonlyArray<Row>).find(row => row.id === id)

const displayedIds = (model: Grid.Model) =>
  Grid.displayedRows<Row>(model, config).map(row => row.id)

describe('data grid clipboard', () => {
  it('round-trips tabs, newlines, and quotes and accepts CRLF', () => {
    const values = [
      ['A\tB', 'a "quote"'],
      ['line 1\nline 2', ''],
    ]
    assert.deepEqual(
      CellRange.textToCells(CellRange.cellsToText(values)),
      values,
    )
    assert.deepEqual(CellRange.textToCells('a\tb\r\nc\td\r\n'), [
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('copies a visible range and pastes into the original sorted rows in a single undo step', () => {
    const selected = step(
      sortedByName(),
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      Grid.Message.SelectedRange({ row: 1, column: 'done', extend: true }),
    )
    assert.equal(
      Grid.clipboardText(selected, config),
      'Alpha\tfalse\nMu\tfalse',
    )
    const pasted = step(
      selected,
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      Grid.Message.PastedCells({ text: 'ZZZ\ttrue\nAAA\ttrue' }),
    )
    assert.deepEqual(byId(pasted, 'a'), { id: 'a', name: 'ZZZ', done: true })
    assert.deepEqual(byId(pasted, 'm'), { id: 'm', name: 'AAA', done: true })
    assert.deepEqual(step(pasted, Grid.Message.Undo({})).rows, selected.rows)
  })
})

describe('data grid keyboard navigation', () => {
  it('extends a rectangular selection across rows and columns with Shift', () => {
    const key = (key: string, shift = false) =>
      Grid.Message.GridKey({ key, shift, ctrl: false, meta: false })
    const focused = step(
      Grid.init(config, rows),
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
    )
    const extended = step(
      focused,
      key('ArrowRight', true),
      key('ArrowDown', true),
    )
    const selected = Grid.cellSelection(extended, ['name', 'done'])
    assert.equal(
      Grid.selection(extended, ['name', 'done']).text,
      '4 cells selected across 2 rows and 2 columns.',
    )
    assert.equal(Grid.selection(focused, ['name', 'done']).text, '')
    assert.equal(selected(0, 'name'), true)
    assert.equal(selected(1, 'done'), true)
    assert.equal(selected(2, 'done'), false)
    assert.equal(selected(0, 'hidden'), false)
    const collapsed = Grid.cellSelection(step(extended, key('ArrowDown')), [
      'name',
      'done',
    ])
    assert.equal(collapsed(0, 'name'), false)
    assert.equal(collapsed(2, 'done'), true)
  })

  it('uses the shared body height minus its sticky header for page movement', () => {
    const manyRows = Array.from({ length: 100 }, (_, index) => ({
      id: String(index),
      name: String(index),
      done: false,
    }))
    const model = step(
      Grid.init(config, manyRows),
      Grid.Message.SetViewportHeight({ height: 900 }),
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
    )
    assert.equal(Grid.viewportHeightPx(model), 750)
    const expected = Math.floor(
      (750 - Grid.headerHeightPx) / Grid.rowHeightPx(model.rowHeight),
    )
    assert.equal(Grid.pageSize(model), expected)
    assert.equal(
      step(
        model,
        Grid.Message.GridKey({
          key: 'PageDown',
          ctrl: false,
          meta: false,
          shift: false,
        }),
      ).focusedCell.row,
      expected,
    )
    assert.equal(Grid.viewportHeightPx({ ...model, viewportHeight: 200 }), 400)
  })
  it('enters a fresh grid at the first visible cell for arrows and Tab', () => {
    for (const key of [
      'ArrowDown',
      'ArrowUp',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ]) {
      const model = step(
        Grid.init(config, rows),
        Grid.Message.GridKey({ key, shift: false, ctrl: false, meta: false }),
      )
      assert.deepEqual(model.focusedCell, { row: 0, column: 'name' })
    }
    const empty = Grid.init(config, [])
    assert.deepEqual(
      step(
        empty,
        Grid.Message.GridKey({
          key: 'ArrowDown',
          shift: false,
          ctrl: false,
          meta: false,
        }),
      ).focusedCell,
      empty.focusedCell,
    )
  })
  it('follows RTL for arrows but keeps Tab and commit-right logical', () => {
    let model = step(
      Grid.init(config, rows),
      Grid.Message.SetDirection({ direction: 'rtl' }),
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
    )
    const press = (key: string, shift = false) => {
      model = step(
        model,
        Grid.Message.GridKey({ key, shift, ctrl: false, meta: false }),
      )
      return model.focusedCell
    }
    assert.deepEqual(press('ArrowLeft'), { row: 0, column: 'done' })
    assert.deepEqual(press('ArrowRight'), { row: 0, column: 'name' })
    assert.deepEqual(press('Tab'), { row: 0, column: 'done' })
    assert.deepEqual(press('Tab', true), { row: 0, column: 'name' })
    model = step(
      model,
      Grid.Message.StartedEditing({ row: 0, column: 'name', seed: '' }),
      Grid.Message.CommittedDraft({ move: 'right' }),
    )
    assert.deepEqual(model.focusedCell, { row: 0, column: 'done' })
  })
  it('renders offscreen focus before revealing without expanding the virtual window', () => {
    const model = {
      ...Grid.init(config, rows),
      focusedCell: { row: 99, column: 'name' },
    }
    assert.deepEqual(Grid.renderedRowIndexes(model, 100, 0, 3), [0, 1, 2, 99])
    assert.deepEqual(Grid.renderedRowIndexes(model, 3, 0, 3), [0, 1, 2])
    assert.deepEqual(Grid.renderedRowIndexes(model, 0, 0, 0), [])
    assert.deepEqual(
      Grid.renderedRowIndexes(
        { ...model, focusedCell: { row: 1, column: 'name' } },
        100,
        0,
        3,
      ),
      [0, 1, 2],
    )
  })
  it('preserves arrows and Tab and adds row, grid and page jumps', () => {
    let model = step(
      Grid.init(config, rows),
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
    )
    const press = (key: string, ctrl = false, meta = false) => {
      model = step(
        model,
        Grid.Message.GridKey({ key, ctrl, meta, shift: false }),
      )
      return model.focusedCell
    }
    assert.deepEqual(press('ArrowRight'), { row: 0, column: 'done' })
    assert.deepEqual(press('ArrowRight'), { row: 0, column: 'done' })
    assert.deepEqual(press('ArrowDown'), { row: 1, column: 'done' })
    assert.deepEqual(press('Home'), { row: 1, column: 'name' })
    assert.deepEqual(press('End'), { row: 1, column: 'done' })
    assert.deepEqual(press('Home', true), { row: 0, column: 'name' })
    assert.deepEqual(press('End', false, true), { row: 2, column: 'done' })
    assert.deepEqual(press('PageUp'), { row: 0, column: 'done' })
    assert.deepEqual(press('PageDown'), { row: 2, column: 'done' })
    assert.deepEqual(press('ArrowLeft'), { row: 2, column: 'name' })
    assert.deepEqual(press('Tab'), { row: 2, column: 'done' })
  })
})

describe('data grid row identity', () => {
  it('decodes grid history with optional grouping state', () => {
    const model = Grid.init(config, rows)
    assert.deepEqual(Schema.decodeUnknownSync(Grid.Model)(model), model)
    assert.equal(Option.isNone(model.history.open), true)
    const grouped = {
      ...model,
      history: {
        ...model.history,
        open: Option.some({ group: 'typing', time: 1 }),
      },
    }
    assert.deepEqual(Schema.decodeUnknownSync(Grid.Model)(grouped), grouped)
  })
  it('honors the configured undo history limit', () => {
    const limited = { ...config, history: { limit: 1 } }
    const edit = (model: Grid.Model, value: string) =>
      Grid.update(
        model,
        Grid.Message.SetCellValue({ row: 0, column: 'name', value }),
        limited,
      )
    const edited = edit(edit(Grid.init(limited, rows), 'First'), 'Second')
    const undone = Grid.update(edited, Grid.Message.Undo(), limited)
    assert.equal(byId(undone, 'z')?.name, 'First')
    assert.equal(undone.history.past.length, 0)
    const redone = Grid.update(undone, Grid.Message.Redo(), limited)
    assert.equal(byId(redone, 'z')?.name, 'Second')
  })
  it('edits the displayed row when the grid is sorted', () => {
    const sorted = sortedByName()
    assert.deepEqual(displayedIds(sorted), ['a', 'm', 'z'])
    const edited = step(
      sorted,
      Grid.Message.SetCellValue({ row: 0, column: 'name', value: 'Edited' }),
    )
    assert.equal(byId(edited, 'a')?.name, 'Edited')
    assert.equal(byId(edited, 'z')?.name, 'Zeta')
  })

  it('commits a typed draft to the displayed row', () => {
    const edited = step(
      sortedByName(),
      Grid.Message.StartedEditing({ row: 0, column: 'name', seed: 'Q' }),
      Grid.Message.ChangedDraft({ value: 'Quinn' }),
      Grid.Message.CommittedDraft({ move: 'none' }),
    )
    assert.equal(byId(edited, 'a')?.name, 'Quinn')
    assert.equal(byId(edited, 'z')?.name, 'Zeta')
  })

  it('toggles the displayed boolean cell when sorted', () => {
    const toggled = step(
      sortedByName(),
      Grid.Message.ToggledCellBoolean({ row: 0, column: 'done' }),
    )
    assert.equal(byId(toggled, 'a')?.done, true)
    assert.equal(byId(toggled, 'z')?.done, false)
  })

  it('deletes the displayed rows when sorted', () => {
    const deleted = step(
      sortedByName(),
      Grid.Message.DeletedRows({ indexes: [0] }),
    )
    assert.deepEqual(
      (deleted.rows as ReadonlyArray<Row>).map(row => row.id),
      ['z', 'm'],
    )
    const fromMenu = step(
      sortedByName(),
      Grid.Message.OpenedContextMenu({ x: 0, y: 0, row: 2, column: 'name' }),
      Grid.Message.AppliedContextAction({ action: 'delete-row' }),
    )
    assert.equal(byId(fromMenu, 'z'), undefined)
    assert.notEqual(byId(fromMenu, 'a'), undefined)
  })

  it('targets the displayed row when filtered and sorted', () => {
    const model = step(
      Grid.init(config, rows),
      Grid.Message.AddedFilter({ column: 'name', value: 'a' }),
      Grid.Message.SetSorting({ column: 'name', desc: true }),
    )
    assert.deepEqual(displayedIds(model), ['z', 'a'])
    const edited = step(
      model,
      Grid.Message.SetCellValue({ row: 1, column: 'name', value: 'Edited' }),
    )
    assert.equal(byId(edited, 'a')?.name, 'Edited')
    assert.equal(byId(edited, 'z')?.name, 'Zeta')
  })

  it('keeps selection, focus and an open editor on the same records when sorting changes', () => {
    const before = step(
      Grid.init(config, rows),
      Grid.Message.SelectedRowIndex({
        index: 0,
        shiftKey: false,
        additive: false,
      }),
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      Grid.Message.StartedEditing({ row: 0, column: 'name', seed: 'Z' }),
      Grid.Message.ChangedDraft({ value: 'Zed' }),
    )
    const sorted = step(
      before,
      Grid.Message.SetSorting({ column: 'name', desc: false }),
    )
    assert.deepEqual(sorted.selectedRowIndexes, [2])
    assert.deepEqual(sorted.focusedCell, { row: 2, column: 'name' })
    assert.deepEqual(Grid.editingCell(sorted), { row: 2, column: 'name' })
    const committed = step(
      sorted,
      Grid.Message.CommittedDraft({ move: 'none' }),
    )
    assert.equal(byId(committed, 'z')?.name, 'Zed')
    assert.equal(byId(committed, 'a')?.name, 'Alpha')
  })

  it('drops selection and closes the editor for rows a filter hides', () => {
    const filtered = step(
      sortedByName(),
      Grid.Message.SelectedRowIndex({
        index: 1,
        shiftKey: false,
        additive: false,
      }),
      Grid.Message.StartedEditing({ row: 1, column: 'name', seed: 'M' }),
      Grid.Message.AddedFilter({ column: 'name', value: 'eta' }),
    )
    assert.deepEqual(displayedIds(filtered), ['z'])
    assert.deepEqual(filtered.selectedRowIndexes, [])
    assert.equal(Grid.editingCell(filtered).row, -1)
    assert.equal(filtered.inlineEdit.draft, '')
  })
})

const press = (value: string) =>
  Grid.Message.GridKey({ key: value, ctrl: false, meta: false, shift: false })

const selectedIds = (model: Grid.Model) =>
  model.selectedRowIndexes.map(index => displayedIds(model)[index])

/* Review F2: data changes that reorder or hide rows keep interaction state
   on the same records. */
describe('data grid identity through data changes', () => {
  const selectFirstTwo = (model: Grid.Model) =>
    step(
      model,
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      Grid.Message.SelectedRowIndex({
        index: 0,
        shiftKey: false,
        additive: false,
      }),
      Grid.Message.SelectedRowIndex({
        index: 1,
        shiftKey: false,
        additive: true,
      }),
    )

  it('editing a sort key keeps the selection, and Delete removes the selected records', () => {
    const selected = selectFirstTwo(sortedByName())
    assert.deepEqual(selectedIds(selected), ['a', 'm'])
    const edited = step(
      selected,
      press('Enter'),
      Grid.Message.ChangedDraft({ value: 'ZZZ Alpha' }),
      press('Enter'),
    )
    assert.deepEqual(displayedIds(edited), ['m', 'z', 'a'])
    assert.deepEqual([...selectedIds(edited)].sort(), ['a', 'm'])
    assert.equal(byId(edited, 'a')?.name, 'ZZZ Alpha')
    /* Enter moved down from Alpha to the record shown below it (Mu). */
    assert.equal(displayedIds(edited)[edited.focusedCell.row], 'm')
    const deleted = step(edited, press('Delete'))
    assert.deepEqual(
      (deleted.rows as ReadonlyArray<Row>).map(row => row.id),
      ['z'],
    )
  })

  it('editing a filter key drops only the record the filter now hides', () => {
    const filtered = step(
      sortedByName(),
      Grid.Message.AddedFilter({ column: 'name', value: 'a' }),
    )
    assert.deepEqual(displayedIds(filtered), ['a', 'z'])
    const selected = step(
      filtered,
      Grid.Message.SelectedRowIndex({
        index: 1,
        shiftKey: false,
        additive: false,
      }),
      Grid.Message.StartedEditing({ row: 0, column: 'name', seed: '' }),
      Grid.Message.ChangedDraft({ value: 'Bob' }),
      Grid.Message.CommittedDraft({ move: 'none' }),
    )
    assert.deepEqual(displayedIds(selected), ['z'])
    assert.deepEqual(selectedIds(selected), ['z'])
    assert.equal(Grid.editingCell(selected).row, -1)
  })

  it('undo and redo keep the selection on the same records', () => {
    const selected = step(
      sortedByName(),
      Grid.Message.SelectedRowIndex({
        index: 2,
        shiftKey: false,
        additive: false,
      }),
      Grid.Message.FocusedCell({ row: 2, column: 'name' }),
      Grid.Message.StartedEditing({ row: 0, column: 'name', seed: '' }),
      Grid.Message.ChangedDraft({ value: 'ZZZ Alpha' }),
      Grid.Message.CommittedDraft({ move: 'none' }),
    )
    assert.deepEqual(displayedIds(selected), ['m', 'z', 'a'])
    assert.deepEqual(selectedIds(selected), ['z'])
    const undone = step(selected, Grid.Message.Undo())
    assert.deepEqual(displayedIds(undone), ['a', 'm', 'z'])
    assert.deepEqual(selectedIds(undone), ['z'])
    assert.equal(displayedIds(undone)[undone.focusedCell.row], 'z')
    const redone = step(undone, Grid.Message.Redo())
    assert.deepEqual(selectedIds(redone), ['z'])
    assert.equal(displayedIds(redone)[redone.focusedCell.row], 'z')
  })

  it('inserting and deleting rows keeps focus on the same record', () => {
    const focused = step(
      sortedByName(),
      Grid.Message.FocusedCell({ row: 2, column: 'name' }),
    )
    const removed = step(focused, Grid.Message.DeletedRows({ indexes: [0] }))
    assert.deepEqual(displayedIds(removed), ['m', 'z'])
    assert.equal(displayedIds(removed)[removed.focusedCell.row], 'z')
  })
})

type Contact = {
  id: string
  name: string
  age: number
  site: string
  notes: string
}

const textColumn = (
  id: 'name' | 'site' | 'notes',
  variant: Grid.CellVariant,
): Grid.DataGridColumn<Contact> => ({
  id,
  header: id,
  iconName: 'user',
  width: 160,
  variant,
  get: row => row[id],
  set: (row, value) => ({ ...row, [id]: value }),
})

const contactConfig: Grid.DataGridConfig<Contact> = {
  columns: [
    textColumn('name', 'text'),
    {
      id: 'age',
      header: 'Age',
      iconName: 'hash',
      width: 80,
      variant: 'number',
      get: row => String(row.age),
      set: (row, value) => ({ ...row, age: Number(value) }),
    },
    textColumn('site', 'url'),
    textColumn('notes', 'long-text'),
  ],
  rowKey: row => row.id,
  createRow: id => ({ id, name: '', age: 0, site: '', notes: '' }),
}

const contacts: ReadonlyArray<Contact> = [
  {
    id: 'ada',
    name: 'Ada',
    age: 36,
    site: 'https://ada.dev',
    notes: 'Line one\nLine two',
  },
  { id: 'bob', name: 'Bob', age: 41, site: 'https://bob.dev', notes: 'Hi' },
]

const key = (value: string): Grid.Message =>
  Grid.Message.GridKey({ key: value, ctrl: false, shift: false, meta: false })

const run = (...messages: ReadonlyArray<Grid.Message>) =>
  messages.reduce(
    (current, message) => Grid.update(current, message, contactConfig),
    Grid.init(contactConfig, contacts),
  )

const contact = (model: Grid.Model, id: string) =>
  (model.rows as ReadonlyArray<Contact>).find(row => row.id === id)

describe('data grid editor seed', () => {
  for (const [column, expected] of [
    ['name', 'Ada'],
    ['age', '36'],
    ['site', 'https://ada.dev'],
    ['notes', 'Line one\nLine two'],
  ] as const) {
    it(`Enter, F2 and double-click open the ${column} editor on its value`, () => {
      for (const open of [
        [Grid.Message.FocusedCell({ row: 0, column }), key('Enter')],
        [Grid.Message.FocusedCell({ row: 0, column }), key('F2')],
        [Grid.Message.StartedEditing({ row: 0, column, seed: '' })],
      ]) {
        const editing = run(...open)
        assert.deepEqual(Grid.editingCell(editing), { row: 0, column })
        assert.equal(editing.inlineEdit.draft, expected)
        const committed = Grid.update(
          editing,
          Grid.Message.CommittedDraft({ move: 'none' }),
          contactConfig,
        )
        assert.deepEqual(contact(committed, 'ada'), contacts[0])
      }
    })
  }

  it('Enter then Enter commits the value unchanged and moves down', () => {
    const model = run(
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      key('Enter'),
      key('Enter'),
    )
    assert.equal(contact(model, 'ada')?.name, 'Ada')
    assert.equal(Grid.editingCell(model).row, -1)
    assert.deepEqual(model.focusedCell, { row: 1, column: 'name' })
    assert.equal(model.history.past.length, 0)
  })

  it('Escape leaves the value untouched', () => {
    const model = run(
      Grid.Message.FocusedCell({ row: 1, column: 'age' }),
      key('F2'),
      Grid.Message.ChangedDraft({ value: '99' }),
      key('Escape'),
    )
    assert.equal(contact(model, 'bob')?.age, 41)
    assert.equal(Grid.editingCell(model).row, -1)
    assert.equal(model.inlineEdit.draft, '')
  })

  it('an unchanged commit preserves redo history and does not call the setter', () => {
    const undone = run(
      Grid.Message.SetCellValue({ row: 0, column: 'name', value: 'Changed' }),
      Grid.Message.Undo({}),
      Grid.Message.StartedEditing({ row: 0, column: 'name', seed: '' }),
    )
    const guardedConfig: Grid.DataGridConfig<Contact> = {
      ...contactConfig,
      columns: contactConfig.columns.map(column => ({
        ...column,
        set: () => {
          throw new Error('unchanged commit must not write')
        },
      })),
    }
    const committed = Grid.update(
      undone,
      Grid.Message.CommittedDraft({ move: 'none' }),
      guardedConfig,
    )
    assert.equal(committed.rows, undone.rows)
    assert.equal(committed.history.past, undone.history.past)
    assert.equal(committed.history.future, undone.history.future)
    assert.equal(committed.history.future.length, 1)
  })

  it('typing over a cell starts from the typed key', () => {
    const typed = run(
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      key('Z'),
    )
    assert.equal(typed.inlineEdit.draft, 'Z')
    const committed = Grid.update(
      typed,
      Grid.Message.CommittedDraft({ move: 'none' }),
      contactConfig,
    )
    assert.equal(contact(committed, 'ada')?.name, 'Z')
  })

  it('keyboard movement after an unchanged edit keeps every value', () => {
    const model = run(
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      key('Enter'),
      key('Tab'),
      key('Enter'),
      key('Tab'),
      key('ArrowDown'),
      key('F2'),
      key('Enter'),
    )
    assert.deepEqual(model.rows, contacts)
  })
})

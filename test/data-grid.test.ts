import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

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

describe('data grid row identity', () => {
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
    assert.deepEqual(sorted.editingCell, { row: 2, column: 'name' })
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
    assert.equal(filtered.editingCell.row, -1)
    assert.equal(filtered.draftValue, '')
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
        assert.deepEqual(editing.editingCell, { row: 0, column })
        assert.equal(editing.draftValue, expected)
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
    assert.equal(model.editingCell.row, -1)
    assert.deepEqual(model.focusedCell, { row: 1, column: 'name' })
    assert.equal(model.pastStates.length, 0)
  })

  it('Escape leaves the value untouched', () => {
    const model = run(
      Grid.Message.FocusedCell({ row: 1, column: 'age' }),
      key('F2'),
      Grid.Message.ChangedDraft({ value: '99' }),
      key('Escape'),
    )
    assert.equal(contact(model, 'bob')?.age, 41)
    assert.equal(model.editingCell.row, -1)
    assert.equal(model.draftValue, '')
  })

  it('typing over a cell starts from the typed key', () => {
    const typed = run(
      Grid.Message.FocusedCell({ row: 0, column: 'name' }),
      key('Z'),
    )
    assert.equal(typed.draftValue, 'Z')
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

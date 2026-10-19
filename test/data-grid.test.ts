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

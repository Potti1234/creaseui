import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import * as Grid from '../src/lib/behaviors/grid-focus.ts'

const move = (input: Partial<Grid.NavigationInput> = {}) =>
  Grid.navigate({
    rows: 4,
    columns: 3,
    currentCell: { row: 1, column: 1 },
    pressedKey: 'ArrowRight',
    ...input,
  })
describe('GridFocus', () => {
  it('moves without wrapping, skips disabled cells and reverses RTL arrows', () => {
    assert.deepEqual(move(), Option.some({ row: 1, column: 2 }))
    assert.deepEqual(
      move({ direction: 'rtl' }),
      Option.some({ row: 1, column: 0 }),
    )
    assert.deepEqual(
      move({ currentCell: { row: 0, column: 2 } }),
      Option.none(),
    )
    assert.deepEqual(
      move({ pressedKey: 'ArrowDown', isDisabled: cell => cell.row === 2 }),
      Option.some({ row: 3, column: 1 }),
    )
    assert.deepEqual(
      move({ pressedKey: 'ArrowUp' }),
      Option.some({ row: 0, column: 1 }),
    )
    assert.deepEqual(
      move({ pressedKey: 'ArrowLeft' }),
      Option.some({ row: 1, column: 0 }),
    )
  })
  it('finds enabled row ends, grid corners and clamped pages', () => {
    assert.deepEqual(
      move({ pressedKey: 'Home' }),
      Option.some({ row: 1, column: 0 }),
    )
    assert.deepEqual(
      move({ pressedKey: 'End' }),
      Option.some({ row: 1, column: 2 }),
    )
    assert.deepEqual(
      move({
        pressedKey: 'Home',
        ctrl: true,
        isDisabled: cell => cell.row === 0,
      }),
      Option.some({ row: 1, column: 0 }),
    )
    assert.deepEqual(
      move({ pressedKey: 'End', ctrl: true }),
      Option.some({ row: 3, column: 2 }),
    )
    assert.deepEqual(
      move({ pressedKey: 'PageDown', pageSize: 20 }),
      Option.some({ row: 3, column: 1 }),
    )
    assert.deepEqual(
      move({ pressedKey: 'PageUp', pageSize: 20 }),
      Option.some({ row: 0, column: 1 }),
    )
    assert.deepEqual(
      move({
        pressedKey: 'PageDown',
        pageSize: 1,
        isDisabled: cell => cell.row === 2,
      }),
      Option.some({ row: 3, column: 1 }),
    )
  })
  it('handles empty, disabled and unknown navigation', () => {
    assert.deepEqual(move({ rows: 0 }), Option.none())
    assert.deepEqual(move({ columns: 0 }), Option.none())
    assert.deepEqual(move({ isDisabled: () => true }), Option.none())
    assert.deepEqual(move({ pressedKey: 'Tab' }), Option.none())
  })
  it('retains enabled active tab stops and falls back in row order', () => {
    const input = { rows: 2, columns: 2 }
    const model = Grid.init({ id: 'grid' })
    const cell = { row: 1, column: 1 }
    const result = Grid.update(model, Grid.Message.MovedFocus({ cell }))
    assert.deepEqual(
      Grid.tabStop(model, input),
      Option.some({ row: 0, column: 0 }),
    )
    assert.deepEqual(Grid.tabStop(result.model, input), Option.some(cell))
    assert.deepEqual(
      Grid.tabStop(result.model, { ...input, isDisabled: c => c.row === 1 }),
      Option.some({ row: 0, column: 0 }),
    )
    assert.deepEqual(
      Grid.tabStop(model, { ...input, isDisabled: () => true }),
      Option.none(),
    )
    assert.deepEqual(
      Grid.tabStop(model, { rows: 0, columns: 0 }),
      Option.none(),
    )
    assert.equal(Grid.isActive(result.model, cell), true)
    assert.deepEqual(result.commands?.[0]?.args, { id: 'grid', cell })
    assert.equal(result.commands?.[0]?.name, Grid.FocusCell.name)
    assert.deepEqual(
      Grid.update(model, Grid.Message.FocusedCell({ cell })).commands ?? [],
      [],
    )
    assert.deepEqual(Grid.update(model, Grid.Message.CompletedFocusCell()), {
      model,
    })
  })
})

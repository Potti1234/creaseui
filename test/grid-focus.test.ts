import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'
import { Window } from 'happy-dom'
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
  it('reveals a newly mounted active descendant before publishing it', async () => {
    const window = new Window()
    try {
      const root = window.document.createElement('div')
      root.setAttribute('role', 'grid')
      window.document.body.append(root)
      const revealed: HTMLElement[] = []
      const stop = Grid.observeActiveDescendant(
        // Happy DOM supplies a separate declaration of the browser element.
        // eslint-disable-next-line no-restricted-syntax
        root as unknown as HTMLElement,
        cell => {
          assert.equal(root.hasAttribute('aria-activedescendant'), false)
          revealed.push(cell)
        },
      )
      const cell = window.document.createElement('div')
      cell.setAttribute('role', 'gridcell')
      cell.dataset.focused = 'true'
      assert.equal(root.hasAttribute('aria-activedescendant'), false)
      root.append(cell)
      await window.happyDOM.waitUntilComplete()
      assert.deepEqual(revealed, [cell])
      assert.ok(cell.id)
      assert.equal(root.getAttribute('aria-activedescendant'), cell.id)
      cell.remove()
      await window.happyDOM.waitUntilComplete()
      assert.equal(root.hasAttribute('aria-activedescendant'), false)
      stop()
      root.append(cell)
      await window.happyDOM.waitUntilComplete()
      assert.equal(revealed.length, 1)
    } finally {
      await window.happyDOM.close()
    }
  })
  it('can reach disabled cells by arrow while keeping an enabled tab stop', () => {
    const cell = { row: 1, column: 2 }
    const isDisabled = (target: Grid.GridCell) => target.column === 2
    assert.deepEqual(move({ isDisabled }), Option.none())
    assert.deepEqual(
      move({ isDisabled, focusDisabledWithArrows: true }),
      Option.some(cell),
    )
    const model = Grid.focus(Grid.init({ id: 'grid' }), cell).model
    assert.deepEqual(
      Grid.tabStop(model, { rows: 4, columns: 3, isDisabled }),
      Option.some({ row: 0, column: 0 }),
    )
  })

  it('waits for the latest reveal before moving focus', () => {
    const model = Grid.init({ id: 'grid' })
    const options = { requiresReveal: () => true }
    const first = Grid.focus(model, { row: 10, column: 0 }, options)
    const cell = { row: 11, column: 0 }
    const second = Grid.update(
      first.model,
      Grid.Message.MovedFocus({ cell }),
      options,
    )
    assert.equal(first.commands, undefined)
    assert.deepEqual(second.model.maybeActiveCell, Option.none())
    assert.deepEqual(
      second.outMessage,
      Grid.OutMessage.RequestedReveal({ cell, version: 2 }),
    )
    const ready = Grid.Message.RevealedCell({ version: 2 })
    assert.equal(
      Grid.update(second.model, Grid.Message.RevealedCell({ version: 1 }))
        .commands,
      undefined,
    )
    const completed = Grid.update(second.model, ready)
    assert.deepEqual(completed.commands?.[0]?.args, { id: 'grid', cell })
    assert.equal(Grid.isActive(completed.model, cell), true)
    assert.equal(Grid.update(completed.model, ready).commands, undefined)
    const canceled = Grid.update(
      second.model,
      Grid.Message.CanceledReveal({ version: 2 }),
    )
    assert.equal(Grid.update(canceled.model, ready).commands, undefined)
    const focused = Grid.update(
      second.model,
      Grid.Message.FocusedCell({ cell: { row: 0, column: 0 } }),
    )
    assert.equal(Grid.update(focused.model, ready).commands, undefined)
  })
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

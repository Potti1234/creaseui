import assert from 'node:assert/strict'
import test from 'node:test'
import { Option } from 'effect'

import {
  resolveColumnTrack,
  moveItem,
  init,
  update,
  Message,
  OutMessage,
} from '../src/lib/list-input.ts'

test('column tracks resolve to pixel or proportional grid tracks', () => {
  assert.equal(resolveColumnTrack({ type: 'pixel', value: 120 }), '120px')
  assert.equal(
    resolveColumnTrack({ type: 'proportional', value: 2 }),
    'minmax(140px, 2fr)',
  )
  assert.equal(resolveColumnTrack(undefined), 'minmax(140px, 1fr)')
})

test('moveItem relocates an entry and tolerates a missing index', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 2), ['b', 'c', 'a'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 2, 0), ['c', 'a', 'b'])
  assert.deepEqual(moveItem(['a'], 0, 0), ['a'])
})

test('add/remove emit announcements and item out messages', () => {
  const model = init({ id: 'li' })
  const added = update(
    model,
    Message.AddRequested({
      createItem: () => ({ id: 'g-9', name: '', email: '' }),
      itemName: 'guest',
      position: 3,
    }),
  )
  assert.equal(added.outMessage?._tag, 'ItemAdded')
  assert.equal(
    Option.getOrElse(added.model.announcement, () => ''),
    'Added guest 3.',
  )

  const removed = update(
    model,
    Message.RemoveRequested({ index: 0, itemName: 'guest', position: 1 }),
  )
  assert.equal(removed.outMessage?._tag, 'ItemRemoved')
  assert.equal(
    Option.getOrElse(removed.model.announcement, () => ''),
    'Removed guest 1.',
  )
})

test('immediate move announces the destination; boundary announces in place', () => {
  const model = init({ id: 'li' })
  const moved = update(
    model,
    Message.MoveRequested({
      fromIndex: 0,
      toIndex: 1,
      itemName: 'guest',
      total: 3,
    }),
  )
  assert.equal(moved.outMessage?._tag, 'ItemReordered')
  assert.equal(
    Option.getOrElse(moved.model.announcement, () => ''),
    'guest moved to position 2 of 3.',
  )

  const boundary = update(
    model,
    Message.AlreadyAtBoundary({ itemName: 'guest', boundary: 'first' }),
  )
  assert.equal(boundary.outMessage, undefined)
  assert.equal(
    Option.getOrElse(boundary.model.announcement, () => ''),
    'This guest is already first.',
  )
})

test('grab lifecycle: preview moves, commit reorders, cancel restores', () => {
  const model = init({ id: 'li' })
  const grabbed = update(
    model,
    Message.GrabStarted({
      index: 0,
      key: 'g-1',
      itemName: 'guest',
      position: 1,
    }),
  )
  assert.equal(Option.isSome(grabbed.model.reorder), true)
  assert.equal(
    Option.getOrElse(grabbed.model.announcement, () => ''),
    'guest 1 grabbed. Use arrow keys to move, Space or Enter to drop, and Escape to cancel.',
  )

  const previewed = update(
    grabbed.model,
    Message.GrabPreviewed({ toIndex: 2, itemName: 'guest', total: 3 }),
  )
  assert.equal(
    Option.match(previewed.model.reorder, {
      onNone: () => -1,
      onSome: r => r.previewIndex,
    }),
    2,
  )

  const committed = update(
    previewed.model,
    Message.GrabCommitted({ itemName: 'guest', total: 3 }),
  )
  assert.equal(Option.isNone(committed.model.reorder), true)
  assert.equal(committed.outMessage?._tag, 'ItemReordered')
  assert.equal(
    Option.getOrElse(committed.model.announcement, () => ''),
    'guest dropped at position 3 of 3.',
  )

  const cancelled = update(grabbed.model, Message.GrabCancelled())
  assert.equal(Option.isNone(cancelled.model.reorder), true)
  assert.equal(
    Option.getOrElse(cancelled.model.announcement, () => ''),
    'Reordering cancelled.',
  )
})

test('committing a grab with no move returns the row without an out message', () => {
  const model = init({ id: 'li' })
  const grabbed = update(
    model,
    Message.GrabStarted({
      index: 1,
      key: 'g-2',
      itemName: 'guest',
      position: 2,
    }),
  )
  const committed = update(
    grabbed.model,
    Message.GrabCommitted({ itemName: 'guest', total: 3 }),
  )
  assert.equal(committed.outMessage, undefined)
  assert.equal(
    Option.getOrElse(committed.model.announcement, () => ''),
    'guest returned to position 2.',
  )
})

test('field edits lift into ItemUpdated out messages', () => {
  const model = init({ id: 'li' })
  const edited = update(
    model,
    Message.FieldEdited({
      index: 0,
      nextItem: { name: 'x' },
      columnKey: 'name',
    }),
  )
  assert.equal(edited.outMessage?._tag, 'ItemUpdated')
})

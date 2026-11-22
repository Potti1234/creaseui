import assert from 'node:assert/strict'
import test from 'node:test'
import { Option } from 'effect'
import * as Reorder from '../src/lib/behaviors/reorder.ts'
import * as Announce from '../src/lib/behaviors/announce.ts'

import {
  resolveColumnTrack,
  moveItem,
  init,
  update,
  Message,
  OutMessage,
} from '../src/lib/list-input.ts'

const keys = ['g-1', 'g-2', 'g-3']
const reorder = (message: Reorder.Message) =>
  Message.ReorderRequested({ message, keys, itemName: 'guest' })

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
      item: { id: 'g-9', name: '', email: '' },
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
  const grabbed = update(model, reorder(Reorder.Message.Grab({ key: 'g-1' })))
  assert.equal(Option.isSome(grabbed.model.reorder.maybeDraft), true)
  assert.equal(
    Option.getOrElse(grabbed.model.announcement, () => ''),
    'guest 1 grabbed. Use arrow keys to move, Space or Enter to drop, and Escape to cancel.',
  )

  const previewed = update(
    grabbed.model,
    reorder(Reorder.Message.MoveTo({ index: 2 })),
  )
  assert.equal(
    Option.match(previewed.model.reorder.maybeDraft, {
      onNone: () => -1,
      onSome: r => r.order.indexOf(r.key),
    }),
    2,
  )

  const committed = update(previewed.model, reorder(Reorder.Message.Drop({})))
  assert.equal(Option.isNone(committed.model.reorder.maybeDraft), true)
  assert.equal(committed.outMessage?._tag, 'ItemReordered')
  assert.equal(
    Option.getOrElse(committed.model.announcement, () => ''),
    'guest dropped at position 3 of 3.',
  )

  const cancelled = update(
    grabbed.model,
    reorder(Reorder.Message.Cancel({ restoreFocus: true })),
  )
  assert.equal(Option.isNone(cancelled.model.reorder.maybeDraft), true)
  assert.equal(
    Option.getOrElse(cancelled.model.announcement, () => ''),
    'Reordering cancelled.',
  )
})

test('committing a grab with no move returns the row without an out message', () => {
  const model = init({ id: 'li' })
  const grabbed = update(model, reorder(Reorder.Message.Grab({ key: 'g-2' })))
  const committed = update(grabbed.model, reorder(Reorder.Message.Drop({})))
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

test('announcements use assertive Announce timing and reject stale completions', () => {
  const model = init({ id: 'li' })
  const grabbed = update(model, reorder(Reorder.Message.Grab({ key: 'g-1' })))
  assert.equal(grabbed.model.announcer.priority, 'assertive')
  assert.equal(grabbed.model.announcer.text, '')
  assert.equal(
    grabbed.model.announcer.pendingText,
    Option.getOrThrow(grabbed.model.announcement),
  )
  const moved = update(
    grabbed.model,
    reorder(Reorder.Message.Step({ delta: 1 })),
  )
  const stale = update(
    moved.model,
    Message.GotAnnouncementMessage({
      message: Announce.Message.CompletedDelay({
        version: grabbed.model.announcer.version,
      }),
    }),
  )
  assert.equal(stale.model.announcer.text, '')
  const completed = update(
    stale.model,
    Message.GotAnnouncementMessage({
      message: Announce.Message.CompletedDelay({
        version: moved.model.announcer.version,
      }),
    }),
  )
  assert.equal(
    completed.model.announcer.text,
    'guest moved to position 2 of 3.',
  )
  const idle = update(model, reorder(Reorder.Message.Swallow({})))
  assert.equal(idle.model.announcer, model.announcer)
  assert.deepEqual(idle.commands, [])
})

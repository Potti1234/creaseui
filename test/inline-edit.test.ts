import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import * as InlineEdit from '../src/lib/behaviors/inline-edit.ts'

const options = { value: () => 'Original' }
const start = (maybeText: Option.Option<string> = Option.none(), id = 'cell') =>
  InlineEdit.Message.RequestedStart({
    id,
    reason: Option.isSome(maybeText) ? 'type' : 'edit-key',
    maybeText,
  })
const end = InlineEdit.Message.RequestedEnd({ reason: 'enter-key' })

describe('InlineEdit lifecycle', () => {
  it('starts idle and ignores end, cancel and draft changes without an editor', () => {
    const model = InlineEdit.init()
    assert.equal(Option.isNone(InlineEdit.editingId(model)), true)
    for (const message of [
      end,
      InlineEdit.Message.RequestedCancel({}),
      InlineEdit.Message.ChangedDraft({ value: 'x' }),
    ]) {
      assert.deepEqual(InlineEdit.update(model, message, options), { model })
    }
  })

  it('seeds the current value and ignores disabled and duplicate starts', () => {
    const initial = InlineEdit.init()
    assert.deepEqual(
      InlineEdit.update(initial, start(), { ...options, disabled: () => true }),
      { model: initial },
    )
    const result = InlineEdit.update(initial, start(), options)
    assert.equal(InlineEdit.isEditing(result.model, 'cell'), true)
    assert.equal(result.model.draft, 'Original')
    assert.equal(result.model.isTyped, false)
    assert.deepEqual(
      result.outMessage,
      InlineEdit.OutMessage.Started({ id: 'cell', reason: 'edit-key' }),
    )
    assert.deepEqual(
      InlineEdit.update(result.model, start(Option.some('x')), options),
      { model: result.model },
    )
    assert.equal(
      InlineEdit.isEditing(
        InlineEdit.update(result.model, start(Option.none(), 'other'), options)
          .model,
        'other',
      ),
      true,
    )
  })

  it('seeds typed text including empty text and commits a changed draft', () => {
    for (const text of ['x', '']) {
      const started = InlineEdit.update(
        InlineEdit.init(),
        start(Option.some(text)),
        options,
      ).model
      assert.equal(started.draft, text)
      assert.equal(started.isTyped, true)
    }
    const started = InlineEdit.update(InlineEdit.init(), start(), options).model
    const changed = InlineEdit.update(
      started,
      InlineEdit.Message.ChangedDraft({ value: 'Changed' }),
      options,
    ).model
    const result = InlineEdit.update(changed, end, options)
    assert.deepEqual(result.model, InlineEdit.init())
    assert.deepEqual(
      result.outMessage,
      InlineEdit.OutMessage.Committed({
        id: 'cell',
        text: 'Changed',
        reason: 'enter-key',
      }),
    )
  })

  it('ends unchanged without validation, rejects invalid changes and cancels without saving', () => {
    const invalid = { ...options, isValid: () => false }
    const started = InlineEdit.update(InlineEdit.init(), start(), options).model
    assert.deepEqual(
      InlineEdit.update(started, end, invalid).outMessage,
      InlineEdit.OutMessage.Ended({ id: 'cell', reason: 'enter-key' }),
    )
    const typed = InlineEdit.update(
      InlineEdit.init(),
      start(Option.some('bad')),
      options,
    ).model
    const rejected = InlineEdit.update(typed, end, invalid)
    assert.equal(rejected.model, typed)
    assert.deepEqual(
      rejected.outMessage,
      InlineEdit.OutMessage.RejectedCommit({
        id: 'cell',
        text: 'bad',
        reason: 'enter-key',
      }),
    )
    const canceled = InlineEdit.update(
      typed,
      InlineEdit.Message.RequestedCancel({}),
      options,
    )
    assert.deepEqual(canceled.model, InlineEdit.init())
    assert.deepEqual(
      canceled.outMessage,
      InlineEdit.OutMessage.Ended({ id: 'cell', reason: 'escape-key' }),
    )
  })
})

describe('InlineEdit keyboard intent', () => {
  it('starts with edit keys or printable non-space text, without modifiers', () => {
    const key = (key: string, modifiers = {}) =>
      InlineEdit.startKey({
        key,
        ctrl: false,
        meta: false,
        alt: false,
        ...modifiers,
      })
    for (const value of ['Enter', 'F2'])
      assert.deepEqual(
        key(value),
        Option.some({ reason: 'edit-key', maybeText: Option.none() }),
      )
    assert.deepEqual(
      key('a'),
      Option.some({ reason: 'type', maybeText: Option.some('a') }),
    )
    for (const value of ['', ' ', 'ArrowDown'])
      assert.equal(Option.isNone(key(value)), true)
    for (const modifier of ['ctrl', 'meta', 'alt'])
      assert.equal(Option.isNone(key('a', { [modifier]: true })), true)
  })

  it('ends on Enter or Tab, cancels on Escape, and leaves composition and multiline Shift+Enter alone', () => {
    const key = (key: string, flags = {}) =>
      InlineEdit.inputKey({
        key,
        shift: false,
        isMultiline: false,
        isComposing: false,
        ...flags,
      })
    assert.deepEqual(key('Enter'), Option.some(end))
    assert.deepEqual(
      key('Tab'),
      Option.some(InlineEdit.Message.RequestedEnd({ reason: 'tab-key' })),
    )
    assert.deepEqual(
      key('Escape'),
      Option.some(InlineEdit.Message.RequestedCancel({})),
    )
    assert.equal(
      Option.isNone(key('Enter', { shift: true, isMultiline: true })),
      true,
    )
    assert.deepEqual(key('Enter', { shift: true }), Option.some(end))
    assert.equal(Option.isNone(key('x')), true)
    for (const value of ['Enter', 'Tab', 'Escape'])
      assert.equal(Option.isNone(key(value, { isComposing: true })), true)
  })
})

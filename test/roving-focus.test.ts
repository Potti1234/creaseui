import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'

import * as RovingFocus from '../src/lib/behaviors/roving-focus.ts'
import * as ToggleGroup from '../src/lib/toggle-group.ts'

const keys = ['one', 'two', 'three']
const move = (input: Partial<RovingFocus.NavigationInput<string>> = {}) =>
  RovingFocus.navigate({
    keys,
    currentKey: 'two',
    pressedKey: 'ArrowRight',
    ...input,
  })

describe('RovingFocus navigation', () => {
  it('skips nonfocusable items even when disabled arrow focus is enabled', () => {
    assert.deepEqual(
      move({
        isFocusable: (_key, index) => index !== 2,
        focusDisabledWithArrows: true,
      }),
      Option.some('one'),
    )
  })

  it('prefers enabled tab stops and opts into a focusable disabled fallback', () => {
    const model = RovingFocus.focus(
      RovingFocus.init({ id: 'group' }),
      'two',
    ).model
    const inputs = {
      keys,
      preferredKey: 'three',
      isDisabled: (key: string) => key === 'two',
    }
    assert.equal(
      RovingFocus.tabStop(model, { ...inputs, focusDisabledWithArrows: true }),
      'three',
    )
    const allDisabled = {
      ...inputs,
      isDisabled: () => true,
      isFocusable: (key: string) => key !== 'two',
    }
    assert.equal(RovingFocus.tabStop(model, allDisabled), undefined)
    assert.equal(
      RovingFocus.tabStop(model, {
        ...allDisabled,
        focusDisabledWithArrows: true,
      }),
      'three',
    )
    const clear = RovingFocus.update(
      model,
      RovingFocus.Message.BlurredItem({ key: 'two' }),
    )
    assert.equal(
      RovingFocus.tabStop(clear.model, { keys, preferredKey: 'three' }),
      'three',
    )
    assert.equal(
      RovingFocus.update(model, RovingFocus.Message.BlurredItem({ key: 'one' }))
        .model,
      model,
    )
  })
  it('opts disabled items into arrows while Home and End still prefer enabled items', () => {
    const isDisabled = (key: string) => key === 'three'
    const focusDisabledWithArrows = true
    assert.deepEqual(move({ isDisabled }), Option.some('one'))
    assert.deepEqual(
      move({ isDisabled, focusDisabledWithArrows }),
      Option.some('three'),
    )
    assert.deepEqual(
      move({ isDisabled, focusDisabledWithArrows, currentKey: 'three' }),
      Option.some('one'),
    )
    assert.deepEqual(
      move({ isDisabled, focusDisabledWithArrows, pressedKey: 'End' }),
      Option.some('two'),
    )
  })
  it('returns None for a key that has no navigation intent', () => {
    assert.deepEqual(
      RovingFocus.navigationIntent({ pressedKey: 'Enter' }),
      Option.none(),
    )
    assert.deepEqual(
      RovingFocus.navigationIntent({
        pressedKey: 'ArrowLeft',
        direction: 'rtl',
      }),
      Option.some('Next'),
    )
  })

  it('exposes orientation and direction as literal schemas', () => {
    for (const orientation of ['Horizontal', 'Vertical', 'Both'])
      assert.equal(Schema.is(RovingFocus.Orientation)(orientation), true)
    for (const direction of ['ltr', 'rtl'])
      assert.equal(Schema.is(RovingFocus.Direction)(direction), true)
    assert.equal(Schema.is(RovingFocus.Orientation)('Diagonal'), false)
    assert.equal(Schema.is(RovingFocus.Direction)('up'), false)
  })

  it('handles each axis only in its orientation', () => {
    assert.deepEqual(move(), Option.some('three'))
    assert.deepEqual(move({ pressedKey: 'ArrowLeft' }), Option.some('one'))
    assert.deepEqual(move({ pressedKey: 'ArrowDown' }), Option.none())
    assert.deepEqual(move({ pressedKey: 'ArrowUp' }), Option.none())
    assert.deepEqual(
      move({ orientation: 'Vertical', pressedKey: 'ArrowDown' }),
      Option.some('three'),
    )
    assert.deepEqual(
      move({ orientation: 'Vertical', pressedKey: 'ArrowUp' }),
      Option.some('one'),
    )
    assert.deepEqual(move({ orientation: 'Vertical' }), Option.none())
    assert.deepEqual(
      move({ orientation: 'Vertical', pressedKey: 'ArrowLeft' }),
      Option.none(),
    )
    for (const pressedKey of ['ArrowRight', 'ArrowDown']) {
      assert.deepEqual(
        move({ orientation: 'Both', pressedKey }),
        Option.some('three'),
      )
    }
    for (const pressedKey of ['ArrowLeft', 'ArrowUp']) {
      assert.deepEqual(
        move({ orientation: 'Both', pressedKey }),
        Option.some('one'),
      )
    }
  })

  it('reverses horizontal arrows in rtl but not vertical arrows', () => {
    assert.deepEqual(move({ direction: 'rtl' }), Option.some('one'))
    assert.deepEqual(
      move({ direction: 'rtl', pressedKey: 'ArrowLeft' }),
      Option.some('three'),
    )
    assert.deepEqual(
      move({ direction: 'rtl', orientation: 'Both', pressedKey: 'ArrowDown' }),
      Option.some('three'),
    )
  })

  it('loops by default and returns None at a non-looping boundary', () => {
    assert.deepEqual(move({ currentKey: 'three' }), Option.some('one'))
    assert.deepEqual(
      move({ currentKey: 'one', pressedKey: 'ArrowLeft' }),
      Option.some('three'),
    )
    assert.deepEqual(move({ currentKey: 'three', loop: false }), Option.none())
    assert.deepEqual(
      move({ currentKey: 'one', pressedKey: 'ArrowLeft', loop: false }),
      Option.none(),
    )
    assert.deepEqual(move({ loop: false }), Option.some('three'))
  })

  it('skips disabled items in both directions and at Home/End', () => {
    const isDisabled = (key: string) => key === 'two'
    assert.deepEqual(
      move({ currentKey: 'one', isDisabled }),
      Option.some('three'),
    )
    assert.deepEqual(
      move({ currentKey: 'three', pressedKey: 'ArrowLeft', isDisabled }),
      Option.some('one'),
    )
    assert.deepEqual(
      move({ pressedKey: 'Home', isDisabled: key => key === 'one' }),
      Option.some('two'),
    )
    assert.deepEqual(
      move({ pressedKey: 'End', isDisabled: key => key === 'three' }),
      Option.some('two'),
    )
    assert.deepEqual(move({ pressedKey: 'Home' }), Option.some('one'))
    assert.deepEqual(move({ pressedKey: 'End' }), Option.some('three'))
  })

  it('handles empty, all-disabled, removed, and single-item collections', () => {
    for (const pressedKey of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
      assert.deepEqual(move({ keys: [], pressedKey }), Option.none())
      assert.deepEqual(
        move({ isDisabled: () => true, pressedKey }),
        Option.none(),
      )
    }
    assert.deepEqual(move({ currentKey: 'removed' }), Option.some('one'))
    assert.deepEqual(
      move({ currentKey: 'removed', pressedKey: 'ArrowLeft' }),
      Option.some('three'),
    )
    assert.deepEqual(move({ keys: ['two'] }), Option.some('two'))
    assert.deepEqual(move({ keys: ['two'], loop: false }), Option.none())
  })

  it('leaves unhandled keys to the browser', () => {
    for (const pressedKey of ['Tab', 'Enter', ' ', 'Escape', 'PageDown', 'x']) {
      assert.deepEqual(move({ pressedKey }), Option.none())
    }
  })
})

describe('RovingFocus update', () => {
  it('records keyboard navigation and describes one focus Command', () => {
    const result = RovingFocus.update(
      RovingFocus.init({ id: 'group' }),
      RovingFocus.Message.MovedFocus({ key: 'two' }),
    )
    assert.deepEqual(result.model.maybeFocusedKey, Option.some('two'))
    assert.equal(result.commands?.length, 1)
    assert.equal(result.commands?.[0]?.name, RovingFocus.FocusItem.name)
    assert.deepEqual(result.commands?.[0]?.args, { id: 'group', key: 'two' })
  })

  it('records natural focus without a Command and ignores completion', () => {
    const result = RovingFocus.update(
      RovingFocus.init({ id: 'group' }),
      RovingFocus.Message.FocusedItem({ key: 'two' }),
    )
    assert.deepEqual(result.model.maybeFocusedKey, Option.some('two'))
    assert.deepEqual(result.commands ?? [], [])
    assert.deepEqual(
      RovingFocus.update(
        result.model,
        RovingFocus.Message.CompletedFocusItem(),
      ),
      { model: result.model },
    )
  })

  it('generates readable stable ids for arbitrary keys and group ids', () => {
    const keys = ['a b', 'a-b', 'a_b', '"', '日本語', '😀', '']
    const ids = keys.map(key => RovingFocus.itemId('1 group"', key))
    assert.equal(new Set(ids).size, ids.length)
    assert.deepEqual(
      ids,
      keys.map(key => `1 group"-item-${key}`),
    )
    assert.equal(
      RovingFocus.itemId('group', 'two'),
      RovingFocus.itemId('group', 'two'),
    )
    assert.notEqual(
      RovingFocus.itemId('other', 'two'),
      RovingFocus.itemId('group', 'two'),
    )
  })
})

describe('ToggleGroup composition', () => {
  it('records and focuses the clicked key while emitting selection', () => {
    const model = ToggleGroup.init({ id: 'group' })
    const result = ToggleGroup.create<'one' | 'two'>().update(
      model,
      ToggleGroup.Message.PressedItem({ value: 'two', index: 1 }),
    )
    assert.deepEqual(result.outMessage, {
      _tag: 'Selected',
      value: 'two',
      index: 1,
    })
    assert.deepEqual(
      result.model.rovingFocus.maybeFocusedKey,
      Option.some('two'),
    )
    assert.equal(result.commands?.length, 1)
    assert.equal(result.commands?.[0]?.name, RovingFocus.FocusItem.name)
    assert.deepEqual(result.commands?.[0]?.args, { id: 'group', key: 'two' })
    assert.equal(Schema.is(ToggleGroup.OutMessage)(result.outMessage), true)
    assert.deepEqual(
      ToggleGroup.OutMessage.Selected({ value: 'two', index: 1 }),
      result.outMessage,
    )
  })

  it('lifts focus state and Command completion through the child Message', () => {
    const result = ToggleGroup.update(
      ToggleGroup.init({ id: 'missing' }),
      ToggleGroup.Message.GotRovingFocusMessage({
        message: RovingFocus.Message.MovedFocus({ key: 'one' }),
      }),
    )
    assert.deepEqual(
      result.model.rovingFocus.maybeFocusedKey,
      Option.some('one'),
    )
    assert.equal(result.commands?.length, 1)
    const command = result.commands?.[0]
    assert.ok(command)
    assert.equal(command.name, RovingFocus.FocusItem.name)
    const completed = ToggleGroup.update(
      result.model,
      ToggleGroup.Message.GotRovingFocusMessage({
        message: RovingFocus.Message.CompletedFocusItem(),
      }),
    )
    assert.deepEqual(completed.model, result.model)
    assert.deepEqual(completed.commands ?? [], [])
  })
})

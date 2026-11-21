import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Option, Schema } from 'effect'

import * as FocusRecovery from '../src/lib/behaviors/focus-recovery.ts'

const recovery = FocusRecovery.create<'a' | 'b' | 'c' | 'd'>()
const previousKeys = ['a', 'b', 'c', 'd'] as const

describe('FocusRecovery', () => {
  it('retains pending collection ownership across removals before focus commits', () => {
    const config = { itemId: (key: string) => key, fallbackId: 'viewport' }
    const update = (
      model: FocusRecovery.CollectionModel,
      message: FocusRecovery.CollectionMessage,
    ) => FocusRecovery.updateCollection(model, message, config)
    const reconciled = (keys: readonly string[]) =>
      FocusRecovery.CollectionMessage.ReconciledItems({
        keys,
        enabledKeys: keys,
      })
    let model = update(
      FocusRecovery.initCollection(),
      reconciled(['a', 'b', 'c']),
    ).model
    model = update(
      model,
      FocusRecovery.CollectionMessage.FocusedItem({ key: 'b' }),
    ).model
    const first = update(model, reconciled(['a', 'c']))
    assert.deepEqual(first.commands?.[0]?.args, { lostId: 'b', targetId: 'c' })
    const second = update(first.model, reconciled(['a']))
    assert.deepEqual(second.commands?.[0]?.args, { lostId: 'c', targetId: 'a' })
    model = update(
      second.model,
      FocusRecovery.CollectionMessage.CompletedRecoverFocus(),
    ).model
    const empty = update(model, reconciled([]))
    assert.deepEqual(empty.commands?.[0]?.args, {
      lostId: 'a',
      targetId: 'viewport',
    })
    assert.deepEqual(update(empty.model, reconciled([])).commands, [])
    const blurred = update(
      first.model,
      FocusRecovery.CollectionMessage.BlurredItems(),
    )
    assert.deepEqual(update(blurred.model, reconciled([])).commands, [])
    const refocused = update(
      first.model,
      FocusRecovery.CollectionMessage.FocusedItem({ key: 'a' }),
    )
    assert.deepEqual(update(refocused.model, reconciled(['a'])).commands, [])
  })

  it('chooses the next surviving key, then the previous without wrapping', () => {
    const model = recovery.focused(recovery.init(), 'b')
    assert.equal(Schema.is(FocusRecovery.Model)(model), true)
    for (const [nextKeys, key] of [
      [['a', 'c', 'd'], 'c'],
      [['a', 'd'], 'd'],
      [['a'], 'a'],
    ] as const) {
      assert.deepEqual(
        recovery.recover(model, { previousKeys, nextKeys }).maybeRecovery,
        Option.some({ lostKey: 'b', target: { type: 'Item', key } }),
      )
    }
    assert.deepEqual(
      recovery.recover(recovery.focused(model, 'd'), {
        previousKeys,
        nextKeys: ['a', 'b', 'c'],
      }).maybeRecovery,
      Option.some({ lostKey: 'd', target: { type: 'Item', key: 'c' } }),
    )
  })

  it('skips disabled keys and requests fallback for empty or all-disabled survivors', () => {
    const model = recovery.focused(recovery.init(), 'b')
    assert.deepEqual(
      recovery.recover(model, {
        previousKeys,
        nextKeys: ['a', 'c', 'd'],
        isDisabled: key => key === 'c',
      }).maybeRecovery,
      Option.some({ lostKey: 'b', target: { type: 'Item', key: 'd' } }),
    )
    for (const nextKeys of [[], ['a', 'c']] as const) {
      assert.deepEqual(
        recovery.recover(model, {
          previousKeys,
          nextKeys,
          isDisabled: () => true,
        }).maybeRecovery,
        Option.some({ lostKey: 'b', target: { type: 'Fallback' } }),
      )
    }
  })

  it('ignores unfocused, unknown, and surviving keys', () => {
    for (const model of [
      recovery.init(),
      recovery.blurred(recovery.focused(recovery.init(), 'b')),
      recovery.focused(recovery.init(), 'd'),
    ]) {
      const result = recovery.recover(model, {
        previousKeys: ['a', 'b'],
        nextKeys: [],
      })
      assert.equal(result.model, model)
      assert.deepEqual(result.maybeRecovery, Option.none())
    }
    assert.deepEqual(
      recovery.recover(recovery.focused(recovery.init(), 'b'), {
        previousKeys,
        nextKeys: ['b'],
      }).maybeRecovery,
      Option.none(),
    )
  })

  it('increments the version once per recovery request and clears ownership', () => {
    const initial = recovery.focused(recovery.init(), 'b')
    const result = recovery.recover(initial, { previousKeys, nextKeys: [] })
    assert.equal(result.model.version, 1)
    assert.equal(initial.version, 0)
    assert.deepEqual(result.model.maybeFocusedKey, Option.none())
    assert.equal(
      recovery.recover(result.model, { previousKeys, nextKeys: [] }).model
        .version,
      1,
    )
    assert.equal(
      recovery.recover(recovery.focused(result.model, 'a'), {
        previousKeys,
        nextKeys: [],
      }).model.version,
      2,
    )
  })

  it('describes guarded focus with serializable element IDs', () => {
    const command = FocusRecovery.RecoverFocus({
      targetId: 'next',
      lostId: 'lost',
    })
    assert.equal(command.name, FocusRecovery.RecoverFocus.name)
    assert.deepEqual(command.args, { targetId: 'next', lostId: 'lost' })
  })

  it('waits for commit, guards unrelated focus, and ignores a missing target', async () => {
    const names = [
      'document',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ] as const
    const descriptors = names.map(name =>
      Object.getOwnPropertyDescriptor(globalThis, name),
    )
    const body = { isConnected: true }
    const inside = { isConnected: true }
    const other = { isConnected: true }
    const detached = { isConnected: false }
    let active: object | null = body
    let available = true
    let calls = 0
    let frames = 0
    const target = {
      focus: (options: FocusOptions) => {
        assert.deepEqual(options, { preventScroll: true })
        calls++
      },
    }
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        body,
        get activeElement() {
          return active
        },
        getElementById: (id: string) =>
          id === 'lost'
            ? { contains: (element: object) => element === inside }
            : available
              ? target
              : null,
      },
    })
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        frames++
        return setTimeout(() => callback(0), 0)
      },
    })
    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      value: clearTimeout,
    })
    try {
      for (const [element, expected] of [
        [body, 1],
        [null, 2],
        [detached, 3],
        [inside, 4],
        [other, 4],
      ] as const) {
        active = element
        await Effect.runPromise(
          FocusRecovery.RecoverFocus({ targetId: 'next', lostId: 'lost' })
            .effect,
        )
        assert.equal(calls, expected)
      }
      available = false
      active = body
      await Effect.runPromise(
        FocusRecovery.RecoverFocus({ targetId: 'missing', lostId: 'lost' })
          .effect,
      )
      assert.equal(calls, 4)
      assert.equal(frames, 6)
    } finally {
      names.forEach((name, index) => {
        const descriptor = descriptors[index]
        if (descriptor) Object.defineProperty(globalThis, name, descriptor)
        else Reflect.deleteProperty(globalThis, name)
      })
    }
  })
})

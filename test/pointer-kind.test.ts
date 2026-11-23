import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Effect, Stream } from 'effect'

import * as PointerKind from '../src/lib/behaviors/pointer-kind.ts'

describe('PointerKind', () => {
  it('defaults to unknown and seeds only the supplied fields', () => {
    assert.deepEqual(PointerKind.init(), {
      pointer: 'unknown',
      hover: 'unknown',
      anyPointer: 'unknown',
      anyHover: 'unknown',
    })
    assert.deepEqual(PointerKind.init({ pointer: 'coarse' }), {
      ...PointerKind.init(),
      pointer: 'coarse',
    })
    assert.equal(PointerKind.canHover(PointerKind.init()), false)
    assert.equal(
      PointerKind.canHover(PointerKind.init({ hover: 'hover' })),
      true,
    )
  })

  it('keeps model identity for equal state and replaces changed state', () => {
    const model = PointerKind.init()
    assert.equal(
      PointerKind.update(
        model,
        PointerKind.Message.ChangedPointerKind({ state: { ...model } }),
      ).model,
      model,
    )
    const state = PointerKind.init({ anyPointer: 'fine', anyHover: 'hover' })
    assert.deepEqual(
      PointerKind.update(
        model,
        PointerKind.Message.ChangedPointerKind({ state }),
      ),
      { model: state },
    )
  })

  it('accepts only the trimmed mobile client hints', () => {
    assert.deepEqual(PointerKind.pointerKindOf(' ?1 '), {
      pointer: 'coarse',
      hover: 'none',
    })
    assert.deepEqual(PointerKind.pointerKindOf('?0'), {
      pointer: 'fine',
      hover: 'hover',
    })
    for (const hint of [undefined, null, '', 'mobile', '?2'])
      assert.deepEqual(PointerKind.pointerKindOf(hint), {})
  })

  it('reads all ten queries with fine/coarse/none and hover/none precedence', () => {
    const seen: string[] = []
    assert.deepEqual(
      PointerKind.read(query => {
        seen.push(query)
        return { matches: false }
      }),
      PointerKind.init(),
    )
    assert.equal(new Set(seen).size, 10)
    for (const precision of ['fine', 'coarse', 'none'] as const) {
      const excluded =
        precision === 'fine'
          ? []
          : precision === 'coarse'
            ? ['fine']
            : ['fine', 'coarse']
      assert.deepEqual(
        PointerKind.read(query => ({
          matches: !excluded.some(value => query.includes(value)),
        })),
        {
          pointer: precision,
          hover: 'hover',
          anyPointer: precision,
          anyHover: 'hover',
        },
      )
    }
    assert.deepEqual(
      PointerKind.read(query => ({ matches: query.endsWith(': none)') })),
      { pointer: 'none', hover: 'none', anyPointer: 'none', anyHover: 'none' },
    )
    assert.deepEqual(
      PointerKind.read(query => ({
        matches:
          query === '(pointer: coarse)' ||
          query === '(hover: none)' ||
          query === '(any-pointer: fine)' ||
          query === '(any-hover: hover)',
      })),
      {
        pointer: 'coarse',
        hover: 'none',
        anyPointer: 'fine',
        anyHover: 'hover',
      },
    )
  })

  it('propagates errors from the supplied pure reader', () => {
    assert.throws(
      () =>
        PointerKind.read(() => {
          throw new Error('unavailable')
        }),
      /unavailable/,
    )
  })

  it('listens to media query changes and releases every listener', async () => {
    const original = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    let added = 0
    let removed = 0
    const lists = new Map<string, EventTarget & { matches: boolean }>()
    let ready: () => void = () => {}
    const listening = new Promise<void>(resolve => {
      ready = resolve
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => {
        const list = Object.assign(new EventTarget(), { matches: false })
        const add = list.addEventListener.bind(list)
        const remove = list.removeEventListener.bind(list)
        list.addEventListener = (...args) => {
          add(...args)
          if (++added === 10) ready()
        }
        list.removeEventListener = (...args) => {
          removed++
          remove(...args)
        }
        lists.set(query, list)
        return list
      },
    })
    try {
      const result = Effect.runPromise(
        PointerKind.changes().pipe(Stream.take(1), Stream.runCollect),
      )
      await listening
      const fine = lists.get('(pointer: fine)')
      assert.ok(fine)
      fine.matches = true
      fine.dispatchEvent(new Event('change'))
      const messages = Array.from(await result)
      assert.deepEqual(messages, [
        PointerKind.Message.ChangedPointerKind({
          state: PointerKind.init({ pointer: 'fine' }),
        }),
      ])
      assert.equal(removed, 10)
    } finally {
      if (original) Object.defineProperty(window, 'matchMedia', original)
      else Reflect.deleteProperty(window, 'matchMedia')
    }
  })

  it('has an empty stream without matchMedia', async () => {
    const messages = await Effect.runPromise(
      PointerKind.changes().pipe(Stream.runCollect),
    )
    assert.deepEqual(Array.from(messages), [])
  })

  it('reads only when the catch-up Command executes and handles unavailable media queries', async () => {
    const original = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    let calls = 0
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => {
        calls++
        return { matches: true }
      },
    })
    try {
      const command = PointerKind.ReadPointerKind({})
      assert.equal(calls, 0)
      assert.deepEqual(
        await Effect.runPromise(command.effect),
        PointerKind.Message.ChangedPointerKind({
          state: {
            pointer: 'fine',
            hover: 'hover',
            anyPointer: 'fine',
            anyHover: 'hover',
          },
        }),
      )
      assert.equal(calls, 10)
      Reflect.deleteProperty(window, 'matchMedia')
      assert.deepEqual(
        await Effect.runPromise(command.effect),
        PointerKind.Message.ChangedPointerKind({ state: PointerKind.init() }),
      )
    } finally {
      if (original) Object.defineProperty(window, 'matchMedia', original)
      else Reflect.deleteProperty(window, 'matchMedia')
    }
  })
})

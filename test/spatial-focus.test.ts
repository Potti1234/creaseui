import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Context, Effect, Option, Schema } from 'effect'
import {
  __htmlBuilder,
  __setRuntime,
  __clearRuntime,
} from '../node_modules/foldkit/dist/html/index.js'

import * as SpatialFocus from '../src/lib/behaviors/spatial-focus.ts'

const rect = (x: number, y: number): SpatialFocus.Rect => ({
  left: x,
  right: x,
  top: y,
  bottom: y,
})
const candidates = [
  { key: 'aside', rect: rect(1, 2) },
  { key: 'ahead', rect: rect(20, 0) },
]
const keys = ['origin', 'aside', 'ahead']
const rects = new Map([
  ['origin', rect(0, 0)],
  ...candidates.map(({ key, rect }) => [key, rect] as const),
])
const target = (input: Partial<SpatialFocus.NavigationInput<string>> = {}) =>
  SpatialFocus.spatialTarget({
    currentKey: 'origin',
    pressedKey: 'ArrowRight',
    keys,
    rects,
    ...input,
  })

describe('SpatialFocus geometry', () => {
  it('exposes a Rect schema and physical arrow directions', () => {
    assert.equal(Schema.is(SpatialFocus.Rect)(rect(1, 2)), true)
    assert.equal(Schema.is(SpatialFocus.Rect)({ left: 0 }), false)
    for (const [key, direction] of [
      ['ArrowLeft', [-1, 0]],
      ['ArrowRight', [1, 0]],
      ['ArrowUp', [0, -1]],
      ['ArrowDown', [0, 1]],
    ] as const)
      assert.deepEqual(SpatialFocus.arrowDirection(key), Option.some(direction))
    assert.deepEqual(SpatialFocus.arrowDirection('Enter'), Option.none())
  })
  it('prefers the 45 degree cone regardless of distance', () => {
    assert.deepEqual(target(), Option.some('ahead'))
    assert.deepEqual(
      SpatialFocus.nearestInDirection(
        rect(0, 0),
        [{ key: 'boundary', rect: rect(2, 2) }, ...candidates],
        [1, 0],
      ),
      Option.some('boundary'),
    )
  })
  it('counts aside distance twice and keeps the first tied candidate', () => {
    assert.deepEqual(
      SpatialFocus.nearestInDirection(
        rect(0, 0),
        [
          { key: 'diagonal', rect: rect(4, 4) },
          { key: 'straight', rect: rect(8, 0) },
          { key: 'tie', rect: rect(8, 0) },
        ],
        [1, 0],
      ),
      Option.some('straight'),
    )
    assert.deepEqual(
      SpatialFocus.nearestInDirection(
        rect(0, 0),
        candidates.slice(0, 1),
        [1, 0],
      ),
      Option.some('aside'),
    )
  })
  it('returns none for empty, behind, missing and unsupported inputs', () => {
    for (const input of [
      { keys: [] },
      { isDisabled: () => true },
      { pressedKey: 'ArrowLeft' },
      { pressedKey: 'Enter' },
      { rects: new Map() },
      { currentKey: 'removed' },
    ])
      assert.deepEqual(target(input), Option.none())
    assert.deepEqual(
      SpatialFocus.nearestInDirection(
        rect(0, 0),
        [{ key: 'level', rect: rect(0, 4) }],
        [1, 0],
      ),
      Option.none(),
    )
  })
  it('uses enabled document order for Home/End without requiring rects', () => {
    assert.deepEqual(
      target({ pressedKey: 'Home', rects: new Map() }),
      Option.some('origin'),
    )
    assert.deepEqual(target({ pressedKey: 'End' }), Option.some('ahead'))
    assert.deepEqual(
      target({ pressedKey: 'Home', isDisabled: (_, index) => index === 0 }),
      Option.some('aside'),
    )
    assert.deepEqual(
      target({ pressedKey: 'End', isDisabled: key => key === 'ahead' }),
      Option.some('aside'),
    )
    assert.deepEqual(
      target({ isDisabled: key => key === 'ahead' }),
      Option.some('aside'),
    )
    assert.deepEqual(target({ keys: ['origin'] }), Option.none())
  })
})

describe('SpatialFocus model and Commands', () => {
  it('defers movement and records only the focused result', () => {
    const model = SpatialFocus.init({ id: 'board' })
    assert.deepEqual(model.maybeFocusedKey, Option.none())
    const result = SpatialFocus.update(
      model,
      SpatialFocus.Message.RequestedMove({
        currentKey: 'origin',
        pressedKey: 'ArrowRight',
        keys,
      }),
    )
    assert.equal(result.model, model)
    assert.equal(result.commands?.[0]?.name, SpatialFocus.MoveFocus.name)
    assert.deepEqual(result.commands?.[0]?.args, {
      id: 'board',
      currentKey: 'origin',
      pressedKey: 'ArrowRight',
      keys,
    })
    const focused = SpatialFocus.update(
      model,
      SpatialFocus.Message.FocusedItem({ key: 'ahead' }),
    )
    assert.deepEqual(focused.model.maybeFocusedKey, Option.some('ahead'))
    assert.deepEqual(focused.commands ?? [], [])
    assert.deepEqual(
      SpatialFocus.update(model, SpatialFocus.Message.CompletedMove()),
      { model },
    )
    assert.deepEqual(
      SpatialFocus.focus(model, 'aside').model.maybeFocusedKey,
      Option.some('aside'),
    )
    assert.equal(
      SpatialFocus.focus(model, 'aside').commands?.[0]?.name,
      SpatialFocus.FocusItem.name,
    )
  })
  it('measures only during execution, focuses, and handles missing/error DOM reads', () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
    const focused: string[] = []
    let reads = 0
    const id = 'board"\\\n'
    try {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
          getElementById: (elementId: string) => {
            const key = keys.find(
              key => SpatialFocus.itemId(id, key) === elementId,
            )
            return key
              ? {
                  getBoundingClientRect: () => {
                    reads++
                    return rects.get(key)
                  },
                  focus: () => focused.push(key),
                }
              : null
          },
        },
      })
      const command = SpatialFocus.MoveFocus({
        id,
        currentKey: 'origin',
        pressedKey: 'ArrowRight',
        keys,
      })
      assert.equal(reads, 0)
      assert.deepEqual(
        Effect.runSync(command.effect),
        SpatialFocus.Message.FocusedItem({ key: 'ahead' }),
      )
      assert.equal(reads, 3)
      assert.deepEqual(focused, ['ahead'])
      assert.deepEqual(
        Effect.runSync(
          SpatialFocus.MoveFocus({
            id,
            currentKey: 'origin',
            pressedKey: 'ArrowLeft',
            keys,
          }).effect,
        ),
        SpatialFocus.Message.CompletedMove(),
      )
      assert.deepEqual(
        Effect.runSync(
          SpatialFocus.MoveFocus({
            id,
            currentKey: 'missing',
            pressedKey: 'ArrowRight',
            keys: [],
          }).effect,
        ),
        SpatialFocus.Message.CompletedMove(),
      )
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
          getElementById: () => {
            throw new Error('unavailable')
          },
        },
      })
      assert.deepEqual(
        Effect.runSync(command.effect),
        SpatialFocus.Message.CompletedMove(),
      )
      assert.deepEqual(
        Effect.runSync(SpatialFocus.FocusItem({ id, key: 'origin' }).effect),
        SpatialFocus.Message.CompletedMove(),
      )
    } finally {
      if (previous) Object.defineProperty(globalThis, 'document', previous)
      else Reflect.deleteProperty(globalThis, 'document')
    }
  })
})

describe('SpatialFocus view', () => {
  it('provides a single enabled tab stop, preferred and focused fallbacks, and modifier-aware keys', () => {
    const messages: SpatialFocus.Message[] = []
    __setRuntime(
      message => messages.push(message as SpatialFocus.Message),
      Context.empty(),
    )
    try {
      const h = __htmlBuilder<SpatialFocus.Message>()
      const render = (
        model: SpatialFocus.Model,
        inputs: Partial<SpatialFocus.ViewInputs> = {},
      ) =>
        SpatialFocus.view(
          model,
          {
            keys,
            ...inputs,
            toView: items =>
              h.div(
                [],
                items.map(item => h.button([...item.attributes], [item.key])),
              ),
          },
          h,
        )
      const model = SpatialFocus.init({ id: 'board' })
      const vnode = render(model, {
        preferredKey: 'ahead',
        isDisabled: key => key === 'aside',
      })
      assert.ok(vnode)
      const children = vnode.children as Exclude<typeof vnode, null>[]
      assert.deepEqual(
        children.map(child => child.data?.props?.tabIndex),
        [-1, -1, 0],
      )
      assert.equal(children[0]?.data?.props?.id, 'board-item-origin')
      const handler = children[0]?.data?.on?.keydown
      assert.equal(typeof handler, 'function')
      let prevented = 0
      const press = (key: string, modifiers = {}) => {
        assert.equal(typeof handler, 'function')
        if (typeof handler === 'function')
          handler({
            key,
            preventDefault: () => prevented++,
            ...modifiers,
          } as KeyboardEvent)
      }
      for (const modifiers of [
        { altKey: true },
        { ctrlKey: true },
        { metaKey: true },
      ])
        press('ArrowRight', modifiers)
      press('Enter')
      assert.equal(prevented, 0)
      press('ArrowRight')
      assert.equal(prevented, 1)
      assert.deepEqual(
        messages.at(-1),
        SpatialFocus.Message.RequestedMove({
          currentKey: 'origin',
          pressedKey: 'ArrowRight',
          keys: ['origin', 'ahead'],
        }),
      )
      const focused = render(SpatialFocus.focus(model, 'origin').model, {
        preferredKey: 'ahead',
      })
      assert.equal(
        (focused?.children?.[0] as typeof vnode)?.data?.props?.tabIndex,
        0,
      )
      const disabled = render(model, { isDisabled: () => true })
      assert.deepEqual(
        (disabled?.children as typeof children).map(
          child => child.data?.props?.tabIndex,
        ),
        [-1, -1, -1],
      )
      assert.deepEqual(render(model, { keys: [] })?.children, [])
    } finally {
      __clearRuntime()
    }
  })
})

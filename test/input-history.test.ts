import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Window } from 'happy-dom'
import { Effect, Fiber, Stream } from 'effect'
import * as Mount from 'foldkit/mount'
import * as History from '../src/lib/behaviors/input-history.ts'

const inputs = { entries: ['oldest', 'newest'] }
const initial = () => History.init({ id: 'chat' })
const step = (
  model: History.Model,
  direction: History.Direction,
  value: string,
  entries = inputs,
) =>
  History.update(
    model,
    History.Message.RequestedNavigation({ direction, value }),
    entries,
  )

describe('InputHistory navigation', () => {
  it('reports directional availability for drafts, bounds, empty lists and stable keys', () => {
    const model = initial()
    assert.equal(History.canNavigate(model, inputs, 'up'), true)
    assert.equal(History.canNavigate(model, inputs, 'down'), false)
    assert.equal(History.canNavigate(model, { entries: [] }, 'up'), false)
    assert.equal(History.canNavigate(model, { entries: [] }, 'down'), false)
    const newest = step(model, 'up', '').model
    assert.equal(History.canNavigate(newest, inputs, 'up'), true)
    assert.equal(History.canNavigate(newest, inputs, 'down'), true)
    const oldest = step(newest, 'up', '').model
    assert.equal(History.canNavigate(oldest, inputs, 'up'), false)
    assert.equal(History.canNavigate(oldest, inputs, 'down'), true)
    const keyed = { entries: ['a', 'b'], getEntryKey: (entry: string) => entry }
    const recalled = step(model, 'up', '', keyed).model
    assert.equal(
      History.canNavigate(
        recalled,
        { ...keyed, entries: ['a', 'b', 'c'] },
        'down',
      ),
      true,
    )
  })

  it('recalls oldest-first entries, preserves edits and restores the draft', () => {
    const newest = step(initial(), 'up', 'draft')
    assert.equal(newest.outMessage?.value, 'newest')
    assert.equal(newest.commands?.length, 1)
    const oldest = step(newest.model, 'up', 'edited newest')
    assert.equal(oldest.outMessage?.value, 'oldest')
    assert.deepEqual(step(oldest.model, 'up', 'edited oldest'), {
      model: oldest.model,
    })
    const forward = step(oldest.model, 'down', 'edited oldest')
    assert.equal(forward.outMessage?.value, 'edited newest')
    const back = step(forward.model, 'up', 'edited again')
    assert.equal(back.outMessage?.value, 'edited oldest')
    const draft = step(
      step(back.model, 'down', 'edited oldest').model,
      'down',
      'edited again',
    )
    assert.equal(draft.outMessage?.value, 'draft')
    assert.equal(
      step(draft.model, 'up', 'new draft').outMessage?.value,
      'edited again',
    )
    assert.deepEqual(step(draft.model, 'down', 'draft'), { model: draft.model })
  })

  it('does nothing for empty history, downward navigation from draft, and acknowledgments', () => {
    const model = initial()
    assert.equal(History.navigate(model, 'up', '', { entries: [] }), undefined)
    assert.deepEqual(step(model, 'up', '', { entries: [] }), { model })
    assert.deepEqual(step(model, 'down', ''), { model })
    assert.deepEqual(
      History.update(model, History.Message.CompletedMoveCaret(), inputs),
      { model },
    )
  })

  it('resets navigation, edits and draft after submission or list replacement', () => {
    const old = step(initial(), 'up', 'draft').model
    const reset = History.update(old, History.Message.Reset(), inputs).model
    assert.deepEqual(reset, initial())
    assert.equal(
      step(reset, 'up', 'new draft', { entries: ['replacement'] }).outMessage
        ?.value,
      'replacement',
    )
  })

  it('uses custom keys across rebuilt/appended lists and handles removed keys', () => {
    const keyed = { entries: ['a', 'b'], getEntryKey: (entry: string) => entry }
    const b = step(initial(), 'up', 'draft', keyed)
    const c = step(b.model, 'down', 'edited b', {
      ...keyed,
      entries: ['a', 'b', 'c'],
    })
    assert.equal(c.outMessage?.value, 'c')
    assert.equal(
      step(c.model, 'up', 'c', { ...keyed, entries: ['a', 'b', 'c'] })
        .outMessage?.value,
      'edited b',
    )
    assert.equal(
      step(b.model, 'up', '', { ...keyed, entries: ['x'] }).outMessage?.value,
      'x',
    )
  })

  it('distinguishes equal strings by index and preserves empty edits', () => {
    const duplicates = { entries: ['same', 'same'] }
    const last = step(initial(), 'up', '', duplicates)
    const first = step(last.model, 'up', '', duplicates)
    assert.notEqual(first.model.currentKey, last.model.currentKey)
    assert.equal(
      step(first.model, 'down', 'first', duplicates).outMessage?.value,
      '',
    )
    assert.equal(
      step(initial(), 'up', '', {
        entries: ['toString'],
        getEntryKey: entry => entry,
      }).outMessage?.value,
      'toString',
    )
  })
})

const window = new Window()
const document = window.document
const textarea = () => {
  const field = document.createElement('textarea')
  document.body.append(field)
  return field
}
const key = (key = 'ArrowUp', extra: KeyboardEventInit = {}) =>
  new window.KeyboardEvent('keydown', { key, cancelable: true, ...extra })

describe('InputHistory DOM gating', () => {
  it('measures text in block flow even when the textarea uses flex or grid layout', () => {
    const field = textarea()
    field.value = 'A message that wraps across visual lines'
    field.style.padding = '0px'
    Object.defineProperty(field, 'clientWidth', { value: 300 })
    const original = window.HTMLElement.prototype.getBoundingClientRect
    const measuredDisplays: string[] = []
    window.HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.localName === 'span' && this.textContent === '\u200b') {
        measuredDisplays.push(this.parentElement?.style.display ?? '')
      }
      return original.call(this)
    }
    const childCount = document.body.childElementCount
    try {
      for (const display of ['flex', 'grid']) {
        field.style.display = display
        assert.equal(History.measureCaretLine(field, field.value.length), 0)
        assert.equal(document.body.childElementCount, childCount)
      }
      assert.deepEqual(measuredDisplays, ['block', 'block'])
    } finally {
      window.HTMLElement.prototype.getBoundingClientRect = original
      field.remove()
    }
  })

  it('moves the caret after rendering and tolerates missing or unsupported fields', async () => {
    const globals = [
      'document',
      'HTMLInputElement',
      'HTMLTextAreaElement',
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ]
    const previous = globals.map(name =>
      Object.getOwnPropertyDescriptor(globalThis, name),
    )
    Object.defineProperties(globalThis, {
      document: { value: document, configurable: true },
      HTMLInputElement: { value: window.HTMLInputElement, configurable: true },
      HTMLTextAreaElement: {
        value: window.HTMLTextAreaElement,
        configurable: true,
      },
      requestAnimationFrame: {
        value: (callback: FrameRequestCallback) =>
          setTimeout(() => callback(0), 0),
        configurable: true,
      },
      cancelAnimationFrame: { value: clearTimeout, configurable: true },
    })
    const field = textarea()
    field.id = 'chat'
    field.value = 'restored text'
    field.setSelectionRange(0, 0)
    try {
      assert.deepEqual(
        await Effect.runPromise(History.MoveCaretToEnd({ id: 'chat' }).effect),
        History.Message.CompletedMoveCaret(),
      )
      assert.equal(field.selectionStart, field.value.length)
      assert.equal(field.selectionEnd, field.value.length)
      assert.deepEqual(
        await Effect.runPromise(
          History.MoveCaretToEnd({ id: 'missing' }).effect,
        ),
        History.Message.CompletedMoveCaret(),
      )
      const unsupported = document.createElement('input')
      unsupported.id = 'unsupported'
      unsupported.type = 'number'
      document.body.append(unsupported)
      assert.deepEqual(
        await Effect.runPromise(
          History.MoveCaretToEnd({ id: 'unsupported' }).effect,
        ),
        History.Message.CompletedMoveCaret(),
      )
      unsupported.remove()
    } finally {
      field.remove()
      globals.forEach((name, index) => {
        const descriptor = previous[index]
        if (descriptor === undefined) Reflect.deleteProperty(globalThis, name)
        else Object.defineProperty(globalThis, name, descriptor)
      })
    }
  })

  it('prevents only available recalls, reads fresh availability attributes, and cleans up its listener', async () => {
    const field = textarea()
    field.value = 'draft'
    const render = (model: History.Model, entries = inputs.entries) => {
      for (const direction of ['up', 'down'] as const)
        field.toggleAttribute(
          `data-history-${direction}`,
          History.canNavigate(model, { entries }, direction),
        )
    }
    const received: History.Message[] = []
    render(initial())
    const action = History.create().mount()
    const fiber = Effect.runFork(
      Stream.runForEach(action.f(field, Mount.liveViewStateChanges), message =>
        Effect.sync(() => {
          received.push(message)
        }),
      ),
    )
    await new Promise(resolve => setTimeout(resolve, 20))
    const down = key('ArrowDown')
    field.dispatchEvent(down)
    assert.equal(down.defaultPrevented, false)
    field.setSelectionRange(0, 0)
    const up = key()
    field.dispatchEvent(up)
    await new Promise(resolve => setTimeout(resolve, 20))
    assert.equal(up.defaultPrevented, true)
    assert.deepEqual(received, [
      History.Message.RequestedNavigation({ direction: 'up', value: 'draft' }),
    ])
    const recalled = step(initial(), 'up', 'draft')
    render(recalled.model, [])
    const empty = key()
    field.dispatchEvent(empty)
    assert.equal(empty.defaultPrevented, false)
    render(initial())
    await Effect.runPromise(Fiber.interrupt(fiber))
    const removed = key()
    field.dispatchEvent(removed)
    assert.equal(removed.defaultPrevented, false)
    field.remove()
  })

  it('allows only the four supported input types', () => {
    const field = document.createElement('input')
    for (const type of ['text', 'search', 'url', 'tel']) {
      field.type = type
      assert.equal(History.keyDirection(key(), field), 'up')
    }
    for (const type of ['number', 'email', 'password', 'date', 'checkbox']) {
      field.type = type
      assert.equal(History.keyDirection(key(), field), undefined)
    }
  })

  it('ignores modifiers, composition, prevented events, read-only/disabled and open popups', () => {
    const field = textarea()
    for (const extra of [
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { isComposing: true },
    ]) {
      assert.equal(
        History.keyDirection(key('ArrowUp', extra), field),
        undefined,
      )
    }
    const composing = key()
    Object.defineProperty(composing, 'keyCode', { value: 229 })
    assert.equal(History.keyDirection(composing, field), undefined)
    const prevented = key()
    prevented.preventDefault()
    assert.equal(History.keyDirection(prevented, field), undefined)
    assert.equal(History.keyDirection(key('Enter'), field), undefined)
    for (const [name, value] of [
      ['readonly', ''],
      ['disabled', ''],
      ['aria-expanded', 'true'],
      ['data-open', ''],
    ]) {
      field.setAttribute(name, value)
      assert.equal(
        History.keyDirection(key(), field, { atEdge: () => true }),
        undefined,
      )
      field.removeAttribute(name)
    }
    field.setAttribute('aria-expanded', 'false')
    assert.equal(History.keyDirection(key(), field), 'up')
  })

  it('requires collapsed textarea selection even with an override', () => {
    const field = textarea()
    field.value = 'abc'
    field.setSelectionRange(0, 2)
    assert.equal(
      History.keyDirection(key(), field, { atEdge: () => true }),
      undefined,
    )
  })

  it('checks hard and soft visual line edges independently of the DOM measurement', () => {
    const field = textarea()
    field.value = 'first\nsecond'
    field.setSelectionRange(7, 7)
    assert.equal(
      History.keyDirection(key(), field, { caretLine: () => 0 }),
      undefined,
    )
    field.setSelectionRange(2, 2)
    assert.equal(
      History.keyDirection(key('ArrowDown'), field, { caretLine: () => 0 }),
      undefined,
    )
    field.value = 'soft wrapped text'
    field.setSelectionRange(7, 7)
    const caretLine = (_: HTMLTextAreaElement, offset: number) =>
      offset < 5 ? 0 : offset < 10 ? 20 : 40
    assert.equal(History.keyDirection(key(), field, { caretLine }), undefined)
    assert.equal(
      History.keyDirection(key('ArrowDown'), field, { caretLine }),
      undefined,
    )
    field.setSelectionRange(2, 2)
    assert.equal(History.keyDirection(key(), field, { caretLine }), 'up')
    field.setSelectionRange(12, 12)
    assert.equal(
      History.keyDirection(key('ArrowDown'), field, { caretLine }),
      'down',
    )
    assert.equal(
      History.keyDirection(key('ArrowDown'), field, {
        caretLine: () => undefined,
      }),
      undefined,
    )
    field.setSelectionRange(field.value.length, field.value.length)
    assert.equal(History.keyDirection(key('ArrowDown'), field), 'down')
    field.setSelectionRange(0, 0)
    assert.equal(History.keyDirection(key(), field), 'up')
  })

  it('supports custom editor edge overrides without accepting unknown editors by default', () => {
    const editor = document.createElement('div')
    assert.equal(History.keyDirection(key(), editor), undefined)
    assert.equal(
      History.keyDirection(key(), editor, {
        atEdge: direction => direction === 'up',
      }),
      'up',
    )
    assert.equal(
      History.keyDirection(key('ArrowDown'), editor, {
        atEdge: direction => direction === 'up',
      }),
      undefined,
    )
    const field = textarea()
    field.value = 'one\ntwo'
    field.setSelectionRange(5, 5)
    assert.equal(
      History.keyDirection(key(), field, { atEdge: () => true }),
      'up',
    )
    assert.equal(History.measureCaretLine(field, 1), undefined)
  })
})

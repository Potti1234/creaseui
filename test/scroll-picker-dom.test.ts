import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { observePicker } from '../src/lib/behaviors/scroll-picker-dom.ts'
import type { Observation } from '../src/lib/behaviors/scroll-picker.ts'

const setup = (nativeScrollEnd: boolean) => {
  let nextId = 0
  const timers = new Map<number, () => void>()
  const frames = new Map<number, FrameRequestCallback>()
  const view = {
    setTimeout: (callback: () => void) => {
      const id = ++nextId
      timers.set(id, callback)
      return id
    },
    clearTimeout: (id: number) => timers.delete(id),
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = ++nextId
      frames.set(id, callback)
      return id
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  }
  const list = Object.assign(new EventTarget(), {
    ownerDocument: { defaultView: view },
    dataset: {},
    style: {
      setProperty: () => {},
      getPropertyValue: () => '',
      getPropertyPriority: () => '',
    },
    scrollTop: 0,
    clientTop: 0,
    clientHeight: 180,
    offsetHeight: 180,
    scrollHeight: 1000,
    getAttribute: () => null,
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: 0, height: 180 }),
    ...(nativeScrollEnd ? { onscrollend: null } : {}),
  })
  const messages: Observation[] = []
  const cleanup = observePicker(list as HTMLElement, message =>
    messages.push(message),
  )
  messages.length = 0
  const expireTimers = () => {
    const pending = [...timers.values()]
    timers.clear()
    pending.forEach(callback => callback())
  }
  const command = (offset: number) =>
    list.dispatchEvent(
      new CustomEvent('scroll-picker-scroll', {
        detail: { offset, animate: true },
      }),
    )
  const settled = () => messages.filter(message => message._tag === 'Settled')
  return { list, messages, cleanup, expireTimers, command, settled }
}

describe('ScrollPicker DOM completion', () => {
  for (const nativeScrollEnd of [true, false]) {
    const mode = nativeScrollEnd ? 'native scrollend' : 'timer fallback'

    it(`${mode}: does not settle before the first scroll event`, () => {
      const picker = setup(nativeScrollEnd)
      picker.command(144)
      picker.expireTimers()
      assert.equal(picker.settled().length, 0)
      picker.list.scrollTop = 144
      picker.list.dispatchEvent(new Event('scroll'))
      picker.expireTimers()
      assert.equal(picker.settled().length, nativeScrollEnd ? 0 : 1)
      if (nativeScrollEnd) {
        picker.list.dispatchEvent(new Event('scrollend'))
        assert.equal(picker.settled().length, 1)
      }
      picker.cleanup()
    })

    it(`${mode}: completes a no-op command immediately`, () => {
      const picker = setup(nativeScrollEnd)
      picker.command(0.5)
      assert.deepEqual(
        picker.messages.map(message => message._tag),
        ['Settled'],
      )
      picker.expireTimers()
      assert.equal(picker.settled().length, 1)
      picker.cleanup()
    })

    for (const input of ['wheel', 'touchstart']) {
      it(`${mode}: settles user ${input} scrolling`, () => {
        const picker = setup(nativeScrollEnd)
        picker.list.dispatchEvent(new Event(input))
        picker.list.scrollTop = 72
        picker.list.dispatchEvent(new Event('scroll'))
        if (nativeScrollEnd) {
          picker.expireTimers()
          assert.equal(picker.settled().length, 0)
          picker.list.dispatchEvent(new Event('scrollend'))
        } else picker.expireTimers()
        if (input === 'touchstart') {
          assert.equal(picker.settled().length, 0)
          picker.list.dispatchEvent(new Event('touchend'))
        }
        assert.equal(picker.settled().length, 1)
        assert.equal(picker.messages.at(-2)?._tag, 'Scrolled')
        picker.cleanup()
      })
    }
  }
})

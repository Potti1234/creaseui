import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HTMLElement as TestHTMLElement, Window } from 'happy-dom'

import * as AvoidKeyboard from '../src/lib/behaviors/avoid-keyboard.ts'

const isHTMLElement = (value: unknown): value is HTMLElement =>
  value instanceof TestHTMLElement

describe('AvoidKeyboard geometry', () => {
  it('parses computed translate lengths and preserves x and z', () => {
    assert.deepEqual(AvoidKeyboard.parseTranslate('none'), {
      x: '0px',
      y: { percent: 0, px: 0 },
      z: undefined,
    })
    assert.deepEqual(AvoidKeyboard.parseTranslate('10px'), {
      x: '10px',
      y: { percent: 0, px: 0 },
      z: undefined,
    })
    assert.deepEqual(
      AvoidKeyboard.parseTranslate('calc(10% + 2px) calc(-50% - 1.5px) 3px'),
      { x: 'calc(10% + 2px)', y: { percent: -50, px: -1.5 }, z: '3px' },
    )
    assert.deepEqual(AvoidKeyboard.lengthOf('calc(20% + 1e2px - 2px)'), {
      percent: 20,
      px: 98,
    })
    assert.deepEqual(AvoidKeyboard.lengthOf(''), { percent: 0, px: 0 })
    assert.deepEqual(AvoidKeyboard.lengthOf('invalid'), { percent: 0, px: 0 })
    assert.equal(AvoidKeyboard.cssLength({ percent: 0, px: -20 }), '-20px')
    assert.equal(
      AvoidKeyboard.cssLength({ percent: -50, px: -20 }),
      'calc(-50% - 20px)',
    )
    assert.equal(
      AvoidKeyboard.cssLength({ percent: 10, px: 2 }),
      'calc(10% + 2px)',
    )
  })

  const base: AvoidKeyboard.Coverage = {
    box: { top: 700, bottom: 800, height: 100 },
    rest: { percent: 0, px: 0 },
    now: { percent: 0, px: 0 },
    originTop: 0,
    innerHeight: 800,
    offsetTop: 0,
    height: 500,
  }

  it('lifts only the covered portion and leaves offscreen elements alone', () => {
    assert.equal(AvoidKeyboard.coveredPixels(base), 300)
    assert.equal(
      AvoidKeyboard.coveredPixels({
        ...base,
        box: { top: 450, bottom: 550, height: 100 },
      }),
      50,
    )
    assert.equal(
      AvoidKeyboard.coveredPixels({
        ...base,
        box: { top: 200, bottom: 300, height: 100 },
      }),
      0,
    )
    assert.equal(
      AvoidKeyboard.coveredPixels({
        ...base,
        box: { top: 800, bottom: 900, height: 100 },
      }),
      0,
    )
    assert.equal(AvoidKeyboard.coveredPixels({ ...base, innerHeight: 500 }), 0)
    assert.equal(AvoidKeyboard.coveredPixels({ ...base, height: 800 }), 0)
    assert.equal(AvoidKeyboard.coveredPixels({ ...base, offsetTop: 100 }), 200)
    assert.equal(AvoidKeyboard.coveredPixels({ ...base, height: 500.4 }), 300)
  })

  it('undoes the current lift, percent shift, and viewport origin when measuring', () => {
    assert.equal(
      AvoidKeyboard.coveredPixels({
        ...base,
        box: { top: 400, bottom: 500, height: 100 },
        now: { percent: 0, px: -300 },
      }),
      300,
    )
    assert.equal(
      AvoidKeyboard.coveredPixels({
        ...base,
        box: { top: 650, bottom: 750, height: 100 },
        rest: { percent: 50, px: 20 },
        now: { percent: 0, px: 20 },
      }),
      300,
    )
    assert.equal(
      AvoidKeyboard.coveredPixels({
        ...base,
        box: { top: 600, bottom: 700, height: 100 },
        originTop: -100,
      }),
      300,
    )
  })
})

describe('AvoidKeyboard lifecycle', () => {
  it('does nothing without visualViewport', () => {
    const view = new Window()
    const element = view.document.createElement('div')
    element.style.translate = '2px 4px'
    assert.ok(isHTMLElement(element))
    const stop = AvoidKeyboard.avoidKeyboard(element)
    assert.equal(view.document.querySelector('[data-viewport-origin]'), null)
    stop()
    assert.equal(element.style.translate, '2px 4px')
  })

  it('throttles viewport events, ignores non-keyboard shrinking, and restores translate on cleanup', () => {
    const view = new Window()
    const doc = view.document
    const visual = Object.assign(new view.EventTarget(), {
      width: 400,
      height: 800,
      offsetTop: 0,
      scale: 1,
    })
    Object.defineProperty(view, 'visualViewport', { value: visual })
    Object.defineProperty(view, 'innerHeight', { value: 800 })
    const frames = new Map<number, FrameRequestCallback>()
    let serial = 0
    view.requestAnimationFrame = callback => {
      frames.set(++serial, callback)
      return serial
    }
    view.cancelAnimationFrame = id => {
      frames.delete(id)
    }
    const flush = () => {
      const pending = [...frames.values()]
      frames.clear()
      pending.forEach(callback => callback(0))
    }
    const element = doc.createElement('div')
    element.style.translate = '10px 20px'
    doc.body.append(element)
    element.getBoundingClientRect = () => {
      const shift =
        AvoidKeyboard.parseTranslate(element.style.translate).y.px - 20
      return { top: 700 + shift, bottom: 800 + shift, height: 100 } as DOMRect
    }
    const field = doc.createElement('input')
    doc.body.append(field)
    assert.ok(isHTMLElement(element))
    const stop = AvoidKeyboard.avoidKeyboard(element)
    flush()
    visual.height = 700
    visual.dispatchEvent(new view.Event('resize'))
    flush()
    assert.equal(element.hasAttribute('data-keyboard'), false)
    assert.equal(element.style.translate, '10px 20px')
    visual.height = 800
    visual.dispatchEvent(new view.Event('resize'))
    flush()
    field.focus()
    visual.height = 500
    visual.dispatchEvent(new view.Event('resize'))
    visual.dispatchEvent(new view.Event('scroll'))
    assert.equal(frames.size, 1)
    flush()
    assert.equal(element.hasAttribute('data-keyboard'), true)
    assert.equal(element.style.translate, '10px -280px')
    visual.dispatchEvent(new view.Event('scroll'))
    flush()
    assert.equal(element.style.translate, '10px -280px')
    field.blur()
    flush()
    assert.equal(element.style.translate, '10px 20px')
    assert.equal(element.hasAttribute('data-keyboard'), false)
    visual.dispatchEvent(new view.Event('resize'))
    stop()
    assert.equal(frames.size, 0)
    assert.equal(doc.querySelector('[data-viewport-origin]'), null)
    visual.dispatchEvent(new view.Event('resize'))
    doc.dispatchEvent(new view.Event('focusin'))
    assert.equal(frames.size, 0)
    assert.equal(element.style.translate, '10px 20px')
  })
})

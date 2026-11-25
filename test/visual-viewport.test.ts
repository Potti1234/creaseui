import assert from 'node:assert/strict'
import { it } from 'node:test'

import * as Viewport from '../src/lib/behaviors/visual-viewport.ts'

it('tracks resize and visual scroll, then releases both bindings', () => {
  const visual = Object.assign(new EventTarget(), {
    width: 400,
    height: 300,
    offsetTop: 0,
    offsetLeft: 3,
    scale: 1.2,
  })
  const target = Object.assign(new EventTarget(), {
    innerWidth: 480,
    innerHeight: 500,
    visualViewport: visual,
  })
  const view: unknown = target
  const states: Viewport.Viewport[] = []
  const stop = Viewport.bindViewport(view as Window, state =>
    states.push(state),
  )
  visual.offsetTop = 25
  visual.dispatchEvent(new Event('scroll'))
  visual.height = 250
  target.dispatchEvent(new Event('resize'))
  stop()
  visual.dispatchEvent(new Event('resize'))
  assert.deepEqual(states, [
    { width: 400, height: 300, offsetLeft: 3, offsetTop: 0, scale: 1.2 },
    { width: 400, height: 300, offsetLeft: 3, offsetTop: 25, scale: 1.2 },
    { width: 400, height: 250, offsetLeft: 3, offsetTop: 25, scale: 1.2 },
  ])
})

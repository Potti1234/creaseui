import { afterEach, expect, it, vi } from 'vitest'

import { bindPanel } from '@/lib/disclosure'

const heightProperty = '--crease-disclosure-height'
const transitionProperty = '--crease-disclosure-transition'

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

const panelFixture = () => {
  const trigger = document.createElement('button')
  trigger.id = 'disclosure-trigger'
  const outside = document.createElement('button')
  const wrapper = document.createElement('div')
  wrapper.setAttribute('data-disclosure-open', '')
  wrapper.setAttribute('data-disclosure-trigger', trigger.id)
  const content = document.createElement('div')
  const inside = document.createElement('button')
  content.append(inside)
  wrapper.append(content)
  document.body.append(trigger, wrapper, outside)
  return { trigger, wrapper, content, inside, outside }
}

it('remeasures content, honors changes to reduced motion, and releases observers', () => {
  const { wrapper, content } = panelFixture()
  let resize = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback
      }
      observe = vi.fn()
      disconnect = disconnect
    },
  )
  const motion = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal('matchMedia', () => motion)
  let height = 80
  Object.defineProperty(content, 'offsetHeight', { get: () => height })

  const release = bindPanel(wrapper)
  try {
    expect(wrapper.style.getPropertyValue(heightProperty)).toBe('80px')
    expect(wrapper.style.getPropertyValue(transitionProperty)).toContain(
      'height',
    )
    height = 145
    resize()
    expect(wrapper.style.getPropertyValue(heightProperty)).toBe('145px')

    motion.matches = true
    motion.dispatchEvent(new Event('change'))
    expect(wrapper.style.getPropertyValue(transitionProperty)).toBe('none')
  } finally {
    release()
  }
  expect(disconnect).toHaveBeenCalledOnce()
  expect(wrapper.style.getPropertyValue(heightProperty)).toBe('')
  motion.dispatchEvent(new Event('change'))
  expect(wrapper.style.getPropertyValue(transitionProperty)).toBe('')
})

it('returns panel focus on controlled close and leaves outside focus alone', async () => {
  const { wrapper, trigger, inside, outside } = panelFixture()
  const release = bindPanel(wrapper)
  try {
    inside.focus()
    wrapper.removeAttribute('data-disclosure-open')
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))

    wrapper.setAttribute('data-disclosure-open', '')
    outside.focus()
    await new Promise(resolve => setTimeout(resolve, 0))
    wrapper.removeAttribute('data-disclosure-open')
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement).toBe(outside)
  } finally {
    release()
  }
})

it('recovers when the browser clears focus as the panel becomes inert', async () => {
  const { wrapper, trigger, inside, content } = panelFixture()
  const release = bindPanel(wrapper)
  try {
    inside.focus()
    wrapper.removeAttribute('data-disclosure-open')
    content.setAttribute('inert', '')
    inside.blur()
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger))
  } finally {
    release()
  }
})

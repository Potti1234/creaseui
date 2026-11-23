import { Effect } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

export type Length = Readonly<{ percent: number; px: number }>

export const lengthOf = (value: string): Length => {
  let percent = 0
  let px = 0
  for (const [, number = '0', unit] of value
    .replaceAll(' ', '')
    .matchAll(/([+-]?[\d.]+(?:e[+-]?\d+)?)(%|px)?/gi)) {
    if (unit === '%') percent += Number.parseFloat(number)
    else px += Number.parseFloat(number)
  }
  return { percent, px }
}

export const cssLength = ({ percent, px }: Length): string =>
  !percent
    ? `${px}px`
    : `calc(${percent}% ${px < 0 ? '-' : '+'} ${Math.abs(px)}px)`

export const parseTranslate = (
  value: string,
): Readonly<{ x: string; y: Length; z: string | undefined }> => {
  const [x = '0px', y = '0px', z] =
    value === 'none' ? [] : value.split(/ (?![^(]*\))/)
  return { x, y: lengthOf(y), z }
}

export type Coverage = Readonly<{
  box: Readonly<{ top: number; bottom: number; height: number }>
  rest: Length
  now: Length
  originTop: number
  innerHeight: number
  offsetTop: number
  height: number
}>

export const coveredPixels = ({
  box,
  rest,
  now,
  originTop,
  innerHeight,
  offsetTop,
  height,
}: Coverage): number => {
  const shift =
    now.px -
    rest.px +
    ((now.percent - rest.percent) * box.height) / 100 +
    originTop
  const bottom = Math.min(box.bottom - shift, innerHeight)
  const below = box.top - shift < innerHeight ? bottom - offsetTop - height : 0
  return Math.round(Math.max(0, below))
}

const keyboardless = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

const isField = (target: EventTarget | null): boolean => {
  let element = target as HTMLElement | null
  while (element?.shadowRoot?.activeElement)
    element = element.shadowRoot.activeElement as HTMLElement
  if (!element?.tagName) return false
  return (
    element.isContentEditable ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'IFRAME' ||
    (element.tagName === 'INPUT' &&
      !keyboardless.has((element as HTMLInputElement).type))
  )
}

export const avoidKeyboard = (element: HTMLElement): (() => void) => {
  const doc = element.ownerDocument
  const view = doc.defaultView
  const visual = view?.visualViewport
  if (!view || !visual) return () => {}
  const own = element.style.translate
  const shown = () => parseTranslate(view.getComputedStyle(element).translate)
  const rest = shown()
  const origin = doc.createElement('div')
  origin.setAttribute('aria-hidden', 'true')
  origin.setAttribute('data-viewport-origin', '')
  origin.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none'
  doc.body.append(origin)
  let before = { width: 0, height: 0 }
  let keyboard = 0
  let lifted = 0
  let frame = 0
  const update = () => {
    frame = 0
    element.toggleAttribute('data-keyboard', keyboard > 0)
    const next = keyboard
      ? coveredPixels({
          box: element.getBoundingClientRect(),
          rest: rest.y,
          now: shown().y,
          originTop: origin.getBoundingClientRect().top,
          innerHeight: view.innerHeight,
          offsetTop: visual.offsetTop,
          height: visual.height,
        })
      : 0
    if (next === lifted) return
    lifted = next
    const y = cssLength({ percent: rest.y.percent, px: rest.y.px - lifted })
    element.style.translate = lifted
      ? [rest.x, y, rest.z].filter(Boolean).join(' ')
      : own
  }
  const schedule = () => {
    if (!frame) frame = view.requestAnimationFrame(update)
  }
  const measure = (event?: Event) => {
    const now = {
      width: visual.width * visual.scale,
      height: visual.height * visual.scale,
    }
    const moving =
      event?.type === 'focusout' && isField((event as FocusEvent).relatedTarget)
    if (!isField(doc.activeElement) && !moving) {
      if (!event?.type.startsWith('focus')) before = now
      keyboard = 0
    } else {
      if (Math.abs(now.width - before.width) > 1)
        before = { width: now.width, height: view.innerHeight * visual.scale }
      keyboard = Math.max(
        0,
        Math.round((before.height - now.height) / visual.scale),
      )
    }
    schedule()
  }
  const scrolled = () => {
    if (keyboard || lifted) schedule()
  }
  visual.addEventListener('resize', measure)
  visual.addEventListener('scroll', measure)
  view.addEventListener('resize', measure)
  view.addEventListener('scroll', scrolled, { capture: true, passive: true })
  doc.addEventListener('focusin', measure)
  doc.addEventListener('focusout', measure)
  measure()
  return () => {
    view.cancelAnimationFrame(frame)
    visual.removeEventListener('resize', measure)
    visual.removeEventListener('scroll', measure)
    view.removeEventListener('resize', measure)
    view.removeEventListener('scroll', scrolled, { capture: true })
    doc.removeEventListener('focusin', measure)
    doc.removeEventListener('focusout', measure)
    origin.remove()
    element.style.translate = own
    element.removeAttribute('data-keyboard')
  }
}

export const Message = defineMessageUnion({ CompletedAvoidKeyboard: {} })
export type Message = typeof Message.Type

export const AvoidKeyboard = Mount.define('AvoidKeyboard', {
  args: {},
  messages: [Message.CompletedAvoidKeyboard],
  execute: ({ element }) =>
    Effect.gen(function* () {
      yield* Effect.acquireRelease(
        Effect.sync(() =>
          element instanceof HTMLElement ? avoidKeyboard(element) : () => {},
        ),
        release => Effect.sync(release),
      )
      return Message.CompletedAvoidKeyboard()
    }),
})

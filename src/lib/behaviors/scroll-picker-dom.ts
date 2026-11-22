// Adapted from @ui-sdk/core 0.1.0-beta.13 (Apache-2.0), Copyright 2026 Vercel, Inc.
import { Message, pickerPosition, type Observation } from './scroll-picker'

type Sample = Readonly<{ time: number; at: number }>

const velocity = (samples: readonly Sample[], now: number): number => {
  const newest = samples.at(-1)
  if (newest === undefined || now - newest.time > 40) return 0
  const window = samples.filter(sample => newest.time - sample.time <= 70)
  if (window.length < 2) return 0
  const meanTime = window.reduce(
    (sum, sample) => sum + sample.time / window.length,
    0,
  )
  const meanAt = window.reduce(
    (sum, sample) => sum + sample.at / window.length,
    0,
  )
  let covariance = 0
  let variance = 0
  let s0 = 0,
    s1 = 0,
    s2 = 0,
    s3 = 0,
    s4 = 0,
    x0 = 0,
    x1 = 0,
    x2 = 0
  for (const sample of window) {
    const t = sample.time - newest.time
    const t2 = t * t
    s0++
    s1 += t
    s2 += t2
    s3 += t2 * t
    s4 += t2 * t2
    x0 += sample.at
    x1 += sample.at * t
    x2 += sample.at * t2
    covariance += (sample.time - meanTime) * (sample.at - meanAt)
    variance += (sample.time - meanTime) ** 2
  }
  const determinant =
    s0 * (s2 * s4 - s3 * s3) -
    s1 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * s3 - s2 * s2)
  const numerator =
    s0 * (x1 * s4 - s3 * x2) -
    x0 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * x2 - x1 * s2)
  const fitted =
    window.length < 4 || Math.abs(determinant) < 1e-9
      ? variance > 0
        ? covariance / variance
        : 0
      : numerator / determinant
  return Math.max(-8, Math.min(8, fitted))
}

export const observePicker = (
  list: HTMLElement,
  emit: (message: Observation) => void,
): (() => void) => {
  const doc = list.ownerDocument
  const view = doc.defaultView!
  const supportsScrollEnd = 'onscrollend' in list
  let items: HTMLElement[] = []
  let centers: number[] = []
  let vertical = true
  let rtl = false
  let sized = false
  let frame = 0
  let timer = 0
  let touching = false
  let missedRest = false
  let drag:
    | {
        id: number
        from: number
        offset: number
        moved: boolean
        samples: Sample[]
      }
    | undefined
  let offDrag: (() => void)[] = []
  let offClick: (() => void) | undefined
  let clickTimer = 0
  const observed = new Set<HTMLElement>()
  const overridden = new Map<string, readonly [string, string]>()
  const offs: (() => void)[] = []
  const listen = <K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): (() => void) => {
    const listener = handler as EventListener
    target.addEventListener(type, listener, options)
    return () => target.removeEventListener(type, listener, options)
  }
  const override = (name: string, value: string): void => {
    if (!overridden.has(name))
      overridden.set(name, [
        list.style.getPropertyValue(name),
        list.style.getPropertyPriority(name),
      ])
    list.style.setProperty(name, value)
  }
  const restore = (name: string): void => {
    const previous = overridden.get(name)
    if (previous === undefined) return
    list.style.setProperty(name, ...previous)
    overridden.delete(name)
  }
  const scroll = (): number =>
    vertical ? list.scrollTop : rtl ? -list.scrollLeft : list.scrollLeft
  const viewport = (): number =>
    vertical ? list.clientHeight : list.clientWidth
  const along = (event: PointerEvent): number =>
    vertical ? event.clientY : rtl ? -event.clientX : event.clientX
  const paint = (): number => {
    const at = scroll() + viewport() / 2
    let position = pickerPosition(centers, at)
    const nearest = Math.round(position)
    if (Math.abs((centers[nearest] ?? Infinity) - at) < 1) position = nearest
    items.forEach((item, index) => {
      const offset = String(Math.round((index - position) * 1000) / 1000)
      if (item.style.getPropertyValue('--picker-offset') !== offset)
        item.style.setProperty('--picker-offset', offset)
    })
    return position
  }
  const reportScroll = (): void => {
    frame = 0
    emit(Message.Scrolled({ position: paint(), offset: scroll() }))
  }
  const measure = (): void => {
    vertical =
      (list.dataset.pickerOrientation ??
        list.getAttribute('aria-orientation')) !== 'horizontal'
    rtl = !vertical && view.getComputedStyle(list).direction === 'rtl'
    items = [...list.querySelectorAll<HTMLElement>('[role="option"]')]
    const box = list.getBoundingClientRect()
    const size = vertical ? box.height : box.width
    sized = size > 0
    const layout = vertical ? list.offsetHeight : list.offsetWidth
    const scale = sized && Math.abs(layout - size) > 0.5 ? layout / size : 1
    centers = items.map(item => {
      const rect = item.getBoundingClientRect()
      const offset = vertical
        ? (rect.top + rect.height / 2 - box.top) * scale - list.clientTop
        : (rect.left + rect.width / 2 - box.left) * scale - list.clientLeft
      return (rtl ? list.clientWidth - offset : offset) + scroll()
    })
    for (const item of observed) {
      if (!items.includes(item)) {
        item.style.removeProperty('--picker-offset')
        resizes?.unobserve(item)
        observed.delete(item)
      }
    }
    for (const item of items) {
      if (!observed.has(item)) {
        observed.add(item)
        resizes?.observe(item)
      }
    }
    emit(
      Message.Measured({
        centers,
        disabled: items.flatMap((item, index) =>
          item.getAttribute('aria-disabled') === 'true' ? [index] : [],
        ),
        orientation: vertical ? 'vertical' : 'horizontal',
        viewport: viewport(),
        offset: scroll(),
        maxScroll: Math.max(
          0,
          vertical
            ? list.scrollHeight - list.clientHeight
            : list.scrollWidth - list.clientWidth,
        ),
      }),
    )
    paint()
  }
  const selected = (): void => {
    const index = items.findIndex(
      item => item.getAttribute('aria-selected') === 'true',
    )
    if (index !== -1) emit(Message.ChangedSelection({ index }))
  }
  const rest = (): void => {
    view.clearTimeout(timer)
    if (drag?.moved) return
    if (touching) {
      missedRest = true
      return
    }
    if (frame !== 0) {
      view.cancelAnimationFrame(frame)
      reportScroll()
    }
    restore('scroll-snap-type')
    emit(Message.Settled())
  }
  const waitForRest = (): void => {
    view.clearTimeout(timer)
    timer = view.setTimeout(rest, 120)
  }
  const interrupt = (): void => {
    emit(Message.Interrupted())
    restore('scroll-snap-type')
  }
  const onScroll = (): void => {
    if (!sized) {
      measure()
      return
    }
    waitForRest()
    frame ||= view.requestAnimationFrame(reportScroll)
  }
  const finishDrag = (event: PointerEvent): void => {
    if (drag === undefined || event.pointerId !== drag.id) return
    const current = drag
    drag = undefined
    offDrag.forEach(off => off())
    offDrag = []
    if (list.hasPointerCapture?.(event.pointerId))
      list.releasePointerCapture(event.pointerId)
    if (!current.moved) return
    restore('user-select')
    offClick?.()
    const swallow = (click: MouseEvent): void => {
      click.preventDefault()
      click.stopImmediatePropagation()
      offClick?.()
      offClick = undefined
    }
    offClick = listen(doc, 'click', swallow, { capture: true, once: true })
    view.clearTimeout(clickTimer)
    clickTimer = view.setTimeout(() => {
      offClick?.()
      offClick = undefined
    }, 400)
    emit(
      Message.EndedDrag({
        offset: scroll(),
        velocity:
          event.type === 'pointercancel'
            ? 0
            : velocity(current.samples, event.timeStamp),
      }),
    )
  }
  const moveDrag = (event: PointerEvent): void => {
    if (drag === undefined || event.pointerId !== drag.id) return
    const at = along(event)
    if (!drag.moved) {
      if (Math.abs(at - drag.from) < 3) return
      drag.moved = true
      override('scroll-snap-type', 'none')
      override('user-select', 'none')
      doc.getSelection()?.removeAllRanges()
      try {
        list.setPointerCapture(event.pointerId)
      } catch {
        /* The pointer may already have ended. */
      }
      emit(Message.StartedDrag())
    }
    if (event.timeStamp > (drag.samples.at(-1)?.time ?? -Infinity)) {
      drag.samples.push({ time: event.timeStamp, at })
      if (drag.samples.length > 20) drag.samples.shift()
    }
    emit(Message.Dragged({ offset: drag.offset - (at - drag.from) }))
  }
  const startDrag = (event: PointerEvent): void => {
    if (
      event.pointerType === 'touch' ||
      event.button !== 0 ||
      drag !== undefined
    )
      return
    if (
      event.target === list &&
      (event.offsetX > list.clientWidth || event.offsetY > list.clientHeight)
    )
      return
    interrupt()
    drag = {
      id: event.pointerId,
      from: along(event),
      offset: scroll(),
      moved: false,
      samples: [{ time: event.timeStamp, at: along(event) }],
    }
    offDrag = [
      listen(doc, 'pointermove', moveDrag, { capture: true }),
      listen(doc, 'pointerup', finishDrag, { capture: true }),
      listen(doc, 'pointercancel', finishDrag, { capture: true }),
    ]
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    const delta = event.key === 'PageDown' ? 1 : event.key === 'PageUp' ? -1 : 0
    if (!delta || event.defaultPrevented || items.length < 2) return
    event.preventDefault()
    emit(Message.Paged({ delta }))
  }
  const onCommand = (): void => {
    waitForRest()
  }
  const resizes = view.ResizeObserver
    ? new view.ResizeObserver(measure)
    : undefined
  const mutations = view.MutationObserver
    ? new view.MutationObserver(records => {
        if (
          records.some(
            record =>
              record.type === 'childList' ||
              record.attributeName !== 'aria-selected',
          )
        )
          measure()
        selected()
      })
    : undefined
  measure()
  selected()
  resizes?.observe(list)
  mutations?.observe(list, {
    subtree: true,
    childList: true,
    attributeFilter: [
      'aria-selected',
      'aria-orientation',
      'aria-disabled',
      'role',
      'data-picker-orientation',
      'dir',
    ],
  })
  offs.push(
    listen(list, 'scroll', onScroll, { passive: true }),
    listen(list, 'wheel', interrupt, { passive: true }),
    listen(
      list,
      'touchstart',
      () => {
        touching = true
        missedRest = false
        interrupt()
      },
      { passive: true },
    ),
    ...(['touchend', 'touchcancel'] as const).map(type =>
      listen(
        list,
        type,
        () => {
          touching = false
          if (missedRest) {
            missedRest = false
            rest()
          }
        },
        { passive: true },
      ),
    ),
    listen(list, 'pointerdown', startDrag),
    listen(list, 'mousedown', event => {
      if ((event.target as Element).closest('[role="option"]'))
        event.preventDefault()
    }),
    listen(list, 'keydown', onKeyDown),
  )
  if (supportsScrollEnd) offs.push(listen(list, 'scrollend', rest))
  list.addEventListener('scroll-picker-scroll', onCommand)
  return () => {
    offs.forEach(off => off())
    offDrag.forEach(off => off())
    offClick?.()
    if (drag !== undefined && list.hasPointerCapture?.(drag.id))
      list.releasePointerCapture(drag.id)
    list.removeEventListener('scroll-picker-scroll', onCommand)
    resizes?.disconnect()
    mutations?.disconnect()
    view.cancelAnimationFrame(frame)
    view.clearTimeout(timer)
    view.clearTimeout(clickTimer)
    restore('user-select')
    restore('scroll-snap-type')
    for (const item of observed) item.style.removeProperty('--picker-offset')
  }
}

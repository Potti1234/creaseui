/* HoverIntent state and view adapted from @foldkit/ui 0.164.0.

MIT License

Copyright (c) 2025 Devin Jameson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { Duration, Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import type { ReturnWithOutMessage } from 'foldkit/update'

const FocusLocation = S.Literals(['Trigger', 'Panel'])
type FocusLocation = typeof FocusLocation.Type

export const Model = S.Struct({
  isOpen: S.Boolean,
  isTriggerHovered: S.Boolean,
  isPanelHovered: S.Boolean,
  maybeFocusLocation: S.Option(FocusLocation),
  isDismissed: S.Boolean,
  openDelay: S.DurationFromMillis,
  closeDelay: S.DurationFromMillis,
  pendingOpenVersion: S.Number,
  pendingCloseVersion: S.Number,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  EnteredTrigger: {},
  LeftTrigger: {},
  EnteredPanel: {},
  LeftPanel: {},
  FocusedTrigger: {},
  BlurredTrigger: {},
  FocusedPanel: {},
  BlurredPanel: {},
  PressedEscape: { source: FocusLocation },
  Dismissed: {},
  CompletedWaitBeforeOpening: { version: S.Number },
  CompletedWaitBeforeClosing: { version: S.Number },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({ Opened: {}, Closed: {} })
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  openDelay?: Duration.Input
  closeDelay?: Duration.Input
}>

export const init = ({
  openDelay = 200,
  closeDelay = 300,
}: InitConfig = {}): Model => ({
  isOpen: false,
  isTriggerHovered: false,
  isPanelHovered: false,
  maybeFocusLocation: Option.none(),
  isDismissed: false,
  openDelay: Duration.fromInputUnsafe(openDelay),
  closeDelay: Duration.fromInputUnsafe(closeDelay),
  pendingOpenVersion: 0,
  pendingCloseVersion: 0,
})

const WaitBeforeOpening = Command.define('WaitBeforeOpening', {
  args: { delay: S.DurationFromMillis, version: S.Number },
  messages: [Message.CompletedWaitBeforeOpening],
  execute: ({ delay, version }) =>
    Effect.sleep(delay).pipe(
      Effect.as(Message.CompletedWaitBeforeOpening({ version })),
    ),
})

const WaitBeforeClosing = Command.define('WaitBeforeClosing', {
  args: { delay: S.DurationFromMillis, version: S.Number },
  messages: [Message.CompletedWaitBeforeClosing],
  execute: ({ delay, version }) =>
    Effect.sleep(delay).pipe(
      Effect.as(Message.CompletedWaitBeforeClosing({ version })),
    ),
})

type UpdateResult = ReturnWithOutMessage<Model, Message, OutMessage>

// Blur closes on a later turn for interactive panels so focus can move inside
// before the close settles. A tooltip uses its configured close delay for blur.
export type Preset = Readonly<{
  blurDelay: 'deferred' | 'close-delay'
  closeImmediatelyAtZero: boolean
}>

export const hoverCardPreset: Preset = {
  blurDelay: 'deferred',
  closeImmediatelyAtZero: false,
}

export const tooltipPreset: Preset = {
  blurDelay: 'close-delay',
  closeImmediatelyAtZero: true,
}

type Wait = Readonly<{
  phase: 'open' | 'close'
  delay: Duration.Duration
  version: number
}>

type Transition = Readonly<{
  model: Model
  outMessage?: OutMessage
  wait?: Wait
}>

const isEngaged = (model: Model): boolean =>
  model.isTriggerHovered ||
  model.isPanelHovered ||
  Option.isSome(model.maybeFocusLocation)

const setOpen = (model: Model, isOpen: boolean): Transition =>
  model.isOpen === isOpen
    ? { model }
    : {
        model: { ...model, isOpen },
        outMessage: isOpen ? OutMessage.Opened() : OutMessage.Closed(),
      }

const enter = (model: Model): Transition => {
  const next = { ...model, pendingCloseVersion: model.pendingCloseVersion + 1 }
  if (next.isOpen || next.isDismissed) return { model: next }

  const version = next.pendingOpenVersion + 1
  return {
    model: { ...next, pendingOpenVersion: version },
    wait: { phase: 'open', delay: next.openDelay, version },
  }
}

const leave = (
  model: Model,
  delay: Duration.Duration,
  preset: Preset,
): Transition => {
  const next = { ...model, pendingOpenVersion: model.pendingOpenVersion + 1 }
  if (isEngaged(next)) return { model: next }
  if (next.isDismissed) return { model: { ...next, isDismissed: false } }
  if (!next.isOpen) return { model: next }

  const version = next.pendingCloseVersion + 1
  const waiting = { ...next, pendingCloseVersion: version }
  if (preset.closeImmediatelyAtZero && Duration.isZero(delay)) {
    return setOpen(waiting, false)
  }
  return {
    model: waiting,
    wait: { phase: 'close', delay, version },
  }
}

const focus = (model: Model, location: FocusLocation): UpdateResult => {
  const next = {
    ...model,
    maybeFocusLocation: Option.some(location),
    pendingOpenVersion: model.pendingOpenVersion + 1,
    pendingCloseVersion: model.pendingCloseVersion + 1,
  }
  return next.isDismissed ? { model: next } : setOpen(next, true)
}

const triggerHasFocus = (model: Model): boolean =>
  Option.exists(model.maybeFocusLocation, location => location === 'Trigger')

const dismiss = (model: Model, triggerFocused: boolean): UpdateResult => {
  const next: Model = {
    ...model,
    isOpen: false,
    isPanelHovered: false,
    maybeFocusLocation: triggerFocused ? Option.some('Trigger') : Option.none(),
    isDismissed: model.isTriggerHovered || triggerFocused,
    pendingOpenVersion: model.pendingOpenVersion + 1,
    pendingCloseVersion: model.pendingCloseVersion + 1,
  }
  return model.isOpen
    ? { model: next, outMessage: OutMessage.Closed() }
    : { model: next }
}

export const close = (model: Model): UpdateResult =>
  dismiss(model, triggerHasFocus(model))

/** Resolve intent and describe any wait so hosts can use their own command messages. */
export const transition = (
  model: Model,
  message: Message,
  preset: Preset = hoverCardPreset,
): Transition => {
  switch (message._tag) {
    case 'EnteredTrigger':
      return enter({ ...model, isTriggerHovered: true })
    case 'EnteredPanel':
      return enter({ ...model, isPanelHovered: true })
    case 'LeftTrigger':
      return leave(
        { ...model, isTriggerHovered: false },
        model.closeDelay,
        preset,
      )
    case 'LeftPanel':
      return leave(
        { ...model, isPanelHovered: false },
        model.closeDelay,
        preset,
      )
    case 'FocusedTrigger':
      return focus(model, 'Trigger')
    case 'FocusedPanel':
      return focus(model, 'Panel')
    case 'BlurredTrigger':
    case 'BlurredPanel':
      return leave(
        { ...model, maybeFocusLocation: Option.none() },
        preset.blurDelay === 'deferred' ? Duration.zero : model.closeDelay,
        preset,
      )
    case 'Dismissed':
      return close(model)
    case 'PressedEscape':
      return dismiss(
        model,
        message.source === 'Trigger' || triggerHasFocus(model),
      )
    case 'CompletedWaitBeforeOpening':
      if (
        message.version !== model.pendingOpenVersion ||
        model.isDismissed ||
        !isEngaged(model)
      ) {
        return { model }
      }
      return setOpen(model, true)
    case 'CompletedWaitBeforeClosing':
      if (
        message.version !== model.pendingCloseVersion ||
        isEngaged(model) ||
        !model.isOpen
      ) {
        return { model }
      }
      return setOpen(model, false)
  }
}

export const update = (
  model: Model,
  message: Message,
  preset: Preset = hoverCardPreset,
): UpdateResult => {
  const { wait, ...result } = transition(model, message, preset)
  if (wait === undefined) return result
  const { phase, delay, version } = wait
  const command = phase === 'open' ? WaitBeforeOpening : WaitBeforeClosing
  return { ...result, commands: [command({ delay, version })] }
}

export type RenderInfo = Readonly<{
  trigger: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
  isVisible: boolean
}>

export type ViewInputs = Readonly<{
  focusTriggerSelector?: string
  toView: (render: RenderInfo) => Html
}>

export const view = defineView<Model, Message, ViewInputs>(
  (model, { focusTriggerSelector, toView }, h) => {
    const onEscape = (source: FocusLocation) => (key: string) =>
      key === 'Escape'
        ? Option.some(Message.PressedEscape({ source }))
        : Option.none()

    return toView({
      trigger: childAttributes([
        h.OnMouseEnter(Message.EnteredTrigger()),
        h.OnMouseLeave(Message.LeftTrigger()),
        h.OnFocus(Message.FocusedTrigger()),
        h.OnBlur(Message.BlurredTrigger()),
        h.OnKeyDownPreventDefault(onEscape('Trigger')),
      ]),
      panel: childAttributes([
        h.OnMouseEnter(Message.EnteredPanel()),
        h.OnMouseLeave(Message.LeftPanel()),
        h.OnFocusEnter(Message.FocusedPanel()),
        h.OnFocusLeave(Message.BlurredPanel()),
        focusTriggerSelector === undefined
          ? h.OnKeyDownPreventDefault(onEscape('Panel'))
          : h.OnKeyDownFocus(key =>
              key === 'Escape'
                ? Option.some({
                    focusSelector: focusTriggerSelector,
                    message: Message.PressedEscape({ source: 'Panel' }),
                  })
                : Option.none(),
            ),
      ]),
      isVisible: model.isOpen,
    })
  },
)

type Point = Readonly<{ x: number; y: number }>
type Bounds = Readonly<
  Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>
>

const cross = (origin: Point, a: Point, b: Point): number =>
  (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x)

const hullHalf = (points: ReadonlyArray<Point>): ReadonlyArray<Point> => {
  const half: Array<Point> = []
  for (const point of points) {
    while (half.length >= 2 && cross(half.at(-2)!, half.at(-1)!, point) <= 0) {
      half.pop()
    }
    half.push(point)
  }
  return half.slice(0, -1)
}

export const bridgeBetween = (trigger: Bounds, panel: Bounds) => {
  const padding = 4
  const points = [trigger, panel]
    .flatMap(({ left, right, top, bottom }) =>
      [left - padding, right + padding].flatMap(x =>
        [top - padding, bottom + padding].map(y => ({ x, y })),
      ),
    )
    .sort((a, b) => a.x - b.x || a.y - b.y)
  const hull = [...hullHalf(points), ...hullHalf(points.reverse())]
  return (point: Point): boolean =>
    hull.every(
      (from, index) =>
        cross(from, hull[(index + 1) % hull.length]!, point) >= 0,
    )
}

export const watchPointerDeparture = (
  region: HTMLElement,
  trigger: Element | null,
  panel: Element,
  departed: () => void,
) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const owner = region.ownerDocument
      const lifecycle = new AbortController()
      let transit: AbortController | undefined
      const stopWatching = () => transit?.abort()
      const leave = () => {
        stopWatching()
        departed()
      }
      const onLeave = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        stopWatching()
        if (trigger === null || event.relatedTarget === null) {
          leave()
          return
        }
        const inside = bridgeBetween(
          trigger.getBoundingClientRect(),
          panel.getBoundingClientRect(),
        )
        const isInside = (pointer: PointerEvent) =>
          inside({ x: pointer.clientX, y: pointer.clientY })
        if (!isInside(event)) {
          leave()
          return
        }
        transit = new AbortController()
        const options = { signal: transit.signal, capture: true }
        owner.addEventListener(
          'pointermove',
          move => {
            if (move.pointerId === event.pointerId && !isInside(move)) leave()
          },
          options,
        )
        const onEnd = (end: PointerEvent) => {
          if (end.pointerId === event.pointerId) leave()
        }
        owner.addEventListener('pointercancel', onEnd, options)
        owner.documentElement.addEventListener('pointerleave', onEnd, {
          signal: transit.signal,
        })
      }
      region.addEventListener('pointerleave', onLeave, {
        signal: lifecycle.signal,
      })
      region.addEventListener('pointerenter', stopWatching, {
        signal: lifecycle.signal,
      })
      return () => {
        stopWatching()
        lifecycle.abort()
      }
    }),
    cleanup => Effect.sync(cleanup),
  )

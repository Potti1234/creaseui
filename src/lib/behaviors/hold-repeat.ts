import { Effect, Option, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

// Adapted from @ui-sdk/core 0.1.0-beta.13 hold.ts and repeat.ts (Apache-2.0).
export const Input = Schema.Literals([
  'mouse',
  'touch',
  'pen',
  'keyboard',
  'click',
])
export const Model = Schema.Struct({
  active: Schema.Boolean,
  held: Schema.Boolean,
  inside: Schema.Boolean,
  stopped: Schema.Boolean,
  input: Input,
  pointerId: Schema.Number,
  key: Schema.String,
  x: Schema.Number,
  y: Schema.Number,
  count: Schema.Int,
  version: Schema.Int,
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  Pressed: {
    input: Input,
    pointerId: Schema.Number,
    key: Schema.String,
    x: Schema.Number,
    y: Schema.Number,
  },
  Moved: {
    pointerId: Schema.Number,
    x: Schema.Number,
    y: Schema.Number,
    inside: Schema.Boolean,
    released: Schema.Boolean,
  },
  Released: {
    pointerId: Schema.Number,
    key: Schema.String,
    canceled: Schema.Boolean,
  },
  Canceled: {},
  Clicked: {},
  Waited: { version: Schema.Int },
  Mounted: {},
})
export type Message = typeof Message.Type
export const OutMessage = defineMessageUnion({
  Stepped: { count: Schema.Int },
  Ended: { count: Schema.Int, held: Schema.Boolean, canceled: Schema.Boolean },
})
export type OutMessage = typeof OutMessage.Type
export type Options = Readonly<{
  mode?: 'hold' | 'repeat'
  delay?: number
  repeat?: number
  tolerance?: number
  disabled?: boolean
  canStep?: boolean
}>
export const init = (): Model => ({
  active: false,
  held: false,
  inside: true,
  stopped: false,
  input: 'mouse',
  pointerId: -1,
  key: '',
  x: 0,
  y: 0,
  count: 0,
  version: 0,
})
export const Wait = Command.define('WaitHoldRepeat', {
  args: { delay: Schema.Number, version: Schema.Int },
  messages: [Message.Waited],
  execute: ({ delay, version }) =>
    Effect.sleep(`${Math.max(0, delay)} millis`).pipe(
      Effect.as(Message.Waited({ version })),
    ),
})
type Return = Update.ReturnWithOutMessage<Model, Message, OutMessage>
export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): Return => {
  const repeating = options.mode !== 'hold'
  const interval = options.repeat ?? (repeating ? 60 : 0)
  const stop = (canceled: boolean): Return =>
    model.active
      ? {
          model: { ...model, active: false, version: model.version + 1 },
          outMessage: OutMessage.Ended({
            count: model.count,
            held: model.held,
            canceled,
          }),
        }
      : { model }
  if (message._tag === 'Canceled') return stop(true)
  if (options.disabled) return stop(true)
  const step = (next: Model): Return =>
    options.canStep === false || next.stopped
      ? {
          model: { ...next, stopped: true },
        }
      : {
          model: { ...next, count: next.count + 1 },
          outMessage: OutMessage.Stepped({ count: next.count + 1 }),
        }
  switch (message._tag) {
    case 'Pressed': {
      if (model.active) return { model }
      const next = {
        ...init(),
        input: message.input,
        pointerId: message.pointerId,
        key: message.key,
        x: message.x,
        y: message.y,
        active: true,
        version: model.version + 1,
      }
      const result =
        repeating && message.input !== 'touch' && message.input !== 'pen'
          ? step(next)
          : { model: next }
      return {
        ...result,
        commands: result.model.stopped
          ? []
          : [
              Wait({
                delay: options.delay ?? (repeating ? 400 : 500),
                version: next.version,
              }),
            ],
      }
    }
    case 'Waited': {
      if (!model.active || model.stopped || message.version !== model.version)
        return { model }
      const next = { ...model, held: true }
      const result = model.inside ? step(next) : { model: next }
      return {
        ...result,
        commands:
          interval > 0 && !result.model.stopped
            ? [Wait({ delay: interval, version: model.version })]
            : [],
      }
    }
    case 'Moved':
      if (
        !model.active ||
        model.input === 'keyboard' ||
        message.pointerId !== model.pointerId
      )
        return { model }
      if (message.released) return stop(false)
      if (
        !repeating &&
        !model.held &&
        Math.hypot(message.x - model.x, message.y - model.y) >
          (options.tolerance ?? 10)
      )
        return stop(true)
      return { model: { ...model, inside: repeating ? message.inside : true } }
    case 'Released': {
      if (
        !model.active ||
        (model.input === 'keyboard'
          ? message.key !== model.key
          : message.pointerId !== model.pointerId)
      )
        return { model }
      if (
        repeating &&
        !message.canceled &&
        !model.held &&
        model.inside &&
        (model.input === 'touch' || model.input === 'pen')
      ) {
        return step({ ...model, active: false, version: model.version + 1 })
      }
      return stop(message.canceled)
    }
    case 'Clicked':
      return repeating && !model.active
        ? step({ ...init(), input: 'click', version: model.version + 1 })
        : { model }
    case 'Mounted':
      return { model }
  }
}

const eventName = 'crease-hold-repeat'
export const Observe = Mount.defineStream('ObserveHoldRepeat', {
  messages: [Message.Mounted],
  execute: ({ element }) =>
    Stream.callback<typeof Message.Mounted.Type>(() =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const doc = element.ownerDocument
            const win = doc.defaultView!
            const removers: Array<() => void> = []
            const emit = (message: Message) =>
              element.dispatchEvent(
                new CustomEvent(eventName, { detail: message }),
              )
            const on = <K extends keyof GlobalEventHandlersEventMap>(
              target: EventTarget,
              name: K,
              listener: (event: GlobalEventHandlersEventMap[K]) => void,
            ) => {
              const fn = listener as EventListener
              target.addEventListener(name, fn)
              removers.push(() => target.removeEventListener(name, fn))
            }
            on(element, 'pointerdown', event => {
              if (
                event.button !== 0 ||
                (!event.isPrimary && event.pointerType !== 'mouse') ||
                event.defaultPrevented
              )
                return
              emit(
                Message.Pressed({
                  input:
                    event.pointerType === 'touch'
                      ? 'touch'
                      : event.pointerType === 'pen'
                        ? 'pen'
                        : 'mouse',
                  pointerId: event.pointerId,
                  key: '',
                  x: event.clientX,
                  y: event.clientY,
                }),
              )
            })
            on(doc, 'pointermove', event => {
              const rect = element.getBoundingClientRect()
              emit(
                Message.Moved({
                  pointerId: event.pointerId,
                  x: event.clientX,
                  y: event.clientY,
                  inside:
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom,
                  released:
                    event.pointerType === 'mouse' && event.buttons === 0,
                }),
              )
            })
            for (const name of ['pointerleave', 'pointerenter'] as const)
              on(element, name, event =>
                emit(
                  Message.Moved({
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                    inside: name === 'pointerenter',
                    released: false,
                  }),
                ),
              )
            for (const name of ['pointerup', 'pointercancel'] as const)
              on(doc, name, event =>
                emit(
                  Message.Released({
                    pointerId: event.pointerId,
                    key: '',
                    canceled: name === 'pointercancel',
                  }),
                ),
              )
            on(element, 'keydown', event => {
              if (
                event.target !== element ||
                ![' ', 'Enter'].includes(event.key) ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey
              )
                return
              event.preventDefault()
              if (!event.repeat)
                emit(
                  Message.Pressed({
                    input: 'keyboard',
                    pointerId: -1,
                    key: event.key,
                    x: 0,
                    y: 0,
                  }),
                )
            })
            on(element, 'keyup', event => {
              if (![' ', 'Enter'].includes(event.key)) return
              event.preventDefault()
              emit(
                Message.Released({
                  pointerId: -1,
                  key: event.key,
                  canceled: false,
                }),
              )
            })
            on(doc, 'keydown', event => {
              if (event.key === 'Escape') emit(Message.Canceled())
            })
            on(element, 'blur', () => emit(Message.Canceled()))
            on(win, 'blur', () => emit(Message.Canceled()))
            on(element, 'click', event => {
              event.preventDefault()
              event.stopPropagation()
              if (event.detail === 0) emit(Message.Clicked())
            })
            on(element, 'contextmenu', event => {
              if (
                event instanceof PointerEvent &&
                event.pointerType !== 'mouse'
              )
                event.preventDefault()
            })
            const observer = new MutationObserver(() => {
              if (
                element.hasAttribute('disabled') ||
                element.getAttribute('aria-disabled') === 'true'
              )
                emit(Message.Canceled())
            })
            observer.observe(element, {
              attributes: true,
              attributeFilter: ['disabled', 'aria-disabled'],
            })
            return () => {
              observer.disconnect()
              removers.forEach(remove => remove())
            }
          }),
          cleanup => Effect.sync(cleanup),
        )
        return yield* Effect.never
      }),
    ),
})

export const attributes = <Msg>(
  h: HtmlBuilder<Msg>,
  toMessage: (message: Message) => Msg,
) => [
  h.OnMount(Mount.mapMessage(Observe(), toMessage)),
  {
    _tag: 'OnCustomEvent' as const,
    name: eventName,
    f: (event: CustomEvent<unknown>) =>
      Schema.is(Message)(event.detail)
        ? Option.some(toMessage(event.detail))
        : Option.none(),
  },
]

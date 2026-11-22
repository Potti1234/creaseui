import { Option, Schema as S, Stream } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import * as Drag from '@/lib/behaviors/drag'

export const Point = S.Struct({ x: S.Number, y: S.Number })
export type Point = typeof Point.Type
export type Axis = Readonly<{
  min?: number
  max?: number
  step?: number
  label?: string
}>
export type Options = Readonly<{
  x?: Axis
  y?: Axis
  disabled?: boolean
  rtl?: boolean
  valueText?: (value: Point) => string
}>
export const Reason = S.Literals([
  'track-press',
  'drag',
  'step-key',
  'imperative',
])
export const Model = S.Struct({
  value: Point,
  pressReason: S.Option(Reason),
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  PressedTrack: { fractions: Point },
  MovedPointer: { fractions: Point },
  ReleasedPointer: {},
  PressedKey: { key: S.String, shift: S.Boolean },
  RequestedValue: { value: Point },
})
export type Message = typeof Message.Type
export const OutMessage = defineMessageUnion({
  ChangedValue: { value: Point, reason: Reason },
  CommittedValue: { value: Point, reason: Reason },
})
export type OutMessage = typeof OutMessage.Type

export const axisOf = (axis: Axis = {}) => ({
  min: axis.min ?? 0,
  max: axis.max ?? 1,
  step: axis.step ?? 0.01,
  label: axis.label ?? 'X',
})
export const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value))

export const snap = (value: number, axis: Axis = {}): number => {
  const { min, max, step } = axisOf(axis)
  if (!(step > 0)) return clamp(value, min, max)
  const decimals = (n: number) => {
    const [mantissa = '', exponent = '0'] = String(n).toLowerCase().split('e')
    return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent))
  }
  const precision = Math.min(100, Math.max(decimals(min), decimals(step)))
  const round = (n: number) => Number(n.toFixed(precision))
  const count = (distance: number) => Number((distance / step).toPrecision(15))
  return round(
    clamp(
      round(min + Math.round(count(value - min)) * step),
      min,
      round(min + Math.floor(count(max - min)) * step),
    ),
  )
}
export const valueToFraction = (value: number, axis: Axis = {}): number => {
  const { min, max } = axisOf(axis)
  return max === min ? 0 : clamp((value - min) / (max - min))
}
export const fractionToValue = (fraction: number, axis: Axis = {}): number => {
  const { min, max } = axisOf(axis)
  return min + clamp(fraction) * (max - min)
}
export const snapPoint = (value: Point, options: Options = {}): Point => ({
  x: snap(value.x, options.x),
  y: snap(value.y, options.y),
})
export const keyToNextValue = (
  value: Point,
  key: string,
  shift = false,
  options: Options = {},
): Option.Option<Point> => {
  const x = axisOf(options.x)
  const y = axisOf(options.y)
  const times = shift ? 10 : 1
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      return Option.some(
        snapPoint(
          {
            ...value,
            x:
              value.x +
              (key === 'ArrowRight' ? 1 : -1) *
                (options.rtl ? -1 : 1) *
                x.step *
                times,
          },
          options,
        ),
      )
    case 'ArrowUp':
    case 'ArrowDown':
      return Option.some(
        snapPoint(
          {
            ...value,
            y: value.y + (key === 'ArrowUp' ? 1 : -1) * y.step * times,
          },
          options,
        ),
      )
    case 'PageUp':
    case 'PageDown':
      return Option.some(
        snapPoint(
          {
            ...value,
            y: value.y + ((key === 'PageUp' ? 1 : -1) * (y.max - y.min)) / 10,
          },
          options,
        ),
      )
    case 'Home':
      return Option.some(snapPoint({ ...value, x: x.min }, options))
    case 'End':
      return Option.some(snapPoint({ ...value, x: x.max }, options))
    default:
      return Option.none()
  }
}
export const init = (
  value: Point = { x: 0, y: 0 },
  options: Options = {},
): Model => ({
  value: snapPoint(value, options),
  pressReason: Option.none(),
})
export const reflect = (model: Model, value: Point): Model => ({
  ...model,
  value,
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>
export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  const set = (
    value: Point,
    reason: typeof Reason.Type,
    commit = false,
  ): UpdateReturn => {
    const next = snapPoint(value, options)
    const changed = next.x !== model.value.x || next.y !== model.value.y
    return {
      model: {
        ...model,
        value: next,
        pressReason:
          reason === 'track-press' || (reason === 'drag' && changed)
            ? Option.some(reason)
            : model.pressReason,
      },
      ...(changed
        ? {
            outMessage: commit
              ? OutMessage.CommittedValue({ value: next, reason })
              : OutMessage.ChangedValue({ value: next, reason }),
          }
        : {}),
    }
  }
  if (message._tag === 'ReleasedPointer')
    return Option.match(model.pressReason, {
      onNone: () => ({ model }),
      onSome: reason => ({
        model: { ...model, pressReason: Option.none() },
        ...(options.disabled
          ? {}
          : {
              outMessage: OutMessage.CommittedValue({
                value: model.value,
                reason,
              }),
            }),
      }),
    })
  if (options.disabled) return { model }
  return Message.match<UpdateReturn>(message, {
    PressedTrack: ({ fractions }) =>
      set(
        {
          x: fractionToValue(fractions.x, options.x),
          y: fractionToValue(fractions.y, options.y),
        },
        'track-press',
      ),
    MovedPointer: ({ fractions }) =>
      Option.isNone(model.pressReason)
        ? { model }
        : set(
            {
              x: fractionToValue(fractions.x, options.x),
              y: fractionToValue(fractions.y, options.y),
            },
            'drag',
          ),
    ReleasedPointer: () => ({ model }),
    PressedKey: ({ key, shift }) =>
      Option.match(keyToNextValue(model.value, key, shift, options), {
        onNone: () => ({ model }),
        onSome: value => set(value, 'step-key', true),
      }),
    RequestedValue: ({ value }) => set(value, 'imperative'),
  })
}
export const fractions = (model: Model, options: Options = {}): Point => ({
  x: valueToFraction(model.value.x, options.x),
  y: valueToFraction(model.value.y, options.y),
})
export const thumbStyle = (model: Model, options: Options = {}) => {
  const { x, y } = fractions(model, options)
  return {
    position: 'absolute',
    insetInlineStart: `${String(Math.round(x * 10000) / 100)}%`,
    top: `${String(Math.round((1 - y) * 10000) / 100)}%`,
    '--area-x': String(x),
    '--area-y': String(y),
  }
}
export const thumbAttrs = (
  model: Model,
  options: Options = {},
): Readonly<Record<string, string>> => {
  const { x, y } = fractions(model, options)
  const axis = axisOf(options.x)
  return {
    role: 'slider',
    tabindex: options.disabled ? '-1' : '0',
    'aria-roledescription': '2D slider',
    'aria-valuemin': String(axis.min),
    'aria-valuemax': String(axis.max),
    'aria-valuenow': String(model.value.x),
    'aria-valuetext':
      options.valueText?.(model.value) ??
      `${options.x?.label ?? 'X'} ${String(Math.round(x * 100))}%, ${options.y?.label ?? 'Y'} ${String(Math.round(y * 100))}%`,
    ...(options.disabled ? { 'aria-disabled': 'true' } : {}),
    'data-area-thumb': '',
  }
}
export const keyMessage = (
  key: string,
  modifiers: Readonly<{
    shiftKey: boolean
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
  }>,
): Option.Option<Message> =>
  modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey
    ? Option.none()
    : Option.map(keyToNextValue({ x: 0, y: 0 }, key), () =>
        Message.PressedKey({ key, shift: modifiers.shiftKey }),
      )

export const Pointer = Mount.defineStream('ObserveAreaPointer', {
  args: {},
  messages: [
    Message.PressedTrack,
    Message.MovedPointer,
    Message.ReleasedPointer,
  ],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : Drag.observeDrag<
          Extract<
            Message,
            { _tag: 'PressedTrack' | 'MovedPointer' | 'ReleasedPointer' }
          >
        >(element, (down, send) => {
          if (element.getAttribute('aria-disabled') === 'true') return
          const at = (event: PointerEvent): Point => {
            const rect = element.getBoundingClientRect()
            const x = rect.width
              ? clamp((event.clientX - rect.left) / rect.width)
              : 0
            return {
              x: getComputedStyle(element).direction === 'rtl' ? 1 - x : x,
              y: rect.height
                ? clamp(1 - (event.clientY - rect.top) / rect.height)
                : 0,
            }
          }
          down.preventDefault()
          element
            .querySelector<HTMLElement>('[data-area-thumb]')
            ?.focus({ preventScroll: true })
          send(Message.PressedTrack({ fractions: at(down) }))
          return {
            onMove: ({ event }) =>
              send(Message.MovedPointer({ fractions: at(event) })),
            onEnd: (event, canceled) => {
              if (!canceled)
                send(Message.MovedPointer({ fractions: at(event) }))
              send(Message.ReleasedPointer({}))
            },
          }
        }),
})

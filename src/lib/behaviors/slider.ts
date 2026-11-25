import { Function, Option, Result, Schema as S, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineTaggedUnion } from 'foldkit/schema'
import { defineView, type Reflect } from 'foldkit/submodel'
import * as Subscription from 'foldkit/subscription'

const DragState = defineTaggedUnion({
  Idle: {},
  Dragging: { originValue: S.Number },
})

export const Model = S.Struct({
  id: S.String,
  min: S.Number,
  max: S.Number,
  step: S.Number,
  dragState: DragState,
})
export type Model = typeof Model.Type

const Navigation = S.Literals([
  'StepDecrement',
  'StepIncrement',
  'PageDecrement',
  'PageIncrement',
  'Min',
  'Max',
])

export const Message = defineMessageUnion({
  PressedThumb: { originValue: S.Number },
  PressedPointer: { value: S.Number, originValue: S.Number },
  MovedDragPointer: { value: S.Number },
  ReleasedDragPointer: {},
  CancelledDrag: {},
  PressedKeyboardNavigation: { direction: Navigation, value: S.Number },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ChangedValue: { value: S.Number },
})
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  id: string
  min: number
  max: number
  step: number
}>

export type NormalizedRange = Readonly<{
  min: number
  max: number
  step: number
}>

export const normalizeRange = (
  firstBound: number,
  secondBound: number,
  requestedStep = 1,
): NormalizedRange => ({
  min: Math.min(firstBound, secondBound),
  max: Math.max(firstBound, secondBound),
  step: Number.isFinite(requestedStep) && requestedStep > 0 ? requestedStep : 1,
})

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(Number.isFinite(value) ? value : min, max))

const decimalPlaces = (value: number): number => {
  const [mantissa = '', exponent = '0'] = value.toString().split('e')
  return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent))
}

export const snapRangeValue = (
  value: number,
  range: NormalizedRange,
): number => {
  const snapped =
    range.min + Math.round((value - range.min) / range.step) * range.step
  const precision = Math.min(
    100,
    Math.max(decimalPlaces(range.min), decimalPlaces(range.step)),
  )
  return clamp(Number(snapped.toFixed(precision)), range.min, range.max)
}

export const normalizeRangeValues = (
  values: readonly [number, number],
  range: NormalizedRange,
): readonly [number, number] => {
  const first = snapRangeValue(values[0], range)
  const second = snapRangeValue(values[1], range)
  return [first, second]
}

export const updateRangeValue = (
  values: readonly [number, number],
  index: 0 | 1,
  nextValue: number,
  range: NormalizedRange,
): readonly [number, number] => {
  const next = snapRangeValue(nextValue, range)
  return index === 0 ? [next, values[1]] : [values[0], next]
}

export const normalizeMultiValues = (
  values: readonly number[],
  range: NormalizedRange,
): readonly number[] => values.map(value => snapRangeValue(value, range))

export const updateMultiValue = (
  values: readonly number[],
  index: number,
  nextValue: number,
  range: NormalizedRange,
): readonly number[] => {
  const next = snapRangeValue(nextValue, range)
  return values.map((value, i) => (i === index ? next : value))
}

export const init = ({ id, min, max, step }: InitConfig): Model => ({
  id,
  ...normalizeRange(min, max, step),
  dragState: DragState.Idle(),
})

export const snapAndClamp = (
  value: number,
  min: number,
  max: number,
  step: number,
): number => snapRangeValue(value, normalizeRange(min, max, step))

export const fractionOfValue = (
  value: number,
  min: number,
  max: number,
): number => (max <= min ? 0 : clamp((value - min) / (max - min), 0, 1))

export const reflectRange: Reflect<
  Model,
  Readonly<{ min: number; max: number }>
> = Function.dual(
  2,
  (model: Model, range: Readonly<{ min: number; max: number }>): Model => ({
    ...model,
    ...normalizeRange(range.min, range.max, model.step),
  }),
)

const navigationSteps = {
  StepDecrement: -1,
  StepIncrement: 1,
  PageDecrement: -10,
  PageIncrement: 10,
} as const

export const update = (
  model: Model,
  message: Message,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> =>
  updateThumb(model, message, false)

const updateThumb = (
  model: Model,
  message: Message,
  mirrored: boolean,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
  const { dragState, min, max, step } = model
  const mirror = (value: number) => (mirrored ? min + max - value : value)
  // Snap on the logical grid even when the display axis is reversed.
  const snap = (value: number) => mirror(snapRangeValue(mirror(value), model))
  const changed = (next: Model, value: number) => ({
    model: next,
    outMessage: OutMessage.ChangedValue({ value }),
  })
  switch (message._tag) {
    case 'PressedThumb':
    case 'PressedPointer': {
      if (dragState._tag === 'Dragging') return { model }
      const next = {
        ...model,
        dragState: DragState.Dragging({ originValue: message.originValue }),
      }
      if (message._tag === 'PressedThumb') return { model: next }
      const value = snap(message.value)
      return value === message.originValue
        ? { model: next }
        : changed(next, value)
    }
    case 'MovedDragPointer':
      return dragState._tag === 'Dragging'
        ? changed(model, snap(message.value))
        : { model }
    case 'ReleasedDragPointer':
      return dragState._tag === 'Dragging'
        ? { model: { ...model, dragState: DragState.Idle() } }
        : { model }
    case 'CancelledDrag':
      return dragState._tag === 'Dragging'
        ? changed(
            { ...model, dragState: DragState.Idle() },
            dragState.originValue,
          )
        : { model }
    case 'PressedKeyboardNavigation': {
      const { value, direction } = message
      const next =
        direction === 'Min'
          ? min
          : direction === 'Max'
            ? max
            : snap(value + navigationSteps[direction] * step)
      return next === value ? { model } : changed(model, next)
    }
  }
}

const findTrack = (id: string, root: Document | ShadowRoot): Element | null =>
  root.querySelector(`[data-slider-track-id="${CSS.escape(id)}"]`)

export const valueFromPointer = (
  clientX: number,
  clientY: number,
  track: Element,
  min: number,
  max: number,
): number => {
  const vertical =
    track.getAttribute('data-orientation') === 'vertical' ||
    track.hasAttribute('data-vertical')
  const rect = track.getBoundingClientRect()
  const size = vertical ? rect.height : rect.width
  if (size === 0) return min
  const position = vertical ? rect.bottom - clientY : clientX - rect.left
  const id = track.getAttribute('data-slider-track-id')
  const thumbRect =
    id !== null && track.getAttribute('data-thumb-alignment') === 'edge'
      ? (track.getRootNode() as Document | ShadowRoot)
          .getElementById(`${id}-thumb`)
          ?.getBoundingClientRect()
      : undefined
  const inset =
    thumbRect === undefined
      ? 0
      : (vertical ? thumbRect.height : thumbRect.width) / 2
  const travel = size - 2 * inset
  const fraction = travel > 0 ? (position - inset) / travel : position / size
  return min + clamp(fraction, 0, 1) * (max - min)
}

const ownerDocument = (root: Document | ShadowRoot): Document =>
  root.nodeType === 9 ? (root as Document) : (root as ShadowRoot).ownerDocument

export const subscriptionsForRoot = (
  getTrackRoot: () => Document | ShadowRoot,
) =>
  Subscription.make<Model, Message>()(entry => ({
    dragPointer: entry(
      { active: S.Boolean, id: S.String, min: S.Number, max: S.Number },
      {
        modelToDependencies: ({ dragState, id, min, max }) => ({
          active: dragState._tag === 'Dragging',
          id,
          min,
          max,
        }),
        dependenciesToStream: ({ active, id, min, max }) => {
          if (!active) return Stream.empty
          const root = getTrackRoot()
          const owner = ownerDocument(root)
          const moves = Stream.fromEventListener<PointerEvent>(
            owner,
            'pointermove',
          ).pipe(
            Stream.filterMap(event => {
              const track = findTrack(id, root)
              return track === null
                ? Result.fail(undefined)
                : Result.succeed(
                    Message.MovedDragPointer({
                      value: valueFromPointer(
                        event.clientX,
                        event.clientY,
                        track,
                        min,
                        max,
                      ),
                    }),
                  )
            }),
          )
          const releases = Stream.fromEventListener(owner, 'pointerup').pipe(
            Stream.map(() => Message.ReleasedDragPointer()),
          )
          const cancels = Stream.fromEventListener(owner, 'pointercancel').pipe(
            Stream.map(() => Message.ReleasedDragPointer()),
          )
          return Stream.merge(moves, Stream.merge(releases, cancels))
        },
      },
    ),
    dragEscape: entry(
      { active: S.Boolean },
      {
        modelToDependencies: model => ({
          active: model.dragState._tag === 'Dragging',
        }),
        dependenciesToStream: ({ active }) =>
          active
            ? Stream.fromEventListener<KeyboardEvent>(
                ownerDocument(getTrackRoot()),
                'keydown',
              ).pipe(
                Stream.filter(event => event.key === 'Escape'),
                Stream.map(() => Message.CancelledDrag()),
              )
            : Stream.empty,
      },
    ),
  }))

export const subscriptions = subscriptionsForRoot(() => document)

export const Orientation = S.Literals(['Horizontal', 'Vertical'])
export type Orientation = typeof Orientation.Type
export const ThumbAlignment = S.Literals(['Center', 'Edge'])
export type ThumbAlignment = typeof ThumbAlignment.Type

export type SliderAttributes = Readonly<
  Record<
    'root' | 'track' | 'filledTrack' | 'thumb' | 'label' | 'hiddenInput',
    readonly ChildAttribute[]
  >
>

export type ViewInputs = Readonly<{
  value: number
  toView: (attributes: SliderAttributes) => Html
  orientation?: Orientation
  thumbAlignment?: ThumbAlignment
  thumbSize?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  formatValue?: (value: number) => string
  isDisabled?: boolean
  isReadOnly?: boolean
  name?: string
  mirrored?: boolean
  logicalValue?: number
  getTrackRoot?: () => Document | ShadowRoot
}>

const navigationKeys: ReadonlyMap<string, typeof Navigation.Type> = new Map([
  ['ArrowLeft', 'StepDecrement'],
  ['ArrowDown', 'StepDecrement'],
  ['ArrowRight', 'StepIncrement'],
  ['ArrowUp', 'StepIncrement'],
  ['PageDown', 'PageDecrement'],
  ['PageUp', 'PageIncrement'],
  ['Home', 'Min'],
  ['End', 'Max'],
])

const reverseNavigation = {
  StepDecrement: 'StepIncrement',
  StepIncrement: 'StepDecrement',
  PageDecrement: 'PageIncrement',
  PageIncrement: 'PageDecrement',
  Min: 'Max',
  Max: 'Min',
} as const

export const view = defineView<Model, Message, ViewInputs>(
  (model, inputs, h) => {
    const {
      value,
      isDisabled,
      isReadOnly,
      name,
      formatValue,
      mirrored = false,
    } = inputs
    const { id, min, max } = model
    const logicalValue = inputs.logicalValue ?? value
    const vertical = inputs.orientation === 'Vertical'
    const orientation = vertical ? 'vertical' : 'horizontal'
    const edge = inputs.thumbAlignment === 'Edge'
    const thumbSize = inputs.thumbSize ?? '0.75rem'
    const fraction = fractionOfValue(value, min, max)
    const percent = `${Math.round(fraction * 10000) / 100}%`
    const thumbPosition = edge
      ? `calc((100% - ${thumbSize}) * ${fraction})`
      : percent
    const fillSize = edge
      ? `calc(${thumbPosition} + ${thumbSize} / 2)`
      : percent
    const labelId = `${id}-label`
    const interactive = !isDisabled && !isReadOnly
    const state = [
      ...(model.dragState._tag === 'Dragging'
        ? [h.DataAttribute('dragging', '')]
        : []),
      ...(isDisabled ? [h.DataAttribute('disabled', '')] : []),
      ...(isReadOnly ? [h.DataAttribute('readonly', '')] : []),
    ]
    const axis = [
      h.DataAttribute('orientation', orientation),
      h.DataAttribute(orientation, ''),
    ]
    return inputs.toView({
      root: childAttributes([
        h.DataAttribute('slider-id', id),
        ...axis,
        ...state,
      ]),
      track: childAttributes([
        h.DataAttribute('slider-track-id', id),
        h.DataAttribute('thumb-alignment', edge ? 'edge' : 'center'),
        h.Style({ position: 'relative', touchAction: 'none' }),
        ...axis,
        ...state,
        ...(interactive
          ? [
              h.OnPointerDown(
                (_type, button, _x, _y, _time, clientX, clientY) => {
                  if (button !== 0) return Option.none()
                  const track = findTrack(
                    id,
                    inputs.getTrackRoot?.() ?? document,
                  )
                  return track === null
                    ? Option.none()
                    : Option.some(
                        Message.PressedPointer({
                          value: valueFromPointer(
                            clientX,
                            clientY,
                            track,
                            min,
                            max,
                          ),
                          originValue: value,
                        }),
                      )
                },
              ),
            ]
          : []),
      ]),
      filledTrack: childAttributes([
        h.Style({
          position: 'absolute',
          pointerEvents: 'none',
          ...(vertical
            ? {
                bottom: '0',
                left: '0',
                right: '0',
                height: fillSize,
                width: '100%',
              }
            : { left: '0', top: '0', bottom: '0', width: fillSize }),
        }),
        ...state,
      ]),
      thumb: childAttributes([
        h.Id(`${id}-thumb`),
        h.Role('slider'),
        h.Tabindex(0),
        h.AriaOrientation(orientation),
        h.AriaValuemin(min),
        h.AriaValuemax(max),
        h.AriaValuenow(logicalValue),
        inputs.ariaLabel === undefined
          ? h.AriaLabelledBy(inputs.ariaLabelledBy ?? labelId)
          : h.AriaLabel(inputs.ariaLabel),
        ...(formatValue === undefined
          ? []
          : [h.AriaValuetext(formatValue(logicalValue))]),
        ...(isDisabled ? [h.AriaDisabled(true)] : []),
        ...(isReadOnly ? [h.AriaReadonly(true)] : []),
        h.Style({
          position: 'absolute',
          touchAction: 'none',
          ...(vertical
            ? {
                bottom: thumbPosition,
                left: '50%',
                transform: edge ? 'translateX(-50%)' : 'translate(-50%, 50%)',
              }
            : {
                left: thumbPosition,
                ...(edge ? {} : { transform: 'translateX(-50%)' }),
              }),
        }),
        ...state,
        ...(interactive
          ? [
              h.OnPointerDown((_type, button) =>
                button === 0
                  ? Option.some(Message.PressedThumb({ originValue: value }))
                  : Option.none(),
              ),
              h.OnKeyDownPreventDefault(key => {
                const direction = navigationKeys.get(key)
                if (direction === undefined) return Option.none()
                const useLogicalDirection =
                  mirrored && key !== 'ArrowLeft' && key !== 'ArrowRight'
                return Option.some(
                  Message.PressedKeyboardNavigation({
                    direction: useLogicalDirection
                      ? reverseNavigation[direction]
                      : direction,
                    value,
                  }),
                )
              }),
            ]
          : []),
      ]),
      label: childAttributes([h.Id(labelId)]),
      hiddenInput: childAttributes(
        name === undefined
          ? []
          : [h.Type('hidden'), h.Name(name), h.Value(String(logicalValue))],
      ),
    })
  },
)

export const MultiMessage = defineMessageUnion({
  GotThumbMessage: { index: S.Number, message: Message },
  PressedTrack: {
    index: S.Number,
    value: S.Number,
    originValue: S.Number,
  },
})
export type MultiMessage = typeof MultiMessage.Type

export const MultiOutMessage = defineMessageUnion({
  ChangedThumbValue: { index: S.Number, value: S.Number },
})
export type MultiOutMessage = typeof MultiOutMessage.Type

export const MultiModel = S.Struct({
  id: S.String,
  min: S.Number,
  max: S.Number,
  step: S.Number,
  mirrored: S.Boolean,
  thumbs: S.Array(Model),
})
export type MultiModel = typeof MultiModel.Type

type MultiUpdate = Update.ReturnWithOutMessage<
  MultiModel,
  MultiMessage,
  MultiOutMessage
>

export const initMulti = (
  config: Readonly<{
    id: string
    thumbs: number
    min: number
    max: number
    step?: number
    mirrored?: boolean
  }>,
): MultiModel => {
  const range = normalizeRange(config.min, config.max, config.step)
  return {
    id: config.id,
    min: range.min,
    max: range.max,
    step: range.step,
    mirrored: config.mirrored ?? false,
    thumbs: Array.from({ length: Math.max(1, config.thumbs) }, (_, index) =>
      init({
        id: `${config.id}-thumb-${String(index)}`,
        min: range.min,
        max: range.max,
        step: range.step,
      }),
    ),
  }
}

export const reflectMultiRange = (
  model: MultiModel,
  range: Readonly<{ min: number; max: number }>,
): MultiModel => ({
  ...model,
  ...normalizeRange(range.min, range.max, model.step),
  thumbs: model.thumbs.map(thumb => reflectRange(thumb, range)),
})

/** The value the primitive layer works in: identity normally, mirrored across
 * the range when `mirrored` so thumbs, drags, and key presses stay
 * left-to-right underneath. */
export const toThumbValue = (model: MultiModel, value: number): number =>
  model.mirrored ? model.min + model.max - value : value

const liftThumb = (
  model: MultiModel,
  index: number,
  inner: Message,
): MultiUpdate => {
  const thumb = model.thumbs[index]
  if (thumb === undefined) return { model }
  const next = updateThumb(thumb, inner, model.mirrored)
  return {
    model: {
      ...model,
      thumbs: model.thumbs.map((t, i) => (i === index ? next.model : t)),
    },
    ...(next.commands === undefined
      ? {}
      : {
          commands: Command.mapMessages(next.commands, message =>
            MultiMessage.GotThumbMessage({ index, message }),
          ),
        }),
    ...(next.outMessage === undefined
      ? {}
      : {
          outMessage: MultiOutMessage.ChangedThumbValue({
            index,
            value: model.mirrored
              ? model.min + model.max - next.outMessage.value
              : next.outMessage.value,
          }),
        }),
  }
}

export const updateMulti = (
  model: MultiModel,
  message: MultiMessage,
): MultiUpdate => {
  switch (message._tag) {
    case 'GotThumbMessage':
      return liftThumb(model, message.index, message.message)
    case 'PressedTrack':
      return liftThumb(
        model,
        message.index,
        Message.PressedPointer({
          value: message.value,
          originValue: message.originValue,
        }),
      )
  }
}

const FALLBACK_THUMB = init({
  id: 'crease-multi-slider-fallback-thumb',
  min: 0,
  max: 1,
  step: 1,
})

/** Aggregates each thumb's drag subscriptions under a parent model. The thumb
 * count is fixed by the model the parent creates, so it is part of the call. */
export const multiThumbSubscriptions = <ParentModel, Msg>(
  config: Readonly<{
    id: string
    thumbCount: number
    toChildModel: (model: ParentModel) => MultiModel
    toParentMessage: (message: MultiMessage) => Msg
  }>,
): Subscription.Subscriptions<ParentModel, Msg> =>
  Subscription.aggregate<ParentModel, Msg>()(
    ...Array.from({ length: Math.max(0, config.thumbCount) }, (_, index) =>
      Subscription.lift({
        [`${config.id}Thumb${String(index)}Pointer`]: subscriptions.dragPointer,
        [`${config.id}Thumb${String(index)}Escape`]: subscriptions.dragEscape,
      })<ParentModel, Msg>({
        toChildModel: parentModel =>
          config.toChildModel(parentModel).thumbs[index] ??
          config.toChildModel(parentModel).thumbs[0] ??
          FALLBACK_THUMB,
        toParentMessage: message =>
          config.toParentMessage(
            MultiMessage.GotThumbMessage({ index, message }),
          ),
      }),
    ),
  )

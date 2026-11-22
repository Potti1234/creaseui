// Adapted from @ui-sdk/core 0.1.0-beta.13 (Apache-2.0), Copyright 2026 Vercel, Inc.
import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'

import { observePicker } from './scroll-picker-dom'

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export const pickerPosition = (
  centers: readonly number[],
  at: number,
): number => {
  const last = centers.length - 1
  if (last < 1) return 0
  let low = 0
  let high = last - 1
  while (low < high) {
    const middle = (low + high + 1) >> 1
    if (centers[middle]! <= at) low = middle
    else high = middle - 1
  }
  const span = centers[low + 1]! - centers[low]!
  return span > 0 ? low + (at - centers[low]!) / span : low
}

export const nearestEnabled = (
  position: number,
  count: number,
  isDisabled: (index: number) => boolean,
): number => {
  const start = clamp(Math.round(position), 0, count - 1)
  const lean = position >= start ? 1 : -1
  for (let distance = 0; distance < count; distance++) {
    const near = start + distance * lean
    if (near >= 0 && near < count && !isDisabled(near)) return near
    const far = start - distance * lean
    if (far >= 0 && far < count && !isDisabled(far)) return far
  }
  return -1
}

export const pageSize = (
  centers: readonly number[],
  viewport: number,
): number => {
  const spacing =
    centers.length < 2
      ? 0
      : (centers.at(-1)! - centers[0]!) / (centers.length - 1)
  return spacing > 0 ? Math.max(1, Math.round(viewport / spacing) - 1) : 1
}
export const pageTarget = (
  from: number,
  delta: number,
  count: number,
  size: number,
): number => (count === 0 ? -1 : clamp(from + delta * size, 0, count - 1))
export const projectRelease = (
  offset: number,
  velocity: number,
  maxScroll: number,
): number => clamp(offset - (velocity * 0.998) / (1 - 0.998), 0, maxScroll)

export const Orientation = Schema.Literals(['vertical', 'horizontal'])
export type Orientation = typeof Orientation.Type
export const Phase = Schema.Literals([
  'idle',
  'scrolling',
  'dragging',
  'following',
])
export const Reason = Schema.Literals(['scroll', 'settle', 'page', 'drag'])
export const Model = Schema.Struct({
  id: Schema.String,
  orientation: Orientation,
  position: Schema.Number,
  maybeSelectedIndex: Schema.Option(Schema.Int),
  phase: Phase,
  centers: Schema.Array(Schema.Number),
  disabled: Schema.Array(Schema.Int),
  viewport: Schema.Number,
  maxScroll: Schema.Number,
  offset: Schema.Number,
  maybeTarget: Schema.Option(Schema.Number),
})
export type Model = typeof Model.Type
export const Message = defineMessageUnion({
  Measured: {
    centers: Schema.Array(Schema.Number),
    disabled: Schema.Array(Schema.Int),
    viewport: Schema.Number,
    maxScroll: Schema.Number,
    orientation: Orientation,
    offset: Schema.Number,
  },
  Scrolled: { position: Schema.Number, offset: Schema.Number },
  Settled: {},
  Interrupted: {},
  StartedDrag: {},
  Dragged: { offset: Schema.Number },
  EndedDrag: { velocity: Schema.Number, offset: Schema.Number },
  Paged: { delta: Schema.Int },
  ChangedSelection: { index: Schema.Int },
  CompletedScroll: {},
})
export type Message = typeof Message.Type
export type Observation = Exclude<Message, { _tag: 'CompletedScroll' }>
export const OutMessage = defineMessageUnion({
  Selected: { index: Schema.Int, reason: Reason },
})
export type OutMessage = typeof OutMessage.Type
export const init = (
  config: Readonly<{ id: string; orientation?: Orientation }>,
): Model => ({
  id: config.id,
  orientation: config.orientation ?? 'vertical',
  position: 0,
  maybeSelectedIndex: Option.none(),
  phase: 'idle',
  centers: [],
  disabled: [],
  viewport: 0,
  maxScroll: 0,
  offset: 0,
  maybeTarget: Option.none(),
})

export const ScrollTo = Command.define('ScrollPickerScrollTo', {
  args: { id: Schema.String, offset: Schema.Number, animate: Schema.Boolean },
  messages: [Message.CompletedScroll],
  execute: ({ id, offset, animate }) =>
    Effect.sync(() => {
      const list = document.getElementById(id)
      if (!(list instanceof HTMLElement)) return
      const vertical = list.dataset.pickerOrientation !== 'horizontal'
      const rtl = !vertical && getComputedStyle(list).direction === 'rtl'
      const reduced =
        list.ownerDocument.defaultView?.matchMedia?.(
          '(prefers-reduced-motion: reduce)',
        ).matches ?? false
      const max = vertical
        ? list.scrollHeight - list.clientHeight
        : list.scrollWidth - list.clientWidth
      const to = clamp(offset, 0, Math.max(0, max))
      list.dispatchEvent(
        new CustomEvent('scroll-picker-scroll', { detail: { animate } }),
      )
      list.scrollTo({
        ...(vertical ? { top: to } : { left: rtl ? -to : to }),
        behavior: animate && !reduced ? 'smooth' : 'instant',
      })
    }).pipe(Effect.as(Message.CompletedScroll())),
})
export const FocusItem = Command.define('ScrollPickerFocusItem', {
  args: { id: Schema.String, index: Schema.Int },
  messages: [Message.CompletedScroll],
  execute: ({ id, index }) =>
    Effect.sync(() => {
      const list = document.getElementById(id)
      const items = list?.querySelectorAll<HTMLElement>('[role="option"]')
      const item = items?.[index]
      if (
        item !== undefined &&
        item.hasAttribute('tabindex') &&
        [...(items ?? [])].some(each => each === document.activeElement)
      )
        item.focus({ preventScroll: true })
    }).pipe(Effect.as(Message.CompletedScroll())),
})
type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>
const centerOn = (
  model: Model,
  index: number,
  animate = true,
): UpdateReturn => {
  const center = model.centers[index]
  if (center === undefined) return { model }
  const offset = clamp(center - model.viewport / 2, 0, model.maxScroll)
  return {
    model: { ...model, phase: 'following', maybeTarget: Option.some(offset) },
    commands: [ScrollTo({ id: model.id, offset, animate })],
  }
}
const select = (
  model: Model,
  index: number,
  reason: typeof Reason.Type,
): UpdateReturn =>
  Option.contains(model.maybeSelectedIndex, index)
    ? { model }
    : {
        model: { ...model, maybeSelectedIndex: Option.some(index) },
        outMessage: OutMessage.Selected({ index, reason }),
        commands: [FocusItem({ id: model.id, index })],
      }
const settle = (
  model: Model,
  at: number,
  reason: typeof Reason.Type,
): UpdateReturn => {
  const index = nearestEnabled(at, model.centers.length, each =>
    model.disabled.includes(each),
  )
  if (index === -1)
    return { model: { ...model, phase: 'idle', maybeTarget: Option.none() } }
  const next = select(model, index, reason)
  const centered = centerOn(next.model, index)
  return {
    ...centered,
    commands: [...(next.commands ?? []), ...(centered.commands ?? [])],
    ...(next.outMessage === undefined ? {} : { outMessage: next.outMessage }),
  }
}
export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    Measured: ({
      centers,
      disabled,
      viewport,
      maxScroll,
      orientation,
      offset,
    }) => {
      const next = {
        ...model,
        centers,
        disabled,
        viewport,
        maxScroll,
        orientation,
        offset,
        position: pickerPosition(centers, offset + viewport / 2),
      }
      return model.phase === 'idle' && Option.isSome(model.maybeSelectedIndex)
        ? centerOn(next, model.maybeSelectedIndex.value, false)
        : { model: next }
    },
    Scrolled: ({ position, offset }) => {
      const next = { ...model, position, offset }
      if (model.phase === 'following' || model.centers.length === 0)
        return { model: next }
      const index = clamp(Math.round(position), 0, model.centers.length - 1)
      const scrolling = {
        ...next,
        phase:
          model.phase === 'dragging'
            ? ('dragging' as const)
            : ('scrolling' as const),
      }
      return model.disabled.includes(index)
        ? { model: scrolling }
        : select(scrolling, index, 'scroll')
    },
    Settled: () =>
      model.phase === 'dragging'
        ? { model }
        : model.phase === 'following'
          ? { model: { ...model, phase: 'idle', maybeTarget: Option.none() } }
          : settle(model, model.position, 'settle'),
    Interrupted: () => ({
      model: {
        ...model,
        phase: model.phase === 'following' ? 'idle' : model.phase,
        maybeTarget: Option.none(),
      },
    }),
    StartedDrag: () => ({
      model: { ...model, phase: 'dragging', maybeTarget: Option.none() },
    }),
    Dragged: ({ offset }) => ({
      model,
      commands: [ScrollTo({ id: model.id, offset, animate: false })],
    }),
    EndedDrag: ({ velocity, offset }) =>
      settle(
        model,
        pickerPosition(
          model.centers,
          projectRelease(offset, velocity, model.maxScroll) +
            model.viewport / 2,
        ),
        'drag',
      ),
    Paged: ({ delta }) =>
      model.centers.length < 2
        ? { model }
        : settle(
            model,
            pageTarget(
              Option.getOrElse(model.maybeSelectedIndex, () =>
                Math.round(model.position),
              ),
              delta,
              model.centers.length,
              pageSize(model.centers, model.viewport),
            ),
            'page',
          ),
    ChangedSelection: ({ index }) =>
      index < 0 ||
      index >= model.centers.length ||
      model.phase === 'scrolling' ||
      model.phase === 'dragging' ||
      Option.contains(model.maybeSelectedIndex, index)
        ? { model }
        : centerOn(
            { ...model, maybeSelectedIndex: Option.some(index) },
            index,
            Option.isSome(model.maybeSelectedIndex),
          ),
    CompletedScroll: () => ({ model }),
  })

export const ObservePicker = Mount.defineStream('ObserveScrollPicker', {
  messages: [
    Message.Measured,
    Message.Scrolled,
    Message.Settled,
    Message.Interrupted,
    Message.StartedDrag,
    Message.Dragged,
    Message.EndedDrag,
    Message.Paged,
    Message.ChangedSelection,
  ],
  execute: ({ element }) =>
    Stream.callback<Observation>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() =>
            element instanceof HTMLElement
              ? observePicker(element, message =>
                  Queue.offerUnsafe(queue, message),
                )
              : () => {},
          ),
          cleanup => Effect.sync(cleanup),
        )
        return yield* Effect.never
      }),
    ),
})
export type ViewInputs = Readonly<{
  count: number
  toView: (
    parts: Readonly<{
      attributes: ReadonlyArray<ChildAttribute>
      items: ReadonlyArray<
        Readonly<{ index: number; attributes: ReadonlyArray<ChildAttribute> }>
      >
    }>,
  ) => Html
}>
export const itemId = (id: string, index: number): string =>
  `${id}-item-${index}`
export const create = () => ({
  update,
  view: defineView<Model, Message, ViewInputs>((model, inputs, h) =>
    inputs.toView({
      attributes: childAttributes([
        h.Id(model.id),
        h.DataAttribute('picker-orientation', model.orientation),
        h.OnMount(ObservePicker()),
      ]),
      items: Array.from({ length: inputs.count }, (_, index) => ({
        index,
        attributes: childAttributes([h.Id(itemId(model.id, index))]),
      })),
    }),
  ),
})
export const view = create().view

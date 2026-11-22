import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import * as Render from 'foldkit/render'
import { defineView, type View } from 'foldkit/submodel'

import * as Drag from './drag'
import { rubberBand } from './rubber-band'
import * as Velocity from './velocity'

/** Euclidean pointer travel in CSS pixels before a swipe can begin. */
export const SWIPE_PROMOTION_SLOP = 8

/** Release speed magnitude in pixels per millisecond that counts as a flick. */
export const SWIPE_FLICK_VELOCITY = 0.3

/** Fraction of the row width that arms an enabled full-swipe action. */
export const DEFAULT_FULL_SWIPE_FRACTION = 0.6

export const Side = Schema.Literals(['start', 'end'])
export type Side = typeof Side.Type

export const Open = Schema.Struct({ key: Schema.String, side: Side })

export const Geometry = Schema.Struct({
  width: Schema.Finite,
  start: Schema.Finite,
  end: Schema.Finite,
  rtl: Schema.Boolean,
})
export type Geometry = typeof Geometry.Type

const Pointer = Schema.Struct({
  id: Schema.Int,
  key: Schema.String,
  x: Schema.Finite,
  y: Schema.Finite,
  from: Schema.Finite,
  rejected: Schema.Boolean,
  velocity: Velocity.Model,
})

export const Model = Schema.Struct({
  id: Schema.String,
  open: Schema.Option(Open),
  draft: Schema.Option(
    Schema.Struct({
      key: Schema.String,
      x: Schema.Finite,
      full: Schema.Boolean,
    }),
  ),
  pointer: Schema.Option(Pointer),
  rows: Schema.Record(Schema.String, Geometry),
  version: Schema.Int,
  pending: Schema.Option(
    Schema.Struct({
      ...Open.fields,
      version: Schema.Int,
      settle: Schema.Option(Open),
    }),
  ),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  MeasuredRow: { key: Schema.String, geometry: Geometry },
  PressedRow: {
    key: Schema.String,
    pointerId: Schema.Int,
    x: Schema.Finite,
    y: Schema.Finite,
    time: Schema.Finite,
  },
  MovedPointer: {
    pointerId: Schema.Int,
    x: Schema.Finite,
    y: Schema.Finite,
    time: Schema.Finite,
  },
  ReleasedPointer: { pointerId: Schema.Int, time: Schema.Finite },
  CancelledPointer: { pointerId: Schema.Int, time: Schema.Finite },
  CancelledSwipe: {},
  PressedOutside: {},
  PressedKey: {
    key: Schema.String,
    pressedKey: Schema.String,
    index: Schema.Int,
    count: Schema.Int,
  },
  ResolvedFullSwipe: { version: Schema.Int, accepted: Schema.Boolean },
  CompletedFocus: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  RequestedFullSwipe: { ...Open.fields, version: Schema.Int },
})
export type OutMessage = typeof OutMessage.Type

export type Options = Readonly<{
  disabled?: (key: string) => boolean
  fullSwipeEnabled?: (key: string, side: Side) => boolean
  fullSwipe?: number
}>

type Result = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const init = (id: string): Model => ({
  id,
  open: Option.none(),
  draft: Option.none(),
  pointer: Option.none(),
  rows: {},
  version: 0,
  pending: Option.none(),
})

const emptyGeometry: Geometry = { width: 0, start: 0, end: 0, rtl: false }

const geometry = (model: Model, key: string): Geometry =>
  Object.hasOwn(model.rows, key)
    ? (model.rows[key] ?? emptyGeometry)
    : emptyGeometry

const isMeasured = (row: Geometry): boolean =>
  Number.isFinite(row.width) && row.width > 0

const sign = (row: Geometry, side: Side) =>
  (side === 'start') !== row.rtl ? 1 : -1

const sideOf = (row: Geometry, x: number): Side =>
  x > 0 !== row.rtl ? 'start' : 'end'

export const offset = (model: Model, key: string): number => {
  const row = geometry(model, key)
  if (!isMeasured(row)) return 0
  if (Option.isSome(model.draft) && model.draft.value.key === key)
    return model.draft.value.x
  if (Option.isSome(model.open) && model.open.value.key === key) {
    return sign(row, model.open.value.side) * row[model.open.value.side]
  }
  return 0
}

const Focus = Command.define('FocusSwipeAction', {
  args: {
    id: Schema.String,
    key: Schema.String,
    side: Schema.Option(Side),
    index: Schema.Int,
  },
  messages: [Message.CompletedFocus],
  execute: ({ id, key, side, index }) =>
    Render.afterCommit.pipe(
      Effect.andThen(
        Effect.sync(() => {
          const surface = document.getElementById(id)
          const row = Array.from(
            surface?.querySelectorAll<HTMLElement>('[data-swipe-key]') ?? [],
          ).find(element => element.dataset.swipeKey === key)
          if (Option.isNone(side)) row?.focus()
          else {
            const actions = row?.querySelector<HTMLElement>(
              `[data-side="${side.value}"]`,
            )
            focusableActions(actions)[index]?.focus()
          }
          return Message.CompletedFocus()
        }),
      ),
    ),
})

export const close = (model: Model, focus = false): Result => ({
  model: {
    ...model,
    open: Option.none(),
    draft: Option.none(),
    pointer: Option.none(),
    pending: Option.none(),
  },
  ...(focus && Option.isSome(model.open)
    ? {
        commands: [
          Focus({
            id: model.id,
            key: model.open.value.key,
            side: Option.none(),
            index: 0,
          }),
        ],
      }
    : {}),
})

export const show = (
  model: Model,
  key: string,
  side: Side,
  options: Options = {},
  focus = false,
): Result =>
  options.disabled?.(key) ||
  !isMeasured(geometry(model, key)) ||
  geometry(model, key)[side] <= 0
    ? { model }
    : {
        model: { ...close(model).model, open: Option.some({ key, side }) },
        ...(focus
          ? {
              commands: [
                Focus({ id: model.id, key, side: Option.some(side), index: 0 }),
              ],
            }
          : {}),
      }

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): Result => {
  const finish = (
    pointerId: number,
    time: number,
    canceled: boolean,
  ): Result => {
    if (Option.isNone(model.pointer) || model.pointer.value.id !== pointerId)
      return { model }
    const pointer = model.pointer.value
    if (options.disabled?.(pointer.key)) return close(model)
    if (Option.isNone(model.draft)) {
      if (!canceled && pointer.from !== 0 && !pointer.rejected)
        return close(model)
      return { model: { ...model, pointer: Option.none() } }
    }
    const draft = model.draft.value
    const row = geometry(model, draft.key)
    if (!isMeasured(row)) return close(model)
    const side = sideOf(row, draft.x)
    const speed = canceled ? 0 : Velocity.velocity(pointer.velocity, time)
    const opening =
      Math.abs(speed) >= SWIPE_FLICK_VELOCITY
        ? Math.sign(speed) === Math.sign(draft.x)
        : Math.abs(draft.x) >= row[side] / 2
    const settle =
      opening && row[side] > 0 && draft.x !== 0
        ? Option.some({ key: draft.key, side })
        : Option.none()
    if (
      !canceled &&
      draft.full &&
      options.fullSwipeEnabled?.(draft.key, side)
    ) {
      const version = model.version + 1
      return {
        model: {
          ...model,
          pointer: Option.none(),
          version,
          pending: Option.some({ key: draft.key, side, version, settle }),
        },
        outMessage: OutMessage.RequestedFullSwipe({
          key: draft.key,
          side,
          version,
        }),
      }
    }
    return {
      model: {
        ...model,
        open: settle,
        draft: Option.none(),
        pointer: Option.none(),
      },
    }
  }
  return Message.match<Result>(message, {
    MeasuredRow: ({ key, geometry: measured }) => ({
      model: { ...model, rows: { ...model.rows, [key]: measured } },
    }),
    PressedRow: ({ key, pointerId, x, y, time }) => {
      const row = geometry(model, key)
      if (
        Option.isSome(model.pointer) ||
        Option.isSome(model.pending) ||
        options.disabled?.(key) ||
        !isMeasured(row) ||
        (!row.start && !row.end)
      )
        return { model }
      return {
        model: {
          ...model,
          pointer: Option.some({
            id: pointerId,
            key,
            x,
            y,
            from: offset(model, key),
            rejected: false,
            velocity: Velocity.addSample(Velocity.init(), time, x),
          }),
        },
      }
    },
    MovedPointer: ({ pointerId, x, y, time }) => {
      if (Option.isNone(model.pointer) || model.pointer.value.id !== pointerId)
        return { model }
      const current = model.pointer.value
      if (current.rejected) return { model }
      const pointer = {
        ...current,
        velocity: Velocity.addSample(current.velocity, time, x),
      }
      const row = geometry(model, pointer.key)
      if (!isMeasured(row)) return close(model)
      const dx = x - pointer.x
      const dy = y - pointer.y
      if (Option.isNone(model.draft)) {
        if (Math.hypot(dx, dy) < SWIPE_PROMOTION_SLOP)
          return { model: { ...model, pointer: Option.some(pointer) } }
        if (Math.abs(dy) >= Math.abs(dx))
          return {
            model: {
              ...model,
              pointer: Option.some({ ...pointer, rejected: true }),
            },
          }
      }
      const raw = pointer.from + dx
      const side = sideOf(row, raw)
      const full =
        row[side] > 0 && options.fullSwipeEnabled?.(pointer.key, side) === true
      const limit = full ? row.width : row[side]
      const past = Math.abs(raw) - limit
      const shown =
        past > 0 ? Math.sign(raw) * (limit + rubberBand(past, row.width)) : raw
      return {
        model: {
          ...model,
          pointer: Option.some(pointer),
          draft: Option.some({
            key: pointer.key,
            x: shown,
            full:
              full &&
              Math.abs(raw) >=
                row.width * (options.fullSwipe ?? DEFAULT_FULL_SWIPE_FRACTION),
          }),
        },
      }
    },
    ReleasedPointer: ({ pointerId, time }) => finish(pointerId, time, false),
    CancelledPointer: ({ pointerId, time }) => finish(pointerId, time, true),
    CancelledSwipe: () => ({
      model: {
        ...model,
        pointer: Option.none(),
        draft: Option.none(),
        pending: Option.none(),
      },
    }),
    PressedOutside: () => close(model),
    ResolvedFullSwipe: ({ version, accepted }) =>
      Option.isSome(model.pending) && model.pending.value.version === version
        ? {
            model: {
              ...close(model).model,
              open: accepted ? Option.none() : model.pending.value.settle,
            },
          }
        : { model },
    PressedKey: ({ key, pressedKey, index, count }) => {
      const row = geometry(model, key)
      const shown =
        Option.isSome(model.open) && model.open.value.key === key
          ? model.open
          : Option.none()
      if (pressedKey === 'Escape')
        return Option.isSome(shown) ? close(model, true) : { model }
      if (
        options.disabled?.(key) ||
        !isMeasured(row) ||
        (pressedKey !== 'ArrowLeft' && pressedKey !== 'ArrowRight')
      )
        return { model }
      const dx = pressedKey === 'ArrowRight' ? 1 : -1
      if (Option.isNone(shown))
        return show(model, key, sideOf(row, dx), options, true)
      const side = shown.value.side
      const next = index === -1 ? 0 : index + (row.rtl ? -dx : dx)
      if (index === -1 ? dx === sign(row, side) : next < 0 || next >= count)
        return dx === sign(row, side) ? close(model, true) : { model }
      return {
        model,
        commands: [
          Focus({ id: model.id, key, side: Option.some(side), index: next }),
        ],
      }
    },
    CompletedFocus: () => ({ model }),
  })
}

const rowSelector = '[data-swipe-key]'

const interactiveSelector =
  'button, a[href], input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="button"]'

const actionsSelector = 'button, [href], [tabindex]'

const focusableActions = (actions: Element | null | undefined): HTMLElement[] =>
  Array.from(
    actions?.querySelectorAll<HTMLElement>(actionsSelector) ?? [],
  ).filter(
    action =>
      !action.matches(':disabled') &&
      !action.closest('[inert], [aria-disabled="true"]'),
  )

type InputMessage = Exclude<
  Message,
  { _tag: 'CancelledSwipe' | 'ResolvedFullSwipe' | 'CompletedFocus' }
>

const measure = (row: HTMLElement): Geometry => ({
  width: row.getBoundingClientRect().width,
  start:
    row.querySelector('[data-side="start"]')?.getBoundingClientRect().width ??
    0,
  end:
    row.querySelector('[data-side="end"]')?.getBoundingClientRect().width ?? 0,
  rtl: row.ownerDocument.defaultView?.getComputedStyle(row).direction === 'rtl',
})

const Track = Mount.defineStream('TrackSwipeActions', {
  messages: [
    Message.MeasuredRow,
    Message.PressedRow,
    Message.MovedPointer,
    Message.ReleasedPointer,
    Message.CancelledPointer,
    Message.PressedOutside,
    Message.PressedKey,
  ],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : Stream.merge(
          Drag.observeDrag<InputMessage>(element, (down, send) => {
            const target = down.target
            if (!(target instanceof Element)) return
            const row = target.closest<HTMLElement>(rowSelector)
            if (
              !row ||
              row.closest('[data-swipe-surface]') !== element ||
              row.hasAttribute('data-swipe-disabled') ||
              target.closest('[data-side]') ||
              target.closest(interactiveSelector)
            )
              return
            const key = row.dataset.swipeKey ?? ''
            const measured = measure(row)
            if (!isMeasured(measured)) return
            send(Message.MeasuredRow({ key, geometry: measured }))
            send(
              Message.PressedRow({
                key,
                pointerId: down.pointerId,
                x: down.clientX,
                y: down.clientY,
                time: down.timeStamp,
              }),
            )
            return {
              captureElement: row,
              cancelOnEscape: true,
              onMove: ({ event }) =>
                send(
                  Message.MovedPointer({
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                    time: event.timeStamp,
                  }),
                ),
              onEnd: (event, canceled) =>
                send(
                  canceled
                    ? Message.CancelledPointer({
                        pointerId: event.pointerId,
                        time: event.timeStamp,
                      })
                    : Message.ReleasedPointer({
                        pointerId: event.pointerId,
                        time: event.timeStamp,
                      }),
                ),
            }
          }),
          Stream.callback<InputMessage>(queue =>
            Effect.acquireRelease(
              Effect.sync(() => {
                const controller = new AbortController()
                const send = (message: InputMessage) =>
                  Queue.offerUnsafe(queue, message)
                element.ownerDocument.addEventListener(
                  'pointerdown',
                  event => {
                    if (!event.isPrimary || !(event.target instanceof Element))
                      return
                    const shown = element.querySelector('[data-swipe-open]')
                    if (shown && !shown.contains(event.target))
                      send(Message.PressedOutside())
                  },
                  { capture: true, signal: controller.signal },
                )
                element.addEventListener(
                  'keydown',
                  event => {
                    if (
                      event.defaultPrevented ||
                      event.altKey ||
                      event.ctrlKey ||
                      event.metaKey ||
                      event.shiftKey ||
                      !(event.target instanceof Element)
                    )
                      return
                    const row = event.target.closest<HTMLElement>(rowSelector)
                    if (
                      !row ||
                      row.hasAttribute('data-swipe-disabled') ||
                      !['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)
                    )
                      return
                    const key = row.dataset.swipeKey ?? ''
                    const measured = measure(row)
                    if (!isMeasured(measured)) return
                    const shown = row.getAttribute('data-swipe-open')
                    if (
                      event.key === 'Escape'
                        ? !shown
                        : !shown &&
                          !measured[
                            sideOf(
                              measured,
                              event.key === 'ArrowRight' ? 1 : -1,
                            )
                          ]
                    )
                      return
                    event.preventDefault()
                    const actions = row.querySelector(`[data-side="${shown}"]`)
                    const buttons = focusableActions(actions)
                    send(Message.MeasuredRow({ key, geometry: measured }))
                    send(
                      Message.PressedKey({
                        key,
                        pressedKey: event.key,
                        index: buttons.findIndex(button =>
                          button.contains(event.target as Node),
                        ),
                        count: buttons.length,
                      }),
                    )
                  },
                  { signal: controller.signal },
                )
                return () => controller.abort()
              }),
              cleanup => Effect.sync(cleanup),
            ).pipe(Effect.andThen(Effect.never)),
          ),
        ),
})

export type RowInfo<Key extends string> = Readonly<{
  key: Key
  row: ReadonlyArray<ChildAttribute>
  content: ReadonlyArray<ChildAttribute>
  actions: (side: Side) => ReadonlyArray<ChildAttribute>
}>

export type ViewInputs<Key extends string> = Readonly<{
  keys: ReadonlyArray<Key>
  disabled?: (key: Key) => boolean
  toView: (
    surface: ReadonlyArray<ChildAttribute>,
    rows: ReadonlyArray<RowInfo<Key>>,
  ) => Html
}>

export type Bundle<Key extends string> = Readonly<{
  update: typeof update
  view: View<Model, Message, ViewInputs<Key>>
}>

export const create = <Key extends string = string>(): Bundle<Key> => ({
  update,
  view: defineView<Model, Message, ViewInputs<Key>>((model, inputs, h) =>
    inputs.toView(
      childAttributes([
        h.Id(model.id),
        h.DataAttribute('swipe-surface', ''),
        h.OnMount(Track()),
        h.OnUnmount(Message.CancelledSwipe()),
      ]),
      inputs.keys.map(key => {
        const shown =
          Option.isSome(model.open) && model.open.value.key === key
            ? model.open
            : Option.none()
        const draft =
          Option.isSome(model.draft) && model.draft.value.key === key
            ? model.draft
            : Option.none()
        const x = offset(model, key)
        return {
          key,
          row: childAttributes([
            h.DataAttribute('swipe-key', key),
            ...(inputs.disabled?.(key)
              ? [h.DataAttribute('swipe-disabled', '')]
              : []),
            ...(Option.isSome(shown)
              ? [h.DataAttribute('swipe-open', shown.value.side)]
              : []),
          ]),
          content: childAttributes([
            h.Style({ '--swipe-x': `${x}px` }),
            ...(x
              ? [h.DataAttribute('swipe', sideOf(geometry(model, key), x))]
              : []),
            ...(Option.isSome(draft)
              ? [
                  h.DataAttribute('swiping', ''),
                  ...(draft.value.full ? [h.DataAttribute('full', '')] : []),
                ]
              : []),
          ]),
          actions: side =>
            childAttributes([
              h.DataAttribute('side', side),
              ...(Option.isSome(shown) && shown.value.side === side
                ? []
                : [h.Attribute('inert', '')]),
            ]),
        }
      }),
    ),
  ),
})

export const view = create().view

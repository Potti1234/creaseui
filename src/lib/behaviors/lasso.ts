import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

export const Point = Schema.Struct({ x: Schema.Number, y: Schema.Number })
export type Point = typeof Point.Type

export const Rectangle = Schema.Struct({
  left: Schema.Number,
  top: Schema.Number,
  right: Schema.Number,
  bottom: Schema.Number,
})
export type Rectangle = typeof Rectangle.Type

export const Item = Schema.Struct({ key: Schema.String, rect: Rectangle })
export type Item = typeof Item.Type

export const Draft = Schema.Struct({
  ...Rectangle.fields,
  keys: Schema.Array(Schema.String),
})

export const Session = Schema.Struct({
  pointerId: Schema.Number,
  origin: Point,
  current: Point,
  base: Schema.Array(Schema.String),
  box: Schema.Option(Rectangle),
  items: Schema.Array(Item),
})

export const Model = Schema.Struct({
  id: Schema.String,
  version: Schema.Int,
  session: Schema.Option(Session),
  draft: Schema.Option(Draft),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  Started: { pointerId: Schema.Number, point: Point, shift: Schema.Boolean },
  Measured: {
    version: Schema.Int,
    box: Schema.Option(Rectangle),
    items: Schema.Array(Item),
  },
  Moved: { pointerId: Schema.Number, point: Point },
  Ended: { pointerId: Schema.Number },
  CanceledPointer: { pointerId: Schema.Number },
  Escaped: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Selected: { keys: Schema.Array(Schema.String) },
  Canceled: {},
})
export type OutMessage = typeof OutMessage.Type

export const dragThreshold = 3

export const rectangle = (a: Point, b: Point): Rectangle => ({
  left: Math.min(a.x, b.x),
  top: Math.min(a.y, b.y),
  right: Math.max(a.x, b.x),
  bottom: Math.max(a.y, b.y),
})

export const touches = (a: Rectangle, b: Rectangle): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

export const hits = <Key extends string>(
  rect: Rectangle,
  items: ReadonlyArray<Readonly<{ key: Key; rect: Rectangle }>>,
  base: ReadonlyArray<Key> = [],
  selectable: (key: Key) => boolean = () => true,
): ReadonlyArray<Key> => [
  ...new Set([
    ...base,
    ...items
      .filter(item => selectable(item.key) && touches(rect, item.rect))
      .map(item => item.key),
  ]),
]

export const relative = (rect: Rectangle, surface: Rectangle): Rectangle => ({
  left: rect.left - surface.left,
  right: rect.right - surface.left,
  top: rect.top - surface.top,
  bottom: rect.bottom - surface.top,
})

export const isTouched = (model: Model, key: string): boolean =>
  Option.isSome(model.draft) && model.draft.value.keys.includes(key)

export const rectangleStyle = (model: Model): Record<string, string> => {
  if (Option.isNone(model.draft)) return { display: 'none' }
  const rect = model.draft.value
  return {
    position: 'absolute',
    'pointer-events': 'none',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.right - rect.left}px`,
    height: `${rect.bottom - rect.top}px`,
  }
}

export const selectionMessage = (
  count: number,
  message?: (count: number) => string,
): string =>
  message?.(count) ?? `${count} ${count === 1 ? 'item' : 'items'} selected.`

export const init = ({ id }: Readonly<{ id: string }>): Model => ({
  id,
  version: 0,
  session: Option.none(),
  draft: Option.none(),
})

export const Measure = Command.define('MeasureLasso', {
  args: { id: Schema.String, version: Schema.Int },
  messages: [Message.Measured],
  execute: ({ id, version }) =>
    Effect.sync(() => {
      const surface = document.getElementById(id)
      if (!surface)
        return Message.Measured({ version, box: Option.none(), items: [] })
      const box = surface.getBoundingClientRect()
      const items = Array.from(
        surface.querySelectorAll('[data-lasso-item]'),
      ).flatMap(element =>
        element.getAttribute('data-lasso-owner') === id
          ? [
              {
                key: element.getAttribute('data-lasso-item') ?? '',
                rect: relative(element.getBoundingClientRect(), box),
              },
            ]
          : [],
      )
      return Message.Measured({
        version,
        box: Option.some({
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
        }),
        items,
      })
    }),
})

export type Options<Key extends string = string> = Readonly<{
  selected?: ReadonlyArray<Key>
  selectable?: (key: Key) => boolean
}>

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const draw = (model: Model): Model => {
  if (Option.isNone(model.session)) return model
  const session = model.session.value
  if (Option.isNone(session.box)) return model
  if (
    Option.isNone(model.draft) &&
    Math.abs(session.current.x - session.origin.x) < dragThreshold &&
    Math.abs(session.current.y - session.origin.y) < dragThreshold
  )
    return model
  const box = session.box.value
  const rect = rectangle(
    { x: session.origin.x - box.left, y: session.origin.y - box.top },
    { x: session.current.x - box.left, y: session.current.y - box.top },
  )
  return {
    ...model,
    draft: Option.some({
      ...rect,
      keys: hits(rect, session.items, session.base),
    }),
  }
}

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  const clear = (): Model => ({
    ...model,
    session: Option.none(),
    draft: Option.none(),
  })
  const cancel = (): UpdateReturn =>
    Option.isNone(model.session)
      ? { model }
      : { model: clear(), outMessage: OutMessage.Canceled() }
  return Message.match<UpdateReturn>(message, {
    Started: ({ pointerId, point, shift }) =>
      Option.isSome(model.session)
        ? { model }
        : {
            model: {
              ...model,
              version: model.version + 1,
              draft: Option.none(),
              session: Option.some({
                pointerId,
                origin: point,
                current: point,
                base: shift ? [...new Set(options.selected ?? [])] : [],
                box: Option.none(),
                items: [],
              }),
            },
            commands: [Measure({ id: model.id, version: model.version + 1 })],
          },
    Measured: ({ version, box, items }) => {
      if (version !== model.version || Option.isNone(model.session))
        return { model }
      if (Option.isNone(box)) return cancel()
      return {
        model: draw({
          ...model,
          session: Option.some({
            ...model.session.value,
            box,
            items: items.filter(item => options.selectable?.(item.key) ?? true),
          }),
        }),
      }
    },
    Moved: ({ pointerId, point }) =>
      Option.isNone(model.session) ||
      model.session.value.pointerId !== pointerId
        ? { model }
        : {
            model: draw({
              ...model,
              session: Option.some({ ...model.session.value, current: point }),
            }),
          },
    Ended: ({ pointerId }) =>
      Option.isNone(model.session) ||
      model.session.value.pointerId !== pointerId
        ? { model }
        : {
            model: clear(),
            ...(Option.isSome(model.draft)
              ? {
                  outMessage: OutMessage.Selected({
                    keys: model.draft.value.keys,
                  }),
                }
              : {}),
          },
    CanceledPointer: ({ pointerId }) =>
      Option.isSome(model.session) &&
      model.session.value.pointerId === pointerId
        ? cancel()
        : { model },
    Escaped: cancel,
  })
}

export const ObserveSurface = Mount.defineStream('ObserveLassoSurface', {
  messages: [
    Message.Started,
    Message.Moved,
    Message.Ended,
    Message.CanceledPointer,
    Message.Escaped,
  ],
  execute: ({ element }) =>
    Stream.callback<Exclude<Message, { _tag: 'Measured' }>>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const doc = element.ownerDocument
            const view = doc.defaultView
            if (!view) return () => {}
            let releaseDrag: (() => void) | undefined
            const emit = (message: Exclude<Message, { _tag: 'Measured' }>) => {
              Queue.offerUnsafe(queue, message)
            }
            const down = (event: PointerEvent) => {
              if (
                event.target !== element ||
                event.button !== 0 ||
                !event.isPrimary ||
                releaseDrag !== undefined
              )
                return
              event.preventDefault()
              const pointerId = event.pointerId
              let frame: number | undefined
              let pending: typeof Message.Moved.Type | undefined
              const flush = () => {
                frame = undefined
                if (pending) emit(pending)
                pending = undefined
              }
              const stop = () => {
                if (frame !== undefined) view.cancelAnimationFrame(frame)
                frame = undefined
                pending = undefined
                doc.removeEventListener('pointermove', move)
                doc.removeEventListener('pointerup', up)
                doc.removeEventListener('pointercancel', cancel)
                doc.removeEventListener('keydown', key, true)
                releaseDrag = undefined
              }
              const move = (event: PointerEvent) => {
                if (event.pointerId !== pointerId) return
                pending = Message.Moved({
                  pointerId,
                  point: { x: event.clientX, y: event.clientY },
                })
                frame ??= view.requestAnimationFrame(flush)
              }
              const up = (event: PointerEvent) => {
                if (event.pointerId !== pointerId) return
                if (frame !== undefined) view.cancelAnimationFrame(frame)
                pending = Message.Moved({
                  pointerId,
                  point: { x: event.clientX, y: event.clientY },
                })
                flush()
                stop()
                emit(Message.Ended({ pointerId }))
              }
              const cancel = (event: PointerEvent) => {
                if (event.pointerId !== pointerId) return
                stop()
                emit(Message.CanceledPointer({ pointerId }))
              }
              const key = (event: KeyboardEvent) => {
                if (event.key !== 'Escape') return
                event.preventDefault()
                event.stopPropagation()
                stop()
                emit(Message.Escaped())
              }
              releaseDrag = stop
              doc.addEventListener('pointermove', move)
              doc.addEventListener('pointerup', up)
              doc.addEventListener('pointercancel', cancel)
              doc.addEventListener('keydown', key, true)
              emit(
                Message.Started({
                  pointerId: event.pointerId,
                  point: { x: event.clientX, y: event.clientY },
                  shift: event.shiftKey,
                }),
              )
            }
            element.addEventListener('pointerdown', down as EventListener)
            return () => {
              element.removeEventListener('pointerdown', down as EventListener)
              releaseDrag?.()
            }
          }),
          release => Effect.sync(release),
        )
        return yield* Effect.never
      }),
    ),
})

export type ViewInputs<Key extends string = string> = Readonly<{
  keys: ReadonlyArray<Key>
  toView: (
    parts: Readonly<{
      surfaceAttributes: ReadonlyArray<ChildAttribute>
      rectangleAttributes: ReadonlyArray<ChildAttribute>
      items: ReadonlyArray<
        Readonly<{
          key: Key
          isTouched: boolean
          attributes: ReadonlyArray<ChildAttribute>
        }>
      >
    }>,
  ) => Html
}>

export type Bundle<Key extends string = string> = Readonly<{
  update: (
    model: Model,
    message: Message,
    options?: Options<Key>,
  ) => UpdateReturn
  view: SubmodelView<Model, Message, ViewInputs<Key>>
}>

export const create = <Key extends string = string>(): Bundle<Key> => ({
  update: (model, message, options = {}) =>
    update(model, message, {
      ...options,
      selectable: key => options.selectable?.(key as Key) ?? true,
    }),
  view: defineView<Model, Message, ViewInputs<Key>>((model, inputs, h) =>
    inputs.toView({
      surfaceAttributes: childAttributes([
        h.Id(model.id),
        h.OnMount(ObserveSurface()),
      ]),
      rectangleAttributes: childAttributes([h.Style(rectangleStyle(model))]),
      items: inputs.keys.map(key => ({
        key,
        isTouched: isTouched(model, key),
        attributes: childAttributes([
          h.DataAttribute('lasso-item', key),
          h.DataAttribute('lasso-owner', model.id),
        ]),
      })),
    }),
  ),
})

export const view = create().view

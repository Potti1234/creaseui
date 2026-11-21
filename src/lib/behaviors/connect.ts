import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

export const ConnectDraft = Schema.Struct({
  from: Schema.String,
  to: Schema.Option(Schema.String),
  x: Schema.Number,
  y: Schema.Number,
  isKeyboard: Schema.Boolean,
})
export type ConnectDraft = typeof ConnectDraft.Type
export const Model = Schema.Struct({ draft: Schema.Option(ConnectDraft) })
export type Model = typeof Model.Type
export const Reason = Schema.Literals(['Drag', 'ConnectKey'])
const RectSchema = Schema.Struct({
  left: Schema.Number,
  right: Schema.Number,
  top: Schema.Number,
  bottom: Schema.Number,
})
const PortSchema = Schema.Struct({ key: Schema.String, rect: RectSchema })
export const Message = defineMessageUnion({
  RequestedKey: { id: Schema.String, from: Schema.String, key: Schema.String },
  MeasuredKey: {
    from: Schema.String,
    key: Schema.String,
    ports: Schema.Array(PortSchema),
  },
  Started: {
    from: Schema.String,
    x: Schema.Number,
    y: Schema.Number,
    isKeyboard: Schema.Boolean,
  },
  Targeted: {
    to: Schema.Option(Schema.String),
    x: Schema.Number,
    y: Schema.Number,
  },
  MovedPointer: { x: Schema.Number, y: Schema.Number },
  RequestedCommit: { reason: Reason },
  RequestedCancel: {},
  Connected: { from: Schema.String, to: Schema.String },
  CompletedAnnouncement: {},
})
export type Message = typeof Message.Type
export const OutMessage = defineMessageUnion({
  RequestedConnection: {
    from: Schema.String,
    to: Schema.String,
    reason: Reason,
  },
  Canceled: { from: Schema.String },
})
export type OutMessage = typeof OutMessage.Type
export type ConnectMessage =
  | Readonly<{ type: 'start'; from: string }>
  | Readonly<{ type: 'target' | 'connect'; from: string; to: string }>
  | Readonly<{ type: 'cancel'; from: string }>

export const connectMessage = (
  message: ConnectMessage,
  label: (key: string) => string,
): string => {
  if (message.type === 'start')
    return `Connecting from ${label(message.from)}. Arrows choose a port, Enter connects, Escape cancels.`
  if (message.type === 'target') return `To ${label(message.to)}.`
  if (message.type === 'connect')
    return `Connected ${label(message.from)} to ${label(message.to)}.`
  return 'Canceled.'
}

export type Options = Readonly<{
  keys: ReadonlyArray<string>
  canConnect?: (from: string, to: string) => boolean
  label?: (key: string) => string
  message?: (message: ConnectMessage, label: (key: string) => string) => string
  announcementId?: string
}>
const can = (options: Options, from: string, to: string): boolean =>
  from !== to &&
  options.keys.includes(from) &&
  options.keys.includes(to) &&
  (options.canConnect?.(from, to) ?? true)

export const init = (): Model => ({ draft: Option.none() })

export const MeasurePorts = Command.define('MeasureConnectPorts', {
  args: { id: Schema.String, from: Schema.String, key: Schema.String },
  messages: [Message.MeasuredKey],
  execute: ({ id, from, key }) =>
    Effect.sync(() =>
      Message.MeasuredKey({
        from,
        key,
        ports: Array.from(
          document
            .getElementById(id)
            ?.querySelectorAll<HTMLElement>('[data-connect-key]') ?? [],
        ).map(port => {
          const { left, right, top, bottom } = port.getBoundingClientRect()
          return {
            key: port.dataset.connectKey ?? '',
            rect: { left, right, top, bottom },
          }
        }),
      }),
    ),
})

export const Announce = Command.define('AnnounceConnection', {
  args: { id: Schema.String, text: Schema.String },
  messages: [Message.CompletedAnnouncement],
  execute: ({ id, text }) =>
    Effect.sync(() => {
      const element = document.getElementById(id)
      if (element) element.textContent = text
      return Message.CompletedAnnouncement()
    }),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>
export const update = (
  model: Model,
  message: Message,
  options: Options,
): UpdateReturn => {
  const say = (announcement: ConnectMessage) =>
    options.announcementId === undefined
      ? []
      : [
          Announce({
            id: options.announcementId,
            text: (options.message ?? connectMessage)(
              announcement,
              options.label ?? (key => key),
            ),
          }),
        ]
  return Message.match<UpdateReturn>(message, {
    RequestedKey: ({ id, from, key }) => ({
      model,
      commands: [MeasurePorts({ id, from, key })],
    }),
    MeasuredKey: ({ from, key, ports }) => {
      if (Option.isNone(model.draft)) {
        const port = ports.find(port => port.key === from)
        return port && (key === 'Enter' || key === ' ')
          ? update(
              model,
              Message.Started({ from, ...center(port.rect), isKeyboard: true }),
              options,
            )
          : { model }
      }
      const next = keyboardTarget(model, key, ports, options)
      return Option.isSome(next.message)
        ? update(model, next.message.value, options)
        : { model }
    },
    Started: ({ from, x, y, isKeyboard }) =>
      options.keys.some(to => can(options, from, to))
        ? {
            model: {
              draft: Option.some({ from, to: Option.none(), x, y, isKeyboard }),
            },
            commands: say({ type: 'start', from }),
          }
        : { model },
    Targeted: ({ to, x, y }) => {
      if (Option.isNone(model.draft)) return { model }
      const draft = model.draft.value
      if (Option.isSome(to) && !can(options, draft.from, to.value))
        return { model }
      return {
        model: { draft: Option.some({ ...draft, to, x, y }) },
        commands:
          Option.isSome(to) && !Option.contains(draft.to, to.value)
            ? say({ type: 'target', from: draft.from, to: to.value })
            : [],
      }
    },
    MovedPointer: ({ x, y }) =>
      Option.isNone(model.draft) || model.draft.value.isKeyboard
        ? { model }
        : {
            model: {
              draft: Option.some({
                ...model.draft.value,
                to: Option.none(),
                x,
                y,
              }),
            },
          },
    RequestedCommit: ({ reason }) => {
      if (Option.isNone(model.draft)) return { model }
      const { from, to } = model.draft.value
      return {
        model: init(),
        ...(Option.isSome(to) && can(options, from, to.value)
          ? {
              outMessage: OutMessage.RequestedConnection({
                from,
                to: to.value,
                reason,
              }),
            }
          : {}),
      }
    },
    RequestedCancel: () =>
      Option.isNone(model.draft)
        ? { model }
        : {
            model: init(),
            outMessage: OutMessage.Canceled({ from: model.draft.value.from }),
            commands: say({ type: 'cancel', from: model.draft.value.from }),
          },
    Connected: ({ from, to }) => ({
      model,
      commands: say({ type: 'connect', from, to }),
    }),
    CompletedAnnouncement: () => ({ model }),
  })
}

export const role = (
  model: Model,
  key: string,
  options: Options,
): 'Source' | 'Target' | 'Candidate' | undefined => {
  if (Option.isNone(model.draft)) return undefined
  const draft = model.draft.value
  if (draft.from === key) return 'Source'
  if (Option.contains(draft.to, key)) return 'Target'
  return can(options, draft.from, key) ? 'Candidate' : undefined
}

export type Rect = Readonly<{
  left: number
  right: number
  top: number
  bottom: number
}>
export type Port<Key extends string = string> = Readonly<{
  key: Key
  rect: Rect
}>
const center = (rect: Rect) => ({
  x: (rect.left + rect.right) / 2,
  y: (rect.top + rect.bottom) / 2,
})
export const nearestInDirection = <Key extends string>(
  fromRect: Rect,
  candidates: ReadonlyArray<Port<Key>>,
  direction: readonly [number, number],
): Key | undefined => {
  const from = center(fromRect)
  const [dx, dy] = direction
  let best: { key: Key; score: number; cone: boolean } | undefined
  for (const { key, rect } of candidates) {
    const point = center(rect)
    const x = point.x - from.x
    const y = point.y - from.y
    const ahead = x * dx + y * dy
    if (ahead <= 0) continue
    const aside = Math.abs(dx ? y : x)
    const cone = aside <= ahead
    const score = ahead + aside * 2
    if (
      !best ||
      (cone && !best.cone) ||
      (cone === best.cone && score < best.score)
    )
      best = { key, score, cone }
  }
  return best?.key
}
const arrows: Readonly<Record<string, readonly [number, number]>> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}
export const keyboardTarget = (
  model: Model,
  pressedKey: string,
  ports: ReadonlyArray<Port>,
  options: Options,
): Readonly<{
  handled: boolean
  preventDefault: boolean
  message: Option.Option<Message>
}> => {
  const result = (
    handled: boolean,
    message: Option.Option<Message> = Option.none(),
  ) => ({ handled, preventDefault: handled && pressedKey !== 'Tab', message })
  if (Option.isNone(model.draft)) return result(false)
  const draft = model.draft.value
  if (pressedKey === 'Escape' || pressedKey === 'Tab')
    return result(true, Option.some(Message.RequestedCancel()))
  if (pressedKey === 'Enter' || pressedKey === ' ')
    return result(
      true,
      Option.isSome(draft.to)
        ? Option.some(Message.RequestedCommit({ reason: 'ConnectKey' }))
        : Option.none(),
    )
  const direction = arrows[pressedKey]
  if (!direction) return result(false)
  const current = ports.find(
    port => port.key === Option.getOrElse(draft.to, () => draft.from),
  )
  const next =
    current &&
    nearestInDirection(
      current.rect,
      ports.filter(
        port =>
          !Option.contains(draft.to, port.key) &&
          can(options, draft.from, port.key),
      ),
      direction,
    )
  const port = ports.find(port => port.key === next)
  return result(
    true,
    port
      ? Option.some(
          Message.Targeted({ to: Option.some(port.key), ...center(port.rect) }),
        )
      : Option.none(),
  )
}

const Pair = Schema.Struct({ from: Schema.String, to: Schema.String })
type PointerMessage = Extract<
  Message,
  {
    _tag:
      | 'Started'
      | 'Targeted'
      | 'MovedPointer'
      | 'RequestedCommit'
      | 'RequestedCancel'
  }
>
export const ObservePorts = Mount.defineStream('ObserveConnectPorts', {
  args: { pairs: Schema.Array(Pair), radius: Schema.Number },
  messages: [
    Message.Started,
    Message.Targeted,
    Message.MovedPointer,
    Message.RequestedCommit,
    Message.RequestedCancel,
  ],
  execute: ({ element, pairs, radius }) =>
    Stream.callback<PointerMessage>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const doc = element.ownerDocument
            const emit = (message: PointerMessage) =>
              Queue.offerUnsafe(queue, message)
            const measure = (): ReadonlyArray<Port> =>
              Array.from(
                element.querySelectorAll<HTMLElement>('[data-connect-key]'),
              ).map(port => ({
                key: port.dataset.connectKey ?? '',
                rect: port.getBoundingClientRect(),
              }))
            let session:
              | { pointerId: number; from: string; ports: ReadonlyArray<Port> }
              | undefined
            const options: Options = {
              keys: pairs.flatMap(pair => [pair.from, pair.to]),
              canConnect: (from, to) =>
                pairs.some(pair => pair.from === from && pair.to === to),
            }
            const down = (event: PointerEvent) => {
              if (
                event.button !== 0 ||
                !event.isPrimary ||
                session ||
                !(event.target instanceof Element)
              )
                return
              const port =
                event.target.closest<HTMLElement>('[data-connect-key]')
              const from = port?.dataset.connectKey
              if (
                !port ||
                !element.contains(port) ||
                from === undefined ||
                !pairs.some(pair => pair.from === from)
              )
                return
              event.preventDefault()
              const ports = measure()
              session = { pointerId: event.pointerId, from, ports }
              emit(
                Message.Started({
                  from,
                  ...center(port.getBoundingClientRect()),
                  isKeyboard: false,
                }),
              )
            }
            const move = (event: PointerEvent) => {
              if (!session || event.pointerId !== session.pointerId) return
              let nearest: { port: Port; distance: number } | undefined
              for (const port of session.ports) {
                if (!can(options, session.from, port.key)) continue
                const point = center(port.rect)
                const distance = Math.hypot(
                  point.x - event.clientX,
                  point.y - event.clientY,
                )
                if (
                  distance <= radius &&
                  (!nearest || distance < nearest.distance)
                )
                  nearest = { port, distance }
              }
              emit(
                nearest
                  ? Message.Targeted({
                      to: Option.some(nearest.port.key),
                      ...center(nearest.port.rect),
                    })
                  : Message.MovedPointer({
                      x: event.clientX,
                      y: event.clientY,
                    }),
              )
            }
            const up = (event: PointerEvent) => {
              if (!session || event.pointerId !== session.pointerId) return
              move(event)
              session = undefined
              emit(Message.RequestedCommit({ reason: 'Drag' }))
            }
            const cancel = () => {
              session = undefined
              emit(Message.RequestedCancel())
            }
            const pointerCancel = (event: PointerEvent) => {
              if (session?.pointerId === event.pointerId) cancel()
            }
            const key = (event: KeyboardEvent) => {
              if (event.key === 'Escape' && session) {
                event.preventDefault()
                cancel()
                return
              }
              if (
                event.key === 'Tab' &&
                event.target instanceof Node &&
                element.contains(event.target)
              )
                cancel()
            }
            element.addEventListener('pointerdown', down as EventListener)
            doc.addEventListener('pointermove', move)
            doc.addEventListener('pointerup', up)
            doc.addEventListener('pointercancel', pointerCancel)
            doc.addEventListener('keydown', key)
            doc.defaultView?.addEventListener('blur', cancel)
            return () => {
              element.removeEventListener('pointerdown', down as EventListener)
              doc.removeEventListener('pointermove', move)
              doc.removeEventListener('pointerup', up)
              doc.removeEventListener('pointercancel', pointerCancel)
              doc.removeEventListener('keydown', key)
              doc.defaultView?.removeEventListener('blur', cancel)
            }
          }),
          cleanup => Effect.sync(cleanup),
        )
        return yield* Effect.never
      }),
    ),
})

export type PortInfo<Key extends string> = Readonly<{
  key: Key
  attributes: ReadonlyArray<ChildAttribute>
}>
export type ViewInputs<Key extends string = string> = Omit<Options, 'keys'> &
  Readonly<{
    id: string
    keys: ReadonlyArray<Key>
    radius?: number
    toView: (
      ports: ReadonlyArray<PortInfo<Key>>,
      attributes: ReadonlyArray<ChildAttribute>,
    ) => Html
  }>
export type Bundle<Key extends string = string> = Readonly<{
  update: typeof update
  view: SubmodelView<Model, Message, ViewInputs<Key>>
}>
export const create = <Key extends string = string>(): Bundle<Key> => ({
  update,
  view: defineView<Model, Message, ViewInputs<Key>>((model, inputs, h) =>
    inputs.toView(
      inputs.keys.map(key => ({
        key,
        attributes: childAttributes([
          h.DataAttribute('connect-key', key),
          h.OnKeyDownPreventDefault((pressedKey, modifiers) => {
            if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey)
              return Option.none()
            const next = keyboardTarget(model, pressedKey, [], inputs)
            const starts =
              Option.isNone(model.draft) &&
              (pressedKey === 'Enter' || pressedKey === ' ') &&
              inputs.keys.some(to => can(inputs, key, to))
            return next.preventDefault || starts
              ? Option.some(
                  Message.RequestedKey({
                    id: inputs.id,
                    from: key,
                    key: pressedKey,
                  }),
                )
              : Option.none()
          }),
          ...(() => {
            const value = role(model, key, inputs)
            return value === undefined
              ? []
              : [h.DataAttribute('connect', value)]
          })(),
        ]),
      })),
      childAttributes([
        h.Id(inputs.id),
        h.OnMount(
          ObservePorts({
            pairs: inputs.keys.flatMap(from =>
              inputs.keys
                .filter(to => can(inputs, from, to))
                .map(to => ({ from, to })),
            ),
            radius: inputs.radius ?? 28,
          }),
        ),
      ]),
    ),
  ),
})
export const view = create().view

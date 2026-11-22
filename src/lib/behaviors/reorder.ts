import { Option, Schema } from 'effect'
import { defineMessageUnion } from 'foldkit/message'

const Draft = Schema.Struct({
  key: Schema.String,
  keys: Schema.Array(Schema.String),
  order: Schema.Array(Schema.String),
  moved: Schema.Boolean,
})
export const Model = Schema.Struct({ maybeDraft: Schema.Option(Draft) })
export type Model = typeof Model.Type
export const init = (): Model => ({ maybeDraft: Option.none() })

export const Message = defineMessageUnion({
  Grab: { key: Schema.String },
  MoveTo: { index: Schema.Number },
  Step: { delta: Schema.Number },
  Drop: {},
  Cancel: { restoreFocus: Schema.Boolean },
  Move: { key: Schema.String, index: Schema.Number },
  Reflect: {},
  Swallow: {},
})
export type Message = typeof Message.Type
export type Announcement = Readonly<{
  type: 'grab' | 'move' | 'drop' | 'cancel'
  key: string
  count: number
  position: number
  total: number
}>
export type OutMessage =
  | Readonly<{
      type: 'CommittedOrder'
      order: ReadonlyArray<string>
      reason: 'move-key' | 'imperative'
    }>
  | Readonly<{ type: 'Announcement'; announcement: Announcement }>
export const reorderMessage = ({
  type,
  label: name,
  count,
  position,
  total,
}: Omit<Announcement, 'key'> & { label: string }): string => {
  const at = `position ${position} of ${total}`
  const label = count > 1 ? `${count} items` : name
  if (type === 'grab') return `Picked up ${label}, ${at}.`
  if (type === 'move') return `${label}, ${at}.`
  if (type === 'drop') return `Dropped ${label} at ${at}.`
  return `Moved ${label} back to ${at}.`
}
export const dropIndex = (
  middles: ReadonlyArray<number>,
  pointer: number,
  { reversed = false } = {},
): number =>
  middles.filter(middle => (reversed ? middle > pointer : middle < pointer))
    .length
export const gridDropIndex = (
  rects: ReadonlyArray<{
    left: number
    right: number
    top: number
    bottom: number
  }>,
  point: { x: number; y: number },
  { reversed = false } = {},
): number =>
  rects.filter(
    rect =>
      point.y > rect.bottom ||
      (point.y >= rect.top &&
        (reversed
          ? point.x < (rect.left + rect.right) / 2
          : point.x > (rect.left + rect.right) / 2)),
  ).length
export const columnsOf = (tops: ReadonlyArray<number>): number => {
  let count = 0
  while (count < tops.length && Math.abs(tops[count]! - tops[0]!) < 1) count++
  return Math.max(1, count)
}
export const movedTo = (
  order: ReadonlyArray<string>,
  key: string | ReadonlyArray<string>,
  index: number,
): ReadonlyArray<string> => {
  const keys =
    typeof key === 'string' ? [key] : order.filter(item => key.includes(item))
  const rest = order.filter(item => !keys.includes(item))
  const to = Math.max(0, Math.min(rest.length, index))
  if (keys.every((item, i) => order[to + i] === item)) return order
  rest.splice(to, 0, ...keys)
  return rest
}
const gathered = (
  value: ReadonlyArray<string>,
  key: string,
  keys: ReadonlyArray<string>,
) =>
  keys.length > 1
    ? movedTo(
        value,
        keys,
        value.slice(0, value.indexOf(key)).filter(k => !keys.includes(k))
          .length,
      )
    : [...value]
export const order = (
  model: Model,
  value: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  Option.match(model.maybeDraft, {
    onNone: () => value,
    onSome: draft => draft.order,
  })
export const isMoving = (model: Model, key: string): boolean =>
  Option.exists(model.maybeDraft, draft => draft.keys.includes(key))
export type Config = Readonly<{
  value: ReadonlyArray<string>
  isDisabled?: (key: string) => boolean
  group?: (key: string) => ReadonlyArray<string>
}>
export type Result = Readonly<{
  model: Model
  outMessages: ReadonlyArray<OutMessage>
  maybeFocus: Option.Option<string>
}>
export const update = (
  model: Model,
  message: Message,
  config: Config,
): Result => {
  const { value } = config
  const draft = Option.getOrUndefined(model.maybeDraft)
  const result = (
    next: Model = model,
    outMessages: ReadonlyArray<OutMessage> = [],
    maybeFocus: Option.Option<string> = Option.none(),
  ): Result => ({ model: next, outMessages, maybeFocus })
  const say = (
    type: Announcement['type'],
    current: typeof Draft.Type,
    keys: ReadonlyArray<string>,
  ): OutMessage => ({
    type: 'Announcement',
    announcement: {
      type,
      key: current.key,
      count: current.keys.length,
      position: keys.indexOf(current.key) + 1,
      total: keys.length,
    },
  })
  switch (message._tag) {
    case 'Grab': {
      if (
        draft ||
        !value.includes(message.key) ||
        config.isDisabled?.(message.key)
      )
        return result()
      const group = config.group?.(message.key) ?? []
      const keys = value.filter(
        key =>
          key === message.key ||
          (group.includes(key) && !config.isDisabled?.(key)),
      )
      const next = {
        key: message.key,
        keys,
        order: gathered(value, message.key, keys),
        moved: false,
      }
      return result(
        { maybeDraft: Option.some(next) },
        [say('grab', next, next.order)],
        keys.length > 1 ? Option.some(next.key) : Option.none(),
      )
    }
    case 'MoveTo':
    case 'Step': {
      if (!draft) return result()
      const index =
        message._tag === 'MoveTo'
          ? message.index
          : draft.order.indexOf(draft.keys[0]!) + message.delta
      const next = movedTo(draft.order, draft.keys, index)
      if (next === draft.order) return result()
      return result(
        { maybeDraft: Option.some({ ...draft, order: next, moved: true }) },
        [say('move', draft, next)],
        Option.some(draft.key),
      )
    }
    case 'Drop':
      if (!draft) return result()
      return result(
        init(),
        [
          ...(value.length === draft.order.length &&
          value.every((key, i) => draft.order[i] === key)
            ? []
            : [
                {
                  type: 'CommittedOrder' as const,
                  order: draft.order,
                  reason: 'move-key' as const,
                },
              ]),
          say('drop', draft, draft.order),
        ],
        Option.some(draft.key),
      )
    case 'Cancel':
      return draft
        ? result(
            init(),
            [say('cancel', draft, value)],
            message.restoreFocus ? Option.some(draft.key) : Option.none(),
          )
        : result()
    case 'Move': {
      if (!value.includes(message.key)) return result()
      const next = movedTo(value, message.key, message.index)
      if (next === value) return result()
      return result(model, [
        { type: 'CommittedOrder', order: next, reason: 'imperative' },
        say(
          'drop',
          { key: message.key, keys: [message.key], order: next, moved: false },
          next,
        ),
      ])
    }
    case 'Reflect': {
      if (!draft) return result()
      if (!value.includes(draft.key)) return result(init())
      const keys = value.filter(key => draft.keys.includes(key))
      const base = gathered(value, draft.key, keys)
      const at = draft.order.indexOf(draft.keys[0]!)
      const index = draft.order
        .slice(0, at)
        .filter(key => value.includes(key)).length
      return result({
        maybeDraft: Option.some({
          ...draft,
          keys,
          order: draft.moved ? movedTo(base, keys, index) : base,
        }),
      })
    }
    case 'Swallow':
      return result()
  }
}

export type Keydown = Readonly<{
  key: string
  itemKey: string
  orientation?: 'vertical' | 'horizontal' | 'grid'
  rtl?: boolean
  columns?: number
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}>
export const keydown = (
  model: Model,
  event: Keydown,
): Option.Option<Message> => {
  const modified = event.altKey || event.ctrlKey || event.metaKey
  const draft = Option.getOrUndefined(model.maybeDraft)
  if (!draft)
    return !modified && (event.key === ' ' || event.key === 'Enter')
      ? Option.some(Message.Grab({ key: event.itemKey }))
      : Option.none()
  if (event.key === 'Tab' || event.key === 'Escape')
    return Option.some(Message.Cancel({ restoreFocus: event.key !== 'Tab' }))
  if (event.key === ' ' || event.key === 'Enter')
    return Option.some(Message.Drop({}))
  const swallow = () => Option.some(Message.Swallow({}))
  if (modified) return swallow()
  const index = draft.order.indexOf(draft.keys[0]!)
  const last = draft.order.length - draft.keys.length
  if (event.key === 'Home' || event.key === 'End')
    return Option.some(
      Message.MoveTo({ index: event.key === 'Home' ? 0 : last }),
    )
  const orientation = event.orientation ?? 'vertical'
  let delta = 0
  if (
    orientation !== 'horizontal' &&
    (event.key === 'ArrowUp' || event.key === 'ArrowDown')
  )
    delta =
      (event.key === 'ArrowUp' ? -1 : 1) *
      (orientation === 'grid' ? Math.max(1, event.columns ?? 1) : 1)
  if (
    orientation !== 'vertical' &&
    (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
  )
    delta = (event.key === 'ArrowLeft' ? -1 : 1) * (event.rtl ? -1 : 1)
  if (
    !delta ||
    (Math.abs(delta) > 1 && (index + delta < 0 || index + delta > last))
  )
    return swallow()
  return Option.some(Message.Step({ delta }))
}

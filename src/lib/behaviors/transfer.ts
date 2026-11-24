import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import {
  childAttributes,
  type Attribute,
  type ChildAttribute,
  type Html,
  type HtmlBuilder,
} from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { defineView, type View as SubmodelView } from 'foldkit/submodel'

import { createAutoScroll, isDrag } from './drag'
import { columnsOf, gridDropIndex } from './reorder'

export const Lists = Schema.Record(Schema.String, Schema.Array(Schema.String))
export type Lists = typeof Lists.Type

const Point = Schema.Struct({ x: Schema.Finite, y: Schema.Finite })
type Point = typeof Point.Type
const Size = Schema.Struct({ width: Schema.Finite, height: Schema.Finite })
const Slot = Schema.Struct({ list: Schema.String, index: Schema.Int })

const Draft = Schema.Struct({
  key: Schema.String,
  keys: Schema.optionalKey(Schema.Array(Schema.String)),
  from: Schema.String,
  lists: Lists,
  pointer: Schema.Boolean,
})
type Draft = typeof Draft.Type

const Pointer = Schema.Struct({
  id: Schema.Int,
  key: Schema.String,
  origin: Point,
  at: Point,
  offset: Point,
  size: Size,
  focused: Schema.Boolean,
})
type Pointer = typeof Pointer.Type

export const Model = Schema.Struct({
  id: Schema.String,
  lists: Lists,
  draft: Schema.Option(Draft),
  pointer: Schema.Option(Pointer),
})
export type Model = typeof Model.Type

export const Direction = Schema.Literals(['ltr', 'rtl'])
export type Direction = typeof Direction.Type

export const Message = defineMessageUnion({
  PressedKey: {
    key: Schema.String,
    pressedKey: Schema.String,
    modified: Schema.Boolean,
    direction: Direction,
    columns: Schema.optionalKey(Schema.Int),
  },
  PressedItem: {
    key: Schema.String,
    pointerId: Schema.Int,
    at: Point,
    offset: Point,
    size: Size,
    focused: Schema.Boolean,
  },
  MovedPointer: {
    pointerId: Schema.Int,
    at: Point,
    maybeSlot: Schema.Option(Slot),
    precedingKeys: Schema.optionalKey(Schema.Array(Schema.String)),
  },
  ReleasedPointer: { pointerId: Schema.Int },
  CancelledPointer: { pointerId: Schema.Int },
  CancelledTransfer: {},
  CompletedFocusItem: {},
})
export type Message = typeof Message.Type

export const Reason = Schema.Literals(['drag', 'move-key', 'imperative'])
export type Reason = typeof Reason.Type

export const AnnouncementType = Schema.Literals([
  'grab',
  'move',
  'drop',
  'cancel',
])
export type AnnouncementType = typeof AnnouncementType.Type

export type Announcement = Readonly<{
  type: AnnouncementType
  key: string
  label: string
  list: string
  position: number
  total: number
}>

export const OutMessage = defineMessageUnion({
  Announced: { type: AnnouncementType, announcement: Schema.String },
  Transferred: {
    lists: Lists,
    key: Schema.String,
    from: Schema.String,
    to: Schema.String,
    index: Schema.Int,
    reason: Reason,
    announcement: Schema.String,
  },
})
export type OutMessage = typeof OutMessage.Type

export type CommitDetails = Readonly<{
  reason: Reason
  key: string
  from: string
  to: string
  index: number
}>

export type Options = Readonly<{
  order?: ReadonlyArray<string>
  group?: (key: string) => ReadonlyArray<string>
  accepts?: (key: string, list: string) => boolean
  disabled?: (key: string) => boolean
  label?: (key: string) => string | undefined
  listLabel?: (list: string) => string | undefined
  message?: (announcement: Announcement) => string
  canCommit?: (lists: Lists, details: CommitDetails) => boolean
}>

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const init = (
  config: Readonly<{ id: string; lists: Lists }>,
): Model => ({
  id: config.id,
  lists: config.lists,
  draft: Option.none(),
  pointer: Option.none(),
})

export const transferMessage = ({
  type,
  label,
  list,
  position,
  total,
}: Announcement): string => {
  const at = `${list}, position ${position} of ${total}`
  if (type === 'grab') return `Picked up ${label}, ${at}.`
  if (type === 'move') return `${label}, ${at}.`
  if (type === 'drop') return `Dropped ${label} in ${at}.`
  return `Moved ${label} back to ${at}.`
}

export const transferred = (
  lists: Lists,
  key: string,
  list: string,
  index: number,
): Lists => transferGroup(lists, [key], list, index)

const transferGroup = (
  lists: Lists,
  keys: ReadonlyArray<string>,
  list: string,
  index: number,
): Lists => {
  const next: Record<string, ReadonlyArray<string>> = {}
  const moving = new Set(keys)
  for (const [name, items] of Object.entries(lists))
    next[name] = items.filter(item => !moving.has(item))
  const target = [...(next[list] ?? [])]
  target.splice(Math.max(0, Math.min(target.length, index)), 0, ...keys)
  next[list] = target
  return next
}

export const listWith = (lists: Lists, key: string): Option.Option<string> =>
  Option.fromNullishOr(
    Object.keys(lists).find(list => lists[list]?.includes(key)),
  )

export const sameLists = (a: Lists, b: Lists): boolean => {
  const names = Object.keys(a)
  return (
    names.length === Object.keys(b).length &&
    names.every(list => {
      const left = a[list] ?? []
      const right = b[list]
      return (
        right !== undefined &&
        left.length === right.length &&
        left.every((key, index) => right[index] === key)
      )
    })
  )
}

export const dropIndex = (
  middles: ReadonlyArray<number>,
  pointer: number,
): number => middles.filter(middle => middle < pointer).length

export const lists = (model: Model): Lists =>
  Option.match(model.draft, {
    onNone: () => model.lists,
    onSome: draft => draft.lists,
  })

export const moving = (model: Model, key: string): boolean =>
  Option.exists(model.draft, draft => draftKeys(draft).includes(key))

export const dragging = (model: Model, key: string): boolean =>
  Option.exists(
    model.draft,
    draft => draft.pointer && draftKeys(draft).includes(key),
  )

const draftKeys = (draft: Draft): ReadonlyArray<string> =>
  draft.keys ?? [draft.key]

export const itemId = (id: string, key: string): string =>
  `${id}-transfer-${key}`

const itemSelector = (id: string, key: string): string =>
  `[id="${itemId(id, key).replace(
    /["\\\n\r\f]/gu,
    character => `\\${character.charCodeAt(0).toString(16)} `,
  )}"]`

export const FocusItem = Command.define('FocusTransferItem', {
  args: { id: Schema.String, key: Schema.String },
  messages: [Message.CompletedFocusItem],
  execute: ({ id, key }) =>
    Dom.focus(itemSelector(id, key)).pipe(
      Effect.ignore,
      Effect.as(Message.CompletedFocusItem()),
    ),
})

const announce = (
  type: AnnouncementType,
  key: string,
  current: Lists,
  options: Options,
): string => {
  const list = Option.getOrElse(listWith(current, key), () => '')
  const keys = current[list] ?? []
  return (options.message ?? transferMessage)({
    type,
    key,
    label: options.label?.(key) ?? key,
    list: options.listLabel?.(list) ?? list,
    position: keys.indexOf(key) + 1,
    total: keys.length,
  })
}

const announced = (
  model: Model,
  type: AnnouncementType,
  key: string,
  current: Lists,
  options: Options,
  commands: UpdateReturn['commands'] = [],
): UpdateReturn => ({
  model,
  commands,
  outMessage: OutMessage.Announced({
    type,
    announcement: announce(type, key, current, options),
  }),
})

const focusUnless = (model: Model, key: string, skip: boolean) =>
  skip ? [] : [FocusItem({ id: model.id, key })]

const accepts = (options: Options, key: string, list: string): boolean =>
  options.accepts === undefined || options.accepts(key, list)

const startDraft = (
  model: Model,
  key: string,
  pointer: boolean,
  options: Options,
): Option.Option<Model> => {
  const maybeFrom = listWith(model.lists, key)
  if (
    Option.isSome(model.draft) ||
    Option.isNone(maybeFrom) ||
    options.disabled?.(key) === true
  )
    return Option.none()
  const from = maybeFrom.value
  const selected = new Set(options.group?.(key))
  const keys = (model.lists[from] ?? []).filter(
    item =>
      item === key || (selected.has(item) && options.disabled?.(item) !== true),
  )
  return Option.some({
    ...model,
    draft: Option.some({
      key,
      from,
      ...(keys.length > 1 ? { keys } : {}),
      lists: model.lists,
      pointer,
    }),
  })
}

/** Picks an item up, as Space does. */
export const grab = (
  model: Model,
  key: string,
  options: Options = {},
): UpdateReturn =>
  Option.match(startDraft(model, key, false, options), {
    onNone: () => ({ model }),
    onSome: next => announced(next, 'grab', key, next.lists, options),
  })

/** Moves the picked-up item to `index` in `list`, in the draft. */
export const moveTo = (
  model: Model,
  list: string,
  index: number,
  options: Options = {},
): UpdateReturn => {
  if (Option.isNone(model.draft)) return { model }
  const draft = model.draft.value
  if (draft.lists[list] === undefined) return { model }
  const changesList = !Option.contains(listWith(draft.lists, draft.key), list)
  const keys = draftKeys(draft)
  if (changesList && keys.some(key => !accepts(options, key, list)))
    return { model }
  const next = transferGroup(draft.lists, keys, list, index)
  if (sameLists(next, draft.lists)) return { model }
  const moved = { ...model, draft: Option.some({ ...draft, lists: next }) }
  return announced(
    moved,
    'move',
    draft.key,
    next,
    options,
    focusUnless(model, draft.key, draft.pointer),
  )
}

const settled = (model: Model): Model => ({
  ...model,
  draft: Option.none(),
  pointer: Option.none(),
})

const commit = (
  model: Model,
  draft: Draft,
  reason: Reason,
  options: Options,
  refocus: boolean,
): UpdateReturn => {
  const commands = focusUnless(model, draft.key, !refocus)
  if (sameLists(draft.lists, model.lists))
    return announced(
      settled(model),
      'drop',
      draft.key,
      draft.lists,
      options,
      commands,
    )
  const to = Option.getOrElse(
    listWith(draft.lists, draft.key),
    () => draft.from,
  )
  const details = {
    reason,
    key: draft.key,
    from: draft.from,
    to,
    index: Math.max(0, draft.lists[to]?.indexOf(draft.key) ?? 0),
  }
  if (options.canCommit?.(draft.lists, details) === false)
    return announced(
      settled(model),
      'cancel',
      draft.key,
      model.lists,
      options,
      commands,
    )
  return {
    model: { ...settled(model), lists: draft.lists },
    commands,
    outMessage: OutMessage.Transferred({
      ...details,
      lists: draft.lists,
      announcement: announce('drop', draft.key, draft.lists, options),
    }),
  }
}

/** Drops the picked-up item where it is, committing the draft. */
export const drop = (model: Model, options: Options = {}): UpdateReturn =>
  Option.match(model.draft, {
    onNone: () => ({ model }),
    onSome: draft => commit(model, draft, 'move-key', options, !draft.pointer),
  })

/** Puts the picked-up item back where it was. */
export const cancel = (
  model: Model,
  options: Options = {},
  refocus = true,
): UpdateReturn =>
  Option.match(model.draft, {
    onNone: () => ({ model: settled(model) }),
    onSome: draft =>
      announced(
        settled(model),
        'cancel',
        draft.key,
        model.lists,
        options,
        focusUnless(model, draft.key, draft.pointer || !refocus),
      ),
  })

/** Moves an item to `index` in `list` at once, like a "Move to Done" menu item. */
export const move = (
  model: Model,
  key: string,
  list: string,
  index: number,
  options: Options = {},
): UpdateReturn => {
  const maybeFrom = listWith(model.lists, key)
  if (
    Option.isNone(maybeFrom) ||
    model.lists[list] === undefined ||
    (maybeFrom.value !== list && !accepts(options, key, list))
  )
    return { model }
  const next = transferred(model.lists, key, list, index)
  if (sameLists(next, model.lists)) return { model }
  const details = {
    reason: 'imperative' as const,
    key,
    from: maybeFrom.value,
    to: list,
    index: next[list]?.indexOf(key) ?? index,
  }
  if (options.canCommit?.(next, details) === false) return { model }
  return {
    model: setLists(model, next, options),
    outMessage: OutMessage.Transferred({
      ...details,
      lists: next,
      announcement: announce('drop', key, next, options),
    }),
  }
}

/** Replaces the committed lists, carrying an in-flight draft across the change. */
export const setLists = (
  model: Model,
  now: Lists,
  options: Options = {},
): Model => {
  if (Option.isNone(model.draft)) return { ...model, lists: now }
  const draft = model.draft.value
  const maybeFrom = listWith(now, draft.key)
  const dropped = { ...settled(model), lists: now }
  if (Option.isNone(maybeFrom)) return dropped
  const from = maybeFrom.value
  const group = draftKeys(draft)
  if (group.some(key => !now[from]?.includes(key))) return dropped
  if (sameLists(draft.lists, model.lists))
    return {
      ...model,
      lists: now,
      draft: Option.some({ ...draft, from, lists: now }),
    }
  const list = Option.getOrElse(listWith(draft.lists, draft.key), () => from)
  const target = now[list]
  if (
    target === undefined ||
    (list !== from && group.some(key => !accepts(options, key, list)))
  )
    return dropped
  const keys = draft.lists[list] ?? []
  const index = keys
    .slice(0, keys.indexOf(draft.key))
    .filter(key => !group.includes(key) && target.includes(key)).length
  return {
    ...model,
    lists: now,
    draft: Option.some({
      ...draft,
      from,
      lists: transferGroup(now, group, list, index),
    }),
  }
}

const pressKey = (
  model: Model,
  key: string,
  pressedKey: string,
  modified: boolean,
  direction: Direction,
  columns: number | undefined,
  options: Options,
): UpdateReturn => {
  if (Option.isNone(model.draft))
    return !modified && (pressedKey === ' ' || pressedKey === 'Enter')
      ? grab(model, key, options)
      : { model }
  const draft = model.draft.value
  if (draft.pointer || draft.key !== key) return { model }
  if (pressedKey === 'Tab') return cancel(model, options, false)
  if (pressedKey === ' ' || pressedKey === 'Enter') return drop(model, options)
  if (pressedKey === 'Escape') return cancel(model, options)
  const list = Option.getOrElse(listWith(draft.lists, key), () => draft.from)
  const keys = draft.lists[list] ?? []
  const group = draftKeys(draft)
  const index = keys
    .slice(0, keys.indexOf(key))
    .filter(item => !group.includes(item)).length
  const stride = Math.max(1, columns ?? 1)
  if (pressedKey === 'ArrowUp')
    return moveTo(model, list, index - stride, options)
  if (pressedKey === 'ArrowDown')
    return moveTo(model, list, index + stride, options)
  if (pressedKey === 'Home') return moveTo(model, list, 0, options)
  if (pressedKey === 'End') return moveTo(model, list, keys.length, options)
  const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  const across = pressedKey === forward ? 1 : pressedKey === backward ? -1 : 0
  if (across === 0 || modified) return { model }
  if (columns !== undefined) return moveTo(model, list, index + across, options)
  const names = options.order ?? Object.keys(model.lists)
  for (
    let position = names.indexOf(list) + across;
    position >= 0 && position < names.length;
    position += across
  ) {
    const name = names[position]
    if (name === undefined) continue
    const result = moveTo(model, name, index, options)
    if (result.model !== model) return result
  }
  return { model }
}

const releasePointer = (model: Model, pointer: Pointer, options: Options) =>
  Option.match(model.draft, {
    onNone: () => ({ model: settled(model) }),
    onSome: draft =>
      draft.pointer
        ? commit(model, draft, 'drag', options, pointer.focused)
        : { model: settled(model) },
  })

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  const pointer = Option.getOrUndefined(model.pointer)
  return Message.match<UpdateReturn>(message, {
    PressedKey: ({ key, pressedKey, modified, direction, columns }) =>
      pressKey(model, key, pressedKey, modified, direction, columns, options),
    PressedItem: ({ key, pointerId, at, offset, size, focused }) =>
      pointer !== undefined ||
      Option.isSome(model.draft) ||
      options.disabled?.(key) === true
        ? { model }
        : {
            model: {
              ...model,
              pointer: Option.some({
                id: pointerId,
                key,
                origin: at,
                at,
                offset,
                size,
                focused,
              }),
            },
          },
    MovedPointer: ({ pointerId, at, maybeSlot, precedingKeys }) => {
      if (pointer?.id !== pointerId) return { model }
      const tracked = { ...model, pointer: Option.some({ ...pointer, at }) }
      const isDragging = Option.exists(model.draft, draft => draft.pointer)
      if (
        !isDragging &&
        !isDrag(at.x - pointer.origin.x, at.y - pointer.origin.y)
      )
        return { model: tracked }
      const picked = isDragging
        ? { model: tracked }
        : Option.match(startDraft(tracked, pointer.key, true, options), {
            onNone: () => ({ model: settled(tracked) }),
            onSome: next =>
              announced(next, 'grab', pointer.key, next.lists, options),
          })
      if (Option.isNone(picked.model.draft) || Option.isNone(maybeSlot))
        return picked
      const group = draftKeys(picked.model.draft.value)
      const moved = moveTo(
        picked.model,
        maybeSlot.value.list,
        precedingKeys === undefined
          ? maybeSlot.value.index
          : precedingKeys.filter(key => !group.includes(key)).length,
        options,
      )
      return moved.model === picked.model ? picked : moved
    },
    ReleasedPointer: ({ pointerId }) =>
      pointer?.id === pointerId
        ? releasePointer(model, pointer, options)
        : { model },
    CancelledPointer: ({ pointerId }) =>
      pointer?.id === pointerId ? cancel(model, options) : { model },
    CancelledTransfer: () => cancel(model, options, false),
    CompletedFocusItem: () => ({ model }),
  })
}

export type Preview<Key extends string> = Readonly<{
  key: Key
  count?: number
  x: number
  y: number
  width: number
  height: number
}>

export const preview = (model: Model): Option.Option<Preview<string>> =>
  Option.flatMap(model.pointer, pointer => {
    const draft = Option.getOrUndefined(model.draft)
    if (draft?.pointer !== true || draft.key !== pointer.key)
      return Option.none()
    const count = draftKeys(draft).length
    return Option.some({
      key: pointer.key,
      ...(count > 1 ? { count } : {}),
      x: pointer.at.x - pointer.offset.x,
      y: pointer.at.y - pointer.offset.y,
      width: pointer.size.width,
      height: pointer.size.height,
    })
  })

export const previewAttributes = <Message>(
  preview: Pick<Preview<string>, 'x' | 'y' | 'width' | 'count'>,
  h: HtmlBuilder<Message>,
  decoration?: Readonly<Record<string, string>>,
): ReadonlyArray<Attribute<Message>> => {
  const count = String(preview.count ?? 1)
  return [
    h.AriaHidden(true),
    h.Inert(true),
    h.DataAttribute('drag-count', count),
    h.Style({
      ...decoration,
      '--drag-count': count,
      position: 'fixed',
      pointerEvents: 'none',
      left: `${preview.x}px`,
      top: `${preview.y}px`,
      width: `${preview.width}px`,
    }),
  ]
}

type InputMessage =
  | typeof Message.PressedKey.Type
  | typeof Message.PressedItem.Type
  | typeof Message.MovedPointer.Type
  | typeof Message.ReleasedPointer.Type
  | typeof Message.CancelledPointer.Type

const surfaceSelector = '[data-transfer-surface]'
const listSelector = '[data-transfer-list]'
const itemSelectorAttribute = '[data-transfer-key]'
const transferKeys = new Set([
  ' ',
  'Enter',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

const owned = (surface: Element, element: Element): boolean =>
  element.closest(surfaceSelector) === surface

const itemsIn = (surface: Element, list: Element): ReadonlyArray<Element> =>
  [...list.querySelectorAll(itemSelectorAttribute)].filter(
    item => owned(surface, item) && item.closest(listSelector) === list,
  )

const isGrid = (list: Element): boolean =>
  list.getAttribute('data-transfer-layout') === 'grid'

const isRtl = (element: Element): boolean =>
  element.ownerDocument.defaultView?.getComputedStyle(element).direction ===
  'rtl'

const distance = (rect: DOMRect, { x, y }: Point): number =>
  Math.hypot(
    x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0,
    y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0,
  )

const slotAt = (
  surface: Element,
  key: string,
  at: Point,
): {
  maybeSlot: Option.Option<typeof Slot.Type>
  precedingKeys?: ReadonlyArray<string>
} => {
  const nearest = [...surface.querySelectorAll(listSelector)]
    .filter(list => owned(surface, list))
    .map(list => ({
      list,
      distance: distance(list.getBoundingClientRect(), at),
    }))
    .reduce<{ list: Element; distance: number } | undefined>(
      (best, next) =>
        best === undefined || next.distance < best.distance ? next : best,
      undefined,
    )
  const name = nearest?.list.getAttribute('data-transfer-list')
  if (nearest === undefined || name == null) return { maybeSlot: Option.none() }
  const list = nearest.list
  const items = itemsIn(surface, list).filter(
    item => item.getAttribute('data-transfer-key') !== key,
  )
  const rects = items.map(item => item.getBoundingClientRect())
  const index = isGrid(list)
    ? gridDropIndex(rects, at, { reversed: isRtl(list) })
    : dropIndex(
        rects.map(rect => rect.top + rect.height / 2),
        at.y,
      )
  return {
    maybeSlot: Option.some({ list: name, index }),
    precedingKeys: items
      .slice(0, index)
      .map(item => item.getAttribute('data-transfer-key')!),
  }
}

const bindInput = (surface: Element, send: (message: InputMessage) => void) => {
  const doc = surface.ownerDocument
  const root = new AbortController()
  let stopTracking: (() => void) | undefined

  const handleOf = (target: EventTarget | null): Element | undefined => {
    if (!(target instanceof Element)) return undefined
    const handle = target.closest(itemSelectorAttribute)
    return handle !== null &&
      owned(surface, handle) &&
      !handle.hasAttribute('data-transfer-disabled')
      ? handle
      : undefined
  }

  const onKeyDown = (event: Event) => {
    if (!(event instanceof KeyboardEvent) || event.defaultPrevented) return
    const handle = handleOf(event.target)
    const key = handle?.getAttribute('data-transfer-key')
    if (handle === undefined || key == null) return
    const modified = event.altKey || event.ctrlKey || event.metaKey
    const isMoving = handle.hasAttribute('data-transfer-active')
    if (handle.hasAttribute('data-transfer-dragging')) return
    if (
      isMoving
        ? !transferKeys.has(event.key) && event.key !== 'Tab'
        : modified || (event.key !== ' ' && event.key !== 'Enter')
    )
      return
    if (event.key !== 'Tab') event.preventDefault()
    if (event.key === 'Escape') event.stopPropagation()
    const direction = isRtl(handle) ? 'rtl' : 'ltr'
    const list = handle.closest(listSelector)
    const columns =
      list !== null && isGrid(list)
        ? columnsOf(
            itemsIn(surface, list).map(
              item => item.getBoundingClientRect().top,
            ),
          )
        : undefined
    send(
      Message.PressedKey({
        key,
        pressedKey: event.key,
        modified,
        direction,
        ...(columns === undefined ? {} : { columns }),
      }),
    )
  }

  const track = (handle: Element, key: string, down: PointerEvent) => {
    const { pointerId } = down
    const tracking = new AbortController()
    const listener = { capture: true, signal: tracking.signal }
    let at = { x: down.clientX, y: down.clientY }
    let didDrag = false
    const moved = () =>
      send(
        Message.MovedPointer({
          pointerId,
          at,
          ...(didDrag
            ? slotAt(surface, key, at)
            : { maybeSlot: Option.none() }),
        }),
      )
    const scroller = surface.hasAttribute('data-transfer-auto-scroll')
      ? createAutoScroll(doc, {
          ignore: () => handle,
          onScroll: moved,
        })
      : undefined
    const suppressClick = (event: MouseEvent) => {
      if (event.detail === 0 || !event.composedPath().includes(handle)) return
      event.preventDefault()
      event.stopPropagation()
    }
    const stop = () => {
      tracking.abort()
      scroller?.stop()
      stopTracking = undefined
      if (didDrag) {
        doc.addEventListener('click', suppressClick, {
          capture: true,
          once: true,
        })
        doc.defaultView?.setTimeout(
          () => doc.removeEventListener('click', suppressClick, true),
          0,
        )
      }
    }
    const finish = (cancelled: boolean) => {
      stop()
      send(
        cancelled
          ? Message.CancelledPointer({ pointerId })
          : Message.ReleasedPointer({ pointerId }),
      )
    }
    doc.addEventListener(
      'pointermove',
      event => {
        if (event.pointerId !== pointerId) return
        if (event.pointerType === 'mouse' && event.buttons === 0) {
          finish(false)
          return
        }
        at = { x: event.clientX, y: event.clientY }
        if (!didDrag && isDrag(at.x - down.clientX, at.y - down.clientY))
          didDrag = true
        if (didDrag) {
          event.preventDefault()
          scroller?.update(at.x, at.y)
        }
        moved()
      },
      listener,
    )
    doc.addEventListener(
      'pointerup',
      event => {
        if (event.pointerId === pointerId) finish(false)
      },
      listener,
    )
    doc.addEventListener(
      'pointercancel',
      event => {
        if (event.pointerId === pointerId) finish(true)
      },
      listener,
    )
    doc.addEventListener(
      'keydown',
      event => {
        if (!didDrag || event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        finish(true)
      },
      listener,
    )
    doc.defaultView?.addEventListener('blur', () => finish(true), {
      signal: tracking.signal,
    })
    return stop
  }

  const onPointerDown = (event: Event) => {
    if (
      !(event instanceof PointerEvent) ||
      stopTracking !== undefined ||
      event.defaultPrevented ||
      event.button !== 0 ||
      !event.isPrimary
    )
      return
    const handle = handleOf(event.target)
    const key = handle?.getAttribute('data-transfer-key')
    if (handle === undefined || key == null) return
    const rect = handle.getBoundingClientRect()
    send(
      Message.PressedItem({
        key,
        pointerId: event.pointerId,
        at: { x: event.clientX, y: event.clientY },
        offset: { x: event.clientX - rect.left, y: event.clientY - rect.top },
        size: { width: rect.width, height: rect.height },
        focused: doc.activeElement === handle,
      }),
    )
    stopTracking = track(handle, key, event)
  }

  surface.addEventListener('keydown', onKeyDown, { signal: root.signal })
  surface.addEventListener('pointerdown', onPointerDown, {
    signal: root.signal,
  })
  return () => {
    root.abort()
    stopTracking?.()
  }
}

const TrackInput = Mount.defineStream('TrackTransferInput', {
  messages: [
    Message.PressedKey,
    Message.PressedItem,
    Message.MovedPointer,
    Message.ReleasedPointer,
    Message.CancelledPointer,
  ],
  execute: ({ element }) =>
    Stream.callback<InputMessage>(queue =>
      Effect.acquireRelease(
        Effect.sync(() =>
          bindInput(element, message => Queue.offerUnsafe(queue, message)),
        ),
        cleanup => Effect.sync(cleanup),
      ).pipe(Effect.andThen(Effect.never)),
    ),
})

export type ItemInfo<Key extends string> = Readonly<{
  key: Key
  index: number
  isMoving: boolean
  isDragging: boolean
  isDisabled: boolean
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ListInfo<Key extends string, List extends string> = Readonly<{
  list: List
  items: ReadonlyArray<ItemInfo<Key>>
  attributes: ReadonlyArray<ChildAttribute>
}>

export type ViewInputs<
  Key extends string = string,
  List extends string = string,
> = Readonly<{
  lists: ReadonlyArray<List>
  disabled?: (key: Key) => boolean
  autoScroll?: boolean
  layout?: 'vertical' | 'grid'
  preview?: boolean
  toView: (
    surface: ReadonlyArray<ChildAttribute>,
    lists: ReadonlyArray<ListInfo<Key, List>>,
    maybePreview: Option.Option<Preview<Key>>,
  ) => Html
}>

export type Bundle<
  Key extends string = string,
  List extends string = string,
> = Readonly<{
  view: SubmodelView<Model, Message, ViewInputs<Key, List>>
  update: typeof update
}>

export const create = <
  Key extends string = string,
  List extends string = string,
>(): Bundle<Key, List> => ({
  update,
  view: defineView<Model, Message, ViewInputs<Key, List>>(
    (model, inputs, h) => {
      const shown = lists(model)
      return inputs.toView(
        childAttributes([
          h.DataAttribute('transfer-surface', ''),
          ...(inputs.autoScroll === false
            ? []
            : [h.DataAttribute('transfer-auto-scroll', '')]),
          h.OnMount(TrackInput()),
          h.OnUnmount(Message.CancelledTransfer()),
        ]),
        inputs.lists.map(list => ({
          list,
          attributes: childAttributes([
            h.DataAttribute('transfer-list', list),
            ...(inputs.layout === 'grid'
              ? [h.DataAttribute('transfer-layout', 'grid')]
              : []),
          ]),
          items: (shown[list] ?? []).map((rawKey, index) => {
            // Keys come from the caller's typed lists.
            const key = rawKey as Key
            const isDisabled = inputs.disabled?.(key) === true
            const isMoving = moving(model, key)
            const isDragging = dragging(model, key)
            return {
              key,
              index,
              isMoving,
              isDragging,
              isDisabled,
              attributes: childAttributes([
                h.Id(itemId(model.id, key)),
                h.DataAttribute('transfer-key', key),
                ...(Option.exists(model.draft, draft => draft.key === key)
                  ? [h.DataAttribute('transfer-active', '')]
                  : []),
                ...(isMoving ? [h.DataAttribute('transfer-moving', '')] : []),
                ...(isDragging
                  ? [h.DataAttribute('transfer-dragging', '')]
                  : []),
                ...(isDisabled
                  ? [h.DataAttribute('transfer-disabled', '')]
                  : []),
              ]),
            }
          }),
        })),
        // Preview keys come from the same typed lists.
        inputs.preview === false
          ? Option.none()
          : (preview(model) as Option.Option<Preview<Key>>),
      )
    },
  ),
})

export const view = create().view

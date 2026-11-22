import { Option, Schema as S, Stream } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import * as DragBehavior from '@/lib/behaviors/drag'

const Drag = S.Struct({ start: S.Number, initialSize: S.Number })
export const Model = S.Struct({
  id: S.String,
  firstSize: S.Number,
  drag: S.Option(Drag),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  StartedResize: { position: S.Number },
  DraggedResize: {
    position: S.Number,
    extent: S.Number,
  },
  EndedResize: {},
  NudgedResize: { delta: S.Number },
})
export type Message = typeof Message.Type

export const clampTo = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))
const clamp = (value: number): number => clampTo(value, 10, 90)
export const init = (id: string, firstSize = 50): Model => ({
  id,
  firstSize: clamp(firstSize),
  drag: Option.none(),
})
export const update = (model: Model, message: Message): Model => {
  switch (message._tag) {
    case 'StartedResize':
      return {
        ...model,
        drag: Option.some({
          start: message.position,
          initialSize: model.firstSize,
        }),
      }
    case 'DraggedResize':
      return Option.match(model.drag, {
        onNone: () => model,
        onSome: drag => ({
          ...model,
          firstSize: clamp(
            drag.initialSize +
              ((message.position - drag.start) / Math.max(1, message.extent)) *
                100,
          ),
        }),
      })
    case 'EndedResize':
      return { ...model, drag: Option.none() }
    case 'NudgedResize':
      return { ...model, firstSize: clamp(model.firstSize + message.delta) }
  }
}

const GroupDrag = S.Struct({
  handle: S.Number,
  start: S.Number,
  before: S.Number,
  after: S.Number,
})
export const GroupModel = S.Struct({
  id: S.String,
  sizes: S.Array(S.Number),
  drag: S.Option(GroupDrag),
})
export type GroupModel = typeof GroupModel.Type

export const GroupMessage = defineMessageUnion({
  StartedGroupResize: {
    handle: S.Number,
    position: S.Number,
  },
  DraggedGroupResize: {
    position: S.Number,
    extent: S.Number,
    minSize: S.Number,
  },
  EndedGroupResize: {},
  NudgedGroupResize: {
    handle: S.Number,
    delta: S.Number,
    minSize: S.Number,
  },
})
export type GroupMessage = typeof GroupMessage.Type

const normalizedSizes = (
  count: number,
  sizes?: ReadonlyArray<number>,
): Array<number> => {
  if (count <= 0) return []
  const source =
    sizes?.length === count
      ? sizes.map(value => Math.max(0, value))
      : Array.from({ length: count }, () => 1)
  const total = source.reduce((sum, value) => sum + value, 0) || count
  return source.map(value => (value / total) * 100)
}

export const initGroup = (
  id: string,
  panelCount: number,
  sizes?: ReadonlyArray<number>,
): GroupModel => ({
  id,
  sizes: normalizedSizes(panelCount, sizes),
  drag: Option.none(),
})

const resizePair = (
  sizes: ReadonlyArray<number>,
  handle: number,
  delta: number,
  minSize: number,
): Array<number> => {
  const next = [...sizes]
  const before = sizes[handle]
  const after = sizes[handle + 1]
  if (before === undefined || after === undefined) return next
  const bounded = Math.max(minSize - before, Math.min(after - minSize, delta))
  next[handle] = before + bounded
  next[handle + 1] = after - bounded
  return next
}

export const updateGroup = (
  model: GroupModel,
  message: GroupMessage,
): GroupModel => {
  switch (message._tag) {
    case 'StartedGroupResize': {
      const before = model.sizes[message.handle]
      const after = model.sizes[message.handle + 1]
      return before === undefined || after === undefined
        ? model
        : {
            ...model,
            drag: Option.some({
              handle: message.handle,
              start: message.position,
              before,
              after,
            }),
          }
    }
    case 'DraggedGroupResize':
      return Option.match(model.drag, {
        onNone: () => model,
        onSome: drag => {
          const base = [...model.sizes]
          base[drag.handle] = drag.before
          base[drag.handle + 1] = drag.after
          return {
            ...model,
            sizes: resizePair(
              base,
              drag.handle,
              ((message.position - drag.start) / Math.max(1, message.extent)) *
                100,
              message.minSize,
            ),
          }
        },
      })
    case 'EndedGroupResize':
      return { ...model, drag: Option.none() }
    case 'NudgedGroupResize':
      return {
        ...model,
        sizes: resizePair(
          model.sizes,
          message.handle,
          message.delta,
          message.minSize,
        ),
      }
  }
}

const GROUP_SELECTOR = '[data-slot="resizable-panel-group"]'
const HANDLE_SELECTOR = '[data-slot="resizable-handle"]'

const targetHandle = (group: HTMLElement, event: PointerEvent) => {
  const handle =
    event.target instanceof Element
      ? event.target.closest(HANDLE_SELECTOR)
      : null
  return handle instanceof HTMLElement &&
    handle.closest(GROUP_SELECTOR) === group
    ? handle
    : null
}

const isEnabled = (handle: HTMLElement) =>
  handle.getAttribute('aria-disabled') !== 'true'

const resizeCoordinates = (group: HTMLElement) => {
  const vertical = group.dataset.direction === 'vertical'
  const sign = group.dir === 'rtl' && !vertical ? -1 : 1
  return {
    position: (event: PointerEvent) =>
      sign * (vertical ? event.clientY : event.clientX),
    extent: () =>
      Number(
        group.dataset.resizableExtent ??
          (vertical
            ? group.ownerDocument.defaultView?.innerHeight
            : group.ownerDocument.defaultView?.innerWidth) ??
          1,
      ),
  }
}

export const ObserveResize = Mount.defineStream('ObserveResize', {
  messages: [Message.StartedResize, Message.DraggedResize, Message.EndedResize],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : DragBehavior.observeDrag<
          Extract<
            Message,
            { _tag: 'StartedResize' | 'DraggedResize' | 'EndedResize' }
          >
        >(element, (down, send) => {
          const handle = targetHandle(element, down)
          if (!handle || !isEnabled(handle)) return
          const { position, extent } = resizeCoordinates(element)
          send(Message.StartedResize({ position: position(down) }))
          return {
            captureElement: handle,
            onMove: sample => {
              if (isEnabled(handle))
                send(
                  Message.DraggedResize({
                    position: position(sample.event),
                    extent: extent(),
                  }),
                )
            },
            onEnd: () => send(Message.EndedResize()),
          }
        }),
})

export const ObserveGroupResize = Mount.defineStream('ObserveGroupResize', {
  messages: [
    GroupMessage.StartedGroupResize,
    GroupMessage.DraggedGroupResize,
    GroupMessage.EndedGroupResize,
  ],
  execute: ({ element }) =>
    !(element instanceof HTMLElement)
      ? Stream.empty
      : DragBehavior.observeDrag<
          Extract<
            GroupMessage,
            {
              _tag:
                | 'StartedGroupResize'
                | 'DraggedGroupResize'
                | 'EndedGroupResize'
            }
          >
        >(element, (down, send) => {
          const handle = targetHandle(element, down)
          const index = handle?.dataset.resizableIndex
          if (!handle || index === undefined || !isEnabled(handle)) return
          const { position, extent } = resizeCoordinates(element)
          send(
            GroupMessage.StartedGroupResize({
              handle: Number(index),
              position: position(down),
            }),
          )
          return {
            captureElement: handle,
            onMove: sample => {
              if (isEnabled(handle))
                send(
                  GroupMessage.DraggedGroupResize({
                    position: position(sample.event),
                    extent: extent(),
                    minSize: Number(element.dataset.resizableMinSize),
                  }),
                )
            },
            onEnd: () => send(GroupMessage.EndedGroupResize()),
          }
        }),
})

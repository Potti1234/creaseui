import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { inertHtml, type Attribute, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Render from 'foldkit/render'
import { defineTaggedUnion } from 'foldkit/schema'
import * as Subscription from 'foldkit/subscription'

import { createAutoScroll } from './drag'

const Orientation = Schema.Literals(['Horizontal', 'Vertical'])
const Direction = Schema.Literals([
  'Up',
  'Down',
  'Left',
  'Right',
  'NextContainer',
  'PreviousContainer',
])
const ScreenPoint = Schema.Struct({
  screenX: Schema.Number,
  screenY: Schema.Number,
})
const ClientPoint = Schema.Struct({
  clientX: Schema.Number,
  clientY: Schema.Number,
})
const pointerIdentity = { pointerId: Schema.optionalKey(Schema.Number) }
const DropTarget = Schema.Struct({
  containerId: Schema.String,
  index: Schema.Number,
})
const source = {
  itemId: Schema.String,
  sourceContainerId: Schema.String,
  sourceIndex: Schema.Number,
}
const keyboardTarget = {
  targetContainerId: Schema.String,
  targetIndex: Schema.Number,
}
const activation = {
  itemId: Schema.String,
  containerId: Schema.String,
  index: Schema.Number,
}
const DragState = defineTaggedUnion({
  Idle: {},
  Pending: { ...activation, ...pointerIdentity, origin: ScreenPoint },
  Dragging: {
    ...source,
    ...pointerIdentity,
    origin: ScreenPoint,
    current: ClientPoint,
    maybeDropTarget: Schema.Option(DropTarget),
  },
  KeyboardDragging: { ...source, ...keyboardTarget },
})

export const Model = Schema.Struct({
  id: Schema.String,
  orientation: Orientation,
  activationThreshold: Schema.Number,
  dragState: DragState,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  PressedDraggable: {
    ...activation,
    ...pointerIdentity,
    ...ScreenPoint.fields,
  },
  MovedPointer: {
    ...ScreenPoint.fields,
    ...ClientPoint.fields,
    maybeDropTarget: Schema.Option(DropTarget),
  },
  ReleasedPointer: {},
  CancelledDrag: {},
  ActivatedKeyboardDrag: activation,
  CompletedResolveKeyboardMove: keyboardTarget,
  ConfirmedKeyboardDrop: {},
  PressedArrowKey: { direction: Direction },
  AdvancedAutoScrollFrame: {
    at: Schema.optionalKey(ClientPoint),
    maybeDropTarget: Schema.optionalKey(Schema.Option(DropTarget)),
  },
  CompletedFocusItem: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Reordered: {
    itemId: Schema.String,
    fromContainerId: Schema.String,
    fromIndex: Schema.Number,
    toContainerId: Schema.String,
    toIndex: Schema.Number,
  },
  Cancelled: {},
})
export type OutMessage = typeof OutMessage.Type

type InitConfig = Readonly<{
  id: string
  orientation?: typeof Orientation.Type
  activationThreshold?: number
}>

export const init = ({
  id,
  orientation = 'Vertical',
  activationThreshold = 5,
}: InitConfig): Model => ({
  id,
  orientation,
  activationThreshold,
  dragState: DragState.Idle(),
})

const containerSelector = '[data-droppable-id]'
const findHandle = (doc: Document, itemId: string) =>
  Array.from(doc.querySelectorAll<HTMLElement>('[data-draggable-id]')).find(
    handle => handle.getAttribute('data-draggable-id') === itemId,
  )
const rowsIn = (container: Element) =>
  Array.from(container.querySelectorAll('[data-sortable-id]')).filter(
    row => row.closest(containerSelector) === container,
  )

const FocusItem = Command.define('FocusDragItem', {
  args: { itemId: Schema.String },
  messages: [Message.CompletedFocusItem],
  execute: ({ itemId }) =>
    Render.afterCommit.pipe(
      Effect.map(() => {
        findHandle(document, itemId)?.focus()
        return Message.CompletedFocusItem()
      }),
    ),
})

const ResolveKeyboardMove = Command.define('ResolveDragKeyboardMove', {
  args: {
    itemId: Schema.String,
    currentContainerId: Schema.String,
    currentIndex: Schema.Number,
    direction: Direction,
  },
  messages: [Message.CompletedResolveKeyboardMove],
  execute: ({ itemId, currentContainerId, currentIndex, direction }) =>
    Effect.sync(() => {
      const containers = Array.from(
        document.querySelectorAll(containerSelector),
      )
      const index = containers.findIndex(
        container =>
          container.getAttribute('data-droppable-id') === currentContainerId,
      )
      const container = containers[index]
      let targetContainerId = currentContainerId
      let targetIndex = currentIndex
      if (container !== undefined) {
        if (
          direction === 'NextContainer' ||
          direction === 'PreviousContainer'
        ) {
          const neighbor =
            containers[index + (direction === 'NextContainer' ? 1 : -1)]
          const neighborId = neighbor?.getAttribute('data-droppable-id')
          if (neighborId) {
            targetContainerId = neighborId
            targetIndex = 0
          }
        } else {
          const count = rowsIn(container).filter(
            row => row.getAttribute('data-sortable-id') !== itemId,
          ).length
          const delta = direction === 'Down' || direction === 'Right' ? 1 : -1
          targetIndex = Math.max(0, Math.min(count, currentIndex + delta))
        }
      }
      return Message.CompletedResolveKeyboardMove({
        targetContainerId,
        targetIndex,
      })
    }),
})

const hitTest = (
  doc: Document,
  x: number,
  y: number,
  orientation: typeof Orientation.Type,
): Option.Option<typeof DropTarget.Type> => {
  const container = doc
    .elementsFromPoint(x, y)
    .map(element => element.closest(containerSelector))
    .find(element => element !== null)
  const containerId = container?.getAttribute('data-droppable-id')
  if (!container || !containerId) return Option.none()

  const rows = rowsIn(container)
  const before = rows.findIndex(row => {
    const rect = row.getBoundingClientRect()
    return orientation === 'Vertical'
      ? y < rect.top + rect.height / 2
      : x < rect.left + rect.width / 2
  })
  return Option.some({
    containerId,
    index: before === -1 ? rows.length : before,
  })
}

const documentDragStyles = new WeakMap<
  Document,
  { count: number; restore: () => void }
>()

const lockDragStyles = (doc: Document): (() => void) => {
  let lock = documentDragStyles.get(doc)
  if (lock === undefined) {
    const rootStyle = doc.documentElement.style
    const previous = ['user-select', '-webkit-user-select'].map(property => ({
      property,
      value: rootStyle.getPropertyValue(property),
      priority: rootStyle.getPropertyPriority(property),
    }))
    for (const { property } of previous)
      rootStyle.setProperty(property, 'none', 'important')
    const cursor = doc.createElement('style')
    cursor.textContent = '* { cursor: grabbing !important; }'
    doc.head.append(cursor)
    lock = {
      count: 0,
      restore: () => {
        cursor.remove()
        for (const { property, value, priority } of previous)
          rootStyle.setProperty(property, value, priority)
      },
    }
    documentDragStyles.set(doc, lock)
  }
  const acquired = lock
  acquired.count++
  return () => {
    acquired.count--
    if (acquired.count === 0) {
      documentDragStyles.delete(doc)
      acquired.restore()
    }
  }
}

const trackPointer = (
  doc: Document,
  orientation: typeof Orientation.Type,
  pointerId: number | undefined,
  itemId: string,
) =>
  Stream.callback<Message>(queue =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const unlock = lockDragStyles(doc)
        const handle =
          pointerId === undefined ? undefined : findHandle(doc, itemId)
        let finished = false
        const accepts = (event: PointerEvent) =>
          !finished &&
          (pointerId === undefined || event.pointerId === pointerId)
        const move = (event: PointerEvent) => {
          if (!accepts(event)) return
          const { screenX, screenY, clientX, clientY } = event
          Queue.offerUnsafe(
            queue,
            Message.MovedPointer({
              screenX,
              screenY,
              clientX,
              clientY,
              maybeDropTarget: hitTest(doc, clientX, clientY, orientation),
            }),
          )
        }
        const finish = (event: PointerEvent, message: Message) => {
          if (!accepts(event)) return
          finished = true
          Queue.offerUnsafe(queue, message)
        }
        const release = (event: PointerEvent) =>
          finish(event, Message.ReleasedPointer())
        const cancel = (event: PointerEvent) =>
          finish(event, Message.CancelledDrag())
        doc.addEventListener('pointermove', move)
        doc.addEventListener('pointerup', release)
        doc.addEventListener('pointercancel', cancel)
        handle?.addEventListener('lostpointercapture', cancel)
        if (pointerId !== undefined) {
          try {
            handle?.setPointerCapture?.(pointerId)
          } catch {
            // The pointer may already be inactive before the subscription starts.
          }
        }
        return () => {
          doc.removeEventListener('pointermove', move)
          doc.removeEventListener('pointerup', release)
          doc.removeEventListener('pointercancel', cancel)
          handle?.removeEventListener('lostpointercapture', cancel)
          if (pointerId !== undefined && handle?.hasPointerCapture?.(pointerId))
            handle.releasePointerCapture(pointerId)
          unlock()
        }
      }),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.andThen(Effect.never)),
  )

const keyboardMove = (event: KeyboardEvent): Option.Option<Message> => {
  if (event.defaultPrevented) return Option.none()
  switch (event.key) {
    case ' ':
    case 'Enter':
      return Option.some(Message.ConfirmedKeyboardDrop())
    case 'Tab':
      return Option.some(
        Message.PressedArrowKey({
          direction: event.shiftKey ? 'PreviousContainer' : 'NextContainer',
        }),
      )
    case 'ArrowUp':
      return Option.some(Message.PressedArrowKey({ direction: 'Up' }))
    case 'ArrowDown':
      return Option.some(Message.PressedArrowKey({ direction: 'Down' }))
    case 'ArrowLeft':
      return Option.some(Message.PressedArrowKey({ direction: 'Left' }))
    case 'ArrowRight':
      return Option.some(Message.PressedArrowKey({ direction: 'Right' }))
    default:
      return Option.none()
  }
}

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  documentPointer: entry(
    {
      active: Schema.Boolean,
      orientation: Orientation,
      itemId: Schema.String,
      ...pointerIdentity,
    },
    {
      modelToDependencies: ({ dragState, orientation }) => {
        const active =
          dragState._tag === 'Pending' || dragState._tag === 'Dragging'
        const pointerId = active ? dragState.pointerId : undefined
        return {
          active,
          orientation,
          itemId: active ? dragState.itemId : '',
          ...(pointerId === undefined ? {} : { pointerId }),
        }
      },
      dependenciesToStream: ({ active, orientation, pointerId, itemId }) =>
        active
          ? trackPointer(document, orientation, pointerId, itemId)
          : Stream.empty,
    },
  ),
  documentEscape: entry(
    { active: Schema.Boolean },
    {
      modelToDependencies: ({ dragState }) => ({
        active: dragState._tag !== 'Idle',
      }),
      dependenciesToStream: ({ active }) =>
        active
          ? Stream.fromEventListener<KeyboardEvent>(document, 'keydown').pipe(
              Stream.filter(event => event.key === 'Escape'),
              Stream.map(() => Message.CancelledDrag()),
            )
          : Stream.empty,
    },
  ),
  documentKeyboard: entry(
    { active: Schema.Boolean },
    {
      modelToDependencies: ({ dragState }) => ({
        active: dragState._tag === 'KeyboardDragging',
      }),
      dependenciesToStream: ({ active }) =>
        active
          ? Subscription.fromEventFilterMapPreventDefault({
              target: document,
              type: 'keydown',
              filterMapEvent: keyboardMove,
            })
          : Stream.empty,
    },
  ),
  autoScroll: entry(
    { active: Schema.Boolean, orientation: Orientation, ...ClientPoint.fields },
    {
      modelToDependencies: ({ dragState, orientation }) => ({
        active: dragState._tag === 'Dragging',
        orientation,
        clientX: dragState._tag === 'Dragging' ? dragState.current.clientX : 0,
        clientY: dragState._tag === 'Dragging' ? dragState.current.clientY : 0,
      }),
      dependenciesToStream: ({ active, orientation, clientX, clientY }) =>
        active
          ? Stream.callback<Message>(queue =>
              Effect.acquireRelease(
                Effect.sync(() => {
                  const doc = document
                  const scroller = createAutoScroll(doc, {
                    edge: 40,
                    speed: 15,
                    onScroll: () => {
                      Queue.offerUnsafe(
                        queue,
                        Message.AdvancedAutoScrollFrame({
                          at: { clientX, clientY },
                          maybeDropTarget: hitTest(
                            doc,
                            clientX,
                            clientY,
                            orientation,
                          ),
                        }),
                      )
                    },
                  })
                  scroller.update(clientX, clientY)
                  return scroller.stop
                }),
                cleanup => Effect.sync(cleanup),
              ).pipe(Effect.andThen(Effect.never)),
            )
          : Stream.empty,
    },
  ),
}))

export const ghostStyle = ({
  dragState,
}: Model): Option.Option<Record<string, string>> =>
  dragState._tag === 'Dragging'
    ? Option.some({
        position: 'fixed',
        top: '0',
        left: '0',
        transform: `translate3d(${dragState.current.clientX}px, ${dragState.current.clientY}px, 0)`,
        'pointer-events': 'none',
        'z-index': '9999',
      })
    : Option.none()

export const isDragging = ({ dragState }: Model): boolean =>
  dragState._tag === 'Dragging' || dragState._tag === 'KeyboardDragging'

export const maybeDraggedItemId = ({
  dragState,
}: Model): Option.Option<string> =>
  dragState._tag === 'Idle' ? Option.none() : Option.some(dragState.itemId)

export const maybeDropTarget = ({
  dragState,
}: Model): Option.Option<typeof DropTarget.Type> => {
  if (dragState._tag === 'Dragging') return dragState.maybeDropTarget
  if (dragState._tag === 'KeyboardDragging') {
    return Option.some({
      containerId: dragState.targetContainerId,
      index: dragState.targetIndex,
    })
  }
  return Option.none()
}

const reordered = (
  state:
    | typeof DragState.Dragging.Type
    | typeof DragState.KeyboardDragging.Type,
  target: typeof DropTarget.Type,
): OutMessage =>
  OutMessage.Reordered({
    itemId: state.itemId,
    fromContainerId: state.sourceContainerId,
    fromIndex: state.sourceIndex,
    toContainerId: target.containerId,
    toIndex: target.index,
  })

export const update = (
  model: Model,
  message: Message,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
  const state = model.dragState
  const idle = () => ({ ...model, dragState: DragState.Idle() })
  return Message.match(message, {
    PressedDraggable: ({
      itemId,
      containerId,
      index,
      screenX,
      screenY,
      pointerId,
    }) =>
      state._tag !== 'Idle'
        ? { model }
        : {
            model: {
              ...model,
              dragState: DragState.Pending({
                itemId,
                containerId,
                index,
                ...(pointerId === undefined ? {} : { pointerId }),
                origin: { screenX, screenY },
              }),
            },
          },
    MovedPointer: ({ screenX, screenY, clientX, clientY, maybeDropTarget }) => {
      const current = { clientX, clientY }
      if (state._tag === 'Dragging') {
        return {
          model: {
            ...model,
            dragState: { ...state, current, maybeDropTarget },
          },
        }
      }
      if (state._tag !== 'Pending') return { model }
      const distance = Math.hypot(
        screenX - state.origin.screenX,
        screenY - state.origin.screenY,
      )
      if (distance < model.activationThreshold) return { model }
      return {
        model: {
          ...model,
          dragState: DragState.Dragging({
            itemId: state.itemId,
            sourceContainerId: state.containerId,
            sourceIndex: state.index,
            ...(state.pointerId === undefined
              ? {}
              : { pointerId: state.pointerId }),
            origin: state.origin,
            current,
            maybeDropTarget,
          }),
        },
      }
    },
    ReleasedPointer: () => {
      if (state._tag === 'Pending') return { model: idle() }
      if (state._tag !== 'Dragging') return { model }
      return {
        model: idle(),
        outMessage: Option.isSome(state.maybeDropTarget)
          ? reordered(state, state.maybeDropTarget.value)
          : OutMessage.Cancelled(),
      }
    },
    CancelledDrag: () => ({
      model: idle(),
      commands:
        state._tag === 'KeyboardDragging'
          ? [FocusItem({ itemId: state.itemId })]
          : [],
      ...(isDragging(model) ? { outMessage: OutMessage.Cancelled() } : {}),
    }),
    ActivatedKeyboardDrag: ({ itemId, containerId, index }) => ({
      model: {
        ...model,
        dragState: DragState.KeyboardDragging({
          itemId,
          sourceContainerId: containerId,
          sourceIndex: index,
          targetContainerId: containerId,
          targetIndex: index,
        }),
      },
    }),
    CompletedResolveKeyboardMove: ({ targetContainerId, targetIndex }) =>
      state._tag === 'KeyboardDragging'
        ? {
            model: {
              ...model,
              dragState: { ...state, targetContainerId, targetIndex },
            },
            commands: [FocusItem({ itemId: state.itemId })],
          }
        : { model },
    ConfirmedKeyboardDrop: () =>
      state._tag === 'KeyboardDragging'
        ? {
            model: idle(),
            commands: [FocusItem({ itemId: state.itemId })],
            outMessage: reordered(state, {
              containerId: state.targetContainerId,
              index: state.targetIndex,
            }),
          }
        : { model },
    PressedArrowKey: ({ direction }) =>
      state._tag === 'KeyboardDragging'
        ? {
            model,
            commands: [
              ResolveKeyboardMove({
                itemId: state.itemId,
                currentContainerId: state.targetContainerId,
                currentIndex: state.targetIndex,
                direction,
              }),
            ],
          }
        : { model },
    AdvancedAutoScrollFrame: ({ at, maybeDropTarget }) =>
      state._tag === 'Dragging' &&
      maybeDropTarget !== undefined &&
      (at === undefined ||
        (at.clientX === state.current.clientX &&
          at.clientY === state.current.clientY))
        ? { model: { ...model, dragState: { ...state, maybeDropTarget } } }
        : { model },
    CompletedFocusItem: () => ({ model }),
  })
}

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model
  toParentMessage: (
    message:
      | typeof Message.PressedDraggable.Type
      | typeof Message.ActivatedKeyboardDrag.Type,
  ) => ParentMessage
  itemId: string
  containerId: string
  index: number
  isDisabled?: boolean
}>

export const view = <ParentMessage>(
  {
    model,
    toParentMessage,
    itemId,
    containerId,
    index,
    isDisabled,
  }: ViewConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): ReadonlyArray<Attribute<ParentMessage>> => [
  h.DataAttribute('draggable-id', itemId),
  h.OnPointerDown(
    (
      _pointerType,
      button,
      screenX,
      screenY,
      _timeStamp,
      _clientX,
      _clientY,
      pointerId,
    ) =>
      button === 0 && isDisabled !== true
        ? Option.some(
            toParentMessage(
              Message.PressedDraggable({
                itemId,
                containerId,
                index,
                screenX,
                screenY,
                pointerId,
              }),
            ),
          )
        : Option.none(),
  ),
  h.OnKeyDownPreventDefault(key =>
    (key === ' ' || key === 'Enter') &&
    model.dragState._tag === 'Idle' &&
    isDisabled !== true
      ? Option.some(
          toParentMessage(
            Message.ActivatedKeyboardDrag({ itemId, containerId, index }),
          ),
        )
      : Option.none(),
  ),
]

export const dropTarget = (
  containerId: string,
): ReadonlyArray<Attribute<never>> => [
  inertHtml.DataAttribute('droppable-id', containerId),
]

export const sortable = (itemId: string): ReadonlyArray<Attribute<never>> => [
  inertHtml.DataAttribute('sortable-id', itemId),
]

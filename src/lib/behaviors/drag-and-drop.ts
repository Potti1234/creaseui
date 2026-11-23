import { DragAndDrop as FoldkitDragAndDrop } from '@foldkit/ui'
import { Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import { inertHtml, type Attribute, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineTaggedUnion } from 'foldkit/schema'
import type { Subscriptions } from 'foldkit/subscription'

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
  Pending: { ...activation, origin: ScreenPoint },
  Dragging: {
    ...source,
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
  PressedDraggable: { ...activation, ...ScreenPoint.fields },
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
  AdvancedAutoScrollFrame: {},
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

export const subscriptions =
  FoldkitDragAndDrop.subscriptions satisfies Subscriptions<Model, Message>
export const ghostStyle: (
  model: Model,
) => Option.Option<Record<string, string>> = FoldkitDragAndDrop.ghostStyle
const { FocusItem, ResolveKeyboardMove } = FoldkitDragAndDrop

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
    PressedDraggable: ({ itemId, containerId, index, screenX, screenY }) => ({
      model: {
        ...model,
        dragState: DragState.Pending({
          itemId,
          containerId,
          index,
          origin: { screenX, screenY },
        }),
      },
    }),
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
    AdvancedAutoScrollFrame: () => ({ model }),
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
  h.OnPointerDown((_pointerType, button, screenX, screenY) =>
    button === 0 && isDisabled !== true
      ? Option.some(
          toParentMessage(
            Message.PressedDraggable({
              itemId,
              containerId,
              index,
              screenX,
              screenY,
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

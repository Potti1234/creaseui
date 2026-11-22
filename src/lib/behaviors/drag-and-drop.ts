import { DragAndDrop as FoldkitDragAndDrop } from '@foldkit/ui'
import { Option } from 'effect'
import { inertHtml, type Attribute, type HtmlBuilder } from 'foldkit/html'

export const {
  Model,
  Message,
  OutMessage,
  init,
  update,
  subscriptions,
  sortable,
  ghostStyle,
  isDragging,
  maybeDraggedItemId,
  maybeDropTarget,
} = FoldkitDragAndDrop

export type Model = FoldkitDragAndDrop.Model
export type Message = FoldkitDragAndDrop.Message
export type OutMessage = FoldkitDragAndDrop.OutMessage

export type ViewConfig<ParentMessage> =
  FoldkitDragAndDrop.DraggableConfig<ParentMessage> &
    Readonly<{ isDisabled?: boolean }>

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

import type { Update } from 'foldkit'
import { Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'
import { Dialog } from '@foldkit/ui'

export const DragPhase = S.Literals(['Idle', 'Dragging'])
export type DragPhase = typeof DragPhase.Type
export const SnapDecision = S.Literals(['Resting', 'ReturnOpen', 'Dismiss'])
export type SnapDecision = typeof SnapDecision.Type
export const Model = S.Struct({ dialog: Dialog.Model, dragPhase: DragPhase, dragStart: S.Option(S.Number), dragOffset: S.Number, dragVelocity: S.Number, lastOffset: S.Number, lastTimeStamp: S.Number, snapDecision: SnapDecision, popupSize: S.Option(S.Number) })
export type Model = typeof Model.Type






export const Message = defineMessageUnion({
  'GotDrawerDialogMessage': { message: Dialog.Message },
  'StartedDrawerDrag': { position: S.Number, timeStamp: S.Number },
  'DraggedDrawer': { offset: S.Number, timeStamp: S.Number },
  'EndedDrawerDrag': {},
  'CancelledDrawerDrag': {},
  'MeasuredDrawerPopupSize': { size: S.Number },
});
export type Message = typeof Message.Type
export const OutMessage = Dialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export const DISMISS_DISTANCE = 120
export const DISMISS_VELOCITY = 0.65
export const MIN_FLING_DISTANCE = 24
export const DISMISS_SIZE_RATIO = 0.5
export const MIN_DISMISS_DISTANCE = 10
export const init = (config: Dialog.InitConfig): Model => ({ dialog: Dialog.init(config), dragPhase: 'Idle', dragStart: Option.none(), dragOffset: 0, dragVelocity: 0, lastOffset: 0, lastTimeStamp: 0, snapDecision: 'Resting', popupSize: Option.none() })
export const MeasureDrawerPopup = Mount.define('MeasureDrawerPopup', {
  args: { direction: S.Literals(['top', 'right', 'bottom', 'left']) },
  messages: [Message.MeasuredDrawerPopupSize],
  execute: ({ element, direction }) =>
    Effect.sync(() =>
      Message.MeasuredDrawerPopupSize({
        size: element instanceof HTMLElement
          ? direction === 'left' || direction === 'right'
            ? element.offsetWidth
            : element.offsetHeight
          : 0,
      }),
    ),
})
type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>
const mapDialogResult = (model: Model, result: ReturnType<typeof Dialog.update>): UpdateReturn => {
  const { model: dialog, commands: dialogCommands__, outMessage: dialogOut__ } = result
  const commands = dialogCommands__ ?? []
  const out = dialogOut__
  return { model: { ...model, dialog }, commands: Command.mapMessages(commands, message => Message['GotDrawerDialogMessage']({ message })), ...(out === undefined ? {} : { outMessage: out }) }
}
const settled = (model: Model, snapDecision: SnapDecision): Model => ({ ...model, dragPhase: 'Idle', dragStart: Option.none(), dragOffset: 0, dragVelocity: 0, lastOffset: 0, lastTimeStamp: 0, snapDecision })
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotDrawerDialogMessage': return mapDialogResult(model, Dialog.update(model.dialog, message.message))
    case 'StartedDrawerDrag': return { model: { ...model, dragPhase: 'Dragging', dragStart: Option.some(message.position), dragOffset: 0, dragVelocity: 0, lastOffset: 0, lastTimeStamp: message.timeStamp, snapDecision: 'Resting' } }
    case 'DraggedDrawer': {
      if (model.dragPhase !== 'Dragging') return { model: model }
      const offset = Math.max(0, message.offset)
      const elapsed = Math.max(1, message.timeStamp - model.lastTimeStamp)
      return { model: { ...model, dragOffset: offset, dragVelocity: (offset - model.lastOffset) / elapsed, lastOffset: offset, lastTimeStamp: message.timeStamp } }
    }
    case 'CancelledDrawerDrag': return { model: settled(model, 'ReturnOpen') }
    case 'MeasuredDrawerPopupSize': return { model: message.size > 0 ? { ...model, popupSize: Option.some(message.size) } : model }
    case 'EndedDrawerDrag': {
      if (model.dragPhase !== 'Dragging') return { model: model }
      const dismissDistance = Option.match(model.popupSize, {
        onNone: () => DISMISS_DISTANCE,
        onSome: (size) => Math.max(size * DISMISS_SIZE_RATIO, MIN_DISMISS_DISTANCE),
      })
      const dismiss = model.dragOffset >= dismissDistance || (model.dragOffset >= MIN_FLING_DISTANCE && model.dragVelocity >= DISMISS_VELOCITY)
      const next = settled(model, dismiss ? 'Dismiss' : 'ReturnOpen')
      return dismiss ? mapDialogResult(next, Dialog.close(model.dialog)) : { model: next, }
    }
  }
}
export const open = (model: Model): UpdateReturn => mapDialogResult(settled(model, 'Resting'), Dialog.open(model.dialog))
export const close = (model: Model): UpdateReturn => mapDialogResult(settled(model, 'Dismiss'), Dialog.close(model.dialog))

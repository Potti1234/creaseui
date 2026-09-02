import { Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { m } from 'foldkit/message'
import { Dialog } from '@foldkit/ui'

export const DragPhase = S.Literals(['Idle', 'Dragging'])
export type DragPhase = typeof DragPhase.Type
export const SnapDecision = S.Literals(['Resting', 'ReturnOpen', 'Dismiss'])
export type SnapDecision = typeof SnapDecision.Type
export const Model = S.Struct({ dialog: Dialog.Model, dragPhase: DragPhase, dragStart: S.Option(S.Number), dragOffset: S.Number, dragVelocity: S.Number, lastOffset: S.Number, lastTimeStamp: S.Number, snapDecision: SnapDecision })
export type Model = typeof Model.Type

export const GotDialogMessage = m('GotDrawerDialogMessage', { message: Dialog.Message })
export const StartedDrag = m('StartedDrawerDrag', { position: S.Number, timeStamp: S.Number })
export const Dragged = m('DraggedDrawer', { offset: S.Number, timeStamp: S.Number })
export const EndedDrag = m('EndedDrawerDrag')
export const CancelledDrag = m('CancelledDrawerDrag')
export const Message = S.Union([GotDialogMessage, StartedDrag, Dragged, EndedDrag, CancelledDrag])
export type Message = typeof Message.Type
export const OutMessage = Dialog.OutMessage
export type OutMessage = typeof OutMessage.Type

export const DISMISS_DISTANCE = 120
export const DISMISS_VELOCITY = 0.65
export const MIN_FLING_DISTANCE = 24
export const init = (config: Dialog.InitConfig): Model => ({ dialog: Dialog.init(config), dragPhase: 'Idle', dragStart: Option.none(), dragOffset: 0, dragVelocity: 0, lastOffset: 0, lastTimeStamp: 0, snapDecision: 'Resting' })
type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>, Option.Option<OutMessage>]
const mapDialogResult = (model: Model, result: ReturnType<typeof Dialog.update>): UpdateReturn => {
  const [dialog, commands, out] = result
  return [{ ...model, dialog }, Command.mapMessages(commands, message => GotDialogMessage({ message })), out]
}
const settled = (model: Model, snapDecision: SnapDecision): Model => ({ ...model, dragPhase: 'Idle', dragStart: Option.none(), dragOffset: 0, dragVelocity: 0, lastOffset: 0, lastTimeStamp: 0, snapDecision })
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotDrawerDialogMessage': return mapDialogResult(model, Dialog.update(model.dialog, message.message))
    case 'StartedDrawerDrag': return [{ ...model, dragPhase: 'Dragging', dragStart: Option.some(message.position), dragOffset: 0, dragVelocity: 0, lastOffset: 0, lastTimeStamp: message.timeStamp, snapDecision: 'Resting' }, [], Option.none()]
    case 'DraggedDrawer': {
      if (model.dragPhase !== 'Dragging') return [model, [], Option.none()]
      const offset = Math.max(0, message.offset)
      const elapsed = Math.max(1, message.timeStamp - model.lastTimeStamp)
      return [{ ...model, dragOffset: offset, dragVelocity: (offset - model.lastOffset) / elapsed, lastOffset: offset, lastTimeStamp: message.timeStamp }, [], Option.none()]
    }
    case 'CancelledDrawerDrag': return [settled(model, 'ReturnOpen'), [], Option.none()]
    case 'EndedDrawerDrag': {
      if (model.dragPhase !== 'Dragging') return [model, [], Option.none()]
      const dismiss = model.dragOffset >= DISMISS_DISTANCE || (model.dragOffset >= MIN_FLING_DISTANCE && model.dragVelocity >= DISMISS_VELOCITY)
      const next = settled(model, dismiss ? 'Dismiss' : 'ReturnOpen')
      return dismiss ? mapDialogResult(next, Dialog.close(model.dialog)) : [next, [], Option.none()]
    }
  }
}
export const open = (model: Model): UpdateReturn => mapDialogResult(settled(model, 'Resting'), Dialog.open(model.dialog))
export const close = (model: Model): UpdateReturn => mapDialogResult(settled(model, 'Dismiss'), Dialog.close(model.dialog))

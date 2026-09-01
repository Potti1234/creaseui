import { Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { m } from 'foldkit/message'
import { Dialog } from '@foldkit/ui'

export const Model = Dialog.Model
export type Model = typeof Model.Type

export const GotDialogMessage = m('GotAlertDialogPrimitiveMessage', { message: Dialog.Message })
export const RequestedCancel = m('RequestedAlertDialogCancel')
export const RequestedConfirm = m('RequestedAlertDialogConfirm')
export const Message = S.Union([GotDialogMessage, RequestedCancel, RequestedConfirm])
export type Message = typeof Message.Type

export const Cancelled = m('CancelledAlertDialog')
export const Confirmed = m('ConfirmedAlertDialog')
export const OutMessage = S.Union([Cancelled, Confirmed])
export type OutMessage = typeof OutMessage.Type

export const init = Dialog.init

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>, Option.Option<OutMessage>]

const liftDialog = (result: ReturnType<typeof Dialog.update>): UpdateReturn => {
  const [model, commands] = result
  return [model, Command.mapMessages(commands, message => GotDialogMessage({ message })), Option.none()]
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'RequestedAlertDialogConfirm':
      return [model, [], Option.some(Confirmed())]
    case 'RequestedAlertDialogCancel': {
      const [next, commands] = liftDialog(Dialog.close(model))
      return [next, commands, Option.some(Cancelled())]
    }
    case 'GotAlertDialogPrimitiveMessage': {
      const [next, commands] = liftDialog(Dialog.update(model, message.message))
      return [
        next,
        commands,
        message.message._tag === 'RequestedClose' ? Option.some(Cancelled()) : Option.none(),
      ]
    }
  }
}

export const open = (model: Model): UpdateReturn => liftDialog(Dialog.open(model))
export const close = (model: Model): UpdateReturn => liftDialog(Dialog.close(model))

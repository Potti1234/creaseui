import { Dialog } from '@foldkit/ui'
import * as Command from 'foldkit/command'

import * as Animation from './animation'
import * as Popup from './popup'

export const Model = Dialog.Model
export const Message = Dialog.Message
export const OutMessage = Dialog.OutMessage
export const view = Dialog.view
export const titleId = Dialog.titleId
export const descriptionId = Dialog.descriptionId

export type Model = Dialog.Model
export type Message = Dialog.Message
export type OutMessage = Dialog.OutMessage
export type InitConfig = Dialog.InitConfig
export type RenderInfo = Dialog.RenderInfo
export type ViewInputs = Dialog.ViewInputs

type UpdateReturn = ReturnType<typeof Dialog.update>

export const init = (config: InitConfig): Model => ({
  ...Dialog.init(config),
  animation: Animation.init({ id: config.id + '-panel' }),
})

export const isLeaving = (model: Model): boolean =>
  model.animation.transitionState === 'LeaveStart' ||
  model.animation.transitionState === 'LeaveAnimating'

const animate = (model: Model, message: Animation.Message): UpdateReturn => {
  const result = Animation.update(model.animation, message)
  const commands = [...(result.commands ?? [])]
  if (result.outMessage?._tag === 'StartedLeaveAnimating') {
    commands.push(Animation.defaultLeaveCommand(result.model))
  }
  return {
    model: { ...model, animation: result.model },
    commands: [
      ...Command.mapMessages(commands, message =>
        Message.GotAnimationMessage({ message }),
      ),
      ...(result.outMessage?._tag === 'TransitionedOut'
        ? [Dialog.CloseDialog({ id: model.id })]
        : []),
    ],
  }
}

const changeOpen = (model: Model, isOpen: boolean): UpdateReturn => {
  const popup = Popup.update(
    Popup.init({ defaultOpen: model.isOpen }),
    isOpen
      ? Popup.Message.RequestedOpen({ reason: 'programmatic' })
      : Popup.Message.RequestedClose({ reason: 'programmatic' }),
  )
  if (!popup.outMessage) return { model }

  // Keep native modal resource acquisition and release on the same path as
  // Foldkit's view. An animated leave releases resources when it settles.
  const native = Dialog.update(
    { ...model, isAnimated: false },
    isOpen ? Message.RequestedOpen() : Message.RequestedClose(),
  )
  if (!model.isAnimated) return native

  const next = { ...model, isOpen: popup.model.isOpen }
  const transition = animate(
    next,
    isOpen ? Animation.Message.Showed() : Animation.Message.Hid(),
  )
  return {
    ...native,
    model: transition.model,
    commands: [
      ...(isOpen ? (native.commands ?? []) : []),
      ...(transition.commands ?? []),
    ],
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'RequestedOpen':
      return changeOpen(model, true)
    case 'RequestedClose':
      return changeOpen(model, false)
    case 'GotAnimationMessage':
      return animate(model, message.message)
    default:
      return Dialog.update(model, message)
  }
}

export const open = (model: Model): UpdateReturn =>
  update(model, Message.RequestedOpen())

export const close = (model: Model): UpdateReturn =>
  update(model, Message.RequestedClose())

export const boot = (config: InitConfig): UpdateReturn => open(init(config))

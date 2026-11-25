import { Option, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'

import * as Animation from './animation'
import * as Modal from './modal'
import * as Popup from './popup'

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  isAnimated: S.Boolean,
  animation: Animation.Model,
  maybeFocusSelector: S.Option(S.String),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  RequestedOpen: {},
  RequestedClose: {},
  SucceededShowDialog: {},
  FailedShowDialog: {},
  SucceededAcquireResources: {},
  FailedAcquireResources: {},
  CompletedCloseDialog: {},
  Unmounted: {},
  CompletedReleaseDialogResources: {},
  GotAnimationMessage: { message: Animation.Message },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({ Opened: {}, Closed: {} })
export type OutMessage = typeof OutMessage.Type

/** The id must be non-empty and unique in the document. */
export type InitConfig = Readonly<{
  id: string
  isAnimated?: boolean
  /** Takes precedence over the initialFocus attribute bundle. */
  focusSelector?: string
}>

export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: false,
  isAnimated: config.isAnimated ?? false,
  animation: Animation.init({ id: config.id + '-panel' }),
  maybeFocusSelector: Option.fromNullishOr(config.focusSelector),
})

const initialFocusMarker = 'foldkit-dialog-initial-focus'
const focusSelector = (model: Model): string =>
  Option.getOrElse(
    model.maybeFocusSelector,
    () => '[data-' + initialFocusMarker + ']',
  )

export {
  AcquireResources,
  CloseDialog,
  ReleaseDialogResources,
  ShowDialog,
} from './modal'
const { CloseDialog, ReleaseDialogResources, ShowDialog } = Modal

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const isLeaving = (model: Model): boolean =>
  model.animation.transitionState === 'LeaveStart' ||
  model.animation.transitionState === 'LeaveAnimating'

const isVisible = (model: Model): boolean => model.isOpen || isLeaving(model)

const reset = (model: Model): Model => ({
  ...model,
  isOpen: false,
  animation: { ...model.animation, isShowing: false, transitionState: 'Idle' },
})

const wrapAnimation = (message: Animation.Message): Message =>
  Message.GotAnimationMessage({ message })

const animate = (model: Model, message: Animation.Message): UpdateReturn => {
  const result = Animation.update(model.animation, message)
  const commands = Command.mapMessages(result.commands ?? [], wrapAnimation)
  switch (result.outMessage?._tag) {
    case 'StartedLeaveAnimating':
      return {
        model: { ...model, animation: result.model },
        commands: [
          ...commands,
          Command.mapMessage(
            Animation.defaultLeaveCommand(result.model),
            wrapAnimation,
          ),
        ],
      }
    case 'TransitionedOut':
      return {
        model: { ...model, animation: result.model },
        commands: [...commands, CloseDialog({ id: model.id })],
      }
    default:
      return { model: { ...model, animation: result.model }, commands }
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

  const next = { ...model, isOpen: popup.model.isOpen }
  const outMessage = isOpen ? OutMessage.Opened() : OutMessage.Closed()
  const commands = isOpen
    ? [ShowDialog({ id: model.id, focusSelector: focusSelector(model) })]
    : model.isAnimated
      ? []
      : [CloseDialog({ id: model.id })]
  if (!model.isAnimated) return { model: next, commands, outMessage }

  const transition = animate(
    next,
    isOpen ? Animation.Message.Showed() : Animation.Message.Hid(),
  )
  return {
    model: transition.model,
    commands: [...commands, ...(transition.commands ?? [])],
    outMessage,
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
    case 'Unmounted':
      return isVisible(model)
        ? {
            model: reset(model),
            commands: [ReleaseDialogResources({ id: model.id })],
          }
        : { model }
    case 'FailedShowDialog':
    case 'FailedAcquireResources':
      return { model: isVisible(model) ? reset(model) : model }
    case 'SucceededShowDialog':
    case 'SucceededAcquireResources': {
      if (!isVisible(model))
        return { model, commands: [CloseDialog({ id: model.id })] }
      if (message._tag === 'SucceededShowDialog') return { model }
      const { transitionState, transitionGeneration: generation } =
        model.animation
      if (transitionState === 'Idle') return { model }
      const command =
        transitionState === 'EnterStart' || transitionState === 'LeaveStart'
          ? Animation.WaitForPaint({ generation })
          : Animation.WaitForAnimationSettled({
              id: model.animation.id,
              generation,
            })
      return { model, commands: [Command.mapMessage(command, wrapAnimation)] }
    }
    case 'CompletedCloseDialog':
    case 'CompletedReleaseDialogResources':
      return { model }
  }
}

export const open = (model: Model): UpdateReturn =>
  update(model, Message.RequestedOpen())

export const close = (model: Model): UpdateReturn =>
  update(model, Message.RequestedClose())

export const boot = (config: InitConfig): UpdateReturn => open(init(config))

export const titleId = (model: Model): string => model.id + '-dialog-title'
export const descriptionId = (model: Model): string =>
  model.id + '-dialog-description'

export type RenderInfo = Readonly<{
  dialog: ReadonlyArray<ChildAttribute>
  backdrop: ReadonlyArray<ChildAttribute>
  panel: ReadonlyArray<ChildAttribute>
  title: ReadonlyArray<ChildAttribute>
  description: ReadonlyArray<ChildAttribute>
  initialFocus: ReadonlyArray<ChildAttribute>
  closeButton: ReadonlyArray<ChildAttribute>
  isVisible: boolean
}>

export type ViewInputs = Readonly<{
  toView: (info: RenderInfo) => Html
  hasDescription?: boolean
}>

export const view = defineView<Model, Message, ViewInputs>(
  (model, inputs, h) => {
    const {
      id,
      animation: { transitionState: phase },
    } = model
    const visible = isVisible(model)
    const leaving = isLeaving(model)
    const entering = phase === 'EnterStart' || phase === 'EnterAnimating'
    const animationAttributes = [
      ...(phase === 'EnterStart' || phase === 'LeaveAnimating'
        ? [h.DataAttribute('closed', '')]
        : []),
      ...(entering ? [h.DataAttribute('enter', '')] : []),
      ...(leaving ? [h.DataAttribute('leave', '')] : []),
      ...(phase === 'Idle' ? [] : [h.DataAttribute('transition', '')]),
    ]
    const dismissAttributes = leaving
      ? []
      : [h.OnClick(Message.RequestedClose())]

    return inputs.toView({
      dialog: childAttributes([
        ...Modal.attributes(
          { id, visible, focusSelector: focusSelector(model) },
          {
            send: message => message,
            cancel: Message.RequestedClose(),
            unmounted: Message.Unmounted(),
          },
          h,
        ),
        ...Popup.contentLabelAttributes(
          {
            titleId: titleId(model),
            ...(inputs.hasDescription
              ? { descriptionId: descriptionId(model) }
              : {}),
          },
          h,
        ),
        h.Style({
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          padding: '0',
          border: 'none',
          background: 'transparent',
          ...(visible
            ? { position: 'fixed', inset: '0', zIndex: '2147483600' }
            : {}),
        }),
        ...(visible ? [h.DataAttribute('open', '')] : []),
      ]),
      backdrop: childAttributes([
        h.Style({ minHeight: '100vh' }),
        ...animationAttributes,
        ...dismissAttributes,
      ]),
      panel: childAttributes([
        h.Id(model.animation.id),
        ...animationAttributes,
      ]),
      title: childAttributes(Popup.labelPartAttributes(titleId(model), h)),
      description: childAttributes(
        Popup.labelPartAttributes(descriptionId(model), h),
      ),
      initialFocus: childAttributes([h.DataAttribute(initialFocusMarker, '')]),
      closeButton: childAttributes([h.Type('button'), ...dismissAttributes]),
      isVisible: visible,
    })
  },
)

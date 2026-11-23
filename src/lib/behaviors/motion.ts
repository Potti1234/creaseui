import { Effect, Option, Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import * as Dom from 'foldkit/dom'
import { inertHtml, type Attribute } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Animation from './animation'

import * as Popup from './popup'

export const Model = Animation.Model
export type Model = Animation.Model
export const Message = defineMessageUnion({
  Showed: {},
  Hid: {},
  GotAnimationMessage: { message: Animation.Message },
  CompletedReturnFocus: {},
})
export type Message = typeof Message.Type
export const view = Animation.view

export const OutMessage = defineMessageUnion({
  Settled: { isOpen: Schema.Boolean },
})
export type OutMessage = typeof OutMessage.Type

export type UpdateReturn = Update.ReturnWithOutMessage<
  Model,
  Message,
  OutMessage
>

export type Options = Readonly<{ returnFocusTo?: string; instant?: boolean }>

export const init = (
  config: Readonly<{ id: string; isOpen?: boolean }>,
): Model => Animation.init({ id: config.id, isShowing: config.isOpen ?? false })

export const isMounted = (model: Model): boolean =>
  model.isShowing || model.transitionState !== 'Idle'

const idSelector = (id: string): string =>
  `[id="${id.replace(/["\\\n\r\f]/gu, character => `\\${character.charCodeAt(0).toString(16)} `)}"]`

export const ReturnFocus = Command.define('ReturnFocus', {
  args: { panelId: Schema.String, triggerId: Schema.String },
  messages: [Message.CompletedReturnFocus],
  execute: ({ panelId, triggerId }) =>
    Effect.suspend(() => {
      const panel = document.getElementById(panelId)
      return panel?.contains(document.activeElement)
        ? Dom.focus(idSelector(triggerId))
        : Effect.void
    }).pipe(Effect.ignore, Effect.as(Message.CompletedReturnFocus())),
})

const instantly = (model: Model, isOpen: boolean): UpdateReturn =>
  model.isShowing === isOpen && model.transitionState === 'Idle'
    ? { model }
    : {
        model: {
          ...model,
          isShowing: isOpen,
          transitionState: 'Idle',
          transitionGeneration: model.transitionGeneration + 1,
        },
        outMessage: OutMessage.Settled({ isOpen }),
      }

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  if (message._tag === 'CompletedReturnFocus') return { model }
  const animationMessage =
    message._tag === 'GotAnimationMessage'
      ? message.message
      : message._tag === 'Showed'
        ? Animation.Message.Showed()
        : Animation.Message.Hid()
  if (
    options.instant &&
    (animationMessage._tag === 'Showed' || animationMessage._tag === 'Hid')
  ) {
    const result = instantly(model, animationMessage._tag === 'Showed')
    return animationMessage._tag === 'Hid' &&
      model.isShowing &&
      options.returnFocusTo !== undefined
      ? {
          ...result,
          commands: [
            ReturnFocus({
              panelId: model.id,
              triggerId: options.returnFocusTo,
            }),
          ],
        }
      : result
  }
  const result = Animation.update(model, animationMessage)
  const animationCommands = [...(result.commands ?? [])]
  if (result.outMessage?._tag === 'StartedLeaveAnimating') {
    animationCommands.push(Animation.defaultLeaveCommand(result.model))
  }
  const commands: Array<Command.Command<Message>> = [
    ...Command.mapMessages(animationCommands, message =>
      Message.GotAnimationMessage({ message }),
    ),
  ]
  if (
    animationMessage._tag === 'Hid' &&
    model.isShowing &&
    options.returnFocusTo !== undefined
  ) {
    commands.push(
      ReturnFocus({ panelId: model.id, triggerId: options.returnFocusTo }),
    )
  }
  const finished =
    model.transitionState !== 'Idle' &&
    result.model.transitionState === 'Idle' &&
    result.model !== model
  return {
    model: result.model,
    ...(commands.length === 0 ? {} : { commands }),
    ...(finished
      ? { outMessage: OutMessage.Settled({ isOpen: result.model.isShowing }) }
      : {}),
  }
}

export const show = (model: Model, options: Options = {}): UpdateReturn =>
  update(model, Message.Showed(), options)

export const hide = (model: Model, options: Options = {}): UpdateReturn =>
  update(model, Message.Hid(), options)

export const showInstantly = (model: Model): UpdateReturn =>
  instantly(model, true)
export const hideInstantly = (model: Model): UpdateReturn =>
  instantly(model, false)

export const completedPopupExit = (model: Popup.Model): Popup.Message =>
  Popup.Message.CompletedExit({ version: model.exitVersion })

export const attributes = (model: Model): ReadonlyArray<Attribute<never>> => {
  const state = model.transitionState
  const entering = state === 'EnterStart' || state === 'EnterAnimating'
  const leaving = state === 'LeaveStart' || state === 'LeaveAnimating'
  const closed =
    state === 'EnterStart' || state === 'LeaveAnimating' || !isMounted(model)
  return [
    ...(closed ? [inertHtml.DataAttribute('closed', '')] : []),
    ...(entering ? [inertHtml.DataAttribute('enter', '')] : []),
    ...(leaving
      ? [
          inertHtml.DataAttribute('leave', ''),
          inertHtml.DataAttribute('ending-style', ''),
        ]
      : []),
    ...(state === 'EnterStart'
      ? [inertHtml.DataAttribute('starting-style', '')]
      : []),
    ...(state !== 'Idle' ? [inertHtml.DataAttribute('transition', '')] : []),
  ]
}

export const hiddenAttributes = (
  isOpen: boolean,
  isFindable: boolean,
): ReadonlyArray<Attribute<never>> =>
  isOpen ? [] : [inertHtml.Attribute('hidden', isFindable ? 'until-found' : '')]

// Foldkit's public html entrypoint and HtmlBuilder omit OnCustomEvent's constructor.
export const reveal = <Msg>(message: Msg): Attribute<Msg> => ({
  _tag: 'OnCustomEvent',
  name: 'beforematch',
  f: () => Option.some(message),
})

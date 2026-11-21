import { Effect, Option, Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import { inertHtml, type Attribute } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { Animation } from '@foldkit/ui'

import * as Popup from './popup'

export const Model = Animation.Model
export type Model = Animation.Model
export const Message = Animation.Message
export type Message = Animation.Message
export const view = Animation.view

export const OutMessage = defineMessageUnion({
  Settled: { isOpen: Schema.Boolean },
  Exited: {},
})
export type OutMessage = typeof OutMessage.Type

export type UpdateReturn = Update.ReturnWithOutMessage<
  Model,
  Message,
  ReadonlyArray<OutMessage>
>

export type Options = Readonly<{ returnFocusTo?: string; instant?: boolean }>

export const init = (
  config: Readonly<{ id: string; isOpen?: boolean }>,
): Model => Animation.init({ id: config.id, isShowing: config.isOpen ?? false })

export const isMounted = (model: Model): boolean =>
  model.isShowing || model.transitionState !== 'Idle'

export const ReturnFocus = Command.define('ReturnFocus', {
  args: { panelId: Schema.String, triggerId: Schema.String },
  messages: [Message.CompletedWaitForPaint],
  execute: ({ panelId, triggerId }) =>
    Effect.sync(() => {
      const panel = document.getElementById(panelId)
      if (panel?.contains(document.activeElement)) {
        document.getElementById(triggerId)?.focus()
      }
    }).pipe(Effect.as(Message.CompletedWaitForPaint({ generation: -1 }))),
})

const settled = (isOpen: boolean): ReadonlyArray<OutMessage> =>
  isOpen
    ? [OutMessage.Settled({ isOpen })]
    : [OutMessage.Settled({ isOpen }), OutMessage.Exited()]

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
        outMessage: settled(isOpen),
      }

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  if (
    options.instant &&
    (message._tag === 'Showed' || message._tag === 'Hid')
  ) {
    const result = instantly(model, message._tag === 'Showed')
    return message._tag === 'Hid' &&
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
  const result = Animation.update(model, message)
  const commands = [...(result.commands ?? [])]
  if (
    message._tag === 'Hid' &&
    model.isShowing &&
    options.returnFocusTo !== undefined
  ) {
    commands.push(
      ReturnFocus({ panelId: model.id, triggerId: options.returnFocusTo }),
    )
  }
  if (result.outMessage?._tag === 'StartedLeaveAnimating') {
    commands.push(Animation.defaultLeaveCommand(result.model))
  }
  const finished =
    model.transitionState !== 'Idle' &&
    result.model.transitionState === 'Idle' &&
    result.model !== model
  return {
    model: result.model,
    ...(commands.length === 0 ? {} : { commands }),
    ...(finished ? { outMessage: settled(result.model.isShowing) } : {}),
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

export const reveal = <Msg>(message: Msg): Attribute<Msg> => ({
  _tag: 'OnCustomEvent',
  name: 'beforematch',
  f: () => Option.some(message),
})

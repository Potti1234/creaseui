import { Effect, Match as M, Schema as S } from 'effect'
import { Command, Subscription, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import type * as KeyValueStore from 'effect/unstable/persistence/KeyValueStore'

import { SEED } from '../../snapshots/chapter-08/domain'
import * as App from '../../snapshots/chapter-08/model'
import { setStorageFailing } from './storage'

export const Flow = S.Literals(['picker', 'composer'])
export type Flow = typeof Flow.Type

export const Model = S.Struct({
  flow: Flow,
  step: S.Number,
  isStorageFailing: S.Boolean,
  /* The chapter 8 app, running inside the essay against an in-page store. */
  app: App.Model,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseFlow: { flow: Flow },
  ChoseStep: { step: S.Number },
  ToggledStorage: {},
  CompletedToggleStorage: {},
  GotAppMessage: { message: App.Message },
})
export type Message = typeof Message.Type

type Return = Update.Return<Model, Message, KeyValueStore.KeyValueStore>

const SHOWN = ['in_review', 'in_progress', 'todo']

export const init = (): Return => {
  const app = App.init({
    issues: SEED.filter(issue => SHOWN.includes(issue.status)),
    nextNumber: 143,
    isDark: false,
    notice: null,
  }).model
  return { model: { flow: 'picker', step: 0, isStorageFailing: false, app } }
}

const ToggleStorage = Command.define('ToggleEssayStorage', {
  args: { failing: S.Boolean },
  messages: [Message.CompletedToggleStorage],
  execute: ({ failing }) =>
    Effect.sync(() => setStorageFailing(failing)).pipe(
      Effect.as(Message.CompletedToggleStorage()),
    ),
})

export const update = (model: Model, message: Message): Return =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseFlow: ({ flow }) => ({ model: { ...model, flow, step: 0 } }),
      ChoseStep: ({ step }) => ({ model: { ...model, step } }),
      ToggledStorage: () => {
        const isStorageFailing = !model.isStorageFailing
        return {
          model: { ...model, isStorageFailing },
          commands: [ToggleStorage({ failing: isStorageFailing })],
        }
      },
      CompletedToggleStorage: () => ({ model }),
      GotAppMessage: ({ message: appMessage }) => {
        const result = App.update(model.app, appMessage)
        return {
          model: { ...model, app: result.model },
          commands: Command.mapMessages(result.commands, inner =>
            Message.GotAppMessage({ message: inner }),
          ),
        }
      },
    }),
  )

export const subscriptions = Subscription.lift(App.subscriptions)<
  Model,
  Message
>({
  toChildModel: model => model.app,
  toParentMessage: message => Message.GotAppMessage({ message }),
})

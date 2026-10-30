import { Match as M, Schema as S } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import * as App from '../../snapshots/chapter-07/model'

export const Part = S.Literals([
  'priority',
  'identifier',
  'status',
  'title',
  'labels',
  'date',
  'assignee',
])
export type Part = typeof Part.Type

export const Version = S.Literals(['chapter-06', 'chapter-07'])
export type Version = typeof Version.Type

export const Model = S.Struct({
  version: Version,
  part: Part,
  request: S.Number,
  /* The chapter 7 app, running inside the essay. */
  app: App.Model,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ChoseVersion: { version: Version },
  ChosePart: { part: Part },
  ChoseRequest: { index: S.Number },
  GotAppMessage: { message: App.Message },
  Ignored: {},
})
export type Message = typeof Message.Type

const SHOWN = ['in_review', 'in_progress', 'done']

export const init = (): Update.Return<Model, Message> => {
  const app = App.init().model
  return {
    model: {
      version: 'chapter-06',
      part: 'title',
      request: 0,
      app: {
        ...app,
        issues: app.issues.filter(issue => SHOWN.includes(issue.status)),
      },
    },
  }
}

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  M.value(message).pipe(
    M.tagsExhaustive({
      ChoseVersion: ({ version }) => ({ model: { ...model, version } }),
      ChosePart: ({ part }) => ({ model: { ...model, part } }),
      ChoseRequest: ({ index }) => ({ model: { ...model, request: index } }),
      GotAppMessage: ({ message: appMessage }) => {
        const result = App.update(model.app, appMessage)
        return {
          model: { ...model, app: result.model },
          commands: Command.mapMessages(result.commands, inner =>
            Message.GotAppMessage({ message: inner }),
          ),
        }
      },
      Ignored: () => ({ model }),
    }),
  )

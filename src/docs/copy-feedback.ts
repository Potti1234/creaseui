import { Effect, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { m } from 'foldkit/message'

export const Model = S.NullOr(S.String)
export type Model = typeof Model.Type

export const ClickedCopyCode = m('ClickedDocsCopyCode', { code: S.String })
export const CompletedCopyCode = m('CompletedDocsCopyCode', { code: S.String })
export const ClearedCopyFeedback = m('ClearedDocsCopyFeedback', { code: S.String })
export const ObservedSidebarScroll = m('ObservedDocsSidebarScroll')
export const Message = S.Union([
  ClickedCopyCode,
  CompletedCopyCode,
  ClearedCopyFeedback,
  ObservedSidebarScroll,
])
export type Message = typeof Message.Type

const CopyCode = Command.define(
  'CopyDocsCode',
  { code: S.String },
  CompletedCopyCode,
)(({ code }) =>
  Effect.promise(() => navigator.clipboard.writeText(code)).pipe(
    Effect.as(CompletedCopyCode({ code })),
  ),
)

const ClearCopyFeedback = Command.define(
  'ClearDocsCopyFeedback',
  { code: S.String },
  ClearedCopyFeedback,
)(({ code }) =>
  Effect.sleep('1800 millis').pipe(Effect.as(ClearedCopyFeedback({ code }))),
)

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'ClickedDocsCopyCode':
      return [model, [CopyCode({ code: message.code })]]
    case 'CompletedDocsCopyCode':
      return [message.code, [ClearCopyFeedback({ code: message.code })]]
    case 'ClearedDocsCopyFeedback':
      return [model === message.code ? null : model, []]
    case 'ObservedDocsSidebarScroll':
      return [model, []]
  }
}

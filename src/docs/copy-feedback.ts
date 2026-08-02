import { Effect, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

export const Model = S.NullOr(S.String);
export type Model = typeof Model.Type;

export const ClickedCopyCode = m('ClickedDocsCopyCode', { code: S.String });
export const CompletedCopyDocsCode = m('CompletedCopyDocsCode', {
  code: S.String,
});
export const CompletedWaitBeforeClearingDocsCopyFeedback = m(
  'CompletedWaitBeforeClearingDocsCopyFeedback',
  { code: S.String },
);
export const ObservedSidebarScroll = m('ObservedDocsSidebarScroll');
export const Message = S.Union([
  ClickedCopyCode,
  CompletedCopyDocsCode,
  CompletedWaitBeforeClearingDocsCopyFeedback,
  ObservedSidebarScroll,
]);
export type Message = typeof Message.Type;

const CopyCode = Command.define('CopyDocsCode', {
  args: { code: S.String },
  messages: [CompletedCopyDocsCode],
  execute: ({ code }) =>
    Effect.promise(() => navigator.clipboard.writeText(code)).pipe(
      Effect.as(CompletedCopyDocsCode({ code })),
    ),
});

const WaitBeforeClearingCopyFeedback = Command.define(
  'WaitBeforeClearingDocsCopyFeedback',
  {
    args: { code: S.String },
    messages: [CompletedWaitBeforeClearingDocsCopyFeedback],
    execute: ({ code }) =>
      Effect.sleep('1800 millis').pipe(
        Effect.as(CompletedWaitBeforeClearingDocsCopyFeedback({ code })),
      ),
  },
);

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'ClickedDocsCopyCode':
      return [model, [CopyCode({ code: message.code })]];
    case 'CompletedCopyDocsCode':
      return [
        message.code,
        [WaitBeforeClearingCopyFeedback({ code: message.code })],
      ];
    case 'CompletedWaitBeforeClearingDocsCopyFeedback':
      return [model === message.code ? null : model, []];
    case 'ObservedDocsSidebarScroll':
      return [model, []];
  }
};

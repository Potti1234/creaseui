import type { HtmlBuilder } from 'foldkit/html'
import { Option } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import * as InputHistory from '@/lib/behaviors/input-history'

export interface HistoryPreviewShape {
  readonly history: InputHistory.Model
  readonly entries: ReadonlyArray<string>
}

export const HistoryPreviewMessage = defineMessageUnion({
  GotTextareaHistory: { message: InputHistory.Message },
  SentTextareaMessage: {},
})

export type HistoryPreviewMessage = typeof HistoryPreviewMessage.Type

export const historyAttributes = <Msg>(
  model: HistoryPreviewShape,
  send: (message: HistoryPreviewMessage) => Msg,
  h: HtmlBuilder<Msg>,
) => [
  ...InputHistory.attributes(
    model.history,
    { entries: model.entries },
    message => send(HistoryPreviewMessage.GotTextareaHistory({ message })),
    h,
  ),
  h.OnKeyDownPreventDefault((key, modifiers) =>
    key === 'Enter' &&
    !modifiers.shiftKey &&
    !modifiers.altKey &&
    !modifiers.ctrlKey &&
    !modifiers.metaKey
      ? Option.some(send(HistoryPreviewMessage.SentTextareaMessage()))
      : Option.none(),
  ),
]

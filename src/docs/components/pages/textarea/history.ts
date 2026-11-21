import type { HtmlBuilder } from 'foldkit/html'
import { Option } from 'effect'
import * as InputHistory from '@/lib/behaviors/input-history'

export interface HistoryPreviewShape {
  readonly history: InputHistory.Model
  readonly entries: ReadonlyArray<string>
}

export type HistoryPreviewMessage =
  | Readonly<{ _tag: 'GotTextareaHistory'; message: InputHistory.Message }>
  | Readonly<{ _tag: 'SentTextareaMessage' }>

export const historyAttributes = <Msg>(
  model: HistoryPreviewShape,
  send: (message: HistoryPreviewMessage) => Msg,
  h: HtmlBuilder<Msg>,
) => [
  ...InputHistory.attributes(
    model.history,
    { entries: model.entries },
    message => send({ _tag: 'GotTextareaHistory', message }),
    h,
  ),
  h.OnKeyDownPreventDefault((key, modifiers) =>
    key === 'Enter' &&
    !modifiers.shiftKey &&
    !modifiers.altKey &&
    !modifiers.ctrlKey &&
    !modifiers.metaKey
      ? Option.some(send({ _tag: 'SentTextareaMessage' }))
      : Option.none(),
  ),
]

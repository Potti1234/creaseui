import { Effect, Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'

export const DEFAULT_TIMEOUT_MS = 500

export const Model = Schema.Struct({
  query: Schema.String,
  lastKey: Schema.String,
  isStepping: Schema.Boolean,
  version: Schema.Number,
})
export type Model = typeof Model.Type

export const init = (): Model => ({
  query: '',
  lastKey: '',
  isStepping: false,
  version: 0,
})

export const Message = defineMessageUnion({
  ElapsedTimeout: { version: Schema.Number },
})
export type Message = typeof Message.Type

export const WaitBeforeResettingTypeahead = Command.define(
  'WaitBeforeResettingTypeahead',
  {
    args: { version: Schema.Number, timeoutMs: Schema.Number },
    messages: [Message.ElapsedTimeout],
    execute: ({ version, timeoutMs }) =>
      Effect.sleep(`${timeoutMs} millis`).pipe(
        Effect.as(Message.ElapsedTimeout({ version })),
      ),
  },
)

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => ({
  model:
    message.version === model.version
      ? { ...init(), version: model.version }
      : model,
})

export const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()

export const isTypeaheadKey = (
  key: string,
  modifiers: Readonly<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }>,
): boolean =>
  key.length === 1 &&
  !modifiers.ctrlKey &&
  !modifiers.metaKey &&
  !modifiers.altKey

export const isActive = (model: Model): boolean => model.query.length > 0

export type SearchInput = Readonly<{
  key: string
  labels: ReadonlyArray<string>
  currentIndex: number
  timeoutMs?: number
  isDisabled?: (index: number) => boolean
}>

export const search = (
  model: Model,
  {
    key,
    labels,
    currentIndex,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    isDisabled = () => false,
  }: SearchInput,
): Update.Return<Model, Message> &
  Readonly<{ maybeIndex: Option.Option<number> }> => {
  if (key.length !== 1 || (key === ' ' && !isActive(model))) {
    return { model, commands: [], maybeIndex: Option.none() }
  }
  const char = normalize(key) || key
  const isStepping =
    char === model.lastKey && (model.isStepping || model.query.length === 1)
  const query = model.query + char
  const next = { query, lastKey: char, isStepping, version: model.version + 1 }
  const scan = (prefix: string, start: number): Option.Option<number> => {
    for (let step = 0; step < labels.length; step++) {
      const index =
        (((start + step) % labels.length) + labels.length) % labels.length
      if (
        !isDisabled(index) &&
        normalize(labels[index] ?? '').startsWith(prefix)
      )
        return Option.some(index)
    }
    return Option.none()
  }
  const maybeIndex = isStepping
    ? Option.orElse(scan(query, Math.max(currentIndex, 0)), () =>
        scan(char, currentIndex + 1),
      )
    : scan(
        query,
        query.length === 1 ? currentIndex + 1 : Math.max(currentIndex, 0),
      )
  return {
    model: next,
    commands: [
      WaitBeforeResettingTypeahead({ version: next.version, timeoutMs }),
    ],
    maybeIndex,
  }
}

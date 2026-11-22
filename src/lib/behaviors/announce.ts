import { Effect, Schema } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import type { Attribute, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

export const Priority = Schema.Literals(['polite', 'assertive'])

export type Priority = typeof Priority.Type

export type ListChange =
  | Readonly<{ type: 'removed'; label: string }>
  | Readonly<{ type: 'results'; count: number; loading?: boolean }>

export const describeList = (change: ListChange): string => {
  if (change.type === 'removed') return `${change.label} removed`
  if (change.loading) return 'Loading'
  if (!change.count) return 'No results'
  return change.count === 1 ? '1 result' : `${String(change.count)} results`
}

export const liveRegionAttributes = <Msg>(
  priority: Priority,
  h: HtmlBuilder<Msg>,
): ReadonlyArray<Attribute<Msg>> => [
  h.Role(priority === 'assertive' ? 'alert' : 'status'),
  h.AriaLive(priority),
  h.AriaAtomic(true),
  h.Style({
    position: 'fixed',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    border: '0',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  }),
]

export const Model = Schema.Struct({
  text: Schema.String,
  pendingText: Schema.String,
  priority: Priority,
  version: Schema.Int,
})

export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  RequestedAnnouncement: { text: Schema.String, priority: Priority },
  CompletedDelay: { version: Schema.Int },
})

export type Message = typeof Message.Type

export const init = (): Model => ({
  text: '',
  pendingText: '',
  priority: 'polite',
  version: 0,
})

export const DelayAnnouncement = Command.define('DelayAnnouncement', {
  args: { version: Schema.Int },
  messages: [Message.CompletedDelay],
  execute: ({ version }) =>
    Effect.sleep('100 millis').pipe(
      Effect.as(Message.CompletedDelay({ version })),
    ),
})

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    RequestedAnnouncement: ({ text, priority }) => {
      if (!text) return { model }
      const version = model.version + 1
      return {
        model: { text: '', pendingText: text, priority, version },
        commands: [DelayAnnouncement({ version })],
      }
    },
    CompletedDelay: ({ version }) =>
      version === model.version
        ? { model: { ...model, text: model.pendingText } }
        : { model },
  })

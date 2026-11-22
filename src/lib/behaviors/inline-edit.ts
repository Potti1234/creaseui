import { Option, Schema } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

export const Reason = Schema.Literals([
  'edit-key',
  'type',
  'double-click',
  'enter-key',
  'escape-key',
  'focus-out',
  'tab-key',
  'programmatic',
])
export type Reason = typeof Reason.Type

export const Model = Schema.Struct({
  maybeEditingId: Schema.Option(Schema.String),
  draft: Schema.String,
  isTyped: Schema.Boolean,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  RequestedStart: {
    id: Schema.String,
    reason: Reason,
    maybeText: Schema.Option(Schema.String),
  },
  ChangedDraft: { value: Schema.String },
  RequestedEnd: { reason: Reason },
  RequestedCancel: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Started: { id: Schema.String, reason: Reason },
  Committed: { id: Schema.String, text: Schema.String, reason: Reason },
  Ended: { id: Schema.String, reason: Reason },
  RejectedCommit: { id: Schema.String, text: Schema.String, reason: Reason },
})
export type OutMessage = typeof OutMessage.Type

export const init = (): Model => ({
  maybeEditingId: Option.none(),
  draft: '',
  isTyped: false,
})
export const editingId = (model: Model): Option.Option<string> =>
  model.maybeEditingId
export const isEditing = (model: Model, id: string): boolean =>
  Option.contains(editingId(model), id)

export type Options = Readonly<{
  value: (id: string) => string
  disabled?: (id: string) => boolean
  isValid?: (id: string, text: string) => boolean
}>

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const update = (
  model: Model,
  message: Message,
  options: Options,
): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    RequestedStart: ({ id, reason, maybeText }) =>
      isEditing(model, id) || options.disabled?.(id) === true
        ? { model }
        : {
            model: {
              maybeEditingId: Option.some(id),
              draft: Option.getOrElse(maybeText, () => options.value(id)),
              isTyped: Option.isSome(maybeText),
            },
            outMessage: OutMessage.Started({ id, reason }),
          },
    ChangedDraft: ({ value }) =>
      Option.isNone(editingId(model))
        ? { model }
        : { model: { ...model, draft: value } },
    RequestedEnd: ({ reason }) => {
      if (Option.isNone(model.maybeEditingId)) return { model }
      const id = model.maybeEditingId.value
      const text = model.draft
      if (text === options.value(id))
        return { model: init(), outMessage: OutMessage.Ended({ id, reason }) }
      if (options.isValid?.(id, text) === false)
        return {
          model,
          outMessage: OutMessage.RejectedCommit({ id, text, reason }),
        }
      return {
        model: init(),
        outMessage: OutMessage.Committed({ id, text, reason }),
      }
    },
    RequestedCancel: () =>
      Option.isNone(model.maybeEditingId)
        ? { model }
        : {
            model: init(),
            outMessage: OutMessage.Ended({
              id: model.maybeEditingId.value,
              reason: 'escape-key',
            }),
          },
  })

export const startKey = ({
  key,
  ctrl,
  meta,
  alt,
}: Readonly<{
  key: string
  ctrl: boolean
  meta: boolean
  alt: boolean
}>): Option.Option<
  Readonly<{ reason: Reason; maybeText: Option.Option<string> }>
> => {
  if (ctrl || meta || alt) return Option.none()
  if (key === 'Enter' || key === 'F2')
    return Option.some({ reason: 'edit-key', maybeText: Option.none() })
  return key.length === 1 && key !== ' '
    ? Option.some({ reason: 'type', maybeText: Option.some(key) })
    : Option.none()
}

export const inputKey = ({
  key,
  shift,
  isMultiline,
  isComposing,
}: Readonly<{
  key: string
  shift: boolean
  isMultiline: boolean
  isComposing: boolean
}>): Option.Option<Message> => {
  if (isComposing) return Option.none()
  if (key === 'Escape') return Option.some(Message.RequestedCancel({}))
  if (key === 'Tab')
    return Option.some(Message.RequestedEnd({ reason: 'tab-key' }))
  if (key === 'Enter' && !(shift && isMultiline))
    return Option.some(Message.RequestedEnd({ reason: 'enter-key' }))
  return Option.none()
}

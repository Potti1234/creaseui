import type { Update } from 'foldkit'
import { Duration, Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'

export const Position = S.Literals([
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
])
export type Position = typeof Position.Type
export const ToastPayload = S.Struct({
  title: S.String,
  description: S.optional(S.String),
  actionLabel: S.optional(S.String),
  position: S.optional(Position),
})
export type ToastPayload = typeof ToastPayload.Type
export const Variant = S.Literals(['Default', 'Success', 'Error', 'Warning', 'Info'])
export type Variant = typeof Variant.Type
export const Entry = S.Struct({
  id: S.String,
  payload: ToastPayload,
  variant: Variant,
  sticky: S.Boolean,
  durationMs: S.Number,
  timerVersion: S.Number,
  isPaused: S.Boolean,
})
export type Entry = typeof Entry.Type
export const Model = S.Struct({ id: S.String, nextId: S.Number, entries: S.Array(Entry) })
export type Model = typeof Model.Type






export const Message = defineMessageUnion({
  Dismissed: { id: S.String },
  'ActivatedToastAction': { id: S.String },
  'PausedToast': { id: S.String },
  'ResumedToast': { id: S.String },
  'CompletedWaitBeforeDismissingToast': { id: S.String, timerVersion: S.Number },
});
export type Message = typeof Message.Type



export const OutMessage = defineMessageUnion({
  DismissedToast: { entry: Entry },
  ActivatedToast: { entry: Entry },
});
export type OutMessage = typeof OutMessage.Type

export const init = (config: Readonly<{ id: string }>): Model => ({ id: config.id, nextId: 0, entries: [] })

export const WaitBeforeDismissing = Command.define('WaitBeforeDismissingToast', {
  args: { id: S.String, durationMs: S.Number, timerVersion: S.Number },
  messages: [Message['CompletedWaitBeforeDismissingToast']],
  execute: ({ id, durationMs, timerVersion }) => Effect.sleep(`${durationMs} millis`).pipe(
    Effect.as(Message['CompletedWaitBeforeDismissingToast']({ id, timerVersion })),
  ),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const schedule = (entry: Entry): ReadonlyArray<Command.Command<Message>> => entry.sticky || entry.isPaused
  ? []
  : [WaitBeforeDismissing({ id: entry.id, durationMs: entry.durationMs, timerVersion: entry.timerVersion })]

const remove = (model: Model, id: string, action: boolean): UpdateReturn => {
  const entry = model.entries.find(candidate => candidate.id === id)
  if (entry === undefined) return { model: model }
  return { model: { ...model, entries: model.entries.filter(candidate => candidate.id !== id) }, outMessage: action ? OutMessage.ActivatedToast({ entry }) : OutMessage.DismissedToast({ entry }) }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Dismissed': return remove(model, message.id, false)
    case 'ActivatedToastAction': return remove(model, message.id, true)
    case 'PausedToast': return { model: { ...model, entries: model.entries.map(entry => entry.id === message.id ? { ...entry, isPaused: true } : entry) } }
    case 'ResumedToast': {
      const entries = model.entries.map(entry => entry.id === message.id ? { ...entry, isPaused: false, timerVersion: entry.timerVersion + 1 } : entry)
      const entry = entries.find(candidate => candidate.id === message.id)
      return { model: { ...model, entries }, commands: entry === undefined ? [] : schedule(entry) }
    }
    case 'CompletedWaitBeforeDismissingToast': {
      const entry = model.entries.find(candidate => candidate.id === message.id)
      return entry === undefined || entry.isPaused || entry.timerVersion !== message.timerVersion
        ? { model: model, }
        : remove(model, message.id, false)
    }
  }
}

export type ToastInput = Readonly<{
  title: string
  description?: string
  actionLabel?: string
  duration?: Duration.Input
  sticky?: boolean
  position?: Position
}>
export type ShowInput = ToastInput & Readonly<{ variant: Variant }>
export type UpdateInput = Partial<Omit<ToastInput, 'duration'>> & Readonly<{ duration?: Duration.Input; variant?: Variant }>

const toastInput = (variant: Variant, input: ToastInput): ShowInput => ({ ...input, variant })
export const success = (input: ToastInput): ShowInput => toastInput('Success', input)
export const error = (input: ToastInput): ShowInput => toastInput('Error', input)
export const info = (input: ToastInput): ShowInput => toastInput('Info', input)
export const warning = (input: ToastInput): ShowInput => toastInput('Warning', input)
export const plain = (input: ToastInput): ShowInput => toastInput('Default', input)

const payload = (input: Pick<ToastInput, 'title' | 'description' | 'actionLabel' | 'position'>): ToastPayload => ({
  title: input.title,
  ...(input.description === undefined ? {} : { description: input.description }),
  ...(input.actionLabel === undefined ? {} : { actionLabel: input.actionLabel }),
  ...(input.position === undefined ? {} : { position: input.position }),
})

export const show = (model: Model, input: ShowInput): UpdateReturn => {
  const entry: Entry = {
    id: `${model.id}-${model.nextId}`,
    payload: payload(input),
    variant: input.variant,
    sticky: input.sticky ?? false,
    durationMs: Math.max(0, Duration.toMillis(input.duration ?? '4 seconds')),
    timerVersion: 0,
    isPaused: false,
  }
  return { model: { ...model, nextId: model.nextId + 1, entries: [...model.entries, entry] }, commands: schedule(entry) }
}

export const updateToast = (model: Model, id: string, input: UpdateInput): UpdateReturn => {
  const previous = model.entries.find(entry => entry.id === id)
  if (previous === undefined) return { model: model }
  const entry: Entry = {
    ...previous,
    payload: {
      title: input.title ?? previous.payload.title,
      ...(input.description === undefined ? (previous.payload.description === undefined ? {} : { description: previous.payload.description }) : { description: input.description }),
      ...(input.actionLabel === undefined ? (previous.payload.actionLabel === undefined ? {} : { actionLabel: previous.payload.actionLabel }) : { actionLabel: input.actionLabel }),
      ...(input.position === undefined ? (previous.payload.position === undefined ? {} : { position: previous.payload.position }) : { position: input.position }),
    },
    variant: input.variant ?? previous.variant,
    sticky: input.sticky ?? previous.sticky,
    durationMs: input.duration === undefined ? previous.durationMs : Math.max(0, Duration.toMillis(input.duration)),
    timerVersion: previous.timerVersion + 1,
  }
  return { model: { ...model, entries: model.entries.map(candidate => candidate.id === id ? entry : candidate) }, commands: schedule(entry) }
}

export const dismiss = (model: Model, id: string): UpdateReturn => remove(model, id, false)
export const dismissAll = (model: Model): UpdateReturn => ({ model: { ...model, entries: [] } })
export const Added = Entry

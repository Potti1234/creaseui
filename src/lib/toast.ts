import { Duration, Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { m } from 'foldkit/message'

export const ToastPayload = S.Struct({
  title: S.String,
  description: S.optional(S.String),
  actionLabel: S.optional(S.String),
})
export type ToastPayload = typeof ToastPayload.Type
export const Variant = S.Literals(['Success', 'Error', 'Warning', 'Info'])
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

export const Dismissed = m('Dismissed', { id: S.String })
export const Activated = m('ActivatedToastAction', { id: S.String })
export const Paused = m('PausedToast', { id: S.String })
export const Resumed = m('ResumedToast', { id: S.String })
export const CompletedWait = m('CompletedWaitBeforeDismissingToast', { id: S.String, timerVersion: S.Number })
export const Message = S.Union([Dismissed, Activated, Paused, Resumed, CompletedWait])
export type Message = typeof Message.Type

export const DismissedToast = m('DismissedToast', { entry: Entry })
export const ActivatedToast = m('ActivatedToast', { entry: Entry })
export const OutMessage = S.Union([DismissedToast, ActivatedToast])
export type OutMessage = typeof OutMessage.Type

export const init = (config: Readonly<{ id: string }>): Model => ({ id: config.id, nextId: 0, entries: [] })

export const WaitBeforeDismissing = Command.define('WaitBeforeDismissingToast', {
  args: { id: S.String, durationMs: S.Number, timerVersion: S.Number },
  messages: [CompletedWait],
  execute: ({ id, durationMs, timerVersion }) => Effect.sleep(`${durationMs} millis`).pipe(
    Effect.as(CompletedWait({ id, timerVersion })),
  ),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>, Option.Option<OutMessage>]

const schedule = (entry: Entry): ReadonlyArray<Command.Command<Message>> => entry.sticky || entry.isPaused
  ? []
  : [WaitBeforeDismissing({ id: entry.id, durationMs: entry.durationMs, timerVersion: entry.timerVersion })]

const remove = (model: Model, id: string, action: boolean): UpdateReturn => {
  const entry = model.entries.find(candidate => candidate.id === id)
  if (entry === undefined) return [model, [], Option.none()]
  return [
    { ...model, entries: model.entries.filter(candidate => candidate.id !== id) },
    [],
    Option.some(action ? ActivatedToast({ entry }) : DismissedToast({ entry })),
  ]
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Dismissed': return remove(model, message.id, false)
    case 'ActivatedToastAction': return remove(model, message.id, true)
    case 'PausedToast': return [{ ...model, entries: model.entries.map(entry => entry.id === message.id ? { ...entry, isPaused: true } : entry) }, [], Option.none()]
    case 'ResumedToast': {
      const entries = model.entries.map(entry => entry.id === message.id ? { ...entry, isPaused: false, timerVersion: entry.timerVersion + 1 } : entry)
      const entry = entries.find(candidate => candidate.id === message.id)
      return [{ ...model, entries }, entry === undefined ? [] : schedule(entry), Option.none()]
    }
    case 'CompletedWaitBeforeDismissingToast': {
      const entry = model.entries.find(candidate => candidate.id === message.id)
      return entry === undefined || entry.isPaused || entry.timerVersion !== message.timerVersion
        ? [model, [], Option.none()]
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
}>
export type ShowInput = ToastInput & Readonly<{ variant: Variant }>
export type UpdateInput = Partial<Omit<ToastInput, 'duration'>> & Readonly<{ duration?: Duration.Input; variant?: Variant }>

const toastInput = (variant: Variant, input: ToastInput): ShowInput => ({ ...input, variant })
export const success = (input: ToastInput): ShowInput => toastInput('Success', input)
export const error = (input: ToastInput): ShowInput => toastInput('Error', input)
export const info = (input: ToastInput): ShowInput => toastInput('Info', input)
export const warning = (input: ToastInput): ShowInput => toastInput('Warning', input)

const payload = (input: Pick<ToastInput, 'title' | 'description' | 'actionLabel'>): ToastPayload => ({
  title: input.title,
  ...(input.description === undefined ? {} : { description: input.description }),
  ...(input.actionLabel === undefined ? {} : { actionLabel: input.actionLabel }),
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
  return [{ ...model, nextId: model.nextId + 1, entries: [...model.entries, entry] }, schedule(entry), Option.none()]
}

export const updateToast = (model: Model, id: string, input: UpdateInput): UpdateReturn => {
  const previous = model.entries.find(entry => entry.id === id)
  if (previous === undefined) return [model, [], Option.none()]
  const entry: Entry = {
    ...previous,
    payload: {
      title: input.title ?? previous.payload.title,
      ...(input.description === undefined ? (previous.payload.description === undefined ? {} : { description: previous.payload.description }) : { description: input.description }),
      ...(input.actionLabel === undefined ? (previous.payload.actionLabel === undefined ? {} : { actionLabel: previous.payload.actionLabel }) : { actionLabel: input.actionLabel }),
    },
    variant: input.variant ?? previous.variant,
    sticky: input.sticky ?? previous.sticky,
    durationMs: input.duration === undefined ? previous.durationMs : Math.max(0, Duration.toMillis(input.duration)),
    timerVersion: previous.timerVersion + 1,
  }
  return [{ ...model, entries: model.entries.map(candidate => candidate.id === id ? entry : candidate) }, schedule(entry), Option.none()]
}

export const dismiss = (model: Model, id: string): UpdateReturn => remove(model, id, false)
export const dismissAll = (model: Model): UpdateReturn => [{ ...model, entries: [] }, [], Option.none()]
export const Added = Entry

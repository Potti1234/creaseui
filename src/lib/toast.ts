import type { Update } from 'foldkit'
import { Duration, Equal, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'
import { taggedStruct } from 'foldkit/schema'
import * as ToastPrimitive from '@foldkit/ui/toast'

export const Position = S.Literals([
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
])
export type Position = typeof Position.Type
export const Variant = S.Literals([
  'Default',
  'Success',
  'Error',
  'Warning',
  'Info',
])
export type Variant = typeof Variant.Type

/** The crease toast payload. `variant` lives inside the payload because the
 *  upstream Toast entry variant has no `Default` case; the primitive's own
 *  `entry.variant` field maps `Default` to `Info`. */
export const ToastPayload = S.Struct({
  title: S.String,
  description: S.optional(S.String),
  actionLabel: S.optional(S.String),
  position: S.optional(Position),
  variant: Variant,
})
export type ToastPayload = typeof ToastPayload.Type

const Toast = ToastPrimitive.make(ToastPayload)

export const Model = Toast.Model
export type Model = typeof Model.Type
export const Entry = Toast.Entry
export type Entry = typeof Entry.Type

/** The crease-only message a toast action button dispatches. Every other
 *  message in the union is an upstream `Toast.Message`. */
export const ActivatedToastAction = taggedStruct('ActivatedToastAction', {
  id: S.String,
})
export const Message = Toast.Message
export type Message =
  | typeof Toast.Message.Type
  | typeof ActivatedToastAction.Type

export const OutMessage = defineMessageUnion({
  DismissedToast: { entry: Entry },
  ActivatedToast: { entry: Entry },
})
export type OutMessage = typeof OutMessage.Type

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const primitiveVariant = (
  variant: Variant,
): 'Info' | 'Success' | 'Warning' | 'Error' =>
  variant === 'Default' ? 'Info' : variant

/** Maps the primitive's `DismissedToast({payload})` back to crease's
 *  `{entry}` shape by structural payload equality — the primitive rebuilds
 *  the payload through Schema decoding, so identity comparison misses. */
const toOutMessage = (
  model: Model,
  out: typeof Toast.OutMessage.Type | undefined,
): OutMessage | undefined => {
  if (out === undefined) return undefined
  const entry = model.entries.find(candidate =>
    Equal.equals(candidate.payload, out.payload),
  )
  return entry === undefined ? undefined : OutMessage.DismissedToast({ entry })
}

const mapCommands = (
  commands:
    | ReadonlyArray<Command.Command<typeof Toast.Message.Type>>
    | undefined,
): ReadonlyArray<Command.Command<Message>> =>
  Command.mapMessages(commands ?? [], message => message)

export const init = (
  config: Readonly<{
    id: string
    defaultDuration?: Duration.Input
    swipeToDismiss?: ToastPrimitive.SwipeToDismissConfig
  }>,
): Model =>
  Toast.init({
    id: config.id,
    ...(config.defaultDuration === undefined
      ? {}
      : { defaultDuration: config.defaultDuration }),
    ...(config.swipeToDismiss === undefined
      ? {}
      : { swipeToDismiss: config.swipeToDismiss }),
  })

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag === 'ActivatedToastAction') {
    const entry = model.entries.find(candidate => candidate.id === message.id)
    if (entry === undefined) return { model }
    const result = Toast.dismiss(model, message.id)
    return {
      model: result.model,
      commands: mapCommands(result.commands),
      outMessage: OutMessage.ActivatedToast({ entry }),
    }
  }
  const result = Toast.update(model, message)
  const outMessage = toOutMessage(model, result.outMessage)
  return {
    model: result.model,
    commands: mapCommands(result.commands),
    ...(outMessage === undefined ? {} : { outMessage }),
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
export type UpdateInput = Partial<Omit<ToastInput, 'duration'>> &
  Readonly<{ duration?: Duration.Input; variant?: Variant }>

const toastInput = (variant: Variant, input: ToastInput): ShowInput => ({
  ...input,
  variant,
})
export const success = (input: ToastInput): ShowInput =>
  toastInput('Success', input)
export const error = (input: ToastInput): ShowInput =>
  toastInput('Error', input)
export const info = (input: ToastInput): ShowInput => toastInput('Info', input)
export const warning = (input: ToastInput): ShowInput =>
  toastInput('Warning', input)
export const plain = (input: ToastInput): ShowInput =>
  toastInput('Default', input)

const payload = (
  input: Pick<ToastInput, 'title' | 'description' | 'actionLabel' | 'position'>,
  variant: Variant,
): ToastPayload => ({
  title: input.title,
  variant,
  ...(input.description === undefined
    ? {}
    : { description: input.description }),
  ...(input.actionLabel === undefined
    ? {}
    : { actionLabel: input.actionLabel }),
  ...(input.position === undefined ? {} : { position: input.position }),
})

export const show = (model: Model, input: ShowInput): UpdateReturn => {
  const result = Toast.show(model, {
    payload: payload(input, input.variant),
    variant: primitiveVariant(input.variant),
    ...(input.duration === undefined ? {} : { duration: input.duration }),
    ...(input.sticky === undefined ? {} : { sticky: input.sticky }),
  })
  return { model: result.model, commands: mapCommands(result.commands) }
}

/** Rebuilds an entry's payload/variant/duration, then routes a synthetic
 *  `LeftEntry` through the primitive so its dismissal timer reschedules
 *  against a fresh `pendingDismissVersion`. */
export const updateToast = (
  model: Model,
  id: string,
  input: UpdateInput,
): UpdateReturn => {
  const previous = model.entries.find(entry => entry.id === id)
  if (previous === undefined) return { model }
  const variant = input.variant ?? previous.payload.variant
  const nextEntry: Entry = {
    ...previous,
    payload: {
      title: input.title ?? previous.payload.title,
      variant,
      ...(input.description === undefined
        ? previous.payload.description === undefined
          ? {}
          : { description: previous.payload.description }
        : { description: input.description }),
      ...(input.actionLabel === undefined
        ? previous.payload.actionLabel === undefined
          ? {}
          : { actionLabel: previous.payload.actionLabel }
        : { actionLabel: input.actionLabel }),
      ...(input.position === undefined
        ? previous.payload.position === undefined
          ? {}
          : { position: previous.payload.position }
        : { position: input.position }),
    },
    variant: primitiveVariant(variant),
    maybeDuration:
      input.sticky === true
        ? Option.none()
        : input.duration !== undefined
          ? Option.some(Duration.fromInputUnsafe(input.duration))
          : previous.maybeDuration,
  }
  const replaced = {
    ...model,
    entries: model.entries.map(candidate =>
      candidate.id === id ? nextEntry : candidate,
    ),
  }
  return update(replaced, Toast.Message.LeftEntry({ entryId: id }))
}

export const dismiss = (model: Model, id: string): UpdateReturn =>
  update(model, Toast.Message.Dismissed({ entryId: id }))
export const dismissAll = (model: Model): UpdateReturn =>
  update(model, Toast.Message.DismissedAll())
export const Added = Entry

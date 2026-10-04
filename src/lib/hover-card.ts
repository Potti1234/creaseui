import type { Update } from 'foldkit'
import { Duration, Effect, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { HoverIntent as HoverIntentPrimitive } from '@foldkit/ui'
import { defineMessageUnion } from 'foldkit/message'

/* The open/close intent state machine is the foldkit HoverIntent primitive;
   this module keeps crease's model (with its caller-facing `id`) and message
   vocabulary as a thin adapter so consumers keep a stable API. */

export const Model = S.Struct({
  id: S.String,
  ...HoverIntentPrimitive.Model.fields,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  EnteredHoverCard: {},
  LeftHoverCard: {},
  FocusedHoverCardTrigger: {},
  BlurredHoverCardTrigger: {},
  PressedEscapeOnHoverCard: {},
  PressedPointerOnHoverCardTrigger: { pointerType: S.String },
  CompletedHoverCardAnchor: {},
  CompletedWaitBeforeShowingHoverCard: { version: S.Number },
  CompletedWaitBeforeClosingHoverCard: { version: S.Number },
})
export type Message = typeof Message.Type

export type InitConfig = Readonly<{
  id: string
  closeDelay?: Duration.Input
  showDelay?: Duration.Input
}>
const millis = (value: Duration.Input): number =>
  Math.max(0, Duration.toMillis(value))
export const init = (config: InitConfig): Model => ({
  id: config.id,
  ...HoverIntentPrimitive.init({
    // Preserve crease's 200ms/150ms defaults (the primitive defaults to 300ms close).
    openDelay: config.showDelay ?? '200 millis',
    closeDelay: config.closeDelay ?? '150 millis',
  }),
})

export const WaitBeforeShowing = Command.define('WaitBeforeShowingHoverCard', {
  args: { version: S.Number, delayMs: S.Number },
  messages: [Message.CompletedWaitBeforeShowingHoverCard],
  execute: ({ version, delayMs }) =>
    Effect.sleep(`${delayMs} millis`).pipe(
      Effect.as(Message.CompletedWaitBeforeShowingHoverCard({ version })),
    ),
})
export const WaitBeforeClosing = Command.define('WaitBeforeClosingHoverCard', {
  args: { version: S.Number, delayMs: S.Number },
  messages: [Message.CompletedWaitBeforeClosingHoverCard],
  execute: ({ version, delayMs }) =>
    Effect.sleep(`${delayMs} millis`).pipe(
      Effect.as(Message.CompletedWaitBeforeClosingHoverCard({ version })),
    ),
})

type UpdateReturn = Update.Return<Model, Message>

const toPrimitiveModel = (model: Model): HoverIntentPrimitive.Model => {
  const { id: _id, ...primitiveModel } = model
  return primitiveModel
}

const toPrimitiveMessage = (message: Message): HoverIntentPrimitive.Message => {
  switch (message._tag) {
    case 'EnteredHoverCard':
      return HoverIntentPrimitive.Message.EnteredTrigger()
    case 'LeftHoverCard':
      return HoverIntentPrimitive.Message.LeftTrigger()
    case 'FocusedHoverCardTrigger':
      return HoverIntentPrimitive.Message.FocusedTrigger()
    case 'BlurredHoverCardTrigger':
      return HoverIntentPrimitive.Message.BlurredTrigger()
    case 'PressedEscapeOnHoverCard':
      return HoverIntentPrimitive.Message.PressedEscape({ source: 'Trigger' })
    case 'CompletedWaitBeforeShowingHoverCard':
      return HoverIntentPrimitive.Message.CompletedWaitBeforeOpening({
        version: message.version,
      })
    case 'CompletedWaitBeforeClosingHoverCard':
      return HoverIntentPrimitive.Message.CompletedWaitBeforeClosing({
        version: message.version,
      })
    // Handled directly in update — the primitive has no press or anchor events.
    case 'PressedPointerOnHoverCardTrigger':
    case 'CompletedHoverCardAnchor':
      return HoverIntentPrimitive.Message.CompletedWaitBeforeOpening({
        version: -1,
      })
  }
}

const fromPrimitiveMessage = (
  message: HoverIntentPrimitive.Message,
): Message => {
  switch (message._tag) {
    case 'CompletedWaitBeforeOpening':
      return Message.CompletedWaitBeforeShowingHoverCard({
        version: message.version,
      })
    case 'CompletedWaitBeforeClosing':
      return Message.CompletedWaitBeforeClosingHoverCard({
        version: message.version,
      })
    case 'EnteredTrigger':
      return Message.EnteredHoverCard()
    case 'LeftTrigger':
      return Message.LeftHoverCard()
    case 'FocusedTrigger':
      return Message.FocusedHoverCardTrigger()
    case 'BlurredTrigger':
      return Message.BlurredHoverCardTrigger()
    case 'PressedEscape':
      return Message.PressedEscapeOnHoverCard()
    case 'EnteredPanel':
      return Message.EnteredHoverCard()
    case 'LeftPanel':
      return Message.LeftHoverCard()
    case 'FocusedPanel':
      return Message.FocusedHoverCardTrigger()
    case 'BlurredPanel':
      return Message.BlurredHoverCardTrigger()
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'CompletedHoverCardAnchor':
      return { model }
    // Non-mouse press toggles the card (touch support); the primitive's
    // open intent is driven by hover/focus only.
    case 'PressedPointerOnHoverCardTrigger':
      return message.pointerType === 'mouse'
        ? { model }
        : { model: { ...model, isOpen: !model.isOpen, isDismissed: false } }
    default: {
      const result = HoverIntentPrimitive.update(
        toPrimitiveModel(model),
        toPrimitiveMessage(message),
      )
      return {
        model: { ...model, ...result.model },
        /* Primitive Commands are re-expressed with crease names/args so
           callers keep resolving `WaitBeforeShowingHoverCard` /
           `WaitBeforeClosingHoverCard`. */
        commands: (result.commands ?? []).map(command => {
          const args = command.args as
            | { delay?: Duration.Duration; version?: number }
            | undefined
          if (args?.delay !== undefined && args.version !== undefined) {
            if (command.name === 'WaitBeforeOpening') {
              return WaitBeforeShowing({
                delayMs: Duration.toMillis(args.delay),
                version: args.version,
              })
            }
            if (command.name === 'WaitBeforeClosing') {
              return WaitBeforeClosing({
                delayMs: Duration.toMillis(args.delay),
                version: args.version,
              })
            }
          }
          return Command.mapMessage(command, fromPrimitiveMessage)
        }),
      }
    }
  }
}

export const reflectShowDelay = (
  model: Model,
  value: Duration.Input,
): Model => ({ ...model, openDelay: Duration.millis(millis(value)) })
export const reflectCloseDelay = (
  model: Model,
  value: Duration.Input,
): Model => ({ ...model, closeDelay: Duration.millis(millis(value)) })

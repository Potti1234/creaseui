import type { Update } from 'foldkit'
import { Duration, Effect, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { Tooltip as TooltipPrimitive } from '@foldkit/ui'
import { defineMessageUnion } from 'foldkit/message'

/* The visibility state machine is the foldkit Tooltip primitive; this module
   keeps crease's message/OutMessage vocabulary as a thin adapter so callers
   (and the two renderer skins) keep a stable API. */

export const Model = TooltipPrimitive.Model
export type Model = typeof Model.Type






export const Message = defineMessageUnion({
  'EnteredTooltipTrigger': {},
  'LeftTooltipTrigger': {},
  'FocusedTooltipTrigger': {},
  'BlurredTooltipTrigger': {},
  'PressedEscapeOnTooltip': {},
  'PressedPointerOnTooltipTrigger': { pointerType: S.String },
  'CompletedTooltipAnchor': {},
  'CompletedWaitBeforeShowingTooltip': { version: S.Number },
  'CompletedWaitBeforeClosingTooltip': { version: S.Number },
});
export type Message = typeof Message.Type



export const OutMessage = defineMessageUnion({
  'ShownTooltip': {},
  'HiddenTooltip': {},
});
export type OutMessage = typeof OutMessage.Type

export type InitConfig = Readonly<{
  id: string
  showDelay?: Duration.Input
  closeDelay?: Duration.Input
}>

export const init = (config: InitConfig): Model =>
  TooltipPrimitive.init({
    id: config.id,
    ...(config.showDelay === undefined ? {} : { showDelay: config.showDelay }),
  })

const millis = (input: Duration.Input): number => Math.max(0, Duration.toMillis(input))

export const WaitBeforeShowing = Command.define('WaitBeforeShowingTooltip', {
  args: { delayMs: S.Number, version: S.Number },
  messages: [Message['CompletedWaitBeforeShowingTooltip']],
  execute: ({ delayMs, version }) => Effect.sleep(`${delayMs} millis`).pipe(
    Effect.as(Message['CompletedWaitBeforeShowingTooltip']({ version })),
  ),
})

const toPrimitiveMessage = (message: Message): TooltipPrimitive.Message => {
  switch (message._tag) {
    case 'EnteredTooltipTrigger': return TooltipPrimitive.Message.EnteredTrigger()
    case 'LeftTooltipTrigger': return TooltipPrimitive.Message.LeftTrigger()
    case 'FocusedTooltipTrigger': return TooltipPrimitive.Message.FocusedTrigger()
    case 'BlurredTooltipTrigger': return TooltipPrimitive.Message.BlurredTrigger()
    case 'PressedEscapeOnTooltip': return TooltipPrimitive.Message.PressedEscape()
    case 'PressedPointerOnTooltipTrigger':
      return TooltipPrimitive.Message.PressedPointerOnTrigger({ pointerType: message.pointerType })
    case 'CompletedTooltipAnchor': return TooltipPrimitive.Message.CompletedAnchorTooltip()
    case 'CompletedWaitBeforeShowingTooltip':
      return TooltipPrimitive.Message.CompletedWaitBeforeShowing({ version: message.version })
    // The primitive closes immediately on disengage; there is no closing wait.
    case 'CompletedWaitBeforeClosingTooltip':
      return TooltipPrimitive.Message.CompletedWaitBeforeShowing({ version: -1 })
  }
}

const fromPrimitiveMessage = (message: TooltipPrimitive.Message): Message => {
  switch (message._tag) {
    case 'CompletedWaitBeforeShowing':
      return Message.CompletedWaitBeforeShowingTooltip({ version: message.version })
    case 'CompletedAnchorTooltip': return Message.CompletedTooltipAnchor()
    case 'EnteredTrigger': return Message.EnteredTooltipTrigger()
    case 'LeftTrigger': return Message.LeftTooltipTrigger()
    case 'FocusedTrigger': return Message.FocusedTooltipTrigger()
    case 'BlurredTrigger': return Message.BlurredTooltipTrigger()
    case 'PressedEscape': return Message.PressedEscapeOnTooltip()
    case 'PressedPointerOnTrigger':
      return Message.PressedPointerOnTooltipTrigger({ pointerType: message.pointerType })
  }
}

const toOutMessage = (out: TooltipPrimitive.OutMessage): OutMessage =>
  out._tag === 'Shown' ? OutMessage.ShownTooltip() : OutMessage.HiddenTooltip()

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const update = (model: Model, message: Message): UpdateReturn => {
  // The primitive has no close-delay concept; a stale closing completion is a no-op.
  if (message._tag === 'CompletedWaitBeforeClosingTooltip') return { model }
  const result = TooltipPrimitive.update(model, toPrimitiveMessage(message))
  return {
    model: result.model,
    commands: Command.mapMessages(result.commands ?? [], fromPrimitiveMessage),
    ...(result.outMessage === undefined
      ? {}
      : { outMessage: toOutMessage(result.outMessage) }),
  }
}

export const reflectShowDelay = TooltipPrimitive.reflectShowDelay

/** @deprecated The foldkit Tooltip has no close delay; kept for API compatibility. */
export const reflectCloseDelay = (model: Model, _closeDelay: Duration.Input): Model => model

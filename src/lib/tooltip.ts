import type { Update } from 'foldkit'
import { Duration, Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  isHovered: S.Boolean,
  isFocused: S.Boolean,
  isDismissed: S.Boolean,
  showDelayMs: S.Number,
  closeDelayMs: S.Number,
  showVersion: S.Number,
  closeVersion: S.Number,
  pointerFocusVersion: S.Number,
})
export type Model = typeof Model.Type










export const Message = defineMessageUnion({
  'EnteredTooltipTrigger': {},
  'LeftTooltipTrigger': {},
  'FocusedTooltipTrigger': {},
  'BlurredTooltipTrigger': {},
  'PressedEscapeOnTooltip': {},
  'PressedPointerOnTooltipTrigger': {},
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

const millis = (input: Duration.Input): number => Math.max(0, Duration.toMillis(input))

export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: false,
  isHovered: false,
  isFocused: false,
  isDismissed: false,
  showDelayMs: millis(config.showDelay ?? '500 millis'),
  closeDelayMs: millis(config.closeDelay ?? '100 millis'),
  showVersion: 0,
  closeVersion: 0,
  pointerFocusVersion: 0,
})

export const WaitBeforeShowing = Command.define('WaitBeforeShowingTooltip', {
  args: { delayMs: S.Number, version: S.Number },
  messages: [Message['CompletedWaitBeforeShowingTooltip']],
  execute: ({ delayMs, version }) => Effect.sleep(`${delayMs} millis`).pipe(
    Effect.as(Message['CompletedWaitBeforeShowingTooltip']({ version })),
  ),
})

export const WaitBeforeClosing = Command.define('WaitBeforeClosingTooltip', {
  args: { delayMs: S.Number, version: S.Number },
  messages: [Message['CompletedWaitBeforeClosingTooltip']],
  execute: ({ delayMs, version }) => Effect.sleep(`${delayMs} millis`).pipe(
    Effect.as(Message['CompletedWaitBeforeClosingTooltip']({ version })),
  ),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const result = (previous: Model, next: Model, commands: ReadonlyArray<Command.Command<Message>> = []): UpdateReturn => ({ model: next, commands: commands, ...(previous.isOpen === next.isOpen
    ? {}
    : { outMessage: next.isOpen ? OutMessage['ShownTooltip']() : OutMessage['HiddenTooltip']() }) })

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'EnteredTooltipTrigger': {
      const showVersion = model.showVersion + 1
      const next = { ...model, isHovered: true, closeVersion: model.closeVersion + 1, showVersion }
      return model.isOpen || model.isDismissed
        ? result(model, next)
        : result(model, next, [WaitBeforeShowing({ delayMs: model.showDelayMs, version: showVersion })])
    }
    case 'LeftTooltipTrigger': {
      const closeVersion = model.closeVersion + 1
      const next = { ...model, isHovered: false, isDismissed: model.isFocused && model.isDismissed, showVersion: model.showVersion + 1, closeVersion }
      return model.isOpen && !model.isFocused
        ? result(model, next, [WaitBeforeClosing({ delayMs: model.closeDelayMs, version: closeVersion })])
        : result(model, next)
    }
    case 'PressedPointerOnTooltipTrigger':
      return result(model, { ...model, pointerFocusVersion: model.pointerFocusVersion + 1 })
    case 'CompletedTooltipAnchor':
      return result(model, model)
    case 'FocusedTooltipTrigger':
      if (model.pointerFocusVersion > 0) {
        return result(model, { ...model, pointerFocusVersion: 0 })
      }
      return model.isDismissed
        ? result(model, { ...model, isFocused: true })
        : result(model, { ...model, isFocused: true, isOpen: true, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 })
    case 'BlurredTooltipTrigger': {
      const closeVersion = model.closeVersion + 1
      const next = { ...model, isFocused: false, isDismissed: model.isHovered && model.isDismissed, showVersion: model.showVersion + 1, closeVersion, pointerFocusVersion: 0 }
      return model.isOpen && !model.isHovered
        ? result(model, next, [WaitBeforeClosing({ delayMs: model.closeDelayMs, version: closeVersion })])
        : result(model, next)
    }
    case 'PressedEscapeOnTooltip':
      return result(model, { ...model, isOpen: false, isDismissed: true, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 })
    case 'CompletedWaitBeforeShowingTooltip':
      return message.version === model.showVersion && model.isHovered && !model.isDismissed
        ? result(model, { ...model, isOpen: true })
        : result(model, model)
    case 'CompletedWaitBeforeClosingTooltip':
      return message.version === model.closeVersion && !model.isHovered && !model.isFocused
        ? result(model, { ...model })
        : result(model, model)
  }
}

export const reflectShowDelay = (model: Model, showDelay: Duration.Input): Model => ({ ...model, showDelayMs: millis(showDelay) })
export const reflectCloseDelay = (model: Model, closeDelay: Duration.Input): Model => ({ ...model, closeDelayMs: millis(closeDelay) })

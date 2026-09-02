import { Duration, Effect, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { m } from 'foldkit/message'

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
})
export type Model = typeof Model.Type

export const Entered = m('EnteredHoverCard')
export const Left = m('LeftHoverCard')
export const Focused = m('FocusedHoverCardTrigger')
export const Blurred = m('BlurredHoverCardTrigger')
export const PressedEscape = m('PressedEscapeOnHoverCard')
export const PressedPointer = m('PressedPointerOnHoverCardTrigger', { pointerType: S.String })
export const CompletedAnchor = m('CompletedHoverCardAnchor')
export const CompletedWaitBeforeShowingHoverCard = m('CompletedWaitBeforeShowingHoverCard', { version: S.Number })
export const CompletedWaitBeforeClosingHoverCard = m('CompletedWaitBeforeClosingHoverCard', { version: S.Number })
export const Message = S.Union([Entered, Left, Focused, Blurred, PressedEscape, PressedPointer, CompletedAnchor, CompletedWaitBeforeShowingHoverCard, CompletedWaitBeforeClosingHoverCard])
export type Message = typeof Message.Type

export type InitConfig = Readonly<{ id: string; closeDelay?: Duration.Input; showDelay?: Duration.Input }>
const millis = (value: Duration.Input): number => Math.max(0, Duration.toMillis(value))
export const init = (config: InitConfig): Model => ({
  id: config.id, isOpen: false, isHovered: false, isFocused: false, isDismissed: false,
  showDelayMs: millis(config.showDelay ?? '200 millis'), closeDelayMs: millis(config.closeDelay ?? '150 millis'),
  showVersion: 0, closeVersion: 0,
})

export const WaitBeforeShowing = Command.define('WaitBeforeShowingHoverCard', {
  args: { version: S.Number, delayMs: S.Number }, messages: [CompletedWaitBeforeShowingHoverCard],
  execute: ({ version, delayMs }) => Effect.sleep(`${delayMs} millis`).pipe(Effect.as(CompletedWaitBeforeShowingHoverCard({ version }))),
})
export const WaitBeforeClosing = Command.define('WaitBeforeClosingHoverCard', {
  args: { version: S.Number, delayMs: S.Number }, messages: [CompletedWaitBeforeClosingHoverCard],
  execute: ({ version, delayMs }) => Effect.sleep(`${delayMs} millis`).pipe(Effect.as(CompletedWaitBeforeClosingHoverCard({ version }))),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'EnteredHoverCard': {
      const showVersion = model.showVersion + 1
      const next = { ...model, isHovered: true, closeVersion: model.closeVersion + 1, showVersion }
      return model.isOpen || model.isDismissed ? [next, []] : [next, [WaitBeforeShowing({ version: showVersion, delayMs: model.showDelayMs })]]
    }
    case 'LeftHoverCard': {
      const closeVersion = model.closeVersion + 1
      const next = { ...model, isHovered: false, isDismissed: model.isFocused && model.isDismissed, showVersion: model.showVersion + 1, closeVersion }
      return model.isOpen && !model.isFocused ? [next, [WaitBeforeClosing({ version: closeVersion, delayMs: model.closeDelayMs })]] : [next, []]
    }
    case 'FocusedHoverCardTrigger':
      return model.isDismissed ? [{ ...model, isFocused: true }, []] : [{ ...model, isFocused: true, isOpen: true, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 }, []]
    case 'BlurredHoverCardTrigger': {
      const closeVersion = model.closeVersion + 1
      const next = { ...model, isFocused: false, isDismissed: model.isHovered && model.isDismissed, closeVersion }
      return model.isOpen && !model.isHovered ? [next, [WaitBeforeClosing({ version: closeVersion, delayMs: model.closeDelayMs })]] : [next, []]
    }
    case 'PressedPointerOnHoverCardTrigger':
      return message.pointerType === 'mouse' ? [model, []] : [{ ...model, isOpen: !model.isOpen, isDismissed: false, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 }, []]
    case 'CompletedHoverCardAnchor':
      return [model, []]
    case 'PressedEscapeOnHoverCard':
      return [{ ...model, isOpen: false, isDismissed: true, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 }, []]
    case 'CompletedWaitBeforeShowingHoverCard':
      return message.version === model.showVersion && model.isHovered && !model.isDismissed ? [{ ...model, isOpen: true }, []] : [model, []]
    case 'CompletedWaitBeforeClosingHoverCard':
      return message.version === model.closeVersion && !model.isHovered && !model.isFocused ? [{ ...model, isOpen: false }, []] : [model, []]
  }
}

export const reflectShowDelay = (model: Model, value: Duration.Input): Model => ({ ...model, showDelayMs: millis(value) })
export const reflectCloseDelay = (model: Model, value: Duration.Input): Model => ({ ...model, closeDelayMs: millis(value) })

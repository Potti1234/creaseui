import type { Update } from 'foldkit'
import { Duration, Effect, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { defineMessageUnion } from 'foldkit/message'

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  isHovered: S.Boolean,
  isFocused: S.Boolean,
  isDismissed: S.Boolean,
  openedByHover: S.Boolean,
  showDelayMs: S.Number,
  closeDelayMs: S.Number,
  showVersion: S.Number,
  closeVersion: S.Number,
})
export type Model = typeof Model.Type










export const Message = defineMessageUnion({
  'EnteredHoverCard': {},
  'LeftHoverCard': {},
  'FocusedHoverCardTrigger': {},
  'BlurredHoverCardTrigger': {},
  'PressedEscapeOnHoverCard': {},
  'PressedPointerOnHoverCardTrigger': { pointerType: S.String },
  'CompletedHoverCardAnchor': {},
  CompletedWaitBeforeShowingHoverCard: { version: S.Number },
  CompletedWaitBeforeClosingHoverCard: { version: S.Number },
});
export type Message = typeof Message.Type

export type InitConfig = Readonly<{ id: string; closeDelay?: Duration.Input; showDelay?: Duration.Input }>
const millis = (value: Duration.Input): number => Math.max(0, Duration.toMillis(value))
export const init = (config: InitConfig): Model => ({
  id: config.id, isOpen: false, isHovered: false, isFocused: false, isDismissed: false, openedByHover: false,
  showDelayMs: millis(config.showDelay ?? '200 millis'), closeDelayMs: millis(config.closeDelay ?? '150 millis'),
  showVersion: 0, closeVersion: 0,
})

export const WaitBeforeShowing = Command.define('WaitBeforeShowingHoverCard', {
  args: { version: S.Number, delayMs: S.Number }, messages: [Message.CompletedWaitBeforeShowingHoverCard],
  execute: ({ version, delayMs }) => Effect.sleep(`${delayMs} millis`).pipe(Effect.as(Message.CompletedWaitBeforeShowingHoverCard({ version }))),
})
export const WaitBeforeClosing = Command.define('WaitBeforeClosingHoverCard', {
  args: { version: S.Number, delayMs: S.Number }, messages: [Message.CompletedWaitBeforeClosingHoverCard],
  execute: ({ version, delayMs }) => Effect.sleep(`${delayMs} millis`).pipe(Effect.as(Message.CompletedWaitBeforeClosingHoverCard({ version }))),
})

type UpdateReturn = Update.Return<Model, Message>
export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'EnteredHoverCard': {
      const showVersion = model.showVersion + 1
      const closeVersion = model.closeVersion + 1
      // A dismissal ends on re-engagement: a pointer entering after Escape
      // reopens the card immediately rather than waiting out the show delay.
      if (model.isDismissed) {
        return { model: { ...model, isHovered: true, isDismissed: false, isOpen: true, openedByHover: true, showVersion, closeVersion } }
      }
      const next = { ...model, isHovered: true, closeVersion, showVersion }
      return model.isOpen ? { model: next } : { model: next, commands: [WaitBeforeShowing({ version: showVersion, delayMs: model.showDelayMs })] }
    }
    case 'LeftHoverCard': {
      const closeVersion = model.closeVersion + 1
      const next = { ...model, isHovered: false, isDismissed: model.isFocused && model.isDismissed, showVersion: model.showVersion + 1, closeVersion }
      if (!model.isOpen || model.isFocused) {
        return { model: next }
      }
      // Leaving the card after hovering it closes only a card that hover
      // opened; a bare leave (no preceding enter) still closes. A disarmed
      // leave issues a stale-versioned wait so the version gate discards its
      // completion instead of closing an externally opened card.
      const closesOnLeave = !model.isHovered || model.openedByHover
      const version = closesOnLeave ? closeVersion : model.closeVersion
      return { model: next, commands: [WaitBeforeClosing({ version, delayMs: model.closeDelayMs })] }
    }
    case 'FocusedHoverCardTrigger':
      return model.isDismissed ? { model: { ...model, isFocused: true }, } : { model: { ...model, isFocused: true, isOpen: true, openedByHover: false, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 }, }
    case 'BlurredHoverCardTrigger': {
      const closeVersion = model.closeVersion + 1
      const next = { ...model, isFocused: false, isDismissed: model.isHovered && model.isDismissed, closeVersion }
      return model.isOpen && !model.isHovered ? { model: next, commands: [WaitBeforeClosing({ version: closeVersion, delayMs: model.closeDelayMs })] } : { model: next }
    }
    case 'PressedPointerOnHoverCardTrigger':
      return message.pointerType === 'mouse' ? ({ model: model }) : { model: { ...model, isOpen: !model.isOpen, isDismissed: false, openedByHover: false, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 }, }
    case 'CompletedHoverCardAnchor':
      return { model: model }
    case 'PressedEscapeOnHoverCard':
      return { model: { ...model, isOpen: false, isDismissed: true, openedByHover: false, showVersion: model.showVersion + 1, closeVersion: model.closeVersion + 1 } }
    case 'CompletedWaitBeforeShowingHoverCard':
      return message.version === model.showVersion && model.isHovered && !model.isDismissed ? { model: { ...model, isOpen: true, openedByHover: true }, } : ({ model: model })
    case 'CompletedWaitBeforeClosingHoverCard':
      return message.version === model.closeVersion && !model.isHovered && !model.isFocused ? { model: { ...model, isOpen: false, openedByHover: false }, } : ({ model: model })
  }
}

export const reflectShowDelay = (model: Model, value: Duration.Input): Model => ({ ...model, showDelayMs: millis(value) })
export const reflectCloseDelay = (model: Model, value: Duration.Input): Model => ({ ...model, closeDelayMs: millis(value) })

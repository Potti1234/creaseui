import type { Update } from 'foldkit'
import { Duration, Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'

import * as HoverIntent from './hover-intent'
import * as Position from './position'

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  isHovered: S.Boolean,
  isFocused: S.Boolean,
  isDismissed: S.Boolean,
  showDelay: S.DurationFromMillis,
  pendingShowVersion: S.Number,
  maybeLastPointerType: S.Option(S.String),
  closeDelayMs: S.Number,
  pendingCloseVersion: S.Number,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  EnteredTooltipTrigger: {},
  LeftTooltipTrigger: {},
  FocusedTooltipTrigger: {},
  BlurredTooltipTrigger: {},
  PressedEscapeOnTooltip: {},
  PressedPointerOnTooltipTrigger: { pointerType: S.String },
  CompletedTooltipAnchor: {},
  CompletedWaitBeforeShowingTooltip: { version: S.Number },
  CompletedWaitBeforeClosingTooltip: { version: S.Number },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ShownTooltip: {},
  HiddenTooltip: {},
})
export type OutMessage = typeof OutMessage.Type

// The anchor mount preserves the renderer portal and placement contract.
export type AnchorConfig = Position.AnchorConfig
const AnchorMessage = defineMessageUnion({ CompletedAnchorTooltip: {} })

export const AnchorTooltip = Mount.define('AnchorTooltip', {
  args: { buttonId: S.String, anchor: Position.AnchorConfig },
  messages: [AnchorMessage.CompletedAnchorTooltip],
  execute: ({ element, buttonId, anchor }) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        Position.bindAnchor(element, { buttonId, anchor, interceptTab: false }),
      ),
      cleanup => Effect.sync(cleanup),
    ).pipe(Effect.as(AnchorMessage.CompletedAnchorTooltip())),
})

export type InitConfig = Readonly<{
  id: string
  showDelay?: Duration.Input
  closeDelay?: Duration.Input
}>

const millis = (input: Duration.Input): number =>
  Math.max(0, Duration.toMillis(input))

export const init = (config: InitConfig): Model => ({
  id: config.id,
  isOpen: false,
  isHovered: false,
  isFocused: false,
  isDismissed: false,
  showDelay: Duration.fromInputUnsafe(config.showDelay ?? 500),
  pendingShowVersion: 0,
  maybeLastPointerType: Option.none(),
  closeDelayMs: millis(config.closeDelay ?? '100 millis'),
  pendingCloseVersion: 0,
})

export const WaitBeforeShowing = Command.define('WaitBeforeShowingTooltip', {
  args: { delayMs: S.Number, version: S.Number },
  messages: [Message['CompletedWaitBeforeShowingTooltip']],
  execute: ({ delayMs, version }) =>
    Effect.sleep(`${delayMs} millis`).pipe(
      Effect.as(Message['CompletedWaitBeforeShowingTooltip']({ version })),
    ),
})

export const WaitBeforeClosing = Command.define('WaitBeforeClosingTooltip', {
  args: { delayMs: S.Number, version: S.Number },
  messages: [Message['CompletedWaitBeforeClosingTooltip']],
  execute: ({ delayMs, version }) =>
    Effect.sleep(`${delayMs} millis`).pipe(
      Effect.as(Message['CompletedWaitBeforeClosingTooltip']({ version })),
    ),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

type IntentMessage = Exclude<
  Message,
  { _tag: 'PressedPointerOnTooltipTrigger' | 'CompletedTooltipAnchor' }
>

const toIntentMessage = (message: IntentMessage): HoverIntent.Message => {
  const intent = HoverIntent.Message
  switch (message._tag) {
    case 'EnteredTooltipTrigger':
      return intent.EnteredTrigger()
    case 'LeftTooltipTrigger':
      return intent.LeftTrigger()
    case 'FocusedTooltipTrigger':
      return intent.FocusedTrigger()
    case 'BlurredTooltipTrigger':
      return intent.BlurredTrigger()
    case 'PressedEscapeOnTooltip':
      return intent.Dismissed()
    case 'CompletedWaitBeforeShowingTooltip':
      return intent.CompletedWaitBeforeOpening({ version: message.version })
    case 'CompletedWaitBeforeClosingTooltip':
      return intent.CompletedWaitBeforeClosing({ version: message.version })
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'CompletedTooltipAnchor':
      return { model }
    case 'PressedPointerOnTooltipTrigger':
      return {
        model: {
          ...model,
          maybeLastPointerType: Option.some(message.pointerType),
        },
      }
    case 'FocusedTooltipTrigger':
      if (Option.isSome(model.maybeLastPointerType)) {
        return {
          model: {
            ...model,
            maybeLastPointerType: Option.none(),
            pendingCloseVersion: model.pendingCloseVersion + 1,
          },
        }
      }
      break
  }

  const current: HoverIntent.Model = {
    isOpen: model.isOpen,
    isTriggerHovered: model.isHovered,
    isPanelHovered: false,
    maybeFocusLocation: model.isFocused
      ? Option.some('Trigger')
      : Option.none(),
    isDismissed: model.isDismissed,
    openDelay: model.showDelay,
    closeDelay: Duration.millis(model.closeDelayMs),
    pendingOpenVersion: model.pendingShowVersion,
    pendingCloseVersion: model.pendingCloseVersion,
  }
  const result = HoverIntent.transition(
    current,
    toIntentMessage(message),
    HoverIntent.tooltipPreset,
  )
  const { model: next, wait, outMessage } = result
  const maybeLastPointerType =
    message._tag === 'BlurredTooltipTrigger'
      ? Option.none()
      : model.maybeLastPointerType
  const updated =
    next === current && maybeLastPointerType === model.maybeLastPointerType
      ? model
      : {
          ...model,
          isOpen: next.isOpen,
          isHovered: next.isTriggerHovered,
          isFocused: Option.isSome(next.maybeFocusLocation),
          isDismissed: next.isDismissed,
          pendingShowVersion: next.pendingOpenVersion,
          pendingCloseVersion: next.pendingCloseVersion,
          maybeLastPointerType,
        }
  if (wait !== undefined) {
    const command =
      wait.phase === 'open' ? WaitBeforeShowing : WaitBeforeClosing
    return {
      model: updated,
      commands: [
        command({
          delayMs: Duration.toMillis(wait.delay),
          version: wait.version,
        }),
      ],
    }
  }
  if (outMessage === undefined) return { model: updated }
  return {
    model: updated,
    outMessage:
      outMessage._tag === 'Opened'
        ? OutMessage.ShownTooltip()
        : OutMessage.HiddenTooltip(),
  }
}

export const reflectShowDelay = (
  model: Model,
  showDelay: Duration.Input,
): Model => ({
  ...model,
  showDelay: Duration.fromInputUnsafe(showDelay),
})

export const reflectCloseDelay = (
  model: Model,
  closeDelay: Duration.Input,
): Model => ({ ...model, closeDelayMs: millis(closeDelay) })

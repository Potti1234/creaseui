import type { Update } from 'foldkit'
import { Duration, Effect, Option, Schema as S } from 'effect'
import * as Command from 'foldkit/command'
import { Anchor } from '@foldkit/ui'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'

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
export type AnchorConfig = Anchor.AnchorConfig
const AnchorMessage = defineMessageUnion({ CompletedAnchorTooltip: {} })

export const AnchorTooltip = Mount.define('AnchorTooltip', {
  args: { buttonId: S.String, anchor: Anchor.AnchorConfig },
  messages: [AnchorMessage.CompletedAnchorTooltip],
  execute: ({ element, buttonId, anchor }) =>
    Effect.acquireRelease(
      Effect.sync(() =>
        Anchor.anchorSetup(element, { buttonId, anchor, interceptTab: false }),
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

const setVisibility = (model: Model, isOpen: boolean): UpdateReturn => {
  if (model.isOpen === isOpen) return { model }
  return {
    model: { ...model, isOpen },
    outMessage: isOpen ? OutMessage.ShownTooltip() : OutMessage.HiddenTooltip(),
  }
}

const disengage = (model: Model, next: Model): UpdateReturn => {
  const engaged = next.isHovered || next.isFocused
  const settled = {
    ...next,
    isDismissed: engaged && model.isDismissed,
    pendingShowVersion: model.pendingShowVersion + 1,
    pendingCloseVersion: model.pendingCloseVersion + 1,
  }
  if (engaged || !model.isOpen) return { model: settled }
  if (model.closeDelayMs === 0) return setVisibility(settled, false)
  return {
    model: settled,
    commands: [
      WaitBeforeClosing({
        delayMs: settled.closeDelayMs,
        version: settled.pendingCloseVersion,
      }),
    ],
  }
}

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'EnteredTooltipTrigger': {
      const next = {
        ...model,
        isHovered: true,
        pendingCloseVersion: model.pendingCloseVersion + 1,
      }
      if (next.isOpen || next.isDismissed) return { model: next }
      const version = next.pendingShowVersion + 1
      return {
        model: { ...next, pendingShowVersion: version },
        commands: [
          WaitBeforeShowing({
            delayMs: Duration.toMillis(next.showDelay),
            version,
          }),
        ],
      }
    }
    case 'FocusedTooltipTrigger': {
      const next = {
        ...model,
        maybeLastPointerType: Option.none(),
        pendingCloseVersion: model.pendingCloseVersion + 1,
      }
      if (Option.isSome(model.maybeLastPointerType)) return { model: next }
      const focused = { ...next, isFocused: true }
      if (focused.isDismissed) return { model: focused }
      return setVisibility(
        { ...focused, pendingShowVersion: model.pendingShowVersion + 1 },
        true,
      )
    }
    case 'LeftTooltipTrigger':
      return disengage(model, { ...model, isHovered: false })
    case 'BlurredTooltipTrigger':
      return disengage(model, {
        ...model,
        isFocused: false,
        maybeLastPointerType: Option.none(),
      })
    case 'PressedEscapeOnTooltip':
      return setVisibility(
        {
          ...model,
          isDismissed: true,
          pendingShowVersion: model.pendingShowVersion + 1,
          pendingCloseVersion: model.pendingCloseVersion + 1,
        },
        false,
      )
    case 'PressedPointerOnTooltipTrigger':
      return { model: { ...model, maybeLastPointerType: Option.some('mouse') } }
    case 'CompletedWaitBeforeShowingTooltip':
      return message.version === model.pendingShowVersion &&
        model.isHovered &&
        !model.isDismissed
        ? setVisibility(model, true)
        : { model }
    case 'CompletedWaitBeforeClosingTooltip':
      return message.version === model.pendingCloseVersion &&
        !model.isHovered &&
        !model.isFocused
        ? setVisibility(model, false)
        : { model }
    case 'CompletedTooltipAnchor':
      return { model }
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

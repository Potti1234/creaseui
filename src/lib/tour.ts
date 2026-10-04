import type { Update } from 'foldkit'
import { Effect, Option, Schema as S, Stream } from 'effect'
import { Queue } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'
import { Anchor } from '@foldkit/ui'

/* Renderer-neutral state for the Tour port of Meta Astryx's Tour
   (packages/lab): step navigation, dismiss-source reporting, and continuous
   tracking of the anchor target's rect for the highlight layer. */

export const TourDismissSource = S.Literals([
  'backdrop',
  'escape',
  'close',
  'skip',
  'complete',
])
export type TourDismissSource = typeof TourDismissSource.Type

export const TargetRect = S.Struct({
  top: S.Number,
  left: S.Number,
  width: S.Number,
  height: S.Number,
  borderRadius: S.String,
})
export type TargetRect = typeof TargetRect.Type

export const Model = S.Struct({
  isActive: S.Boolean,
  activeStepIndex: S.Number,
  targetRect: S.Option(TargetRect),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  RequestedNext: { stepCount: S.Number },
  RequestedPrevious: {},
  RequestedDismiss: { source: TourDismissSource },
  ObservedTargetRect: {
    top: S.Number,
    left: S.Number,
    width: S.Number,
    height: S.Number,
    borderRadius: S.String,
  },
  ObservedTargetLost: {},
  PressedOutsideCallout: {},
  CompletedTourAnchor: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  DismissedTour: { source: TourDismissSource },
})
export type OutMessage = typeof OutMessage.Type

export const init = (): Model => ({
  isActive: false,
  activeStepIndex: 0,
  targetRect: Option.none(),
})

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'RequestedNext':
      if (model.activeStepIndex + 1 >= message.stepCount) {
        return {
          model,
          outMessage: OutMessage.DismissedTour({ source: 'complete' }),
        }
      }
      return {
        model: {
          ...model,
          activeStepIndex: model.activeStepIndex + 1,
          targetRect: Option.none(),
        },
      }
    case 'RequestedPrevious':
      return {
        model: {
          ...model,
          activeStepIndex: Math.max(0, model.activeStepIndex - 1),
          targetRect: Option.none(),
        },
      }
    case 'RequestedDismiss':
      return {
        model,
        outMessage: OutMessage.DismissedTour({ source: message.source }),
      }
    case 'ObservedTargetRect':
      return {
        model: {
          ...model,
          targetRect: Option.some({
            top: message.top,
            left: message.left,
            width: message.width,
            height: message.height,
            borderRadius: message.borderRadius,
          }),
        },
      }
    case 'ObservedTargetLost':
      return { model: { ...model, targetRect: Option.none() } }
    case 'PressedOutsideCallout':
      return {
        model,
        outMessage: OutMessage.DismissedTour({ source: 'close' }),
      }
    case 'CompletedTourAnchor':
      return { model }
  }
}

/** Marks the tour active at step 0. */
export const activate = (model: Model): UpdateReturn => ({
  model: {
    ...model,
    isActive: true,
    activeStepIndex: 0,
    targetRect: Option.none(),
  },
})

export const deactivate = (model: Model): UpdateReturn => ({
  model: { ...model, isActive: false, targetRect: Option.none() },
})

const readTargetRect = (
  targetId: string,
):
  | typeof Message.ObservedTargetRect.Type
  | typeof Message.ObservedTargetLost.Type => {
  const el =
    typeof document === 'undefined' ? null : document.getElementById(targetId)
  if (el === null) return Message.ObservedTargetLost()
  const rect = el.getBoundingClientRect()
  const borderRadius =
    typeof window === 'undefined'
      ? '0px'
      : window.getComputedStyle(el).borderRadius
  return Message.ObservedTargetRect({
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius,
  })
}

/** Tracks the step's anchor target — rect + computed border-radius — through
    scroll, resize, and layout changes so the highlight ring stays glued. */
export const ObserveTourTarget = Mount.defineStream('ObserveTourTarget', {
  args: { targetId: S.String },
  messages: [Message.ObservedTargetRect, Message.ObservedTargetLost],
  execute: ({ targetId }) =>
    Stream.callback<
      | typeof Message.ObservedTargetRect.Type
      | typeof Message.ObservedTargetLost.Type
    >(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            if (typeof window === 'undefined') return undefined
            const emit = () =>
              Queue.offerUnsafe(queue, readTargetRect(targetId))
            const el = document.getElementById(targetId)
            const resize = new ResizeObserver(emit)
            if (el !== null) resize.observe(el)
            window.addEventListener('scroll', emit, { passive: true })
            window.addEventListener('resize', emit, { passive: true })
            emit()
            return { emit, resize }
          }),
          resource =>
            Effect.sync(() => {
              if (resource === undefined || typeof window === 'undefined')
                return
              window.removeEventListener('scroll', resource.emit)
              window.removeEventListener('resize', resource.emit)
              resource.resize.disconnect()
            }),
        )
        return yield* Effect.never
      }),
    ),
})

/** Positions the step callout against its (arbitrary) target with Floating
    UI — the tour's Popover anchorRef equivalent. Re-executes on remount, so
    keying the callout on the step id re-anchors per step. */
export const AnchorTourStep = Mount.define('AnchorTourStep', {
  args: { targetId: S.String, anchor: Anchor.AnchorConfig },
  messages: [Message.CompletedTourAnchor],
  execute: ({ element, targetId, anchor }) =>
    Effect.gen(function* () {
      yield* Effect.acquireRelease(
        Effect.sync(() =>
          Anchor.anchorSetup(element, {
            buttonId: targetId,
            anchor,
            interceptTab: false,
            focusAfterPosition: true,
            focusSelector: '[data-slot="tour-close"]',
          }),
        ),
        cleanup => Effect.sync(() => cleanup()),
      )
      return Message.CompletedTourAnchor()
    }),
})

/** Light-dismiss for the no-backdrop case: a pointerdown anywhere outside
    the callout or its anchor target reports PressedOutsideCallout —
    Popover's outside-click close for the custom (untriggered) anchor. */
export const ObserveOutsidePress = Mount.defineStream('ObserveOutsidePress', {
  args: { calloutSlot: S.String, targetId: S.String },
  messages: [Message.PressedOutsideCallout],
  execute: ({ calloutSlot, targetId }) =>
    Stream.callback<typeof Message.PressedOutsideCallout.Type>(queue =>
      Effect.gen(function* () {
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            if (typeof document === 'undefined') return undefined
            const handler = (event: PointerEvent) => {
              const node = event.target
              if (!(node instanceof Element)) return
              if (
                node.closest(`[data-slot="${calloutSlot}"]`) === null &&
                node.closest(`#${targetId}`) === null
              ) {
                Queue.offerUnsafe(queue, Message.PressedOutsideCallout())
              }
            }
            document.addEventListener('pointerdown', handler, true)
            return handler
          }),
          handler =>
            Effect.sync(() => {
              if (handler === undefined || typeof document === 'undefined')
                return
              document.removeEventListener('pointerdown', handler, true)
            }),
        )
        return yield* Effect.never
      }),
    ),
})

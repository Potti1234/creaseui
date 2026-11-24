import type { Update } from 'foldkit'
import { Duration, Effect, Option, Queue, Schema as S, Stream } from 'effect'
import * as Command from 'foldkit/command'
import type { HtmlBuilder } from 'foldkit/html'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'

import * as HoverIntentPrimitive from '@/lib/behaviors/hover-intent'
import * as Position from '@/lib/behaviors/position-native'

/* Keep the public Hover Card messages while composing shared interaction state. */

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

export const pointerAttributes = <Msg>(
  model: Model,
  toParentMessage: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => [
  h.OnPointerMove((_screenX, _screenY, pointerType) =>
    pointerType === 'touch' || model.isTriggerHovered
      ? Option.none()
      : Option.some(toParentMessage(Message.EnteredHoverCard())),
  ),
  ...(model.isOpen
    ? []
    : [
        h.OnPointerLeave(pointerType =>
          pointerType === 'touch'
            ? Option.none()
            : Option.some(toParentMessage(Message.LeftHoverCard())),
        ),
      ]),
]

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

export const HoverCardPlacement = S.Literals([
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
])
export type HoverCardPlacement = typeof HoverCardPlacement.Type

export const AnchorHoverCard = Mount.defineStream('HoverCardAnchor', {
  args: {
    buttonId: S.String,
    anchor: S.Struct({
      placement: S.optionalKey(HoverCardPlacement),
      gap: S.optionalKey(S.Number),
      padding: S.optionalKey(S.Number),
    }),
  },
  messages: [Message.CompletedHoverCardAnchor, Message.LeftHoverCard],
  execute: ({ element, buttonId, anchor }) =>
    Stream.callback<
      | typeof Message.CompletedHoverCardAnchor.Type
      | typeof Message.LeftHoverCard.Type
    >(queue =>
      Effect.gen(function* () {
        const owner = element.getRootNode() as Document | ShadowRoot
        const region = element.parentElement
        if (region !== null) {
          yield* HoverIntentPrimitive.watchPointerDeparture(
            region,
            owner.getElementById(buttonId),
            element,
            () => {
              Queue.offerUnsafe(queue, Message.LeftHoverCard())
            },
          )
        }
        yield* Effect.acquireRelease(
          Effect.sync(() => {
            const viewport = element.ownerDocument.defaultView
            const button = owner.getElementById(buttonId)
            if (!(element instanceof HTMLElement) || button === null)
              return () => {}
            const savedVisibility = element.style.visibility
            const savedPlacement = element.getAttribute('data-placement')
            const requested = anchor.placement ?? 'bottom'
            const [rawSide, rawAlign] = requested.split('-')
            const side = rawSide as 'top' | 'right' | 'bottom' | 'left'
            const align =
              rawAlign === 'start' || rawAlign === 'end' ? rawAlign : 'center'
            const horizontal = side === 'left' || side === 'right'
            const padding = anchor.padding ?? 0
            const gap = anchor.gap ?? 0
            const cleanup = Position.position(button, element, () => {
              const rect = button.getBoundingClientRect()
              const room =
                viewport === null
                  ? Infinity
                  : Math.max(rect.left, viewport.innerWidth - rect.right) -
                    gap -
                    padding
              return {
                side:
                  horizontal && room < element.getBoundingClientRect().width
                    ? 'bottom'
                    : side,
                align,
                sideOffset: gap,
                collisionPadding: padding,
                onPlaced: placement => {
                  element.setAttribute(
                    'data-placement',
                    placement.split('-')[0]!,
                  )
                  element.style.visibility = ''
                },
              }
            })
            return () => {
              cleanup()
              element.style.visibility = savedVisibility
              if (savedPlacement === null)
                element.removeAttribute('data-placement')
              else element.setAttribute('data-placement', savedPlacement)
            }
          }),
          cleanup => Effect.sync(cleanup),
        )
        Queue.offerUnsafe(queue, Message.CompletedHoverCardAnchor())
        return yield* Effect.never
      }),
    ),
})

type UpdateReturn = Update.Return<Model, Message>

const toPrimitiveModel = (model: Model): HoverIntentPrimitive.Model => {
  const { id: _id, ...primitiveModel } = model
  return primitiveModel
}

type IntentMessage = Exclude<
  Message,
  { _tag: 'PressedPointerOnHoverCardTrigger' | 'CompletedHoverCardAnchor' }
>

const toPrimitiveMessage = (
  message: IntentMessage,
): HoverIntentPrimitive.Message => {
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
      const { model: next, wait } = HoverIntentPrimitive.transition(
        toPrimitiveModel(model),
        toPrimitiveMessage(message),
        HoverIntentPrimitive.hoverCardPreset,
      )
      if (wait === undefined)
        return { model: { ...model, ...next }, commands: [] }
      const command =
        wait.phase === 'open' ? WaitBeforeShowing : WaitBeforeClosing
      return {
        model: { ...model, ...next },
        commands: [
          command({
            delayMs: Duration.toMillis(wait.delay),
            version: wait.version,
          }),
        ],
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

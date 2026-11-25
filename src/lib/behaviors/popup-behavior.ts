import type { Update } from 'foldkit'
import { Effect, Queue, Result, Schema, Stream } from 'effect'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import type { Attribute, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import * as Layer from './layer'
import * as Popup from './popup'
import * as Portal from './portal'
import * as Position from './position-native'

export const Model = Popup.Model
export type Model = Popup.Model
export const init = Popup.init
export const Request = Popup.Message
export const OutMessage = Popup.OutMessage
export type OutMessage = Popup.OutMessage

const Lifecycle = defineMessageUnion({
  CompletedPanelMount: {},
  CompletedTriggerFocus: {},
})
export const Message = Schema.Union([Request, Lifecycle])
export type Message = typeof Message.Type

/** IDs must be stable and unique in the shared root. Automatic trigger focus uses the document root. */
export type Config = Popup.ContentLabels &
  Readonly<{
    triggerId: string
    panelId: string
    placement: Position.PlacementOptions
    disabled?: boolean
    dismissible?: boolean
    dismissOnFocusLeave?: boolean
    hasPopup?: 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree'
    initialFocus?: 'panel' | Readonly<{ selector: string }>
    restoreFocus?: boolean
    portal?: 'top-layer'
    arrowPadding?: number
    waitForExit?: boolean | 'auto'
    exitSurfaceIds?: readonly string[]
  }>

const FocusTrigger = Command.define('FocusAnchoredPopupTrigger', {
  args: { id: Schema.String },
  messages: [Lifecycle.CompletedTriggerFocus],
  execute: ({ id }) =>
    Effect.suspend(() =>
      Dom.focus(`#${CSS.escape(id)}`, { preventScroll: true }),
    ).pipe(Effect.ignore, Effect.as(Lifecycle.CompletedTriggerFocus())),
})

/** Escape and explicit close return focus by default. Outside press and
 * focus leave preserve the destination chosen by the user. */
export const update = (
  model: Model,
  message: Message,
  config: Config,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
  if (
    message._tag === 'CompletedPanelMount' ||
    message._tag === 'CompletedTriggerFocus'
  )
    return { model }

  const result = Popup.update(model, message, {
    disabled: config.disabled ?? false,
    dismissible: config.dismissible ?? true,
    waitForExit: config.waitForExit === true || config.waitForExit === 'auto',
  })
  if (
    result.outMessage?._tag === 'Closed' &&
    result.outMessage.reason !== 'outside-press' &&
    result.outMessage.reason !== 'focus-out' &&
    config.restoreFocus !== false &&
    config.disabled !== true
  )
    return {
      ...result,
      commands: [FocusTrigger({ id: config.triggerId })],
    }
  return result
}

const exitVersionAttribute = 'data-popup-exit-version'

/** Observe a mounted surface's finite animations after its data-popup-exit-version changes. */
export const exitCompletions = (
  element: HTMLElement,
  additionalIds: readonly string[] = [],
): Stream.Stream<typeof Request.CompletedExit.Type> =>
  Stream.callback(queue =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const realm = element.ownerDocument.defaultView
        if (realm === null) return () => {}
        let frame = 0
        let current: AbortController | undefined
        const observeExit = () => {
          current?.abort()
          realm.cancelAnimationFrame(frame)
          const value = element.getAttribute(exitVersionAttribute)
          if (value === null) return
          const version = Number(value)
          if (!Number.isSafeInteger(version) || version < 1) return
          const pending = new AbortController()
          current = pending
          frame = realm.requestAnimationFrame(() => {
            const root = element.getRootNode()
            const lookupRoot =
              root instanceof realm.ShadowRoot ? root : element.ownerDocument
            const surfaces = new Set<Element>([element])
            for (const id of additionalIds) {
              const surface = lookupRoot.getElementById(id)
              if (surface?.isConnected) surfaces.add(surface)
            }
            const animations = new Set(
              Array.from(surfaces).flatMap(
                surface => surface.getAnimations?.() ?? [],
              ),
            )
            const finite = Array.from(animations).filter(
              animation =>
                animation.effect?.getComputedTiming().endTime !== Infinity &&
                animation.playbackRate !== 0 &&
                animation.playState !== 'paused',
            )
            void Promise.allSettled(
              finite.map(animation => animation.finished),
            ).then(() => {
              if (
                !pending.signal.aborted &&
                element.isConnected &&
                element.getAttribute(exitVersionAttribute) === value
              )
                Queue.offerUnsafe(queue, Request.CompletedExit({ version }))
            })
          })
        }
        const observer = new realm.MutationObserver(observeExit)
        observer.observe(element, { attributeFilter: [exitVersionAttribute] })
        observeExit()
        return () => {
          observer.disconnect()
          current?.abort()
          realm.cancelAnimationFrame(frame)
        }
      }),
      cleanup => Effect.sync(cleanup),
    ),
  )

// Foldkit installs a single mount action per element. Compose scoped
// actions here so they share the panel's lifetime and teardown.
const ObservePanel = Mount.defineStream('ObserveAnchoredPopup', {
  args: {
    triggerId: Schema.String,
    placement: Position.PlacementOptions,
    arrowId: Schema.String,
    focusAfterPosition: Schema.Boolean,
    focusSelector: Schema.optionalKey(Schema.String),
    autoExit: Schema.optionalKey(Schema.Boolean),
    exitSurfaceIds: Schema.optionalKey(Schema.Array(Schema.String)),
    topLayer: Schema.optionalKey(Schema.Boolean),
  },
  messages: [
    Lifecycle.CompletedPanelMount,
    Request.RequestedDismissal,
    Request.CompletedExit,
  ],
  execute: ({
    element,
    viewStateChanges,
    triggerId,
    placement,
    arrowId,
    focusAfterPosition,
    focusSelector,
    autoExit,
    exitSurfaceIds,
    topLayer,
  }) => {
    let shouldFocus = focusAfterPosition
    return viewStateChanges.pipe(
      Stream.switchMap(state => {
        const realm = element.ownerDocument.defaultView
        const root = element.getRootNode()
        if (
          state !== 'Live' ||
          realm === null ||
          !(element instanceof realm.HTMLElement)
        )
          return Stream.never

        const trigger =
          root instanceof realm.ShadowRoot
            ? root.getElementById(triggerId)
            : element.ownerDocument.getElementById(triggerId)
        if (trigger === null || trigger === element) return Stream.never

        return Stream.scoped(
          Stream.fromEffect(
            Effect.acquireRelease(
              Effect.sync(() => {
                let placed = false
                const releasePortal = topLayer
                  ? Portal.activate(element)
                  : undefined
                const stopPosition = Position.position(trigger, element, {
                  ...placement,
                  arrow: () =>
                    root instanceof realm.ShadowRoot
                      ? root.getElementById(arrowId)
                      : element.ownerDocument.getElementById(arrowId),
                  onPlaced: () => {
                    if (placed || !element.isConnected) return
                    placed = true
                    element.style.removeProperty('visibility')
                    if (!shouldFocus) return
                    shouldFocus = false
                    const target =
                      focusSelector === undefined
                        ? element
                        : element.querySelector(focusSelector)
                    const focusTarget =
                      target instanceof realm.HTMLElement ? target : element
                    focusTarget.focus({ preventScroll: true })
                  },
                })
                return () => {
                  try {
                    stopPosition()
                  } finally {
                    releasePortal?.()
                  }
                }
              }),
              cleanup =>
                Effect.sync(() => {
                  element.style.visibility = 'hidden'
                  cleanup()
                }),
            ).pipe(Effect.as(Lifecycle.CompletedPanelMount())),
          ).pipe(
            Stream.merge(
              autoExit
                ? exitCompletions(element, exitSurfaceIds)
                : Stream.empty,
            ),
            Stream.merge(
              Layer.mount({ insideIds: [triggerId] })
                .f(element, Mount.liveViewStateChanges)
                .pipe(
                  Stream.filterMap(message =>
                    message._tag === 'RequestedDismissal' &&
                    message.reason !== 'window-blur' &&
                    !element.hasAttribute('data-popup-exiting')
                      ? Result.succeed(
                          Request.RequestedDismissal({
                            reason: message.reason,
                          }),
                        )
                      : Result.fail(undefined),
                  ),
                ),
            ),
          ),
        )
      }),
    )
  },
})

/** Apply to a native button. */
export const triggerAttributes = <Msg>(
  model: Model,
  config: Config,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [
  h.Id(config.triggerId),
  h.Type('button'),
  h.Disabled(config.disabled ?? false),
  h.AriaExpanded(model.isOpen),
  ...(model.isOpen ? [h.AriaControls(config.panelId)] : []),
  ...(config.hasPopup ? [h.AriaHasPopup(config.hasPopup)] : []),
  h.OnClick(
    send(
      model.isOpen
        ? Request.RequestedClose({ reason: 'trigger-press' })
        : Request.RequestedOpen({ reason: 'trigger-press' }),
    ),
  ),
]

/** Render the panel while the model is mounted. Mount options are read
 * on insertion. The consumer supplies its role, accessible name and styling. */
export const panelAttributes = <Msg>(
  config: Config,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [
  h.Id(config.panelId),
  ...Popup.contentLabelAttributes(config, h),
  h.Tabindex(-1),
  h.Style({ visibility: 'hidden' }),
  ...(config.portal === 'top-layer' ? Portal.attributes(h) : []),
  ...(config.dismissOnFocusLeave
    ? [
        h.OnFocusLeave(
          send(Request.RequestedDismissal({ reason: 'focus-out' })),
        ),
      ]
    : []),
  h.OnMount(
    Mount.mapMessage(
      ObservePanel({
        triggerId: config.triggerId,
        arrowId: arrowId(config),
        placement: {
          ...config.placement,
          ...(config.arrowPadding === undefined
            ? {}
            : { arrowPadding: config.arrowPadding }),
        },
        focusAfterPosition: config.initialFocus !== undefined,
        ...(config.portal === 'top-layer' ? { topLayer: true } : {}),
        ...(config.waitForExit === 'auto' ? { autoExit: true } : {}),
        ...(config.waitForExit === 'auto' && config.exitSurfaceIds !== undefined
          ? { exitSurfaceIds: config.exitSurfaceIds }
          : {}),
        ...(typeof config.initialFocus === 'object'
          ? { focusSelector: config.initialFocus.selector }
          : {}),
      }),
      send,
    ),
  ),
]

/** Apply to a native close button inside the panel. */
export const closeAttributes = <Msg>(
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [
  h.Type('button'),
  h.OnClick(send(Request.RequestedClose({ reason: 'close-press' }))),
]

const arrowId = (config: Config) => config.panelId + '-arrow'

/** Wire the parts an anchored popup renders. The caller chooses the markup,
 * role, styling, and which optional parts to render. */
export const parts = <Msg>(
  model: Model,
  config: Config,
  send: (message: Message) => Msg,
  h: HtmlBuilder<Msg>,
) => ({
  isOpen: model.isOpen,
  isMounted: Popup.isMounted(model),
  trigger: triggerAttributes(model, config, send, h),
  panel: [
    ...panelAttributes(config, send, h),
    ...(model.isExiting
      ? [
          h.Inert(true),
          h.AriaHidden(true),
          h.DataAttribute('popup-exiting', ''),
          ...(config.waitForExit === 'auto'
            ? [h.DataAttribute('popup-exit-version', String(model.exitVersion))]
            : []),
        ]
      : []),
  ],
  title:
    config.titleId === undefined
      ? []
      : Popup.labelPartAttributes(config.titleId, h),
  description:
    config.descriptionId === undefined
      ? []
      : Popup.labelPartAttributes(config.descriptionId, h),
  close: closeAttributes(send, h),
  arrow: Popup.arrowAttributes(arrowId(config), h),
  backdrop: Popup.backdropAttributes(config.panelId + '-backdrop', h),
  viewport: Popup.viewportAttributes(config.panelId + '-viewport', h),
})

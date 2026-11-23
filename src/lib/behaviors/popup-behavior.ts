import type { Update } from 'foldkit'
import { Effect, Result, Schema, Stream } from 'effect'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import type { Attribute, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

import * as Layer from './layer'
import * as Popup from './popup'
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
    arrowPadding?: number
    waitForExit?: boolean
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
    waitForExit: config.waitForExit ?? false,
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

// Foldkit installs a single mount action per element. Compose both scoped
// actions here so they share the panel's lifetime and teardown.
const ObservePanel = Mount.defineStream('ObserveAnchoredPopup', {
  args: {
    triggerId: Schema.String,
    placement: Position.PlacementOptions,
    arrowId: Schema.String,
    focusAfterPosition: Schema.Boolean,
    focusSelector: Schema.optionalKey(Schema.String),
  },
  messages: [Lifecycle.CompletedPanelMount, Request.RequestedDismissal],
  execute: ({
    element,
    viewStateChanges,
    triggerId,
    placement,
    arrowId,
    focusAfterPosition,
    focusSelector,
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
                return Position.position(trigger, element, {
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
              }),
              cleanup =>
                Effect.sync(() => {
                  element.style.visibility = 'hidden'
                  cleanup()
                }),
            ).pipe(Effect.as(Lifecycle.CompletedPanelMount())),
          ).pipe(
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

/** Render the inline panel only while the model is open. Mount options are read
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

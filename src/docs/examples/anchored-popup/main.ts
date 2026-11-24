import { Effect, Schema } from 'effect'
import { Command, Port, Runtime, Subscription } from 'foldkit'
import type { Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Popup from '../../../lib/behaviors/popup-behavior'
import * as Controller from '../../../lib/behaviors/popup-controller'

const config = {
  triggerId: 'details-trigger',
  panelId: 'details-panel',
  titleId: 'details-title',
  descriptionId: 'details-description',
  placement: { side: 'bottom', align: 'start', sideOffset: 8 },
  arrowPadding: 8,
  hasPopup: 'dialog',
  initialFocus: { selector: '#done' },
  waitForExit: 'auto',
  exitSurfaceIds: ['details-panel-backdrop'],
  portal: 'top-layer',
} satisfies Popup.Config

const OpenInput = Schema.Struct({
  correlationId: Schema.String,
  order: Schema.String,
})
const CloseReason = Schema.Union([Popup.OutMessage.Closed.fields.reason])
const ports = { inbound: { open: Port.inbound(OpenInput) } }
const Model = Schema.Struct({
  details: Popup.Model,
  request: Schema.optionalKey(OpenInput),
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotPopup: { message: Popup.Message },
  RequestedOpen: OpenInput.fields,
  IgnoredOpen: {},
  CompletedReply: {},
})
type Message = typeof Message.Type

const wrap = (message: Popup.Message) => Message.GotPopup({ message })
const subscriptions = Subscription.make<Model, Message>()(() => ({
  open: Port.subscription(ports.inbound.open, request =>
    controller.isPending(request.correlationId)
      ? Message.RequestedOpen(request)
      : Message.IgnoredOpen(),
  ),
}))
const controller = Controller.make<
  string,
  'confirmed',
  typeof CloseReason.Type,
  'user' | 'programmatic'
>(request =>
  runtime.ports.open.send({
    correlationId: request.correlationId,
    order: request.input,
  }),
)

const Reply = Command.define('ReplyToDeliveryPopup', {
  args: {
    correlationId: Schema.String,
    outcome: Schema.Union([
      Schema.Struct({ status: Schema.Literal('closed'), reason: CloseReason }),
      Schema.Struct({
        status: Schema.Literal('rejected'),
        reason: Schema.Literals(['already-open', 'rejected']),
      }),
    ]),
  },
  messages: [Message.CompletedReply],
  execute: ({ correlationId, outcome }) =>
    Effect.sync(() => {
      if (outcome.status === 'rejected') {
        controller.rejectOpen(correlationId, outcome.reason)
      } else {
        controller.settleClose(correlationId, {
          reason: outcome.reason,
          source: outcome.reason === 'programmatic' ? 'programmatic' : 'user',
          ...(outcome.reason === 'close-press'
            ? { returnValue: 'confirmed' }
            : {}),
        })
      }
      return Message.CompletedReply()
    }),
})

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  if (message._tag === 'CompletedReply' || message._tag === 'IgnoredOpen')
    return { model }
  if (message._tag === 'RequestedOpen') {
    const { correlationId, order } = message
    const next = Popup.update(
      model.details,
      Popup.Request.RequestedOpen({ reason: 'programmatic' }),
      config,
    )
    return next.outMessage?._tag === 'Opened'
      ? { model: { details: next.model, request: { correlationId, order } } }
      : {
          model,
          commands: [
            Reply({
              correlationId,
              outcome: {
                status: 'rejected',
                reason: model.details.isOpen ? 'already-open' : 'rejected',
              },
            }),
          ],
        }
  }
  const next = Popup.update(model.details, message.message, config)
  const commands = Command.mapMessages(next.commands ?? [], wrap)
  if (next.outMessage?._tag === 'Closed' && model.request !== undefined) {
    return {
      model: { details: next.model },
      commands: [
        ...commands,
        Reply({
          correlationId: model.request.correlationId,
          outcome: { status: 'closed', reason: next.outMessage.reason },
        }),
      ],
    }
  }
  return {
    model: { ...model, details: next.model },
    commands,
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) => {
  const parts = Popup.parts(model.details, config, wrap, h)
  return h.main(
    [],
    [
      h.h1([], ['Anchored popup behavior']),
      h.button(parts.trigger, ['Show details']),
      ...(parts.isMounted
        ? [
            h.div(
              [...parts.viewport, h.Class('viewport')],
              [
                h.div(
                  [
                    ...parts.backdrop,
                    h.Class('backdrop'),
                    ...(parts.isOpen
                      ? []
                      : [h.DataAttribute('popup-exiting', '')]),
                  ],
                  [],
                ),
                h.section(
                  [...parts.panel, h.Role('dialog'), h.Class('panel')],
                  [
                    h.span([...parts.arrow, h.Class('arrow')], []),
                    h.h2(parts.title, ['Delivery details']),
                    h.p(parts.description, [
                      model.request === undefined
                        ? 'Orders are dispatched on weekdays.'
                        : `Order ${model.request.order} is dispatched on a weekday.`,
                    ]),
                    h.button([...parts.close, h.Id('done')], ['Done']),
                  ],
                ),
              ],
            ),
          ]
        : []),
    ],
  )
}

const runtime = Runtime.embed(
  Runtime.makeElement({
    Model,
    init: () => ({ model: { details: Popup.init() } }),
    update,
    view,
    ports,
    subscriptions,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

const opener = document.querySelector<HTMLButtonElement>('#open-from-code')
const outcome = document.querySelector<HTMLOutputElement>('#controller-result')
opener?.addEventListener('click', () => {
  if (outcome === null) return
  outcome.value = 'Waiting for the popup to close…'
  if (opener !== null) opener.disabled = true
  void Effect.runPromise(controller.openUntilClose('A-104')).then(result => {
    if (opener !== null) opener.disabled = false
    outcome.value =
      result.status === 'closed'
        ? `Closed by ${result.reason} (${result.source})${result.returnValue === undefined ? '' : `: ${result.returnValue}`}`
        : result.status
  })
})

import { Schema } from 'effect'
import { Command, Runtime } from 'foldkit'
import type { Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Popup from '../../../lib/behaviors/popup-behavior'

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
  portal: 'top-layer',
} satisfies Popup.Config

const Model = Schema.Struct({ details: Popup.Model })
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotPopup: { message: Popup.Message },
})
type Message = typeof Message.Type

const wrap = (message: Popup.Message) => Message.GotPopup({ message })

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  const next = Popup.update(model.details, message.message, config)
  return {
    model: { details: next.model },
    commands: Command.mapMessages(next.commands ?? [], wrap),
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
                h.div([...parts.backdrop, h.Class('backdrop')], []),
                h.section(
                  [...parts.panel, h.Role('dialog'), h.Class('panel')],
                  [
                    h.span([...parts.arrow, h.Class('arrow')], []),
                    h.h2(parts.title, ['Delivery details']),
                    h.p(parts.description, [
                      'Orders are dispatched on weekdays.',
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

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({ model: { details: Popup.init() } }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

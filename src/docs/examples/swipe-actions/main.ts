import { Schema } from 'effect'
import { Runtime, type Update } from 'foldkit'
import * as Command from 'foldkit/command'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Swipe from '../../../lib/behaviors/swipe-actions'

const Inbox = Swipe.create()
const Mail = Schema.Struct({
  key: Schema.String,
  sender: Schema.String,
  subject: Schema.String,
})
const Model = Schema.Struct({
  swipe: Swipe.Model,
  mail: Schema.Array(Mail),
  status: Schema.String,
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotSwipe: { message: Swipe.Message },
  Acted: { key: Schema.String, side: Swipe.Side },
})
type Message = typeof Message.Type
const options: Swipe.Options = { fullSwipeEnabled: () => true }
const act = (model: Model, key: string, side: Swipe.Side): Model => ({
  ...model,
  mail: model.mail.filter(mail => mail.key !== key),
  status: side === 'end' ? 'Message deleted.' : 'Message archived.',
})
const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  if (message._tag === 'Acted')
    return {
      model: {
        ...act(model, message.key, message.side),
        swipe: Swipe.close(model.swipe).model,
      },
    }
  const result = Inbox.update(model.swipe, message.message, options)
  let next = { ...model, swipe: result.model }
  if (result.outMessage) {
    const { key, side, version } = result.outMessage
    next = act(next, key, side)
    next = {
      ...next,
      swipe: Swipe.update(
        next.swipe,
        Swipe.Message.ResolvedFullSwipe({ version, accepted: true }),
        options,
      ).model,
    }
  }
  return {
    model: next,
    commands: Command.mapMessages(result.commands ?? [], message =>
      Message.GotSwipe({ message }),
    ),
  }
}
const view = (model: Model, h: HtmlBuilder<Message>) =>
  h.main(
    [],
    [
      h.h1([], ['Your inbox']),
      h.p(
        [h.Class('intro')],
        [
          'Swipe to reveal Archive or Delete. Swipe farther to act. Arrow keys reveal actions; Escape returns to the message.',
        ],
      ),
      h.submodel({
        slotId: 'inbox-swipe',
        view: Inbox.view,
        model: model.swipe,
        toParentMessage: message => Message.GotSwipe({ message }),
        viewInputs: {
          keys: model.mail.map(mail => mail.key),
          toView: (surface, rows) =>
            h.div(
              [...surface, h.Class('inbox')],
              rows.map(row => {
                const mail = model.mail.find(mail => mail.key === row.key)
                return h.div(
                  [
                    ...row.row,
                    h.Class('row'),
                    h.Tabindex(0),
                    h.AriaLabel(mail?.sender ?? ''),
                  ],
                  [
                    ...(['start', 'end'] as const).map(side =>
                      h.div(
                        [...row.actions(side), h.Class('actions')],
                        [
                          h.button(
                            [
                              h.Type('button'),
                              h.OnClick(Message.Acted({ key: row.key, side })),
                            ],
                            [side === 'start' ? 'Archive' : 'Delete'],
                          ),
                        ],
                      ),
                    ),
                    h.div(
                      [...row.content, h.Class('content')],
                      [
                        h.strong([], [mail?.sender ?? '']),
                        h.span([], [mail?.subject ?? '']),
                      ],
                    ),
                  ],
                )
              }),
            ),
        },
      }),
      h.p([h.Class('status'), h.AriaLive('polite')], [model.status]),
    ],
  )
Runtime.run(
  Runtime.makeElement({
    Model,
    init: (): { model: Model } => ({
      model: {
        swipe: Swipe.init('inbox'),
        mail: [
          {
            key: 'design',
            sender: 'Maya Chen',
            subject: 'A fresh look at the dashboard',
          },
          {
            key: 'weekend',
            sender: 'Alex Rivera',
            subject: 'A little inspiration for your weekend',
          },
          {
            key: 'release',
            sender: 'CreaseUI team',
            subject: 'Your next release starts here',
          },
        ],
        status: '',
      },
    }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

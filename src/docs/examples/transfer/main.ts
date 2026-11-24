import { Option, Schema } from 'effect'
import { Command, Runtime, type Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Transfer from '../../../lib/behaviors/transfer'

const initialLists = {
  incoming: ['Air quality', 'River level', 'Wind speed'],
  scheduled: ['Rainfall'],
}
const order = ['incoming', 'scheduled']
const label = (list: string) => (list === 'incoming' ? 'Incoming' : 'Scheduled')
const init = () => ({
  transfer: Transfer.init({ id: 'field-checks', lists: initialLists }),
  status: '',
  previous: Option.none<Transfer.Lists>(),
})

const Model = Schema.Struct({
  transfer: Transfer.Model,
  status: Schema.String,
  previous: Schema.Option(Transfer.Lists),
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotTransfer: { message: Transfer.Message },
  UndidTransfer: {},
})
type Message = typeof Message.Type
const gotTransfer = (message: Transfer.Message) =>
  Message.GotTransfer({ message })

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  if (message._tag === 'UndidTransfer') {
    if (Option.isNone(model.previous)) return { model }
    return {
      model: {
        ...init(),
        transfer: Transfer.init({
          id: model.transfer.id,
          lists: model.previous.value,
        }),
        status: 'Previous order restored.',
      },
    }
  }
  const next = Transfer.update(model.transfer, message.message, {
    order,
    listLabel: label,
    accepts: (_item, list) =>
      list !== 'scheduled' ||
      (Transfer.lists(model.transfer).scheduled?.length ?? 0) < 2,
  })
  const fact = next.outMessage
  return {
    model: {
      transfer: next.model,
      status: fact?.announcement ?? model.status,
      previous:
        fact?._tag === 'Transferred'
          ? Option.some(model.transfer.lists)
          : model.previous,
    },
    commands: Command.mapMessages(next.commands ?? [], gotTransfer),
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) =>
  h.main(
    [],
    [
      h.p(
        [],
        [
          'Drag a field check to a list. Or focus it, press Space, use the arrow keys, and press Space to drop. Escape cancels. Scheduled has two slots.',
        ],
      ),
      h.submodel({
        slotId: 'transfer',
        model: model.transfer,
        view: Transfer.view,
        toParentMessage: gotTransfer,
        viewInputs: {
          lists: order,
          toView: (surface, lists, preview) =>
            h.div(
              [...surface, h.Class('board')],
              [
                ...lists.map(list =>
                  h.section(
                    [
                      ...list.attributes,
                      h.Class('lane'),
                      h.AriaLabel(label(list.list)),
                    ],
                    [
                      h.h2([], [label(list.list)]),
                      ...list.items.map(item =>
                        h.button(
                          [
                            ...item.attributes,
                            h.Type('button'),
                            h.Class('check'),
                            h.AriaPressed(String(item.isMoving)),
                          ],
                          [item.key],
                        ),
                      ),
                    ],
                  ),
                ),
                ...Option.match(preview, {
                  onNone: () => [],
                  onSome: ghost => [
                    h.div(
                      [
                        ...Transfer.previewAttributes(ghost, h),
                        h.Class('check'),
                      ],
                      [ghost.key],
                    ),
                  ],
                }),
              ],
            ),
        },
      }),
      h.button(
        [
          h.Type('button'),
          h.Disabled(Option.isNone(model.previous)),
          h.OnClick(Message.UndidTransfer()),
        ],
        ['Undo last move'],
      ),
      h.p([h.Role('status')], [model.status]),
    ],
  )

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({ model: init() }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

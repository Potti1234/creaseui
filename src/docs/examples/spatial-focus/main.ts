import { Effect, Schema } from 'effect'
import { Runtime, type Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as SpatialFocus from '../../../lib/behaviors/spatial-focus'

const Card = Schema.Literals(['A', 'B', 'D', 'C', 'E'])
const BoardFocus = SpatialFocus.create<typeof Card.Type>()
const Model = Schema.Struct({ spatialFocus: SpatialFocus.Model })
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotSpatialFocus: { message: SpatialFocus.Message },
})
type Message = typeof Message.Type

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  const result = BoardFocus.update(model.spatialFocus, message.message)
  return {
    model: { ...model, spatialFocus: result.model },
    commands: (result.commands ?? []).map(command => ({
      ...command,
      effect: command.effect.pipe(
        Effect.map(message => Message.GotSpatialFocus({ message })),
      ),
    })),
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) =>
  h.main(
    [],
    [
      h.p([h.Class('eyebrow')], ['HEADLESS BEHAVIORS / FOLDKIT']),
      h.h1([], ['Follow the layout.']),
      h.p(
        [h.Id('instructions')],
        [
          'Tab into the board, then use the arrow keys. Home and End follow document order; Ctrl + arrows are left alone.',
        ],
      ),
      h.submodel({
        slotId: 'spatial-board',
        model: model.spatialFocus,
        view: BoardFocus.view,
        toParentMessage: message => Message.GotSpatialFocus({ message }),
        viewInputs: {
          keys: Card.literals,
          isDisabled: key => key === 'D',
          toView: items =>
            h.div(
              [h.Class('board'), h.AriaLabel('Spatial focus board')],
              items.map(item =>
                h.button(
                  [
                    h.Type('button'),
                    h.Class(`card card-${item.key}`),
                    h.Disabled(item.isDisabled),
                    h.AriaDescribedBy('instructions'),
                    ...item.attributes,
                  ],
                  [
                    h.span([h.Class('card-label')], [`Card ${item.key}`]),
                    h.span(
                      [h.Class('card-detail')],
                      [
                        item.isDisabled
                          ? 'Unavailable · skipped'
                          : `Document position ${item.index + 1}`,
                      ],
                    ),
                  ],
                ),
              ),
            ),
        },
      }),
      h.p(
        [h.Class('caption')],
        [
          'Document order: A → B → D → C → E. Try Right from A: focus jumps to C, not B.',
        ],
      ),
    ],
  )

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({
      model: { spatialFocus: SpatialFocus.init({ id: 'spatial-demo' }) },
    }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

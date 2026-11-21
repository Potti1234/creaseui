import { Schema } from 'effect'
import { Runtime } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Move from '../../../lib/behaviors/move'

const Tile = Schema.Literals(['A', 'B'])
const tiles = Tile.literals
const BoardMove = Move.create<typeof Tile.Type>()
const start = { A: { x: 20, y: 20 }, B: { x: 120, y: 90 } }
const Model = Schema.Struct({
  move: Move.Model,
  selected: Schema.Array(Tile),
  announcement: Schema.String,
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotMove: { message: Move.Message },
  ToggledTile: { key: Tile },
  ReturnedTileA: {},
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) => {
  const options: Move.Options = {
    step: 10,
    largeStep: 30,
    group: key =>
      model.selected.some(selected => selected === key)
        ? [key, ...model.selected.filter(selected => selected !== key)]
        : [key],
    bounds: () => ({ minX: 0, minY: 0, maxX: 200, maxY: 150 }),
    label: key => `Tile ${key}`,
  }
  if (message._tag === 'ToggledTile') {
    const { key } = message
    const selected = model.selected.includes(key)
      ? model.selected.filter(tile => tile !== key)
      : [...model.selected, key]
    return { model: { ...model, selected } }
  }
  const moved =
    message._tag === 'GotMove'
      ? BoardMove.update(model.move, message.message, options)
      : Move.moveTo(model.move, 'A', start.A, options)
  return {
    model: {
      ...model,
      move: moved.model,
      announcement: moved.outMessage?.announcement ?? model.announcement,
    },
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) =>
  h.main(
    [],
    [
      h.h1([], ['Move behavior']),
      h.p(
        [h.Id('move-instructions')],
        [
          'Drag a tile, or focus it and press Alt + an arrow key. Add Shift for larger steps. Press Escape to cancel a drag. Click tiles to select which ones move together.',
        ],
      ),
      h.submodel({
        slotId: 'board-move',
        model: model.move,
        view: BoardMove.view,
        toParentMessage: message => Message.GotMove({ message }),
        viewInputs: {
          keys: tiles,
          toView: (surface, items) =>
            h.div(
              [h.Class('board'), ...surface],
              [
                ...items.map(item =>
                  h.button(
                    [
                      h.Type('button'),
                      h.Class('tile'),
                      h.AriaPressed(String(model.selected.includes(item.key))),
                      h.AriaDescribedBy('move-instructions'),
                      h.OnClick(Message.ToggledTile({ key: item.key })),
                      h.Style({
                        left: `${item.position.x}px`,
                        top: `${item.position.y}px`,
                        ...item.style,
                      }),
                      ...(item.isDragging
                        ? [h.DataAttribute('dragging', '')]
                        : []),
                      ...item.attributes,
                    ],
                    [`Tile ${item.key}`],
                  ),
                ),
              ],
            ),
        },
      }),
      h.button(
        [h.Type('button'), h.OnClick(Message.ReturnedTileA())],
        ['Return tile A to start'],
      ),
      h.p(
        [h.Class('announcement'), h.AriaLive('assertive'), h.AriaAtomic(true)],
        [model.announcement],
      ),
    ],
  )

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({
      model: { move: Move.init(start), selected: tiles, announcement: '' },
    }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

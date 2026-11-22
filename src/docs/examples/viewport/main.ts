import { Option, Schema } from 'effect'
import { Runtime } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Viewport from '../../../lib/behaviors/viewport'

const nodes = [
  { label: 'Ingest', x: 40, y: 40 },
  { label: 'Transform', x: 260, y: 160 },
  { label: 'Publish', x: 460, y: 320 },
] as const
const world = { left: 0, top: 0, right: 600, bottom: 400 }
const Model = Schema.Struct({
  viewport: Viewport.Model,
  announcement: Schema.String,
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotViewport: { message: Viewport.Message },
  ClickedZoomIn: {},
  ClickedFit: {},
  ClickedReset: {},
})
type Message = typeof Message.Type

const options: Viewport.Options = { minZoom: 0.25, maxZoom: 4 }

const update = (model: Model, message: Message) => {
  const next = (() => {
    switch (message._tag) {
      case 'GotViewport':
        return Viewport.update(model.viewport, message.message, options)
      case 'ClickedZoomIn':
        return Viewport.zoomBy(model.viewport, 1.25, Option.none(), options)
      case 'ClickedFit':
        return Viewport.fit(model.viewport, world, { padding: 16 }, options)
      case 'ClickedReset':
        return Viewport.setViewport(model.viewport, Viewport.identity, options)
    }
  })()
  const { outMessage } = next
  const zoom = Math.round(next.model.viewport.zoom * 100)
  return {
    model: {
      viewport: next.model,
      announcement:
        outMessage === undefined
          ? model.announcement
          : Option.getOrElse(
              outMessage.announcement,
              () => `${outMessage.reason}: zoom ${String(zoom)}%`,
            ),
    },
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) =>
  h.main(
    [],
    [
      h.h1([], ['Viewport behavior']),
      h.p(
        [h.Id('viewport-instructions')],
        [
          'Drag empty space or scroll to pan. Ctrl or ⌘ + scroll, or pinch, zooms at the pointer. Focus the board and press + or − to zoom, 0 for 100%.',
        ],
      ),
      h.submodel({
        slotId: 'board-viewport',
        model: model.viewport,
        view: Viewport.view,
        toParentMessage: message => Message.GotViewport({ message }),
        viewInputs: {
          toView: ({ surface, world: worldAttributes, isGesturing }) =>
            h.div(
              [
                h.Class('board'),
                h.Role('group'),
                h.AriaLabel('Pipeline canvas'),
                h.AriaDescribedBy('viewport-instructions'),
                h.Attribute('tabindex', '0'),
                ...(isGesturing ? [h.DataAttribute('gesturing', '')] : []),
                ...surface,
              ],
              [
                h.div(
                  [h.Class('world'), ...worldAttributes],
                  nodes.map(node =>
                    h.div(
                      [
                        h.Class('node'),
                        h.DataAttribute('viewport-item', ''),
                        h.Style({
                          left: `${String(node.x)}px`,
                          top: `${String(node.y)}px`,
                        }),
                      ],
                      [node.label],
                    ),
                  ),
                ),
              ],
            ),
        },
      }),
      h.div(
        [h.Class('controls')],
        [
          h.button(
            [h.Type('button'), h.OnClick(Message.ClickedZoomIn())],
            ['Zoom in'],
          ),
          h.button(
            [h.Type('button'), h.OnClick(Message.ClickedFit())],
            ['Fit all'],
          ),
          h.button(
            [h.Type('button'), h.OnClick(Message.ClickedReset())],
            ['Reset view'],
          ),
        ],
      ),
      h.p(
        [h.Class('announcement'), h.AriaLive('polite'), h.AriaAtomic(true)],
        [model.announcement],
      ),
    ],
  )

Runtime.run(
  Runtime.makeElement({
    Model,
    init: (): { model: Model } => ({
      model: { viewport: Viewport.init(), announcement: '' },
    }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

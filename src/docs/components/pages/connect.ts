import { Option, Schema } from 'effect'
import { Command } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import * as Connect from '@/lib/behaviors/connect'
import {
  authoredPage,
  definePreviewProgram,
} from '@/docs/components/pages/authored-page'

const points: Readonly<Record<string, Readonly<{ x: number; y: number }>>> = {
  'prompt:out': { x: 80, y: 60 },
  'context:out': { x: 80, y: 160 },
  'answer:in': { x: 320, y: 60 },
  'summary:in': { x: 320, y: 160 },
}
const keys = Object.keys(points)
const options: Connect.Options = {
  keys,
  canConnect: (from, to) => from.endsWith(':out') && to.endsWith(':in'),
  label: key => key.replace(':', ' '),
  announcementId: 'docs-connect-live',
}
const Edge = Schema.Struct({ from: Schema.String, to: Schema.String })
const Model = Schema.Struct({
  connect: Connect.Model,
  edges: Schema.Array(Edge),
  originX: Schema.Number,
  originY: Schema.Number,
})
const Message = defineMessageUnion({ GotConnect: { message: Connect.Message } })
const connect = Connect.create()

export const connectPreviewProgram = definePreviewProgram({
  Model,
  Message,
  init: () => ({ connect: Connect.init(), edges: [], originX: 0, originY: 0 }),
  update: (model, { message }) => {
    let fact = message
    let originX = model.originX
    let originY = model.originY
    if (message._tag === 'Started') {
      const point = points[message.from]
      if (point) {
        originX = message.x - point.x
        originY = message.y - point.y
        fact = Connect.Message.Started({ ...message, ...point })
      }
    } else if (message._tag === 'MeasuredKey') {
      const port = message.ports[0]
      const point = port && points[port.key]
      if (port && point) {
        originX = (port.rect.left + port.rect.right) / 2 - point.x
        originY = (port.rect.top + port.rect.bottom) / 2 - point.y
      }
      fact = Connect.Message.MeasuredKey({
        ...message,
        ports: message.ports.map(port => ({
          key: port.key,
          rect: {
            left: port.rect.left - originX,
            right: port.rect.right - originX,
            top: port.rect.top - originY,
            bottom: port.rect.bottom - originY,
          },
        })),
      })
    } else if (message._tag === 'Targeted' || message._tag === 'MovedPointer') {
      fact = { ...message, x: message.x - originX, y: message.y - originY }
    }
    const next = Connect.update(model.connect, fact, options)
    const edge =
      next.outMessage?._tag === 'RequestedConnection'
        ? next.outMessage
        : undefined
    const accepted =
      edge &&
      !model.edges.some(
        saved => saved.from === edge.from && saved.to === edge.to,
      )
    const commands = [
      ...(next.commands ?? []),
      ...(accepted
        ? (Connect.update(
            next.model,
            Connect.Message.Connected({ from: edge.from, to: edge.to }),
            options,
          ).commands ?? [])
        : []),
    ]
    return {
      model: {
        ...model,
        connect: next.model,
        originX,
        originY,
        edges: accepted
          ? [...model.edges, { from: edge.from, to: edge.to }]
          : model.edges,
      },
      commands: Command.mapMessages(commands, message =>
        Message.GotConnect({ message }),
      ),
    }
  },
  view: (_index, model, h) =>
    h.div(
      [],
      [
        h.p(
          [],
          [
            'Drag an output to an input. Or Tab to an output, press Enter, use arrows, then Enter. Escape or Tab cancels.',
          ],
        ),
        h.submodel({
          slotId: 'connect-demo',
          model: model.connect,
          view: connect.view,
          toParentMessage: message => Message.GotConnect({ message }),
          viewInputs: {
            ...options,
            id: 'docs-connect-ports',
            toView: (ports, attributes) =>
              h.svg(
                [
                  ...attributes,
                  h.Width('400'),
                  h.Height('220'),
                  h.ViewBox('0 0 400 220'),
                  h.AriaLabel(
                    'Connect outputs on the left to inputs on the right',
                  ),
                ],
                [
                  ...model.edges.flatMap(edge => {
                    const from = points[edge.from]
                    const to = points[edge.to]
                    return from && to
                      ? [
                          h.line(
                            [
                              h.Key(`${edge.from}-${edge.to}`),
                              h.X1(String(from.x)),
                              h.Y1(String(from.y)),
                              h.X2(String(to.x)),
                              h.Y2(String(to.y)),
                              h.Stroke('currentColor'),
                              h.StrokeWidth('2'),
                            ],
                            [],
                          ),
                        ]
                      : []
                  }),
                  ...Option.match(model.connect.draft, {
                    onNone: () => [],
                    onSome: draft => {
                      const from = points[draft.from]
                      return from
                        ? [
                            h.line(
                              [
                                h.Key('draft'),
                                h.X1(String(from.x)),
                                h.Y1(String(from.y)),
                                h.X2(String(draft.x)),
                                h.Y2(String(draft.y)),
                                h.Stroke('currentColor'),
                                h.StrokeWidth('2'),
                                h.StrokeDasharray('5 5'),
                              ],
                              [],
                            ),
                          ]
                        : []
                    },
                  }),
                  ...ports.flatMap(port => {
                    const point = points[port.key] ?? { x: 0, y: 0 }
                    return [
                      h.circle(
                        [
                          h.Key(port.key),
                          ...port.attributes,
                          h.Tabindex(0),
                          h.Role('button'),
                          h.AriaLabel(port.key.replace(':', ' ')),
                          h.Cx(String(point.x)),
                          h.Cy(String(point.y)),
                          h.R('12'),
                          h.Fill('currentColor'),
                        ],
                        [],
                      ),
                      h.text(
                        [
                          h.Key(`${port.key}-label`),
                          h.X(String(point.x)),
                          h.Y(String(point.y + 30)),
                          h.TextAnchor('middle'),
                          h.Fill('currentColor'),
                          h.FontSize('12'),
                        ],
                        [port.key.replace(':', ' ')],
                      ),
                    ]
                  }),
                ],
              ),
          },
        }),
        h.p(
          [
            h.Id('docs-connect-live'),
            h.AriaLive('assertive'),
            h.AriaAtomic(true),
          ],
          [],
        ),
        h.p([], [`Saved connections: ${model.edges.length}`]),
      ],
    ),
})

const examples = [
  {
    title: 'Connect ports',
    description:
      'A renderer-neutral SVG canvas with component-owned saved edges. Duplicate requests are refused without announcing success.',
    heroOnly: true,
    keepIdsCanonical: true,
    code: `import * as Connect from '@/lib/behaviors/connect'

const portKeys = ['prompt:out', 'answer:in'] as const
type PortKey = typeof portKeys[number]
export const connect = Connect.create<PortKey>()
export const model = Connect.init()
const options: Connect.Options = {
  keys: portKeys,
  canConnect: (from, to) => from.endsWith(':out') && to.endsWith(':in'),
  announcementId: 'connections-live',
}
export const update = (model: Connect.Model, message: Connect.Message) =>
  Connect.update(model, message, options)
// Route Connect.update(model, message, options).
// On RequestedConnection, save the edge if accepted, then route Connected.
// Render connect.view with id, options and toView(ports, rootAttributes).
// Apply rootAttributes to the canvas and each port's attributes to its element.
// DOM adapter facts use client pixels; convert them at the component boundary.
// Render a live region with id="connections-live" and aria-live="assertive".`,
  },
]

export const connectPage = authoredPage({
  slug: 'connect',
  title: 'Connect',
  kind: 'submodel',
  previewProgram: connectPreviewProgram,
  definition: {
    description:
      'A headless connection draft for pointer and keyboard port connections.',
    architecture:
      'Connect is a pure behavior Model. The component owns ports, coordinates, saved edges and acceptance policy.',
    accessibility:
      'Components supply port semantics and a live region. Enter or Space starts and commits; arrows choose a candidate; Escape and Tab cancel without trapping Tab.',
    examples,
    stylexExamples: examples,
    pleatExamples: examples,
  },
})

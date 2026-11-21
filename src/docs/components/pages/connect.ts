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
                          h.Style({ touchAction: 'none' }),
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

const usage = `import { Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Connect from '@/lib/behaviors/connect'

const portKeys = ['prompt:out', 'answer:in'] as const
type PortKey = typeof portKeys[number]
const connect = Connect.create<PortKey>()
const options: Connect.Options = {
  keys: portKeys,
  canConnect: (from, to) => from.endsWith(':out') && to.endsWith(':in'),
  announcementId: 'connections-live',
}

export const Model = Schema.Struct({
  connect: Connect.Model,
  edges: Schema.Array(Schema.Struct({ from: Schema.String, to: Schema.String })),
})
type Model = typeof Model.Type
export const Message = defineMessageUnion({ GotConnect: { message: Connect.Message } })
type Message = typeof Message.Type
export const init = (): Model => ({ connect: Connect.init(), edges: [] })

export const update = (model: Model, { message }: Message): Update.Return<Model, Message> => {
  const next = Connect.update(model.connect, message, options)
  const request = next.outMessage
  if (request?._tag === 'RequestedConnection' &&
      !model.edges.some(edge => edge.from === request.from && edge.to === request.to)) {
    const edge = { from: request.from, to: request.to }
    const accepted = Connect.update(next.model, Connect.Message.Connected(edge), options)
    return {
      model: { connect: next.model, edges: [...model.edges, edge] },
      commands: Command.mapMessages([
        ...(next.commands ?? []), ...(accepted.commands ?? []),
      ], message => Message.GotConnect({ message })),
    }
  }
  return {
    model: { ...model, connect: next.model },
    commands: Command.mapMessages(next.commands ?? [], message => Message.GotConnect({ message })),
  }
}

export const view = (model: Model, h: HtmlBuilder<Message>) => h.div([], [
  h.submodel({
    slotId: 'connections',
    model: model.connect,
    view: connect.view,
    toParentMessage: message => Message.GotConnect({ message }),
    viewInputs: {
      ...options, keys: portKeys, id: 'connection-ports',
      toView: (ports, attributes) => h.div([...attributes], ports.map(port =>
        h.button([h.Key(port.key), h.Type('button'), ...port.attributes, h.Style({ touchAction: 'none' })], [port.key]),
      )),
    },
  }),
  h.p([h.Id('connections-live'), h.AriaLive('assertive'), h.AriaAtomic(true)], []),
])`

const examples = [
  {
    title: 'Connect ports',
    description:
      'A renderer-neutral SVG canvas with component-owned saved edges. Duplicate requests are refused without announcing success.',
    heroOnly: true,
    keepIdsCanonical: true,
    code: usage,
  },
]

export const connectPage = authoredPage({
  slug: 'connect',
  title: 'Connect',
  kind: 'submodel',
  previewProgram: connectPreviewProgram,
  definition: {
    kind: 'submodel',
    sourcePath: 'src/lib/behaviors/connect.ts',
    description:
      'A headless connection draft for pointer and keyboard port connections.',
    architecture:
      'Connect is a pure behavior Model. The component owns ports, coordinates, saved edges and acceptance policy.',
    usage,
    composition: `Connect (src/lib/behaviors/connect.ts)
├── ConnectDraft / Model — Option draft in the parent Model
├── init — initial Model with no draft
├── Message / update — facts in, Model + Commands + optional OutMessage out
├── OutMessage.RequestedConnection — parent accepts and saves the edge
│   └── Message.Connected — acknowledge acceptance before announcing success
├── OutMessage.Canceled — emitted only when a draft existed
├── create<Key>() / view — scoped port and root attribute bundles
├── role / keyboardTarget / nearestInDirection / connectMessage — pure helpers
└── ObservePorts / MeasurePorts / Announce — Mount and DOM Commands`,
    apiHref:
      'https://github.com/Potti1234/creaseui/blob/main/src/lib/behaviors/connect.ts',
    apiDescription:
      'Import these exports from your copied behavior module. State, saved edges, acceptance, semantics and styling stay in the component. The module imports Foldkit and Effect, not ui-sdk.',
    apiEntries: [
      {
        name: 'ConnectDraft',
        kind: 'schema',
        signature:
          'Schema.Struct({ from: String, to: Option(String), x: Number, y: Number, isKeyboard: Boolean })',
      },
      {
        name: 'Model',
        kind: 'schema',
        signature: 'Schema.Struct({ draft: Schema.Option(ConnectDraft) })',
      },
      {
        name: 'Message',
        kind: 'tagged union',
        signature:
          'RequestedKey | MeasuredKey | Started | Targeted | MovedPointer | RequestedCommit | RequestedCancel | Connected | CompletedAnnouncement',
      },
      {
        name: 'OutMessage',
        kind: 'tagged union',
        signature:
          'RequestedConnection { from, to, reason: Drag | ConnectKey } | Canceled { from }',
      },
      { name: 'init', kind: 'function', signature: 'init(): Model' },
      {
        name: 'update',
        kind: 'function',
        signature:
          'update(model: Model, message: Message, options: Options): Update.ReturnWithOutMessage<Model, Message, OutMessage>',
      },
      {
        name: 'create',
        kind: 'function',
        signature: 'create<Key extends string = string>(): Bundle<Key>',
      },
      {
        name: 'view',
        kind: 'view',
        signature: 'SubmodelView<Model, Message, ViewInputs<string>>',
      },
      {
        name: 'role',
        kind: 'function',
        signature:
          "role(model: Model, key: string, options: Options): 'Source' | 'Target' | 'Candidate' | undefined",
      },
      {
        name: 'keyboardTarget',
        kind: 'function',
        signature:
          'keyboardTarget(model: Model, pressedKey: string, ports: ReadonlyArray<Port>, options: Options): { handled: boolean; preventDefault: boolean; message: Option<Message> }',
      },
      {
        name: 'nearestInDirection',
        kind: 'function',
        signature:
          'nearestInDirection<Key extends string>(fromRect: Rect, candidates: ReadonlyArray<Port<Key>>, direction: readonly [number, number]): Key | undefined',
      },
      {
        name: 'connectMessage',
        kind: 'function',
        signature:
          'connectMessage(message: ConnectMessage, label: (key: string) => string): string',
      },
      {
        name: 'ObservePorts',
        kind: 'Mount',
        signature:
          'ObservePorts({ pairs: ReadonlyArray<{ from: string; to: string }>, radius: number }): MountAction',
      },
      {
        name: 'MeasurePorts',
        kind: 'Command',
        signature:
          'MeasurePorts({ id: string, from: string, key: string }): Command<Message>',
      },
      {
        name: 'Announce',
        kind: 'Command',
        signature: 'Announce({ id: string, text: string }): Command<Message>',
      },
    ],
    sections: [
      {
        id: 'coordinates-and-lifecycle',
        title: 'Coordinates and lifecycle',
        description:
          'The DOM adapter emits client-pixel facts. Convert Started, Targeted, MovedPointer and MeasuredKey rectangles at the component boundary when drawing in canvas units; direct facts already use caller units. Apply port attributes to the measured port element, not a wrapper containing its label. Mount policy and snapping radius are captured on insertion: remount the root when changing them. Update revalidates current policy. Components supply focus styles and touch-action policy.',
      },
    ],
    accessibility:
      'Components supply port semantics and a live region. Enter or Space starts and commits; arrows choose a candidate; Escape and Tab cancel without trapping Tab.',
    examples,
    stylexExamples: examples,
    pleatExamples: examples,
  },
})

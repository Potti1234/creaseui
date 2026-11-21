import { Effect, Option, Schema } from 'effect'
import { Runtime, type Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Dom from 'foldkit/dom'
import type { Document, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Spans from '../lib/behaviors/spans'
import { Pointer } from '../lib/behaviors/spans-pointer'

const Booking = Schema.Struct({ ...Spans.Span.fields, title: Schema.String })
type Booking = typeof Booking.Type
const timeline = Spans.create(Booking)
const rooms = ['Studio', 'Workshop'] as const
const geometry = { axis: 'x', min: 540, max: 1020, step: 30 } as const
const options = {
  ...geometry,
  tracks: rooms,
  overlap: false,
  size: 60,
  maxSize: 180,
} as const

const Model = Schema.Struct({
  timeline: timeline.Model,
  nextId: Schema.Number,
  status: Schema.String,
})
type Model = typeof Model.Type
const FocusMessage = defineMessageUnion({ FocusedBooking: {} })
type Message = typeof timeline.Message.Type | typeof FocusMessage.Type

const FocusBooking = Command.define('SpansDemoFocusBooking', {
  args: { id: Schema.String },
  messages: [FocusMessage.FocusedBooking],
  execute: ({ id }) =>
    Dom.focus(`#booking-${id}`).pipe(
      Effect.ignore,
      Effect.as(FocusMessage.FocusedBooking()),
    ),
})

const init = (): Update.Return<Model, Message> => ({
  model: {
    timeline: timeline.init([
      {
        id: '1',
        track: 'Studio',
        start: 570,
        end: 660,
        title: 'Design review',
      },
      { id: '2', track: 'Studio', start: 810, end: 900, title: 'Planning' },
      {
        id: '3',
        track: 'Workshop',
        start: 690,
        end: 810,
        title: 'Prototyping',
      },
    ]),
    nextId: 4,
    status: 'No changes yet.',
  },
})

const time = (minutes: number): string =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
const label = (booking: Booking): string =>
  `${booking.title}, ${booking.track}, ${time(booking.start)} to ${time(booking.end)}`

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  if (message._tag === 'FocusedBooking') return { model }
  const result = timeline.update(model.timeline, message, {
    ...options,
    create: range => ({
      ...range,
      id: String(model.nextId),
      title: 'New booking',
    }),
  })
  const out = result.outMessage
  if (!out) return { model: { ...model, timeline: result.model } }
  const action = out._tag === 'CancelledEdit' ? 'cancel' : out.action
  const focusMoved =
    out._tag === 'ChangedSpans' && out.reason === 'move-key' && out.movedTrack
  return {
    model: {
      timeline: result.model,
      nextId: action === 'draw' ? model.nextId + 1 : model.nextId,
      status: Spans.spansMessage(action, label(out.span)),
    },
    commands: focusMoved ? [FocusBooking({ id: out.span.id })] : [],
  }
}

const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Spans · CreaseUI',
  body: h.main(
    [],
    [
      h.p([h.Class('eyebrow')], ['CreaseUI / Behavior demo']),
      h.h1([], ['Room bookings']),
      h.p(
        [h.Class('instructions')],
        [
          'Drag an empty stretch to draw a booking, or click to book an hour. Drag a booking or either edge to edit it. When focused, use arrows to move, Shift + Left/Right to resize, and Delete to remove. Escape cancels a drag.',
        ],
      ),
      h.div(
        [
          h.Class('board'),
          h.OnMount(Pointer({ autoScroll: true, edge: 48, speed: 18 })),
        ],
        [
          ...rooms.map(room =>
            h.section(
              [h.Class('room'), h.AriaLabel(room)],
              [
                h.strong([], [room]),
                h.div(
                  [h.Class('track'), h.DataAttribute('span-track', room)],
                  [
                    ...timeline.spansOn(model.timeline, room).map(booking => {
                      const attributes = Object.entries(
                        timeline.spanAttrs(model.timeline, booking.id),
                      ).flatMap(([key, value]) =>
                        value === undefined ? [] : [h.Attribute(key, value)],
                      )
                      return h.keyed('button')(
                        booking.id,
                        [
                          h.Id(`booking-${booking.id}`),
                          h.Class('booking'),
                          h.AriaLabel(label(booking)),
                          h.Attribute(
                            'style',
                            Spans.spanStyle(booking, geometry),
                          ),
                          ...attributes,
                          h.OnKeyDownSelfPreventDefault((key, modifiers) => {
                            if (
                              modifiers.ctrlKey ||
                              modifiers.altKey ||
                              modifiers.metaKey
                            )
                              return Option.none()
                            if (
                              ![
                                'ArrowLeft',
                                'ArrowRight',
                                'ArrowUp',
                                'ArrowDown',
                                'Delete',
                                'Backspace',
                              ].includes(key)
                            )
                              return Option.none()
                            return Option.some(
                              timeline.Message.PressedKey({
                                id: booking.id,
                                key,
                                shift: modifiers.shiftKey,
                                rtl: false,
                              }),
                            )
                          }),
                        ],
                        [
                          h.span(
                            [
                              h.DataAttribute('span-edge', 'start'),
                              h.Attribute('aria-hidden', 'true'),
                            ],
                            [],
                          ),
                          booking.title,
                          h.span(
                            [
                              h.DataAttribute('span-edge', 'end'),
                              h.Attribute('aria-hidden', 'true'),
                            ],
                            [],
                          ),
                        ],
                      )
                    }),
                  ],
                ),
              ],
            ),
          ),
          h.div(
            [h.Class('hours'), h.Attribute('aria-hidden', 'true')],
            ['09:00', '11:00', '13:00', '15:00', '17:00'].map(hour =>
              h.span([], [hour]),
            ),
          ),
          h.p(
            [h.Class('status'), h.Attribute('role', 'status')],
            [model.status],
          ),
        ],
      ),
    ],
  ),
})

Runtime.run(
  Runtime.makeApplication({
    Model,
    init,
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

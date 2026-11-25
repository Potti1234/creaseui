import { Effect, Option, Schema, Stream } from 'effect'
import { Command, Runtime, Subscription, type Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as ColorScheme from '../../../lib/behaviors/color-scheme'
import * as Preference from '../../../lib/behaviors/preference'
import { projectDistance, solveSpring } from '../../../lib/behaviors/gesture'
import { rubberBand } from '../../../lib/behaviors/rubber-band'
import * as Findable from '../../../lib/behaviors/findable'
import * as Storage from '../../../lib/behaviors/storage'

const storage = {
  kind: 'local',
  id: 'crease-docs-example-color-scheme',
} satisfies Storage.Descriptor
const scheme = ColorScheme.create({ storage })
const Model = Schema.Struct({
  speed: Schema.Number,
  scheme: ColorScheme.Model,
  expanded: Schema.Boolean,
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  SetSpeed: { speed: Schema.Number },
  SetExpanded: { expanded: Schema.Boolean },
  GotScheme: { message: ColorScheme.Message },
})
type Message = typeof Message.Type
const gotScheme = (message: ColorScheme.Message) =>
  Message.GotScheme({ message })
const demo = new URLSearchParams(location.search).get('demo')
const system = matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'
const RestoreChoice = Command.define('RestoreBehaviorExampleChoice', {
  args: {},
  messages: [Message.GotScheme],
  execute: () =>
    Storage.get(storage).pipe(
      Effect.map(value =>
        gotScheme(
          ColorScheme.Message.GotPreferenceMessage({
            message: Preference.Message.RestoredValue({
              raw: Option.getOrNull(value),
            }),
          }),
        ),
      ),
    ),
})
const subscriptions = Subscription.make<Model, Message>()(entry => ({
  scheme: entry(
    {},
    {
      modelToDependencies: () => ({}),
      dependenciesToStream: () =>
        demo === 'theme'
          ? scheme.changes().pipe(Stream.map(gotScheme))
          : Stream.empty,
    },
  ),
}))

const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  if (message._tag === 'SetSpeed')
    return { model: { ...model, speed: message.speed } }
  if (message._tag === 'SetExpanded')
    return { model: { ...model, expanded: message.expanded } }
  const next = scheme.update(model.scheme, message.message)
  return {
    model: { ...model, scheme: next.model },
    commands: Command.mapMessages(next.commands ?? [], gotScheme),
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) => {
  if (demo === 'findable') {
    const searchable = Findable.supportsHiddenUntilFound()
    return h.main(
      [],
      [
        h.p(
          [],
          [
            searchable
              ? 'Use your browser’s find command to search for “Orchard observatory”.'
              : 'Use the button to show the station notes. This browser does not expose searchable hidden content.',
          ],
        ),
        h.button(
          [
            h.Type('button'),
            h.AriaExpanded(model.expanded),
            h.AriaControls('notes'),
            h.OnClick(Message.SetExpanded({ expanded: !model.expanded })),
          ],
          [model.expanded ? 'Hide station notes' : 'Show station notes'],
        ),
        h.p(
          [
            h.Id('notes'),
            ...Findable.hiddenAttributes(model.expanded, searchable),
            Findable.reveal(Message.SetExpanded({ expanded: true })),
          ],
          ['Orchard observatory records wind every fifteen minutes.'],
        ),
      ],
    )
  }
  if (demo === 'theme') {
    return h.main(
      [],
      [
        h.p(
          [],
          [
            'Change the preference, then reload this example to see the saved choice.',
          ],
        ),
        ...['light', 'dark', 'system'].map(value =>
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(String(value === model.scheme.value)),
              h.OnClick(
                gotScheme(
                  ColorScheme.Message.GotPreferenceMessage({
                    message: Preference.Message.RequestedValue({ value }),
                  }),
                ),
              ),
            ],
            [value],
          ),
        ),
        h.p(
          [h.Role('status')],
          [
            `${model.scheme.value} resolves to ${ColorScheme.resolved(model.scheme)}`,
          ],
        ),
      ],
    )
  }
  const distance = projectDistance(model.speed, 0.98)
  const shown = rubberBand(distance, 120)
  const remaining = solveSpring(0.4, 1, shown, -model.speed).position(100)
  return h.main(
    [],
    [
      h.label([h.For('speed')], ['Release speed']),
      h.input([
        h.Id('speed'),
        h.Type('range'),
        h.Min('0'),
        h.Max('6'),
        h.Step('0.1'),
        h.Value(String(model.speed)),
        h.OnInput(value => Message.SetSpeed({ speed: Number(value) })),
      ]),
      h.dl(
        [],
        [
          h.dt([], ['Projected travel']),
          h.dd([], [`${distance.toFixed(1)} px`]),
          h.dt([], ['With edge resistance']),
          h.dd([], [`${shown.toFixed(1)} px`]),
          h.dt([], ['Spring displacement after 100 ms']),
          h.dd([], [`${remaining.toFixed(1)} px`]),
        ],
      ),
    ],
  )
}

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({
      model: {
        speed: 2,
        expanded: false,
        scheme: scheme.init(Option.none(), system),
      },
      commands: demo === 'theme' ? [RestoreChoice({})] : [],
    }),
    update,
    view,
    subscriptions,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

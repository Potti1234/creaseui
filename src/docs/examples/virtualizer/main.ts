import { Option, Schema } from 'effect'
import { Command, Runtime, Subscription, type Update } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Virtualizer from '../../../lib/behaviors/virtualizer'

const Model = Schema.Struct({ list: Virtualizer.Model, count: Schema.Number })
type Model = typeof Model.Type
const Message = defineMessageUnion({
  GotList: { message: Virtualizer.Message },
  Centered: {},
  Last: {},
  Top: {},
  LoadedMore: {},
})
type Message = typeof Message.Type
const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  if (message._tag === 'LoadedMore')
    return { model: { ...model, count: model.count + 1000 } }
  const next =
    message._tag === 'GotList'
      ? Virtualizer.update(model.list, message.message)
      : Virtualizer.scrollToIndex(
          model.list,
          model.count,
          message._tag === 'Centered'
            ? 49
            : message._tag === 'Last'
              ? model.count - 1
              : 0,
          { align: message._tag === 'Centered' ? 'center' : 'start' },
        )
  return {
    model: { ...model, list: next.model },
    commands: Command.mapMessages(next.commands ?? [], message =>
      Message.GotList({ message }),
    ),
  }
}
const subscriptions = Subscription.lift(Virtualizer.subscriptions)<
  Model,
  Message
>({
  toChildModel: model => model.list,
  toParentMessage: message => Message.GotList({ message }),
})
const view = (model: Model, h: HtmlBuilder<Message>) => {
  const window = Virtualizer.visibleWindow(model.list, model.count, 2)
  return h.main(
    [],
    [
      h.h1([], ['Virtualizer behavior']),
      h.p(
        [h.Id('rendered-count')],
        [
          Option.match(window, {
            onNone: () => 'Measuring…',
            onSome: window =>
              `Rendered ${window.endIndex - window.startIndex} of ${model.count} rows`,
          }),
        ],
      ),
      h.div(
        [h.Class('controls')],
        [
          h.button([h.OnClick(Message.Centered())], ['Center 50']),
          h.button([h.OnClick(Message.Last())], ['Last']),
          h.button([h.OnClick(Message.Top())], ['Top']),
        ],
      ),
      h.submodel({
        slotId: 'list',
        model: model.list,
        view: Virtualizer.view<number>(),
        toParentMessage: message => Message.GotList({ message }),
        viewInputs: {
          items: Array.from({ length: model.count }, (_, index) => index),
          itemToKey: item => String(item),
          overscan: 2,
          containerClassName: 'list',
          itemToView: index => h.div([h.Class('row')], [`Row ${index + 1}`]),
        },
      }),
      ...Option.match(window, {
        onNone: () => [],
        onSome: window =>
          Virtualizer.isNearEnd(window, model.count)
            ? [h.button([h.OnClick(Message.LoadedMore())], ['Load more'])]
            : [],
      }),
    ],
  )
}
Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({
      model: {
        list: Virtualizer.init({ id: 'virtualizer-demo', rowHeightPx: 32 }),
        count: 10000,
      },
    }),
    update,
    subscriptions,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)

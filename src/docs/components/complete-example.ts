export type CompleteExampleConfig = Readonly<{
  componentName: string;
  componentSlug: string;
  exampleName: string;
  viewCode: string;
}>;

/**
 * Component examples used to be isolated view fragments. Keep the focused
 * fragment, but put it in the Foldkit application shape a reader needs when
 * moving it into an app. Stateful component examples already include their
 * child Model/Message delegation in `viewCode`; the parent seam below makes
 * the surrounding ownership and command flow explicit as well.
 */
export const completeExample = ({
  componentName,
  componentSlug,
  exampleName,
  viewCode,
}: CompleteExampleConfig): string => `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type Html, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ${componentName} from '@/ui/${componentSlug}'

// MODEL

export const Model = S.Struct({
  exampleRuns: S.Number,
})
export type Model = typeof Model.Type

// MESSAGES / COMMANDS

export const RanExample = m('Ran${componentName}${exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const Message = S.Union([RanExample])
export type Message = typeof Message.Type

// INIT

export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { exampleRuns: 0 },
  [],
]

// UPDATE

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Ran${componentName}${exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, exampleRuns: model.exampleRuns + 1 }, []]
  }
}

// SUBSCRIPTIONS

export const subscriptions = Subscription.aggregate<Model, Message>()()

// VIEW — ${exampleName}

const exampleView = (model: Model, h: HtmlBuilder<Message>): Html => {
${viewCode
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
}

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${componentName} — ${exampleName}',
  body: h.main([], [exampleView(model, h)]),
})

// RUNTIME

Runtime.run(
  Runtime.makeApplication({
    Model,
    init,
    update,
    view,
    subscriptions,
    container: document.getElementById('root'),
  }),
)
`;

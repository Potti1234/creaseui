import type {
  ComponentKind,
  PageDefinition,
} from '@/docs/components/page-definition';

export type AuthoredPage = Readonly<{
  slug: string;
  title: string;
  kind: ComponentKind;
  definition: PageDefinition;
}>;

export const authoredPage = (page: AuthoredPage): AuthoredPage => page;

export type FoldkitApplicationSource = Readonly<{
  title: string;
  imports: string;
  model: string;
  messages: string;
  init: string;
  update: string;
  view: string;
  subscriptions?: string;
}>;

/**
 * Formats a component-specific Foldkit application for display and copying.
 * Callers own every behavior-bearing section; this helper only keeps the
 * standard application boundary consistent across documentation pages.
 */
export const foldkitApplication = ({
  title,
  imports,
  model,
  messages,
  init,
  update,
  view,
  subscriptions =
    'export const subscriptions = Subscription.aggregate<Model, Message>()()',
}: FoldkitApplicationSource): string => `// ${title}

${imports}

// MODEL

${model}

// MESSAGES

${messages}

// INIT

${init}

// UPDATE

${update}

// SUBSCRIPTIONS

${subscriptions}

// VIEW

${view}

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

export const statelessComponentApplication = (config: Readonly<{
  componentName: string;
  componentSlug: string;
  exampleName: string;
  componentImports?: string;
  viewBody: string;
}>): string =>
  foldkitApplication({
    title: `${config.componentName} — ${config.exampleName}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ${config.componentName} from '@/ui/${config.componentSlug}'${
      config.componentImports === undefined ? '' : `\n${config.componentImports}`
    }`,
    model: `export const Model = S.Struct({
  clickCount: S.Number,
})
export type Model = typeof Model.Type`,
    messages: `export const ClickedExample = m('Clicked${config.componentName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const Message = S.Union([ClickedExample])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { clickCount: 0 },
  [],
]`,
    update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'Clicked${config.componentName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, clickCount: model.clickCount + 1 }, []]
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${config.componentName} — ${config.exampleName}',
  body: h.main(
    [h.Class('flex min-h-screen items-center justify-center p-8')],
    [
${config.viewBody
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')}
    ],
  ),
})`,
  });

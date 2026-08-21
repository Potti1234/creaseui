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

export const staticComponentApplication = (config: Readonly<{
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
    model: `export const Model = S.Struct({})
export type Model = typeof Model.Type`,
    messages: `// This example has no interaction. Runtime applications still expose a
// closed Message schema so the program boundary remains explicit.
export const NoOp = m('NoOp${config.componentName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const Message = S.Union([NoOp])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {},
  [],
]`,
    update: `export const update = (
  model: Model,
  _message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [model, []]`,
    view: `export const view = (_model: Model, h: HtmlBuilder<Message>): Document => ({
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

export const controlledTextApplication = (config: Readonly<{
  componentName: 'Input' | 'Textarea';
  componentSlug: 'input' | 'textarea';
  exampleName: string;
  field: string;
  initialValue: string;
  viewBody: string;
}>): string =>
  foldkitApplication({
    title: `${config.componentName} — ${config.exampleName}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ${config.componentName} from '@/ui/${config.componentSlug}'`,
    model: `export const Model = S.Struct({ ${config.field}: S.String })
export type Model = typeof Model.Type`,
    messages: `export const Changed${config.componentName} = m('Changed${config.componentName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}', { value: S.String })
export const Message = S.Union([Changed${config.componentName}])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { ${config.field}: ${JSON.stringify(config.initialValue)} },
  [],
]`,
    update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'Changed${config.componentName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, ${config.field}: message.value }, []]
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${config.componentName} — ${config.exampleName}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
${config.viewBody.split('\n').map((line) => `    ${line}`).join('\n')}
  ]),
})`,
  });

export const controlledBooleanApplication = (config: Readonly<{
  componentName: string;
  componentSlug: string;
  exampleName: string;
  field: string;
  initialValue: boolean;
  messageName: string;
  messageField: string;
  viewBody: string;
}>): string => foldkitApplication({
  title: `${config.componentName} — ${config.exampleName}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ${config.componentName} from '@/ui/${config.componentSlug}'`,
  model: `export const Model = S.Struct({ ${config.field}: S.Boolean })
export type Model = typeof Model.Type`,
  messages: `export const ${config.messageName} = m('${config.messageName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}', { ${config.messageField}: S.Boolean })
export const Message = S.Union([${config.messageName}])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { ${config.field}: ${String(config.initialValue)} },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case '${config.messageName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, ${config.field}: message.${config.messageField} }, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${config.componentName} — ${config.exampleName}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
${config.viewBody.split('\n').map((line) => `    ${line}`).join('\n')}
  ]),
})`,
});

export const controlledStringApplication = (config: Readonly<{
  componentName: string;
  componentSlug: string;
  exampleName: string;
  field: string;
  initialValue: string;
  messageName: string;
  messageField?: string;
  componentImports?: string;
  viewBody: string;
}>): string => {
  const messageField = config.messageField ?? 'value';
  const tag = `${config.messageName}${config.exampleName.replaceAll(/[^a-zA-Z0-9]/g, '')}`;

  return foldkitApplication({
    title: `${config.componentName} — ${config.exampleName}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ${config.componentName} from '@/ui/${config.componentSlug}'${
      config.componentImports === undefined ? '' : `\n${config.componentImports}`
    }`,
    model: `export const Model = S.Struct({ ${config.field}: S.String })
export type Model = typeof Model.Type`,
    messages: `export const ${config.messageName} = m('${tag}', { ${messageField}: S.String })
export const Message = S.Union([${config.messageName}])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { ${config.field}: ${JSON.stringify(config.initialValue)} },
  [],
]`,
    update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case '${tag}':
      return [{ ...model, ${config.field}: message.${messageField} }, []]
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${config.componentName} — ${config.exampleName}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
${config.viewBody.split('\n').map((line) => `    ${line}`).join('\n')}
  ]),
})`,
  });
};

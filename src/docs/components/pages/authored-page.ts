import { Schema as S, type Schema } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';

import type {
  ComponentKind,
  PageDefinition,
} from '@/docs/components/page-definition';

export type AuthoredPage = Readonly<{
  slug: string;
  title: string;
  kind: ComponentKind;
  definition: PageDefinition;
  previewProgram?: ErasedPreviewProgram;
  previewMode?: 'static';
}>;

const StaticPreviewMessage = m('InteractedWithStaticDocsPreview');
type StaticPreviewMessage = typeof StaticPreviewMessage.Type;

export const authoredPage = (page: AuthoredPage): AuthoredPage => {
  if (page.previewMode !== 'static' || page.previewProgram !== undefined) return page;
  const Model = S.Struct({ _docsPage: S.Literal(page.slug) });
  type Model = typeof Model.Type;
  const previewProgram = definePreviewProgram<Model, StaticPreviewMessage>({
    Model,
    Message: StaticPreviewMessage,
    init: () => ({ _docsPage: page.slug }),
    update: (model) => [model, []],
    view: (index, _model, h) => {
      const example = page.definition.examples[index];
      return example === undefined
        ? h.empty
        : example.staticPreview?.({}, h) ?? h.empty;
    },
  });
  return { ...page, previewProgram };
};

export type PreviewProgram<Model, Message> = Readonly<{
  Model: Schema.Schema<Model>;
  Message: Schema.Schema<Message>;
  init: (exampleIndex: number) => Model;
  update: (
    model: Model,
    message: Message,
  ) => readonly [Model, ReadonlyArray<Command.Command<Message>>];
  view: (
    exampleIndex: number,
    model: Model,
    h: HtmlBuilder<Message>,
  ) => Html;
  subscriptions?: Subscription.Subscriptions<Model, Message>;
}>;

export type ErasedPreviewProgram = Readonly<{
  Model: Schema.Top;
  Message: typeof RoutedDocsPreviewMessage;
  init: (exampleIndex: number) => unknown;
  update: (
    model: unknown,
    message: RoutedDocsPreviewMessage,
  ) => readonly [unknown, ReadonlyArray<Command.Command<RoutedDocsPreviewMessage>>];
  view: (
    exampleIndex: number,
    model: unknown,
    h: HtmlBuilder<RoutedDocsPreviewMessage>,
  ) => Html;
  subscriptions?: Subscription.Subscriptions<unknown, RoutedDocsPreviewMessage>;
}>;

export const RoutedDocsPreviewMessage = m('RoutedDocsPreviewMessage', { messageJson: S.String });
export type RoutedDocsPreviewMessage = typeof RoutedDocsPreviewMessage.Type;

/** Erases a page-local preview program only at the heterogeneous catalog boundary. */
export const definePreviewProgram = <Model, Message>(
  program: PreviewProgram<Model, Message>,
): ErasedPreviewProgram => {
  const childView = defineView<Model, Message, { exampleIndex: number }>((model, inputs, h) => program.view(inputs.exampleIndex, model, h));
  return {
    Model: program.Model,
    Message: RoutedDocsPreviewMessage,
    init: program.init,
    update: (model, message) => {
      const routed = message as RoutedDocsPreviewMessage;
      const [next, commands] = program.update(model as Model, JSON.parse(routed.messageJson) as Message);
      // Foldkit's public Command union retains its schema-derived message type,
      // while mapMessages accepts the equivalent structural command shape.
      // Keep that unavoidable erasure at this one catalog boundary.
      const routedCommands = Command.mapMessages(
        commands as ReadonlyArray<Command.Command<Message> & { effect: never }>,
        childMessage => RoutedDocsPreviewMessage({ messageJson: JSON.stringify(childMessage) }),
      );
      return [next, routedCommands];
    },
    view: (exampleIndex, model, h) => h.submodel({
      slotId: `typed-preview-${String(exampleIndex)}`,
      model: model as Model,
      view: childView,
      viewInputs: { exampleIndex },
      toParentMessage: message => RoutedDocsPreviewMessage({ messageJson: JSON.stringify(message) }),
    }),
    ...(program.subscriptions === undefined ? {} : {
      subscriptions: Subscription.lift(program.subscriptions)<unknown, RoutedDocsPreviewMessage>({
        toChildModel: model => model as Model,
        toParentMessage: message => RoutedDocsPreviewMessage({ messageJson: JSON.stringify(message) }),
      }),
    }),
  };
};

const ChangedTextPreview = m('ChangedTextDocsPreview', { value: S.String });
type ChangedTextPreview = typeof ChangedTextPreview.Type;

/** Creates an exact route-local Model for controlled string preview families. */
export const textPreviewProgram = <const Slug extends string>(
  slug: Slug,
  initialValues: ReadonlyArray<string>,
  render: (
    exampleIndex: number,
    value: string,
    onInput: (value: string) => ChangedTextPreview,
    h: HtmlBuilder<ChangedTextPreview>,
  ) => Html,
): ErasedPreviewProgram => {
  const Model = S.Struct({ _docsPage: S.Literal(slug), value: S.String });
  type Model = typeof Model.Type;
  return definePreviewProgram<Model, ChangedTextPreview>({
    Model,
    Message: ChangedTextPreview,
    init: index => ({ _docsPage: slug, value: initialValues[index] ?? '' }),
    update: (model, message) => [{ ...model, value: message.value }, []],
    view: (index, model, h) => render(index, model.value, value => ChangedTextPreview({ value }), h),
  });
};

const InteractedPreview = m('InteractedWithDocsPreview');
type InteractedPreview = typeof InteractedPreview.Type;

/** Creates a route-local counter Model for previews whose controls emit one generic action. */
export const interactionPreviewProgram = <const Slug extends string>(
  slug: Slug,
  render: (
    exampleIndex: number,
    interaction: InteractedPreview,
    h: HtmlBuilder<InteractedPreview>,
    interactionCount: number,
  ) => Html,
): ErasedPreviewProgram => {
  const Model = S.Struct({ _docsPage: S.Literal(slug), interactionCount: S.Number });
  type Model = typeof Model.Type;
  return definePreviewProgram<Model, InteractedPreview>({
    Model,
    Message: InteractedPreview,
    init: () => ({ _docsPage: slug, interactionCount: 0 }),
    update: model => [{ ...model, interactionCount: model.interactionCount + 1 }, []],
    view: (index, model, h) => render(
      index,
      InteractedPreview(),
      h,
      model.interactionCount,
    ),
  });
};

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
  renderer?: 'tailwind' | 'stylex';
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

import * as ${config.componentName} from '@/${config.renderer === 'stylex' ? 'stylex' : 'ui'}/${config.componentSlug}'${
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
  renderer?: 'tailwind' | 'stylex';
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

import * as ${config.componentName} from '@/${config.renderer === 'stylex' ? 'stylex' : 'ui'}/${config.componentSlug}'${
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
  renderer?: 'tailwind' | 'stylex';
  exampleName: string;
  field: string;
  initialValue: string;
  componentImports?: string;
  viewBody: string;
}>): string =>
  foldkitApplication({
    title: `${config.componentName} — ${config.exampleName}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ${config.componentName} from '@/${config.renderer === 'stylex' ? 'stylex' : 'ui'}/${config.componentSlug}'${
      config.componentImports === undefined ? '' : `\n${config.componentImports}`
    }`,
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
  renderer?: 'tailwind' | 'stylex';
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

import * as ${config.componentName} from '@/${config.renderer === 'stylex' ? 'stylex' : 'ui'}/${config.componentSlug}'${
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

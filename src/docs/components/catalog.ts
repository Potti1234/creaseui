import { Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';

import { componentPage, componentTitle, example } from '@/docs/component-page';
import * as State from '@/docs/components/catalog-state';
import * as CopyFeedback from '@/docs/copy-feedback';
import type { ComponentKind, PageDefinitions } from '@/docs/components/page-definition';
import { componentApi } from '@/docs/generated-component-api';
import { authoredPages } from '@/docs/components/pages';

const definitions: PageDefinitions = {
  ...Object.fromEntries(
    Object.values(authoredPages).map((page) => [page.slug, page.definition]),
  ),
};

const EXAMPLE_STATE_COUNT = 32;

export const Model = S.Struct({
  examples: S.Array(State.Model),
  copiedCode: CopyFeedback.Model,
});
export type Model = typeof Model.Type;

export const GotExampleMessage = m('GotCatalogExampleMessage', {
  index: S.Number,
  message: State.Message,
});
export const Message = S.Union([GotExampleMessage, CopyFeedback.Message]);
export type Message = typeof Message.Type;

export const init = (slug?: string): Model => ({
  examples: Array.from({ length: definitions[slug ?? '']?.examples.length ?? 0 }, (_, index) =>
    State.withExampleIds(State.init(), `catalog-example-${String(index)}`),
  ),
  copiedCode: null,
});

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn => {
  if (message._tag !== 'GotCatalogExampleMessage') {
    const [copiedCode, commands] = CopyFeedback.update(
      model.copiedCode,
      message,
    );
    return [
      { ...model, copiedCode },
      Command.mapMessages(commands, (next) => next),
    ];
  }

  const current = model.examples[message.index];
  if (current === undefined) return [model, []];

  const [example, commands] = State.update(current, message.message);
  return [
    {
      examples: model.examples.map((candidate, index) =>
        index === message.index ? example : candidate,
      ),
      copiedCode: model.copiedCode,
    },
    Command.mapMessages(commands, (next) =>
      GotExampleMessage({ index: message.index, message: next }),
    ),
  ];
};

export const subscriptions = Subscription.aggregate<Model, Message>()(
  ...Array.from({ length: EXAMPLE_STATE_COUNT }, (_, index) => {
    const lifted = Subscription.lift(State.subscriptions)<Model, Message>({
      toChildModel: (model) => model.examples[index] ?? fallbackExampleState,
      toParentMessage: (message) => GotExampleMessage({ index, message }),
    });

    return {
      [`example${String(index)}SliderPointer`]: lifted.sliderPointer!,
      [`example${String(index)}SliderEscape`]: lifted.sliderEscape!,
    };
  }),
);

const fallbackExampleState = State.init();

export const hasCatalogPage = (slug: string): boolean =>
  componentTitle(slug) !== undefined;

export const hasDedicatedDefinition = (slug: string): boolean =>
  definitions[slug] !== undefined;

export const dedicatedExampleTitles = (slug: string): ReadonlyArray<string> =>
  definitions[slug]?.examples.map((config) => config.title) ?? [];

export const componentKind = (slug: string): ComponentKind | undefined => {
  const definition = definitions[slug];
  return definition === undefined ? undefined : kindFor(slug, definition);
};

export const titleFor = componentTitle;

const exportOverrides: Readonly<Record<string, string>> = {
  'alert-dialog': 'alertDialog',
  'aspect-ratio': 'aspectRatio',
  'button-group': 'buttonGroup',
  'context-menu': 'contextMenu',
  'data-table': 'dataTable',
  'date-picker': 'datePicker',
  chart: 'barChart',
  'dropdown-menu': 'dropdownMenu',
  'hover-card': 'hoverCard',
  'input-group': 'inputGroup',
  'input-otp': 'inputOtp',
  'message-scroller': 'messageScroller',
  'native-select': 'nativeSelect',
  'navigation-menu': 'navigationMenu',
  'radio-group': 'radioGroup',
  'scroll-area': 'scrollArea',
  'toggle-group': 'toggleGroup',
  typography: 'typographyH1',
  switch: 'switchControl',
};

const primaryExport = (slug: string): string =>
  exportOverrides[slug] ??
    slug.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());

const recipeSlugs = new Set([
  'data-table',
  'date-picker',
  'form',
  'input-group',
  'sidebar',
  'toast',
  'typography',
]);

const kindFor = (slug: string, definition: PageDefinitions[string]): ComponentKind => {
  if (definition.kind !== undefined) return definition.kind;
  if (recipeSlugs.has(slug)) return 'recipe';
  const exports = componentApi[slug] ?? [];
  return exports.some((entry) => entry.name === 'Model') &&
      exports.some((entry) => entry.name === 'update')
    ? 'submodel'
    : 'helper';
};

const architectureFor = (kind: ComponentKind, name: string): string => {
  switch (kind) {
    case 'helper':
      return `${name} is view-only. Call its render helper directly inside your view; it does not add a child Model, Message, update branch, or h.submodel boundary.`;
    case 'submodel':
      return `${name} owns interaction state. Store its Model in the parent, initialize it with the app, embed its Message, delegate update results and Commands, then render it through h.submodel.`;
    case 'recipe':
      return `${name} composes source-owned Crease UI modules into an application pattern. Read the installed source as the public API and integrate stateful dependencies through the normal Foldkit update loop.`;
  }
};

const compositionFor = (
  kind: ComponentKind,
  name: string,
  viewExport: string,
): string => {
  switch (kind) {
    case 'helper':
      return `${name}\n└── ${viewExport}(ViewConfig, HtmlBuilder) → Html`;
    case 'submodel':
      return `${name}\n├── Model / init\n├── Message / update / Commands\n├── optional OutMessage\n└── h.submodel → ${viewExport} view`;
    case 'recipe':
      return `${name}\n├── source-owned composition\n├── stateless helpers and/or child Models\n└── application Model / Message / update integration`;
  }
};

const usageFor = (slug: string, name: string, kind: ComponentKind): string => {
  const namespace = name.replaceAll(' ', '');
  if (kind === 'helper') {
    return `import * as ${namespace} from '@/ui/${slug}'\n\nconst view = (model: Model, h: HtmlBuilder<Message>) =>\n  ${namespace}.${primaryExport(slug)}(viewConfig, h)`;
  }
  if (kind === 'submodel') {
    const field = namespace[0]!.toLowerCase() + namespace.slice(1);
    return `import { Command } from 'foldkit'\nimport * as ${namespace} from '@/ui/${slug}'\n\n// Model and init\n${field}: ${namespace}.Model\n${field}: ${namespace}.init(initConfig)\n\n// Delegate the child update and lift its commands\nconst [next, commands] = ${namespace}.update(model.${field}, childMessage)\nreturn [\n  { ...model, ${field}: next },\n  Command.mapMessages(commands, message => Got${namespace}Message({ message })),\n]\n\n// Keep the child view behind a keyed submodel boundary\nh.submodel({\n  slotId: '${slug}',\n  model: model.${field},\n  view: ${namespace}.view,\n  viewInputs,\n  toParentMessage: message => Got${namespace}Message({ message }),\n})`;
  }
  return `import * as ${namespace} from '@/ui/${slug}'\n\n// Recipes are installed as source. Compose their exports in your view and\n// wire stateful dependencies through the parent Model, Message, and update.\n${namespace}.${primaryExport(slug)}(viewConfig, h)`;
};

export const view = (
  model: Model,
  slug: string,
  h: HtmlBuilder<Message>,
): Html => {
  const name = componentTitle(slug);
  const definition = definitions[slug];

  if (name === undefined || definition === undefined) {
    throw new Error(`Missing dedicated documentation definition for ${slug}`);
  }
  const kind = kindFor(slug, definition);

  return componentPage<Message>(
    {
      name,
      description: definition.description,
      kind,
      architecture: definition.architecture ?? architectureFor(kind, name),
      installation: `npx shadcn@latest add Potti1234/creaseui/${slug}`,
      usage: definition.usage ?? usageFor(slug, name, kind),
      ...(definition.sections === undefined ? {} : { sections: definition.sections }),
      ...(definition.styling === undefined ? {} : { styling: definition.styling }),
      ...(definition.accessibility === undefined
        ? {}
        : { accessibility: definition.accessibility }),
      ...(definition.keyboard === undefined ? {} : { keyboard: definition.keyboard }),
      copiedCode: model.copiedCode,
      onCopyCode: (code) => CopyFeedback.ClickedCopyCode({ code }),
      exampleTitles: definition.examples.map((example) => example.title),
      sidebarScrolled: CopyFeedback.ObservedSidebarScroll(),
      composition:
        definition.composition ??
        compositionFor(kind, name, primaryExport(slug)),
      examples: definition.examples.map((config, index) => {
        const exampleCode = config.code;
        const previewView = defineView<State.Model, State.Message>(
          (exampleModel, h) => config.preview(exampleModel, h),
        );

        return example<Message>(
          {
            title: config.title,
            ...(config.description === undefined
              ? {}
              : { description: config.description }),
            preview: h.submodel({
              slotId: `docs-${slug}-example-${String(index)}`,
              model: model.examples[index] ?? fallbackExampleState,
              view: previewView,
              toParentMessage: (message: State.Message): Message =>
                GotExampleMessage({ index, message }),
            }),
            code: exampleCode,
            onCopy: CopyFeedback.ClickedCopyCode({ code: exampleCode }),
            isCopied: model.copiedCode === exampleCode,
            ...(config.previewClass === undefined
              ? {}
              : { previewClass: config.previewClass }),
          },
          h,
        );
      }),
      apiHref: definition.apiHref ?? 'https://foldkit.dev/ui/overview',
      sourceHref: `https://github.com/Potti1234/creaseui/blob/main/src/ui/${slug}.ts`,
      apiDescription:
        definition.apiDescription ??
        `${name} is source-owned after installation. Its public model, messages, update function, and view helpers are documented directly in the installed TypeScript source.`,
      apiEntries:
        slug === 'toast' ? (componentApi.sonner ?? []) : (componentApi[slug] ?? []),
    },
    h,
  );
};

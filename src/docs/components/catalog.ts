import { Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';

import { componentPage, componentTitle, example } from '@/docs/component-page';
import * as State from '@/docs/components/catalog-state';
import * as CopyFeedback from '@/docs/copy-feedback';
import { definitions as earlyDefinitions } from '@/docs/components/definitions/a-to-command';
import { definitions as middleDefinitions } from '@/docs/components/definitions/context-to-pagination';
import { definitions as lateDefinitions } from '@/docs/components/definitions/popover-to-typography';
import type { PageDefinitions } from '@/docs/components/page-definition';
import { completeExample } from '@/docs/components/complete-example';

const definitions: PageDefinitions = {
  ...earlyDefinitions,
  ...middleDefinitions,
  ...lateDefinitions,
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

const usageFor = (slug: string, name: string): string => {
  const namespace = name.replaceAll(' ', '');
  return `import * as ${namespace} from '@/ui/${slug}'\n\n// The installed module is the API. Stateful components expose Model, Message,\n// init, update, and a view helper; stateless components expose view helpers.\n${namespace}.${primaryExport(slug)}({\n  // Use editor completion to supply the typed configuration.\n})`;
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

  return componentPage<Message>(
    {
      name,
      description: definition.description,
      installation: `npx shadcn@latest add Potti1234/creaseui/${slug}`,
      usage: usageFor(slug, name),
      copiedCode: model.copiedCode,
      onCopyCode: (code) => CopyFeedback.ClickedCopyCode({ code }),
      exampleTitles: definition.examples.map((example) => example.title),
      sidebarScrolled: CopyFeedback.ObservedSidebarScroll(),
      composition:
        definition.composition ??
        `${name}\n├── Model / init / update\n├── ${primaryExport(slug)} view\n└── Source-owned styles and composition`,
      examples: definition.examples.map((config, index) => {
        const completeCode = completeExample({
          componentName: name.replaceAll(' ', ''),
          componentSlug: slug,
          exampleName: config.title,
          viewCode: config.code,
        });
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
            code: completeCode,
            onCopy: CopyFeedback.ClickedCopyCode({ code: completeCode }),
            isCopied: model.copiedCode === completeCode,
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
    },
    h,
  );
};

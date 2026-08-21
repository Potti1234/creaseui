import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as RadioGroup from '@/ui/radio-group';

const source = (name: string, config: string): string => foldkitApplication({
  title: `Radio Group — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as RadioGroup from '@/ui/radio-group'`,
  model: `export const Model = S.Struct({
  density: S.String,
  radioGroup: RadioGroup.Model,
})
export type Model = typeof Model.Type`,
  messages: `export const GotRadioGroupMessage = m('GotRadioGroupMessage', { message: RadioGroup.Message })
export const Message = S.Union([GotRadioGroupMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { density: 'comfortable', radioGroup: RadioGroup.init({ id: 'density' }) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [radioGroup, commands, maybeSelection] = RadioGroup.update(model.radioGroup, message.message)
  return [
    { ...model, radioGroup, density: Option.match(maybeSelection, { onNone: () => model.density, onSome: selection => selection.value }) },
    Command.mapMessages(commands, child => GotRadioGroupMessage({ message: child })),
  ]
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Radio Group — ${name}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
    RadioGroup.radioGroup({
      model: model.radioGroup,
      selectedValue: Option.some(model.density),
      toParentMessage: message => GotRadioGroupMessage({ message }),
      ariaLabel: 'Interface density',
      ${config}
    }, h),
  ]),
})`,
});

const options = [
  { value: 'default', label: 'Default', description: 'Balanced spacing for most interfaces.' },
  { value: 'comfortable', label: 'Comfortable', description: 'More space around every control.' },
  { value: 'compact', label: 'Compact', description: 'Fit more information on screen.' },
] as const;

const PreviewModel = S.Struct({ _docsPage: S.Literal('radio-group'), value: S.String, radioGroup: RadioGroup.Model });
type PreviewModel = typeof PreviewModel.Type;
const ChangedPreview = m('ChangedRadioGroupPreview', { value: S.String });
const GotRadioGroupMessage = m('GotDocsRadioGroupMessage', { message: RadioGroup.Message });
const PreviewMessage = S.Union([ChangedPreview, GotRadioGroupMessage]);
type PreviewMessage = typeof PreviewMessage.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: PreviewMessage,
  init: index => ({ _docsPage: 'radio-group', value: 'comfortable', radioGroup: RadioGroup.init({ id: `docs-radio-${String(index)}` }) }),
  update: (model, message) => {
    if (message._tag === 'ChangedRadioGroupPreview') return [{ ...model, value: message.value }, []];
    const [radioGroup, commands, maybeSelection] = RadioGroup.update(model.radioGroup, message.message);
    return [{ ...model, radioGroup, value: Option.match(maybeSelection, { onNone: () => model.value, onSome: selection => selection.value }) }, Command.mapMessages(commands, child => GotRadioGroupMessage({ message: child }))];
  },
  view: (index, model, h) => RadioGroup.radioGroup({ model: model.radioGroup, selectedValue: Option.some(model.value), toParentMessage: message => GotRadioGroupMessage({ message }), ariaLabel: 'Interface density', ...(index === 1 ? { isDisabled: true, options: options.map(({ value, label }) => ({ value, label })) } : { options }) }, h),
});

export const radioGroupPage = authoredPage({
  slug: 'radio-group', title: 'Radio Group', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Chooses exactly one value from a visible set of mutually exclusive options.',
    architecture: 'Radio Group is a Foldkit Submodel. The parent owns the selected Option<string>, delegates child Messages through update, and stores the Selected OutMessage value.',
    apiHref: 'https://foldkit.dev/ui/radio-group',
    styling: 'Keep the full choice set visible. Descriptions are useful when labels alone do not explain the consequence of each choice.',
    accessibility: 'ariaLabel names the group, each option has a linked label, and an optional name emits the hidden input needed for native form submission.',
    keyboard: [['Arrow keys', 'Moves selection and focus within the group.'], ['Space', 'Selects the focused option.']],
    examples: [
      {
        title: 'Density', description: 'Descriptions turn short option labels into an informed single-choice decision.',

        code: source('Density', `options: [
    { value: 'default', label: 'Default', description: 'Balanced spacing for most interfaces.' },
    { value: 'comfortable', label: 'Comfortable', description: 'More space around every control.' },
    { value: 'compact', label: 'Compact', description: 'Fit more information on screen.' },
  ],`),
      },
      {
        title: 'Disabled group', description: 'Disable the group when the entire decision is unavailable, while preserving its context.',

        code: source('Disabled group', `isDisabled: true,
  options: [
    { value: 'default', label: 'Default' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ],`),
      },
    ],
  },
});

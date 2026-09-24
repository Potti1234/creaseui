import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const radioGroupOptions = [
  {
    value: 'default',
    label: 'Default',
    description: 'Balanced spacing for most interfaces.',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'More space around every control.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Fit more information on screen.',
  },
] as const;

const source = (
  name: string,
  config: string,
  renderer: 'tailwind' | 'stylex',
): string => foldkitApplication({
  title: `Radio Group — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as RadioGroup from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/radio-group'`,
  model: `export const Model = S.Struct({
  density: S.String,
  radioGroup: RadioGroup.Model,
})
export type Model = typeof Model.Type`,
  messages: `import { defineMessageUnion } from 'foldkit/message'

export const Message = defineMessageUnion({
  GotRadioGroupMessage: { message: RadioGroup.Message },
});
export type Message = typeof Message.Type`,
  init: `export const init = (): Update.Return<Model, Message> => ({ model: { density: 'comfortable', radioGroup: RadioGroup.init({ id: 'density' }) } })`,
  update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  const radioGroupOp__ = RadioGroup.update(model.radioGroup, message.message);
    const radioGroup = radioGroupOp__.model;
    const commands = radioGroupOp__.commands ?? [];
    const maybeSelection = Option.fromNullishOr(radioGroupOp__.outMessage);
  return { model: { ...model, radioGroup, density: Option.match(maybeSelection, { onNone: () => model.density, onSome: selection => selection.value }) }, commands: Command.mapMessages(commands, child => Message.GotRadioGroupMessage({ message: child })) }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Radio Group — ${name}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
    RadioGroup.radioGroup({
      model: model.radioGroup,
      selectedValue: Option.some(model.density),
      toParentMessage: message => Message.GotRadioGroupMessage({ message }),
      ariaLabel: 'Interface density',
      name: 'density',
      ${config}
    }, h),
  ]),
})`,
});

const metadata = [
  {
    title: 'Density',
    description: 'Descriptions turn short option labels into an informed single-choice decision.',
    config: `options: [
    { value: 'default', label: 'Default', description: 'Balanced spacing for most interfaces.' },
    { value: 'comfortable', label: 'Comfortable', description: 'More space around every control.' },
    { value: 'compact', label: 'Compact', description: 'Fit more information on screen.' },
  ],`,
  },
  {
    title: 'Disabled group',
    description: 'Disable the group when the entire decision is unavailable, while preserving its context.',
    config: `isDisabled: true,
  options: [
    { value: 'default', label: 'Default' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ],`,
  },
  {
    title: 'Read only',
    description: 'Allow focus navigation while preventing an externally managed selection from changing.',
    config: `isReadOnly: true,
  options: [
    { value: 'default', label: 'Default' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ],`,
  },
  {
    title: 'RTL and disabled option',
    description: 'Mirror horizontal arrow behavior and disable only choices that are unavailable.',
    config: `direction: 'rtl',
  orientation: 'Horizontal',
  options: [
    { value: 'default', label: 'Default' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact', isDisabled: true },
  ],`,
  },
] as const;

export const radioGroupExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map(item => ({
  title: item.title,
  description: item.description,
  code: source(item.title, item.config, renderer),
}));

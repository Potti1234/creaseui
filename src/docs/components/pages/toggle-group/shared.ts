import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const toggleGroupItems = [
  { value: 'left', children: ['Left'] },
  { value: 'center', children: ['Center'] },
  { value: 'right', children: ['Right'] },
] as const;
export type Alignment = typeof toggleGroupItems[number]['value'];

const source = (
  name: string,
  multiple: boolean,
  extra: string,
  renderer: 'tailwind' | 'stylex',
): string => foldkitApplication({
  title: `Toggle Group — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as ToggleGroup from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/toggle-group'`,
  model: `export const Alignment = S.Literals(['left', 'center', 'right'])
export type Alignment = typeof Alignment.Type
const AlignmentGroup = ToggleGroup.create<Alignment>()
export const Model = S.Struct({
  toggleGroup: ToggleGroup.Model,
  ${multiple ? 'alignments: S.Array(Alignment)' : 'alignment: Alignment'},
})
export type Model = typeof Model.Type`,
  messages: `export const GotToggleGroupMessage = m('GotToggleGroupMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: ToggleGroup.Message })
export const Message = S.Union([GotToggleGroupMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { toggleGroup: ToggleGroup.init({ id: 'alignment-group' }), ${multiple ? "alignments: ['left']" : "alignment: 'center'"} },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [toggleGroup, commands, maybeSelection] = AlignmentGroup.update(model.toggleGroup, message.message)
  return [
    {
      ...model,
      toggleGroup,
      ${multiple
        ? `alignments: Option.match(maybeSelection, {
        onNone: () => model.alignments,
        onSome: ({ value }) => model.alignments.includes(value)
          ? model.alignments.filter(item => item !== value)
          : [...model.alignments, value],
      }),`
        : `alignment: Option.match(maybeSelection, {
        onNone: () => model.alignment,
        onSome: ({ value }) => value,
      }),`}
    },
    Command.mapMessages(commands, next => GotToggleGroupMessage({ message: next })),
  ]
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Toggle Group — ${name}',
  body: h.main([], [
    AlignmentGroup.toggleGroup({
      model: model.toggleGroup,
      toParentMessage: message => GotToggleGroupMessage({ message }),
      ariaLabel: 'Text alignment',
      ${multiple ? 'values: model.alignments,' : 'value: model.alignment,'}
      items: [
        { value: 'left', children: ['Left'] },
        { value: 'center', children: ['Center']${name === 'Disabled item' ? ', isDisabled: true' : ''} },
        { value: 'right', children: ['Right'] },
      ],
      ${extra}
    }, h),
    ${name === 'Form policy' ? "h.input([h.Type('hidden'), h.Name('alignment'), h.Value(model.alignment)])," : ''}
  ]),
})`,
});

const metadata = [
  {
    title: 'Single selection',
    description: 'Persist the emitted value as the exclusive parent-owned selection.',
    multiple: false,
    extra: '',
  },
  {
    title: 'Multiple selection',
    description: 'Add or remove the emitted value while the child continues to own only focus.',
    multiple: true,
    extra: `arrangement: 'wrapped',`,
  },
  {
    title: 'RTL',
    description: 'Horizontal arrow order mirrors while the selected domain value remains parent-owned.',
    multiple: false,
    extra: `direction: 'rtl',`,
  },
  {
    title: 'Disabled item',
    description: 'Disabled buttons remain unavailable and roving focus skips them.',
    multiple: false,
    extra: `variant: 'outline',`,
  },
  {
    title: 'Form policy',
    description: 'Toggle buttons do not submit values implicitly; mirror parent state into a named hidden input when the server needs it.',
    multiple: false,
    extra: '',
  },
] as const;

export const toggleGroupExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map(item => ({
  title: item.title,
  description: item.description,
  code: source(item.title, item.multiple, item.extra, renderer),
}));

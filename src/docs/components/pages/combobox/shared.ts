import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const comboboxFrameworks = [{ value: 'next', label: 'Next.js' }, { value: 'svelte', label: 'SvelteKit' }, { value: 'nuxt', label: 'Nuxt.js' }] as const;
export const comboboxLabel = (value: string): string => comboboxFrameworks.find(item => item.value === value)?.label ?? value;
export const comboboxFixtures = [
  { title: 'Framework search', description: 'A typed selection remains parent-owned while the child keeps its transient query and disclosure state.', grouped: false, empty: false, readOnly: false },
  { title: 'Grouped frameworks', description: 'Searchable groups add view metadata without changing OutMessage handling.', grouped: true, empty: false, readOnly: false },
  { title: 'No results', description: 'Remote or local result policy stays in the parent; announce the empty state beside the controlled combobox.', grouped: false, empty: true, readOnly: false },
  { title: 'Read only RTL', description: 'Expose a committed value for inspection without accepting query or selection changes.', grouped: false, empty: false, readOnly: true },
] as const;

const source = (fixture: (typeof comboboxFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  return foldkitApplication({
    title: `Combobox — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Combobox from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/combobox'`,
    model: `export const FrameworkValue = S.Literals(['next', 'svelte', 'nuxt'])
export type FrameworkValue = typeof FrameworkValue.Type
const FrameworkCombobox = Combobox.create<FrameworkValue>()
export const Model = S.Struct({
  combobox: Combobox.Model,
  maybeFramework: S.Option(FrameworkValue),
})
export type Model = typeof Model.Type`,
    messages: `export const GotComboboxMessage = m('GotComboboxMessage${tag}', { message: Combobox.Message })
export const Message = S.Union([GotComboboxMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { combobox: Combobox.init({ id: 'framework-combobox', isAnimated: true }), maybeFramework: Option.none() },
  [],
]`,
    update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotComboboxMessage${tag}': {
      const [combobox, commands, maybeSelection] = FrameworkCombobox.update(model.combobox, message.message)
      const maybeFramework = Option.match(maybeSelection, {
        onNone: () => model.maybeFramework,
        onSome: selection => selection._tag === 'Selected'
          ? Option.some(selection.value)
          : Option.none<FrameworkValue>(),
      })
      return [
        { ...model, combobox, maybeFramework },
        Command.mapMessages(commands, next => GotComboboxMessage({ message: next })),
      ]
    }
  }
}`,
    view: `const frameworks: ReadonlyArray<Readonly<{ value: FrameworkValue; label: string; group: string }>> = [
  { value: 'next', label: 'Next.js', group: 'React' },
  { value: 'svelte', label: 'SvelteKit', group: 'Other' },
  { value: 'nuxt', label: 'Nuxt.js', group: 'Other' },
]
const labelFor = (value: FrameworkValue): string => frameworks.find(item => item.value === value)?.label ?? value

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Combobox — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    FrameworkCombobox.combobox({
      model: model.combobox,
      maybeSelectedValue: model.maybeFramework,
      restingInputValue: Option.match(model.maybeFramework, { onNone: () => '', onSome: labelFor }),
      toParentMessage: message => GotComboboxMessage({ message }),
      items: ${fixture.empty ? '[] as typeof frameworks' : 'frameworks'},
      itemToValue: item => item.value,
      itemToLabel: item => item.label,
      placeholder: 'Search frameworks…',
      ariaLabel: 'Framework',
${fixture.grouped ? "      itemGroupKey: item => item.group,\n      groupToHeading: group => group,\n" : ''}      formName: 'framework',
${fixture.readOnly ? "      isReadOnly: true,\n      direction: 'rtl',\n" : ''}    }, h),
${fixture.empty ? "    h.p([h.Role('status')], ['No frameworks match this query.']),\n" : ''}
  ]),
})`,
  });
};

export const comboboxExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => comboboxFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer) }));

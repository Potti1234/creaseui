import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Combobox from '@/ui/combobox';

const frameworks = [{ value: 'next', label: 'Next.js' }, { value: 'svelte', label: 'SvelteKit' }, { value: 'nuxt', label: 'Nuxt.js' }] as const;
const labelFor = (value: string): string => frameworks.find((item) => item.value === value)?.label ?? value;

const source = (name: string, grouped: boolean, config = ''): string => foldkitApplication({
  title: `Combobox — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Combobox from '@/ui/combobox'`,
  model: `export const FrameworkValue = S.Literals(['next', 'svelte', 'nuxt'])
export type FrameworkValue = typeof FrameworkValue.Type
const FrameworkCombobox = Combobox.create<FrameworkValue>()
export const Model = S.Struct({
  combobox: Combobox.Model,
  maybeFramework: S.Option(FrameworkValue),
})
export type Model = typeof Model.Type`,
  messages: `export const GotComboboxMessage = m('GotComboboxMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Combobox.Message })
export const Message = S.Union([GotComboboxMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { combobox: Combobox.init({ id: 'framework-combobox', isAnimated: true }), maybeFramework: Option.none() },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotComboboxMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
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
  title: 'Combobox — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    FrameworkCombobox.combobox({
      model: model.combobox,
      maybeSelectedValue: model.maybeFramework,
      restingInputValue: Option.match(model.maybeFramework, { onNone: () => '', onSome: labelFor }),
      toParentMessage: message => GotComboboxMessage({ message }),
      items: frameworks,
      itemToValue: item => item.value,
      itemToLabel: item => item.label,
      placeholder: 'Search frameworks…',
      ariaLabel: 'Framework',${grouped ? `
      itemGroupKey: item => item.group,
      groupToHeading: group => group,` : ''}
      formName: 'framework',
      ${config}
    }, h),
  ]),
})`,
});

const GotComboboxPreviewMessage = m('GotComboboxPreviewMessage', { message: Combobox.Message });
type GotComboboxPreviewMessage = typeof GotComboboxPreviewMessage.Type;
const ComboboxPreviewModel = S.Struct({ _docsPage: S.Literal('combobox'), combobox: Combobox.Model, maybeFramework: S.Option(S.String) });
type ComboboxPreviewModel = typeof ComboboxPreviewModel.Type;
const previewProgram = definePreviewProgram<ComboboxPreviewModel, GotComboboxPreviewMessage>({
  Model: ComboboxPreviewModel, Message: GotComboboxPreviewMessage,
  init: index => ({ _docsPage: 'combobox', combobox: Combobox.init({ id: `docs-combobox-${String(index)}`, isAnimated: true }), maybeFramework: Option.none() }),
  update: (model, message) => {
    const [combobox, commands, maybeSelection] = Combobox.update(model.combobox, message.message);
    const maybeFramework = Option.match(maybeSelection, { onNone: () => model.maybeFramework, onSome: selection => selection._tag === 'Selected' ? Option.some(selection.value) : Option.none<string>() });
    return [{ ...model, combobox, maybeFramework }, Command.mapMessages(commands, next => GotComboboxPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => h.div([h.Class('grid gap-2')], [
    Combobox.combobox({ model: model.combobox, maybeSelectedValue: model.maybeFramework, restingInputValue: Option.match(model.maybeFramework, { onNone: () => '', onSome: labelFor }), toParentMessage: message => GotComboboxPreviewMessage({ message }), items: index === 2 ? [] : frameworks, itemToValue: item => item.value, itemToLabel: item => item.label, placeholder: 'Search frameworks…', ariaLabel: 'Framework', formName: 'framework', ...(index === 1 ? { itemGroupKey: (item: typeof frameworks[number]) => item.value === 'next' ? 'React' : 'Other', groupToHeading: (group: string) => group } : {}), ...(index === 3 ? { isReadOnly: true, direction: 'rtl' as const } : {}) }, h),
    ...(index === 2 ? [h.p([h.Role('status'), h.Class('text-sm text-muted-foreground')], ['No frameworks match this query.'])] : []),
  ]),
});

export const comboboxPage = authoredPage({
  slug: 'combobox', title: 'Combobox', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Combines a searchable text input with a typed single-selection popup.',
    architecture: 'Bind the value union once with Combobox.create<Value>(). The child Model owns query, active option, disclosure, and anchor state. The parent stores Option<FrameworkValue> plus remote request identity and results, derives the resting label, consumes typed Selected/Cleared OutMessages, and maps returned Commands.',
    apiHref: 'https://foldkit.dev/ui/combobox',
    composition: 'Parent Model\n├── Combobox child Model (query + disclosure)\n├── selected domain Option\n└── projected domain items\n    ├── unique value\n    ├── display/search label\n    └── optional group / disabled state',
    styling: 'Filtering is derived from the current child input value and item search text. Keep stable unique values separate from localized display labels.',
    accessibility: 'The primitive manages combobox, listbox, active-descendant, disabled/read-only, and option semantics. Supply ariaLabel or ariaLabelledBy, announce loading/no-results beside the control, and use formName when the committed value participates in native submission.',
    keyboard: [['Type', 'Filters the projected item list.'], ['Arrow Up / Down', 'Moves the active option.'], ['Enter', 'Emits Selected and closes the popup.'], ['Escape', 'Closes without replacing the stored domain selection.']],
    examples: [
      { title: 'Framework search', description: 'A typed selection remains parent-owned while the child keeps its transient query and disclosure state.',  code: source('Framework search', false) },
      { title: 'Grouped frameworks', description: 'Searchable groups add view metadata without changing OutMessage handling.',  code: source('Grouped frameworks', true) },
      { title: 'No results', description: 'Remote or local result policy stays in the parent; announce the empty state beside the controlled combobox.', code: source('No results', false) },
      { title: 'Read only RTL', description: 'Expose a committed value for inspection without accepting query or selection changes.', code: source('Read only RTL', false, `isReadOnly: true,
      direction: 'rtl',`) },
    ],
  },
});

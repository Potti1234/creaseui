import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type SelectItem = Readonly<{
  value: string;
  label: string;
  group?: string;
  isDisabled?: boolean;
}>;

export type SelectFixture = Readonly<{
  title: string;
  description?: string;
  heroOnly?: boolean;
  kind: 'basic' | 'invalid';
  placeholder: string;
  items: ReadonlyArray<SelectItem>;
  groups: boolean;
  triggerClass?: string;
  triggerWidthStylex?: string;
  isDisabled?: boolean;
  rtl?: boolean;
}>;

export const fruitItems: ReadonlyArray<SelectItem> = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'blueberry', label: 'Blueberry', group: 'Fruits' },
  { value: 'grapes', label: 'Grapes', group: 'Fruits' },
  { value: 'pineapple', label: 'Pineapple', group: 'Fruits' },
];

const groupedItems: ReadonlyArray<SelectItem> = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'blueberry', label: 'Blueberry', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
  { value: 'broccoli', label: 'Broccoli', group: 'Vegetables' },
  { value: 'spinach', label: 'Spinach', group: 'Vegetables' },
];

const tz = (group: string, items: ReadonlyArray<readonly [string, string]>): ReadonlyArray<SelectItem> =>
  items.map(([value, label]) => ({ value, label, group }));

export const timezoneItems: ReadonlyArray<SelectItem> = [
  ...tz('North America', [
    ['est', 'Eastern Standard Time'],
    ['cst', 'Central Standard Time'],
    ['mst', 'Mountain Standard Time'],
    ['pst', 'Pacific Standard Time'],
    ['akst', 'Alaska Standard Time'],
    ['hst', 'Hawaii Standard Time'],
  ]),
  ...tz('Europe & Africa', [
    ['gmt', 'Greenwich Mean Time'],
    ['cet', 'Central European Time'],
    ['eet', 'Eastern European Time'],
    ['west', 'Western European Summer Time'],
    ['cat', 'Central Africa Time'],
    ['eat', 'East Africa Time'],
  ]),
  ...tz('Asia', [
    ['msk', 'Moscow Time'],
    ['ist', 'India Standard Time'],
    ['cst_china', 'China Standard Time'],
    ['jst', 'Japan Standard Time'],
    ['kst', 'Korea Standard Time'],
    ['ist_indonesia', 'Indonesia Central Standard Time'],
  ]),
  ...tz('Australia & Pacific', [
    ['awst', 'Australian Western Standard Time'],
    ['acst', 'Australian Central Standard Time'],
    ['aest', 'Australian Eastern Standard Time'],
    ['nzst', 'New Zealand Standard Time'],
    ['fjt', 'Fiji Time'],
  ]),
  ...tz('South America', [
    ['art', 'Argentina Time'],
    ['bot', 'Bolivia Time'],
    ['brt', 'Brasilia Time'],
    ['clt', 'Chile Standard Time'],
  ]),
];

const rtlItems: ReadonlyArray<SelectItem> = [
  { value: 'apple', label: 'تفاح', group: 'الفواكه' },
  { value: 'banana', label: 'موز', group: 'الفواكه' },
  { value: 'blueberry', label: 'توت أزرق', group: 'الفواكه' },
  { value: 'grapes', label: 'عنب', group: 'الفواكه' },
  { value: 'pineapple', label: 'أناناس', group: 'الفواكه' },
  { value: 'carrot', label: 'جزر', group: 'الخضروات' },
  { value: 'broccoli', label: 'بروكلي', group: 'الخضروات' },
  { value: 'spinach', label: 'سبانخ', group: 'الخضروات' },
];

const wide = 'w-full max-w-48';

export const selectFixtures: ReadonlyArray<SelectFixture> = [
  {
    title: 'Basic',
    heroOnly: true,
    kind: 'basic',
    placeholder: 'Select a fruit',
    items: fruitItems,
    groups: true,
    triggerClass: wide,
    triggerWidthStylex: 'triggerWide',
  },
  {
    title: 'Groups',
    description: 'Group related options under headings separated by a divider.',
    kind: 'basic',
    placeholder: 'Select a fruit',
    items: groupedItems,
    groups: true,
    triggerClass: wide,
    triggerWidthStylex: 'triggerWide',
  },
  {
    title: 'Scrollable',
    description: 'Long option lists stay inside a scrollable popup.',
    kind: 'basic',
    placeholder: 'Select a timezone',
    items: timezoneItems,
    groups: true,
    triggerClass: 'w-full max-w-64',
    triggerWidthStylex: 'triggerWider',
  },
  {
    title: 'Disabled',
    description: 'Disable the whole control or individual options.',
    kind: 'basic',
    placeholder: 'Select a fruit',
    items: fruitItems.map(item =>
      item.value === 'grapes' ? { ...item, isDisabled: true } : item),
    groups: true,
    triggerClass: wide,
    triggerWidthStylex: 'triggerWide',
    isDisabled: true,
  },
  {
    title: 'Invalid',
    description: 'Pair the select with a field error for validation states.',
    kind: 'invalid',
    placeholder: 'Select a fruit',
    items: [
      { value: 'apple', label: 'Apple', group: 'Fruits' },
      { value: 'banana', label: 'Banana', group: 'Fruits' },
      { value: 'blueberry', label: 'Blueberry', group: 'Fruits' },
    ],
    groups: true,
    triggerClass: wide,
    triggerWidthStylex: 'triggerWide',
  },
  {
    title: 'RTL',
    description: 'Label, trigger and popup mirror in right-to-left layouts.',
    kind: 'basic',
    placeholder: 'اختر فاكهة',
    items: rtlItems,
    groups: true,
    triggerClass: 'w-32',
    triggerWidthStylex: 'triggerSmall',
    rtl: true,
  },
];

const itemsSource = (items: ReadonlyArray<SelectItem>): string =>
  `const items: ReadonlyArray<{
  value: string;
  label: string;
  group?: string;
  isDisabled?: boolean;
}> = [
${items
  .map(
    item =>
      `  { value: '${item.value}', label: '${item.label}'${item.group === undefined ? '' : `, group: '${item.group}'`}${item.isDisabled === true ? ', isDisabled: true' : ''} }`,
  )
  .join(',\n')},
] as const`;

const emitSource = (
  fixture: SelectFixture,
  isStyleX: boolean,
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const lib = isStyleX ? 'stylex' : 'ui';
  const selectCall = `ExampleSelect.select({
    model: model.select,
    maybeSelectedValue: model.maybeSelected,
    toParentMessage: message => GotSelectMessage({ message }),
    ariaLabel: 'Example select',
    placeholder: '${fixture.placeholder}',
    items: items,
    itemToValue: item => item.value,
    itemToLabel: item => item.label,
    itemToConfig: item => ({
      isDisabled: item.isDisabled ?? false,
    }),${fixture.groups ? `
    itemGroupKey: item => item.group ?? '',
    groupToHeading: group => group,` : ''}${fixture.isDisabled === true ? `
    isDisabled: true,` : ''}${fixture.kind === 'invalid' ? `
    isInvalid: true,` : ''}${fixture.rtl === true ? `
    direction: 'rtl',` : ''}
    ${isStyleX ? `triggerLayoutStyle: styles.${fixture.triggerWidthStylex ?? 'triggerWide'},` : `triggerClass: '${fixture.triggerClass ?? wide}',`}
  }, h)`;
  const body = fixture.kind === 'invalid'
    ? `    Field.field({
      isInvalid: true,
      children: [
        Field.fieldLabel({ children: ['Fruit'] }, h),
        ${selectCall},
        Field.fieldError({ children: ['Please select a fruit.'] }, h),
      ],
    }, h)`
    : `    ${selectCall}`;
  return foldkitApplication({
    title: `Select — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${isStyleX ? `import * as stylex from '@stylexjs/stylex'
` : ''}import * as Select from '@/${lib}/select'${fixture.kind === 'invalid' ? `
import * as Field from '@/${lib}/field'` : ''}
${itemsSource(fixture.items)}
${isStyleX ? `const styles = stylex.create({
  triggerWide: { width: '100%', maxWidth: '12rem' },
  triggerWider: { width: '100%', maxWidth: '16rem' },
  triggerSmall: { width: '8rem' },
})
` : ''}`,
    model: `const ExampleSelect = Select.create<string>()
export const Model = S.Struct({
  select: Select.Model,
  maybeSelected: S.Option(S.String),
})
export type Model = typeof Model.Type`,
    messages: `export const GotSelectMessage = taggedStruct('GotSelectMessage${tag}', {
  message: Select.Message,
})
export const Message = S.Union([GotSelectMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    select: Select.init({ id: 'select-${tag}' }),
    maybeSelected: Option.none(),
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotSelectMessage${tag}': {
      const next = ExampleSelect.update(model.select, message.message)
      const commands = next.commands ?? []
      return {
        model: {
          ...model,
          select: next.model,
          maybeSelected: Option.match(Option.fromNullishOr(next.outMessage), {
            onNone: () => model.maybeSelected,
            onSome: selection =>
              selection._tag === 'Selected'
                ? Option.some(selection.value)
                : Option.none(),
          }),
        },
        commands: Command.mapMessages(commands, next =>
          GotSelectMessage({ message: next })),
      }
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Select — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
${body},
  ]),
})`,
  });
};

export const selectExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  selectFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.description === undefined ? {} : { description: fixture.description }),
    heroOnly: fixture.heroOnly,
    code: emitSource(fixture, renderer === 'stylex'),
  }));

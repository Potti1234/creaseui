import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type ComboboxFixture = Readonly<{
  title: string;
  description?: string;
  heroOnly?: boolean;
  kind: 'frameworks' | 'clear' | 'groups' | 'custom' | 'rtl';
  isInvalid?: boolean;
  isDisabled?: boolean;
}>;

export const comboboxFixtures: ReadonlyArray<ComboboxFixture> = [
  { title: 'Demo', heroOnly: true, kind: 'frameworks' },
  { title: 'Basic', kind: 'frameworks' },
  { title: 'Clear Button', kind: 'clear', description: 'A ghost clear button routes a synthesized UpdatedInputValue through the child update and clears the owned selection.' },
  { title: 'Groups', kind: 'groups', description: 'itemGroupKey plus groupToHeading render labeled, separated option groups.' },
  { title: 'Custom Items', kind: 'custom', description: 'itemToConfig content composes rich option rows without changing selection semantics.' },
  { title: 'Invalid', kind: 'frameworks', isInvalid: true, description: 'aria-invalid styling marks the input and wrapper.' },
  { title: 'Disabled', kind: 'frameworks', isDisabled: true, description: 'The disabled state keeps the model intact while removing interaction.' },
  { title: 'Input Group', kind: 'groups', description: 'The grouped timezone list composes inside an input-group layout.' },
  { title: 'RTL', kind: 'rtl', description: 'direction rtl mirrors the input, list, and item layout for Arabic copy.' },
];

export const comboboxFrameworks = [
  { value: 'nextjs', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
] as const;

export const comboboxTimezones = [
  { value: 'new-york', label: '(GMT-5) New York', group: 'Americas' },
  { value: 'los-angeles', label: '(GMT-8) Los Angeles', group: 'Americas' },
  { value: 'chicago', label: '(GMT-6) Chicago', group: 'Americas' },
  { value: 'toronto', label: '(GMT-5) Toronto', group: 'Americas' },
  { value: 'vancouver', label: '(GMT-8) Vancouver', group: 'Americas' },
  { value: 'sao-paulo', label: '(GMT-3) São Paulo', group: 'Americas' },
  { value: 'london', label: '(GMT+0) London', group: 'Europe' },
  { value: 'paris', label: '(GMT+1) Paris', group: 'Europe' },
  { value: 'berlin', label: '(GMT+1) Berlin', group: 'Europe' },
  { value: 'rome', label: '(GMT+1) Rome', group: 'Europe' },
  { value: 'madrid', label: '(GMT+1) Madrid', group: 'Europe' },
  { value: 'amsterdam', label: '(GMT+1) Amsterdam', group: 'Europe' },
  { value: 'tokyo', label: '(GMT+9) Tokyo', group: 'Asia/Pacific' },
  { value: 'shanghai', label: '(GMT+8) Shanghai', group: 'Asia/Pacific' },
  { value: 'singapore', label: '(GMT+8) Singapore', group: 'Asia/Pacific' },
  { value: 'dubai', label: '(GMT+4) Dubai', group: 'Asia/Pacific' },
  { value: 'sydney', label: '(GMT+11) Sydney', group: 'Asia/Pacific' },
  { value: 'seoul', label: '(GMT+9) Seoul', group: 'Asia/Pacific' },
] as const;

export const comboboxCountries = [
  { code: 'ar', value: 'argentina', label: 'Argentina', continent: 'South America' },
  { code: 'au', value: 'australia', label: 'Australia', continent: 'Oceania' },
  { code: 'br', value: 'brazil', label: 'Brazil', continent: 'South America' },
  { code: 'ca', value: 'canada', label: 'Canada', continent: 'North America' },
  { code: 'cn', value: 'china', label: 'China', continent: 'Asia' },
  { code: 'co', value: 'colombia', label: 'Colombia', continent: 'South America' },
  { code: 'eg', value: 'egypt', label: 'Egypt', continent: 'Africa' },
  { code: 'fr', value: 'france', label: 'France', continent: 'Europe' },
  { code: 'de', value: 'germany', label: 'Germany', continent: 'Europe' },
  { code: 'it', value: 'italy', label: 'Italy', continent: 'Europe' },
  { code: 'jp', value: 'japan', label: 'Japan', continent: 'Asia' },
  { code: 'ke', value: 'kenya', label: 'Kenya', continent: 'Africa' },
  { code: 'mx', value: 'mexico', label: 'Mexico', continent: 'North America' },
  { code: 'nz', value: 'new-zealand', label: 'New Zealand', continent: 'Oceania' },
  { code: 'ng', value: 'nigeria', label: 'Nigeria', continent: 'Africa' },
  { code: 'za', value: 'south-africa', label: 'South Africa', continent: 'Africa' },
  { code: 'kr', value: 'south-korea', label: 'South Korea', continent: 'Asia' },
  { code: 'es', value: 'spain', label: 'Spain', continent: 'Europe' },
  { code: 'se', value: 'sweden', label: 'Sweden', continent: 'Europe' },
  { code: 'ch', value: 'switzerland', label: 'Switzerland', continent: 'Europe' },
  { code: 'gb', value: 'united-kingdom', label: 'United Kingdom', continent: 'Europe' },
  { code: 'us', value: 'united-states', label: 'United States', continent: 'North America' },
] as const;

export const comboboxRtlCategories = [
  { value: 'technology', label: 'التكنولوجيا' },
  { value: 'design', label: 'التصميم' },
  { value: 'business', label: 'الأعمال' },
  { value: 'marketing', label: 'التسويق' },
  { value: 'education', label: 'التعليم' },
  { value: 'health', label: 'الصحة' },
] as const;

const itemsCode = (kind: ComboboxFixture['kind']): string => {
  if (kind === 'groups') {
    return `const timezones = [
  { value: 'new-york', label: '(GMT-5) New York', group: 'Americas' },
  { value: 'los-angeles', label: '(GMT-8) Los Angeles', group: 'Americas' },
  { value: 'london', label: '(GMT+0) London', group: 'Europe' },
  { value: 'paris', label: '(GMT+1) Paris', group: 'Europe' },
  { value: 'tokyo', label: '(GMT+9) Tokyo', group: 'Asia/Pacific' },
  { value: 'dubai', label: '(GMT+4) Dubai', group: 'Asia/Pacific' },
]`;
  }
  if (kind === 'custom') {
    return `const countries = [
  { code: 'ar', value: 'argentina', label: 'Argentina', continent: 'South America' },
  { code: 'au', value: 'australia', label: 'Australia', continent: 'Oceania' },
  { code: 'ca', value: 'canada', label: 'Canada', continent: 'North America' },
  { code: 'de', value: 'germany', label: 'Germany', continent: 'Europe' },
  { code: 'jp', value: 'japan', label: 'Japan', continent: 'Asia' },
  { code: 'us', value: 'united-states', label: 'United States', continent: 'North America' },
]`;
  }
  if (kind === 'rtl') {
    return `const categories = [
  { value: 'technology', label: 'التكنولوجيا' },
  { value: 'design', label: 'التصميم' },
  { value: 'business', label: 'الأعمال' },
  { value: 'marketing', label: 'التسويق' },
]`;
  }
  return `const frameworks = [
  { value: 'nextjs', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]`;
};

const itemsExpr = (kind: ComboboxFixture['kind']): string =>
  kind === 'groups'
    ? 'timezones'
    : kind === 'custom'
      ? 'countries'
      : kind === 'rtl'
        ? 'categories'
        : 'frameworks';

const comboboxCall = (fixture: ComboboxFixture): string => {
  const items = itemsExpr(fixture.kind);
  const extra: string[] = [];
  if (fixture.kind === 'groups') {
    extra.push(
      `itemGroupKey: item => item.group,\n        groupToHeading: group => group,`,
    );
  }
  if (fixture.kind === 'custom') {
    extra.push(
      `itemToConfig: item => ({
          content: h.span([h.Class('flex flex-col')], [
            h.span([], [item.label]),
            h.span([h.Class('text-muted-foreground text-xs')], [item.continent]),
          ]),
          searchText: \`\${item.label} \${item.continent}\`,
        }),`,
    );
  }
  if (fixture.isInvalid === true) extra.push('isInvalid: true,');
  if (fixture.isDisabled === true) extra.push('isDisabled: true,');
  if (fixture.kind === 'rtl') {
    extra.push(`direction: 'rtl',`);
  }
  const placeholder =
    fixture.kind === 'groups'
      ? 'Select a timezone'
      : fixture.kind === 'custom'
        ? 'Select country'
        : fixture.kind === 'rtl'
          ? 'أضف فئات'
          : 'Select a framework';
  const aria =
    fixture.kind === 'groups'
      ? 'Timezone'
      : fixture.kind === 'custom'
        ? 'Country'
        : fixture.kind === 'rtl'
          ? 'الفئات'
          : 'Framework';
  return `Combobox.combobox({
        model: model.combobox,
        maybeSelectedValue: model.maybeValue,
        restingInputValue: Option.match(model.maybeValue, { onNone: () => '', onSome: value => ${items}.find(item => item.value === value)?.label ?? value }),
        toParentMessage: message => GotComboboxMessage({ message }),
        items: ${items},
        itemToValue: item => item.value,
        itemToLabel: item => item.label,
        placeholder: '${placeholder}',
        ariaLabel: '${aria}',
        ${extra.join('\n        ')}
      }, h)`;
};

const comboboxSource = (fixture: ComboboxFixture, renderer: 'tailwind' | 'stylex'): string => {
  const dir = renderer === 'stylex' ? 'stylex' : 'ui';
  const isClear = fixture.kind === 'clear';
  const messages = `import { taggedStruct } from 'foldkit/schema'
export const GotComboboxMessage = taggedStruct('GotComboboxMessage', { message: Combobox.Message });${isClear ? "\nexport const ClickedClear = taggedStruct('ClickedClear', {});" : ''}
export const Message = S.Union([GotComboboxMessage${isClear ? ', ClickedClear' : ''}])
export type Message = typeof Message.Type`;
  const update = `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotComboboxMessage': {
      const next = Combobox.update(model.combobox, message.message)
      const maybeOut = Option.fromNullishOr(next.outMessage)
      const maybeValue = Option.match(maybeOut, {
        onNone: () => model.maybeValue,
        onSome: out => out._tag === 'Selected' ? Option.some(out.value) : Option.none(),
      })
      return {
        model: { ...model, combobox: next.model, maybeValue },
        commands: Command.mapMessages(next.commands ?? [], child => GotComboboxMessage({ message: child })),
      }
    }${isClear ? `
    case 'ClickedClear': {
      const next = Combobox.update(model.combobox, Combobox.Message.UpdatedInputValue({ value: '' }))
      return {
        model: { ...model, combobox: next.model, maybeValue: Option.none() },
        commands: Command.mapMessages(next.commands ?? [], child => GotComboboxMessage({ message: child })),
      }
    }` : ''}
  }
}`;
  const view = `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${fixture.title}',
  body: h.main([], [
    h.div([h.Class('flex items-center gap-2')], [
      ${comboboxCall(fixture)},${isClear ? `
      Button.button({
        variant: 'ghost',
        size: 'icon',
        ariaLabel: 'Clear selection',
        onClick: ClickedClear(),
        children: [Icon.icon('x', { class: 'size-4' }, h)],
      }, h),` : ''}
    ]),
  ]),
})`;

  return foldkitApplication({
    title: `Combobox — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'

import * as Combobox from '@/${dir}/combobox'${isClear ? `
import * as Button from '@/${dir}/button'
import * as Icon from '@/lib/icon'` : ''}`,
    model: `export const Model = S.Struct({
  combobox: Combobox.Model,
  maybeValue: S.Option(S.String),
})
export type Model = typeof Model.Type

${itemsCode(fixture.kind)}`,
    messages,
    init: `export const init = (): Update.Return<Model, Message> => {
  const combobox = Combobox.init({ id: 'docs-combobox', isAnimated: true })
  return {
    model: {
      combobox: ${isClear ? "{ ...combobox, inputValue: 'Next.js' }" : 'combobox'},
      maybeValue: ${isClear ? "Option.some('nextjs')" : 'Option.none()'},
    },
  }
}`,
    update,
    view,
  });
};

export const comboboxExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  comboboxFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.description === undefined
      ? {}
      : { description: fixture.description }),
    ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
    code: comboboxSource(fixture, renderer),
  }));

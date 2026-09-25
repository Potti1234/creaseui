import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

export type SheetFieldSpec = Readonly<{
  id: string;
  label: string;
  value: string;
}>;

export type SheetInstance = Readonly<{
  id: string;
  side: SheetSide;
  trigger: string;
  panelTitle: string;
  panelDescription?: string;
  fields?: ReadonlyArray<SheetFieldSpec>;
  loremBody?: boolean;
  footer?: Readonly<{ save: string; cancel: string }>;
  showCloseButton?: boolean;
  rtl?: boolean;
}>;

export type SheetFixture = Readonly<{
  title: string;
  heroOnly?: boolean;
  instances: ReadonlyArray<SheetInstance>;
}>;

const profileFields: ReadonlyArray<SheetFieldSpec> = [
  { id: 'name', label: 'Name', value: 'Pedro Duarte' },
  { id: 'username', label: 'Username', value: '@peduarte' },
];

const profileDescription =
  "Make changes to your profile here. Click save when you're done.";

export const sheetFixtures: Readonly<[SheetFixture, ...Array<SheetFixture>]> = [
  {
    title: 'Basic',
    heroOnly: true,
    instances: [
      {
        id: 'profile',
        side: 'right',
        trigger: 'Open',
        panelTitle: 'Edit profile',
        panelDescription: profileDescription,
        fields: profileFields,
        footer: { save: 'Save changes', cancel: 'Close' },
      },
    ],
  },
  {
    title: 'Side',
    instances: (
      [
        { id: 'top', side: 'top', trigger: 'Top' },
        { id: 'right', side: 'right', trigger: 'Right' },
        { id: 'bottom', side: 'bottom', trigger: 'Bottom' },
        { id: 'left', side: 'left', trigger: 'Left' },
      ] as const
    ).map(
      (base): SheetInstance => ({
        ...base,
        panelTitle: 'Edit profile',
        panelDescription: profileDescription,
        loremBody: true,
        footer: { save: 'Save changes', cancel: 'Cancel' },
      }),
    ),
  },
  {
    title: 'No Close Button',
    instances: [
      {
        id: 'no-close',
        side: 'right',
        trigger: 'Open Sheet',
        panelTitle: 'No Close Button',
        panelDescription:
          "This sheet doesn't have a close button in the top-right corner. Click outside to close.",
        showCloseButton: false,
      },
    ],
  },
  {
    title: 'RTL',
    instances: [
      {
        id: 'rtl',
        side: 'left',
        rtl: true,
        trigger: 'فتح',
        panelTitle: 'تعديل الملف الشخصي',
        panelDescription:
          'قم بإجراء تغييرات على ملفك الشخصي هنا. انقر حفظ عند الانتهاء.',
        fields: [
          { id: 'name', label: 'الاسم', value: 'Pedro Duarte' },
          { id: 'username', label: 'اسم المستخدم', value: '@peduarte' },
        ],
        footer: { save: 'حفظ التغييرات', cancel: 'إغلاق' },
      },
    ],
  },
];

const LOREM_PARAGRAPHS = 10;

const escape = (value: string): string => value.replaceAll(`'`, `\\'`);

const fieldEmit = (field: SheetFieldSpec, isStyleX: boolean): string =>
  `      h.div([h.Class(${isStyleX ? 'className(styles.field)' : "'grid gap-3'"})], [
        Label.label({ for: 'sheet-field-${field.id}', children: ['${escape(field.label)}'] }, h),
        Input.input({
          id: 'sheet-field-${field.id}',
          value: model.values['${field.id}'] ?? '${escape(field.value)}',
          onInput: value => ChangedInput({ id: '${field.id}', value }),
        }, h),
      ])`;

const instanceViewEmit = (instance: SheetInstance, isStyleX: boolean): string => {
  const contentLines: Array<string> = [];
  const fieldsClass = isStyleX ? 'className(styles.fieldsWrap)' : "'grid flex-1 auto-rows-min gap-6 px-4'";
  const loremClass = isStyleX ? 'className(styles.loremWrap)' : "'overflow-y-auto px-4'";
  const paraClass = isStyleX ? 'className(styles.paragraph)' : "'mb-2 leading-relaxed'";
  if (instance.fields !== undefined) {
    contentLines.push(
      `    h.div([h.Class(${fieldsClass})], [
${instance.fields.map(field => fieldEmit(field, isStyleX)).join(',\n')}
    ])`);
  }
  if (instance.loremBody === true) {
    contentLines.push(
      `    h.div([h.Class(${loremClass})], LOREM.map(paragraph =>
      h.p([h.Class(${paraClass})], [paragraph])))`);
  }
  const footerEmit =
    instance.footer === undefined
      ? ''
      : `,
      footer: slots => [
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class(${isStyleX ? 'className(styles.footerSave)' : "'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'"}),
        ], ['${escape(instance.footer.save)}']),
        h.button([
          ...slots.closeButton,
          ...slots.initialFocusAttributes(),
          h.Type('button'),
          h.Class(${isStyleX ? 'className(styles.footerCancel)' : "'rounded-md border px-4 py-2 text-sm'"}),
        ], ['${escape(instance.footer.cancel)}']),
      ]`;
  return `    Sheet.sheet({
      model: model.sheets['${instance.id}'] ?? Sheet.init({ id: 'sheet-${instance.id}', isAnimated: true }),
      toParentMessage: message => GotSheetMessage({ id: '${instance.id}', message }),
      side: '${instance.side}',
      title: '${escape(instance.panelTitle)}',${instance.panelDescription === undefined ? '' : `
      description: '${escape(instance.panelDescription)}',`}${instance.showCloseButton === false ? `
      showCloseButton: false,` : ''}${instance.rtl === true ? `
      direction: 'rtl',` : ''}${contentLines.length === 0 ? '' : `
      content: () => [
${contentLines.join(',\n')}
      ]`}${footerEmit}
    }, h)`;
};

const emitSource = (fixture: SheetFixture, isStyleX: boolean): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const lib = isStyleX ? 'stylex' : 'ui';
  const usesInput = fixture.instances.some(instance => instance.fields !== undefined);
  const usesLorem = fixture.instances.some(instance => instance.loremBody === true);
  const allFields = fixture.instances.flatMap(instance => instance.fields ?? []);
  const fieldInit = allFields
    .map(field => `      '${field.id}': '${escape(field.value)}',`)
    .join('\n');
  return foldkitApplication({
    title: `Sheet — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'

${isStyleX ? `import * as stylex from '@stylexjs/stylex'
import { className } from '@/stylex/style'
` : ''}import * as Button from '@/${lib}/button'${usesInput ? `
import * as Input from '@/${lib}/input'
import * as Label from '@/${lib}/label'` : ''}
import * as Sheet from '@/${lib}/sheet'${isStyleX ? `

const styles = stylex.create({
  fieldsWrap: { display: 'grid', flexGrow: 1, gridAutoRows: 'min-content', gap: '1.5rem', paddingInline: '1rem' },
  field: { display: 'grid', gap: '0.75rem' },
  loremWrap: { overflowY: 'auto', paddingInline: '1rem' },
  paragraph: { marginBottom: '0.5rem', lineHeight: 1.625 },
  footerSave: { borderRadius: '0.375rem', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },
  footerCancel: { borderRadius: '0.375rem', borderColor: 'var(--border)', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },
})` : ''}${usesLorem ? `

const LOREM: ReadonlyArray<string> = Array.from({ length: ${LOREM_PARAGRAPHS} }, () =>
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')` : ''}`,
    model: `export const Model = S.Struct({
  sheets: S.Record(S.String, Sheet.Model),${usesInput ? `
  values: S.Record(S.String, S.String),` : ''}
})
export type Model = typeof Model.Type`,
    messages: `export const ClickedOpen = taggedStruct('ClickedOpenSheet${tag}', {
  id: S.String,
})
${usesInput ? `export const ChangedInput = taggedStruct('ChangedInputSheet${tag}', {
  id: S.String,
  value: S.String,
})` : ''}
export const GotSheetMessage = taggedStruct('GotSheetMessage${tag}', {
  id: S.String,
  message: Sheet.Message,
})
export const Message = S.Union(${usesInput ? '[ClickedOpen, ChangedInput, GotSheetMessage]' : '[ClickedOpen, GotSheetMessage]'})
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    sheets: {
${fixture.instances.map(instance => `      '${instance.id}': Sheet.init({ id: 'sheet-${instance.id}', isAnimated: true }),`).join('\n')}
    },${usesInput ? `
    values: {
${fieldInit}
    },` : ''}
  },
})`,
    update: `const mapSheet = (
  model: Model,
  id: string,
  result: ReturnType<typeof Sheet.update>,
): Update.Return<Model, Message> => {
  const commands = result.commands ?? []
  return {
    model: {
      ...model,
      sheets: { ...model.sheets, [id]: result.model },
    },
    commands: Command.mapMessages(commands, next =>
      GotSheetMessage({ id, message: next })),
  }
}

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ClickedOpenSheet${tag}': {
      const sheet = model.sheets[message.id]
      if (sheet === undefined) {
        return { model }
      }
      return mapSheet(model, message.id, Sheet.open(sheet))
    }
${usesInput ? `    case 'ChangedInputSheet${tag}':
      return {
        model: {
          ...model,
          values: { ...model.values, [message.id]: message.value },
        },
      }
` : ''}    case 'GotSheetMessage${tag}': {
      const sheet = model.sheets[message.id]
      if (sheet === undefined) {
        return { model }
      }
      return mapSheet(model, message.id, Sheet.update(sheet, message.message))
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Sheet — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    h.div([h.Class('flex flex-wrap gap-2')], [
${fixture.instances
  .map(
    instance => `      Button.button({
        variant: 'outline',
        onClick: ClickedOpen({ id: '${instance.id}' }),
        children: ['${escape(instance.trigger)}'],
      }, h),`,
  )
  .join('\n')}
    ]),
${fixture.instances.map(instance => instanceViewEmit(instance, isStyleX)).join(',\n')}
  ]),
})`,
  });
};

export const sheetExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  sheetFixtures.map(fixture => ({
    title: fixture.title,
    ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
    code: emitSource(fixture, renderer === 'stylex'),
  }));

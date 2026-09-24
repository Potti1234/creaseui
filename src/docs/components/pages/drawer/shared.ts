import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type DrawerKind = 'goal' | 'side' | 'scroll' | 'sides' | 'responsive' | 'rtl';
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

export type DrawerFixture = Readonly<{
  title: string;
  description?: string;
  heroOnly?: boolean;
  kind: DrawerKind;
  triggerLabel: string;
}>;

export const drawerFixtures: ReadonlyArray<DrawerFixture> = [
  {
    title: 'Activity goal',
    heroOnly: true,
    kind: 'goal',
    triggerLabel: 'Open Drawer',
  },
  {
    title: 'Side drawer',
    description: 'The same child integration can present a compact task from the right edge.',
    kind: 'side',
    triggerLabel: 'Open right drawer',
  },
  {
    title: 'Scrollable Content',
    description: 'Long copy scrolls inside a right-hand drawer while the footer stays put.',
    kind: 'scroll',
    triggerLabel: 'Scrollable Content',
  },
  {
    title: 'Sides',
    description: 'One drawer model plus a direction field opens from any of the four edges.',
    kind: 'sides',
    triggerLabel: 'Sides',
  },
  {
    title: 'Responsive Dialog',
    description: 'matchMedia chooses Dialog on desktop and Drawer on smaller viewports.',
    kind: 'responsive',
    triggerLabel: 'Edit Profile',
  },
  {
    title: 'RTL',
    description: 'A dir="rtl" content wrapper mirrors the counter controls and labels.',
    kind: 'rtl',
    triggerLabel: 'افتح الدرج',
  },
];

export const drawerSides: ReadonlyArray<DrawerSide> = ['top', 'right', 'bottom', 'left'];

export const drawerLorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export const drawerGoalData = [350, 350, 350, 350, 350, 350, 350] as const;

export const drawerRtlCopy = {
  title: 'تحديد الهدف',
  description: 'حدد هدفك من النشاط اليومي.',
  calories: 'سعرة حرارية في اليوم',
  decrease: 'تقليل',
  increase: 'زيادة',
  submit: 'إرسال',
  cancel: 'إلغاء',
} as const;

const emitStyles = `const styles = stylex.create({
  body: { paddingInline: '1rem', paddingBlockEnd: '1.5rem', textAlign: 'center' },
  value: { fontSize: '3rem', fontWeight: 700, lineHeight: 1 },
  label: { color: 'var(--muted-foreground)', fontSize: '0.875rem' },
  action: { backgroundColor: 'var(--primary)', borderRadius: '0.375rem', color: 'var(--primary-foreground)', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },
  cancel: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },
  scrollBody: { overflowY: 'auto', paddingInline: '1rem' },
  lorem: { lineHeight: 'normal', marginBlockEnd: '1rem' },
  triggerRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  counterRow: { alignItems: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' },
  roundButton: { alignItems: 'center', borderColor: 'var(--border)', borderRadius: '9999px', borderStyle: 'solid', borderWidth: '1px', display: 'flex', flexShrink: 0, height: '2rem', justifyContent: 'center', width: '2rem' },
  counterValue: { fontSize: '4.5rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1 },
  counterLabel: { color: 'var(--muted-foreground)', fontSize: '0.7rem', textTransform: 'uppercase' },
  rtlWrap: { marginInline: 'auto', maxWidth: '24rem', width: '100%' },
  chartBox: { height: '7.5rem', marginBlockStart: '0.75rem' },
  counterFlex: { flex: '1 1 0%', textAlign: 'center' },
  fieldGrid: { display: 'grid', gap: '1rem', paddingInline: '1rem' },
  compact: { maxWidth: '24rem' },
})`;

const sq = (value: string): string => value.replaceAll("'", "\\'");

const emitContent = (fixture: DrawerFixture, isStyleX: boolean): string => {
  const cls = (tailwind: string, stylexRef: string) =>
    isStyleX ? `className(${stylexRef})` : `'${tailwind}'`;
  switch (fixture.kind) {
    case 'goal':
    case 'side':
      return `content: () => [
        h.div([h.Class(${cls('px-4 pb-6 text-center', 'styles.body')})], [
          h.p([h.Class(${cls('text-5xl font-bold tabular-nums', 'styles.value')})], ['350']),
          h.p([h.Class(${cls('text-sm text-muted-foreground', 'styles.label')})], ['Calories per day']),
        ]),
      ],`;
    case 'scroll':
    case 'sides':
      return `content: () => [
        h.div(
          [h.Class(${cls('overflow-y-auto px-4', 'styles.scrollBody')})],
          Array.from({ length: 10 }).map((_, index) =>
            h.p([h.Key(String(index)), h.Class(${cls('mb-4 leading-normal', 'styles.lorem')})], [
              '${drawerLorem}',
            ]),
          ),
        ),
      ],`;
    case 'responsive':
      return `content: () => [
        Field.fieldGroup({ children: [
          Field.field({ children: [
            Field.fieldLabel({ for: 'name-1', children: ['Name'] }, h),
            Input.input({ id: 'name-1', value: model.name, onInput: value => ChangedName({ value }) }, h),
          ] }, h),
          Field.field({ children: [
            Field.fieldLabel({ for: 'username-1', children: ['Username'] }, h),
            Input.input({ id: 'username-1', value: model.username, onInput: value => ChangedUsername({ value }) }, h),
          ] }, h),
        ] }, h),
      ],`;
    case 'rtl':
      return `content: () => [
        h.div([h.Dir('rtl'), h.Class(${cls('mx-auto w-full max-w-sm', 'styles.rtlWrap')})], [
          h.div([h.Class(${cls('p-4 pb-0', 'styles.fieldGrid')})], [
            h.div([h.Class(${cls('flex items-center justify-center space-x-2', 'styles.counterRow')})], [
              h.button([
                h.Type('button'),
                h.OnClick(AdjustedGoal({ delta: -10 })),
                h.Disabled(model.goal <= 200),
                h.AriaLabel('${drawerRtlCopy.decrease}'),
                h.Class(${cls('h-8 w-8 shrink-0 rounded-full border', 'styles.roundButton')}),
              ], ['−']),
              h.div([h.Class(${cls('flex-1 text-center', 'styles.counterFlex')})], [
                h.p([h.Class(${cls('text-7xl font-bold tracking-tighter', 'styles.counterValue')})], [String(model.goal)]),
                h.p([h.Class(${cls('text-[0.70rem] uppercase text-muted-foreground', 'styles.counterLabel')})], ['${drawerRtlCopy.calories}']),
              ]),
              h.button([
                h.Type('button'),
                h.OnClick(AdjustedGoal({ delta: 10 })),
                h.Disabled(model.goal >= 400),
                h.AriaLabel('${drawerRtlCopy.increase}'),
                h.Class(${cls('h-8 w-8 shrink-0 rounded-full border', 'styles.roundButton')}),
              ], ['+']),
            ]),
            h.div([h.Class(${cls('mt-3 h-30', 'styles.chartBox')})], [
              Chart.chart({
                accessibleAlternative: h.p([], ['Bar chart of daily activity goals.']),
                ariaLabel: 'Activity goal chart',
                hostId: 'drawer-rtl-chart',
                toMessage: (message: Chart.ChartMessage) => message,
              }, h),
            ]),
          ]),
        ]),
      ],`;
  }
};

const emitFooter = (fixture: DrawerFixture, isStyleX: boolean): string => {
  const cls = (tailwind: string, stylexRef: string) =>
    isStyleX ? `className(${stylexRef})` : `'${tailwind}'`;
  const outline = (label: string, initialFocus = false) =>
    `h.button([...slots.closeButton, ${initialFocus ? '...slots.initialFocusAttributes(), ' : ''}h.Type('button'), h.Class(${cls('rounded-md border px-4 py-2 text-sm', 'styles.cancel')})], ['${label}'])`;
  const primary = (label: string) =>
    `h.button([...slots.closeButton, h.Type('button'), h.Class(${cls('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground', 'styles.action')})], ['${label}'])`;
  switch (fixture.kind) {
    case 'goal':
    case 'side':
      return `footer: slots => [
        ${primary('Save goal')},
        ${outline('Cancel')},
      ],`;
    case 'scroll':
    case 'sides':
      return `footer: slots => [
        ${primary('Submit')},
        ${outline('Cancel')},
      ],`;
    case 'rtl':
      return `footer: slots => [
        ${primary(drawerRtlCopyEmit.submit)},
        ${outline(drawerRtlCopyEmit.cancel)},
      ],`;
    case 'responsive':
      return `footer: slots => [${outline('Cancel')}],`;
  }
};

const drawerRtlCopyEmit = { submit: 'إرسال', cancel: 'إلغاء' } as const;

const drawerInitExtra = (fixture: DrawerFixture): string => {
  switch (fixture.kind) {
    case 'sides':
      return ", side: 'bottom'";
    case 'responsive':
      return ", dialog: Dialog.init({ id: 'responsive-dialog', isAnimated: true }), isDesktop: window.matchMedia('(min-width: 768px)').matches, name: 'Pedro Duarte', username: '@peduarte'";
    case 'rtl':
      return ', goal: 350';
    default:
      return '';
  }
};

const drawerModelFields = (fixture: DrawerFixture): string => {
  switch (fixture.kind) {
    case 'sides':
      return ", side: S.Literals(['top', 'right', 'bottom', 'left'])";
    case 'responsive':
      return ', dialog: Dialog.Model, isDesktop: S.Boolean, name: S.String, username: S.String';
    case 'rtl':
      return ', goal: S.Number';
    default:
      return '';
  }
};

const drawerExtraMessages = (fixture: DrawerFixture, tag: string): string => {
  switch (fixture.kind) {
    case 'sides':
      return `\nexport const ClickedOpenSide = taggedStruct('ClickedOpenSide${tag}', { side: S.Literals(['top', 'right', 'bottom', 'left']) });`;
    case 'responsive':
      return `\nexport const ChangedViewport = taggedStruct('ChangedViewport${tag}', { isDesktop: S.Boolean });
export const ChangedName = taggedStruct('ChangedName${tag}', { value: S.String });
export const ChangedUsername = taggedStruct('ChangedUsername${tag}', { value: S.String });
export const GotDialogMessage = taggedStruct('GotDialogMessage${tag}', { message: Dialog.Message });`;
    case 'rtl':
      return `\nexport const AdjustedGoal = taggedStruct('AdjustedGoal${tag}', { delta: S.Number });`;
    default:
      return '';
  }
};

const drawerUnionExtras = (fixture: DrawerFixture): string => {
  switch (fixture.kind) {
    case 'sides':
      return ', ClickedOpenSide';
    case 'responsive':
      return ', GotDialogMessage, ChangedViewport, ChangedName, ChangedUsername';
    case 'rtl':
      return ', AdjustedGoal';
    default:
      return '';
  }
};

const drawerUpdateCases = (fixture: DrawerFixture, tag: string): string => {
  switch (fixture.kind) {
    case 'responsive':
      return `    case 'GotDialogMessage${tag}':
      return mapDialog(model, Dialog.update(model.dialog, message.message))
    case 'ChangedViewport${tag}':
      return { model: { ...model, isDesktop: message.isDesktop } }
    case 'ChangedName${tag}':
      return { model: { ...model, name: message.value } }
    case 'ChangedUsername${tag}':
      return { model: { ...model, username: message.value } }`;
    case 'rtl':
      return `    case 'AdjustedGoal${tag}':
      return { model: { ...model, goal: Math.max(200, Math.min(400, model.goal + message.delta)) } }`;
    default:
      return '';
  }
};

const emitImports = (fixture: DrawerFixture, isStyleX: boolean): string => {
  const extra = [
    fixture.kind === 'responsive'
      ? `import * as Dialog from '@/${isStyleX ? 'stylex' : 'ui'}/dialog'\nimport * as Field from '@/${isStyleX ? 'stylex' : 'ui'}/field'\nimport * as Input from '@/${isStyleX ? 'stylex' : 'ui'}/input'`
      : '',
    fixture.kind === 'rtl' ? "import * as Chart from '@/lib/echarts'" : '',
  ]
    .filter(Boolean)
    .join('\n');
  return `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\nimport { className } from '@/stylex/style'\n" : ''}
import * as Button from '@/${isStyleX ? 'stylex' : 'ui'}/button'
import * as Drawer from '@/${isStyleX ? 'stylex' : 'ui'}/drawer'${extra === '' ? '' : `\n${extra}`}${isStyleX ? `\n\n${emitStyles}` : ''}`;
};

const emitSubscriptions = (fixture: DrawerFixture, isStyleX: boolean): string | undefined => {
  if (fixture.kind === 'responsive') {
    return `export const subscriptions = Subscription.make<Model, Message>()(() => ({
  viewport: Subscription.persistent(Subscription.fromEvent({
    target: () => window,
    type: 'resize',
    mapEvent: () => ChangedViewport({ isDesktop: window.matchMedia('(min-width: 768px)').matches }),
  })),
}))`;
  }
  return undefined;
};

const emitView = (fixture: DrawerFixture, isStyleX: boolean): string => {
  const cls = (tailwind: string, stylexRef: string) =>
    isStyleX ? `className(${stylexRef})` : `'${tailwind}'`;
  switch (fixture.kind) {
    case 'goal':
    case 'side':
    case 'scroll':
      return `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Drawer — ${sq(fixture.title)}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpenDrawer(), children: ['${sq(fixture.triggerLabel)}'] }, h),
    Drawer.drawer({
      model: model.drawer,
      toParentMessage: message => GotDrawerMessage({ message }),
      direction: '${fixture.kind === 'side' || fixture.kind === 'scroll' ? 'right' : 'bottom'}',
      title: 'Move goal',
      description: 'Set your daily activity goal.',
      ${emitContent(fixture, isStyleX)}
      ${emitFooter(fixture, isStyleX)}
    }, h),
  ]),
})`;
    case 'sides':
      return `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Drawer — ${sq(fixture.title)}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    h.div([h.Class(${cls('flex flex-wrap gap-2', 'styles.triggerRow')})],
      (['top', 'right', 'bottom', 'left'] as const).map(side =>
        Button.button({ variant: 'outline', onClick: ClickedOpenSide({ side }), children: [side] }, h),
      ),
    ),
    Drawer.drawer({
      model: model.drawer,
      toParentMessage: message => GotDrawerMessage({ message }),
      direction: model.side,
      title: 'Move Goal',
      description: 'Set your daily activity goal.',
      ${emitContent(fixture, isStyleX)}
      ${emitFooter(fixture, isStyleX)}
    }, h),
  ]),
})`;
    case 'responsive':
      return `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Drawer — ${sq(fixture.title)}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpenResponsive(), children: ['${sq(fixture.triggerLabel)}'] }, h),
    Dialog.dialog({
      model: model.dialog,
      toParentMessage: message => GotDialogMessage({ message }),
      title: 'Edit profile',
      description: 'Make changes to your profile here. Click save when you\\'re done.',
      ${isStyleX ? "layoutStyle: styles.compact," : "class: 'sm:max-w-sm',"}
      ${emitContent(fixture, isStyleX)}
    }, h),
    Drawer.drawer({
      model: model.drawer,
      toParentMessage: message => GotDrawerMessage({ message }),
      title: 'Edit profile',
      description: 'Make changes to your profile here. Click save when you\\'re done.',
      ${emitContent(fixture, isStyleX)}
      ${emitFooter(fixture, isStyleX)}
    }, h),
  ]),
})`;
    case 'rtl':
      return `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Drawer — ${sq(fixture.title)}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpenDrawer(), children: ['${sq(fixture.triggerLabel)}'] }, h),
    Drawer.drawer({
      model: model.drawer,
      toParentMessage: message => GotDrawerMessage({ message }),
      title: '${drawerRtlCopy.title}',
      description: '${drawerRtlCopy.description}',
      ${emitContent(fixture, isStyleX)}
      ${emitFooter(fixture, isStyleX)}
    }, h),
  ]),
})`;
  }
};

const source = (
  fixture: DrawerFixture,
  _index: number,
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  const openCase =
    fixture.kind === 'responsive'
      ? 'ClickedOpenResponsive'
      : fixture.kind === 'sides'
        ? 'ClickedOpenSide'
        : 'ClickedOpenDrawer';
  return foldkitApplication({
    title: `Drawer — ${fixture.title}`,
    imports: emitImports(fixture, isStyleX),
    model: `export const Model = S.Struct({ drawer: Drawer.Model${drawerModelFields(fixture)} })
export type Model = typeof Model.Type`,
    messages: `import { taggedStruct } from 'foldkit/schema'
${fixture.kind === 'sides' ? '' : `export const ${openCase} = taggedStruct('${openCase}${tag}');\n`}export const GotDrawerMessage = taggedStruct('GotDrawerMessage${tag}', { message: Drawer.Message });${drawerExtraMessages(fixture, tag)}
export const Message = S.Union([${openCase}, GotDrawerMessage${drawerUnionExtras(fixture)}${fixture.kind === 'rtl' ? ', Chart.ChartMessage' : ''}])
export type Message = typeof Message.Type`,
    init: fixture.kind === 'rtl'
      ? `export const init = (): Update.Return<Model, Message> => {
  Chart.registerChart('drawer-rtl-chart', theme => ({
    grid: Chart.compactGrid(),
    series: [{ data: [350, 350, 350, 350, 350, 350, 350], itemStyle: { color: theme.chart2 }, name: 'Goal', type: 'bar' }],
    tooltip: Chart.shadcnTooltip(theme),
    xAxis: { ...Chart.categoryAxis(theme, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], { boundaryGap: true }), inverse: true },
    yAxis: Chart.valueAxis(theme, { showLabels: false }),
  }))
  return { model: { drawer: Drawer.init({ id: 'drawer-${tag.toLowerCase()}', isAnimated: true }), goal: 350 } }
}`
      : `export const init = (): Update.Return<Model, Message> => ({ model: { drawer: Drawer.init({ id: 'drawer-${tag.toLowerCase()}', isAnimated: true })${drawerInitExtra(fixture)} } })`,
    update: `const mapDrawer = (
  model: Model,
  result: ReturnType<typeof Drawer.update>,
): Update.Return<Model, Message> => {
  return { model: { ...model, drawer: result.model }, commands: Command.mapMessages(result.commands, next => GotDrawerMessage({ message: next })) }
}${fixture.kind === 'responsive' ? `

const mapDialog = (
  model: Model,
  result: ReturnType<typeof Dialog.update>,
): Update.Return<Model, Message> => {
  return { model: { ...model, dialog: result.model }, commands: Command.mapMessages(result.commands, next => GotDialogMessage({ message: next })) }
}` : ''}

export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case '${openCase}${tag}':${fixture.kind === 'sides' ? `
      return mapDrawer({ ...model, side: message.side }, Drawer.open(model.drawer))` : fixture.kind === 'responsive' ? `
      return model.isDesktop
        ? mapDialog(model, Dialog.open(model.dialog))
        : mapDrawer(model, Drawer.open(model.drawer))` : `
      return mapDrawer(model, Drawer.open(model.drawer))`}
    case 'GotDrawerMessage${tag}':
      return mapDrawer(model, Drawer.update(model.drawer, message.message))${drawerUpdateCases(fixture, tag) === '' ? '' : `\n${drawerUpdateCases(fixture, tag)}`}${fixture.kind === 'rtl' ? `
    case 'CompletedSyncChart':
    case 'ChartMounted':
    case 'ChartMountFailed':
      return { model }` : ''}
  }
}`,
    ...(() => {
      const emitted = emitSubscriptions(fixture, isStyleX);
      return emitted === undefined ? {} : { subscriptions: emitted };
    })(),
    view: emitView(fixture, isStyleX),
  });
};

export const drawerExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => drawerFixtures.map((fixture, index) => ({
  title: fixture.title,
  ...(fixture.description === undefined ? {} : { description: fixture.description }),
  ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
  code: source(fixture, index, renderer),
}));

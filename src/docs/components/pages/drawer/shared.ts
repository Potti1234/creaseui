import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type DrawerDirection = 'bottom' | 'right';

export const drawerFixtures = [
  {
    title: 'Activity goal',
    description: 'A complete bottom drawer with content, footer controls, and swipe-to-dismiss state.',
    direction: 'bottom',
  },
  {
    title: 'Side drawer',
    description: 'The same child integration can present a compact task from the right edge.',
    direction: 'right',
  },
] as const satisfies ReadonlyArray<{
  title: string;
  description: string;
  direction: DrawerDirection;
}>;

const source = (
  fixture: (typeof drawerFixtures)[number],
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Drawer — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\n" : ''}
import * as Button from '@/${isStyleX ? 'stylex' : 'ui'}/button'
import * as Drawer from '@/${isStyleX ? 'stylex' : 'ui'}/drawer'${isStyleX ? "\n\nconst styles = stylex.create({\n  content: { paddingInline: '1rem', paddingBottom: '1.5rem', textAlign: 'center' },\n  value: { fontSize: '3rem', fontWeight: 700, lineHeight: 1 },\n  label: { color: 'var(--muted-foreground)', fontSize: '0.875rem' },\n  action: { backgroundColor: 'var(--primary)', borderRadius: '0.375rem', color: 'var(--primary-foreground)', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },\n  cancel: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '1rem', fontSize: '0.875rem' },\n})" : ''}`,
    model: `export const Model = S.Struct({ drawer: Drawer.Model })
export type Model = typeof Model.Type`,
    messages: `export const ClickedOpen = m('ClickedOpenDrawer${tag}')
export const GotDrawerMessage = m('GotDrawerMessage${tag}', { message: Drawer.Message })
export const Message = S.Union([ClickedOpen, GotDrawerMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { drawer: Drawer.init({ id: 'goal-drawer', isAnimated: true }) },
  [],
]`,
    update: `const mapDrawer = (
  model: Model,
  result: ReturnType<typeof Drawer.update>,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [drawer, commands] = result
  return [
    { ...model, drawer },
    Command.mapMessages(commands, next => GotDrawerMessage({ message: next })),
  ]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedOpenDrawer${tag}':
      return mapDrawer(model, Drawer.open(model.drawer))
    case 'GotDrawerMessage${tag}':
      return mapDrawer(model, Drawer.update(model.drawer, message.message))
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Drawer — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ variant: 'outline', onClick: ClickedOpen(), children: ['Open ${fixture.direction} drawer'] }, h),
    Drawer.drawer({
      model: model.drawer,
      toParentMessage: message => GotDrawerMessage({ message }),
      direction: '${fixture.direction}',
      title: 'Move goal',
      description: 'Set your daily activity goal.',
      content: () => [
        h.div([h.Class(${isStyleX ? "stylex.props(styles.content).className ?? ''" : "'px-4 pb-6 text-center'"} )], [
          h.p([h.Class(${isStyleX ? "stylex.props(styles.value).className ?? ''" : "'text-5xl font-bold tabular-nums'"} )], ['350']),
          h.p([h.Class(${isStyleX ? "stylex.props(styles.label).className ?? ''" : "'text-sm text-muted-foreground'"} )], ['Calories per day']),
        ]),
      ],
      footer: slots => [
        h.button([...slots.closeButton, h.Type('button'), h.Class(${isStyleX ? "stylex.props(styles.action).className ?? ''" : "'rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'"} )], ['Save goal']),
        h.button([...slots.closeButton, h.Type('button'), h.Class(${isStyleX ? "stylex.props(styles.cancel).className ?? ''" : "'rounded-md border px-4 py-2 text-sm'"} )], ['Cancel']),
      ],
    }, h),
  ]),
})`,
  });
};

export const drawerExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => drawerFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));

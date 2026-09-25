import type { Html, HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  type DrawerFixture,
  type DrawerSide,
  drawerFixtures,
  drawerLorem,
  drawerRtlCopy,
  drawerSides,
} from '@/docs/components/pages/drawer/shared';
import * as Chart from '@/lib/echarts';
import * as Button from '@/stylex/button';
import * as Dialog from '@/stylex/dialog';
import * as Drawer from '@/stylex/drawer';
import * as Field from '@/stylex/field';
import * as Input from '@/stylex/input';
import { className } from '@/stylex/style';

const styles = stylex.create({
  body: { paddingInline: '1rem', paddingBlockEnd: '1.5rem', textAlign: 'center' },
  value: {
    fontSize: '3rem',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  action: {
    borderRadius: '0.375rem',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    fontSize: '0.875rem',
  },
  cancel: {
    borderColor: 'var(--border)',
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
  scrollBody: { paddingInline: '1rem', overflowY: 'auto', },
  lorem: { lineHeight: 'normal', marginBlockEnd: '1rem' },
  triggerRow: { gap: '0.5rem', display: 'flex', flexWrap: 'wrap', },
  compact: { maxWidth: '24rem' },
  counterRow: { gap: '0.5rem', alignItems: 'center', display: 'flex', justifyContent: 'center', },
  roundButton: {
    borderColor: 'var(--border)',
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: '1px',
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: '2rem',
    width: '2rem',
  },
  counterValue: { fontSize: '4.5rem', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1 },
  counterLabel: {
    color: 'var(--muted-foreground)',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
  },
  rtlWrap: { marginInline: 'auto', maxWidth: '24rem', width: '100%' },
  chartBox: { marginBlockStart: '0.75rem', height: '7.5rem', },
  counterFlex: { flexBasis: '0%', flexGrow: 1, flexShrink: 1, textAlign: 'center' },
  rtlBody: { paddingInline: '1rem', paddingBlockEnd: 0 },
});

type PreviewModel = Readonly<{
  drawer: Drawer.Model;
  dialog: Dialog.Model;
  side: DrawerSide;
  goal: number;
  name: string;
  username: string;
}>;

const msg = <Msg>(onMessageJson: (json: string) => Msg, tag: string, fields?: Record<string, unknown>): Msg =>
  onMessageJson(JSON.stringify({ _tag: tag, ...fields }));

const scrollableContent = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div(
    [h.Class(className(styles.scrollBody))],
    Array.from({ length: 10 }).map((_, index) =>
      h.p([h.Key(String(index)), h.Class(className(styles.lorem))], [drawerLorem]),
    ),
  );

const goalContent = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class(className(styles.body))], [
    h.p([h.Class(className(styles.value))], ['350']),
    h.p([h.Class(className(styles.label))], ['Calories per day']),
  ]);

const profileFields = <Msg>(
  exampleIndex: number,
  model: PreviewModel,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  Field.fieldGroup(
    {
      children: (
        [
          { id: 'name', label: 'Name', value: model.name, tag: 'ChangedName' },
          { id: 'username', label: 'Username', value: model.username, tag: 'ChangedUsername' },
        ] as const
      ).map(field =>
        Field.field(
          {
            children: [
              Field.fieldLabel(
                { for: `docs-drawer-${String(exampleIndex)}-${field.id}`, children: [field.label] },
                h,
              ),
              Field.fieldContent(
                {
                  children: [
                    Input.input(
                      {
                        id: `docs-drawer-${String(exampleIndex)}-${field.id}`,
                        value: field.value,
                        onInput: value => msg(onMessageJson, field.tag, { value }),
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ),
    },
    h,
  );

const rtlContent = <Msg>(
  model: PreviewModel,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div([h.Dir('rtl'), h.Class(className(styles.rtlWrap))], [
    h.div([h.Class(className(styles.rtlBody))], [
      h.div([h.Class(className(styles.counterRow))], [
        h.button(
          [
            h.Type('button'),
            h.OnClick(msg(onMessageJson, 'AdjustedGoal', { delta: -10 })),
            h.Disabled(model.goal <= 200),
            h.AriaLabel(drawerRtlCopy.decrease),
            h.Class(className(styles.roundButton)),
          ],
          ['−'],
        ),
        h.div([h.Class(className(styles.counterFlex))], [
          h.p([h.Class(className(styles.counterValue))], [String(model.goal)]),
          h.p([h.Class(className(styles.counterLabel))], [drawerRtlCopy.calories]),
        ]),
        h.button(
          [
            h.Type('button'),
            h.OnClick(msg(onMessageJson, 'AdjustedGoal', { delta: 10 })),
            h.Disabled(model.goal >= 400),
            h.AriaLabel(drawerRtlCopy.increase),
            h.Class(className(styles.roundButton)),
          ],
          ['+'],
        ),
      ]),
      h.div([h.Class(className(styles.chartBox))], [
        Chart.chart(
          {
            accessibleAlternative: h.p([], ['Bar chart of daily activity goals.']),
            ariaLabel: 'Activity goal chart',
            hostId: 'docs-drawer-rtl-chart',
            toMessage: (message: Chart.ChartMessage): Msg => onMessageJson(JSON.stringify(message)),
          },
          h,
        ),
      ]),
    ]),
  ]);

type Slots<Msg> = Parameters<NonNullable<Drawer.DrawerProps<Msg>['footer']>>[0];

const footerActions = <Msg>(
  slots: Slots<Msg>,
  h: HtmlBuilder<Msg>,
  primary: string,
  outline: string,
): ReadonlyArray<Html> => [
  h.button(
    [...slots.closeButton, h.Type('button'), h.Class(className(styles.action))],
    [primary],
  ),
  h.button(
    [...slots.closeButton, h.Type('button'), h.Class(className(styles.cancel))],
    [outline],
  ),
];

const drawerView = <Msg>(
  exampleIndex: number,
  fixture: DrawerFixture,
  model: PreviewModel,
  onMessageJson: (json: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const shared = {
    model: model.drawer,
    toParentMessage: (message: Drawer.Message): Msg =>
      msg(onMessageJson, 'GotDrawerPreviewMessage', { message }),
  } as const;
  switch (fixture.kind) {
    case 'goal':
    case 'side':
      return Drawer.drawer(
        {
          ...shared,
          direction: fixture.kind === 'side' ? 'right' : 'bottom',
          title: 'Move goal',
          description: 'Set your daily activity goal.',
          content: () => [goalContent(h)],
          footer: slots => footerActions(slots, h, 'Save goal', 'Cancel'),
        },
        h,
      );
    case 'scroll':
      return Drawer.drawer(
        {
          ...shared,
          direction: 'right',
          title: 'Move Goal',
          content: () => [scrollableContent(h)],
          footer: slots => footerActions(slots, h, 'Submit', 'Cancel'),
        },
        h,
      );
    case 'sides':
      return Drawer.drawer(
        {
          ...shared,
          direction: model.side,
          title: 'Move Goal',
          content: () => [scrollableContent(h)],
          footer: slots => footerActions(slots, h, 'Submit', 'Cancel'),
        },
        h,
      );
    case 'rtl':
      return Drawer.drawer(
        {
          ...shared,
          title: drawerRtlCopy.title,
          description: drawerRtlCopy.description,
          content: () => [rtlContent(model, onMessageJson, h)],
          footer: slots => footerActions(slots, h, drawerRtlCopy.submit, drawerRtlCopy.cancel),
        },
        h,
      );
    case 'responsive':
      return h.div([], [
        Dialog.dialog(
          {
            model: model.dialog,
            toParentMessage: (message: Dialog.Message): Msg =>
              msg(onMessageJson, 'GotDialogPreviewMessage', { message }),
            title: 'Edit profile',
            description: "Make changes to your profile here. Click save when you're done.",
            layoutStyle: styles.compact,
            content: () => [profileFields(exampleIndex, model, onMessageJson, h)],
          },
          h,
        ),
        Drawer.drawer(
          {
            ...shared,
            title: 'Edit profile',
            description: "Make changes to your profile here. Click save when you're done.",
            content: () => [profileFields(exampleIndex, model, onMessageJson, h)],
            footer: slots => [
              h.button(
                [...slots.closeButton, h.Type('button'), h.Class(className(styles.cancel))],
                ['Cancel'],
              ),
            ],
          },
          h,
        ),
      ]);
  }
};

export const drawerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html | undefined => {
  const fixture = drawerFixtures[exampleIndex];
  if (fixture === undefined) return undefined;
  const preview = model as PreviewModel;
  const trigger =
    fixture.kind === 'sides'
      ? h.div(
          [h.Class(className(styles.triggerRow))],
          drawerSides.map(side =>
            Button.button(
              {
                variant: 'outline',
                onClick: msg(onMessageJson, 'OpenedDrawerSide', { side }),
                children: [side],
              },
              h,
            ),
          ),
        )
      : Button.button(
          {
            variant: 'outline',
            onClick: msg(onMessageJson, 'OpenedDrawerPreview'),
            children: [fixture.triggerLabel],
          },
          h,
        );
  return h.div([], [trigger, drawerView(exampleIndex, fixture, preview, onMessageJson, h)]);
};

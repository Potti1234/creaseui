import { Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import { defineMessageUnion } from 'foldkit/message';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  type DrawerFixture,
  type DrawerSide,
  drawerFixtures,
  drawerLorem,
  drawerRtlCopy,
  drawerSides,
} from '@/docs/components/pages/drawer/shared';
import * as Chart from '@/lib/echarts';
import * as Button from '@/ui/button';
import * as Dialog from '@/ui/dialog';
import * as Drawer from '@/ui/drawer';
import * as Field from '@/ui/field';
import * as Input from '@/ui/input';

Chart.registerChart('docs-drawer-rtl-chart', theme => ({
  grid: Chart.compactGrid(),
  series: [{ data: [350, 350, 350, 350, 350, 350, 350], itemStyle: { color: theme.chart2 }, name: 'Goal', type: 'bar' }],
  tooltip: Chart.shadcnTooltip(theme),
  xAxis: { ...Chart.categoryAxis(theme, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], { boundaryGap: true }), inverse: true },
  yAxis: Chart.valueAxis(theme, { showLabels: false }),
}));

const DrawerPreviewMessageUnion = defineMessageUnion({
  OpenedDrawerPreview: {},
  OpenedDrawerSide: { side: S.Literals(['top', 'right', 'bottom', 'left']) },
  GotDrawerPreviewMessage: { message: Drawer.Message },
  GotDialogPreviewMessage: { message: Dialog.Message },
  ChangedViewport: { isDesktop: S.Boolean },
  ChangedName: { value: S.String },
  ChangedUsername: { value: S.String },
  AdjustedGoal: { delta: S.Number },
});
const DrawerPreviewMessage = S.Union([DrawerPreviewMessageUnion, Chart.ChartMessage]);
type DrawerPreviewMessage = typeof DrawerPreviewMessage.Type;
const DrawerPreviewModel = S.Struct({
  _docsPage: S.Literal('drawer'),
  kind: S.Literals(['goal', 'side', 'scroll', 'sides', 'responsive', 'rtl']),
  drawer: Drawer.Model,
  dialog: Dialog.Model,
  side: S.Literals(['top', 'right', 'bottom', 'left']),
  isDesktop: S.Boolean,
  name: S.String,
  username: S.String,
  goal: S.Number,
});
type DrawerPreviewModel = typeof DrawerPreviewModel.Type;

const isDesktop = (): boolean =>
  typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches;

const subscriptions =
  typeof window === 'undefined'
    ? undefined
    : Subscription.make<DrawerPreviewModel, DrawerPreviewMessage>()(() => ({
        viewport: Subscription.persistent(Subscription.fromEvent({
          target: () => window,
          type: 'resize',
          mapEvent: () => DrawerPreviewMessageUnion.ChangedViewport({ isDesktop: isDesktop() }),
        })),
      }));

const scrollableContent = (h: HtmlBuilder<DrawerPreviewMessage>): Html =>
  h.div(
    [h.Class('overflow-y-auto px-4')],
    Array.from({ length: 10 }).map((_, index) =>
      h.p([h.Key(String(index)), h.Class('mb-4 leading-normal')], [drawerLorem]),
    ),
  );

const goalContent = (h: HtmlBuilder<DrawerPreviewMessage>): Html =>
  h.div([h.Class('px-4 pb-6 text-center')], [
    h.p([h.Class('text-5xl font-bold tabular-nums')], ['350']),
    h.p([h.Class('text-sm text-muted-foreground')], ['Calories per day']),
  ]);

const profileFields = (
  index: number,
  model: DrawerPreviewModel,
  h: HtmlBuilder<DrawerPreviewMessage>,
): Html =>
  Field.fieldGroup(
    {
      children: (
        [
          { id: 'name', label: 'Name', value: model.name, toMessage: DrawerPreviewMessageUnion.ChangedName },
          { id: 'username', label: 'Username', value: model.username, toMessage: DrawerPreviewMessageUnion.ChangedUsername },
        ] as const
      ).map(field =>
        Field.field(
          {
            children: [
              Field.fieldLabel(
                { for: `docs-drawer-${String(index)}-${field.id}`, children: [field.label] },
                h,
              ),
              Field.fieldContent(
                {
                  children: [
                    Input.input(
                      {
                        id: `docs-drawer-${String(index)}-${field.id}`,
                        value: field.value,
                        onInput: value => field.toMessage({ value }),
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

const rtlContent = (
  model: DrawerPreviewModel,
  h: HtmlBuilder<DrawerPreviewMessage>,
): Html =>
  h.div([h.Dir('rtl'), h.Class('mx-auto w-full max-w-sm')], [
    h.div([h.Class('p-4 pb-0')], [
      h.div([h.Class('flex items-center justify-center gap-2')], [
        h.button(
          [
            h.Type('button'),
            h.OnClick(DrawerPreviewMessageUnion.AdjustedGoal({ delta: -10 })),
            h.Disabled(model.goal <= 200),
            h.AriaLabel(drawerRtlCopy.decrease),
            h.Class('h-8 w-8 shrink-0 rounded-full border'),
          ],
          ['−'],
        ),
        h.div([h.Class('flex-1 text-center')], [
          h.p([h.Class('text-7xl font-bold tracking-tighter')], [String(model.goal)]),
          h.p([h.Class('text-[0.70rem] uppercase text-muted-foreground')], [drawerRtlCopy.calories]),
        ]),
        h.button(
          [
            h.Type('button'),
            h.OnClick(DrawerPreviewMessageUnion.AdjustedGoal({ delta: 10 })),
            h.Disabled(model.goal >= 400),
            h.AriaLabel(drawerRtlCopy.increase),
            h.Class('h-8 w-8 shrink-0 rounded-full border'),
          ],
          ['+'],
        ),
      ]),
      h.div([h.Class('mt-3 h-30')], [
        Chart.chart(
          {
            accessibleAlternative: h.p([], ['Bar chart of daily activity goals.']),
            ariaLabel: 'Activity goal chart',
            hostId: 'docs-drawer-rtl-chart',
            toMessage: (message: Chart.ChartMessage): DrawerPreviewMessage => message,
          },
          h,
        ),
      ]),
    ]),
  ]);

type Slots<Msg> = Parameters<NonNullable<Drawer.DrawerProps<Msg>['footer']>>[0];

const footerActions = (
  slots: Slots<DrawerPreviewMessage>,
  h: HtmlBuilder<DrawerPreviewMessage>,
  primary: string,
  outline: string,
): ReadonlyArray<Html> => [
  h.button(
    [
      ...slots.closeButton,
      h.Type('button'),
      h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
    ],
    [primary],
  ),
  h.button(
    [
      ...slots.closeButton,
      h.Type('button'),
      h.Class('rounded-md border px-4 py-2 text-sm'),
    ],
    [outline],
  ),
];

const cancelOnlyFooter = (
  slots: Slots<DrawerPreviewMessage>,
  h: HtmlBuilder<DrawerPreviewMessage>,
): ReadonlyArray<Html> => [
  h.button(
    [
      ...slots.closeButton,
      h.Type('button'),
      h.Class('rounded-md border px-4 py-2 text-sm'),
    ],
    ['Cancel'],
  ),
];

const drawerView = (
  index: number,
  fixture: DrawerFixture,
  model: DrawerPreviewModel,
  h: HtmlBuilder<DrawerPreviewMessage>,
): Html => {
  const shared = {
    model: model.drawer,
    toParentMessage: (message: Drawer.Message): DrawerPreviewMessage =>
      DrawerPreviewMessageUnion.GotDrawerPreviewMessage({ message }),
    title: 'Move goal',
    description: 'Set your daily activity goal.',
  } as const;
  switch (fixture.kind) {
    case 'goal':
    case 'side':
      return Drawer.drawer(
        {
          ...shared,
          direction: fixture.kind === 'side' ? 'right' : 'bottom',
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
          model: model.drawer,
          toParentMessage: (message: Drawer.Message): DrawerPreviewMessage =>
            DrawerPreviewMessageUnion.GotDrawerPreviewMessage({ message }),
          title: drawerRtlCopy.title,
          description: drawerRtlCopy.description,
          content: () => [rtlContent(model, h)],
          footer: slots => footerActions(slots, h, drawerRtlCopy.submit, drawerRtlCopy.cancel),
        },
        h,
      );
    case 'responsive':
      return h.div([], [
        Dialog.dialog(
          {
            model: model.dialog,
            toParentMessage: (message: Dialog.Message): DrawerPreviewMessage =>
              DrawerPreviewMessageUnion.GotDialogPreviewMessage({ message }),
            title: 'Edit profile',
            description: "Make changes to your profile here. Click save when you're done.",
            class: 'sm:max-w-sm',
            content: () => [profileFields(index, model, h)],
          },
          h,
        ),
        Drawer.drawer(
          {
            ...shared,
            title: 'Edit profile',
            description: "Make changes to your profile here. Click save when you're done.",
            content: () => [profileFields(index, model, h)],
            footer: slots => cancelOnlyFooter(slots, h),
          },
          h,
        ),
      ]);
  }
};

const triggerView = (
  fixture: DrawerFixture,
  index: number,
  h: HtmlBuilder<DrawerPreviewMessage>,
): Html => {
  if (fixture.kind === 'sides') {
    return h.div(
      [h.Class('flex flex-wrap gap-2')],
      drawerSides.map(side =>
        Button.button(
          {
            variant: 'outline',
            onClick: DrawerPreviewMessageUnion.OpenedDrawerSide({ side }),
            children: [side],
          },
          h,
        ),
      ),
    );
  }
  return Button.button(
    {
      variant: 'outline',
      onClick: DrawerPreviewMessageUnion.OpenedDrawerPreview(),
      children: [fixture.triggerLabel],
    },
    h,
  );
};

export const drawerTailwindPreviewProgram = definePreviewProgram<DrawerPreviewModel, DrawerPreviewMessage>({
  Model: DrawerPreviewModel,
  Message: DrawerPreviewMessage,
  init: index => ({
    _docsPage: 'drawer',
    kind: (drawerFixtures[index] ?? drawerFixtures[0]!).kind,
    drawer: Drawer.init({ id: `docs-drawer-${String(index)}`, isAnimated: true }),
    dialog: Dialog.init({ id: `docs-drawer-dialog-${String(index)}`, isAnimated: true }),
    side: 'bottom',
    isDesktop: isDesktop(),
    name: 'Pedro Duarte',
    username: '@peduarte',
    goal: 350,
  }),
  update: (model, message) => {
    switch (message._tag) {
      case 'OpenedDrawerPreview': {
        if (model.kind === 'responsive' && model.isDesktop) {
          const result = Dialog.open(model.dialog);
          return {
            model: { ...model, dialog: result.model },
            commands: Command.mapMessages(result.commands ?? [], next =>
              DrawerPreviewMessageUnion.GotDialogPreviewMessage({ message: next }),
            ),
          };
        }
        const result = Drawer.open(model.drawer);
        return {
          model: { ...model, drawer: result.model },
          commands: Command.mapMessages(result.commands ?? [], next =>
            DrawerPreviewMessageUnion.GotDrawerPreviewMessage({ message: next }),
          ),
        };
      }
      case 'OpenedDrawerSide': {
        const next = { ...model, side: message.side };
        const result = Drawer.open(next.drawer);
        return {
          model: { ...next, drawer: result.model },
          commands: Command.mapMessages(result.commands ?? [], n =>
            DrawerPreviewMessageUnion.GotDrawerPreviewMessage({ message: n }),
          ),
        };
      }
      case 'GotDrawerPreviewMessage': {
        const result = Drawer.update(model.drawer, message.message);
        return {
          model: { ...model, drawer: result.model },
          commands: Command.mapMessages(result.commands ?? [], n =>
            DrawerPreviewMessageUnion.GotDrawerPreviewMessage({ message: n }),
          ),
        };
      }
      case 'GotDialogPreviewMessage': {
        const result = Dialog.update(model.dialog, message.message);
        return {
          model: { ...model, dialog: result.model },
          commands: Command.mapMessages(result.commands ?? [], n =>
            DrawerPreviewMessageUnion.GotDialogPreviewMessage({ message: n }),
          ),
        };
      }
      case 'ChangedViewport':
        return { model: { ...model, isDesktop: message.isDesktop } };
      case 'ChangedName':
        return { model: { ...model, name: message.value } };
      case 'ChangedUsername':
        return { model: { ...model, username: message.value } };
      case 'AdjustedGoal':
        return { model: { ...model, goal: Math.max(200, Math.min(400, model.goal + message.delta)) } };
      case 'CompletedSyncChart':
      case 'ChartMounted':
      case 'ChartMountFailed':
        return { model };
    }
  },
  view: (index, model, h) => {
    const fixture = drawerFixtures[index] ?? drawerFixtures[0]!;
    return h.div([], [triggerView(fixture, index, h), drawerView(index, fixture, model, h)]);
  },
  ...(subscriptions === undefined ? {} : { subscriptions }),
});

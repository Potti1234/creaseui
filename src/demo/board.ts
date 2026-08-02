import { Effect, Match as M, Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import { type Html, type HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';
import { evo } from 'foldkit/struct';

import * as AccountAccess from '@/demo/cards/account-access';
import * as CardOverview from '@/demo/cards/card-overview';
import * as ClaimableBalance from '@/demo/cards/claimable-balance';
import * as ContributionHistory from '@/demo/cards/contribution-history';
import * as CoverArt from '@/demo/cards/cover-art';
import * as DividendIncome from '@/demo/cards/dividend-income';
import * as EmptyConnectBank from '@/demo/cards/empty-connect-bank';
import * as EmptyDistributeTrack from '@/demo/cards/empty-distribute-track';
import * as EmptyExploreCatalog from '@/demo/cards/empty-explore-catalog';
import * as Faq from '@/demo/cards/faq';
import * as FrontDoor from '@/demo/cards/front-door';
import * as IndexInvesting from '@/demo/cards/index-investing';
import * as KitchenIsland from '@/demo/cards/kitchen-island';
import * as LoadingCard from '@/demo/cards/loading-card';
import * as NewMilestone from '@/demo/cards/new-milestone';
import * as NotificationSettings from '@/demo/cards/notification-settings';
import * as Payments from '@/demo/cards/payments';
import * as PayoutThreshold from '@/demo/cards/payout-threshold';
import * as PowerUsage from '@/demo/cards/power-usage';
import * as Preferences from '@/demo/cards/preferences';
import * as QrConnect from '@/demo/cards/qr-connect';
import * as ReceivingMethod from '@/demo/cards/receiving-method';
import * as RecentTransactions from '@/demo/cards/recent-transactions';
import * as ReleaseCatalog from '@/demo/cards/release-catalog';
import * as RollerShades from '@/demo/cards/roller-shades';
import * as SavingsProgress from '@/demo/cards/savings-progress';
import * as SavingsTargets from '@/demo/cards/savings-targets';
import * as SidebarNav from '@/demo/cards/sidebar-nav';
import * as SocialLinks from '@/demo/cards/social-links';
import * as StockPerformance from '@/demo/cards/stock-performance';
import * as SyncingState from '@/demo/cards/syncing-state';
import * as TransferFunds from '@/demo/cards/transfer-funds';
import * as UpcomingPayments from '@/demo/cards/upcoming-payments';
import * as Preset from '@/demo/create-preset';
import * as Button from '@/ui/button';
import * as Popover from '@/ui/popover';
import * as ScrollArea from '@/ui/scroll-area';
import * as Icon from '@/lib/icon';

export const Model = S.Struct({
  accountAccess: AccountAccess.Model,
  faq: Faq.Model,
  kitchenIsland: KitchenIsland.Model,
  newMilestone: NewMilestone.Model,
  notificationSettings: NotificationSettings.Model,
  payments: Payments.Model,
  payoutThreshold: PayoutThreshold.Model,
  preferences: Preferences.Model,
  receivingMethod: ReceivingMethod.Model,
  recentTransactions: RecentTransactions.Model,
  releaseCatalog: ReleaseCatalog.Model,
  rollerShades: RollerShades.Model,
  savingsTargets: SavingsTargets.Model,
  socialLinks: SocialLinks.Model,
  stockPerformance: StockPerformance.Model,
  transferFunds: TransferFunds.Model,
  upcomingPayments: UpcomingPayments.Model,
  preset: Preset.Config,
  presetInput: S.String,
  presetError: S.NullOr(S.String),
  isPresetCopied: S.Boolean,
  pickerPopovers: S.Struct({
    style: Popover.Model,
    baseColor: Popover.Model,
    theme: Popover.Model,
    chartColor: Popover.Model,
    iconLibrary: Popover.Model,
    font: Popover.Model,
    fontHeading: Popover.Model,
    radius: Popover.Model,
    menuAccent: Popover.Model,
    menuColor: Popover.Model,
  }),
});
export type Model = typeof Model.Type;

export const GotAccountAccessMessage = m('GotAccountAccessMessage', {
  message: AccountAccess.Message,
});
export const GotFaqMessage = m('GotFaqMessage', {
  message: Faq.Message,
});
export const GotKitchenIslandMessage = m('GotKitchenIslandMessage', {
  message: KitchenIsland.Message,
});
export const GotNewMilestoneMessage = m('GotNewMilestoneMessage', {
  message: NewMilestone.Message,
});
export const GotNotificationSettingsMessage = m(
  'GotNotificationSettingsMessage',
  { message: NotificationSettings.Message },
);
export const GotPaymentsMessage = m('GotPaymentsMessage', {
  message: Payments.Message,
});
export const GotPayoutThresholdMessage = m('GotPayoutThresholdMessage', {
  message: PayoutThreshold.Message,
});
export const GotPreferencesMessage = m('GotPreferencesMessage', {
  message: Preferences.Message,
});
export const GotReceivingMethodMessage = m('GotReceivingMethodMessage', {
  message: ReceivingMethod.Message,
});
export const GotRecentTransactionsMessage = m('GotRecentTransactionsMessage', {
  message: RecentTransactions.Message,
});
export const GotReleaseCatalogMessage = m('GotReleaseCatalogMessage', {
  message: ReleaseCatalog.Message,
});
export const GotRollerShadesMessage = m('GotRollerShadesMessage', {
  message: RollerShades.Message,
});
export const GotSavingsTargetsMessage = m('GotSavingsTargetsMessage', {
  message: SavingsTargets.Message,
});
export const GotSocialLinksMessage = m('GotSocialLinksMessage', {
  message: SocialLinks.Message,
});
export const GotStockPerformanceMessage = m('GotStockPerformanceMessage', {
  message: StockPerformance.Message,
});
export const GotTransferFundsMessage = m('GotTransferFundsMessage', {
  message: TransferFunds.Message,
});
export const GotUpcomingPaymentsMessage = m('GotUpcomingPaymentsMessage', {
  message: UpcomingPayments.Message,
});
export const ChangedPresetInput = m('ChangedCreatePresetInput', {
  value: S.String,
});
export const AppliedPresetInput = m('AppliedCreatePresetInput');
export const ChangedPresetField = m('ChangedCreatePresetField', {
  field: Preset.Field,
  value: S.String,
});
export const ClickedCopyPreset = m('ClickedCopyCreatePreset');
export const CompletedCopyPreset = m('CompletedCopyCreatePreset');
export const ClearedCopyPreset = m('ClearedCopyCreatePreset');
export const GotPresetPickerMessage = m('GotCreatePresetPickerMessage', {
  field: Preset.Field,
  message: Popover.Message,
});

export const Message = S.Union([
  GotAccountAccessMessage,
  GotFaqMessage,
  GotKitchenIslandMessage,
  GotNewMilestoneMessage,
  GotNotificationSettingsMessage,
  GotPaymentsMessage,
  GotPayoutThresholdMessage,
  GotPreferencesMessage,
  GotReceivingMethodMessage,
  GotRecentTransactionsMessage,
  GotReleaseCatalogMessage,
  GotRollerShadesMessage,
  GotSavingsTargetsMessage,
  GotSocialLinksMessage,
  GotStockPerformanceMessage,
  GotTransferFundsMessage,
  GotUpcomingPaymentsMessage,
  ChangedPresetInput,
  AppliedPresetInput,
  ChangedPresetField,
  ClickedCopyPreset,
  CompletedCopyPreset,
  ClearedCopyPreset,
  GotPresetPickerMessage,
]);
export type Message = typeof Message.Type;

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const init = (): Model => ({
  accountAccess: AccountAccess.init(),
  faq: Faq.init(),
  kitchenIsland: KitchenIsland.init(),
  newMilestone: NewMilestone.init(),
  notificationSettings: NotificationSettings.init(),
  payments: Payments.init(),
  payoutThreshold: PayoutThreshold.init(),
  preferences: Preferences.init(),
  receivingMethod: ReceivingMethod.init(),
  recentTransactions: RecentTransactions.init(),
  releaseCatalog: ReleaseCatalog.init(),
  rollerShades: RollerShades.init(),
  savingsTargets: SavingsTargets.init(),
  socialLinks: SocialLinks.init(),
  stockPerformance: StockPerformance.init(),
  transferFunds: TransferFunds.init(),
  upcomingPayments: UpcomingPayments.init(),
  preset: Preset.DEFAULT_CONFIG,
  presetInput: Preset.encodePreset(Preset.DEFAULT_CONFIG),
  presetError: null,
  isPresetCopied: false,
  pickerPopovers: {
    style: Popover.init({ id: 'create-style-picker', isAnimated: true }),
    baseColor: Popover.init({
      id: 'create-base-color-picker',
      isAnimated: true,
    }),
    theme: Popover.init({ id: 'create-theme-picker', isAnimated: true }),
    chartColor: Popover.init({
      id: 'create-chart-color-picker',
      isAnimated: true,
    }),
    iconLibrary: Popover.init({
      id: 'create-icon-library-picker',
      isAnimated: true,
    }),
    font: Popover.init({ id: 'create-font-picker', isAnimated: true }),
    fontHeading: Popover.init({
      id: 'create-heading-picker',
      isAnimated: true,
    }),
    radius: Popover.init({ id: 'create-radius-picker', isAnimated: true }),
    menuAccent: Popover.init({
      id: 'create-menu-accent-picker',
      isAnimated: true,
    }),
    menuColor: Popover.init({
      id: 'create-menu-color-picker',
      isAnimated: true,
    }),
  },
});

const CopyPreset = Command.define('CopyCreatePreset', {
  args: { code: S.String },
  messages: [CompletedCopyPreset],
  execute: ({ code }) =>
    Effect.promise(() => navigator.clipboard.writeText(code)).pipe(
      Effect.as(CompletedCopyPreset()),
    ),
});
const ClearPresetCopy = Command.define('ClearCreatePresetCopy', {
  messages: [ClearedCopyPreset],
  execute: Effect.sleep('1800 millis').pipe(Effect.as(ClearedCopyPreset())),
});

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ChangedCreatePresetInput: ({ value }) => [
        evo(model, { presetInput: () => value, presetError: () => null }),
        [],
      ],
      AppliedCreatePresetInput: () => {
        const preset = Preset.parsePresetInput(model.presetInput);
        return preset === undefined
          ? [
              evo(model, {
                presetError: () =>
                  'Enter a valid shadcn preset code, URL, or --preset flag.',
              }),
              [],
            ]
          : [
              evo(model, {
                preset: () => preset,
                presetInput: () => Preset.encodePreset(preset),
                presetError: () => null,
              }),
              [],
            ];
      },
      ChangedCreatePresetField: ({ field, value }) => {
        const preset = { ...model.preset, [field]: value };
        const [picker, commands] = Popover.close(model.pickerPopovers[field]);
        return [
          evo(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
            pickerPopovers: (current) => ({ ...current, [field]: picker }),
          }),
          Command.mapMessages(commands, (next) =>
            GotPresetPickerMessage({ field, message: next }),
          ),
        ];
      },
      ClickedCopyCreatePreset: () => [
        model,
        [CopyPreset({ code: Preset.encodePreset(model.preset) })],
      ],
      CompletedCopyCreatePreset: () => [
        evo(model, { isPresetCopied: () => true }),
        [ClearPresetCopy()],
      ],
      ClearedCopyCreatePreset: () => [
        evo(model, { isPresetCopied: () => false }),
        [],
      ],
      GotCreatePresetPickerMessage: ({ field, message: childMessage }) => {
        const [picker, commands] = Popover.update(
          model.pickerPopovers[field],
          childMessage,
        );
        return [
          evo(model, {
            pickerPopovers: (current) => ({ ...current, [field]: picker }),
          }),
          Command.mapMessages(commands, (next) =>
            GotPresetPickerMessage({ field, message: next }),
          ),
        ];
      },
      GotAccountAccessMessage: ({ message: childMessage }) => {
        const [accountAccess, commands] = AccountAccess.update(
          model.accountAccess,
          childMessage,
        );
        return [evo(model, { accountAccess: () => accountAccess }), commands];
      },
      GotFaqMessage: ({ message: childMessage }) => {
        const [faq, commands] = Faq.update(model.faq, childMessage);
        return [
          evo(model, { faq: () => faq }),
          Command.mapMessages(commands, (next) =>
            GotFaqMessage({ message: next }),
          ),
        ];
      },
      GotKitchenIslandMessage: ({ message: childMessage }) => {
        const [kitchenIsland, commands] = KitchenIsland.update(
          model.kitchenIsland,
          childMessage,
        );
        return [
          evo(model, { kitchenIsland: () => kitchenIsland }),
          Command.mapMessages(commands, (next) =>
            GotKitchenIslandMessage({ message: next }),
          ),
        ];
      },
      GotNewMilestoneMessage: ({ message: childMessage }) => {
        const [newMilestone, commands] = NewMilestone.update(
          model.newMilestone,
          childMessage,
        );
        return [
          evo(model, { newMilestone: () => newMilestone }),
          Command.mapMessages(commands, (next) =>
            GotNewMilestoneMessage({ message: next }),
          ),
        ];
      },
      GotNotificationSettingsMessage: ({ message: childMessage }) => {
        const [notificationSettings, commands] = NotificationSettings.update(
          model.notificationSettings,
          childMessage,
        );
        return [
          evo(model, { notificationSettings: () => notificationSettings }),
          Command.mapMessages(commands, (next) =>
            GotNotificationSettingsMessage({ message: next }),
          ),
        ];
      },
      GotPaymentsMessage: ({ message: childMessage }) => {
        const [payments, commands] = Payments.update(
          model.payments,
          childMessage,
        );
        return [
          evo(model, { payments: () => payments }),
          Command.mapMessages(commands, (next) =>
            GotPaymentsMessage({ message: next }),
          ),
        ];
      },
      GotPayoutThresholdMessage: ({ message: childMessage }) => {
        const [payoutThreshold, commands] = PayoutThreshold.update(
          model.payoutThreshold,
          childMessage,
        );
        return [
          evo(model, { payoutThreshold: () => payoutThreshold }),
          Command.mapMessages(commands, (next) =>
            GotPayoutThresholdMessage({ message: next }),
          ),
        ];
      },
      GotPreferencesMessage: ({ message: childMessage }) => {
        const [preferences, commands] = Preferences.update(
          model.preferences,
          childMessage,
        );
        return [
          evo(model, { preferences: () => preferences }),
          Command.mapMessages(commands, (next) =>
            GotPreferencesMessage({ message: next }),
          ),
        ];
      },
      GotReceivingMethodMessage: ({ message: childMessage }) => {
        const [receivingMethod, commands] = ReceivingMethod.update(
          model.receivingMethod,
          childMessage,
        );
        return [
          evo(model, { receivingMethod: () => receivingMethod }),
          Command.mapMessages(commands, (next) =>
            GotReceivingMethodMessage({ message: next }),
          ),
        ];
      },
      GotRecentTransactionsMessage: ({ message: childMessage }) => {
        const [recentTransactions, commands] = RecentTransactions.update(
          model.recentTransactions,
          childMessage,
        );
        return [
          evo(model, { recentTransactions: () => recentTransactions }),
          Command.mapMessages(commands, (next) =>
            GotRecentTransactionsMessage({ message: next }),
          ),
        ];
      },
      GotReleaseCatalogMessage: ({ message: childMessage }) => {
        const [releaseCatalog, commands] = ReleaseCatalog.update(
          model.releaseCatalog,
          childMessage,
        );
        return [
          evo(model, { releaseCatalog: () => releaseCatalog }),
          Command.mapMessages(commands, (next) =>
            GotReleaseCatalogMessage({ message: next }),
          ),
        ];
      },
      GotRollerShadesMessage: ({ message: childMessage }) => {
        const [rollerShades, commands] = RollerShades.update(
          model.rollerShades,
          childMessage,
        );
        return [
          evo(model, { rollerShades: () => rollerShades }),
          Command.mapMessages(commands, (next) =>
            GotRollerShadesMessage({ message: next }),
          ),
        ];
      },
      GotSavingsTargetsMessage: ({ message: childMessage }) => {
        const [savingsTargets, commands] = SavingsTargets.update(
          model.savingsTargets,
          childMessage,
        );
        return [
          evo(model, { savingsTargets: () => savingsTargets }),
          Command.mapMessages(commands, (next) =>
            GotSavingsTargetsMessage({ message: next }),
          ),
        ];
      },
      GotSocialLinksMessage: ({ message: childMessage }) => {
        const [socialLinks, commands] = SocialLinks.update(
          model.socialLinks,
          childMessage,
        );
        return [
          evo(model, { socialLinks: () => socialLinks }),
          Command.mapMessages(commands, (next) =>
            GotSocialLinksMessage({ message: next }),
          ),
        ];
      },
      GotStockPerformanceMessage: ({ message: childMessage }) => {
        const [stockPerformance, commands] = StockPerformance.update(
          model.stockPerformance,
          childMessage,
        );
        return [
          evo(model, { stockPerformance: () => stockPerformance }),
          Command.mapMessages(commands, (next) =>
            GotStockPerformanceMessage({ message: next }),
          ),
        ];
      },
      GotTransferFundsMessage: ({ message: childMessage }) => {
        const [transferFunds, commands] = TransferFunds.update(
          model.transferFunds,
          childMessage,
        );
        return [
          evo(model, { transferFunds: () => transferFunds }),
          Command.mapMessages(commands, (next) =>
            GotTransferFundsMessage({ message: next }),
          ),
        ];
      },
      GotUpcomingPaymentsMessage: ({ message: childMessage }) => {
        const [upcomingPayments, commands] = UpcomingPayments.update(
          model.upcomingPayments,
          childMessage,
        );
        return [
          evo(model, { upcomingPayments: () => upcomingPayments }),
          Command.mapMessages(commands, (next) =>
            GotUpcomingPaymentsMessage({ message: next }),
          ),
        ];
      },
    }),
  );

const accountAccessView = defineView<
  AccountAccess.Model,
  AccountAccess.Message
>(AccountAccess.view);
const faqView = defineView<Faq.Model, Faq.Message>(Faq.view);
const kitchenIslandView = defineView<
  KitchenIsland.Model,
  KitchenIsland.Message
>(KitchenIsland.view);
const newMilestoneView = defineView<NewMilestone.Model, NewMilestone.Message>(
  NewMilestone.view,
);
const notificationSettingsView = defineView<
  NotificationSettings.Model,
  NotificationSettings.Message
>(NotificationSettings.view);
const paymentsView = defineView<Payments.Model, Payments.Message>(
  Payments.view,
);
const payoutThresholdView = defineView<
  PayoutThreshold.Model,
  PayoutThreshold.Message
>(PayoutThreshold.view);
const preferencesView = defineView<Preferences.Model, Preferences.Message>(
  Preferences.view,
);
const receivingMethodView = defineView<
  ReceivingMethod.Model,
  ReceivingMethod.Message
>(ReceivingMethod.view);
const recentTransactionsView = defineView<
  RecentTransactions.Model,
  RecentTransactions.Message
>(RecentTransactions.view);
const releaseCatalogView = defineView<
  ReleaseCatalog.Model,
  ReleaseCatalog.Message
>(ReleaseCatalog.view);
const rollerShadesView = defineView<RollerShades.Model, RollerShades.Message>(
  RollerShades.view,
);
const savingsTargetsView = defineView<
  SavingsTargets.Model,
  SavingsTargets.Message
>(SavingsTargets.view);
const socialLinksView = defineView<SocialLinks.Model, SocialLinks.Message>(
  SocialLinks.view,
);
const stockPerformanceView = defineView<
  StockPerformance.Model,
  StockPerformance.Message
>(StockPerformance.view);
const transferFundsView = defineView<
  TransferFunds.Model,
  TransferFunds.Message
>(TransferFunds.view);
const upcomingPaymentsView = defineView<
  UpcomingPayments.Model,
  UpcomingPayments.Message
>(UpcomingPayments.view);

const titleCase = (value: string): string =>
  value
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');

const customizer = (model: Model, h: HtmlBuilder<Message>): Html => {
  const picker = (
    label: string,
    field: Preset.Field,
    values: readonly string[],
    marker?: string,
  ): Html =>
    Popover.popover<Message>(
      {
        model: model.pickerPopovers[field],
        toParentMessage: (message) =>
          GotPresetPickerMessage({ field, message }),
        side: 'right',
        align: 'start',
        triggerClass:
          'relative flex h-[66px] w-full items-end justify-between rounded-lg border border-white/10 bg-white/[0.035] px-3 pb-2.5 text-left shadow-none outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30',
        trigger: h.div(
          [h.Class('flex min-w-0 flex-1 items-end justify-between')],
          [
            h.span(
              [
                h.Class(
                  'absolute top-2.5 left-3 text-xs font-medium text-muted-foreground',
                ),
              ],
              [label],
            ),
            h.span(
              [h.Class('truncate text-[15px] font-semibold')],
              [titleCase(model.preset[field])],
            ),
            h.span(
              [h.Class('ml-3 flex items-center gap-3 pb-0.5')],
              [
                ...(marker === undefined
                  ? []
                  : [
                      h.span(
                        [
                          h.AriaHidden(true),
                          h.Class(`size-3.5 rounded-full ${marker}`),
                        ],
                        [],
                      ),
                    ]),
                Icon.chevronRight({ class: 'size-4 text-white/35' }, h),
              ],
            ),
          ],
        ),
        class:
          'dark w-72 border-white/10 bg-[#3a3a3a] p-2 text-white shadow-xl',
        content: ScrollArea.scrollArea<Message>(
          {
            class: 'max-h-80',
            children: values.map((value) => {
              const isSelected = model.preset[field] === value;
              return h.button(
                [
                  h.Type('button'),
                  h.OnClick(ChangedPresetField({ field, value })),
                  h.Class(
                    `flex min-h-10 w-full items-center rounded-md px-3 text-left text-sm font-medium outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/10 ${isSelected ? 'bg-white/15' : ''}`,
                  ),
                ],
                [
                  h.span([h.Class('truncate')], [titleCase(value)]),
                  ...(isSelected
                    ? [Icon.check({ class: 'ml-auto size-4' }, h)]
                    : []),
                ],
              );
            }),
          },
          h,
        ),
      },
      h,
    );

  return h.aside(
    [
      h.Class(
        'dark fixed top-[76px] bottom-5 left-5 z-30 flex w-[282px] flex-col overflow-hidden rounded-2xl bg-[#282828] text-white shadow-xl ring-1 ring-white/10 max-lg:right-3 max-lg:left-3 max-lg:w-auto',
      ),
    ],
    [
      h.div(
        [h.Class('border-b border-white/10 p-4')],
        [
          h.div(
            [
              h.Class(
                'flex h-12 items-center justify-between rounded-xl border border-white/10 px-4',
              ),
            ],
            [
              h.h1([h.Class('text-sm font-semibold')], ['Menu']),
              Icon.icon('menu', { class: 'size-5 text-white/80' }, h),
            ],
          ),
        ],
      ),
      ScrollArea.scrollArea<Message>(
        {
          class: 'min-h-0 flex-1',
          children: [
            h.div(
              [h.Class('space-y-4 p-4')],
              [
                h.div(
                  [h.Class('space-y-3')],
                  [
                    picker('Style', 'style', Preset.STYLES),
                    picker(
                      'Base Color',
                      'baseColor',
                      Preset.BASE_COLORS,
                      'bg-zinc-400',
                    ),
                    picker('Theme', 'theme', Preset.THEMES, 'bg-primary'),
                    picker(
                      'Chart Color',
                      'chartColor',
                      Preset.THEMES,
                      'bg-chart-1',
                    ),
                  ],
                ),
                h.div([h.Class('-mx-4 border-t border-white/10')], []),
                h.div(
                  [h.Class('space-y-3')],
                  [
                    picker('Heading', 'fontHeading', Preset.FONT_HEADINGS),
                    picker('Font', 'font', Preset.FONTS),
                    picker('Icons', 'iconLibrary', Preset.ICON_LIBRARIES),
                    picker('Radius', 'radius', Preset.RADII),
                    picker('Menu Color', 'menuColor', Preset.MENU_COLORS),
                    picker('Menu Accent', 'menuAccent', Preset.MENU_ACCENTS),
                  ],
                ),
              ],
            ),
          ],
        },
        h,
      ),
      h.div(
        [h.Class('space-y-2 border-t border-white/10 p-4')],
        [
          h.div(
            [
              h.Class(
                'truncate rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-white/80',
              ),
            ],
            [`--preset ${Preset.encodePreset(model.preset)}`],
          ),
          h.details(
            [h.Class('group')],
            [
              h.summary(
                [
                  h.Class(
                    'flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-white/10 text-sm font-medium hover:bg-white/[0.06] [&::-webkit-details-marker]:hidden',
                  ),
                ],
                ['Open Preset'],
              ),
              h.div(
                [h.Class('mt-2 space-y-2')],
                [
                  h.input([
                    h.Id('create-preset-input'),
                    h.AriaLabel('Open preset'),
                    h.Value(model.presetInput),
                    h.OnInput((value) => ChangedPresetInput({ value })),
                    h.Placeholder('Paste code or shadcn URL'),
                    h.Class(
                      'h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 font-mono text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                    ),
                  ]),
                  Button.button(
                    {
                      class:
                        'w-full border-white/10 bg-transparent text-white hover:bg-white/[0.06] dark:bg-transparent',
                      children: ['Apply Preset'],
                      onClick: AppliedPresetInput(),
                      variant: 'outline',
                    },
                    h,
                  ),
                  ...(model.presetError === null
                    ? []
                    : [
                        h.p(
                          [h.Class('text-xs text-red-400')],
                          [model.presetError],
                        ),
                      ]),
                ],
              ),
            ],
          ),
          Button.button(
            {
              class:
                'w-full border-white/10 bg-transparent text-white hover:bg-white/[0.06] dark:bg-transparent',
              children: ['Shuffle'],
              variant: 'outline',
            },
            h,
          ),
          Button.button(
            {
              class: 'relative w-full bg-white text-black hover:bg-white/90',
              onClick: ClickedCopyPreset(),
              children: [
                Icon.icon(
                  'copy',
                  {
                    class: model.isPresetCopied
                      ? 'size-4 scale-25 opacity-0 blur-[4px] transition-[scale,opacity,filter]'
                      : 'size-4 transition-[scale,opacity,filter]',
                  },
                  h,
                ),
                ...(model.isPresetCopied
                  ? [
                      Icon.check(
                        {
                          class:
                            'absolute left-[5.2rem] size-4 text-emerald-600',
                        },
                        h,
                      ),
                      'Copied',
                    ]
                  : ['Get Code']),
              ],
            },
            h,
          ),
        ],
      ),
    ],
  );
};

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const preview = h.div(
    [
      h.Class(
        'overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] lg:pl-[330px] dark:bg-background',
      ),
    ],
    [
      h.div(
        [h.Class('flex w-full min-w-max justify-center')],
        [
          h.div(
            [
              h.Class(
                'create-board-theme grid w-[2400px] grid-cols-7 items-start gap-(--gap) bg-muted p-(--gap) md:w-[3000px] dark:bg-background *:[div]:gap-(--gap)',
              ),
              h.DataAttribute('slot', 'capture-target'),
            ],
            [
              h.div(
                [
                  h.Class(
                    'flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]',
                  ),
                ],
                [
                  ContributionHistory.view<Message>(h),
                  EmptyDistributeTrack.view<Message>(h),
                  QrConnect.view<Message>(h),
                  DividendIncome.view<Message>(h),
                  IndexInvesting.view<Message>(h),
                  SyncingState.view<Message>(h),
                ],
              ),
              h.div(
                [
                  h.Class(
                    'flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]',
                  ),
                ],
                [
                  h.submodel({
                    slotId: 'payout-threshold',
                    model: model.payoutThreshold,
                    view: payoutThresholdView,
                    toParentMessage: (message) =>
                      GotPayoutThresholdMessage({ message }),
                  }),
                  ClaimableBalance.view<Message>(h),
                  h.submodel({
                    slotId: 'preferences',
                    model: model.preferences,
                    view: preferencesView,
                    toParentMessage: (message) =>
                      GotPreferencesMessage({ message }),
                  }),
                  SavingsProgress.view<Message>(h),
                  h.submodel({
                    slotId: 'kitchen-island',
                    model: model.kitchenIsland,
                    view: kitchenIslandView,
                    toParentMessage: (message) =>
                      GotKitchenIslandMessage({ message }),
                  }),
                ],
              ),
              h.div(
                [
                  h.Class(
                    'col-span-2 flex flex-col p-1 [contain-intrinsic-size:760px_1200px] [content-visibility:auto]',
                  ),
                ],
                [
                  h.submodel({
                    slotId: 'savings-targets',
                    model: model.savingsTargets,
                    view: savingsTargetsView,
                    toParentMessage: (message) =>
                      GotSavingsTargetsMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'recent-transactions',
                    model: model.recentTransactions,
                    view: recentTransactionsView,
                    toParentMessage: (message) =>
                      GotRecentTransactionsMessage({ message }),
                  }),
                  h.div(
                    [h.Class('grid grid-cols-2 items-start gap-(--gap)')],
                    [
                      h.div(
                        [h.Class('flex flex-col gap-(--gap)')],
                        [
                          SidebarNav.view<Message>(h),
                          h.submodel({
                            slotId: 'faq',
                            model: model.faq,
                            view: faqView,
                            toParentMessage: (message) =>
                              GotFaqMessage({ message }),
                          }),
                        ],
                      ),
                      h.div(
                        [h.Class('flex flex-col gap-(--gap)')],
                        [
                          h.submodel({
                            slotId: 'payments',
                            model: model.payments,
                            view: paymentsView,
                            toParentMessage: (message) =>
                              GotPaymentsMessage({ message }),
                          }),
                          FrontDoor.view<Message>(h),
                        ],
                      ),
                    ],
                  ),
                  h.submodel({
                    slotId: 'release-catalog',
                    model: model.releaseCatalog,
                    view: releaseCatalogView,
                    toParentMessage: (message) =>
                      GotReleaseCatalogMessage({ message }),
                  }),
                ],
              ),
              h.div(
                [
                  h.Class(
                    'flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]',
                  ),
                ],
                [
                  h.submodel({
                    slotId: 'account-access',
                    model: model.accountAccess,
                    view: accountAccessView,
                    toParentMessage: (message) =>
                      GotAccountAccessMessage({ message }),
                  }),
                  CardOverview.view<Message>(h),
                  h.submodel({
                    slotId: 'transfer-funds',
                    model: model.transferFunds,
                    view: transferFundsView,
                    toParentMessage: (message) =>
                      GotTransferFundsMessage({ message }),
                  }),
                  CoverArt.view<Message>(h),
                  LoadingCard.view<Message>(h),
                ],
              ),
              h.div(
                [
                  h.Class(
                    'flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]',
                  ),
                ],
                [
                  h.submodel({
                    slotId: 'receiving-method',
                    model: model.receivingMethod,
                    view: receivingMethodView,
                    toParentMessage: (message) =>
                      GotReceivingMethodMessage({ message }),
                  }),
                  PowerUsage.view<Message>(h),
                  EmptyConnectBank.view<Message>(h),
                  h.submodel({
                    slotId: 'upcoming-payments',
                    model: model.upcomingPayments,
                    view: upcomingPaymentsView,
                    toParentMessage: (message) =>
                      GotUpcomingPaymentsMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'roller-shades',
                    model: model.rollerShades,
                    view: rollerShadesView,
                    toParentMessage: (message) =>
                      GotRollerShadesMessage({ message }),
                  }),
                ],
              ),
              h.div(
                [
                  h.Class(
                    'flex flex-col p-1 [contain-intrinsic-size:380px_1200px] [content-visibility:auto]',
                  ),
                ],
                [
                  h.submodel({
                    slotId: 'stock-performance',
                    model: model.stockPerformance,
                    view: stockPerformanceView,
                    toParentMessage: (message) =>
                      GotStockPerformanceMessage({ message }),
                  }),
                  EmptyExploreCatalog.view<Message>(h),
                  h.submodel({
                    slotId: 'new-milestone',
                    model: model.newMilestone,
                    view: newMilestoneView,
                    toParentMessage: (message) =>
                      GotNewMilestoneMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'social-links',
                    model: model.socialLinks,
                    view: socialLinksView,
                    toParentMessage: (message) =>
                      GotSocialLinksMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'notification-settings',
                    model: model.notificationSettings,
                    view: notificationSettingsView,
                    toParentMessage: (message) =>
                      GotNotificationSettingsMessage({ message }),
                  }),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );

  return h.div(
    [h.Class('relative min-h-[calc(100vh-3.5rem)]')],
    [
      h.style([], [Preset.presetCss(model.preset)]),
      preview,
      customizer(model, h),
    ],
  );
};

// SUBSCRIPTIONS — cards with sliders need document-level drag subscriptions.

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift(KitchenIsland.subscriptions)<Model, Message>({
    toChildModel: (model) => model.kitchenIsland,
    toParentMessage: (message) => GotKitchenIslandMessage({ message }),
  }),
  Subscription.lift(PayoutThreshold.subscriptions)<Model, Message>({
    toChildModel: (model) => model.payoutThreshold,
    toParentMessage: (message) => GotPayoutThresholdMessage({ message }),
  }),
  Subscription.lift(RollerShades.subscriptions)<Model, Message>({
    toChildModel: (model) => model.rollerShades,
    toParentMessage: (message) => GotRollerShadesMessage({ message }),
  }),
);

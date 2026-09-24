import { Effect, Match as M, Option, Schema as S } from 'effect';
import type { Update } from 'foldkit';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';
import { modifyFields } from 'foldkit/struct';

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
import * as PreviewIcon from '@/demo/icon-preview';

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



























export const Message = defineMessageUnion({
  GotAccountAccessMessage: {
  message: AccountAccess.Message,
},
  GotFaqMessage: {
  message: Faq.Message,
},
  GotKitchenIslandMessage: {
  message: KitchenIsland.Message,
},
  GotNewMilestoneMessage: {
  message: NewMilestone.Message,
},
  GotNotificationSettingsMessage: { message: NotificationSettings.Message },
  GotPaymentsMessage: {
  message: Payments.Message,
},
  GotPayoutThresholdMessage: {
  message: PayoutThreshold.Message,
},
  GotPreferencesMessage: {
  message: Preferences.Message,
},
  GotReceivingMethodMessage: {
  message: ReceivingMethod.Message,
},
  GotRecentTransactionsMessage: {
  message: RecentTransactions.Message,
},
  GotReleaseCatalogMessage: {
  message: ReleaseCatalog.Message,
},
  GotRollerShadesMessage: {
  message: RollerShades.Message,
},
  GotSavingsTargetsMessage: {
  message: SavingsTargets.Message,
},
  GotSocialLinksMessage: {
  message: SocialLinks.Message,
},
  GotStockPerformanceMessage: {
  message: StockPerformance.Message,
},
  GotTransferFundsMessage: {
  message: TransferFunds.Message,
},
  GotUpcomingPaymentsMessage: {
  message: UpcomingPayments.Message,
},
  'ChangedCreatePresetInput': {
  value: S.String,
},
  'AppliedCreatePresetInput': {},
  'ChangedCreatePresetField': {
  field: Preset.Field,
  value: S.String,
},
  'ClickedCopyCreatePreset': {},
  'ClickedShuffleCreatePreset': {},
  CompletedCopyCreatePreset: {},
  CompletedWaitBeforeClearingCreatePresetCopy: {},
  'GotCreatePresetPickerMessage': {
  field: Preset.Field,
  message: Popover.Message,
},
});
export type Message = typeof Message.Type;

type UpdateReturn = Update.Return<Model, Message>;

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
  messages: [Message.CompletedCopyCreatePreset],
  execute: ({ code }) =>
    Effect.promise(() => navigator.clipboard.writeText(code)).pipe(
      Effect.as(Message.CompletedCopyCreatePreset()),
    ),
});
const WaitBeforeClearingPresetCopy = Command.define(
  'WaitBeforeClearingCreatePresetCopy',
  {
    messages: [Message.CompletedWaitBeforeClearingCreatePresetCopy],
    execute: Effect.sleep('1800 millis').pipe(
      Effect.as(Message.CompletedWaitBeforeClearingCreatePresetCopy()),
    ),
  },
);

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ChangedCreatePresetInput: ({ value }) => ({ model: modifyFields(model, { presetInput: () => value, presetError: () => null }) }),
      AppliedCreatePresetInput: () => {
        const preset = Preset.parsePresetInput(model.presetInput);
        return Option.match(preset, {
          onNone: () => ({ model: modifyFields(model, {
                presetError: () =>
                  'Enter a valid shadcn preset code, URL, or --preset flag.',
              }) }),
          onSome: decoded => ({ model: modifyFields(model, {
                preset: () => decoded,
                presetInput: () => Preset.encodePreset(decoded),
                presetError: () => null,
              }) }),
        });
      },
      ChangedCreatePresetField: ({ field, value }) => {
        const preset = { ...model.preset, [field]: value };
        const { model: picker, commands: pickerCommands__ } = Popover.close(model.pickerPopovers[field])
        const commands = pickerCommands__ ?? []
        return { model: modifyFields(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
            pickerPopovers: (current) => ({ ...current, [field]: picker }),
          }), commands: Command.mapMessages(commands, (next) =>
            Message['GotCreatePresetPickerMessage']({ field, message: next }),
          ) };
      },
      ClickedCopyCreatePreset: () => ({ model: model, commands: [CopyPreset({ code: Preset.presetRegistryJson(model.preset) })] }),
      ClickedShuffleCreatePreset: () => {
        const preset = Preset.shufflePreset(model.preset);
        return { model: modifyFields(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }) };
      },
      CompletedCopyCreatePreset: () => ({ model: modifyFields(model, { isPresetCopied: () => true }), commands: [WaitBeforeClearingPresetCopy()] }),
      CompletedWaitBeforeClearingCreatePresetCopy: () => ({ model: modifyFields(model, { isPresetCopied: () => false }) }),
      GotCreatePresetPickerMessage: ({ field, message: childMessage }) => {
        const { model: picker, commands: pickerCommands__ } = Popover.update(
          model.pickerPopovers[field],
          childMessage,
        )
        const commands = pickerCommands__ ?? []
        return { model: modifyFields(model, {
            pickerPopovers: (current) => ({ ...current, [field]: picker }),
          }), commands: Command.mapMessages(commands, (next) =>
            Message['GotCreatePresetPickerMessage']({ field, message: next }),
          ) };
      },
      GotAccountAccessMessage: ({ message: childMessage }) => {
        const { model: accountAccess, commands: accountAccessCommands__ } = AccountAccess.update(
          model.accountAccess,
          childMessage,
        );
        const commands = accountAccessCommands__ ?? []
        return { model: modifyFields(model, { accountAccess: () => accountAccess }), commands: Command.mapMessages(commands, (next) =>
            Message['GotAccountAccessMessage']({ message: next }),
          ) };
      },
      GotFaqMessage: ({ message: childMessage }) => {
        const { model: faq, commands: faqCommands__ } = Faq.update(model.faq, childMessage)
        const commands = faqCommands__ ?? []
        return { model: modifyFields(model, { faq: () => faq }), commands: Command.mapMessages(commands, (next) =>
            Message.GotFaqMessage({ message: next }),
          ) };
      },
      GotKitchenIslandMessage: ({ message: childMessage }) => {
        const { model: kitchenIsland, commands: kitchenIslandCommands__ } = KitchenIsland.update(
          model.kitchenIsland,
          childMessage,
        )
        const commands = kitchenIslandCommands__ ?? []
        return { model: modifyFields(model, { kitchenIsland: () => kitchenIsland }), commands: Command.mapMessages(commands, (next) =>
            Message.GotKitchenIslandMessage({ message: next }),
          ) };
      },
      GotNewMilestoneMessage: ({ message: childMessage }) => {
        const { model: newMilestone, commands: newMilestoneCommands__ } = NewMilestone.update(
          model.newMilestone,
          childMessage,
        )
        const commands = newMilestoneCommands__ ?? []
        return { model: modifyFields(model, { newMilestone: () => newMilestone }), commands: Command.mapMessages(commands, (next) =>
            Message.GotNewMilestoneMessage({ message: next }),
          ) };
      },
      GotNotificationSettingsMessage: ({ message: childMessage }) => {
        const { model: notificationSettings, commands: notificationSettingsCommands__ } = NotificationSettings.update(
          model.notificationSettings,
          childMessage,
        )
        const commands = notificationSettingsCommands__ ?? []
        return { model: modifyFields(model, { notificationSettings: () => notificationSettings }), commands: Command.mapMessages(commands, (next) =>
            Message.GotNotificationSettingsMessage({ message: next }),
          ) };
      },
      GotPaymentsMessage: ({ message: childMessage }) => {
        const { model: payments, commands: paymentsCommands__ } = Payments.update(
          model.payments,
          childMessage,
        )
        const commands = paymentsCommands__ ?? []
        return { model: modifyFields(model, { payments: () => payments }), commands: Command.mapMessages(commands, (next) =>
            Message.GotPaymentsMessage({ message: next }),
          ) };
      },
      GotPayoutThresholdMessage: ({ message: childMessage }) => {
        const { model: payoutThreshold, commands: payoutThresholdCommands__ } = PayoutThreshold.update(
          model.payoutThreshold,
          childMessage,
        )
        const commands = payoutThresholdCommands__ ?? []
        return { model: modifyFields(model, { payoutThreshold: () => payoutThreshold }), commands: Command.mapMessages(commands, (next) =>
            Message.GotPayoutThresholdMessage({ message: next }),
          ) };
      },
      GotPreferencesMessage: ({ message: childMessage }) => {
        const { model: preferences, commands: preferencesCommands__ } = Preferences.update(
          model.preferences,
          childMessage,
        )
        const commands = preferencesCommands__ ?? []
        return { model: modifyFields(model, { preferences: () => preferences }), commands: Command.mapMessages(commands, (next) =>
            Message.GotPreferencesMessage({ message: next }),
          ) };
      },
      GotReceivingMethodMessage: ({ message: childMessage }) => {
        const { model: receivingMethod, commands: receivingMethodCommands__ } = ReceivingMethod.update(
          model.receivingMethod,
          childMessage,
        )
        const commands = receivingMethodCommands__ ?? []
        return { model: modifyFields(model, { receivingMethod: () => receivingMethod }), commands: Command.mapMessages(commands, (next) =>
            Message.GotReceivingMethodMessage({ message: next }),
          ) };
      },
      GotRecentTransactionsMessage: ({ message: childMessage }) => {
        const { model: recentTransactions, commands: recentTransactionsCommands__ } = RecentTransactions.update(
          model.recentTransactions,
          childMessage,
        )
        const commands = recentTransactionsCommands__ ?? []
        return { model: modifyFields(model, { recentTransactions: () => recentTransactions }), commands: Command.mapMessages(commands, (next) =>
            Message.GotRecentTransactionsMessage({ message: next }),
          ) };
      },
      GotReleaseCatalogMessage: ({ message: childMessage }) => {
        const { model: releaseCatalog, commands: releaseCatalogCommands__ } = ReleaseCatalog.update(
          model.releaseCatalog,
          childMessage,
        )
        const commands = releaseCatalogCommands__ ?? []
        return { model: modifyFields(model, { releaseCatalog: () => releaseCatalog }), commands: Command.mapMessages(commands, (next) =>
            Message.GotReleaseCatalogMessage({ message: next }),
          ) };
      },
      GotRollerShadesMessage: ({ message: childMessage }) => {
        const { model: rollerShades, commands: rollerShadesCommands__ } = RollerShades.update(
          model.rollerShades,
          childMessage,
        )
        const commands = rollerShadesCommands__ ?? []
        return { model: modifyFields(model, { rollerShades: () => rollerShades }), commands: Command.mapMessages(commands, (next) =>
            Message.GotRollerShadesMessage({ message: next }),
          ) };
      },
      GotSavingsTargetsMessage: ({ message: childMessage }) => {
        const { model: savingsTargets, commands: savingsTargetsCommands__ } = SavingsTargets.update(
          model.savingsTargets,
          childMessage,
        )
        const commands = savingsTargetsCommands__ ?? []
        return { model: modifyFields(model, { savingsTargets: () => savingsTargets }), commands: Command.mapMessages(commands, (next) =>
            Message.GotSavingsTargetsMessage({ message: next }),
          ) };
      },
      GotSocialLinksMessage: ({ message: childMessage }) => {
        const { model: socialLinks, commands: socialLinksCommands__ } = SocialLinks.update(
          model.socialLinks,
          childMessage,
        )
        const commands = socialLinksCommands__ ?? []
        return { model: modifyFields(model, { socialLinks: () => socialLinks }), commands: Command.mapMessages(commands, (next) =>
            Message.GotSocialLinksMessage({ message: next }),
          ) };
      },
      GotStockPerformanceMessage: ({ message: childMessage }) => {
        const { model: stockPerformance, commands: stockPerformanceCommands__ } = StockPerformance.update(
          model.stockPerformance,
          childMessage,
        )
        const commands = stockPerformanceCommands__ ?? []
        return { model: modifyFields(model, { stockPerformance: () => stockPerformance }), commands: Command.mapMessages(commands, (next) =>
            Message.GotStockPerformanceMessage({ message: next }),
          ) };
      },
      GotTransferFundsMessage: ({ message: childMessage }) => {
        const { model: transferFunds, commands: transferFundsCommands__ } = TransferFunds.update(
          model.transferFunds,
          childMessage,
        )
        const commands = transferFundsCommands__ ?? []
        return { model: modifyFields(model, { transferFunds: () => transferFunds }), commands: Command.mapMessages(commands, (next) =>
            Message.GotTransferFundsMessage({ message: next }),
          ) };
      },
      GotUpcomingPaymentsMessage: ({ message: childMessage }) => {
        const { model: upcomingPayments, commands: upcomingPaymentsCommands__ } = UpcomingPayments.update(
          model.upcomingPayments,
          childMessage,
        )
        const commands = upcomingPaymentsCommands__ ?? []
        return { model: modifyFields(model, { upcomingPayments: () => upcomingPayments }), commands: Command.mapMessages(commands, (next) =>
            Message.GotUpcomingPaymentsMessage({ message: next }),
          ) };
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
          Message['GotCreatePresetPickerMessage']({ field, message }),
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
                  h.OnClick(Message['ChangedCreatePresetField']({ field, value })),
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
              h.DataAttribute('crease-style', model.preset.style),
              h.DataAttribute('icon-library', model.preset.iconLibrary),
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
                    h.OnInput((value) => Message['ChangedCreatePresetInput']({ value })),
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
                      onClick: Message['AppliedCreatePresetInput'](),
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
              onClick: Message['ClickedShuffleCreatePreset'](),
              variant: 'outline',
            },
            h,
          ),
          Button.button(
            {
              class: 'relative w-full bg-white text-black hover:bg-white/90',
              onClick: Message['ClickedCopyCreatePreset'](),
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
                  : ['Copy Registry JSON']),
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
              h.DataAttribute('crease-style', model.preset.style),
              h.DataAttribute('icon-library', model.preset.iconLibrary),
              h.DataAttribute('slot', 'capture-target'),
            ],
            [
              PreviewIcon.spriteDefinitions(h),
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
                      Message.GotPayoutThresholdMessage({ message }),
                  }),
                  ClaimableBalance.view<Message>(h),
                  h.submodel({
                    slotId: 'preferences',
                    model: model.preferences,
                    view: preferencesView,
                    toParentMessage: (message) =>
                      Message.GotPreferencesMessage({ message }),
                  }),
                  SavingsProgress.view<Message>(h),
                  h.submodel({
                    slotId: 'kitchen-island',
                    model: model.kitchenIsland,
                    view: kitchenIslandView,
                    toParentMessage: (message) =>
                      Message.GotKitchenIslandMessage({ message }),
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
                      Message.GotSavingsTargetsMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'recent-transactions',
                    model: model.recentTransactions,
                    view: recentTransactionsView,
                    toParentMessage: (message) =>
                      Message.GotRecentTransactionsMessage({ message }),
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
                              Message.GotFaqMessage({ message }),
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
                              Message.GotPaymentsMessage({ message }),
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
                      Message.GotReleaseCatalogMessage({ message }),
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
                      Message.GotAccountAccessMessage({ message }),
                  }),
                  CardOverview.view<Message>(h),
                  h.submodel({
                    slotId: 'transfer-funds',
                    model: model.transferFunds,
                    view: transferFundsView,
                    toParentMessage: (message) =>
                      Message.GotTransferFundsMessage({ message }),
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
                      Message.GotReceivingMethodMessage({ message }),
                  }),
                  PowerUsage.view<Message>(h),
                  EmptyConnectBank.view<Message>(h),
                  h.submodel({
                    slotId: 'upcoming-payments',
                    model: model.upcomingPayments,
                    view: upcomingPaymentsView,
                    toParentMessage: (message) =>
                      Message.GotUpcomingPaymentsMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'roller-shades',
                    model: model.rollerShades,
                    view: rollerShadesView,
                    toParentMessage: (message) =>
                      Message.GotRollerShadesMessage({ message }),
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
                      Message.GotStockPerformanceMessage({ message }),
                  }),
                  EmptyExploreCatalog.view<Message>(h),
                  h.submodel({
                    slotId: 'new-milestone',
                    model: model.newMilestone,
                    view: newMilestoneView,
                    toParentMessage: (message) =>
                      Message.GotNewMilestoneMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'social-links',
                    model: model.socialLinks,
                    view: socialLinksView,
                    toParentMessage: (message) =>
                      Message.GotSocialLinksMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'notification-settings',
                    model: model.notificationSettings,
                    view: notificationSettingsView,
                    toParentMessage: (message) =>
                      Message.GotNotificationSettingsMessage({ message }),
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
    toParentMessage: (message) => Message.GotKitchenIslandMessage({ message }),
  }),
  Subscription.lift(PayoutThreshold.subscriptions)<Model, Message>({
    toChildModel: (model) => model.payoutThreshold,
    toParentMessage: (message) => Message.GotPayoutThresholdMessage({ message }),
  }),
  Subscription.lift(RollerShades.subscriptions)<Model, Message>({
    toChildModel: (model) => model.rollerShades,
    toParentMessage: (message) => Message.GotRollerShadesMessage({ message }),
  }),
);

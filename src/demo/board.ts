import { Effect, Match as M, Option, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { Command, Subscription } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import { modifyFields } from 'foldkit/struct'

import * as BlocksBlocks from '@/demo/blocks/creaseui-blocks'
import * as BlocksDashboards from '@/demo/blocks/creaseui-dashboards'
import * as AccountAccess from '@/demo/cards/account-access'
import * as CardOverview from '@/demo/cards/card-overview'
import * as ClaimableBalance from '@/demo/cards/claimable-balance'
import * as ContributionHistory from '@/demo/cards/contribution-history'
import * as CoverArt from '@/demo/cards/cover-art'
import * as DividendIncome from '@/demo/cards/dividend-income'
import * as EmptyConnectBank from '@/demo/cards/empty-connect-bank'
import * as EmptyDistributeTrack from '@/demo/cards/empty-distribute-track'
import * as EmptyExploreCatalog from '@/demo/cards/empty-explore-catalog'
import * as Faq from '@/demo/cards/faq'
import * as FrontDoor from '@/demo/cards/front-door'
import * as IndexInvesting from '@/demo/cards/index-investing'
import * as KitchenIsland from '@/demo/cards/kitchen-island'
import * as LoadingCard from '@/demo/cards/loading-card'
import * as NewMilestone from '@/demo/cards/new-milestone'
import * as NotificationSettings from '@/demo/cards/notification-settings'
import * as Payments from '@/demo/cards/payments'
import * as PayoutThreshold from '@/demo/cards/payout-threshold'
import * as PowerUsage from '@/demo/cards/power-usage'
import * as Preferences from '@/demo/cards/preferences'
import * as QrConnect from '@/demo/cards/qr-connect'
import * as ReceivingMethod from '@/demo/cards/receiving-method'
import * as RecentTransactions from '@/demo/cards/recent-transactions'
import * as ReleaseCatalog from '@/demo/cards/release-catalog'
import * as RollerShades from '@/demo/cards/roller-shades'
import * as SavingsProgress from '@/demo/cards/savings-progress'
import * as SavingsTargets from '@/demo/cards/savings-targets'
import * as SidebarNav from '@/demo/cards/sidebar-nav'
import * as SocialLinks from '@/demo/cards/social-links'
import * as StockPerformance from '@/demo/cards/stock-performance'
import * as SyncingState from '@/demo/cards/syncing-state'
import * as TransferFunds from '@/demo/cards/transfer-funds'
import * as UpcomingPayments from '@/demo/cards/upcoming-payments'
import * as Preset from '@/demo/create-preset'
import * as Button from '@/ui/button'
import * as ColorPicker from '@/ui/color-picker'
import * as Popover from '@/ui/popover'
import * as ScrollArea from '@/ui/scroll-area'
import * as Icon from '@/lib/icon'
import * as PreviewIcon from '@/demo/icon-preview'

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
  section: S.Literals(['theme', 'color', 'shape', 'type', 'motion', 'tokens']),
  scheme: S.Literals(['system', 'light', 'dark']),
  tokenScheme: S.Literals(['light', 'dark']),
  openToken: S.NullOr(S.String),
  tokenDrafts: S.Record(S.String, S.String),
  tokenPicker: ColorPicker.Model,
  canvas: S.Literals(['board', 'blocks', 'type', 'palette']),
  pickerPopovers: S.Struct({
    style: Popover.Model,
    base: Popover.Model,
    chartColor: Popover.Model,
    iconLibrary: Popover.Model,
    font: Popover.Model,
    fontHeading: Popover.Model,
    menuAccent: Popover.Model,
    menuColor: Popover.Model,
  }),
})
export type Model = typeof Model.Type

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
  ChangedCreatePresetInput: {
    value: S.String,
  },
  AppliedCreatePresetInput: {},
  ChangedCreatePresetField: {
    field: Preset.Field,
    value: S.String,
  },
  ChangedCreateKnob: {
    knob: Preset.Knob,
    value: S.Number,
  },
  ChangedCreatePresetOption: {
    field: Preset.OptionField,
    value: S.String,
  },
  ChoseCreateTheme: { name: S.String },
  ChoseCreateSection: {
    section: S.Literals([
      'theme',
      'color',
      'shape',
      'type',
      'motion',
      'tokens',
    ]),
  },
  ChoseCreateTokenScheme: {
    scheme: S.Literals(['light', 'dark']),
  },
  ToggledCreateToken: { token: S.String },
  ChangedCreateToken: {
    token: S.String,
    value: S.String,
  },
  GotCreateTokenPickerMessage: {
    message: ColorPicker.Message,
  },
  ClickedResetCreateTokens: {},
  ChoseCreateScheme: { scheme: S.Literals(['system', 'light', 'dark']) },
  ChoseCreateCanvas: {
    canvas: S.Literals(['board', 'blocks', 'type', 'palette']),
  },
  ClickedResetCreatePreset: {},
  ClickedCopyCreatePreset: {},
  ClickedShuffleCreatePreset: {},
  CompletedCopyCreatePreset: {},
  CompletedWaitBeforeClearingCreatePresetCopy: {},
  GotCreatePresetPickerMessage: {
    field: Preset.Field,
    message: Popover.Message,
  },
})
export type Message = typeof Message.Type

type UpdateReturn = Update.Return<Model, Message>

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
  section: 'theme',
  scheme: 'system',
  tokenScheme: 'light',
  openToken: null,
  tokenDrafts: {},
  tokenPicker: ColorPicker.init({ id: 'create-token-picker' }),
  canvas: 'board',
  pickerPopovers: {
    style: Popover.init({ id: 'create-style-picker', isAnimated: true }),
    base: Popover.init({
      id: 'create-base-picker',
      isAnimated: true,
    }),
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
    menuAccent: Popover.init({
      id: 'create-menu-accent-picker',
      isAnimated: true,
    }),
    menuColor: Popover.init({
      id: 'create-menu-color-picker',
      isAnimated: true,
    }),
  },
})

const CopyPreset = Command.define('CopyCreatePreset', {
  args: { code: S.String },
  messages: [Message.CompletedCopyCreatePreset],
  execute: ({ code }) =>
    Effect.promise(() => navigator.clipboard.writeText(code)).pipe(
      Effect.as(Message.CompletedCopyCreatePreset()),
    ),
})
const WaitBeforeClearingPresetCopy = Command.define(
  'WaitBeforeClearingCreatePresetCopy',
  {
    messages: [Message.CompletedWaitBeforeClearingCreatePresetCopy],
    execute: Effect.sleep('1800 millis').pipe(
      Effect.as(Message.CompletedWaitBeforeClearingCreatePresetCopy()),
    ),
  },
)

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ChangedCreatePresetInput: ({ value }) => ({
        model: modifyFields(model, {
          presetInput: () => value,
          presetError: () => null,
        }),
      }),
      AppliedCreatePresetInput: () => {
        const preset = Preset.parsePresetInput(model.presetInput)
        return Option.match(preset, {
          onNone: () => ({
            model: modifyFields(model, {
              presetError: () =>
                'Enter a valid CreaseUI preset code, URL, or --preset flag.',
            }),
          }),
          onSome: decoded => ({
            model: modifyFields(model, {
              preset: () => decoded,
              presetInput: () => Preset.encodePreset(decoded),
              presetError: () => null,
            }),
          }),
        })
      },
      ChangedCreatePresetField: ({ field, value }) => {
        const preset = { ...model.preset, [field]: value }
        const { model: picker, commands: pickerCommands__ } = Popover.close(
          model.pickerPopovers[field],
        )
        const commands = pickerCommands__ ?? []
        return {
          model: modifyFields(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
            pickerPopovers: current => ({ ...current, [field]: picker }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message['GotCreatePresetPickerMessage']({ field, message: next }),
          ),
        }
      },
      ClickedCopyCreatePreset: () => ({
        model: model,
        commands: [
          CopyPreset({ code: Preset.presetRegistryJson(model.preset) }),
        ],
      }),
      ChangedCreatePresetOption: ({ field, value }) => {
        const preset = { ...model.preset, [field]: value }
        return {
          model: modifyFields(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }),
        }
      },
      ChangedCreateKnob: ({ knob, value }) => {
        const preset = {
          ...model.preset,
          [knob]: Preset.fit(Preset.rangeOf(knob), value),
        }
        return {
          model: modifyFields(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }),
        }
      },
      ChoseCreateTheme: ({ name }) => {
        const preset = Preset.presets.find(each => each.name === name)
        if (preset === undefined) return { model: model }
        return {
          model: modifyFields(model, {
            preset: () => preset.config,
            presetInput: () => Preset.encodePreset(preset.config),
            presetError: () => null,
            scheme: () => preset.scheme ?? 'system',
          }),
        }
      },
      ChoseCreateSection: ({ section }) => ({
        model: modifyFields(model, {
          section: () => section,
        }),
      }),
      ChoseCreateScheme: ({ scheme }) => ({
        model: modifyFields(model, {
          scheme: () => scheme,
        }),
      }),
      ChoseCreateTokenScheme: ({ scheme }) => ({
        model: modifyFields(model, {
          tokenScheme: () => scheme,
          openToken: () => null,
        }),
      }),
      ToggledCreateToken: ({ token }) => {
        const opening = model.openToken !== token
        const name = token.startsWith('dark:') ? token.slice(5) : token
        const hex = opening
          ? Option.flatMap(
              Option.fromNullishOr(
                Preset.presetTokens(model.preset, model.tokenScheme)[name],
              ),
              Preset.tokenToHex,
            )
          : Option.none<string>()
        return {
          model: modifyFields(model, {
            openToken: () => (opening ? token : null),
            tokenDrafts: drafts => {
              const { [token]: _dropped, ...rest } = drafts
              return rest
            },
            tokenPicker: picker =>
              Option.isSome(hex)
                ? ColorPicker.reflectValue(picker, hex.value)
                : picker,
          }),
        }
      },
      ChangedCreateToken: ({ token, value }) => {
        /* Drafts hold the raw text so the input never reverts mid-typing;
           overrides only take complete normalized values — a fragment like
           '#f0' would otherwise land in the emitted CSS as invalid. */
        const overrides = { ...model.preset.overrides }
        const normalized = Option.getOrElse(
          Preset.hexToToken(value.trim()),
          () => value.trim(),
        )
        if (Preset.validTokenValue(normalized)) overrides[token] = normalized
        else delete overrides[token]
        const preset = { ...model.preset, overrides }
        return {
          model: modifyFields(model, {
            preset: () => preset,
            tokenDrafts: drafts => ({ ...drafts, [token]: value }),
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }),
        }
      },
      GotCreateTokenPickerMessage: ({ message: pickerMessage }) => {
        /* Picker emits the selected color in its display format; normalize any
           parseable color through oklch so overrides stay on the preset's
           canonical token shape regardless of the format select. The target
           token is the currently open row — the picker only renders there. */
        const next = ColorPicker.update(model.tokenPicker, pickerMessage)
        const normalized =
          model.openToken === null
            ? undefined
            : Option.getOrElse(
                Option.flatMap(Option.fromNullishOr(next.outMessage), change =>
                  Option.flatMap(
                    ColorPicker.parseColorString(change.value),
                    rgb => Preset.hexToToken(ColorPicker.rgbToHex(rgb)),
                  ),
                ),
                () => undefined,
              )
        const preset =
          model.openToken !== null &&
          normalized !== undefined &&
          Preset.validTokenValue(normalized)
            ? {
                ...model.preset,
                overrides: {
                  ...model.preset.overrides,
                  [model.openToken]: normalized,
                },
              }
            : model.preset
        return {
          model: modifyFields(model, {
            tokenPicker: () => next.model,
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }),
          commands: Command.mapMessages(next.commands ?? [], child =>
            Message.GotCreateTokenPickerMessage({ message: child }),
          ),
        }
      },
      ClickedResetCreateTokens: () => {
        const preset = { ...model.preset, overrides: {} }
        return {
          model: modifyFields(model, {
            preset: () => preset,
            tokenDrafts: () => ({}),
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
            openToken: () => null,
          }),
        }
      },
      ChoseCreateCanvas: ({ canvas }) => ({
        model: modifyFields(model, {
          canvas: () => canvas,
        }),
      }),
      ClickedResetCreatePreset: () => ({
        model: modifyFields(model, {
          preset: () => Preset.DEFAULT_CONFIG,
          presetInput: () => Preset.encodePreset(Preset.DEFAULT_CONFIG),
          presetError: () => null,
        }),
      }),
      ClickedShuffleCreatePreset: () => {
        const preset = Preset.shufflePreset()
        return {
          model: modifyFields(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }),
        }
      },
      CompletedCopyCreatePreset: () => ({
        model: modifyFields(model, { isPresetCopied: () => true }),
        commands: [WaitBeforeClearingPresetCopy()],
      }),
      CompletedWaitBeforeClearingCreatePresetCopy: () => ({
        model: modifyFields(model, { isPresetCopied: () => false }),
      }),
      GotCreatePresetPickerMessage: ({ field, message: childMessage }) => {
        const { model: picker, commands: pickerCommands__ } = Popover.update(
          model.pickerPopovers[field],
          childMessage,
        )
        const commands = pickerCommands__ ?? []
        return {
          model: modifyFields(model, {
            pickerPopovers: current => ({ ...current, [field]: picker }),
          }),
          commands: Command.mapMessages(commands, next =>
            Message['GotCreatePresetPickerMessage']({ field, message: next }),
          ),
        }
      },
      GotAccountAccessMessage: ({ message: childMessage }) => {
        const { model: accountAccess, commands: accountAccessCommands__ } =
          AccountAccess.update(model.accountAccess, childMessage)
        const commands = accountAccessCommands__ ?? []
        return {
          model: modifyFields(model, { accountAccess: () => accountAccess }),
          commands: Command.mapMessages(commands, next =>
            Message['GotAccountAccessMessage']({ message: next }),
          ),
        }
      },
      GotFaqMessage: ({ message: childMessage }) => {
        const { model: faq, commands: faqCommands__ } = Faq.update(
          model.faq,
          childMessage,
        )
        const commands = faqCommands__ ?? []
        return {
          model: modifyFields(model, { faq: () => faq }),
          commands: Command.mapMessages(commands, next =>
            Message.GotFaqMessage({ message: next }),
          ),
        }
      },
      GotKitchenIslandMessage: ({ message: childMessage }) => {
        const { model: kitchenIsland, commands: kitchenIslandCommands__ } =
          KitchenIsland.update(model.kitchenIsland, childMessage)
        const commands = kitchenIslandCommands__ ?? []
        return {
          model: modifyFields(model, { kitchenIsland: () => kitchenIsland }),
          commands: Command.mapMessages(commands, next =>
            Message.GotKitchenIslandMessage({ message: next }),
          ),
        }
      },
      GotNewMilestoneMessage: ({ message: childMessage }) => {
        const { model: newMilestone, commands: newMilestoneCommands__ } =
          NewMilestone.update(model.newMilestone, childMessage)
        const commands = newMilestoneCommands__ ?? []
        return {
          model: modifyFields(model, { newMilestone: () => newMilestone }),
          commands: Command.mapMessages(commands, next =>
            Message.GotNewMilestoneMessage({ message: next }),
          ),
        }
      },
      GotNotificationSettingsMessage: ({ message: childMessage }) => {
        const {
          model: notificationSettings,
          commands: notificationSettingsCommands__,
        } = NotificationSettings.update(
          model.notificationSettings,
          childMessage,
        )
        const commands = notificationSettingsCommands__ ?? []
        return {
          model: modifyFields(model, {
            notificationSettings: () => notificationSettings,
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotNotificationSettingsMessage({ message: next }),
          ),
        }
      },
      GotPaymentsMessage: ({ message: childMessage }) => {
        const { model: payments, commands: paymentsCommands__ } =
          Payments.update(model.payments, childMessage)
        const commands = paymentsCommands__ ?? []
        return {
          model: modifyFields(model, { payments: () => payments }),
          commands: Command.mapMessages(commands, next =>
            Message.GotPaymentsMessage({ message: next }),
          ),
        }
      },
      GotPayoutThresholdMessage: ({ message: childMessage }) => {
        const { model: payoutThreshold, commands: payoutThresholdCommands__ } =
          PayoutThreshold.update(model.payoutThreshold, childMessage)
        const commands = payoutThresholdCommands__ ?? []
        return {
          model: modifyFields(model, {
            payoutThreshold: () => payoutThreshold,
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotPayoutThresholdMessage({ message: next }),
          ),
        }
      },
      GotPreferencesMessage: ({ message: childMessage }) => {
        const { model: preferences, commands: preferencesCommands__ } =
          Preferences.update(model.preferences, childMessage)
        const commands = preferencesCommands__ ?? []
        return {
          model: modifyFields(model, { preferences: () => preferences }),
          commands: Command.mapMessages(commands, next =>
            Message.GotPreferencesMessage({ message: next }),
          ),
        }
      },
      GotReceivingMethodMessage: ({ message: childMessage }) => {
        const { model: receivingMethod, commands: receivingMethodCommands__ } =
          ReceivingMethod.update(model.receivingMethod, childMessage)
        const commands = receivingMethodCommands__ ?? []
        return {
          model: modifyFields(model, {
            receivingMethod: () => receivingMethod,
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotReceivingMethodMessage({ message: next }),
          ),
        }
      },
      GotRecentTransactionsMessage: ({ message: childMessage }) => {
        const {
          model: recentTransactions,
          commands: recentTransactionsCommands__,
        } = RecentTransactions.update(model.recentTransactions, childMessage)
        const commands = recentTransactionsCommands__ ?? []
        return {
          model: modifyFields(model, {
            recentTransactions: () => recentTransactions,
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotRecentTransactionsMessage({ message: next }),
          ),
        }
      },
      GotReleaseCatalogMessage: ({ message: childMessage }) => {
        const { model: releaseCatalog, commands: releaseCatalogCommands__ } =
          ReleaseCatalog.update(model.releaseCatalog, childMessage)
        const commands = releaseCatalogCommands__ ?? []
        return {
          model: modifyFields(model, { releaseCatalog: () => releaseCatalog }),
          commands: Command.mapMessages(commands, next =>
            Message.GotReleaseCatalogMessage({ message: next }),
          ),
        }
      },
      GotRollerShadesMessage: ({ message: childMessage }) => {
        const { model: rollerShades, commands: rollerShadesCommands__ } =
          RollerShades.update(model.rollerShades, childMessage)
        const commands = rollerShadesCommands__ ?? []
        return {
          model: modifyFields(model, { rollerShades: () => rollerShades }),
          commands: Command.mapMessages(commands, next =>
            Message.GotRollerShadesMessage({ message: next }),
          ),
        }
      },
      GotSavingsTargetsMessage: ({ message: childMessage }) => {
        const { model: savingsTargets, commands: savingsTargetsCommands__ } =
          SavingsTargets.update(model.savingsTargets, childMessage)
        const commands = savingsTargetsCommands__ ?? []
        return {
          model: modifyFields(model, { savingsTargets: () => savingsTargets }),
          commands: Command.mapMessages(commands, next =>
            Message.GotSavingsTargetsMessage({ message: next }),
          ),
        }
      },
      GotSocialLinksMessage: ({ message: childMessage }) => {
        const { model: socialLinks, commands: socialLinksCommands__ } =
          SocialLinks.update(model.socialLinks, childMessage)
        const commands = socialLinksCommands__ ?? []
        return {
          model: modifyFields(model, { socialLinks: () => socialLinks }),
          commands: Command.mapMessages(commands, next =>
            Message.GotSocialLinksMessage({ message: next }),
          ),
        }
      },
      GotStockPerformanceMessage: ({ message: childMessage }) => {
        const {
          model: stockPerformance,
          commands: stockPerformanceCommands__,
        } = StockPerformance.update(model.stockPerformance, childMessage)
        const commands = stockPerformanceCommands__ ?? []
        return {
          model: modifyFields(model, {
            stockPerformance: () => stockPerformance,
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotStockPerformanceMessage({ message: next }),
          ),
        }
      },
      GotTransferFundsMessage: ({ message: childMessage }) => {
        const { model: transferFunds, commands: transferFundsCommands__ } =
          TransferFunds.update(model.transferFunds, childMessage)
        const commands = transferFundsCommands__ ?? []
        return {
          model: modifyFields(model, { transferFunds: () => transferFunds }),
          commands: Command.mapMessages(commands, next =>
            Message.GotTransferFundsMessage({ message: next }),
          ),
        }
      },
      GotUpcomingPaymentsMessage: ({ message: childMessage }) => {
        const {
          model: upcomingPayments,
          commands: upcomingPaymentsCommands__,
        } = UpcomingPayments.update(model.upcomingPayments, childMessage)
        const commands = upcomingPaymentsCommands__ ?? []
        return {
          model: modifyFields(model, {
            upcomingPayments: () => upcomingPayments,
          }),
          commands: Command.mapMessages(commands, next =>
            Message.GotUpcomingPaymentsMessage({ message: next }),
          ),
        }
      },
    }),
  )

const accountAccessView = defineView<
  AccountAccess.Model,
  AccountAccess.Message
>(AccountAccess.view)
const faqView = defineView<Faq.Model, Faq.Message>(Faq.view)
const kitchenIslandView = defineView<
  KitchenIsland.Model,
  KitchenIsland.Message
>(KitchenIsland.view)
const newMilestoneView = defineView<NewMilestone.Model, NewMilestone.Message>(
  NewMilestone.view,
)
const notificationSettingsView = defineView<
  NotificationSettings.Model,
  NotificationSettings.Message
>(NotificationSettings.view)
const paymentsView = defineView<Payments.Model, Payments.Message>(Payments.view)
const payoutThresholdView = defineView<
  PayoutThreshold.Model,
  PayoutThreshold.Message
>(PayoutThreshold.view)
const preferencesView = defineView<Preferences.Model, Preferences.Message>(
  Preferences.view,
)
const receivingMethodView = defineView<
  ReceivingMethod.Model,
  ReceivingMethod.Message
>(ReceivingMethod.view)
const recentTransactionsView = defineView<
  RecentTransactions.Model,
  RecentTransactions.Message
>(RecentTransactions.view)
const releaseCatalogView = defineView<
  ReleaseCatalog.Model,
  ReleaseCatalog.Message
>(ReleaseCatalog.view)
const rollerShadesView = defineView<RollerShades.Model, RollerShades.Message>(
  RollerShades.view,
)
const savingsTargetsView = defineView<
  SavingsTargets.Model,
  SavingsTargets.Message
>(SavingsTargets.view)
const socialLinksView = defineView<SocialLinks.Model, SocialLinks.Message>(
  SocialLinks.view,
)
const stockPerformanceView = defineView<
  StockPerformance.Model,
  StockPerformance.Message
>(StockPerformance.view)
const transferFundsView = defineView<
  TransferFunds.Model,
  TransferFunds.Message
>(TransferFunds.view)
const upcomingPaymentsView = defineView<
  UpcomingPayments.Model,
  UpcomingPayments.Message
>(UpcomingPayments.view)

const titleCase = (value: string): string =>
  value
    .split('-')
    .map(part => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')

/* The customizer chrome is a fixed dark inspector surface in both schemes, so
   it intentionally uses dark-only colors rather than theme tokens. */
const DARK_CHROME =
  'dark bg-[#282828] text-white shadow-xl ring-1 ring-white/10'
const CHROME_BUTTON =
  'w-full border-white/10 bg-transparent text-white hover:bg-white/[0.06] dark:bg-transparent'
const TINY_LABEL = 'font-mono text-[10px]'

const customizer = (model: Model, h: HtmlBuilder<Message>): Html => {
  const chromeButton = (label: string, onClick: Message): Html =>
    Button.button(
      {
        class: CHROME_BUTTON,
        children: [label],
        onClick,
        variant: 'outline',
      },
      h,
    )

  const picker = (
    label: string,
    field: Preset.Field,
    values: readonly string[],
    marker?: string,
  ): Html =>
    Popover.popover<Message>(
      {
        model: model.pickerPopovers[field],
        toParentMessage: message =>
          Message['GotCreatePresetPickerMessage']({ field, message }),
        side: 'right',
        align: 'start',
        triggerClass:
          'relative flex h-16.5 w-full items-end justify-between rounded-lg border border-white/10 bg-white/[0.035] px-3 pb-2.5 text-left shadow-none outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30',
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
            children: values.map(value => {
              const isSelected = model.preset[field] === value
              return h.button(
                [
                  h.Type('button'),
                  h.OnClick(
                    Message['ChangedCreatePresetField']({ field, value }),
                  ),
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
              )
            }),
          },
          h,
        ),
      },
      h,
    )

  const pairs = (
    values: readonly string[],
  ): ReadonlyArray<readonly [string, string]> =>
    values.map(value => [value, titleCase(value)] as const)

  const seg = (
    label: string,
    options: ReadonlyArray<readonly [string, string]>,
    current: string,
    onPick: (value: string) => Message,
  ): Html =>
    h.div(
      [h.Class('space-y-1.5'), h.DataAttribute('seg', label)],
      [
        h.div([h.Class('text-xs font-medium text-white/60')], [label]),
        h.div(
          [h.Class('flex flex-wrap gap-1')],
          options.map(([value, optionLabel]) =>
            h.button(
              [
                h.Type('button'),
                h.OnClick(onPick(value)),
                h.Class(
                  `rounded-md px-2 py-1 text-xs font-medium transition-colors ${value === current ? 'bg-white text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white'}`,
                ),
              ],
              [optionLabel],
            ),
          ),
        ),
      ],
    )

  const fieldSeg = (
    label: string,
    field: Preset.Field,
    values: readonly string[],
  ): Html =>
    seg(label, pairs(values), model.preset[field], value =>
      Message['ChangedCreatePresetField']({ field, value }),
    )

  const optionSeg = (
    label: string,
    field: Preset.OptionField,
    values: readonly string[],
  ): Html =>
    seg(label, pairs(values), model.preset[field], value =>
      Message['ChangedCreatePresetOption']({ field, value }),
    )

  const knob = (key: Preset.Knob): Html => {
    const range = Preset.rangeOf(key)
    const value = model.preset[key]
    return h.div(
      [h.Class('space-y-1.5')],
      [
        h.div(
          [h.Class('flex items-baseline justify-between')],
          [
            h.span(
              [h.Class('text-xs font-medium text-white/60')],
              [range.label],
            ),
            h.span(
              [h.Class(`${TINY_LABEL} text-white/50`)],
              [`${value}${range.unit}`],
            ),
          ],
        ),
        h.input([
          h.Type('range'),
          h.Min(String(range.min)),
          h.Max(String(range.max)),
          h.Step(String(range.step)),
          h.Value(String(value)),
          h.AriaLabel(range.label),
          h.OnInput(next =>
            Message['ChangedCreateKnob']({ knob: key, value: Number(next) }),
          ),
          h.Class('w-full accent-white'),
        ]),
      ],
    )
  }

  const tile = (preset: Preset.Preset): Html => {
    const config = preset.config
    const baseH = Preset.baseHue(config)
    return h.button(
      [
        h.Type('button'),
        h.OnClick(Message['ChoseCreateTheme']({ name: preset.name })),
        h.Title(preset.description),
        h.Class(
          `flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-colors ${
            Preset.sameConfig(config, model.preset)
              ? 'border-white/40 bg-white/10'
              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
          }`,
        ),
      ],
      [
        h.span(
          [h.Class('flex h-8 items-end gap-1')],
          [
            h.span(
              [
                h.Class('size-3.5 rounded-full ring-1 ring-white/10'),
                h.Style({
                  background: `oklch(${config.surfaceLightness}% ${config.surfaceSaturation} ${baseH})`,
                }),
              ],
              [],
            ),
            h.span(
              [
                h.Class('size-3.5 rounded-full ring-1 ring-white/10'),
                h.Style({
                  background: `oklch(${config.lightness}% ${config.chroma} ${config.hue})`,
                }),
              ],
              [],
            ),
          ],
        ),
        h.span([h.Class('truncate text-xs font-medium')], [preset.name]),
      ],
    )
  }

  const sectionTab = (section: Model['section'], label: string): Html =>
    h.button(
      [
        h.Type('button'),
        h.OnClick(Message['ChoseCreateSection']({ section })),
        h.Class(
          `rounded-md px-1 py-1.5 text-[11px] font-semibold transition-colors ${
            model.section === section
              ? 'bg-white text-black'
              : 'text-white/60 hover:text-white'
          }`,
        ),
      ],
      [label],
    )

  const pane = (children: ReadonlyArray<Html>): Html =>
    h.div([h.Class('space-y-5 p-4')], [...children])

  /* tweakcn-style token editor: derived values plus per-scheme overrides. */
  const tokenGroups: ReadonlyArray<
    readonly [string, ReadonlyArray<Preset.OverridableToken>]
  > = [
    ['Primary', ['primary', 'primary-foreground']],
    ['Secondary', ['secondary', 'secondary-foreground']],
    ['Accent', ['accent', 'accent-foreground']],
    ['Base', ['background', 'foreground']],
    ['Card', ['card', 'card-foreground']],
    ['Popover', ['popover', 'popover-foreground']],
    ['Muted', ['muted', 'muted-foreground']],
    ['Destructive', ['destructive', 'destructive-foreground']],
    ['Border & Input', ['border', 'input', 'ring']],
    ['Chart', ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']],
    [
      'Sidebar',
      [
        'sidebar',
        'sidebar-foreground',
        'sidebar-primary',
        'sidebar-primary-foreground',
        'sidebar-accent',
        'sidebar-accent-foreground',
      ],
    ],
  ]
  const effectiveTokens = Preset.presetTokens(model.preset, model.tokenScheme)
  const customCount = Object.keys(model.preset.overrides).length

  const tokenEditor = (
    token: string,
    key: string,
    value: string,
    hex: Option.Option<string>,
  ): Html => {
    const setValue = (value: string): Message =>
      Message['ChangedCreateToken']({ token: key, value })
    const shown = model.tokenDrafts[key] ?? Option.getOrElse(hex, () => value)
    return h.div(
      [
        h.Class(
          'space-y-2 rounded-lg border border-white/10 bg-black/30 p-2.5',
        ),
      ],
      [
        h.div(
          [h.Class('flex items-center gap-2')],
          [
            h.input([
              h.Type('text'),
              h.Value(shown),
              h.AriaLabel(`${token} value`),
              h.Placeholder('#rrggbb or oklch(…)'),
              h.OnInput(setValue),
              h.Class(
                'h-8 min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-2 font-mono text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              ),
            ]),
            h.button(
              [
                h.Type('button'),
                h.AriaLabel(`Reset ${token}`),
                h.OnClick(setValue('')),
                h.Class(
                  'h-8 shrink-0 rounded-md border border-white/10 px-2 text-xs font-semibold text-white/70 hover:bg-white/[0.08]',
                ),
              ],
              ['Reset'],
            ),
          ],
        ),
        ...(Option.isSome(hex)
          ? [
              h.div(
                [h.Class('[&_[data-slot=color-picker]]:w-full')],
                [
                  ColorPicker.colorPicker(
                    {
                      model: model.tokenPicker,
                      toParentMessage: message =>
                        Message.GotCreateTokenPickerMessage({ message }),
                      inline: true,
                    },
                    h,
                  ),
                ],
              ),
            ]
          : []),
        h.p([h.Class('truncate font-mono text-xs text-white/40')], [value]),
      ],
    )
  }

  const tokenRow = (token: Preset.OverridableToken): Html => {
    const key = model.tokenScheme === 'dark' ? `dark:${token}` : token
    const value = effectiveTokens[token] ?? ''
    const overridden = key in model.preset.overrides
    const open = model.openToken === key
    const pair = token.endsWith('-foreground')
      ? token.slice(0, -'-foreground'.length)
      : null
    const ratio =
      pair === null
        ? Option.none<number>()
        : Preset.contrastRatio(value, effectiveTokens[pair] ?? '')
    return h.div(
      [h.DataAttribute('token', key)],
      [
        h.button(
          [
            h.Type('button'),
            h.Id(`create-token-${key.replaceAll(':', '-')}`),
            h.AriaExpanded(open),
            h.OnClick(Message['ToggledCreateToken']({ token: key })),
            h.Class(
              `flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                overridden
                  ? 'border-white/30 bg-white/[0.06]'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`,
            ),
          ],
          [
            h.span(
              [
                h.Class(
                  'size-6 shrink-0 rounded-md ring-1 ring-inset ring-white/15',
                ),
                h.Style({ background: value }),
              ],
              [],
            ),
            h.span(
              [h.Class('min-w-0 flex-1')],
              [
                h.span(
                  [h.Class('block text-xs font-medium leading-tight')],
                  [token],
                ),
                h.span(
                  [
                    h.Class(
                      'block truncate font-mono text-xs leading-tight text-white/50',
                    ),
                  ],
                  [value],
                ),
              ],
            ),
            ...Option.match(ratio, {
              onNone: () => [],
              onSome: each => [
                h.span(
                  [
                    h.Class(
                      `shrink-0 rounded px-1 py-0.5 text-xs font-semibold ${
                        each >= 4.5
                          ? 'bg-success/20 text-success'
                          : each >= 3
                            ? 'bg-warning/20 text-warning'
                            : 'bg-destructive/20 text-destructive'
                      }`,
                    ),
                  ],
                  [each.toFixed(1)],
                ),
              ],
            }),
            ...(overridden
              ? [
                  h.span(
                    [
                      h.Class(
                        'shrink-0 rounded bg-white/15 px-1 py-0.5 text-xs font-semibold uppercase',
                      ),
                    ],
                    ['custom'],
                  ),
                ]
              : []),
          ],
        ),
        ...(open
          ? [tokenEditor(token, key, value, Preset.tokenToHex(value))]
          : []),
      ],
    )
  }

  const tokenSchemeTab = (scheme: Model['tokenScheme'], label: string): Html =>
    h.button(
      [
        h.Type('button'),
        h.OnClick(Message['ChoseCreateTokenScheme']({ scheme })),
        h.Class(
          `rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
            model.tokenScheme === scheme
              ? 'bg-white text-black'
              : 'text-white/60 hover:text-white'
          }`,
        ),
      ],
      [label],
    )

  const panes: Record<Model['section'], Html> = {
    theme: pane([
      h.div([h.Class('grid grid-cols-2 gap-2')], Preset.presets.map(tile)),
      fieldSeg('Style', 'style', Preset.STYLES),
      fieldSeg('Icons', 'iconLibrary', Preset.ICON_LIBRARIES),
    ]),
    color: pane([
      knob('hue'),
      knob('chroma'),
      knob('lightness'),
      picker('Base', 'base', Preset.BASES, 'bg-zinc-400'),
      knob('surfaceSaturation'),
      knob('surfaceLightness'),
      knob('surfaceLightnessDark'),
      knob('surfaceContrast'),
      optionSeg('Hover', 'hover', Preset.HOVERS),
      picker('Chart', 'chartColor', Preset.THEMES, 'bg-chart-1'),
      fieldSeg('Menu accent', 'menuAccent', Preset.MENU_ACCENTS),
      fieldSeg('Menu color', 'menuColor', Preset.MENU_COLORS),
    ]),
    shape: pane([
      knob('radius'),
      optionSeg('Controls', 'controlShape', Preset.CONTROL_SHAPES),
      knob('border'),
      optionSeg('Outlines', 'outlines', Preset.OUTLINES),
      knob('shadow'),
      optionSeg('Shadow style', 'shadowStyle', Preset.SHADOW_STYLES),
      optionSeg('Relief', 'relief', Preset.RELIEFS),
    ]),
    type: pane([
      picker('Font', 'font', Preset.FONTS),
      picker('Heading font', 'fontHeading', Preset.FONT_HEADINGS),
      knob('textScale'),
      knob('headingScale'),
      knob('leading'),
      knob('headingWeight'),
      knob('tracking'),
    ]),
    motion: pane([
      knob('motion'),
      optionSeg('Easing', 'easing', Preset.EASINGS),
    ]),
    tokens: pane([
      h.div(
        [h.Class('flex items-center justify-between gap-2')],
        [
          h.div(
            [h.Class('flex gap-1 rounded-lg bg-white/[0.04] p-1')],
            [tokenSchemeTab('light', 'Light'), tokenSchemeTab('dark', 'Dark')],
          ),
          ...(customCount > 0
            ? [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick(Message['ClickedResetCreateTokens']()),
                    h.Class(
                      'rounded-md border border-white/10 px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/[0.08]',
                    ),
                  ],
                  [`Clear ${customCount} custom`],
                ),
              ]
            : []),
        ],
      ),
      ...tokenGroups.map(([group, tokens]) =>
        h.div(
          [h.Class('space-y-1.5')],
          [
            h.div(
              [
                h.Class(
                  'text-xs font-semibold uppercase tracking-wider text-white/40',
                ),
              ],
              [group],
            ),
            ...tokens.map(tokenRow),
          ],
        ),
      ),
    ]),
  }

  return h.aside(
    [
      h.Class(
        `${DARK_CHROME} fixed top-19 bottom-5 left-5 z-30 flex w-70.5 flex-col overflow-hidden rounded-2xl max-lg:right-3 max-lg:left-3 max-lg:w-auto`,
      ),
    ],
    [
      h.div(
        [h.Class('space-y-3 border-b border-white/10 p-4')],
        [
          h.div(
            [
              h.Class(
                'flex h-12 items-center justify-between rounded-xl border border-white/10 px-4',
              ),
            ],
            [
              h.h1([h.Class('text-sm font-semibold')], ['Theme']),
              Icon.icon('menu', { class: 'size-5 text-white/80' }, h),
            ],
          ),
          h.div(
            [h.Class('grid grid-cols-3 gap-1 rounded-lg bg-white/[0.04] p-1')],
            [
              sectionTab('theme', 'Themes'),
              sectionTab('color', 'Color'),
              sectionTab('shape', 'Shape'),
              sectionTab('type', 'Type'),
              sectionTab('motion', 'Motion'),
              sectionTab('tokens', 'Tokens'),
            ],
          ),
        ],
      ),
      ScrollArea.scrollArea<Message>(
        {
          class: 'min-h-0 flex-1',
          children: [panes[model.section]],
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
                    h.OnInput(value =>
                      Message['ChangedCreatePresetInput']({ value }),
                    ),
                    h.Placeholder('Paste code or CreaseUI URL'),
                    h.Class(
                      'h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 font-mono text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                    ),
                  ]),
                  chromeButton(
                    'Apply Preset',
                    Message['AppliedCreatePresetInput'](),
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
          h.div(
            [h.Class('grid grid-cols-2 gap-2')],
            [
              chromeButton('Shuffle', Message['ClickedShuffleCreatePreset']()),
              chromeButton('Reset', Message['ClickedResetCreatePreset']()),
            ],
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
  )
}

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const schemeSuffix = model.scheme === 'system' ? '' : ` ${model.scheme}`
  const themeClass = `create-board-theme${schemeSuffix}`

  const boardColumns: ReadonlyArray<Html> = [
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
          toParentMessage: message =>
            Message.GotPayoutThresholdMessage({ message }),
        }),
        ClaimableBalance.view<Message>(h),
        h.submodel({
          slotId: 'preferences',
          model: model.preferences,
          view: preferencesView,
          toParentMessage: message =>
            Message.GotPreferencesMessage({ message }),
        }),
        SavingsProgress.view<Message>(h),
        h.submodel({
          slotId: 'kitchen-island',
          model: model.kitchenIsland,
          view: kitchenIslandView,
          toParentMessage: message =>
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
          toParentMessage: message =>
            Message.GotSavingsTargetsMessage({ message }),
        }),
        h.submodel({
          slotId: 'recent-transactions',
          model: model.recentTransactions,
          view: recentTransactionsView,
          toParentMessage: message =>
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
                  toParentMessage: message =>
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
                  toParentMessage: message =>
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
          toParentMessage: message =>
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
          toParentMessage: message =>
            Message.GotAccountAccessMessage({ message }),
        }),
        CardOverview.view<Message>(h),
        h.submodel({
          slotId: 'transfer-funds',
          model: model.transferFunds,
          view: transferFundsView,
          toParentMessage: message =>
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
          toParentMessage: message =>
            Message.GotReceivingMethodMessage({ message }),
        }),
        PowerUsage.view<Message>(h),
        EmptyConnectBank.view<Message>(h),
        h.submodel({
          slotId: 'upcoming-payments',
          model: model.upcomingPayments,
          view: upcomingPaymentsView,
          toParentMessage: message =>
            Message.GotUpcomingPaymentsMessage({ message }),
        }),
        h.submodel({
          slotId: 'roller-shades',
          model: model.rollerShades,
          view: rollerShadesView,
          toParentMessage: message =>
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
          toParentMessage: message =>
            Message.GotStockPerformanceMessage({ message }),
        }),
        EmptyExploreCatalog.view<Message>(h),
        h.submodel({
          slotId: 'new-milestone',
          model: model.newMilestone,
          view: newMilestoneView,
          toParentMessage: message =>
            Message.GotNewMilestoneMessage({ message }),
        }),
        h.submodel({
          slotId: 'social-links',
          model: model.socialLinks,
          view: socialLinksView,
          toParentMessage: message =>
            Message.GotSocialLinksMessage({ message }),
        }),
        h.submodel({
          slotId: 'notification-settings',
          model: model.notificationSettings,
          view: notificationSettingsView,
          toParentMessage: message =>
            Message.GotNotificationSettingsMessage({ message }),
        }),
      ],
    ),
  ]

  const themedGrid = (columnsClass: string): Html =>
    h.div(
      [
        h.Class(
          `${themeClass} grid ${columnsClass} items-start gap-(--gap) bg-muted p-(--gap) dark:bg-background *:[div]:gap-(--gap)`,
        ),
        h.DataAttribute('crease-style', model.preset.style),
        h.DataAttribute('icon-library', model.preset.iconLibrary),
        h.DataAttribute('slot', 'capture-target'),
      ],
      [...boardColumns],
    )

  const typeCanvas = h.div(
    [h.Class(`${themeClass} w-190 bg-background p-10 text-foreground`)],
    [
      h.div(
        [h.Class('mx-auto max-w-130 space-y-8')],
        [
          h.div(
            [h.Class('space-y-1')],
            [
              h.h1(
                [h.Class('text-4xl font-bold tracking-tight')],
                ['Heading 1'],
              ),
              h.h2(
                [h.Class('text-3xl font-semibold tracking-tight')],
                ['Heading 2'],
              ),
              h.h3([h.Class('text-2xl font-semibold')], ['Heading 3']),
              h.h4([h.Class('text-xl font-medium')], ['Heading 4']),
            ],
          ),
          h.p(
            [h.Class('text-base leading-7')],
            [
              'Body copy sits at the text scale — the quick brown fox jumps over the lazy dog, and every paragraph underneath follows the same leading.',
            ],
          ),
          h.p(
            [h.Class('text-sm leading-6 text-muted-foreground')],
            [
              'Muted text for supporting details, captions and secondary descriptions.',
            ],
          ),
          h.blockquote(
            [h.Class('border-l-2 border-border pl-4 italic')],
            [
              '\u201cA quotation block, drawn with the theme\u2019s border and ink.\u201d',
            ],
          ),
          h.ul(
            [h.Class('list-disc space-y-1 pl-6')],
            [
              h.li([], ['First list item']),
              h.li([], ['Second list item']),
              h.li([], ['Third list item']),
            ],
          ),
          h.p(
            [],
            [
              'Inline ',
              h.code(
                [h.Class('rounded bg-muted px-1.5 py-0.5 font-mono text-sm')],
                ['code'],
              ),
              ' inside a paragraph.',
            ],
          ),
        ],
      ),
    ],
  )

  const SWATCHES: ReadonlyArray<readonly [string, string]> = [
    ['Background', '--background'],
    ['Foreground', '--foreground'],
    ['Card', '--card'],
    ['Popover', '--popover'],
    ['Primary', '--primary'],
    ['Primary fg', '--primary-foreground'],
    ['Secondary', '--secondary'],
    ['Secondary fg', '--secondary-foreground'],
    ['Muted', '--muted'],
    ['Muted fg', '--muted-foreground'],
    ['Accent', '--accent'],
    ['Accent fg', '--accent-foreground'],
    ['Border', '--border'],
    ['Input', '--input'],
    ['Ring', '--ring'],
    ['Chart 1', '--chart-1'],
    ['Chart 2', '--chart-2'],
    ['Chart 3', '--chart-3'],
    ['Chart 4', '--chart-4'],
    ['Chart 5', '--chart-5'],
    ['Sidebar', '--sidebar'],
    ['Sidebar fg', '--sidebar-foreground'],
    ['Sidebar accent', '--sidebar-accent'],
    ['Sidebar accent fg', '--sidebar-accent-foreground'],
  ]

  const paletteCanvas = h.div(
    [h.Class(`${themeClass} w-220 bg-background p-8`)],
    [
      h.div(
        [h.Class('grid grid-cols-4 gap-3 3xl:grid-cols-6')],
        SWATCHES.map(([label, token]) =>
          h.div(
            [
              h.Class(
                'overflow-hidden rounded-lg border border-border bg-card',
              ),
            ],
            [
              h.div(
                [h.Class('h-16'), h.Style({ background: `var(${token})` })],
                [],
              ),
              h.div(
                [h.Class('border-t border-border px-2 py-1.5')],
                [
                  h.div(
                    [h.Class('text-xs font-medium text-foreground')],
                    [label],
                  ),
                  h.div(
                    [h.Class(`${TINY_LABEL} text-muted-foreground`)],
                    [`var(${token})`],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ],
  )

  const blockFrame = (title: string, block: Html): Html =>
    h.div(
      [
        h.Class(
          'overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-border',
        ),
      ],
      [
        h.div(
          [h.Class('flex items-center gap-2 border-b border-border px-4 py-2')],
          [
            h.span(
              [h.Class(`${TINY_LABEL} uppercase text-muted-foreground`)],
              [title],
            ),
          ],
        ),
        block,
      ],
    )

  /* Real blocks from the /blocks catalog, each framed so the canvas reads as
     distinct pieces rather than a squashed card grid. */
  const blocksCanvas = h.div(
    [
      h.Class(
        `${themeClass} flex w-280 flex-col gap-(--gap) bg-muted p-(--gap) dark:bg-background`,
      ),
      h.DataAttribute('crease-style', model.preset.style),
      h.DataAttribute('icon-library', model.preset.iconLibrary),
      h.DataAttribute('slot', 'capture-target'),
    ],
    [
      blockFrame('Kanban board', BlocksBlocks.kanbanBoard<Message>(h)),
      blockFrame(
        'Incident console',
        BlocksDashboards.incidentConsoleDashboard<Message>(h),
      ),
      blockFrame('Order detail', BlocksBlocks.orderDetail<Message>(h)),
    ],
  )

  const canvases: Record<Model['canvas'], Html> = {
    board: themedGrid('w-600 grid-cols-7 md:w-750'),
    blocks: blocksCanvas,
    type: typeCanvas,
    palette: paletteCanvas,
  }

  const toolbarSeg = <V extends string>(
    options: ReadonlyArray<readonly [V, string]>,
    current: V,
    onPick: (value: V) => Message,
  ): Html =>
    h.div(
      [h.Class('flex gap-0.5 rounded-lg bg-white/[0.04] p-1')],
      options.map(([value, label]) =>
        h.button(
          [
            h.Type('button'),
            h.OnClick(onPick(value)),
            h.Class(
              `rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${value === current ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`,
            ),
          ],
          [label],
        ),
      ),
    )

  const toolbar = h.div(
    [
      h.Class(
        `${DARK_CHROME} fixed top-19 right-5 z-30 flex items-center gap-2 rounded-2xl p-2 max-lg:right-3`,
      ),
    ],
    [
      toolbarSeg(
        [
          ['board', 'Board'],
          ['blocks', 'Blocks'],
          ['type', 'Type'],
          ['palette', 'Palette'],
        ],
        model.canvas,
        value => Message['ChoseCreateCanvas']({ canvas: value }),
      ),
      h.div([h.Class('mx-0.5 h-5 w-px bg-white/10')], []),
      toolbarSeg(
        [
          ['system', 'Auto'],
          ['light', 'Light'],
          ['dark', 'Dark'],
        ],
        model.scheme,
        value => Message['ChoseCreateScheme']({ scheme: value }),
      ),
    ],
  )

  const preview = h.div(
    [
      h.Class(
        'overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] lg:pl-82.5 dark:bg-background',
      ),
    ],
    [
      h.div(
        [h.Class(`flex w-full min-w-max justify-center${schemeSuffix}`)],
        [canvases[model.canvas]],
      ),
    ],
  )

  return h.main(
    [h.Class('relative min-h-[calc(100vh-3.5rem)]')],
    [
      h.style([], [Preset.presetCss(model.preset)]),
      toolbar,
      preview,
      customizer(model, h),
    ],
  )
}

// SUBSCRIPTIONS — cards with sliders need document-level drag subscriptions.

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift(KitchenIsland.subscriptions)<Model, Message>({
    toChildModel: model => model.kitchenIsland,
    toParentMessage: message => Message.GotKitchenIslandMessage({ message }),
  }),
  Subscription.lift(PayoutThreshold.subscriptions)<Model, Message>({
    toChildModel: model => model.payoutThreshold,
    toParentMessage: message => Message.GotPayoutThresholdMessage({ message }),
  }),
  Subscription.lift(RollerShades.subscriptions)<Model, Message>({
    toChildModel: model => model.rollerShades,
    toParentMessage: message => Message.GotRollerShadesMessage({ message }),
  }),
  ColorPicker.subscriptions<Model, Message>({
    id: 'create-token-picker',
    toChildModel: model => model.tokenPicker,
    toParentMessage: message =>
      Message.GotCreateTokenPickerMessage({ message }),
  }),
)

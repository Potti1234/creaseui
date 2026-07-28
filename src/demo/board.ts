import { Match as M, Schema as S } from 'effect'
import { Command, Subscription } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'
import { evo } from 'foldkit/struct'

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
})
export type Model = typeof Model.Type

export const GotAccountAccessMessage = m('GotAccountAccessMessage', {
  message: AccountAccess.Message,
})
export const GotFaqMessage = m('GotFaqMessage', {
  message: Faq.Message,
})
export const GotKitchenIslandMessage = m('GotKitchenIslandMessage', {
  message: KitchenIsland.Message,
})
export const GotNewMilestoneMessage = m('GotNewMilestoneMessage', {
  message: NewMilestone.Message,
})
export const GotNotificationSettingsMessage = m(
  'GotNotificationSettingsMessage',
  { message: NotificationSettings.Message },
)
export const GotPaymentsMessage = m('GotPaymentsMessage', {
  message: Payments.Message,
})
export const GotPayoutThresholdMessage = m('GotPayoutThresholdMessage', {
  message: PayoutThreshold.Message,
})
export const GotPreferencesMessage = m('GotPreferencesMessage', {
  message: Preferences.Message,
})
export const GotReceivingMethodMessage = m('GotReceivingMethodMessage', {
  message: ReceivingMethod.Message,
})
export const GotRecentTransactionsMessage = m(
  'GotRecentTransactionsMessage',
  { message: RecentTransactions.Message },
)
export const GotReleaseCatalogMessage = m('GotReleaseCatalogMessage', {
  message: ReleaseCatalog.Message,
})
export const GotRollerShadesMessage = m('GotRollerShadesMessage', {
  message: RollerShades.Message,
})
export const GotSavingsTargetsMessage = m('GotSavingsTargetsMessage', {
  message: SavingsTargets.Message,
})
export const GotSocialLinksMessage = m('GotSocialLinksMessage', {
  message: SocialLinks.Message,
})
export const GotStockPerformanceMessage = m('GotStockPerformanceMessage', {
  message: StockPerformance.Message,
})
export const GotTransferFundsMessage = m('GotTransferFundsMessage', {
  message: TransferFunds.Message,
})
export const GotUpcomingPaymentsMessage = m('GotUpcomingPaymentsMessage', {
  message: UpcomingPayments.Message,
})

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
])
export type Message = typeof Message.Type

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

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
})

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotAccountAccessMessage: ({ message: childMessage }) => {
        const [accountAccess, commands] = AccountAccess.update(
          model.accountAccess,
          childMessage,
        )
        return [
          evo(model, { accountAccess: () => accountAccess }),
          commands,
        ]
      },
      GotFaqMessage: ({ message: childMessage }) => {
        const [faq, commands] = Faq.update(model.faq, childMessage)
        return [
          evo(model, { faq: () => faq }),
          Command.mapMessages(commands, next =>
            GotFaqMessage({ message: next }),
          ),
        ]
      },
      GotKitchenIslandMessage: ({ message: childMessage }) => {
        const [kitchenIsland, commands] = KitchenIsland.update(
          model.kitchenIsland,
          childMessage,
        )
        return [
          evo(model, { kitchenIsland: () => kitchenIsland }),
          Command.mapMessages(commands, next =>
            GotKitchenIslandMessage({ message: next }),
          ),
        ]
      },
      GotNewMilestoneMessage: ({ message: childMessage }) => {
        const [newMilestone, commands] = NewMilestone.update(
          model.newMilestone,
          childMessage,
        )
        return [
          evo(model, { newMilestone: () => newMilestone }),
          Command.mapMessages(commands, next =>
            GotNewMilestoneMessage({ message: next }),
          ),
        ]
      },
      GotNotificationSettingsMessage: ({ message: childMessage }) => {
        const [notificationSettings, commands] = NotificationSettings.update(
          model.notificationSettings,
          childMessage,
        )
        return [
          evo(model, { notificationSettings: () => notificationSettings }),
          Command.mapMessages(commands, next =>
            GotNotificationSettingsMessage({ message: next }),
          ),
        ]
      },
      GotPaymentsMessage: ({ message: childMessage }) => {
        const [payments, commands] = Payments.update(
          model.payments,
          childMessage,
        )
        return [
          evo(model, { payments: () => payments }),
          Command.mapMessages(commands, next =>
            GotPaymentsMessage({ message: next }),
          ),
        ]
      },
      GotPayoutThresholdMessage: ({ message: childMessage }) => {
        const [payoutThreshold, commands] = PayoutThreshold.update(
          model.payoutThreshold,
          childMessage,
        )
        return [
          evo(model, { payoutThreshold: () => payoutThreshold }),
          Command.mapMessages(commands, next =>
            GotPayoutThresholdMessage({ message: next }),
          ),
        ]
      },
      GotPreferencesMessage: ({ message: childMessage }) => {
        const [preferences, commands] = Preferences.update(
          model.preferences,
          childMessage,
        )
        return [
          evo(model, { preferences: () => preferences }),
          Command.mapMessages(commands, next =>
            GotPreferencesMessage({ message: next }),
          ),
        ]
      },
      GotReceivingMethodMessage: ({ message: childMessage }) => {
        const [receivingMethod, commands] = ReceivingMethod.update(
          model.receivingMethod,
          childMessage,
        )
        return [
          evo(model, { receivingMethod: () => receivingMethod }),
          Command.mapMessages(commands, next =>
            GotReceivingMethodMessage({ message: next }),
          ),
        ]
      },
      GotRecentTransactionsMessage: ({ message: childMessage }) => {
        const [recentTransactions, commands] = RecentTransactions.update(
          model.recentTransactions,
          childMessage,
        )
        return [
          evo(model, { recentTransactions: () => recentTransactions }),
          Command.mapMessages(commands, next =>
            GotRecentTransactionsMessage({ message: next }),
          ),
        ]
      },
      GotReleaseCatalogMessage: ({ message: childMessage }) => {
        const [releaseCatalog, commands] = ReleaseCatalog.update(
          model.releaseCatalog,
          childMessage,
        )
        return [
          evo(model, { releaseCatalog: () => releaseCatalog }),
          Command.mapMessages(commands, next =>
            GotReleaseCatalogMessage({ message: next }),
          ),
        ]
      },
      GotRollerShadesMessage: ({ message: childMessage }) => {
        const [rollerShades, commands] = RollerShades.update(
          model.rollerShades,
          childMessage,
        )
        return [
          evo(model, { rollerShades: () => rollerShades }),
          Command.mapMessages(commands, next =>
            GotRollerShadesMessage({ message: next }),
          ),
        ]
      },
      GotSavingsTargetsMessage: ({ message: childMessage }) => {
        const [savingsTargets, commands] = SavingsTargets.update(
          model.savingsTargets,
          childMessage,
        )
        return [
          evo(model, { savingsTargets: () => savingsTargets }),
          Command.mapMessages(commands, next =>
            GotSavingsTargetsMessage({ message: next }),
          ),
        ]
      },
      GotSocialLinksMessage: ({ message: childMessage }) => {
        const [socialLinks, commands] = SocialLinks.update(
          model.socialLinks,
          childMessage,
        )
        return [
          evo(model, { socialLinks: () => socialLinks }),
          Command.mapMessages(commands, next =>
            GotSocialLinksMessage({ message: next }),
          ),
        ]
      },
      GotStockPerformanceMessage: ({ message: childMessage }) => {
        const [stockPerformance, commands] = StockPerformance.update(
          model.stockPerformance,
          childMessage,
        )
        return [
          evo(model, { stockPerformance: () => stockPerformance }),
          Command.mapMessages(commands, next =>
            GotStockPerformanceMessage({ message: next }),
          ),
        ]
      },
      GotTransferFundsMessage: ({ message: childMessage }) => {
        const [transferFunds, commands] = TransferFunds.update(
          model.transferFunds,
          childMessage,
        )
        return [
          evo(model, { transferFunds: () => transferFunds }),
          Command.mapMessages(commands, next =>
            GotTransferFundsMessage({ message: next }),
          ),
        ]
      },
      GotUpcomingPaymentsMessage: ({ message: childMessage }) => {
        const [upcomingPayments, commands] = UpcomingPayments.update(
          model.upcomingPayments,
          childMessage,
        )
        return [
          evo(model, { upcomingPayments: () => upcomingPayments }),
          Command.mapMessages(commands, next =>
            GotUpcomingPaymentsMessage({ message: next }),
          ),
        ]
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
const newMilestoneView = defineView<
  NewMilestone.Model,
  NewMilestone.Message
>(NewMilestone.view)
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

export const view = (model: Model): Html => {
  const h = html<Message>()

  return h.div(
    [
      h.Class(
        'overflow-x-auto overflow-y-hidden bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] dark:bg-background',
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
                  ContributionHistory.view<Message>(),
                  EmptyDistributeTrack.view<Message>(),
                  QrConnect.view<Message>(),
                  DividendIncome.view<Message>(),
                  IndexInvesting.view<Message>(),
                  SyncingState.view<Message>(),
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
                      GotPayoutThresholdMessage({ message }),
                  }),
                  ClaimableBalance.view<Message>(),
                  h.submodel({
                    slotId: 'preferences',
                    model: model.preferences,
                    view: preferencesView,
                    toParentMessage: message =>
                      GotPreferencesMessage({ message }),
                  }),
                  SavingsProgress.view<Message>(),
                  h.submodel({
                    slotId: 'kitchen-island',
                    model: model.kitchenIsland,
                    view: kitchenIslandView,
                    toParentMessage: message =>
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
                    toParentMessage: message =>
                      GotSavingsTargetsMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'recent-transactions',
                    model: model.recentTransactions,
                    view: recentTransactionsView,
                    toParentMessage: message =>
                      GotRecentTransactionsMessage({ message }),
                  }),
                  h.div(
                    [h.Class('grid grid-cols-2 items-start gap-(--gap)')],
                    [
                      h.div(
                        [h.Class('flex flex-col gap-(--gap)')],
                        [
                          SidebarNav.view<Message>(),
                          h.submodel({
                            slotId: 'faq',
                            model: model.faq,
                            view: faqView,
                            toParentMessage: message =>
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
                            toParentMessage: message =>
                              GotPaymentsMessage({ message }),
                          }),
                          FrontDoor.view<Message>(),
                        ],
                      ),
                    ],
                  ),
                  h.submodel({
                    slotId: 'release-catalog',
                    model: model.releaseCatalog,
                    view: releaseCatalogView,
                    toParentMessage: message =>
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
                    toParentMessage: message =>
                      GotAccountAccessMessage({ message }),
                  }),
                  CardOverview.view<Message>(),
                  h.submodel({
                    slotId: 'transfer-funds',
                    model: model.transferFunds,
                    view: transferFundsView,
                    toParentMessage: message =>
                      GotTransferFundsMessage({ message }),
                  }),
                  CoverArt.view<Message>(),
                  LoadingCard.view<Message>(),
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
                      GotReceivingMethodMessage({ message }),
                  }),
                  PowerUsage.view<Message>(),
                  EmptyConnectBank.view<Message>(),
                  h.submodel({
                    slotId: 'upcoming-payments',
                    model: model.upcomingPayments,
                    view: upcomingPaymentsView,
                    toParentMessage: message =>
                      GotUpcomingPaymentsMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'roller-shades',
                    model: model.rollerShades,
                    view: rollerShadesView,
                    toParentMessage: message =>
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
                    toParentMessage: message =>
                      GotStockPerformanceMessage({ message }),
                  }),
                  EmptyExploreCatalog.view<Message>(),
                  h.submodel({
                    slotId: 'new-milestone',
                    model: model.newMilestone,
                    view: newMilestoneView,
                    toParentMessage: message =>
                      GotNewMilestoneMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'social-links',
                    model: model.socialLinks,
                    view: socialLinksView,
                    toParentMessage: message =>
                      GotSocialLinksMessage({ message }),
                  }),
                  h.submodel({
                    slotId: 'notification-settings',
                    model: model.notificationSettings,
                    view: notificationSettingsView,
                    toParentMessage: message =>
                      GotNotificationSettingsMessage({ message }),
                  }),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

// SUBSCRIPTIONS — cards with sliders need document-level drag subscriptions.

export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift(KitchenIsland.subscriptions)<Model, Message>({
    toChildModel: model => model.kitchenIsland,
    toParentMessage: message => GotKitchenIslandMessage({ message }),
  }),
  Subscription.lift(PayoutThreshold.subscriptions)<Model, Message>({
    toChildModel: model => model.payoutThreshold,
    toParentMessage: message => GotPayoutThresholdMessage({ message }),
  }),
  Subscription.lift(RollerShades.subscriptions)<Model, Message>({
    toChildModel: model => model.rollerShades,
    toParentMessage: message => GotRollerShadesMessage({ message }),
  }),
)

import * as stylex from '@stylexjs/stylex';
import type { StaticStyles } from '@stylexjs/stylex';
import { Effect, Match as M, Option, Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { defineView } from 'foldkit/submodel';
import { evo } from 'foldkit/struct';

import * as AccountAccess from '@/demo/stylex-cards/account-access';
import * as CardOverview from '@/demo/stylex-cards/card-overview';
import * as ClaimableBalance from '@/demo/stylex-cards/claimable-balance';
import * as ContributionHistory from '@/demo/stylex-cards/contribution-history';
import * as CoverArt from '@/demo/stylex-cards/cover-art';
import * as DividendIncome from '@/demo/stylex-cards/dividend-income';
import * as EmptyConnectBank from '@/demo/stylex-cards/empty-connect-bank';
import * as EmptyDistributeTrack from '@/demo/stylex-cards/empty-distribute-track';
import * as EmptyExploreCatalog from '@/demo/stylex-cards/empty-explore-catalog';
import * as Faq from '@/demo/stylex-cards/faq';
import * as FrontDoor from '@/demo/stylex-cards/front-door';
import * as IndexInvesting from '@/demo/stylex-cards/index-investing';
import * as KitchenIsland from '@/demo/stylex-cards/kitchen-island';
import * as LoadingCard from '@/demo/stylex-cards/loading-card';
import * as NewMilestone from '@/demo/stylex-cards/new-milestone';
import * as NotificationSettings from '@/demo/stylex-cards/notification-settings';
import * as Payments from '@/demo/stylex-cards/payments';
import * as PayoutThreshold from '@/demo/stylex-cards/payout-threshold';
import * as PowerUsage from '@/demo/stylex-cards/power-usage';
import * as Preferences from '@/demo/stylex-cards/preferences';
import * as QrConnect from '@/demo/stylex-cards/qr-connect';
import * as ReceivingMethod from '@/demo/stylex-cards/receiving-method';
import * as RecentTransactions from '@/demo/stylex-cards/recent-transactions';
import * as ReleaseCatalog from '@/demo/stylex-cards/release-catalog';
import * as RollerShades from '@/demo/stylex-cards/roller-shades';
import * as SavingsProgress from '@/demo/stylex-cards/savings-progress';
import * as SavingsTargets from '@/demo/stylex-cards/savings-targets';
import * as SidebarNav from '@/demo/stylex-cards/sidebar-nav';
import * as SocialLinks from '@/demo/stylex-cards/social-links';
import * as StockPerformance from '@/demo/stylex-cards/stock-performance';
import * as SyncingState from '@/demo/stylex-cards/syncing-state';
import * as TransferFunds from '@/demo/stylex-cards/transfer-funds';
import * as UpcomingPayments from '@/demo/stylex-cards/upcoming-payments';
import * as Preset from '@/demo/create-preset';
import * as Popover from '@/stylex/popover';
import * as ScrollArea from '@/stylex/scroll-area';
import * as Icon from '@/lib/icon';
import * as PreviewIcon from '@/demo/icon-preview';
import { className } from '@/stylex/style';
import { compositionTheme } from '../stylex/composition/composition-theme.stylex';
import { complexTokens } from '../stylex/complex-tokens.stylex';
import { foundationTokens } from '../stylex/foundations-tokens.stylex';
import { tokens } from '../stylex/tokens.stylex';
import { boardTokens } from './board-stylex-tokens.stylex';
import { cardTokens } from './stylex-cards/complex-card-tokens.stylex';
import { cardDemoTokens } from './stylex-cards/foundations-card-tokens.stylex';
import { interactionCardTokens } from './stylex-cards/interaction-card-tokens.stylex';
import { interactionTokens } from '../stylex/interaction-tokens.stylex.const'

const stylexVariableName = (variable: string): string =>
  variable.replace(/^var\((--[^,)]+).*/, '$1');

const scopedStyleXThemeCss = (): string => {
  const aliases: ReadonlyArray<readonly [string, string]> = [
    [tokens.background, 'var(--background)'],
    [tokens.foreground, 'var(--foreground)'],
    [tokens.card, 'var(--card)'],
    [tokens.cardForeground, 'var(--card-foreground)'],
    [tokens.primary, 'var(--primary)'],
    [tokens.primaryForeground, 'var(--primary-foreground)'],
    [tokens.secondary, 'var(--secondary)'],
    [tokens.secondaryForeground, 'var(--secondary-foreground)'],
    [tokens.mutedForeground, 'var(--muted-foreground)'],
    [tokens.accent, 'var(--accent)'],
    [tokens.accentForeground, 'var(--accent-foreground)'],
    [tokens.destructive, 'var(--destructive)'],
    [tokens.destructiveHover, 'color-mix(in oklab, var(--destructive) 90%, transparent)'],
    [tokens.primaryHover, 'color-mix(in oklab, var(--primary) 90%, transparent)'],
    [tokens.secondaryHover, 'color-mix(in oklab, var(--secondary) 80%, transparent)'],
    [tokens.border, 'var(--border)'],
    [tokens.input, 'var(--input)'],
    [tokens.ring, 'var(--ring)'],
    [tokens.radius, 'var(--radius)'],
    [tokens.controlRadius, 'calc(var(--radius) - 2px)'],
    [tokens.cardRadius, 'calc(var(--radius) + 4px)'],
    [tokens.focusRingShadow, '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)'],
    [tokens.destructiveRingShadow, '0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent)'],
    [foundationTokens.muted, 'var(--muted)'],
    [foundationTokens.popover, 'var(--popover)'],
    [foundationTokens.popoverForeground, 'var(--popover-foreground)'],
    [foundationTokens.destructiveSoft, 'color-mix(in oklab, var(--destructive) 10%, transparent)'],
    [foundationTokens.destructiveMuted, 'color-mix(in oklab, var(--destructive) 80%, transparent)'],
    [foundationTokens.primarySoft, 'color-mix(in oklab, var(--primary) 10%, transparent)'],
    [foundationTokens.foregroundMuted, 'color-mix(in oklab, var(--foreground) 60%, transparent)'],
    [foundationTokens.foregroundSoft, 'color-mix(in oklab, var(--foreground) 10%, transparent)'],
    [foundationTokens.ringSoft, 'color-mix(in oklab, var(--ring) 50%, transparent)'],
    [foundationTokens.destructiveRingSoft, 'color-mix(in oklab, var(--destructive) 20%, transparent)'],
    [foundationTokens.inputDark, 'color-mix(in oklab, var(--input) 30%, transparent)'],
    [foundationTokens.mutedSoft, 'color-mix(in oklab, var(--muted) 50%, transparent)'],
    [foundationTokens.radiusSm, 'calc(var(--radius) - 4px)'],
    [foundationTokens.radiusMd, 'calc(var(--radius) - 2px)'],
    [foundationTokens.radiusLg, 'var(--radius)'],
    [foundationTokens.radiusXl, 'calc(var(--radius) + 4px)'],
    [complexTokens.sidebar, 'var(--sidebar)'],
    [complexTokens.sidebarForeground, 'var(--sidebar-foreground)'],
    [complexTokens.sidebarPrimary, 'var(--sidebar-primary)'],
    [complexTokens.sidebarPrimaryForeground, 'var(--sidebar-primary-foreground)'],
    [complexTokens.sidebarAccent, 'var(--sidebar-accent)'],
    [complexTokens.sidebarAccentForeground, 'var(--sidebar-accent-foreground)'],
    [complexTokens.sidebarBorder, 'var(--sidebar-border)'],
    [complexTokens.sidebarRing, 'var(--sidebar-ring)'],
    [complexTokens.chart1, 'var(--chart-1)'],
    [complexTokens.chart2, 'var(--chart-2)'],
    [complexTokens.chart3, 'var(--chart-3)'],
    [complexTokens.chart4, 'var(--chart-4)'],
    [complexTokens.chart5, 'var(--chart-5)'],
    [complexTokens.mutedSurface, 'color-mix(in oklab, var(--muted) 50%, transparent)'],
    [complexTokens.accentSurface, 'color-mix(in oklab, var(--accent) 50%, transparent)'],
    [complexTokens.focusOutline, '1px solid var(--ring)'],
    [complexTokens.resizeShadow, '0 0 0 1px var(--ring)'],
    [complexTokens.overlaySurface, 'color-mix(in oklab, var(--foreground) 50%, transparent)'],
    [boardTokens.boardBackground, 'var(--background)'],
    [boardTokens.boardMuted, 'var(--muted)'],
    [boardTokens.boardMutedForeground, 'var(--muted-foreground)'],
    [cardTokens.muted, 'var(--muted)'],
    [cardDemoTokens.pendingIndicator, 'var(--chart-4)'],
    [cardDemoTokens.artworkSurface, 'var(--muted)'],
    [cardDemoTokens.artworkForeground, 'var(--muted-foreground)'],
    [cardDemoTokens.cameraPattern, 'repeating-linear-gradient(45deg, transparent, transparent 10px, var(--border) 10px, var(--border) 11px)'],
    [interactionCardTokens.qrForeground, 'var(--foreground)'],
    [interactionCardTokens.qrMuted, 'var(--muted)'],
    [interactionCardTokens.usageAccent, 'var(--chart-1)'],
    [compositionTheme.canvas, 'var(--muted)'],
  ];
  const declarations = aliases
    .map(([variable, value]) => `${stylexVariableName(variable)}:${value}`)
    .join(';');
  const inspectorDeclarations: ReadonlyArray<readonly [string, string]> = [
    [tokens.background, boardTokens.panel],
    [tokens.foreground, boardTokens.text],
    [tokens.card, boardTokens.panelField],
    [tokens.cardForeground, boardTokens.text],
    [tokens.secondary, boardTokens.selected],
    [tokens.secondaryForeground, boardTokens.text],
    [tokens.mutedForeground, boardTokens.textMuted],
    [tokens.accent, boardTokens.selected],
    [tokens.accentForeground, boardTokens.text],
    [tokens.border, boardTokens.border],
    [tokens.input, boardTokens.border],
    [foundationTokens.muted, boardTokens.hover],
  ];
  const inspectorTheme = inspectorDeclarations
    .map(([variable, value]) => `${stylexVariableName(variable)}:${value}`)
    .join(';');
  const darkBoardBackground = [
    `${stylexVariableName(boardTokens.boardMuted)}:var(--background)`,
    `${stylexVariableName(compositionTheme.canvas)}:var(--background)`,
  ].join(';');
  return `[data-crease-board-theme]{${declarations}}.dark [data-crease-board-theme]{${darkBoardBackground}}[data-primitive-inspector]{${inspectorTheme}}`;
};

const styles = stylex.create({
  applyButton: { borderColor: boardTokens.border, borderRadius: tokens.cardRadius, borderStyle: 'solid', borderWidth: 1, backgroundColor: { default: boardTokens.transparent, ':hover': boardTokens.hover }, color: boardTokens.text, fontWeight: 500, height: '2.25rem', width: '100%', },
  board: { padding: { default: '1rem', '@media (min-width: 1920px)': '3rem', '@media (min-width: 768px)': '2.5rem', }, gap: { default: '1rem', '@media (min-width: 1920px)': '3rem', '@media (min-width: 768px)': '2.5rem', }, alignItems: 'flex-start', backgroundColor: boardTokens.boardMuted, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', width: { default: '150rem', '@media (min-width: 768px)': '187.5rem' }, },
  boardGap: { gap: { default: '1rem', '@media (min-width: 1920px)': '3rem', '@media (min-width: 768px)': '2.5rem', } },
  choice: { borderRadius: tokens.cardRadius, paddingInline: '0.75rem', alignItems: 'center', backgroundColor: { default: boardTokens.transparent, ':focus-visible': boardTokens.hover, ':hover': boardTokens.hover, }, display: 'flex', fontSize: '0.875rem', fontWeight: 500, outlineStyle: 'none', textAlign: 'left', transitionProperty: 'background-color', minHeight: '2.5rem', width: '100%', },
  choiceSelected: { backgroundColor: boardTokens.selected },
  column: { padding: '0.25rem', containIntrinsicSize: '380px 1200px', contentVisibility: 'auto', display: 'flex', flexDirection: 'column', },
  columnWide: { padding: '0.25rem',
 containIntrinsicSize: '760px 1200px',
 contentVisibility: 'auto',
 display: 'flex',
 flexDirection: 'column',
 gridColumnEnd: 'span 2',
 gridColumnStart: 'span 2', },
  copyButton: { borderRadius: tokens.cardRadius, backgroundColor: { default: boardTokens.text, ':hover': boardTokens.textMuted }, color: boardTokens.panel, fontWeight: 500, position: 'relative', height: '2.25rem', width: '100%', },
  copyIcon: { transitionProperty: 'scale, opacity, filter', height: '1rem', width: '1rem', },
  copyIconHidden: { filter: 'blur(4px)', opacity: 0, scale: 0.25 },
  copiedIcon: { color: boardTokens.success, position: 'absolute', height: '1rem', left: '5.2rem', width: '1rem', },
  customizer: { borderColor: boardTokens.border, borderRadius: boardTokens.panelRadius, borderStyle: 'solid', borderWidth: 1, overflow: 'hidden', backgroundColor: boardTokens.panel, boxShadow: tokens.shadowCard, color: boardTokens.text, display: 'flex', flexDirection: 'column', position: 'fixed', zIndex: 30, bottom: '1.25rem', left: { default: '1.25rem', '@media (max-width: 1023px)': '0.75rem' }, right: { default: 'auto', '@media (max-width: 1023px)': '0.75rem' }, top: '4.75rem', width: { default: '17.625rem', '@media (max-width: 1023px)': 'auto' }, },
  customizerBody: { padding: '1rem', gap: '1rem', display: 'flex', flexDirection: 'column', },
  customizerFooter: { padding: '1rem', gap: '0.5rem', display: 'flex', flexDirection: 'column', borderTopColor: boardTokens.border, borderTopStyle: 'solid', borderTopWidth: 1, },
  customizerHeader: { padding: '1rem', borderBottomColor: boardTokens.border, borderBottomStyle: 'solid', borderBottomWidth: 1, },
  customizerHeaderInner: { borderColor: boardTokens.border, borderRadius: boardTokens.panelInnerRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '1rem', alignItems: 'center', display: 'flex', justifyContent: 'space-between', height: '3rem', },
  details: { display: 'block' },
  detailsBody: { gap: '0.5rem', display: 'flex', flexDirection: 'column', marginTop: '0.5rem', },
  divider: { marginInline: '-1rem', borderTopColor: boardTokens.border, borderTopStyle: 'solid', borderTopWidth: 1, },
  error: { color: boardTokens.error, fontSize: '0.75rem' },
  fieldInput: { borderColor: boardTokens.border, borderRadius: tokens.cardRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.75rem', backgroundColor: boardTokens.panelInput, color: boardTokens.text, fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', outlineColor: { default: boardTokens.transparent, ':focus-visible': boardTokens.focus }, outlineStyle: { default: 'none', ':focus-visible': 'solid' }, outlineWidth: { default: 0, ':focus-visible': 2 }, height: '2.25rem', width: '100%', },
  group: { gap: '0.75rem', display: 'flex', flexDirection: 'column', },
  iconCheck: { height: '1rem', marginLeft: 'auto', width: '1rem' },
  iconMenu: { color: boardTokens.textMuted, height: '1.25rem', width: '1.25rem' },
  iconRight: { color: boardTokens.textSubtle, height: '1rem', width: '1rem' },
  marker: { borderRadius: '50%', height: '0.875rem', width: '0.875rem' },
  markerChart: { backgroundColor: boardTokens.markerChart },
  markerPrimary: { backgroundColor: boardTokens.markerPrimary },
  markerZinc: { backgroundColor: boardTokens.markerZinc },
  nestedGrid: { gap: { default: '1rem', '@media (min-width: 1920px)': '3rem', '@media (min-width: 768px)': '2.5rem', }, alignItems: 'flex-start', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', },
  panelCode: { borderColor: boardTokens.border, borderRadius: tokens.cardRadius, borderStyle: 'solid', borderWidth: 1, overflow: 'hidden', paddingBlock: '0.5rem', paddingInline: '0.75rem', color: boardTokens.textMuted, fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', },
  pickerContent: { padding: '0.5rem', backgroundColor: boardTokens.panelPopover, color: boardTokens.text, },
  pickerLabel: { color: boardTokens.boardMutedForeground, fontSize: '0.75rem', fontWeight: 500, position: 'absolute', left: '0.75rem', top: '0.625rem', },
  pickerMarkerGroup: { gap: '0.75rem', alignItems: 'center', display: 'flex', marginLeft: '0.75rem', paddingBottom: '0.125rem', },
  pickerTrigger: { borderColor: boardTokens.border, borderRadius: tokens.cardRadius, borderStyle: 'solid', borderWidth: 1, paddingInline: '0.75rem', alignItems: 'flex-end', backgroundColor: { default: boardTokens.panelField, ':hover': boardTokens.hover }, display: 'flex', justifyContent: 'space-between', position: 'relative', height: '4.125rem', minWidth: 0, paddingBottom: '0.625rem', width: '100%', },
  pickerTriggerLayout: { height: '4.125rem', minWidth: 0, width: '100%' },
  pickerValue: { overflow: 'hidden', fontSize: '0.9375rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', },
  popoverSize: { width: '18rem' },
  presetButton: { borderColor: boardTokens.border, borderRadius: tokens.cardRadius, borderStyle: 'solid', borderWidth: 1, listStyle: 'none', alignItems: 'center', cursor: interactionTokens.cursorAction, display: 'flex', fontSize: '0.875rem', fontWeight: 500, justifyContent: 'center', height: '2.25rem', },
  preview: { backgroundColor: boardTokens.boardMuted, contain: 'paint', overflowX: 'auto', overflowY: 'hidden', paddingLeft: { default: 0, '@media (min-width: 1024px)': '20.625rem' } },
  previewCenter: { display: 'flex', justifyContent: 'center', minWidth: 'max-content', width: '100%' },
  root: { position: 'relative', minHeight: 'calc(100vh - 3.5rem)', },
  scrollArea: { flexGrow: 1, minHeight: 0 },
  scrollChoices: { maxHeight: '20rem' },
  section: { display: 'flex', flexDirection: 'column' },
  title: { fontSize: '0.875rem', fontWeight: 600 },
})

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
  primitiveInspector: S.Struct({
    boxPadding: S.Literals(['responsive', 'none', 'sm', 'md', 'xl']),
    boxSurface: S.Literals(['card', 'muted', 'section']),
    gridColumns: S.Literals(['one', 'two']),
    inlineJustify: S.Literals(['start', 'center', 'end', 'between']),
    stackGap: S.Literals(['responsive', 'sm', 'md', 'xl']),
    textVariant: S.Literals(['inherit', 'caption', 'headingSm', 'headingMd']),
  }),
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
export type PrimitiveInspector = Model['primitiveInspector'];

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
export const ClickedShufflePreset = m('ClickedShuffleCreatePreset');
export const CompletedCopyCreatePreset = m('CompletedCopyCreatePreset');
export const CompletedWaitBeforeClearingCreatePresetCopy = m(
  'CompletedWaitBeforeClearingCreatePresetCopy',
);
export const GotPresetPickerMessage = m('GotCreatePresetPickerMessage', {
  field: Preset.Field,
  message: Popover.Message,
});
export const ChangedPrimitiveBoxPadding = m('ChangedPrimitiveBoxPadding', {
  value: S.Literals(['responsive', 'none', 'sm', 'md', 'xl']),
});
export const ChangedPrimitiveBoxSurface = m('ChangedPrimitiveBoxSurface', {
  value: S.Literals(['card', 'muted', 'section']),
});
export const ChangedPrimitiveGridColumns = m('ChangedPrimitiveGridColumns', {
  value: S.Literals(['one', 'two']),
});
export const ChangedPrimitiveInlineJustify = m('ChangedPrimitiveInlineJustify', {
  value: S.Literals(['start', 'center', 'end', 'between']),
});
export const ChangedPrimitiveStackGap = m('ChangedPrimitiveStackGap', {
  value: S.Literals(['responsive', 'sm', 'md', 'xl']),
});
export const ChangedPrimitiveTextVariant = m('ChangedPrimitiveTextVariant', {
  value: S.Literals(['inherit', 'caption', 'headingSm', 'headingMd']),
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
  ClickedShufflePreset,
  CompletedCopyCreatePreset,
  CompletedWaitBeforeClearingCreatePresetCopy,
  GotPresetPickerMessage,
  ChangedPrimitiveBoxPadding,
  ChangedPrimitiveBoxSurface,
  ChangedPrimitiveGridColumns,
  ChangedPrimitiveInlineJustify,
  ChangedPrimitiveStackGap,
  ChangedPrimitiveTextVariant,
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
  primitiveInspector: {
    boxPadding: 'responsive',
    boxSurface: 'muted',
    gridColumns: 'two',
    inlineJustify: 'center',
    stackGap: 'responsive',
    textVariant: 'inherit',
  },
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
  messages: [CompletedCopyCreatePreset],
  execute: ({ code }) =>
    Effect.promise(() => navigator.clipboard.writeText(code)).pipe(
      Effect.as(CompletedCopyCreatePreset()),
    ),
});
const WaitBeforeClearingPresetCopy = Command.define(
  'WaitBeforeClearingCreatePresetCopy',
  {
    messages: [CompletedWaitBeforeClearingCreatePresetCopy],
    execute: Effect.sleep('1800 millis').pipe(
      Effect.as(CompletedWaitBeforeClearingCreatePresetCopy()),
    ),
  },
);

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ChangedPrimitiveBoxPadding: ({ value }) => [
        evo(model, {
          primitiveInspector: (current) => ({ ...current, boxPadding: value }),
        }),
        [],
      ],
      ChangedPrimitiveBoxSurface: ({ value }) => [
        evo(model, {
          primitiveInspector: (current) => ({ ...current, boxSurface: value }),
        }),
        [],
      ],
      ChangedPrimitiveGridColumns: ({ value }) => [
        evo(model, {
          primitiveInspector: (current) => ({ ...current, gridColumns: value }),
        }),
        [],
      ],
      ChangedPrimitiveInlineJustify: ({ value }) => [
        evo(model, {
          primitiveInspector: (current) => ({ ...current, inlineJustify: value }),
        }),
        [],
      ],
      ChangedPrimitiveStackGap: ({ value }) => [
        evo(model, {
          primitiveInspector: (current) => ({ ...current, stackGap: value }),
        }),
        [],
      ],
      ChangedPrimitiveTextVariant: ({ value }) => [
        evo(model, {
          primitiveInspector: (current) => ({ ...current, textVariant: value }),
        }),
        [],
      ],
      ChangedCreatePresetInput: ({ value }) => [
        evo(model, { presetInput: () => value, presetError: () => null }),
        [],
      ],
      AppliedCreatePresetInput: () => {
        const preset = Preset.parsePresetInput(model.presetInput);
        return Option.match(preset, {
          onNone: () => [
              evo(model, {
                presetError: () =>
                  'Enter a valid shadcn preset code, URL, or --preset flag.',
              }),
              [],
            ],
          onSome: decoded => [
              evo(model, {
                preset: () => decoded,
                presetInput: () => Preset.encodePreset(decoded),
                presetError: () => null,
              }),
              [],
            ],
        });
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
        [CopyPreset({ code: Preset.presetRegistryJson(model.preset) })],
      ],
      ClickedShuffleCreatePreset: () => {
        const preset = Preset.shufflePreset(model.preset);
        return [
          evo(model, {
            preset: () => preset,
            presetInput: () => Preset.encodePreset(preset),
            presetError: () => null,
          }),
          [],
        ];
      },
      CompletedCopyCreatePreset: () => [
        evo(model, { isPresetCopied: () => true }),
        [WaitBeforeClearingPresetCopy()],
      ],
      CompletedWaitBeforeClearingCreatePresetCopy: () => [
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

export const presetCustomizer = (
  model: Model,
  h: HtmlBuilder<Message>,
  inspector: Html | null = null,
): Html => {
  const picker = (
    label: string,
    field: Preset.Field,
    values: readonly string[],
    marker?: StaticStyles,
  ): Html =>
    Popover.popover<Message>(
      {
        model: model.pickerPopovers[field],
        toParentMessage: (message) =>
          GotPresetPickerMessage({ field, message }),
        side: 'right',
        align: 'start',
        triggerLayoutStyle: styles.pickerTriggerLayout,
        trigger: h.div(
          [h.Class(className(styles.pickerTrigger))],
          [
            h.span(
              [
                h.Class(className(styles.pickerLabel)),
              ],
              [label],
            ),
            h.span(
              [h.Class(className(styles.pickerValue))],
              [titleCase(model.preset[field])],
            ),
            h.span(
              [h.Class(className(styles.pickerMarkerGroup))],
              [
                ...(marker === undefined
                  ? []
                  : [
                      h.span(
                        [
                          h.AriaHidden(true),
                          h.Class(className(styles.marker, marker)),
                        ],
                        [],
                      ),
                    ]),
                Icon.chevronRight({ class: className(styles.iconRight) }, h),
              ],
            ),
          ],
        ),
        layoutStyle: styles.popoverSize,
        content: h.div([h.Class(className(styles.pickerContent))], [ScrollArea.scrollArea<Message>(
          {
            layoutStyle: styles.scrollChoices,
            children: values.map((value) => {
              const isSelected = model.preset[field] === value;
              return h.button(
                [
                  h.Type('button'),
                  h.OnClick(ChangedPresetField({ field, value })),
                  h.Class(className(styles.choice, isSelected && styles.choiceSelected)),
                ],
                [
                  h.span([h.Class(className(styles.pickerValue))], [titleCase(value)]),
                  ...(isSelected
                    ? [Icon.check({ class: className(styles.iconCheck) }, h)]
                    : []),
                ],
              );
            }),
          },
          h,
        )]),
      },
      h,
    );

  return h.aside(
    [
      h.Class(className(styles.customizer)),
    ],
    [
      h.div(
        [h.Class(className(styles.customizerHeader))],
        [
          h.div(
            [
              h.Class(className(styles.customizerHeaderInner)),
            ],
            [
              h.h1([h.Class(className(styles.title))], ['Menu']),
              Icon.icon('menu', { class: className(styles.iconMenu) }, h),
            ],
          ),
        ],
      ),
      ScrollArea.scrollArea<Message>(
        {
          layoutStyle: styles.scrollArea,
          children: [
            h.div(
              [h.Class(className(styles.customizerBody))],
              [
                ...(inspector === null
                  ? []
                  : [
                      inspector,
                      h.div([h.Class(className(styles.divider))], []),
                    ]),
                h.div(
                  [h.Class(className(styles.group))],
                  [
                    picker('Style', 'style', Preset.STYLES),
                    picker(
                      'Base Color',
                      'baseColor',
                      Preset.BASE_COLORS,
                      styles.markerZinc,
                    ),
                    picker('Theme', 'theme', Preset.THEMES, styles.markerPrimary),
                    picker(
                      'Chart Color',
                      'chartColor',
                      Preset.THEMES,
                      styles.markerChart,
                    ),
                  ],
                ),
                h.div([h.Class(className(styles.divider))], []),
                h.div(
                  [h.Class(className(styles.group))],
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
        [h.Class(className(styles.customizerFooter))],
        [
          h.div(
            [
              h.DataAttribute('crease-style', model.preset.style),
              h.DataAttribute('icon-library', model.preset.iconLibrary),
              h.Class(className(styles.panelCode)),
            ],
            [`--preset ${Preset.encodePreset(model.preset)}`],
          ),
          h.details(
            [h.Class(className(styles.details))],
            [
              h.summary(
                [
                  h.Class(className(styles.presetButton)),
                ],
                ['Open Preset'],
              ),
              h.div(
                [h.Class(className(styles.detailsBody))],
                [
                  h.input([
                    h.Id('create-preset-input'),
                    h.AriaLabel('Open preset'),
                    h.Value(model.presetInput),
                    h.OnInput((value) => ChangedPresetInput({ value })),
                    h.Placeholder('Paste code or shadcn URL'),
                    h.Class(className(styles.fieldInput)),
                  ]),
                  h.button([h.Type('button'), h.OnClick(AppliedPresetInput()), h.Class(className(styles.applyButton))], ['Apply Preset']),
                  ...(model.presetError === null
                    ? []
                    : [
                        h.p(
                          [h.Class(className(styles.error))],
                          [model.presetError],
                        ),
                      ]),
                ],
              ),
            ],
          ),
          h.button([h.Type('button'), h.OnClick(ClickedShufflePreset()), h.Class(className(styles.applyButton))], ['Shuffle']),
          h.button([h.Type('button'), h.OnClick(ClickedCopyPreset()), h.Class(className(styles.copyButton))], [
                Icon.icon(
                  'copy',
                  {
                    class: className(styles.copyIcon, model.isPresetCopied && styles.copyIconHidden),
                  },
                  h,
                ),
                ...(model.isPresetCopied
                  ? [
                      Icon.check(
                        {
                          class: className(styles.copiedIcon),
                        },
                        h,
                      ),
                      'Copied',
                    ]
                  : ['Copy Registry JSON']),
              ]),
        ],
      ),
    ],
  );
};

export type BoardSplit = Readonly<{
  composition: 'split'
  columns: readonly [ReadonlyArray<Html>, ReadonlyArray<Html>]
}>

export type BoardItem = Html | BoardSplit

export type BoardColumn = Readonly<{
  items: ReadonlyArray<BoardItem>
  span: 1 | 2
}>

export const isBoardSplit = (item: BoardItem): item is BoardSplit =>
  typeof item === 'object' &&
  item !== null &&
  'composition' in item &&
  item.composition === 'split'

export const boardColumns = (
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<BoardColumn> => [
  {
    span: 1,
    items: [
                  ContributionHistory.view<Message>(h),
                  EmptyDistributeTrack.view<Message>(h),
                  QrConnect.view<Message>(h),
                  DividendIncome.view<Message>(h),
                  IndexInvesting.view<Message>(h),
                  SyncingState.view<Message>(h),
    ],
  },
  {
    span: 1,
    items: [
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
  },
  {
    span: 2,
    items: [
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
                  {
                    composition: 'split',
                    columns: [
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
                    ],
                  },
                  h.submodel({
                    slotId: 'release-catalog',
                    model: model.releaseCatalog,
                    view: releaseCatalogView,
                    toParentMessage: (message) =>
                      GotReleaseCatalogMessage({ message }),
                  }),
    ],
  },
  {
    span: 1,
    items: [
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
  },
  {
    span: 1,
    items: [
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
  },
  {
    span: 1,
    items: [
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
  },
]

export const presetThemeStyle = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.style([], [
    `${Preset.presetCss(model.preset).replaceAll('.create-board-theme', '[data-crease-board-theme]')}${scopedStyleXThemeCss()}`,
  ])

export const boardSpriteDefinitions = (h: HtmlBuilder<Message>): Html =>
  PreviewIcon.spriteDefinitions(h)

const legacyBoardItem = (item: BoardItem, h: HtmlBuilder<Message>): Html =>
  isBoardSplit(item)
    ? h.div(
        [h.Class(className(styles.nestedGrid))],
        item.columns.map(column =>
          h.div(
            [h.Class(className(styles.section, styles.boardGap))],
            column,
          ),
        ),
      )
    : item

export const view = (model: Model, h: HtmlBuilder<Message>): Html => {
  const preview = h.div(
    [h.Class(className(styles.preview))],
    [
      h.div(
        [h.Class(className(styles.previewCenter))],
        [
          h.div(
            [
              h.Class(className(styles.board)),
              h.DataAttribute('crease-board-theme', ''),
              h.DataAttribute('crease-style', model.preset.style),
              h.DataAttribute('icon-library', model.preset.iconLibrary),
              h.DataAttribute('slot', 'capture-target'),
            ],
            [
              boardSpriteDefinitions(h),
              ...boardColumns(model, h).map(column =>
                h.div(
                  [
                    h.Class(
                      className(
                        column.span === 2 ? styles.columnWide : styles.column,
                        styles.boardGap,
                      ),
                    ),
                  ],
                  column.items.map(item => legacyBoardItem(item, h)),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );

  return h.main(
    [h.Class(className(styles.root))],
    [
      presetThemeStyle(model, h),
      preview,
      presetCustomizer(model, h),
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

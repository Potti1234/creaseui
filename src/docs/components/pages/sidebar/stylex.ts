import * as stylex from '@stylexjs/stylex';
import type { StaticStyles } from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { sidebarFixtures, type SidebarFixtureKind } from '@/docs/components/pages/sidebar/shared';
import * as DropdownMenu from '@/stylex/dropdown-menu';
import * as Icon from '@/lib/icon';
import * as Sidebar from '@/stylex/sidebar';
import { className } from '@/stylex/style';

const styles = stylex.create({
  actionAnchor: { position: 'absolute', right: '0.25rem', top: '0.375rem', zIndex: 30 },
  actionTrigger: { alignItems: 'center', backgroundColor: { default: 'transparent', ':hover': 'var(--sidebar-accent)' }, borderRadius: '0.375rem', color: { default: 'var(--sidebar-foreground)', ':hover': 'var(--sidebar-accent-foreground)' }, display: 'flex', height: '1.25rem', justifyContent: 'center', outlineStyle: 'none', width: '1.25rem' },
  accountAvatar: { alignItems: 'center', backgroundColor: 'var(--sidebar-primary)', borderRadius: '0.5rem', color: 'var(--sidebar-primary-foreground)', display: 'grid', flexShrink: 0, fontSize: '0.75rem', fontWeight: 600, height: '2rem', justifyContent: 'center', width: '2rem' },
  accountCopy: { display: 'grid', flexGrow: 1, lineHeight: 1.25, minWidth: 0, textAlign: 'left' },
  accountEmail: { fontSize: '0.75rem', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  accountName: { fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  brand: { alignItems: 'center', display: 'flex', gap: '0.5rem', overflow: 'hidden', paddingBlock: '0.25rem', paddingInline: '0.5rem', whiteSpace: 'nowrap' },
  brandMark: { alignItems: 'center', backgroundColor: 'var(--sidebar-primary)', borderRadius: '0.375rem', color: 'var(--sidebar-primary-foreground)', display: 'grid', flexShrink: 0, fontSize: '0.75rem', fontWeight: 600, height: '1.75rem', justifyContent: 'center', width: '1.75rem' },
  brandName: { fontSize: '0.875rem', fontWeight: 600 },
  frame: { backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0.5rem', borderStyle: 'solid', borderWidth: 1, height: '26rem', minHeight: 0, overflow: 'hidden', position: 'relative', width: '100%' },
  feedback: { color: 'var(--sidebar-foreground)', fontSize: '0.75rem', opacity: 0.7, paddingInline: '0.5rem', paddingTop: '0.5rem' },
  inset: { minHeight: 0 },
  pageHeader: { alignItems: 'center', borderBottomColor: 'var(--border)', borderBottomStyle: 'solid', borderBottomWidth: 1, display: 'flex', flexShrink: 0, gap: '0.5rem', height: '3rem', paddingInline: '1rem' },
  pageTitle: { fontSize: '0.875rem', fontWeight: 600 },
  provider: { height: '26rem', minHeight: 0 },
  skeletonBlock: { backgroundColor: 'var(--muted)', borderRadius: '0.5rem', height: '6rem' },
  skeletonBlockWide: { backgroundColor: 'var(--muted)', borderRadius: '0.5rem', gridColumn: '1 / -1', height: '8rem' },
  pageMain: { display: 'grid', gap: '1rem', gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 640px)': 'repeat(2, minmax(0, 1fr))' }, padding: '1rem' },
  staticFrame: { alignItems: 'stretch', backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)', display: 'flex', height: '20rem', justifyContent: 'center', padding: '1rem', width: '100%' },
  staticPanel: { backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0.5rem', borderStyle: 'solid', borderWidth: 1, maxWidth: '18rem', overflow: 'hidden', width: '100%' },
  staticProvider: { height: '100%', minHeight: 0, width: '100%' },
  staticTitle: { fontSize: '0.875rem', fontWeight: 600, paddingBlock: '0.25rem', paddingInline: '0.5rem' },
  srOnly: { height: 1, margin: -1, overflow: 'hidden', padding: 0, position: 'absolute', width: 1 },
});

const isStaticStyle = (value: unknown): value is StaticStyles => typeof value === 'object' && value !== null;
const cx = (...values: ReadonlyArray<unknown>): string => className(...values.filter(isStaticStyle));
const iconLabel = <Msg>(name: string, label: string, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => [Icon.icon(name, {}, h), h.span([], [label])];

const actionItems = ['open', 'rename', 'delete'] as const;
const actionLabel = (action: string): string => action[0]?.toUpperCase() + action.slice(1);
const actionMenu = <Msg>(model: DropdownMenu.Model, label: string, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => h.div([
  h.DataAttribute('sidebar', 'menu-action'),
  h.Class(cx(styles.actionAnchor)),
], [DropdownMenu.dropdownMenu({
  model,
  toParentMessage: (message) => send(JSON.stringify({ _tag: 'GotSidebarPreviewActionMenuMessage', message })),
  trigger: h.span([h.Class(cx(styles.actionTrigger))], [Icon.moreHorizontal({}, h), h.span([h.Class(cx(styles.srOnly))], [label])]),
  ariaLabel: label,
  align: 'end',
  items: actionItems,
  itemToConfig: (action) => ({ label: actionLabel(action), ...(action === 'delete' ? { variant: 'destructive' as const } : {}) }),
}, h)]);

const primaryNavigation = <Msg>(model: { actionMenu: DropdownMenu.Model }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => Sidebar.sidebarMenu({
  children: [
    ['Dashboard', 'gauge'],
    ['Inbox', 'inbox'],
    ['Projects', 'book-open'],
    ['Calendar', 'calendar-days'],
  ].map(([label, iconName], index) => Sidebar.sidebarMenuItem({ children: [
    Sidebar.sidebarMenuButton({ href: '#', isActive: index === 0, tooltip: label ?? '', children: iconLabel(iconName ?? 'circle', label ?? '', h) }, h),
    ...(index === 1 ? [Sidebar.sidebarMenuBadge({ children: ['12'] }, h)] : []),
    ...(index === 2 ? [actionMenu(model.actionMenu, 'Project actions', send, h)] : []),
  ] }, h)),
}, h);

const nestedNavigation = <Msg>(h: HtmlBuilder<Msg>): Html => Sidebar.sidebarMenu({ children: [
  Sidebar.sidebarMenuItem({ children: [
    Sidebar.sidebarMenuButton({ children: iconLabel('book-open', 'Documentation', h) }, h),
    Sidebar.sidebarMenuSub({ children: ['Introduction', 'Components', 'Changelog'].map((label, index) => Sidebar.sidebarMenuSubItem({ children: [Sidebar.sidebarMenuSubButton({ href: '#', isActive: index === 1, children: [label] }, h)] }, h)) }, h),
  ] }, h),
] }, h);

const account = <Msg>(h: HtmlBuilder<Msg>): Html => Sidebar.sidebarMenu({ children: [Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ size: 'lg', children: [
  h.span([h.Class(cx(styles.accountAvatar))], ['AL']),
  h.span([h.Class(cx(styles.accountCopy))], [h.span([h.Class(cx(styles.accountName))], ['Ada Lovelace']), h.span([h.Class(cx(styles.accountEmail))], ['ada@example.com'])]),
  Icon.chevronsUpDown({}, h),
] }, h)] }, h)] }, h);

const sidebarBody = <Msg>(model: { actionMenu: DropdownMenu.Model; query: string }, send: (json: string) => Msg, onQuery: (value: string) => Msg, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => [
  Sidebar.sidebarHeader({ children: [
    h.div([h.DataAttribute('sidebar', 'brand'), h.Class(cx(styles.brand))], [h.span([h.Class(cx(styles.brandMark))], ['C']), h.span([h.Class(cx(styles.brandName))], ['Crease Workspace'])]),
    Sidebar.sidebarInput({ value: model.query, onInput: onQuery, placeholder: 'Search navigation' }, h),
  ] }, h),
  Sidebar.sidebarContent({ children: [
    Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: ['Platform'] }, h), Sidebar.sidebarGroupContent({ children: [primaryNavigation(model, send, h)] }, h)] }, h),
    Sidebar.sidebarGroup({ spacing: 'later', children: [Sidebar.sidebarGroupLabel({ children: ['Learn'] }, h), Sidebar.sidebarGroupContent({ children: [nestedNavigation(h)] }, h)] }, h),
  ] }, h),
  Sidebar.sidebarFooter({ children: [account(h)] }, h),
];

const pageContent = <Msg>(title: string, trigger: Html, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => [
  h.header([h.Class(cx(styles.pageHeader))], [trigger, h.strong([h.Class(cx(styles.pageTitle))], [title])]),
  h.main([h.Class(cx(styles.pageMain))], [h.div([h.Class(cx(styles.skeletonBlock))], []), h.div([h.Class(cx(styles.skeletonBlock))], []), h.div([h.Class(cx(styles.skeletonBlockWide))], [])]),
];

const shell = <Msg>(kind: SidebarFixtureKind, model: { sidebar: Sidebar.Model; actionMenu: DropdownMenu.Model; query: string }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => {
  const state: Sidebar.SidebarState = model.sidebar.isOpen ? 'expanded' : 'collapsed';
  const variant: Sidebar.SidebarVariant = kind === 'floating' || kind === 'inset' ? kind : 'sidebar';
  const collapsible: Sidebar.SidebarCollapsible = kind === 'offcanvas' ? 'offcanvas' : 'icon';
  const side: Sidebar.SidebarSide = kind === 'right' ? 'right' : 'left';
  const sidebarMessage = (message: Sidebar.Message): Msg => send(JSON.stringify({ _tag: 'GotSidebarPreviewMessage', message }));
  const queryMessage = (value: string): Msg => send(JSON.stringify({ _tag: 'ChangedSidebarPreviewQuery', value }));
  const desktopToggle = sidebarMessage(Sidebar.Toggled());
  const trigger = Sidebar.sidebarTrigger({ onClick: desktopToggle, onMobileClick: sidebarMessage(Sidebar.ToggledMobile()) }, h);
  const panel = Sidebar.sidebar({
    state,
    side,
    variant,
    collapsible,
    presentation: 'contained',
    isMobileOpen: model.sidebar.isMobileOpen,
    onMobileDismiss: sidebarMessage(Sidebar.SetMobileOpen({ isOpen: false })),
    children: [...sidebarBody(model, send, queryMessage, h), Sidebar.sidebarRail({ onClick: desktopToggle }, h)],
  }, h);
  const inset = Sidebar.sidebarInset({
    variant,
    state,
    layoutStyle: styles.inset,
    children: pageContent(kind === 'shell' ? 'Product overview' : sidebarFixtures.find((fixture) => fixture.kind === kind)?.title ?? 'Workspace', trigger, h),
  }, h);

  return h.div([h.Class(cx(styles.frame))], [Sidebar.sidebarProvider({
    state,
    ...(kind === 'right' ? { width: '18rem', mobileWidth: '20rem', iconWidth: '3.25rem' } : {}),
    layoutStyle: styles.provider,
    children: side === 'right' ? [inset, panel] : [panel, inset],
  }, h)]);
};

const staticPanel = <Msg>(kind: 'menu' | 'nested' | 'loading', model: { actionMenu: DropdownMenu.Model; feedback: string }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => {
  const content = kind === 'menu'
    ? Sidebar.sidebarMenu({ children: [
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: true, children: iconLabel('gauge', 'Overview', h) }, h), Sidebar.sidebarMenuBadge({ children: ['12'] }, h)] }, h),
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ variant: 'outline', children: iconLabel('inbox', 'Inbox', h) }, h), actionMenu(model.actionMenu, 'Inbox actions', send, h)] }, h),
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ onClick: send(JSON.stringify({ _tag: 'CreatedSidebarPreviewProject' })), variant: 'primary', children: iconLabel('plus', 'Create project', h) }, h)] }, h),
      ] }, h)
    : kind === 'nested'
      ? nestedNavigation(h)
      : Sidebar.sidebarMenu({ children: [82, 68, 76, 58].map((widthPercent) => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuSkeleton({ showIcon: true, widthPercent }, h)] }, h)) }, h);

  return h.div([h.Class(cx(styles.staticFrame))], [h.div([h.Class(cx(styles.staticPanel))], [Sidebar.sidebarProvider({ width: '18rem', layoutStyle: styles.staticProvider, children: [Sidebar.sidebar({ collapsible: 'none', children: [
    Sidebar.sidebarHeader({ children: [h.div([h.Class(cx(styles.staticTitle))], [kind === 'loading' ? 'Loading projects' : 'Crease Workspace'])] }, h),
    Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: [kind === 'nested' ? 'Resources' : 'Workspace'] }, h), Sidebar.sidebarGroupContent({ children: [content] }, h), ...(kind === 'menu' && model.feedback !== '' ? [h.p([h.Role('status'), h.AriaLive('polite'), h.Class(cx(styles.feedback))], [model.feedback])] : [])] }, h)] }, h),
  ] }, h)] }, h)])]);
};

export const sidebarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, send: (json: string) => Msg, h: HtmlBuilder<Msg>) => {
  const kind = sidebarFixtures[index]?.kind ?? 'shell';
  return kind === 'menu' || kind === 'nested' || kind === 'loading'
    ? staticPanel(kind, model as { actionMenu: DropdownMenu.Model; feedback: string }, send, h)
    : shell(kind, model as { sidebar: Sidebar.Model; actionMenu: DropdownMenu.Model; query: string }, send, h);
};

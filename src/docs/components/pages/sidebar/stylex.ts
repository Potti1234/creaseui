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
  actionAnchor: { position: 'absolute', zIndex: 30, right: '0.25rem', top: '0.375rem', },
  actionTrigger: { borderRadius: '0.375rem', alignItems: 'center', backgroundColor: { default: 'transparent', ':hover': 'var(--sidebar-accent)' }, color: { default: 'var(--sidebar-foreground)', ':hover': 'var(--sidebar-accent-foreground)' }, display: 'flex', justifyContent: 'center', outlineStyle: 'none', height: '1.25rem', width: '1.25rem', },
  accountAvatar: { borderRadius: '0.5rem', alignItems: 'center', backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)', display: 'grid', flexShrink: 0, fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center', height: '2rem', width: '2rem', },
  accountCopy: { display: 'grid', flexGrow: 1, lineHeight: 1.25, textAlign: 'left', minWidth: 0, },
  accountEmail: { overflow: 'hidden', fontSize: '0.75rem', opacity: 0.7, textOverflow: 'ellipsis', whiteSpace: 'nowrap', },
  accountName: { overflow: 'hidden', fontSize: '0.875rem', fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap', },
  brand: { gap: '0.5rem', overflow: 'hidden', paddingBlock: '0.25rem', paddingInline: '0.5rem', alignItems: 'center', display: 'flex', whiteSpace: 'nowrap', },
  brandMark: { borderRadius: '0.375rem', alignItems: 'center', backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)', display: 'grid', flexShrink: 0, fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center', height: '1.75rem', width: '1.75rem', },
  brandName: { fontSize: '0.875rem', fontWeight: 600 },
  frame: { borderColor: 'var(--border)', borderRadius: '0.5rem', borderStyle: 'solid', borderWidth: 1, overflow: 'hidden', backgroundColor: 'var(--background)', position: 'relative', height: '26rem', minHeight: 0, width: '100%', },
  feedback: { paddingInline: '0.5rem', color: 'var(--sidebar-foreground)', fontSize: '0.75rem', opacity: 0.7, paddingTop: '0.5rem', },
  inset: { minHeight: 0 },
  pageHeader: { gap: '0.5rem', paddingInline: '1rem', alignItems: 'center', display: 'flex', flexShrink: 0, borderBottomColor: 'var(--border)', borderBottomStyle: 'solid', borderBottomWidth: 1, height: '3rem', },
  pageTitle: { fontSize: '0.875rem', fontWeight: 600 },
  provider: { height: '26rem', minHeight: 0 },
  skeletonBlock: { borderRadius: '0.5rem', backgroundColor: 'var(--muted)', height: '6rem', },
  skeletonBlockWide: { borderRadius: '0.5rem',
 backgroundColor: 'var(--muted)',
 gridColumnEnd: '-1',
 gridColumnStart: '1',
 height: '8rem', },
  pageMain: { padding: '1rem', gap: '1rem', display: 'grid', gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 640px)': 'repeat(2, minmax(0, 1fr))' }, },
  staticFrame: { padding: '1rem', alignItems: 'stretch', backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)', display: 'flex', justifyContent: 'center', height: '20rem', width: '100%', },
  staticPanel: { borderColor: 'var(--border)', borderRadius: '0.5rem', borderStyle: 'solid', borderWidth: 1, overflow: 'hidden', backgroundColor: 'var(--background)', maxWidth: '18rem', width: '100%', },
  staticProvider: { height: '100%', minHeight: 0, width: '100%' },
  staticTitle: { paddingBlock: '0.25rem', paddingInline: '0.5rem', fontSize: '0.875rem', fontWeight: 600, },
  accountTrigger: { padding: '0.5rem', borderRadius: '0.375rem', gap: '0.5rem', alignItems: 'center', backgroundColor: { default: 'transparent', ':hover': 'var(--sidebar-accent)' }, color: { default: 'var(--sidebar-foreground)', ':hover': 'var(--sidebar-accent-foreground)' }, display: 'flex', outlineStyle: 'none', textAlign: 'left', width: '100%', },
  learnChevron: { transitionDuration: '150ms', transitionProperty: 'transform', height: '1rem', marginLeft: 'auto', width: '1rem', },
  learnChevronOpen: { transform: 'rotate(90deg)' },
  noMatches: { paddingBlock: '0.375rem', paddingInline: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', },
  srOnly: { margin: -1, padding: 0, overflow: 'hidden', position: 'absolute', height: 1, width: 1, },
});

const isStaticStyle = (value: unknown): value is StaticStyles => typeof value === 'object' && value !== null;
const cx = (...values: ReadonlyArray<unknown>): string => className(...values.filter(isStaticStyle));
const iconLabel = <Msg>(name: string, label: string, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => [Icon.icon(name, {}, h), h.span([], [label])];

const actionItems = ['open', 'rename', 'delete'] as const;
const accountItems = ['profile', 'settings', 'sign out'] as const;
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

const primaryNavigation = <Msg>(model: { actionMenu: DropdownMenu.Model; query: string }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => {
  const query = model.query.trim().toLowerCase();
  const allEntries: ReadonlyArray<readonly [string, string]> = [
    ['Dashboard', 'gauge'],
    ['Inbox', 'inbox'],
    ['Projects', 'book-open'],
    ['Calendar', 'calendar-days'],
  ];
  const entries = allEntries.filter(([label]) => query === '' || label.toLowerCase().includes(query));
  return Sidebar.sidebarMenu({
  children: entries.length === 0
    ? [Sidebar.sidebarMenuItem({ children: [h.span([h.Class(cx(styles.noMatches))], ['No matching navigation'])] }, h)]
    : entries.map(([label, iconName], index) => Sidebar.sidebarMenuItem({ children: [
      Sidebar.sidebarMenuButton({ href: '#', isActive: index === 0, tooltip: label ?? '', children: iconLabel(iconName ?? 'circle', label ?? '', h) }, h),
      ...(index === 1 && query === '' ? [Sidebar.sidebarMenuBadge({ children: ['12'] }, h)] : []),
      ...(index === 2 && query === '' ? [actionMenu(model.actionMenu, 'Project actions', send, h)] : []),
    ] }, h)),
}, h);
};

const nestedNavigation = <Msg>(model: { learnOpen: boolean }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => Sidebar.sidebarMenu({ children: [
  Sidebar.sidebarMenuItem({ children: [
    Sidebar.sidebarMenuButton({
      onClick: send(JSON.stringify({ _tag: 'ToggledSidebarPreviewLearn' })),
      ariaExpanded: model.learnOpen,
      children: [...iconLabel('book-open', 'Documentation', h), Icon.chevronRight({ class: cx(styles.learnChevron, model.learnOpen && styles.learnChevronOpen) }, h)],
    }, h),
    ...(model.learnOpen ? [Sidebar.sidebarMenuSub({ children: ['Introduction', 'Components', 'Changelog'].map((label, index) => Sidebar.sidebarMenuSubItem({ children: [Sidebar.sidebarMenuSubButton({ href: '#', isActive: index === 1, children: [label] }, h)] }, h)) }, h)] : []),
  ] }, h),
] }, h);

const account = <Msg>(model: { accountMenu: DropdownMenu.Model }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => Sidebar.sidebarMenu({ children: [Sidebar.sidebarMenuItem({ children: [DropdownMenu.dropdownMenu({
  model: model.accountMenu,
  toParentMessage: (message) => send(JSON.stringify({ _tag: 'GotSidebarPreviewAccountMenuMessage', message })),
  trigger: h.span([h.Class(cx(styles.accountTrigger))], [
    h.span([h.Class(cx(styles.accountAvatar))], ['AL']),
    h.span([h.Class(cx(styles.accountCopy))], [h.span([h.Class(cx(styles.accountName))], ['Ada Lovelace']), h.span([h.Class(cx(styles.accountEmail))], ['ada@example.com'])]),
    Icon.chevronsUpDown({}, h),
  ]),
  ariaLabel: 'Account menu',
  side: 'top',
  align: 'start',
  items: accountItems,
  itemToConfig: (action) => ({ label: actionLabel(action) }),
}, h)] }, h)] }, h);

const sidebarBody = <Msg>(model: { actionMenu: DropdownMenu.Model; accountMenu: DropdownMenu.Model; query: string; learnOpen: boolean }, send: (json: string) => Msg, onQuery: (value: string) => Msg, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => [
  Sidebar.sidebarHeader({ children: [
    h.div([h.DataAttribute('sidebar', 'brand'), h.Class(cx(styles.brand))], [h.span([h.Class(cx(styles.brandMark))], ['C']), h.span([h.Class(cx(styles.brandName))], ['Crease Workspace'])]),
    Sidebar.sidebarInput({ value: model.query, onInput: onQuery, placeholder: 'Search navigation', ariaLabel: 'Search navigation' }, h),
  ] }, h),
  Sidebar.sidebarContent({ children: [
    Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: ['Platform'] }, h), Sidebar.sidebarGroupContent({ children: [primaryNavigation(model, send, h)] }, h)] }, h),
    Sidebar.sidebarGroup({ spacing: 'later', children: [Sidebar.sidebarGroupLabel({ children: ['Learn'] }, h), Sidebar.sidebarGroupContent({ children: [nestedNavigation(model, send, h)] }, h)] }, h),
  ] }, h),
  Sidebar.sidebarFooter({ children: [account(model, send, h)] }, h),
];

const pageContent = <Msg>(title: string, trigger: Html, h: HtmlBuilder<Msg>): ReadonlyArray<Html | string> => [
  h.header([h.Class(cx(styles.pageHeader))], [trigger, h.strong([h.Class(cx(styles.pageTitle))], [title])]),
  h.main([h.Class(cx(styles.pageMain))], [h.div([h.Class(cx(styles.skeletonBlock))], []), h.div([h.Class(cx(styles.skeletonBlock))], []), h.div([h.Class(cx(styles.skeletonBlockWide))], [])]),
];

const shell = <Msg>(kind: SidebarFixtureKind, model: { sidebar: Sidebar.Model; actionMenu: DropdownMenu.Model; accountMenu: DropdownMenu.Model; query: string; learnOpen: boolean }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => {
  const state: Sidebar.SidebarState = model.sidebar.isOpen ? 'expanded' : 'collapsed';
  const variant: Sidebar.SidebarVariant = kind === 'floating' || kind === 'inset' ? kind : 'sidebar';
  const collapsible: Sidebar.SidebarCollapsible = kind === 'offcanvas' ? 'offcanvas' : 'icon';
  const side: Sidebar.SidebarSide = kind === 'right' ? 'right' : 'left';
  const sidebarMessage = (message: Sidebar.Message): Msg => send(JSON.stringify({ _tag: 'GotSidebarPreviewMessage', message }));
  const queryMessage = (value: string): Msg => send(JSON.stringify({ _tag: 'ChangedSidebarPreviewQuery', value }));
  const desktopToggle = sidebarMessage(Sidebar.Message.Toggled());
  const trigger = Sidebar.sidebarTrigger({ onClick: desktopToggle, onMobileClick: sidebarMessage(Sidebar.Message.ToggledMobile()) }, h);
  const panel = Sidebar.sidebar({
    state,
    side,
    variant,
    collapsible,
    presentation: 'contained',
    isMobileOpen: model.sidebar.isMobileOpen,
    onMobileDismiss: sidebarMessage(Sidebar.Message.SetMobileOpen({ isOpen: false })),
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

const staticPanel = <Msg>(kind: 'menu' | 'nested' | 'loading', model: { actionMenu: DropdownMenu.Model; accountMenu: DropdownMenu.Model; learnOpen: boolean; feedback: string }, send: (json: string) => Msg, h: HtmlBuilder<Msg>): Html => {
  const content = kind === 'menu'
    ? Sidebar.sidebarMenu({ children: [
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: true, children: iconLabel('gauge', 'Overview', h) }, h), Sidebar.sidebarMenuBadge({ children: ['12'] }, h)] }, h),
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ variant: 'outline', children: iconLabel('inbox', 'Inbox', h) }, h), actionMenu(model.actionMenu, 'Inbox actions', send, h)] }, h),
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ onClick: send(JSON.stringify({ _tag: 'CreatedSidebarPreviewProject' })), variant: 'primary', children: iconLabel('plus', 'Create project', h) }, h)] }, h),
      ] }, h)
    : kind === 'nested'
      ? nestedNavigation(model, send, h)
      : Sidebar.sidebarMenu({ children: [82, 68, 76, 58].map((widthPercent) => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuSkeleton({ showIcon: true, widthPercent }, h)] }, h)) }, h);

  return h.div([h.Class(cx(styles.staticFrame))], [h.div([h.Class(cx(styles.staticPanel))], [Sidebar.sidebarProvider({ width: '18rem', layoutStyle: styles.staticProvider, children: [Sidebar.sidebar({ collapsible: 'none', children: [
    Sidebar.sidebarHeader({ children: [h.div([h.Class(cx(styles.staticTitle))], [kind === 'loading' ? 'Loading projects' : 'Crease Workspace'])] }, h),
    Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: [kind === 'nested' ? 'Resources' : 'Workspace'] }, h), Sidebar.sidebarGroupContent({ children: [content] }, h), ...(kind === 'menu' && model.feedback !== '' ? [h.p([h.Role('status'), h.AriaLive('polite'), h.Class(cx(styles.feedback))], [model.feedback])] : [])] }, h)] }, h),
  ] }, h)] }, h)])]);
};

export const sidebarStyleXPreview: StyleXExamplePreviewProvider = <Msg>(index: number, model: unknown, send: (json: string) => Msg, h: HtmlBuilder<Msg>) => {
  const kind = sidebarFixtures[index]?.kind ?? 'shell';
  return kind === 'menu' || kind === 'nested' || kind === 'loading'
    ? staticPanel(kind, model as { actionMenu: DropdownMenu.Model; accountMenu: DropdownMenu.Model; learnOpen: boolean; feedback: string }, send, h)
    : shell(kind, model as { sidebar: Sidebar.Model; actionMenu: DropdownMenu.Model; accountMenu: DropdownMenu.Model; query: string; learnOpen: boolean }, send, h);
};

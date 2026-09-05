import { Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { sidebarFixtures, type SidebarFixtureKind } from '@/docs/components/pages/sidebar/shared';
import * as Icon from '@/lib/icon';
import * as Sidebar from '@/ui/sidebar';

const GotSidebar = m('GotSidebarPreviewMessage', { message: Sidebar.Message });
const ChangedQuery = m('ChangedSidebarPreviewQuery', { value: S.String });
const PressedAction = m('PressedSidebarPreviewAction');
const Message = S.Union([GotSidebar, ChangedQuery, PressedAction]);
type Message = typeof Message.Type;
const Model = S.Struct({ _docsPage: S.Literal('sidebar'), sidebar: Sidebar.Model, query: S.String });
type Model = typeof Model.Type;

const subscriptions = typeof document === 'undefined'
  ? undefined
  : Subscription.make<Model, Message>()(() => ({
      sidebarShortcut: Subscription.persistent(Sidebar.shortcut((message) => GotSidebar({ message }))),
    }));

const iconLabel = (name: string, label: string, h: HtmlBuilder<Message>): ReadonlyArray<Html | string> => [
  Icon.icon(name, {}, h),
  h.span([], [label]),
];

const primaryNavigation = (h: HtmlBuilder<Message>): Html => Sidebar.sidebarMenu({
  children: [
    ['Dashboard', 'gauge'],
    ['Inbox', 'inbox'],
    ['Projects', 'book-open'],
    ['Calendar', 'calendar-days'],
  ].map(([label, iconName], index) => Sidebar.sidebarMenuItem({
    children: [
      Sidebar.sidebarMenuButton({
        href: '#',
        isActive: index === 0,
        tooltip: label ?? '',
        children: iconLabel(iconName ?? 'circle', label ?? '', h),
      }, h),
      ...(index === 1 ? [Sidebar.sidebarMenuBadge({ children: ['12'] }, h)] : []),
      ...(index === 2 ? [Sidebar.sidebarMenuAction({
        onClick: PressedAction(),
        showOnHover: true,
        children: [Icon.moreHorizontal({}, h), h.span([h.Class('sr-only')], ['Project actions'])],
      }, h)] : []),
    ],
  }, h)),
}, h);

const account = (h: HtmlBuilder<Message>): Html => Sidebar.sidebarMenu({
  children: [Sidebar.sidebarMenuItem({
    children: [Sidebar.sidebarMenuButton({
      size: 'lg',
      children: [
        h.span([h.Class('grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground')], ['AL']),
        h.span([h.Class('grid min-w-0 flex-1 text-left leading-tight')], [
          h.span([h.Class('truncate text-sm font-medium')], ['Ada Lovelace']),
          h.span([h.Class('truncate text-xs text-sidebar-foreground/70')], ['ada@example.com']),
        ]),
        Icon.chevronsUpDown({}, h),
      ],
    }, h)],
  }, h)],
}, h);

const nestedNavigation = (h: HtmlBuilder<Message>): Html => Sidebar.sidebarMenu({
  children: [Sidebar.sidebarMenuItem({
    children: [
      Sidebar.sidebarMenuButton({ isActive: true, children: iconLabel('book-open', 'Documentation', h) }, h),
      Sidebar.sidebarMenuSub({ children: ['Introduction', 'Components', 'Changelog'].map((label, index) =>
        Sidebar.sidebarMenuSubItem({ children: [Sidebar.sidebarMenuSubButton({ href: '#', isActive: index === 1, children: [label] }, h)] }, h),
      ) }, h),
    ],
  }, h)],
}, h);

const sidebarBody = (model: Model, h: HtmlBuilder<Message>, detailed = true): ReadonlyArray<Html | string> => [
  Sidebar.sidebarHeader({ children: [
    h.div([h.DataAttribute('sidebar', 'brand'), h.Class('flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:px-0.5')], [
      h.span([h.Class('grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground')], ['C']),
      h.span([h.Class('truncate text-sm font-semibold')], ['Crease Workspace']),
    ]),
    ...(detailed ? [Sidebar.sidebarInput({ value: model.query, onInput: (value) => ChangedQuery({ value }), placeholder: 'Search navigation' }, h)] : []),
  ] }, h),
  Sidebar.sidebarContent({ children: [
    Sidebar.sidebarGroup({ children: [
      Sidebar.sidebarGroupLabel({ children: ['Platform'] }, h),
      Sidebar.sidebarGroupContent({ children: [primaryNavigation(h)] }, h),
    ] }, h),
    ...(detailed ? [Sidebar.sidebarGroup({ children: [
      Sidebar.sidebarGroupLabel({ children: ['Learn'] }, h),
      Sidebar.sidebarGroupContent({ children: [nestedNavigation(h)] }, h),
    ] }, h)] : []),
  ] }, h),
  Sidebar.sidebarFooter({ children: [account(h)] }, h),
];

const pageContent = (title: string, h: HtmlBuilder<Message>): ReadonlyArray<Html | string> => [
  h.header([h.Class('flex h-12 shrink-0 items-center gap-2 border-b px-4')], [
    h.strong([h.Class('text-sm')], [title]),
  ]),
  h.main([h.Class('grid gap-4 p-4 sm:grid-cols-2')], [
    h.div([h.Class('h-24 rounded-lg bg-muted')], []),
    h.div([h.Class('h-24 rounded-lg bg-muted')], []),
    h.div([h.Class('h-32 rounded-lg bg-muted sm:col-span-2')], []),
  ]),
];

const shell = (kind: SidebarFixtureKind, model: Model, h: HtmlBuilder<Message>): Html => {
  const state: Sidebar.SidebarState = model.sidebar.isOpen ? 'expanded' : 'collapsed';
  const variant: Sidebar.SidebarVariant = kind === 'floating' || kind === 'inset' ? kind : 'sidebar';
  const collapsible: Sidebar.SidebarCollapsible = kind === 'offcanvas' ? 'offcanvas' : 'icon';
  const side: Sidebar.SidebarSide = kind === 'right' ? 'right' : 'left';
  const desktopToggle = GotSidebar({ message: Sidebar.Toggled() });
  const mobileToggle = GotSidebar({ message: Sidebar.ToggledMobile() });
  const panel = Sidebar.sidebar({
    state,
    side,
    variant,
    collapsible,
    presentation: 'contained',
    isMobileOpen: model.sidebar.isMobileOpen,
    onMobileDismiss: GotSidebar({ message: Sidebar.SetMobileOpen({ isOpen: false }) }),
    children: [...sidebarBody(model, h), Sidebar.sidebarRail({ onClick: desktopToggle }, h)],
  }, h);
  const inset = Sidebar.sidebarInset({
    variant,
    state,
    class: 'min-h-0 overflow-auto',
    children: [
      h.header([h.Class('flex h-12 shrink-0 items-center gap-2 border-b px-4')], [
        Sidebar.sidebarTrigger({ onClick: desktopToggle, onMobileClick: mobileToggle }, h),
        h.strong([h.Class('text-sm')], [kind === 'shell' ? 'Product overview' : sidebarFixtures.find((fixture) => fixture.kind === kind)?.title ?? 'Workspace']),
      ]),
      ...pageContent('Recent activity', h).slice(1),
    ],
  }, h);

  return Sidebar.sidebarProvider({
    state,
    ...(kind === 'right' ? { width: '18rem', mobileWidth: '20rem', iconWidth: '3.25rem' } : {}),
    class: 'relative h-[26rem] min-h-0 overflow-hidden rounded-lg border bg-background',
    children: side === 'right' ? [inset, panel] : [panel, inset],
  }, h);
};

const staticPanel = (kind: 'menu' | 'nested' | 'loading', h: HtmlBuilder<Message>): Html => {
  const content = kind === 'menu'
    ? Sidebar.sidebarMenu({ children: [
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: true, children: iconLabel('gauge', 'Overview', h) }, h), Sidebar.sidebarMenuBadge({ children: ['12'] }, h)] }, h),
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ variant: 'outline', children: iconLabel('inbox', 'Inbox', h) }, h), Sidebar.sidebarMenuAction({ onClick: PressedAction(), showOnHover: true, children: [Icon.moreHorizontal({}, h), h.span([h.Class('sr-only')], ['Inbox actions'])] }, h)] }, h),
        Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ variant: 'primary', children: iconLabel('plus', 'Create project', h) }, h)] }, h),
      ] }, h)
    : kind === 'nested'
      ? nestedNavigation(h)
      : Sidebar.sidebarMenu({ children: [82, 68, 76, 58].map((widthPercent) => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuSkeleton({ showIcon: true, widthPercent }, h)] }, h)) }, h);

  return h.div([h.Class('flex h-[26rem] items-stretch justify-center overflow-hidden rounded-lg border bg-muted/30 p-4')], [
    Sidebar.sidebarProvider({ width: '18rem', class: 'min-h-0 w-[18rem] overflow-hidden rounded-lg border bg-background', children: [
      Sidebar.sidebar({ collapsible: 'none', children: [
        Sidebar.sidebarHeader({ children: [h.div([h.Class('px-2 py-1 text-sm font-semibold')], [kind === 'loading' ? 'Loading projects' : 'Crease Workspace'])] }, h),
        Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: [kind === 'nested' ? 'Resources' : 'Workspace'] }, h), Sidebar.sidebarGroupContent({ children: [content] }, h)] }, h)] }, h),
      ] }, h),
    ] }, h),
  ]);
};

export const sidebarTailwindPreviewProgram = definePreviewProgram<Model, Message>({
  Model,
  Message,
  init: (index) => ({ _docsPage: 'sidebar', sidebar: Sidebar.init({ defaultOpen: true, storageKey: `docs_sidebar_${String(index)}` }), query: '' }),
  update: (model, message) => {
    switch (message._tag) {
      case 'GotSidebarPreviewMessage': {
        const [sidebar, commands] = Sidebar.update(model.sidebar, message.message);
        return [{ ...model, sidebar }, Command.mapMessages(commands, (next) => GotSidebar({ message: next }))];
      }
      case 'ChangedSidebarPreviewQuery': return [{ ...model, query: message.value }, []];
      case 'PressedSidebarPreviewAction': return [model, []];
    }
  },
  ...(subscriptions === undefined ? {} : { subscriptions }),
  view: (index, model, h) => {
    const kind = sidebarFixtures[index]?.kind ?? 'shell';
    return kind === 'menu' || kind === 'nested' || kind === 'loading'
      ? staticPanel(kind, h)
      : shell(kind, model, h);
  },
});

import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Sidebar from '@/ui/sidebar';

const nav = <Msg>(h: HtmlBuilder<Msg>) => Sidebar.sidebarMenu({ children: ['Playground', 'Models', 'Documentation'].map((label, index) => Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: index === 0, children: [label] }, h)] }, h)) }, h);

const preview = (model: State.Model, interactive: boolean, h: HtmlBuilder<State.Message>) => {
  const state: Sidebar.SidebarState = model.isCollapsibleOpen ? 'expanded' : 'collapsed';
  const toggle = State.ToggledCollapsible({ isOpen: !model.isCollapsibleOpen });
  return Sidebar.sidebarProvider({ state, class: 'relative h-80 min-h-0 overflow-hidden rounded-lg border', children: [Sidebar.sidebar({ state, collapsible: interactive ? 'icon' : 'none', ...(interactive ? { class: '!absolute !inset-y-0 !h-full' } : {}), children: [Sidebar.sidebarHeader({ children: [h.div([h.Class('px-2 py-1 font-semibold')], ['Acme Inc.'])] }, h), Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [Sidebar.sidebarGroupLabel({ children: ['Platform'] }, h), Sidebar.sidebarGroupContent({ children: [nav(h)] }, h)] }, h)] }, h), Sidebar.sidebarFooter({ children: ['Workspace'] }, h)] }, h), Sidebar.sidebarInset({ class: 'min-h-0', children: interactive ? [h.header([h.Class('flex h-12 items-center border-b px-3')], [Sidebar.sidebarTrigger({ onClick: toggle }, h)]), h.div([h.Class('p-4 text-sm text-muted-foreground')], ['Main content remains independent of sidebar state.'])] : [] }, h)] }, h);
};

const source = foldkitApplication({
  title: 'Sidebar — Persistent application shell',
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Sidebar from '@/ui/sidebar'`,
  model: `export const Model = S.Struct({ sidebar: Sidebar.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotSidebarMessage = m('GotSidebarMessage', { message: Sidebar.Message })
export const Message = S.Union([GotSidebarMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { sidebar: Sidebar.init({ defaultOpen: true, storageKey: 'workspace_sidebar' }) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotSidebarMessage': {
      const [sidebar, commands] = Sidebar.update(model.sidebar, message.message)
      return [{ ...model, sidebar }, Command.mapMessages(commands, next => GotSidebarMessage({ message: next }))]
    }
  }
}`,
  subscriptions: `export const subscriptions = Subscription.aggregate<Model, Message>()(
  { sidebarShortcut: () => Sidebar.shortcut(next => GotSidebarMessage({ message: next })) },
)`,
  view: `const navigation = (h: HtmlBuilder<Message>) => Sidebar.sidebarMenu({
  children: ['Playground', 'Models', 'Documentation'].map((label, index) =>
    Sidebar.sidebarMenuItem({ children: [Sidebar.sidebarMenuButton({ isActive: index === 0, children: [label] }, h)] }, h),
  ),
}, h)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const state: Sidebar.SidebarState = model.sidebar.isOpen ? 'expanded' : 'collapsed'
  const toggle = GotSidebarMessage({ message: Sidebar.Toggled() })
  return {
    title: 'Sidebar — Persistent application shell',
    body: Sidebar.sidebarProvider({ state, children: [
      Sidebar.sidebar({
        state,
        collapsible: 'icon',
        isMobileOpen: model.sidebar.isMobileOpen,
        onMobileDismiss: GotSidebarMessage({ message: Sidebar.SetMobileOpen({ isOpen: false }) }),
        children: [
          Sidebar.sidebarHeader({ children: [h.div([h.Class('px-2 py-1 font-semibold')], ['Acme Inc.'])] }, h),
          Sidebar.sidebarContent({ children: [Sidebar.sidebarGroup({ children: [
            Sidebar.sidebarGroupLabel({ children: ['Platform'] }, h),
            Sidebar.sidebarGroupContent({ children: [navigation(h)] }, h),
          ] }, h)] }, h),
          Sidebar.sidebarFooter({ children: ['Workspace'] }, h),
          Sidebar.sidebarRail({ onClick: toggle }, h),
        ],
      }, h),
      Sidebar.sidebarInset({ children: [
        h.header([h.Class('flex h-12 items-center border-b px-3')], [Sidebar.sidebarTrigger({ onClick: toggle }, h)]),
        h.main([h.Class('p-6')], ['Application content']),
      ] }, h),
    ] }, h),
  }
}`,
});

export const sidebarPage = authoredPage({
  slug: 'sidebar', title: 'Sidebar', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'Builds a responsive application shell with persistent desktop collapse state and separate mobile disclosure state.',
    architecture: 'Sidebar’s exported Model owns desktop open, mobile open, and persistence key. The parent delegates Message, maps the cookie-persistence Command, and registers the cmd/ctrl+B subscription. View helpers receive derived expanded/collapsed state explicitly—there is no React context.',
    apiHref: 'https://foldkit.dev/guide/subscriptions',
    composition: 'SidebarProvider (derived state)\n├── Sidebar\n│   ├── header\n│   ├── content → groups → menu items\n│   ├── footer\n│   └── collapse rail\n└── SidebarInset\n    └── trigger + application content',
    styling: 'Desktop and mobile states are deliberately separate. Choose icon, offcanvas, or none per shell; avoid nesting fixed sidebars inside ordinary document content without a bounded layout override.',
    accessibility: 'Triggers have screen-reader labels, mobile presentation is a named aside with a dismiss backdrop, and navigation items remain ordinary buttons or links. Persisted visual state must not hide the only route to content.',
    keyboard: [['Ctrl/⌘ + B', 'Toggles desktop sidebar state through a document subscription.'], ['Tab', 'Moves through the trigger and visible navigation controls.'], ['Enter / Space', 'Activates the focused navigation control or trigger.']],
    examples: [
      { title: 'Persistent shell', description: 'The complete application includes the child update, persistence Command mapping, keyboard subscription, mobile state, and composed view.', preview: (model, h) => preview(model, true, h), code: source },
      { title: 'Static structure', description: 'Use collapsible none when a bounded navigation column should always remain present.', preview: (model, h) => preview(model, false, h), code: source },
    ],
  },
});

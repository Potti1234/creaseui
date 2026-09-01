import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Tabs from '@/ui/tabs';

const source = (name: string, initialValue: string, tabSource: string, extra: string): string => foldkitApplication({
  title: `Tabs — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Tabs from '@/ui/tabs'`,
  model: `export const TabValue = S.Literals(['account', 'security', 'billing', 'overview', 'deployments', 'settings'])
export type TabValue = typeof TabValue.Type
const SettingsTabs = Tabs.create<TabValue>()
export const Model = S.Struct({
  tabs: Tabs.Model,
  selectedTab: TabValue,
})
export type Model = typeof Model.Type`,
  messages: `export const GotTabsMessage = m('GotTabsMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Tabs.Message })
export const Message = S.Union([GotTabsMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { tabs: Tabs.init({ id: 'settings-tabs'${name === 'Manual with disabled tab' ? ", activationMode: 'Manual'" : ''} }), selectedTab: '${initialValue}' },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotTabsMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [tabs, commands, maybeSelection] = SettingsTabs.update(model.tabs, message.message)
      return [
        {
          ...model,
          tabs,
          selectedTab: Option.match(maybeSelection, {
            onNone: () => model.selectedTab,
            onSome: selection => selection.value,
          }),
        },
        Command.mapMessages(commands, next => GotTabsMessage({ message: next })),
      ]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Tabs — ${name}',
  body: h.main([h.Class('mx-auto max-w-xl p-8')], [
    SettingsTabs.tabs({
      model: model.tabs,
      selectedValue: model.selectedTab,
      toParentMessage: message => GotTabsMessage({ message }),
      ariaLabel: 'Settings',
      tabs: [
${tabSource}
      ],
      ${extra}
    }, h),
  ]),
})`,
});

const configs = [
  { value: 'account', label: 'Account', content: 'Manage your profile details.' },
  { value: 'security', label: 'Security', content: 'Review passwords and sessions.' },
  { value: 'billing', label: 'Billing', content: 'Update invoices and payment methods.' },
] as const;

const lineConfigs = [
  { value: 'overview', label: 'Overview', content: 'Project activity and health.' },
  { value: 'deployments', label: 'Deployments', content: 'Recent production releases.' },
  { value: 'settings', label: 'Settings', content: 'Project-level configuration.' },
] as const;
const allConfigs = [...configs, ...lineConfigs] as const;
type PreviewTab = typeof allConfigs[number]['value'];
const PreviewTabs = Tabs.create<PreviewTab>();
const GotTabsPreviewMessage = m('GotTabsPreviewMessage', { message: Tabs.Message });
type GotTabsPreviewMessage = typeof GotTabsPreviewMessage.Type;
const TabsPreviewModel = S.Struct({ _docsPage: S.Literal('tabs'), tabs: Tabs.Model, selectedTab: S.Literals(['account', 'security', 'billing', 'overview', 'deployments', 'settings']) });
type TabsPreviewModel = typeof TabsPreviewModel.Type;
const previewProgram = definePreviewProgram<TabsPreviewModel, GotTabsPreviewMessage>({
  Model: TabsPreviewModel,
  Message: GotTabsPreviewMessage,
  init: index => ({ _docsPage: 'tabs', tabs: Tabs.init({ id: `docs-tabs-${String(index)}`, ...(index === 2 ? { activationMode: 'Manual' as const } : {}) }), selectedTab: index === 0 || index === 2 ? 'account' : index === 3 ? 'settings' : 'overview' }),
  update: (model, message) => {
    const [tabs, commands, maybeSelection] = PreviewTabs.update(model.tabs, message.message);
    return [
      { ...model, tabs, selectedTab: Option.match(maybeSelection, { onNone: () => model.selectedTab, onSome: selection => selection.value }) },
      Command.mapMessages(commands, next => GotTabsPreviewMessage({ message: next })),
    ];
  },
  view: (index, model, h) => PreviewTabs.tabs({ model: model.tabs, selectedValue: model.selectedTab, toParentMessage: message => GotTabsPreviewMessage({ message }), ariaLabel: index === 0 || index === 2 ? 'Settings' : 'Project sections', tabs: index === 0 || index === 2 ? configs.map(tab => index === 2 && tab.value === 'security' ? { ...tab, isDisabled: true } : tab) : lineConfigs, ...(index === 1 ? { variant: 'line' as const } : {}), ...(index === 3 ? { direction: 'rtl' as const } : {}) }, h),
});

export const tabsPage = authoredPage({
  slug: 'tabs', title: 'Tabs', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Switches between related panels while coordinating roving focus, keyboard navigation, and an application-owned selected value.',
    architecture: 'Bind the domain value once with Tabs.create<Value>(). The child Model owns only roving focus and activation mode; the parent or route owns the selected value and passes it back every render. Delegate child Messages through the bound update, map Commands, and persist the typed Selected OutMessage.',
    apiHref: 'https://foldkit.dev/ui/tabs',
    composition: 'Tabs\n├── TabsList\n│   └── TabsTrigger\n└── TabsContent',
    styling: 'Use the default contained treatment for settings and the line variant for section-level navigation. Keep labels short enough to scan as one set.',
    accessibility: 'Foldkit owns deterministic tab/tabpanel relationships and roving focus. Disabled tabs are skipped, manual mode separates focus from activation, and horizontal RTL order mirrors arrow navigation. ariaLabel distinguishes the set when nearby headings are insufficient.',
    keyboard: [['Arrow keys', 'Moves focus between enabled tabs.'], ['Home / End', 'Moves to the first or last enabled tab.'], ['Enter / Space', 'Selects a focused tab in manual activation mode.']],
    examples: [
      {
        title: 'Settings', description: 'Child update manages focus while the parent persists the selected domain value.',

        code: source('Settings', 'account', `        { value: 'account', label: 'Account', content: 'Manage your profile details.' },
        { value: 'security', label: 'Security', content: 'Review passwords and sessions.' },
        { value: 'billing', label: 'Billing', content: 'Update invoices and payment methods.' },`, ''),
      },
      {
        title: 'Line variant', description: 'A separate child instance needs its own id, Model, Message routing, and selected value.',

        code: source('Line variant', 'overview', `        { value: 'overview', label: 'Overview', content: 'Project activity and health.' },
        { value: 'deployments', label: 'Deployments', content: 'Recent production releases.' },
        { value: 'settings', label: 'Settings', content: 'Project-level configuration.' },`, `variant: 'line',`),
      },
      {
        title: 'Manual with disabled tab', description: 'Manual activation moves focus without changing the parent-owned value until Enter or Space; disabled tabs are skipped.',
        code: source('Manual with disabled tab', 'account', `        { value: 'account', label: 'Account', content: 'Manage your profile details.' },
        { value: 'security', label: 'Security', content: 'Review passwords and sessions.', isDisabled: true },
        { value: 'billing', label: 'Billing', content: 'Update invoices and payment methods.' },`, ''),
      },
      {
        title: 'RTL route value', description: 'The selected route remains parent-owned while horizontal tab order and arrow direction mirror in RTL.',
        code: source('RTL route value', 'settings', `        { value: 'overview', label: 'Overview', content: 'Project activity and health.' },
        { value: 'deployments', label: 'Deployments', content: 'Recent production releases.' },
        { value: 'settings', label: 'Settings', content: 'Project-level configuration.' },`, `direction: 'rtl',`),
      },
    ],
  },
});

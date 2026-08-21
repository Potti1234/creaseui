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
  model: `export const Model = S.Struct({
  tabs: Tabs.Model,
  selectedTab: S.String,
})
export type Model = typeof Model.Type`,
  messages: `export const GotTabsMessage = m('GotTabsMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Tabs.Message })
export const Message = S.Union([GotTabsMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { tabs: Tabs.init({ id: 'settings-tabs' }), selectedTab: '${initialValue}' },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotTabsMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [tabs, commands, maybeSelection] = Tabs.update(model.tabs, message.message)
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
    Tabs.tabs({
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
const GotTabsPreviewMessage = m('GotTabsPreviewMessage', { message: Tabs.Message });
type GotTabsPreviewMessage = typeof GotTabsPreviewMessage.Type;
const TabsPreviewModel = S.Struct({ _docsPage: S.Literal('tabs'), tabs: Tabs.Model, selectedTab: S.String });
type TabsPreviewModel = typeof TabsPreviewModel.Type;
const previewProgram = definePreviewProgram<TabsPreviewModel, GotTabsPreviewMessage>({
  Model: TabsPreviewModel,
  Message: GotTabsPreviewMessage,
  init: index => ({ _docsPage: 'tabs', tabs: Tabs.init({ id: `docs-tabs-${String(index)}` }), selectedTab: index === 0 ? 'account' : 'overview' }),
  update: (model, message) => {
    const [tabs, commands, maybeSelection] = Tabs.update(model.tabs, message.message);
    return [
      { ...model, tabs, selectedTab: Option.match(maybeSelection, { onNone: () => model.selectedTab, onSome: selection => selection.value }) },
      Command.mapMessages(commands, next => GotTabsPreviewMessage({ message: next })),
    ];
  },
  view: (index, model, h) => Tabs.tabs({ model: model.tabs, selectedValue: model.selectedTab, toParentMessage: message => GotTabsPreviewMessage({ message }), ariaLabel: index === 0 ? 'Settings' : 'Project sections', tabs: index === 0 ? configs : lineConfigs, ...(index === 1 ? { variant: 'line' as const } : {}) }, h),
});

export const tabsPage = authoredPage({
  slug: 'tabs', title: 'Tabs', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Switches between related panels while coordinating roving focus, keyboard navigation, and an application-owned selected value.',
    architecture: 'Tabs has a child Model for focus/navigation mechanics and emits selection as an OutMessage. Delegate child Messages through Tabs.update, map returned Commands, and store the selected value in the parent Model.',
    apiHref: 'https://foldkit.dev/ui/tabs',
    composition: 'Tabs\n├── TabsList\n│   └── TabsTrigger\n└── TabsContent',
    styling: 'Use the default contained treatment for settings and the line variant for section-level navigation. Keep labels short enough to scan as one set.',
    accessibility: 'Foldkit owns tablist, tab, and tabpanel relationships plus roving focus. ariaLabel distinguishes the set when nearby headings are insufficient.',
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
    ],
  },
});

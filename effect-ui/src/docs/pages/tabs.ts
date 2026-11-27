import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Card, Icon, Tabs } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Tab = {
  readonly value: string
  readonly label: string
  readonly content: string
  readonly disabled?: boolean
  readonly icon?: string
  readonly labelHidden?: boolean
  readonly card?: { title: string; description: string; text: string }
}
const cards = (locale: 'en' | 'ar'): readonly Tab[] =>
  locale === 'en'
    ? [
        {
          value: 'overview',
          label: 'Overview',
          content: '',
          card: {
            title: 'Overview',
            description:
              'View your key metrics and recent project activity. Track progress across all your active projects.',
            text: 'You have 12 active projects and 3 pending tasks.',
          },
        },
        {
          value: 'analytics',
          label: 'Analytics',
          content: '',
          card: {
            title: 'Analytics',
            description:
              'Track performance and user engagement metrics. Monitor trends and identify growth opportunities.',
            text: 'Page views are up 25% compared to last month.',
          },
        },
        {
          value: 'reports',
          label: 'Reports',
          content: '',
          card: {
            title: 'Reports',
            description:
              'Generate and download your detailed reports. Export data in multiple formats for analysis.',
            text: 'You have 5 reports ready and available to export.',
          },
        },
        {
          value: 'settings',
          label: 'Settings',
          content: '',
          card: {
            title: 'Settings',
            description:
              'Manage your account preferences and options. Customize your experience to fit your needs.',
            text: 'Configure notifications, security, and themes.',
          },
        },
      ]
    : [
        {
          value: 'overview',
          label: 'نظرة عامة',
          content: '',
          card: {
            title: 'نظرة عامة',
            description:
              'عرض مقاييسك الرئيسية وأنشطة المشروع الأخيرة. تتبع التقدم عبر جميع مشاريعك النشطة.',
            text: 'لديك ١٢ مشروعًا نشطًا و٣ مهام معلقة.',
          },
        },
        {
          value: 'analytics',
          label: 'التحليلات',
          content: '',
          card: {
            title: 'التحليلات',
            description:
              'تتبع مقاييس الأداء ومشاركة المستخدمين. راقب الاتجاهات وحدد فرص النمو.',
            text: 'زادت مشاهدات الصفحة بنسبة ٢٥٪ مقارنة بالشهر الماضي.',
          },
        },
        {
          value: 'reports',
          label: 'التقارير',
          content: '',
          card: {
            title: 'التقارير',
            description:
              'إنشاء وتنزيل تقاريرك التفصيلية. تصدير البيانات بتنسيقات متعددة للتحليل.',
            text: 'لديك ٥ تقارير جاهزة ومتاحة للتصدير.',
          },
        },
        {
          value: 'settings',
          label: 'الإعدادات',
          content: '',
          card: {
            title: 'الإعدادات',
            description:
              'إدارة تفضيلات حسابك وخياراته. تخصيص تجربتك لتناسب احتياجاتك.',
            text: 'تكوين الإشعارات والأمان والسمات.',
          },
        },
      ]
const fixtures: Record<
  string,
  {
    aria: string
    tabs: readonly Tab[]
    variant?: 'line'
    vertical?: boolean
    rtl?: boolean
    manual?: boolean
  }
> = {
  demo: { aria: 'Project overview', tabs: cards('en') },
  line: {
    aria: 'Project sections',
    variant: 'line',
    tabs: [
      { value: 'overview', label: 'Overview', content: '' },
      { value: 'analytics', label: 'Analytics', content: '' },
      { value: 'reports', label: 'Reports', content: '' },
    ],
  },
  vertical: {
    aria: 'Account settings',
    vertical: true,
    tabs: [
      { value: 'account', label: 'Account', content: '' },
      { value: 'password', label: 'Password', content: '' },
      { value: 'notifications', label: 'Notifications', content: '' },
    ],
  },
  disabled: {
    aria: 'Home sections',
    tabs: [
      { value: 'home', label: 'Home', content: '' },
      { value: 'settings', label: 'Disabled', content: '', disabled: true },
    ],
  },
  icons: {
    aria: 'Preview and code',
    tabs: [
      { value: 'preview', label: 'Preview', content: '', icon: 'app-window' },
      { value: 'code', label: 'Code', content: '', icon: 'code' },
    ],
  },
  iconOnly: {
    aria: 'View mode',
    tabs: [
      {
        value: 'grid',
        label: 'Grid',
        content: '',
        icon: 'layout-grid',
        labelHidden: true,
      },
      {
        value: 'list',
        label: 'List',
        content: '',
        icon: 'list',
        labelHidden: true,
      },
      {
        value: 'table',
        label: 'Table',
        content: '',
        icon: 'table',
        labelHidden: true,
      },
    ],
  },
  rtl: { aria: 'نظرة عامة على المشروع', rtl: true, tabs: cards('ar') },
  manual: {
    aria: 'Settings',
    manual: true,
    tabs: [
      {
        value: 'account',
        label: 'Account',
        content: 'Manage your profile details.',
      },
      {
        value: 'security',
        label: 'Security',
        content: 'Review passwords and sessions.',
        disabled: true,
      },
      {
        value: 'billing',
        label: 'Billing',
        content: 'Update invoices and payment methods.',
      },
    ],
  },
}

const Message = UiSchema.TaggedEnum({ SelectedTab: { value: Schema.String } })
const TabsDemo = Html.component({
  name: 'DocsTabsDemo',
  props: Schema.Struct({ kind: Schema.String }),
  model: Schema.Struct({ value: Schema.String }),
  message: Message,
}).make({
  init: h => ({
    value:
      (
        (fixtures[h.props.kind] ?? fixtures.demo) as NonNullable<
          (typeof fixtures)[string]
        >
      ).tabs[0]?.value ?? 'overview',
  }),
  update: { SelectedTab: ($, { value }) => $.evolve({ value }) },
  view: (h, model) => {
    const fixture = (fixtures[h.props.kind] ?? fixtures.demo) as NonNullable<
      (typeof fixtures)[string]
    >
    return Tabs(h, {
      ariaLabel: fixture.aria,
      ...(fixture.variant === undefined ? {} : { variant: fixture.variant }),
      ...(fixture.rtl === true ? { direction: 'rtl' as const } : {}),
      ...(h.props.kind === 'demo' ? { className: 'w-100' } : {}),
      props: {
        value: model.value,
        activateOnFocus: fixture.manual !== true,
        ...(fixture.vertical === true
          ? { orientation: 'vertical' as const }
          : {}),
      },
      tabs: fixture.tabs.map(tab => {
        const cardSpec = tab.card
        return {
          value: tab.value,
          label: tab.label,
          content:
            cardSpec === undefined
              ? tab.content
              : Card(h, {
                  children: card => [
                    card.header({
                      children: [
                        card.title({ children: [cardSpec.title] }),
                        card.description({ children: [cardSpec.description] }),
                      ],
                    }),
                    card.content({ children: [cardSpec.text] }),
                  ],
                }),
          ...(tab.disabled === true ? { disabled: true } : {}),
          ...(tab.icon === undefined
            ? {}
            : { icon: Icon(h, { name: tab.icon as never, size: 'sm' }) }),
          ...(tab.labelHidden === true ? { isLabelHidden: true } : {}),
        }
      }),
      onEmit: { Selected: ({ value }) => Message.SelectedTab({ value }) },
    })
  },
})

const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    TabsDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind },
    }) as never

const source = exampleApplicationSource({
  imports: `import { Tabs } from '@/ui/effect/ui'`,
  body: `Tabs(h, {
  ariaLabel: 'Project overview',
  props: { value },
  tabs,
  onEmit: { Selected: ({ value }) => SelectedTab({ value }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Tabs } from '@/ui/effect/ui'\n\nTabs(h, { props: { value }, tabs, onEmit })`,
  examples: [
    { title: 'Basic', view: view('demo'), source },
    { title: 'Line', view: view('line'), source },
    { title: 'Vertical', view: view('vertical'), source },
    { title: 'Disabled', view: view('disabled'), source },
    { title: 'Icons', view: view('icons'), source },
    { title: 'Icon Only', view: view('iconOnly'), source },
    { title: 'RTL', view: view('rtl'), source },
    { title: 'Manual with disabled tab', view: view('manual'), source },
  ],
})

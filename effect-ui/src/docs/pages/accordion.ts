import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Accordion, Card } from '#components'
import { defineComponentDocs } from '../types'
import './accordion.css'

type FixtureItem = {
  readonly value: string
  readonly trigger: string
  readonly content: string
  readonly disabled?: boolean
}

type Fixture = {
  readonly title: string
  readonly multiple?: boolean
  readonly initialValue: ReadonlyArray<string>
  readonly items: ReadonlyArray<FixtureItem>
}

type FixtureKind =
  | 'basic'
  | 'multiple'
  | 'disabled'
  | 'borders'
  | 'card'
  | 'rtl'

const fixtures: Readonly<Record<FixtureKind, Fixture>> = {
  basic: {
    title: 'Basic',
    initialValue: ['item-1'],
    items: [
      {
        value: 'item-1',
        trigger: 'How do I reset my password?',
        content:
          "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a link to reset your password. The link will expire in 24 hours.",
      },
      {
        value: 'item-2',
        trigger: 'Can I change my subscription plan?',
        content:
          'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.',
      },
      {
        value: 'item-3',
        trigger: 'What payment methods do you accept?',
        content:
          'We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.',
      },
    ],
  },
  multiple: {
    title: 'Multiple',
    multiple: true,
    initialValue: ['notifications'],
    items: [
      {
        value: 'notifications',
        trigger: 'Notification Settings',
        content:
          'Manage how you receive notifications. You can enable email alerts for updates or push notifications for mobile devices.',
      },
      {
        value: 'privacy',
        trigger: 'Privacy & Security',
        content:
          'Control your privacy settings and security preferences. Enable two-factor authentication, manage connected devices, review active sessions, and configure data sharing preferences. You can also download your data or delete your account.',
      },
      {
        value: 'billing',
        trigger: 'Billing & Subscription',
        content:
          'View your current plan, payment history, and upcoming invoices. Update your payment method, change your subscription tier, or cancel your subscription.',
      },
    ],
  },
  disabled: {
    title: 'Disabled',
    initialValue: [],
    items: [
      {
        value: 'item-1',
        trigger: 'Can I access my account history?',
        content:
          'Yes, you can view your complete account history including all transactions, plan changes, and support tickets in the Account History section of your dashboard.',
      },
      {
        value: 'item-2',
        trigger: 'Premium feature information',
        content:
          'This section contains information about premium features. Upgrade your plan to access this content.',
        disabled: true,
      },
      {
        value: 'item-3',
        trigger: 'How do I update my email address?',
        content:
          "You can update your email address in your account settings. You'll receive a verification email at your new address to confirm the change.",
      },
    ],
  },
  borders: {
    title: 'Borders',
    initialValue: ['billing'],
    items: [
      {
        value: 'billing',
        trigger: 'How does billing work?',
        content:
          'We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime. All plans include automatic backups, 24/7 support, and unlimited team members.',
      },
      {
        value: 'security',
        trigger: 'Is my data secure?',
        content:
          'Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits. All data is encrypted at rest and in transit using industry-standard protocols.',
      },
      {
        value: 'integration',
        trigger: 'What integrations do you support?',
        content:
          'We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more. You can also build custom integrations using our REST API and webhooks.',
      },
    ],
  },
  card: {
    title: 'Card',
    initialValue: ['plans'],
    items: [
      {
        value: 'plans',
        trigger: 'What subscription plans do you offer?',
        content:
          'We offer three subscription tiers: Starter ($9/month), Professional ($29/month), and Enterprise ($99/month). Each plan includes increasing storage limits, API access, priority support, and team collaboration features.',
      },
      {
        value: 'billing',
        trigger: 'How does billing work?',
        content:
          "Billing occurs automatically at the start of each billing cycle. We accept all major credit cards, PayPal, and ACH transfers for enterprise customers. You'll receive an invoice via email after each payment.",
      },
      {
        value: 'cancel',
        trigger: 'How do I cancel my subscription?',
        content:
          'You can cancel your subscription anytime from your account settings. There are no cancellation fees or penalties. Your access will continue until the end of your current billing period.',
      },
    ],
  },
  rtl: {
    title: 'RTL',
    initialValue: ['item-1'],
    items: [
      {
        value: 'item-1',
        trigger: 'كيف يمكنني إعادة تعيين كلمة المرور؟',
        content:
          "انقر على 'نسيت كلمة المرور' في صفحة تسجيل الدخول، أدخل عنوان بريدك الإلكتروني، وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. سينتهي صلاحية الرابط خلال 24 ساعة.",
      },
      {
        value: 'item-2',
        trigger: 'هل يمكنني تغيير خطة الاشتراك الخاصة بي؟',
        content:
          'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت من إعدادات حسابك. ستظهر التغييرات في دورة الفوترة التالية.',
      },
      {
        value: 'item-3',
        trigger: 'ما هي طرق الدفع التي تقبلونها؟',
        content:
          'نقبل جميع بطاقات الائتمان الرئيسية و PayPal والتحويلات المصرفية. تتم معالجة جميع المدفوعات بأمان من خلال شركاء الدفع لدينا.',
      },
    ],
  },
}

const renderAccordion = <Msg>(
  h: Html.H<Msg>,
  fixture: Fixture,
  key: string,
  className?: string,
) =>
  Accordion(h, {
    key,
    ...(className === undefined ? {} : { className }),
    props: {
      defaultValue: [...fixture.initialValue],
      ...(fixture.multiple === true ? { multiple: true } : {}),
    },
    items: fixture.items,
  })

const fixtureSource = (
  fixture: Fixture,
  body: string,
) => `import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Schema } from 'effect'
import { Accordion } from '@/ui/effect/ui/accordion'${fixture.title === 'Card' ? "\nimport { Card } from '@/ui/effect/ui/card'" : ''}

const items = ${JSON.stringify(fixture.items, null, 2)}

const App = Html.component({
  name: 'AccordionExample',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.main.class('mx-auto flex min-h-screen w-full max-w-xl items-center p-8').children(
      ${body},
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing root')
Layer.launch(BrowserHost.mount(App, {}, root)).pipe(Effect.runFork)`

const render = (
  kind: FixtureKind,
): import('../types').DocsExampleImplementation['view'] => {
  return (h, context) => {
    const fixture = fixtures[kind]
    const accordion = renderAccordion(
      h,
      fixture,
      `${context.idPrefix}-accordion`,
      kind === 'borders' ? 'accordion-docs-borders' : undefined,
    )
    const content =
      kind === 'card'
        ? Card(h, {
            className: 'accordion-docs-card',
            children: card => [
              card.header({
                children: [
                  card.title({
                    children: ['Subscription & Billing'],
                  }),
                  card.description({
                    children: [
                      'Common questions about your account, plans, payments and cancellations.',
                    ],
                  }),
                ],
              }),
              card.content({ children: [accordion] }),
            ],
          })
        : kind === 'rtl'
          ? h.div.class('accordion-docs-rtl').children(accordion)
          : accordion
    return h.div.class('accordion-docs-example').children(content)
  }
}

const sourceFor = (kind: FixtureKind) => {
  const fixture = fixtures[kind]
  const accordionSource = `Accordion(h, {
        props: { defaultValue: ${JSON.stringify(fixture.initialValue)}${fixture.multiple === true ? ', multiple: true' : ''} },
        items,
      })`
  const body =
    kind === 'card'
      ? `Card(h, {
        className: 'mx-auto w-full max-w-sm',
        children: card => [
          card.header({
            children: [
              card.title({ children: ['Subscription & Billing'] }),
              card.description({
                children: ['Common questions about your account, plans, payments and cancellations.'],
              }),
            ],
          }),
          card.content({ children: [${accordionSource}] }),
        ],
      })`
      : kind === 'rtl'
        ? `h.div.attr('dir', 'rtl').class('w-full max-w-md').children(
        ${accordionSource},
      )`
        : accordionSource
  return fixtureSource(fixture, body)
}

export const componentDocs = defineComponentDocs({
  usage: `import { Accordion } from '@/ui/effect/ui/accordion'

Accordion(h, {
  props: { defaultValue: ['item-1'] },
  items: [
    {
      value: 'item-1',
      trigger: 'How do I reset my password?',
      content: 'Use the password reset link on the login page.',
    },
  ],
})`,
  examples: (
    ['basic', 'multiple', 'disabled', 'borders', 'card', 'rtl'] as const
  ).map(kind => ({
    title: fixtures[kind].title,
    view: render(kind),
    source: sourceFor(kind),
  })),
})

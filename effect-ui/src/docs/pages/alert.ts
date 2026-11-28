import { Alert, Button, Icon } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './alert.css'

type Item = Readonly<{
  severity: 'info' | 'success' | 'warning' | 'error'
  announcement: 'static' | 'status' | 'alert'
  icon: 'circle-check' | 'circle-alert' | 'info' | 'triangle-alert'
  title: string
  description: string
  actionLabel?: string
}>

const basic: ReadonlyArray<Item> = [
  {
    severity: 'success',
    announcement: 'static',
    icon: 'circle-check',
    title: 'Account updated successfully',
    description:
      'Your profile information has been saved. Changes will be reflected immediately.',
  },
]
const destructive: ReadonlyArray<Item> = [
  {
    severity: 'error',
    announcement: 'alert',
    icon: 'circle-alert',
    title: 'Payment failed',
    description:
      'Your payment could not be processed. Please check your payment method and try again.',
  },
]
const actionItems: ReadonlyArray<Item> = [
  {
    severity: 'info',
    announcement: 'static',
    icon: 'info',
    title: 'Dark mode is now available',
    description: 'Enable it under your profile settings to get started.',
    actionLabel: 'Enable',
  },
]
const custom: ReadonlyArray<Item> = [
  {
    severity: 'warning',
    announcement: 'status',
    icon: 'triangle-alert',
    title: 'Your subscription will expire in 3 days.',
    description:
      'Renew now to avoid service interruption or upgrade to a paid plan to continue using the service.',
  },
]
const rtl: ReadonlyArray<Item> = [
  {
    severity: 'success',
    announcement: 'static',
    icon: 'circle-check',
    title: 'تم الدفع بنجاح',
    description:
      'تمت معالجة دفعتك البالغة 29.99 دولارًا. تم إرسال إيصال إلى عنوان بريدك الإلكتروني.',
  },
  {
    severity: 'info',
    announcement: 'static',
    icon: 'info',
    title: 'ميزة جديدة متاحة',
    description: 'لقد أضفنا دعم الوضع الداكن. يمكنك تفعيله في إعدادات حسابك.',
  },
]

const render =
  (
    items: ReadonlyArray<Item>,
    customColors = false,
    rtlDirection = false,
  ): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(`alert-docs-grid${rtlDirection ? ' alert-docs-rtl' : ''}`)
      .children(
        items.map(item =>
          Alert(h, {
            severity: item.severity,
            announcement: item.announcement,
            ...(customColors ? { className: 'alert-docs-custom' } : {}),
            icon: Icon(h, { name: item.icon, size: 'sm' }),
            title: item.title,
            description: item.description,
            ...(item.actionLabel === undefined
              ? {}
              : {
                  children: [
                    h.div
                      .class('alert-docs-action')
                      .children(
                        Button(h, { size: 'sm' }).children(item.actionLabel),
                      ),
                  ],
                }),
          }),
        ),
      )

const alertSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Alert, Button, Icon } from '@/ui/effect/ui'
import './alert.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Alert } from '@/ui/effect/ui'

Alert(h, {
  severity: 'success',
  announcement: 'status',
  title: 'Saved',
  description: 'Your changes were saved.',
})`,
  examples: [
    {
      title: 'Basic',
      view: render(basic),
      source: alertSource(`Alert(h, {
  severity: 'success',
  announcement: 'static',
  icon: Icon(h, { name: 'circle-check', size: 'sm' }),
  title: 'Account updated successfully',
})`),
    },
    {
      title: 'Destructive',
      view: render(destructive),
      source: alertSource(`Alert(h, {
  severity: 'error',
  announcement: 'alert',
  title: 'Payment failed',
})`),
    },
    {
      title: 'Action',
      view: render(actionItems),
      source: alertSource(`Alert(h, {
  severity: 'info',
  announcement: 'static',
  title: 'Dark mode is now available',
  children: [Button(h, { size: 'sm' }).children('Enable')],
})`),
    },
    {
      title: 'Custom Colors',
      view: render(custom, true),
      source: alertSource(`Alert(h, {
  severity: 'warning',
  announcement: 'status',
  className: 'alert-docs-custom',
  title: 'Your subscription will expire in 3 days.',
})`),
    },
    {
      title: 'RTL',
      view: render(rtl, false, true),
      source: alertSource(`h.div.class('alert-docs-rtl').children(
  Alert(h, { severity: 'success', announcement: 'static', title: 'تم الدفع بنجاح' }),
)`),
    },
  ],
})

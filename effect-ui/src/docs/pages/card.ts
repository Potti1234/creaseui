import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'
import {
  Badge,
  Button,
  Card,
  Icon,
  Input,
  Label,
  ToggleGroup,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './card.css'

const IMAGE_URL = 'https://avatar.vercel.sh/creaseui'
const spacingOptions = [
  { value: '4', label: '16px', spacing: '1rem' },
  { value: '5', label: '20px', spacing: '1.25rem' },
  { value: '6', label: '24px', spacing: '1.5rem' },
  { value: '8', label: '32px', spacing: '2rem' },
] as const

const rtlCopy = {
  title: 'تسجيل الدخول إلى حسابك',
  description: 'أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك',
  signUp: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  forgot: 'نسيت كلمة المرور؟',
  login: 'تسجيل الدخول',
  google: 'تسجيل الدخول باستخدام Google',
} as const
const englishCopy = {
  title: 'Login to your account',
  description: 'Enter your email below to login to your account',
  signUp: 'Sign Up',
  email: 'Email',
  password: 'Password',
  forgot: 'Forgot your password?',
  login: 'Login',
  google: 'Login with Google',
} as const

const LoginMessage = UiSchema.TaggedEnum({
  UpdatedEmail: { value: Schema.String },
  UpdatedPassword: { value: Schema.String },
  PickedSpacing: { value: Schema.Array(Schema.String) },
})
const LoginModel = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
  spacing: Schema.Array(Schema.String),
})

type LoginViewOptions = Readonly<{
  rtl?: boolean
  spacing?: string
  idPrefix: string
}>
const loginCard = (
  h: Html.H<typeof LoginMessage.Type>,
  model: typeof LoginModel.Type,
  { rtl = false, spacing, idPrefix }: LoginViewOptions,
) => {
  const copy = rtl ? rtlCopy : englishCopy
  return Card(h, {
    className: 'card-docs-frame',
    ...(spacing === undefined ? {} : { spacing }),
    children: card => [
      card.header({
        children: [
          card.title({ children: [copy.title] }),
          card.description({ children: [copy.description] }),
          card.action({
            children: [Button(h, { variant: 'link' }).children(copy.signUp)],
          }),
        ],
      }),
      card.content({
        children: [
          h.div.class('card-docs-field').children(
            Label(h, { for: `${idPrefix}-email`, children: [copy.email] }),
            Input(h, {
              id: `${idPrefix}-email`,
              element: h.input.attrs({
                type: 'email',
                placeholder: 'm@example.com',
              }),
              props: { value: model.email },
              onUpdate: LoginMessage.UpdatedEmail,
            }),
          ),
          h.div.class('card-docs-field').children(
            h.div.class('card-docs-field-row').children(
              Label(h, {
                for: `${idPrefix}-password`,
                children: [copy.password],
              }),
              h.a
                .class('card-docs-forgot')
                .attrs({ href: '#' })
                .children(copy.forgot),
            ),
            Input(h, {
              id: `${idPrefix}-password`,
              element: h.input.attrs({ type: 'password' }),
              props: { value: model.password },
              onUpdate: LoginMessage.UpdatedPassword,
            }),
          ),
        ],
      }),
      card.footer({
        className: 'card-docs-footer-column',
        children: [
          Button(h).class('card-docs-full').children(copy.login),
          Button(h, {
            variant: 'outline',
            className: 'card-docs-full',
          }).children(copy.google),
        ],
      }),
    ],
  })
}

const makeLoginDemo = (name: string, rtl: boolean, spacingDemo = false) =>
  Html.component({
    name,
    model: LoginModel,
    message: LoginMessage,
  }).make({
    init: () => ({ email: '', password: '', spacing: ['4'] }),
    update: {
      UpdatedEmail: ($, { value }) => $.evolve({ email: value }),
      UpdatedPassword: ($, { value }) => $.evolve({ password: value }),
      PickedSpacing: ($, { value }) => $.evolve({ spacing: value }),
    },
    view: (h, model) => {
      const selected =
        spacingOptions.find(option => model.spacing.includes(option.value)) ??
        spacingOptions[0]
      const card = loginCard(h, model, {
        rtl,
        ...(spacingDemo ? { spacing: selected.spacing } : {}),
        idPrefix: name,
      })
      return spacingDemo
        ? h.div.class('card-docs-center').children(
            ToggleGroup(h, {
              ariaLabel: 'Card spacing',
              variant: 'outline',
              size: 'sm',
              props: {
                value: model.spacing,
                items: spacingOptions.map(({ value }) => ({ value })),
              },
              onEmit: {
                Toggled: ({ value }) => LoginMessage.PickedSpacing({ value }),
              },
              renderItem: value => ({
                children: [
                  spacingOptions.find(option => option.value === value)
                    ?.label ?? value,
                ],
              }),
            }),
            card,
          )
        : card
    },
  })

const LoginDemo = makeLoginDemo('DocsCardLoginDemo', false)
const LoginRtlDemo = makeLoginDemo('DocsCardLoginRtlDemo', true)
const LoginSpacingDemo = makeLoginDemo('DocsCardLoginSpacingDemo', false, true)

const bullet = (h: Html.H<DocsMessage>, text: string) =>
  h.li.class('card-docs-bullet').children(
    Icon(h, {
      name: 'chevron-right',
      size: 'sm',
      tone: 'muted',
      className: 'card-docs-bullet-icon',
    }),
    h.span.children(text),
  )

const small: DocsExampleImplementation['view'] = h =>
  Card(h, {
    size: 'sm',
    className: 'card-docs-small',
    children: card => [
      card.header({
        children: [
          card.title({ children: ['Scheduled reports'] }),
          card.description({
            children: ['Weekly snapshots. No more manual exports.'],
          }),
        ],
      }),
      card.content({
        children: [
          h.ul
            .class('card-docs-list')
            .children(
              bullet(h, 'Choose a schedule (daily, or weekly).'),
              bullet(h, 'Send to channels or specific teammates.'),
              bullet(h, 'Include charts, tables, and key metrics.'),
            ),
        ],
      }),
      card.footer({
        className: 'card-docs-footer-column',
        children: [
          Button(h, { size: 'sm', className: 'card-docs-full' }).children(
            'Set up scheduled reports',
          ),
          Button(h, {
            variant: 'outline',
            size: 'sm',
            className: 'card-docs-full',
          }).children("See what's new"),
        ],
      }),
    ],
  })

const edge: DocsExampleImplementation['view'] = h =>
  Card(h, {
    className: 'card-docs-frame',
    children: card => [
      card.header({
        children: [
          card.title({ children: ['Terms of Service'] }),
          card.description({
            children: ['Review the terms before accepting the agreement.'],
          }),
        ],
      }),
      card.content({
        className: 'card-docs-edge-content',
        children: [
          h.div
            .class('card-docs-edge-scroll')
            .children(
              h.p.children(
                'These terms govern your use of the workspace, including access to shared documents, project files, and collaboration tools.',
              ),
              h.p.children(
                'You are responsible for the content you upload and for ensuring that your team has the appropriate permissions to view or edit it.',
              ),
              h.p.children(
                'We may update features or limits as the service evolves. When those changes materially affect your workflow, we will notify your workspace administrators.',
              ),
              h.p.children(
                "By continuing, you agree to keep your account credentials secure and to follow your organization's acceptable use policies.",
              ),
            ),
        ],
      }),
      card.footer({
        className: 'card-docs-edge-footer',
        children: [
          Button(h, { variant: 'outline' }).children('Decline'),
          Button(h).children('Accept'),
        ],
      }),
    ],
  })

const image: DocsExampleImplementation['view'] = h =>
  Card(h, {
    className: 'card-docs-image-card',
    children: card => [
      h.div.class('card-docs-overlay'),
      h.img
        .class('card-docs-cover')
        .attrs({ src: IMAGE_URL, alt: 'Event cover' }),
      card.header({
        children: [
          card.action({
            children: [
              Badge(h, { variant: 'secondary', children: ['Featured'] }),
            ],
          }),
          card.title({ children: ['Design systems meetup'] }),
          card.description({
            children: [
              'A practical talk on component APIs, accessibility, and shipping faster.',
            ],
          }),
        ],
      }),
      card.footer({
        children: [Button(h).class('card-docs-full').children('View Event')],
      }),
    ],
  })

const cardSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Button, Card, Input, Label } from '@/ui/effect/ui'
import './card.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Card } from '@/ui/effect/ui'

Card(h, {
  children: card => [
    card.header({ children: [card.title({ children: ['Title'] })] }),
    card.content({ children: ['Content'] }),
  ],
})`,
  examples: [
    {
      title: 'Basic',
      view: (h, context) =>
        LoginDemo(h, {
          key: `${context.idPrefix}-login`,
          props: {},
        }),
      source: cardSource(`Card(h, {
  children: card => [
    card.header({ children: [card.title({ children: ['Login to your account'] })] }),
  ],
})`),
    },
    {
      title: 'Size',
      view: small,
      source: cardSource(`Card(h, {
  size: 'sm',
  children: card => [card.header({ children: [card.title({ children: ['Scheduled reports'] })] })],
})`),
    },
    {
      title: 'Spacing',
      view: (h, context) =>
        LoginSpacingDemo(h, {
          key: `${context.idPrefix}-spacing`,
          props: {},
        }),
      source: cardSource(`Card(h, {
  spacing: '1rem',
  children: card => [card.content({ children: ['Compact content'] })],
})`),
    },
    {
      title: 'Edge to Edge',
      view: edge,
      source: cardSource(`Card(h, {
  children: card => [
    card.content({
      className: 'card-docs-edge-content',
      children: [h.div.class('card-docs-edge-scroll').children('Edge content')],
    }),
  ],
})`),
    },
    {
      title: 'Image',
      view: image,
      source: cardSource(`Card(h, {
  className: 'card-docs-image-card',
  children: card => [
    h.img.class('card-docs-cover').attrs({ src: IMAGE_URL, alt: 'Event cover' }),
    card.header({ children: [card.title({ children: ['Design systems meetup'] })] }),
  ],
})`),
    },
    {
      title: 'RTL',
      view: (h, context) =>
        h.div.class('card-docs-rtl').children(
          LoginRtlDemo(h, {
            key: `${context.idPrefix}-rtl-login`,
            props: {},
          }),
        ),
      source: cardSource(`h.div.class('card-docs-rtl').children(
  Card(h, { children: card => [card.header({ children: [card.title({ children: ['تسجيل الدخول إلى حسابك'] })] })] }),
)`),
    },
  ],
})

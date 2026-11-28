import {
  Badge,
  Button,
  Empty,
  Icon,
  InputGroup,
  Item,
  Spinner,
} from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './spinner.css'

const spinner = (
  h: Parameters<DocsExampleImplementation['view']>[0],
  size?: 'sm' | 'md' | 'lg' | 'xl',
) =>
  Spinner(h, {
    isDecorative: true,
    ...(size === undefined ? {} : { size }),
  })

const item =
  (rtl = false): DocsExampleImplementation['view'] =>
  h =>
    h.div
      .class(`spinner-docs-narrow${rtl ? ' spinner-docs-rtl' : ''}`)
      .children(
        Item(h, {
          variant: 'muted',
          children: parts => [
            parts.media({ children: [spinner(h)] }),
            parts.content({
              children: [
                parts.title({
                  children: [
                    rtl ? 'جاري معالجة الدفع...' : 'Processing payment...',
                  ],
                }),
              ],
            }),
            parts.content({
              className: 'spinner-docs-item-end',
              children: [
                h.span
                  .class('spinner-docs-amount')
                  .children(rtl ? '١٠٠.٠٠ دولار' : '$100.00'),
              ],
            }),
          ],
        }),
      )

const size: DocsExampleImplementation['view'] = h =>
  h.div
    .class('spinner-docs-row')
    .children(
      spinner(h, 'sm'),
      spinner(h, 'md'),
      spinner(h, 'lg'),
      spinner(h, 'xl'),
    )

const buttonView: DocsExampleImplementation['view'] = h =>
  h.div
    .class('spinner-docs-column')
    .children(
      Button(h, { size: 'sm', disabled: true }).children(
        Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
        'Loading...',
      ),
      Button(h, { variant: 'outline', size: 'sm', disabled: true }).children(
        Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
        'Please wait',
      ),
      Button(h, { variant: 'secondary', size: 'sm', disabled: true }).children(
        Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
        'Processing',
      ),
    )

const badgeView: DocsExampleImplementation['view'] = h =>
  h.div.class('spinner-docs-badge-row').children(
    Badge(h, {
      children: [
        Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
        'Syncing',
      ],
    }),
    Badge(h, {
      variant: 'secondary',
      children: [
        Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
        'Updating',
      ],
    }),
    Badge(h, {
      variant: 'outline',
      children: [
        Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
        'Processing',
      ],
    }),
  )

const inputGroup: DocsExampleImplementation['view'] = h =>
  h.div.class('spinner-docs-column spinner-docs-medium').children(
    InputGroup(h, {
      focusControlId: 'spinner-message',
      addOns: { 'inline-end': spinner(h) },
      control: group =>
        group.input(
          h.input.attrs({
            id: 'spinner-message',
            placeholder: 'Send a message...',
            disabled: 'true',
          }),
        ),
    }),
    InputGroup(h, {
      focusControlId: 'spinner-message-area',
      addOns: {
        'block-end': [
          spinner(h),
          'Validating...',
          h.button
            .class('spinner-docs-send')
            .attrs({ type: 'button', 'aria-label': 'Send' })
            .children(Icon(h, { name: 'arrow-up' })),
        ],
      },
      control: group =>
        group.textarea(
          h.textarea.attrs({
            id: 'spinner-message-area',
            placeholder: 'Send a message...',
            disabled: 'true',
          }),
        ),
    }),
  )

const empty: DocsExampleImplementation['view'] = h =>
  Empty(h, {
    media: spinner(h),
    mediaVariant: 'icon',
    title: 'Processing your request',
    description:
      'Please wait while we process your request. Do not refresh the page.',
    children: [
      Button(h, { variant: 'outline', size: 'sm' }).children('Cancel'),
    ],
  })

const spinnerSource = (body: string) =>
  exampleApplicationSource({
    imports: `import { Badge, Button, Empty, InputGroup, Item, Spinner } from '@/ui/effect/ui'
import './spinner.css'`,
    body,
  })

export const componentDocs = defineComponentDocs({
  usage: `import { Spinner } from '@/ui/effect/ui'

Spinner(h, { label: 'Loading' })`,
  examples: [
    {
      title: 'Basic',
      view: item(),
      source: spinnerSource(`Item(h, {
  variant: 'muted',
  children: parts => [parts.media({ children: [Spinner(h, { isDecorative: true })] })],
})`),
    },
    {
      title: 'Customization',
      view: h =>
        h.div
          .class('spinner-docs-custom')
          .children(Spinner(h, { label: 'Loading', size: 'lg' })),
      source: spinnerSource(
        `h.div.class('spinner-docs-custom').children(Spinner(h, { label: 'Loading', size: 'lg' }))`,
      ),
    },
    {
      title: 'Size',
      view: size,
      source: spinnerSource(`h.div.class('spinner-docs-row').children(
  Spinner(h, { isDecorative: true, size: 'sm' }),
  Spinner(h, { isDecorative: true, size: 'md' }),
)`),
    },
    {
      title: 'Button',
      view: buttonView,
      source: spinnerSource(`Button(h, { size: 'sm', disabled: true }).children(
  Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }),
  'Loading...',
)`),
    },
    {
      title: 'Badge',
      view: badgeView,
      source: spinnerSource(`Badge(h, {
  children: [Spinner(h, { isDecorative: true, dataIcon: 'inline-start' }), 'Syncing'],
})`),
    },
    {
      title: 'Input Group',
      view: inputGroup,
      source: spinnerSource(`InputGroup(h, {
  addOns: { 'inline-end': Spinner(h, { isDecorative: true }) },
  control: group => group.input(h.input.attrs({ placeholder: 'Send a message...' })),
})`),
    },
    {
      title: 'Empty',
      view: empty,
      source: spinnerSource(`Empty(h, {
  media: Spinner(h, { isDecorative: true }),
  mediaVariant: 'icon',
  title: 'Processing your request',
  children: [Button(h, { variant: 'outline', size: 'sm' }).children('Cancel')],
})`),
    },
    {
      title: 'RTL',
      view: item(true),
      source: spinnerSource(`h.div.class('spinner-docs-rtl').children(
  Item(h, { variant: 'muted', children: parts => [parts.title({ children: ['جاري معالجة الدفع...'] })] }),
)`),
    },
  ],
})

import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import {
  Attachment,
  Avatar,
  Bubble,
  BubbleGroup,
  Button,
  Icon,
  Marker,
  Message,
  MessageGroup,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type BubblePart = {
  readonly type: 'bubble'
  readonly variant?: 'muted'
  readonly content: string
  readonly reactions?: string
}
type MessagePart =
  | BubblePart
  | { readonly type: 'bubble-group'; readonly bubbles: readonly BubblePart[] }
  | { readonly type: 'attachment-image' }
  | { readonly type: 'attachment-file' }
type MessageSpec = {
  readonly align: 'start' | 'end'
  readonly avatar?:
    | 'empty'
    | { readonly src: string; readonly alt: string; readonly fallback: string }
  readonly header?: string
  readonly parts: readonly MessagePart[]
  readonly footer?: string
  readonly footerActions?: 'copyLikeDislike' | 'failedRetry'
}

const me = { src: '/logo-mark.svg', alt: '@me', fallback: 'ME' }
const rabbit = {
  src: 'https://github.com/evilrabbit.png',
  alt: '@rabbit',
  fallback: 'R',
}
const specs: Record<string, readonly MessageSpec[]> = {
  demo: [
    {
      align: 'end',
      avatar: me,
      parts: [{ type: 'bubble', content: 'Deploying to prod real quick.' }],
    },
    {
      align: 'start',
      avatar: rabbit,
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content: "It's 4:55 PM. On a Friday.",
        },
      ],
    },
    {
      align: 'end',
      avatar: me,
      parts: [{ type: 'bubble', content: "It's a one-line change." }],
      footer: 'Delivered',
    },
    {
      align: 'start',
      avatar: rabbit,
      parts: [
        {
          type: 'bubble-group',
          bubbles: [
            {
              type: 'bubble',
              variant: 'muted',
              content: "It's always a one-line change 😭.",
            },
            {
              type: 'bubble',
              variant: 'muted',
              content: 'Alright, let me take a look.',
              reactions: '👍',
            },
          ],
        },
      ],
    },
  ],
  avatar: [
    {
      align: 'start',
      avatar: rabbit,
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content: 'The build failed during dependency installation.',
        },
      ],
    },
    {
      align: 'end',
      avatar: {
        src: 'https://github.com/maxleiter.png',
        alt: '@avatar',
        fallback: 'R',
      },
      parts: [{ type: 'bubble', content: 'Can you share the exact error?' }],
    },
  ],
  group: [
    {
      align: 'start',
      avatar: 'empty',
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content: 'I checked the registry addresses.',
        },
      ],
    },
    {
      align: 'start',
      avatar: {
        src: 'https://github.com/pranathip.png',
        alt: '@cn',
        fallback: 'CN',
      },
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content:
            'The component and example JSON now live under the UI registry.',
        },
      ],
    },
  ],
  headerFooter: [
    {
      align: 'start',
      header: 'Olivia',
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content: 'I already checked the logs.',
        },
      ],
    },
    {
      align: 'end',
      parts: [
        {
          type: 'bubble',
          content:
            'Send the report to the team. Ping @creaseui if you need help.',
        },
      ],
      footer: 'Read Yesterday',
    },
  ],
  actions: [
    {
      align: 'start',
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content: 'The install failure is coming from the workspace package.',
        },
      ],
      footerActions: 'copyLikeDislike',
    },
    {
      align: 'end',
      parts: [
        { type: 'bubble', content: 'Okay drop me a link. Taking a look...' },
      ],
      footerActions: 'failedRetry',
    },
  ],
  attachment: [
    {
      align: 'end',
      parts: [
        { type: 'attachment-image' },
        {
          type: 'bubble',
          content:
            "Here's the image. Can you add it to the PDF? Use it for the cover page.",
        },
      ],
    },
    {
      align: 'start',
      parts: [
        {
          type: 'bubble',
          variant: 'muted',
          content:
            "Done. Here's the PDF with the image added as the cover page.",
        },
        { type: 'attachment-file' },
      ],
    },
    {
      align: 'end',
      parts: [{ type: 'bubble', content: 'Thanks. Looks good.' }],
    },
  ],
}

const attachmentActionClass =
  'grid size-6 place-items-center rounded-md border-0 bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring'
const imageUrl =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80'

const bubbleView = (h: Html.H<DocsMessage>, part: BubblePart) =>
  Bubble(h, {
    ...(part.variant === 'muted' ? { variant: 'muted' as const } : {}),
    ...(part.reactions === undefined
      ? {}
      : { reactions: [part.reactions], reactionLabel: 'Reactions: thumbs up' }),
    children: [part.content],
  })

const partView = (
  h: Html.H<DocsMessage>,
  part: MessagePart,
  key: string,
): View.Content<DocsMessage> => {
  if (part.type === 'bubble')
    return bubbleView(h, part) as unknown as View.Content<DocsMessage>
  if (part.type === 'bubble-group')
    return BubbleGroup(h, {
      children: part.bubbles.map(bubble => bubbleView(h, bubble)),
    }) as unknown as View.Content<DocsMessage>
  if (part.type === 'attachment-image')
    return Attachment(h, {
      key: `${key}-image`,
      orientation: 'vertical',
      children: attachment => [
        attachment.media({
          variant: 'image',
          children: [h.img.attrs({ src: imageUrl, alt: 'Workspace' })],
        }),
      ],
    }) as unknown as View.Content<DocsMessage>
  return Attachment(h, {
    key: `${key}-file`,
    children: attachment => [
      attachment.media({
        children: [Icon(h, { name: 'file-text' })],
      }),
      attachment.content({
        children: [
          attachment.title({ children: ['sales-dashboard.pdf'] }),
          attachment.description({ children: ['PDF · 2.4 MB'] }),
        ],
      }),
      attachment.actions({
        children: [
          h.button
            .class(attachmentActionClass)
            .attrs({
              type: 'button',
              'aria-label': 'Download',
              'data-slot': 'attachment-action',
            })
            .children(Icon(h, { name: 'download' })),
        ],
      }),
    ],
  }) as unknown as View.Content<DocsMessage>
}

const actionButton = (
  h: Html.H<DocsMessage>,
  icon: 'copy' | 'thumbs-up' | 'thumbs-down' | 'refresh-ccw',
  label: string,
  size: 'icon' | 'icon-xs' = 'icon',
) =>
  Button(h, {
    variant: 'ghost',
    size,
    element: h.button.attrs({ 'aria-label': label }),
  }).children(Icon(h, { name: icon }))

const messageView = (h: Html.H<DocsMessage>, spec: MessageSpec, key: string) =>
  Message(h, {
    ...(spec.align === 'end' ? { align: 'end' as const } : {}),
    children: message => [
      spec.avatar === 'empty'
        ? message.avatar({ children: [] })
        : spec.avatar === undefined
          ? undefined
          : message.avatar({
              children: [
                Avatar(h, {
                  key: `${key}-avatar`,
                  props: { src: spec.avatar.src },
                  alt: spec.avatar.alt,
                  fallbackContent: [spec.avatar.fallback],
                }),
              ],
            }),
      message.content({
        children: [
          spec.header === undefined
            ? undefined
            : message.header({ children: [spec.header] }),
          ...spec.parts.map((part, index) =>
            partView(h, part, `${key}-${String(index)}`),
          ),
          spec.footer === 'Read Yesterday'
            ? message.footer({
                children: [
                  h.div
                    .class('flex items-center gap-1')
                    .children(
                      'Read ',
                      h.span.class('font-normal').children('Yesterday'),
                    ),
                ],
              })
            : spec.footer !== undefined
              ? message.footer({ children: [spec.footer] })
              : spec.footerActions === 'copyLikeDislike'
                ? message.footer({
                    children: [
                      actionButton(h, 'copy', 'Copy'),
                      actionButton(h, 'thumbs-up', 'Like'),
                      actionButton(h, 'thumbs-down', 'Dislike'),
                    ],
                  })
                : spec.footerActions === 'failedRetry'
                  ? message.footer({
                      children: [
                        h.span
                          .class('font-normal text-destructive')
                          .children('Failed to send'),
                        actionButton(h, 'refresh-ccw', 'Retry', 'icon-xs'),
                      ],
                    })
                  : undefined,
        ],
      }),
    ],
  })

const example =
  (
    kind: keyof typeof specs,
    grouped = false,
    typing = false,
  ): DocsExampleImplementation['view'] =>
  (h, context) => {
    const messages = (specs[kind] ?? []).map((spec, index) =>
      messageView(h, spec, `${context.idPrefix}-${kind}-${String(index)}`),
    )
    return h.div
      .class(
        `flex w-full max-w-sm flex-col ${kind === 'demo' || kind === 'group' ? 'gap-6' : 'gap-8'} py-12`,
      )
      .children(
        grouped ? MessageGroup(h, { children: messages }) : messages,
        typing
          ? Marker(h, {
              purpose: 'status',
              shimmer: true,
              children: [
                h.span.class('font-medium').children('Oliver'),
                ' is typing...',
              ],
            })
          : undefined,
      ) as unknown as View.Input<DocsMessage>
  }

const source = exampleApplicationSource({
  imports: `import { Bubble, Message } from '@/ui/effect/ui'`,
  body: `Message(h, {
  align: 'end',
  children: message => [
    message.content({
      children: [Bubble(h, { children: ['Deploying to prod real quick.'] })],
    }),
  ],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Message } from '@/ui/effect/ui'\n\nMessage(h, { align, children })`,
  examples: [
    { title: 'Basic', view: example('demo', false, true), source },
    { title: 'Avatar', view: example('avatar'), source },
    { title: 'Group', view: example('group', true), source },
    {
      title: 'Header and Footer',
      view: example('headerFooter'),
      source,
    },
    { title: 'Actions', view: example('actions'), source },
    { title: 'Attachment', view: example('attachment'), source },
  ],
})

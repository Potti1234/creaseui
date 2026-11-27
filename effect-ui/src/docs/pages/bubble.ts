import { UiSchema, type View } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  Bubble,
  BubbleGroup,
  Button,
  Icon,
  Popover,
  Tooltip,
} from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type ReactionSpec =
  | Readonly<{
      kind: 'emoji'
      side?: 'top'
      align?: 'start' | 'end'
      items: readonly string[]
      ariaLabel?: string
    }>
  | Readonly<{ kind: 'action'; label: string; clickedLabel: string }>
  | Readonly<{ kind: 'tooltip'; icon: string; content: string }>
  | Readonly<{
      kind: 'popover'
      icon: string
      title: string
      description: string
    }>
type BubbleSpec = Readonly<{
  variant?:
    | 'default'
    | 'secondary'
    | 'muted'
    | 'tinted'
    | 'outline'
    | 'ghost'
    | 'destructive'
  align?: 'start' | 'end'
  text: readonly string[]
  onClick?: boolean
  collapsible?: boolean
  reactions?: ReactionSpec
}>
type Fixture = Readonly<{
  kind: string
  title: string
  description?: string
  heroOnly?: boolean
  gap: '4' | '8' | '12'
  clusters: readonly Readonly<{
    grouped?: boolean
    bubbles: readonly BubbleSpec[]
  }>[]
}>
const fixtures: readonly Fixture[] = [
  {
    kind: 'demo',
    title: 'Demo',
    description: 'A conversation thread with groups and emoji reactions.',
    heroOnly: true,
    gap: '8',
    clusters: [
      {
        bubbles: [
          {
            align: 'end',
            text: ["Hey there! what's up?"],
          },
        ],
      },
      {
        grouped: true,
        bubbles: [
          {
            variant: 'muted',
            text: ['Hey! Want to see chat bubbles?'],
          },
          {
            variant: 'muted',
            text: [
              'I can group messages, switch sides, and keep the whole thread easy to scan.',
            ],
            reactions: {
              kind: 'emoji',
              items: ['👍'],
              ariaLabel: 'Reaction: thumbs up',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            align: 'end',
            text: ['Sure. Hit me with your best demo.'],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'muted',
            text: [
              'Yes. You are reading a demo that is demoing itself. Very meta. Very on-brand.',
            ],
            reactions: {
              kind: 'emoji',
              items: ['👍', '🔥', '👀', '+2'],
              ariaLabel: 'Reactions: thumbs up, fire, eyes, and 2 more',
            },
          },
        ],
      },
    ],
  },
  {
    kind: 'variants',
    title: 'Variants',
    description:
      'Every bubble variant: primary, secondary, muted, tinted, outline, destructive, and ghost.',
    gap: '12',
    clusters: [
      {
        bubbles: [
          {
            text: ['This is the default primary bubble.'],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'secondary',
            align: 'end',
            text: ['This is the secondary variant.'],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'muted',
            text: [
              'This one is muted. It uses a lower emphasis color for the chat bubble.',
            ],
            reactions: {
              kind: 'emoji',
              items: ['👍'],
              ariaLabel: 'Reaction: thumbs up',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'tinted',
            align: 'end',
            text: [
              'This one is tinted. The tint is a softer color derived from the primary color.',
            ],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'outline',
            text: ['We can also use an outlined variant.'],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'destructive',
            align: 'end',
            text: ['Or a destructive variant with a reaction.'],
            reactions: {
              kind: 'emoji',
              items: ['🔥'],
              ariaLabel: 'Reaction: fire',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'ghost',
            text: [
              'Ghost bubbles work for assistant text, markdown, and other content that should not be framed.',
              'This is perfect for assistant messages that should not have a frame and can take the full width of the container. You can also render code in it.',
              'Ghost bubbles are full width and can take the full width of the container.',
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'alignment',
    title: 'Alignment',
    description: 'align="end" pins user messages to the trailing edge.',
    gap: '8',
    clusters: [
      {
        bubbles: [
          {
            variant: 'muted',
            text: [
              'This bubble is aligned to the start. This is the default alignment.',
            ],
          },
        ],
      },
      {
        bubbles: [
          {
            align: 'end',
            text: [
              'This bubble is aligned to the end. Use this for user messages.',
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'group',
    title: 'Bubble Group',
    description: 'BubbleGroup tightens consecutive same-side messages.',
    gap: '8',
    clusters: [
      {
        bubbles: [
          {
            variant: 'muted',
            text: ["Can you tell me what's the issue?"],
          },
        ],
      },
      {
        grouped: true,
        bubbles: [
          {
            align: 'end',
            text: ['You tell me!'],
          },
          {
            align: 'end',
            text: ['It worked yesterday. You broke it!'],
          },
          {
            align: 'end',
            text: ['Find the bug and fix it.'],
            reactions: {
              kind: 'emoji',
              align: 'start',
              items: ['👀'],
              ariaLabel: 'Reactions: eyes',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'muted',
            text: [
              "Want me to diff yesterday's you against today's you? It's a bit embarrassing.",
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'linkButton',
    title: 'Links and Buttons',
    description:
      'BubbleContent can render as an interactive element for suggested replies.',
    gap: '8',
    clusters: [
      {
        bubbles: [
          {
            variant: 'muted',
            text: ['How can I help you today?'],
          },
        ],
      },
      {
        grouped: true,
        bubbles: [
          {
            variant: 'tinted',
            align: 'end',
            onClick: true,
            text: ['I forgot my password'],
          },
          {
            variant: 'tinted',
            align: 'end',
            onClick: true,
            text: ['I need help with my subscription'],
          },
          {
            variant: 'tinted',
            align: 'end',
            onClick: true,
            text: ['Something else. Talk to a human.'],
          },
        ],
      },
    ],
  },
  {
    kind: 'reactions',
    title: 'Reactions',
    description:
      'BubbleReactions pins emoji chips or action buttons to a bubble.',
    gap: '12',
    clusters: [
      {
        bubbles: [
          {
            variant: 'muted',
            align: 'end',
            text: ["I don't need tests, I know my code works."],
            reactions: {
              kind: 'emoji',
              align: 'start',
              items: ['👍', '😮'],
              ariaLabel: 'Reactions: thumbs up, surprised',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'muted',
            text: [
              "Bold. Fine I'll add some tests. I'll let you know when they're done.",
            ],
            reactions: {
              kind: 'emoji',
              items: ['👀', '🚀', '+2'],
              ariaLabel: 'Reactions: eyes, rocket, and 2 more',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            align: 'end',
            text: [
              'Tests passed on the first try. All 142 of them. Looking good!',
            ],
            reactions: {
              kind: 'emoji',
              side: 'top',
              align: 'start',
              items: ['🎉', '👏'],
              ariaLabel: 'Reactions: party popper, clapping hands',
            },
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'destructive',
            text: ['Are you sure I can run this command?'],
            reactions: {
              kind: 'action',
              label: 'Yes, run it',
              clickedLabel: '✓ Ran it',
            },
          },
        ],
      },
    ],
  },
  {
    kind: 'collapsible',
    title: 'Show More / Collapsible',
    description: 'A long message collapses behind a Show more toggle.',
    gap: '8',
    clusters: [
      {
        bubbles: [
          {
            variant: 'muted',
            text: ['How can I help you today?'],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'muted',
            align: 'end',
            collapsible: true,
            text: [
              'The accessibility review found two focus states that were visually too subtle in dark mode.',
              'I checked the dialog, menu, and drawer paths because each one renders focusable controls inside a layered surface.',
              'The dialog and drawer are fine. The menu needs the hover and focus tokens split so keyboard focus stays visible when the pointer is not involved.',
              'I also recommend keeping the change in the style file instead of the primitive so the other themes can choose their own focus treatment later.',
            ],
          },
        ],
      },
    ],
  },
  {
    kind: 'tooltip',
    title: 'Tooltip',
    description:
      'A reactions row can host a tooltip button like a read receipt.',
    gap: '4',
    clusters: [
      {
        bubbles: [
          {
            variant: 'secondary',
            text: ['Did you remove the stale route?'],
          },
        ],
      },
      {
        bubbles: [
          {
            align: 'end',
            text: ['Yes, removed it from the registry.'],
            reactions: {
              kind: 'tooltip',
              icon: 'check',
              content: 'Read on Jan 5, 2026 at 4:32 PM',
            },
          },
        ],
      },
    ],
  },
  {
    kind: 'popover',
    title: 'Popover',
    description: 'A reactions row can host a popover for error details.',
    gap: '4',
    clusters: [
      {
        bubbles: [
          {
            align: 'end',
            text: ['Run the build script.'],
          },
        ],
      },
      {
        bubbles: [
          {
            variant: 'destructive',
            text: ['Failed to run the command.'],
            reactions: {
              kind: 'popover',
              icon: 'info',
              title: 'Command failed with exit code 1',
              description:
                'ENOENT: no such file or directory, open pnpm-lock.yaml',
            },
          },
        ],
      },
    ],
  },
]
const collapsibleText =
  'The accessibility review found two focus states that were visually too subtle in dark mode.\n\nI checked the dialog, menu, and drawer paths because each one renders focusable controls inside a layered surface.\n\nThe dialog and drawer are fine. The menu needs the hover and focus tokens split so keyboard focus stays visible when the pointer is not involved.\n\nI also recommend keeping the change in the style file instead of the primitive so the other themes can choose their own focus treatment later.'

const Message = UiSchema.TaggedEnum({
  ClickedOption: { label: Schema.String },
  ClickedRunIt: {},
  ToggledCollapsible: { isOpen: Schema.Boolean },
})

const BubbleDemo = Html.component({
  name: 'DocsBubbleDemo',
  props: Schema.Struct({
    idPrefix: Schema.String,
    fixtureIndex: Schema.Number,
  }),
  model: Schema.Struct({
    lastClicked: Schema.NullOr(Schema.String),
    ranIt: Schema.Boolean,
    open: Schema.Boolean,
  }),
  message: Message,
}).make({
  init: () => ({ lastClicked: null, ranIt: false, open: false }),
  update: {
    ClickedOption: ($, { label }) => $.evolve({ lastClicked: label }),
    ClickedRunIt: $ => $.evolve({ ranIt: true }),
    ToggledCollapsible: ($, { isOpen }) => $.evolve({ open: isOpen }),
  },
  view: (h, model) => {
    const fixture = (fixtures[h.props.fixtureIndex] ?? fixtures[0]) as Fixture
    const reactions = (
      spec: ReactionSpec,
    ): View.Children<typeof Message.Type> => {
      if (spec.kind === 'emoji')
        return spec.items.map(item => h.span.children(item))
      if (spec.kind === 'action')
        return [
          Button(h, {
            variant: 'ghost',
            size: 'xs',
            onPress: Message.ClickedRunIt(),
          }).children(model.ranIt ? spec.clickedLabel : spec.label),
        ]
      if (spec.kind === 'tooltip')
        return [
          Tooltip(h, {
            key: `${h.props.idPrefix}-reaction-tooltip`,
            trigger: h.button
              .class(
                'flex size-6 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
              .attrs({ type: 'button', 'aria-label': 'Read receipt' })
              .children(Icon(h, { name: spec.icon as never })),
            content: spec.content,
            props: {},
          }),
        ]
      return [
        Popover(h, {
          key: `${h.props.idPrefix}-reaction-popover`,
          trigger: h.button
            .class(
              'inline-flex size-6 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:text-destructive',
            )
            .attrs({ type: 'button', 'aria-label': 'Show error details' })
            .children(Icon(h, { name: spec.icon as never, size: 'xs' })),
          content: h.div
            .class('grid gap-1')
            .children(
              h.p.class('text-sm font-medium').children(spec.title),
              h.p
                .class('text-sm text-muted-foreground')
                .children(spec.description),
            ),
          props: {},
          onEmit: {
            RequestedOpen: () => undefined,
            RequestedClose: () => undefined,
            Settled: () => undefined,
          },
        }),
      ]
    }
    const bubbleView = (spec: BubbleSpec) => {
      const body =
        spec.collapsible === true
          ? [
              h.div.children(
                model.open
                  ? collapsibleText
                  : `${collapsibleText.slice(0, 180)}...`,
              ),
              h.button
                .class(
                  'inline-flex items-center gap-1 border-0 bg-transparent p-0 text-muted-foreground underline-offset-4 hover:underline',
                )
                .attrs({
                  type: 'button',
                  'aria-expanded': model.open ? 'true' : 'false',
                })
                .on(
                  'click',
                  Message.ToggledCollapsible({ isOpen: !model.open }),
                )
                .children(
                  model.open ? 'Show less' : 'Show more',
                  Icon(h, { name: 'chevron-down', size: 'sm' }),
                ),
            ]
          : spec.text.length === 1
            ? [spec.text[0] ?? '']
            : [
                h.div
                  .class('whitespace-pre-line')
                  .children(spec.text.join('\n\n')),
              ]
      return Bubble(h, {
        ...(spec.variant === undefined || spec.variant === 'default'
          ? {}
          : { variant: spec.variant }),
        ...(spec.align === undefined ? {} : { align: spec.align }),
        ...(spec.onClick === true
          ? {
              onPress: Message.ClickedOption({ label: spec.text[0] ?? '' }),
            }
          : {}),
        ...(spec.reactions === undefined
          ? {}
          : {
              reactions: reactions(spec.reactions),
              ...(spec.reactions.kind === 'emoji' &&
              spec.reactions.ariaLabel !== undefined
                ? { reactionLabel: spec.reactions.ariaLabel }
                : {}),
              ...(spec.reactions.kind === 'emoji' &&
              spec.reactions.side !== undefined
                ? { reactionSide: spec.reactions.side }
                : {}),
              ...(spec.reactions.kind === 'emoji' &&
              spec.reactions.align !== undefined
                ? { reactionAlign: spec.reactions.align }
                : {}),
            }),
        children: body,
      })
    }
    return h.div
      .class(`flex w-full max-w-sm flex-col gap-${fixture.gap} py-12`)
      .children(
        fixture.clusters.map(cluster =>
          cluster.grouped === true
            ? BubbleGroup(h, { children: cluster.bubbles.map(bubbleView) })
            : cluster.bubbles.length === 1
              ? bubbleView(cluster.bubbles[0] as BubbleSpec)
              : h.div.children(cluster.bubbles.map(bubbleView)),
        ),
        fixture.kind === 'linkButton' && model.lastClicked !== null
          ? h.p
              .class('text-sm text-muted-foreground')
              .children(`You clicked: ${model.lastClicked}`)
          : undefined,
      )
  },
})

const example =
  (fixtureIndex: number): DocsExampleImplementation['view'] =>
  (h, context) =>
    BubbleDemo(h, {
      key: `${context.idPrefix}-bubble-demo`,
      props: { idPrefix: context.idPrefix, fixtureIndex },
    }) as unknown as View.Input<DocsMessage>

const source = exampleApplicationSource({
  imports: `import { Bubble, BubbleGroup } from '@/ui/effect/ui'`,
  body: `BubbleGroup(h, {
  children: bubbles.map(bubble =>
    Bubble(h, {
      variant: bubble.variant,
      align: bubble.align,
      children: bubble.text,
    }),
  ),
})`,
})

const specs = fixtures.map((fixture, index) => ({
  title: fixture.title,
  view: example(index),
  source,
}))

export const componentDocs = defineComponentDocs({
  usage: `import { Bubble, BubbleGroup } from '@/ui/effect/ui'\n\nBubble(h, { variant, align, children })`,
  examples: specs,
})

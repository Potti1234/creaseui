import type { View } from '@effect/ui'

import { ChatReasoning, Message } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Fixture = Readonly<{
  kind: 'standalone' | 'inMessage'
  label?: string
  duration?: string
  isStreaming?: boolean
  isExpanded?: boolean
  content: readonly string[]
}>
const fixtures: Record<string, Fixture> = {
  basic: {
    kind: 'standalone',
    duration: '12s',
    content: [
      'Let me work through the constraints systematically. The farmer has 3 fields and rotates wheat, corn, soy. No same crop in adjacent fields and no same crop in the same field two years in a row...',
    ],
  },
  expanded: {
    kind: 'standalone',
    duration: '8s',
    isExpanded: true,
    content: [
      'First, I need to understand the constraints:',
      '1. Three fields, three crops (wheat, corn, soy)',
      '2. No adjacent fields can have the same crop',
      '3. No field can repeat its crop from the previous year',
      'For Year 1: 3 × 2 × 2 = 12 arrangements...',
    ],
  },
  streaming: {
    kind: 'standalone',
    isStreaming: true,
    content: ['Working through the combinatorial constraints...'],
  },
  customLabel: {
    kind: 'standalone',
    label: 'Analyzing',
    duration: '3s',
    content: ['Checking the codebase for similar patterns...'],
  },
  inMessage: {
    kind: 'inMessage',
    duration: '12s',
    content: ['Let me work through the constraints systematically...'],
  },
}

const reasoning = (
  h: Parameters<NonNullable<DocsExampleImplementation['view']>>[0],
  context: { readonly idPrefix: string },
  fixture: Fixture,
) =>
  ChatReasoning(h, {
    key: `${context.idPrefix}-reasoning`,
    props: {
      ...(fixture.isExpanded === true ? { defaultOpen: true } : {}),
    },
    ...(fixture.label === undefined ? {} : { label: fixture.label }),
    ...(fixture.duration === undefined ? {} : { duration: fixture.duration }),
    ...(fixture.isStreaming === true ? { streaming: true } : {}),
    children: fixture.content,
  })

const example =
  (fixture: Fixture): DocsExampleImplementation['view'] =>
  (h, context) => {
    const content = reasoning(h, context, fixture)
    return (fixture.kind === 'inMessage'
      ? h.div.class('flex w-full max-w-xl flex-col gap-2').children(
          Message(h, {
            children: message => [
              message.content({
                children: [
                  content,
                  h.p
                    .class('text-sm leading-6 text-foreground')
                    .children(
                      'There are 42 valid planting arrangements over 3 years.',
                    ),
                ],
              }),
            ],
          }),
        )
      : h.div
          .class('w-full max-w-xl')
          .children(content)) as unknown as View.Input<DocsMessage>
  }

const source = exampleApplicationSource({
  imports: `import { ChatReasoning } from '@/ui/effect/ui'`,
  body: `ChatReasoning(h, {
  key: 'reasoning',
  props: {},
  duration: '12s',
  children: [reasoningText],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { ChatReasoning } from '@/ui/effect/ui'\n\nChatReasoning(h, { key, props, children })`,
  examples: [
    {
      title: 'Chat Reasoning',
      view: example(fixtures.basic as Fixture),
      source,
    },
    { title: 'Expanded', view: example(fixtures.expanded as Fixture), source },
    {
      title: 'Streaming',
      view: example(fixtures.streaming as Fixture),
      source,
    },
    {
      title: 'Custom Label',
      view: example(fixtures.customLabel as Fixture),
      source,
    },
    {
      title: 'In a Message',
      view: example(fixtures.inMessage as Fixture),
      source,
    },
  ],
})

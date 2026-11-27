import { Html } from '@effect/ui/html'

import { MessageScroller } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const authors = ['Ava', 'Milo', 'June', 'Theo']
const messages = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  author: authors[index % authors.length]!,
  text: [
    'I updated the migration notes.',
    'The scroll position should stay anchored.',
    'Can you review the latest thread?',
    'Yes — the live edge behavior looks right.',
  ][index % 4]!,
}))
const bubble = (
  h: Html.H<DocsMessage>,
  message: (typeof messages)[number],
  group = false,
) =>
  h.div
    .key(String(message.id))
    .class('flex gap-3')
    .children(
      group
        ? h.div
            .class(
              'grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium',
            )
            .children(message.author.slice(0, 1))
        : undefined,
      h.div
        .class('max-w-[85%] rounded-lg bg-muted px-3 py-2')
        .children(
          h.div
            .class('mb-0.5 text-xs font-medium text-muted-foreground')
            .children(`#${message.id} ${message.author}`),
          h.p.class('text-sm').children(message.text),
        ),
    )
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div.class('w-full max-w-xl').children(
      kind === 'position' || kind === 'state'
        ? h.div
            .class(
              'mb-2 flex justify-between rounded-md border px-3 py-2 text-xs text-muted-foreground',
            )
            .children(
              h.span.children('Scroll state'),
              h.span.children('atEnd: true · new: false'),
            )
        : undefined,
      MessageScroller(h, {
        id: `${context.idPrefix}-${kind}`,
        label: 'Conversation messages',
        edge: kind === 'jump' ? 'both' : 'end',
        live: kind === 'live' ? 'polite' : 'off',
        height: '20rem',
        props: { startAtEnd: kind !== 'saved' && kind !== 'loading' },
        children: [
          kind === 'loading'
            ? h.div
                .class('py-2 text-center text-xs text-muted-foreground')
                .children('Loading earlier messages…')
            : undefined,
          kind === 'context'
            ? h.div
                .class(
                  'sticky top-0 z-10 rounded-md border bg-background px-3 py-2 text-xs font-medium shadow-sm',
                )
                .children('Design review · 18 messages')
            : undefined,
          ...messages.map(
            message =>
              bubble(
                h,
                message,
                kind === 'group' || kind === 'animating',
              ) as never,
          ),
          kind === 'animating'
            ? h.div
                .class(
                  'rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm',
                )
                .children('New message arrived')
            : undefined,
        ],
        onEmit: { Measured: () => undefined },
      } as any) as never,
    )
const source = exampleApplicationSource({
  imports: `import { MessageScroller } from '@/ui/effect/ui'`,
  body: `MessageScroller(h, {
  id: 'thread',
  label: 'Conversation messages',
  height: '20rem',
  props: { startAtEnd: true },
  children: messages.map(MessageBubble),
  onEmit: { Measured: () => undefined },
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MessageScroller } from '@/ui/effect/ui'\n\nMessageScroller(h, { id, label, children, onEmit })`,
  examples: [
    { title: 'Anchoring Turns', view: view('anchoring'), source },
    { title: 'Group Chat', view: view('group'), source },
    { title: 'Keeping Context Visible', view: view('context'), source },
    { title: 'Following the Live Edge', view: view('live'), source },
    { title: 'Opening Saved Threads', view: view('saved'), source },
    { title: 'Loading Earlier Messages', view: view('loading'), source },
    { title: 'Animating New Messages', view: view('animating'), source },
    { title: 'Jumping to Messages', view: view('jump'), source },
    { title: 'Tracking the Reader’s Position', view: view('position'), source },
    { title: 'Reading Scroll State', view: view('state'), source },
  ],
})

import { Html } from '@effect/ui/html'

import { Bubble, Button, MessageScroller } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const chat = [
  { id: 1, role: 'assistant', text: 'Hey — welcome to the thread.' },
  { id: 2, role: 'user', text: 'Can you summarize the release notes?' },
  {
    id: 3,
    role: 'assistant',
    text: 'Sure — highlights are auth, theming, and the new chart kit.',
  },
  { id: 4, role: 'user', text: 'Any breaking changes?' },
  {
    id: 5,
    role: 'assistant',
    text: 'Two: the renamed Button size tokens and strict listbox typing.',
  },
  { id: 6, role: 'marker', text: 'Marcus joined the chat' },
  { id: 7, role: 'user', text: 'Does the calendar support RTL?' },
  {
    id: 8,
    role: 'assistant',
    text: 'Yes — pass direction rtl and the mirrored keys follow.',
  },
  { id: 9, role: 'user', text: 'Nice. Last one — how do I persist the theme?' },
  {
    id: 10,
    role: 'assistant',
    text: 'Write the resolved theme to localStorage on every change.',
  },
] as const
const chatRow = (h: Html.H<DocsMessage>, message: (typeof chat)[number]) =>
  message.role === 'marker'
    ? h.div
        .key(String(message.id))
        .class('text-center text-xs text-muted-foreground')
        .children(message.text)
    : h.div.key(String(message.id)).children(
        Bubble(h, {
          ...(message.role === 'user' ? { align: 'end' as const } : {}),
          children: [message.text],
        }) as never,
      )
const actionLabel = (kind: string) => {
  if (kind === 'group') return 'Marcus joins the chat'
  if (kind === 'live') return 'Start streaming'
  if (kind === 'loading') return 'Load earlier messages'
  if (kind === 'jump') return 'Jump to the last turn'
  return 'Send message'
}
const hasToolbar = (kind: string) =>
  [
    'anchoring',
    'group',
    'context',
    'live',
    'loading',
    'animating',
    'jump',
  ].includes(kind)
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div.class('flex w-full max-w-md flex-col gap-3').children(
      hasToolbar(kind)
        ? kind === 'jump'
          ? [
              Button(h, { variant: 'outline', size: 'sm' }).children(
                'Jump to first question',
              ),
              Button(h, { variant: 'outline', size: 'sm' }).children(
                'Jump to the RTL answer',
              ),
              Button(h, { variant: 'outline', size: 'sm' }).children(
                'Jump to the last turn',
              ),
            ]
          : Button(h, { variant: 'outline', size: 'sm' }).children(
              actionLabel(kind),
            )
        : undefined,
      kind === 'position' || kind === 'state'
        ? h.div
            .class(
              'grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground',
            )
            .children(
              h.span.children('scrollTop: 0px'),
              h.span.children('scrollHeight: 640px'),
              h.span.children('Following the live edge'),
              h.span.children('No pending messages'),
            )
        : undefined,
      h.div.class('relative h-72 w-full rounded-md border').children(
        MessageScroller(h, {
          id: `${context.idPrefix}-${kind}`,
          label: 'Conversation messages',
          edge: 'end',
          live: kind === 'live' ? 'polite' : 'off',
          height: '100%',
          props: { startAtEnd: kind !== 'saved' && kind !== 'loading' },
          children: [
            kind === 'loading'
              ? h.div
                  .class('py-2 text-center text-xs text-muted-foreground')
                  .children('Loading earlier messages…')
              : undefined,
            ...chat.map(message => chatRow(h, message) as never),
          ],
          onEmit: { Measured: () => undefined },
        } as any) as never,
      ),
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

import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Bubble from '@/ui/bubble';
import * as MessageScroller from '@/ui/message-scroller';

const messages = <Msg>(h: HtmlBuilder<Msg>) => Array.from({ length: 18 }, (_, index) => MessageScroller.messageScrollerItem({ scrollAnchor: index === 17, children: [Bubble.bubble({ align: index % 2 === 0 ? 'start' : 'end', children: [Bubble.bubbleContent({ children: [`Message ${index + 1}`] }, h)] }, h)] }, h));

const preview = (model: State.Model, direction: 'start' | 'end', h: HtmlBuilder<State.Message>) => MessageScroller.messageScroller({ class: 'relative h-72 w-full max-w-md rounded-md border', children: [MessageScroller.messageScrollerViewport({ model: model.messageScroller, toParentMessage: (message) => State.GotMessageScrollerMessage({ message }), children: [MessageScroller.messageScrollerContent({ children: messages(h) }, h)] }, h), MessageScroller.messageScrollerButton({ model: model.messageScroller, toParentMessage: (message) => State.GotMessageScrollerMessage({ message }), direction }, h)] }, h);

const source = (name: string, direction: 'start' | 'end') => foldkitApplication({
  title: `Message Scroller — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Bubble from '@/ui/bubble'
import * as MessageScroller from '@/ui/message-scroller'`,
  model: `export const Model = S.Struct({ scroller: MessageScroller.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotScrollerMessage = m('GotMessageScrollerMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: MessageScroller.Message })
export const Message = S.Union([GotScrollerMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { scroller: MessageScroller.init('conversation') },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotMessageScrollerMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [scroller, commands] = MessageScroller.update(model.scroller, message.message)
      return [{ ...model, scroller }, Command.mapMessages(commands, next => GotScrollerMessage({ message: next }))]
    }
  }
}`,
  view: `const messageItems = (h: HtmlBuilder<Message>) => Array.from({ length: 18 }, (_, index) =>
  MessageScroller.messageScrollerItem({
    scrollAnchor: index === 17,
    children: [Bubble.bubble({
      align: index % 2 === 0 ? 'start' : 'end',
      children: [Bubble.bubbleContent({ children: [\`Message \${index + 1}\`] }, h)],
    }, h)],
  }, h),
)

export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Message Scroller — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    MessageScroller.messageScroller({ class: 'relative h-72 w-full max-w-md rounded-md border', children: [
      MessageScroller.messageScrollerViewport({
        model: model.scroller,
        toParentMessage: message => GotScrollerMessage({ message }),
        children: [MessageScroller.messageScrollerContent({ children: messageItems(h) }, h)],
      }, h),
      MessageScroller.messageScrollerButton({
        model: model.scroller,
        toParentMessage: message => GotScrollerMessage({ message }),
        direction: '${direction}',
      }, h),
    ] }, h),
  ]),
})`,
});

export const messageScrollerPage = authoredPage({
  slug: 'message-scroller', title: 'Message Scroller', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'Tracks a conversation viewport and offers an accessible jump control when content exists beyond an edge.',
    architecture: 'The Model stores measured scrollTop, scrollHeight, and clientHeight. An OnMount subscription emits Scrolled from the real viewport; RequestedScroll returns a DOM scroll Command that the parent must map.',
    apiHref: 'https://foldkit.dev/guide/subscriptions',
    composition: 'Message Scroller container\n├── viewport (mount-scoped scroll subscription)\n│   └── content\n│       └── keyed/message items + optional anchor\n└── start/end button (derived active state → scroll Command)',
    styling: 'Give the viewport a bounded height and keep message items structurally stable. The jump button derives visibility from measurements rather than being hidden by consumer CSS.',
    accessibility: 'The jump control leaves the accessibility tree when inactive and has a screen-reader label when active. Conversation messages should retain their own semantic author/time/content structure.',
    keyboard: [['Tab', 'Reaches the jump control only while it is active.'], ['Enter / Space', 'Requests a smooth scroll to the configured edge.']],
    examples: [
      { title: 'Jump to latest', description: 'Scroll measurements activate the end button; its Message becomes a mapped DOM scroll Command.', preview: (model, h) => preview(model, 'end', h), code: source('Jump to latest', 'end') },
      { title: 'Jump to beginning', description: 'The same measured Model can expose a start-edge control for history navigation.', preview: (model, h) => preview(model, 'start', h), code: source('Jump to beginning', 'start') },
    ],
  },
});

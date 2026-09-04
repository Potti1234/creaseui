import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const messageScrollerFixtures = [
  { title: 'Jump to latest', description: 'Scroll measurements activate the end button; its Message becomes a mapped DOM scroll Command.', direction: 'end' },
  { title: 'Jump to beginning', description: 'The same measured Model can expose a start-edge control for history navigation.', direction: 'start' },
] as const;

const source = (fixture: (typeof messageScrollerFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const isStyleX = renderer === 'stylex';
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  return foldkitApplication({
    title: `Message Scroller — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "import * as stylex from '@stylexjs/stylex'\n" : ''}
import * as Bubble from '@/${isStyleX ? 'stylex' : 'ui'}/bubble'
import * as MessageScroller from '@/${isStyleX ? 'stylex' : 'ui'}/message-scroller'`,
    model: `${isStyleX ? "const styles = stylex.create({ frame: { overflow: 'hidden', position: 'relative', height: '18rem', width: '100%', maxWidth: '28rem', borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: 1 } })\n" : ''}export const Model = S.Struct({ scroller: MessageScroller.Model })
export type Model = typeof Model.Type`,
    messages: `export const GotScrollerMessage = m('GotMessageScrollerMessage${tag}', { message: MessageScroller.Message })
export const Message = S.Union([GotScrollerMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { scroller: MessageScroller.init('conversation') },
  [],
]`,
    update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotMessageScrollerMessage${tag}': {
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
  title: 'Message Scroller — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ${isStyleX ? "h.div([h.Class(stylex.props(styles.frame).className ?? '')], [\n      MessageScroller.messageScroller({ children:" : "MessageScroller.messageScroller({ class: 'relative h-72 w-full max-w-md rounded-md border', children:"} [
      MessageScroller.messageScrollerViewport({
        model: model.scroller,
        toParentMessage: message => GotScrollerMessage({ message }),
        children: [MessageScroller.messageScrollerContent({ children: messageItems(h) }, h)],
      }, h),
      MessageScroller.messageScrollerButton({ model: model.scroller, toParentMessage: message => GotScrollerMessage({ message }), direction: '${fixture.direction}' }, h),
    ] }, h)${isStyleX ? '\n    ])' : ''},
  ]),
})`,
  });
};
export const messageScrollerExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => messageScrollerFixtures.map(fixture => ({ title: fixture.title, description: fixture.description, code: source(fixture, renderer) }));

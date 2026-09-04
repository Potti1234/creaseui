import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const hoverCardFixtures = [
  { title: 'Profile preview', description: 'Focus and hover share one child update path with a race-safe delayed close command.', side: 'bottom' },
  { title: 'Side placement', description: 'Move the preview without changing its state or command integration.', side: 'right' },
] as const;

const source = (fixture: (typeof hoverCardFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Hover Card — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\n" : ''}
import * as HoverCard from '@/${isStyleX ? 'stylex' : 'ui'}/hover-card'${isStyleX ? "\n\nconst styles = stylex.create({\n  content: { display: 'grid', gap: '0.25rem' },\n  heading: { fontWeight: 600 },\n  copy: { fontSize: '0.875rem' },\n})" : ''}`,
    model: `export const Model = S.Struct({ hoverCard: HoverCard.Model })
export type Model = typeof Model.Type`,
    messages: `export const GotHoverCardMessage = m('GotHoverCardMessage${tag}', { message: HoverCard.Message })
export const Message = S.Union([GotHoverCardMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { hoverCard: HoverCard.init({ id: 'foldkit-profile', showDelay: 200, closeDelay: 150 }) },
  [],
]`,
    update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotHoverCardMessage${tag}': {
      const [hoverCard, commands] = HoverCard.update(model.hoverCard, message.message)
      return [
        { ...model, hoverCard },
        Command.mapMessages(commands, next => GotHoverCardMessage({ message: next })),
      ]
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Hover Card — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    HoverCard.hoverCard({
      model: model.hoverCard,
      toParentMessage: message => GotHoverCardMessage({ message }),
      trigger: '@foldkit',
      ${isStyleX ? '' : "triggerClass: 'underline underline-offset-4',"}
      ariaLabel: 'Preview the Foldkit profile',
      side: '${fixture.side}',
      content: h.div([h.Class(${isStyleX ? "stylex.props(styles.content).className ?? ''" : "'space-y-1'"})], [
        h.h4([h.Class(${isStyleX ? "stylex.props(styles.heading).className ?? ''" : "'font-semibold'"})], ['@foldkit']),
        h.p([h.Class(${isStyleX ? "stylex.props(styles.copy).className ?? ''" : "'text-sm'"})], ['Typed functional web applications without a virtual DOM.']),
      ]),
    }, h),
  ]),
})`,
  });
};

export const hoverCardExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => hoverCardFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));

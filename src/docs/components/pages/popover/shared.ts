import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const popoverFixtures = [
  {
    title: 'Interactive content',
    description: 'A bottom-start panel whose child update and effect commands are delegated by the parent.',
    side: 'bottom',
    align: 'start',
  },
  {
    title: 'Right aligned',
    description: 'Placement is an input to the same complete submodel integration.',
    side: 'right',
    align: 'center',
  },
] as const;

const source = (
  fixture: (typeof popoverFixtures)[number],
  renderer: 'tailwind' | 'stylex',
): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Popover — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\n" : ''}
import * as Popover from '@/${isStyleX ? 'stylex' : 'ui'}/popover'${isStyleX ? "\n\nconst styles = stylex.create({\n  content: { display: 'grid', gap: '0.5rem' },\n  heading: { fontWeight: 500 },\n  copy: { color: 'var(--muted-foreground)', fontSize: '0.875rem' },\n  input: { borderColor: 'var(--border)', borderRadius: '0.375rem', borderStyle: 'solid', borderWidth: '1px', paddingBlock: '0.5rem', paddingInline: '0.75rem' },\n})" : ''}`,
    model: `export const Model = S.Struct({ popover: Popover.Model })
export type Model = typeof Model.Type`,
    messages: `import { taggedStruct } from 'foldkit/schema'
export const GotPopoverMessage = taggedStruct('GotPopoverMessage${tag}', { message: Popover.Message });
export const Message = S.Union([GotPopoverMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { popover: Popover.init({ id: 'dimensions-popover', isAnimated: true, contentFocus: true }) } })`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotPopoverMessage${tag}': {
      const popoverOp__ = Popover.update(model.popover, message.message);
    const popover = popoverOp__.model;
    const commands = popoverOp__.commands ?? [];
      return { model: { ...model, popover }, commands: Command.mapMessages(commands, next => GotPopoverMessage({ message: next })) }
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Popover — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Popover.popover({
      model: model.popover,
      toParentMessage: message => GotPopoverMessage({ message }),
      trigger: 'Open dimensions',
      ${isStyleX ? '' : "triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',"}
      side: '${fixture.side}',
      align: '${fixture.align}',
      content: h.div([h.Class(${isStyleX ? "stylex.props(styles.content).className ?? ''" : "'grid gap-2'"} )], [
        h.h4([h.Class(${isStyleX ? "stylex.props(styles.heading).className ?? ''" : "'font-medium'"} )], ['Dimensions']),
        h.p([h.Class(${isStyleX ? "stylex.props(styles.copy).className ?? ''" : "'text-sm text-muted-foreground'"} )], ['Set the dimensions for the layer.']),
        h.input([h.Type('number'), h.AriaLabel('Width'), h.Class(${isStyleX ? "stylex.props(styles.input).className ?? ''" : "'rounded-md border px-3 py-2'"} )]),
      ]),
    }, h),
  ]),
})`,
  });
};

export const popoverExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => popoverFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));

import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export const tooltipFixtures = [
  { title: 'Delayed label', description: 'The complete application maps the primitive’s delayed-show Command through its parent Message.', side: 'top', showArrow: true, isDisabled: false, ariaLabel: 'Add item to library' },
  { title: 'Side label', description: 'Placement and arrow visibility are view inputs; the child lifecycle remains unchanged.', side: 'right', showArrow: false, isDisabled: false, ariaLabel: 'Add item to library' },
  { title: 'Disabled trigger', description: 'A disabled trigger exposes native disabled semantics and never starts tooltip timers.', side: 'top', showArrow: true, isDisabled: true, ariaLabel: 'Unavailable action' },
] as const;

const source = (fixture: (typeof tooltipFixtures)[number], renderer: 'tailwind' | 'stylex'): string => {
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const isStyleX = renderer === 'stylex';
  return foldkitApplication({
    title: `Tooltip — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'

import * as Tooltip from '@/${isStyleX ? 'stylex' : 'ui'}/tooltip'`,
    model: `export const Model = S.Struct({ tooltip: Tooltip.Model })
export type Model = typeof Model.Type`,
    messages: `import { taggedStruct } from 'foldkit/schema'
export const GotTooltipMessage = taggedStruct('GotTooltipMessage${tag}', { message: Tooltip.Message });
export const Message = S.Union([GotTooltipMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { tooltip: Tooltip.init({ id: 'library-tooltip', showDelay: 400, closeDelay: 100 }) } })`,
    update: `export const update = (model: Model, message: Message): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotTooltipMessage${tag}': {
      const tooltipOp__ = Tooltip.update(model.tooltip, message.message);
    const tooltip = tooltipOp__.model;
    const commands = tooltipOp__.commands ?? [];
      return { model: { ...model, tooltip }, commands: Command.mapMessages(commands, next => GotTooltipMessage({ message: next })) }
    }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Tooltip — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Tooltip.tooltip({
      model: model.tooltip,
      toParentMessage: message => GotTooltipMessage({ message }),
      trigger: 'Add',
      ${isStyleX ? '' : "triggerClass: 'rounded-md border px-3 py-2 text-sm',"}
      ariaLabel: '${fixture.ariaLabel}',
      content: 'Add to library',
      side: '${fixture.side}',
      showArrow: ${String(fixture.showArrow)},
      isDisabled: ${String(fixture.isDisabled)},
    }, h),
  ]),
})`,
  });
};

export const tooltipExamples = (renderer: 'tailwind' | 'stylex'): ReadonlyArray<DocsExample> => tooltipFixtures.map(fixture => ({
  title: fixture.title,
  description: fixture.description,
  code: source(fixture, renderer),
}));

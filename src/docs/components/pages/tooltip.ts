import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Tooltip from '@/ui/tooltip';

const source = (name: string, side: Tooltip.TooltipSide, showArrow: boolean, isDisabled = false): string => foldkitApplication({
  title: `Tooltip — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Tooltip from '@/ui/tooltip'`,
  model: `export const Model = S.Struct({ tooltip: Tooltip.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotTooltipMessage = m('GotTooltipMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Tooltip.Message })
export const Message = S.Union([GotTooltipMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { tooltip: Tooltip.init({ id: 'library-tooltip', showDelay: 400, closeDelay: 100 }) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotTooltipMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [tooltip, commands] = Tooltip.update(model.tooltip, message.message)
      return [
        { ...model, tooltip },
        Command.mapMessages(commands, next => GotTooltipMessage({ message: next })),
      ]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Tooltip — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Tooltip.tooltip({
      model: model.tooltip,
      toParentMessage: message => GotTooltipMessage({ message }),
      trigger: 'Add',
      triggerClass: 'rounded-md border px-3 py-2 text-sm',
      ariaLabel: 'Add item to library',
      content: 'Add to library',
      side: '${side}',
      showArrow: ${String(showArrow)},
      isDisabled: ${String(isDisabled)},
    }, h),
  ]),
})`,
});

const GotTooltipPreviewMessage = m('GotTooltipPreviewMessage', { message: Tooltip.Message });
type GotTooltipPreviewMessage = typeof GotTooltipPreviewMessage.Type;
const TooltipPreviewModel = S.Struct({ _docsPage: S.Literal('tooltip'), tooltip: Tooltip.Model });
type TooltipPreviewModel = typeof TooltipPreviewModel.Type;
const previewProgram = definePreviewProgram<TooltipPreviewModel, GotTooltipPreviewMessage>({
  Model: TooltipPreviewModel,
  Message: GotTooltipPreviewMessage,
  init: index => ({ _docsPage: 'tooltip', tooltip: Tooltip.init({ id: `docs-tooltip-${String(index)}`, showDelay: 400, closeDelay: 100 }) }),
  update: (model, message) => {
    const [tooltip, commands] = Tooltip.update(model.tooltip, message.message);
    return [{ ...model, tooltip }, Command.mapMessages(commands, next => GotTooltipPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => Tooltip.tooltip({ model: model.tooltip, toParentMessage: message => GotTooltipPreviewMessage({ message }), trigger: 'Add', triggerClass: 'rounded-md border px-3 py-2 text-sm', ariaLabel: index === 2 ? 'Unavailable action' : 'Add item to library', content: 'Add to library', side: index === 0 ? 'top' : 'right', showArrow: index === 0, isDisabled: index === 2 }, h),
});

export const tooltipPage = authoredPage({
  slug: 'tooltip', title: 'Tooltip', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Provides a short, non-interactive label or explanation for a focused or hovered control.',
    architecture: 'Tooltip is a Foldkit child Model. Its update returns delayed-show and delayed-close Commands with generation IDs; the parent maps them back through GotTooltipMessage so stale completions cannot override current hover or focus ownership.',
    apiHref: 'https://foldkit.dev/ui/tooltip',
    composition: 'Tooltip submodel\n├── accessible trigger\n└── portalled anchored panel\n    ├── concise content\n    └── optional placement-aware arrow',
    styling: 'Keep tooltip text brief. Side and alignment express preference, while Foldkit’s anchor layer may flip the rendered placement to avoid viewport collisions.',
    accessibility: 'Tooltips open on keyboard focus as well as hover, ignore pointer-induced focus on touch, and must never contain required or interactive content. Give icon-only triggers an accessible name independent of the tooltip text.',
    keyboard: [['Tab', 'Focusing the trigger schedules or reveals the tooltip.'], ['Escape', 'Dismisses the visible tooltip without moving focus.'], ['Blur', 'Closes the tooltip when focus leaves the trigger.']],
    examples: [
      { title: 'Delayed label', description: 'The complete application maps the primitive’s delayed-show Command through its parent Message.',  code: source('Delayed label', 'top', true) },
      { title: 'Side label', description: 'Placement and arrow visibility are view inputs; the child lifecycle remains unchanged.',  code: source('Side label', 'right', false) },
      { title: 'Disabled trigger', description: 'A disabled trigger exposes native disabled semantics and never starts tooltip timers.', code: source('Disabled trigger', 'top', true, true) },
    ],
  },
});

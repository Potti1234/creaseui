import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Popover from '@/ui/popover';

const content = <Msg>(h: HtmlBuilder<Msg>) => h.div([h.Class('grid gap-2')], [
  h.h4([h.Class('font-medium')], ['Dimensions']),
  h.p([h.Class('text-sm text-muted-foreground')], ['Set the dimensions for the layer.']),
]);

const source = (name: string, side: Popover.PopoverSide, align: Popover.PopoverAlign): string => foldkitApplication({
  title: `Popover — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Popover from '@/ui/popover'`,
  model: `export const Model = S.Struct({ popover: Popover.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotPopoverMessage = m('GotPopoverMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Popover.Message })
export const Message = S.Union([GotPopoverMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { popover: Popover.init({ id: 'dimensions-popover', isAnimated: true, contentFocus: true }) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotPopoverMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [popover, commands] = Popover.update(model.popover, message.message)
      return [
        { ...model, popover },
        Command.mapMessages(commands, next => GotPopoverMessage({ message: next })),
      ]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Popover — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Popover.popover({
      model: model.popover,
      toParentMessage: message => GotPopoverMessage({ message }),
      trigger: 'Open dimensions',
      triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
      side: '${side}',
      align: '${align}',
      content: h.div([h.Class('grid gap-2')], [
        h.h4([h.Class('font-medium')], ['Dimensions']),
        h.p([h.Class('text-sm text-muted-foreground')], ['Set the dimensions for the layer.']),
        h.input([h.Type('number'), h.AriaLabel('Width'), h.Class('rounded-md border px-3 py-2')]),
      ]),
    }, h),
  ]),
})`,
});

const preview = (model: State.Model, side: Popover.PopoverSide, align: Popover.PopoverAlign, h: HtmlBuilder<State.Message>) => Popover.popover({ model: model.popover, toParentMessage: (message) => State.GotPopoverMessage({ message }), trigger: 'Open dimensions', triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium', side, align, content: content(h) }, h);

const GotPopoverPreviewMessage = m('GotPopoverPreviewMessage', { message: Popover.Message });
type GotPopoverPreviewMessage = typeof GotPopoverPreviewMessage.Type;
const PopoverPreviewModel = S.Struct({ _docsPage: S.Literal('popover'), popover: Popover.Model });
type PopoverPreviewModel = typeof PopoverPreviewModel.Type;
const previewProgram = definePreviewProgram<PopoverPreviewModel, GotPopoverPreviewMessage>({
  Model: PopoverPreviewModel,
  Message: GotPopoverPreviewMessage,
  init: index => ({ _docsPage: 'popover', popover: Popover.init({ id: `docs-popover-${String(index)}`, isAnimated: true, contentFocus: true }) }),
  update: (model, message) => {
    const [popover, commands] = Popover.update(model.popover, message.message);
    return [{ ...model, popover }, Command.mapMessages(commands, next => GotPopoverPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => Popover.popover({ model: model.popover, toParentMessage: message => GotPopoverPreviewMessage({ message }), trigger: 'Open dimensions', triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium', side: index === 0 ? 'bottom' : 'right', align: index === 0 ? 'start' : 'center', content: content(h) }, h),
});

export const popoverPage = authoredPage({
  slug: 'popover', title: 'Popover', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Displays interactive content in a floating panel anchored to a trigger.',
    architecture: 'Popover is a Foldkit child Model rendered with h.submodel. Its Message drives disclosure, anchored positioning, outside-click dismissal, focus movement, and animation commands.',
    apiHref: 'https://foldkit.dev/ui/popover',
    composition: 'Popover submodel\n├── trigger button / anchor\n├── optional backdrop\n└── positioned panel\n    └── interactive content',
    styling: 'Choose side and alignment as view configuration. The positioning engine can still flip or shift the panel to remain visible near viewport edges.',
    accessibility: 'The primitive connects trigger state and panel behavior. Set contentFocus when the panel contains controls; Escape and outside interaction dismiss it and return focus appropriately.',
    keyboard: [['Enter / Space', 'Opens or closes the anchored panel.'], ['Tab', 'Moves into interactive popover content when contentFocus is enabled.'], ['Escape', 'Closes the panel and restores trigger focus.']],
    examples: [
      { title: 'Interactive content', description: 'A bottom-start panel whose child update and effect commands are delegated by the parent.', preview: (model, h) => preview(model, 'bottom', 'start', h), code: source('Interactive content', 'bottom', 'start') },
      { title: 'Right aligned', description: 'Placement is an input to the same complete submodel integration.', preview: (model, h) => preview(model, 'right', 'center', h), code: source('Right aligned', 'right', 'center') },
    ],
  },
});

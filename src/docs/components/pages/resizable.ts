import { Schema as S } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Resizable from '@/ui/resizable';

const source = (name: string, direction: 'horizontal' | 'vertical', initialSize: number): string => foldkitApplication({
  title: `Resizable — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Resizable from '@/ui/resizable'`,
  model: `export const Model = S.Struct({ panels: Resizable.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotResizableMessage = m('GotResizableMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Resizable.Message })
export const Message = S.Union([GotResizableMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { panels: Resizable.init('workspace-panels', ${String(initialSize)}) },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotResizableMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [
        { ...model, panels: Resizable.update(model.panels, message.message) },
        [],
      ]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Resizable — ${name}',
  body: h.main([h.Class('mx-auto max-w-2xl p-8')], [
    Resizable.resizable({
      model: model.panels,
      toParentMessage: message => GotResizableMessage({ message }),
      direction: '${direction}',
      extent: ${direction === 'horizontal' ? '640' : '256'},
      withHandle: true,
      ariaLabel: 'Resize workspace panels',
      class: '${direction === 'horizontal' ? 'h-64 w-full' : 'h-64 w-full'}',
      first: h.div([h.Class('flex size-full items-center justify-center p-4')], ['Editor']),
      second: h.div([h.Class('flex size-full items-center justify-center p-4')], ['Preview']),
    }, h),
  ]),
})`,
});

const panel = <Msg>(label: string, h: HtmlBuilder<Msg>) => h.div([h.Class('flex size-full items-center justify-center p-4 text-sm')], [label]);

const GotResizablePreviewMessage = m('GotResizablePreviewMessage', { message: Resizable.Message });
type GotResizablePreviewMessage = typeof GotResizablePreviewMessage.Type;
const ResizablePreviewModel = S.Struct({ _docsPage: S.Literal('resizable'), panels: Resizable.Model });
type ResizablePreviewModel = typeof ResizablePreviewModel.Type;
const previewProgram = definePreviewProgram<ResizablePreviewModel, GotResizablePreviewMessage>({
  Model: ResizablePreviewModel,
  Message: GotResizablePreviewMessage,
  init: index => ({ _docsPage: 'resizable', panels: Resizable.init(`docs-resizable-${String(index)}`, index === 0 ? 50 : 40) }),
  update: (model, message) => [{ ...model, panels: Resizable.update(model.panels, message.message) }, []],
  view: (index, model, h) => Resizable.resizable({ model: model.panels, toParentMessage: message => GotResizablePreviewMessage({ message }), ...(index === 1 ? { direction: 'vertical' as const } : {}), extent: index === 0 ? 640 : 256, withHandle: true, ariaLabel: index === 0 ? 'Resize editor and preview' : 'Resize workspace rows', class: index === 0 ? 'h-56 w-full max-w-xl' : 'h-64 w-full max-w-xl', first: panel(index === 0 ? 'Editor' : 'Canvas', h), second: panel(index === 0 ? 'Preview' : 'Console', h) }, h),
});

export const resizablePage = authoredPage({
  slug: 'resizable', title: 'Resizable', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Lets users allocate space between adjacent panels with pointer or keyboard input.',
    architecture: 'Resizable owns drag state and the first panel percentage in a child Model. Wrap its Messages and delegate through Resizable.update; unlike Slider, pointer tracking stays on the rendered group and requires no global subscription.',
    apiHref: 'https://foldkit.dev/ui/resizable',
    composition: 'Resizable panel group\n├── first panel\n├── separator handle\n└── second panel',
    styling: 'Give the group an explicit block size and pass its pixel extent so pointer deltas map accurately to percentages. Set domain-appropriate minimum and maximum sizes.',
    accessibility: 'The focusable separator exposes orientation, current percentage, bounds, and disabled state. Keyboard resizing is available without pointer precision.',
    keyboard: [['Arrow keys', 'Nudges the split in the axis direction.'], ['Home / End', 'Moves the split to its configured minimum or maximum.']],
    examples: [
      {
        title: 'Editor and preview', description: 'Pointer and keyboard events update one explicit split percentage.',

        code: source('Editor and preview', 'horizontal', 50),
      },
      {
        title: 'Vertical split', description: 'A second panel group needs a separate Model and message route even when it lives on the same page.',

        code: source('Vertical split', 'vertical', 40),
      },
    ],
  },
});

import type { HtmlBuilder } from 'foldkit/html';

import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as HoverCard from '@/ui/hover-card';

const card = <Msg>(h: HtmlBuilder<Msg>) => h.div([h.Class('space-y-1')], [h.h4([h.Class('font-semibold')], ['@foldkit']), h.p([h.Class('text-sm')], ['Typed functional web applications without a virtual DOM.'])]);

const source = (name: string, side: HoverCard.HoverCardSide): string => foldkitApplication({
  title: `Hover Card — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as HoverCard from '@/ui/hover-card'`,
  model: `export const Model = S.Struct({ hoverCard: HoverCard.Model })
export type Model = typeof Model.Type`,
  messages: `export const GotHoverCardMessage = m('GotHoverCardMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: HoverCard.Message })
export const Message = S.Union([GotHoverCardMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { hoverCard: HoverCard.init({ id: 'foldkit-profile', closeDelay: 150 }) },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotHoverCardMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [hoverCard, commands] = HoverCard.update(model.hoverCard, message.message)
      return [
        { ...model, hoverCard },
        Command.mapMessages(commands, next => GotHoverCardMessage({ message: next })),
      ]
    }
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Hover Card — ${name}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    HoverCard.hoverCard({
      model: model.hoverCard,
      toParentMessage: message => GotHoverCardMessage({ message }),
      trigger: '@foldkit',
      triggerClass: 'underline underline-offset-4',
      ariaLabel: 'Preview the Foldkit profile',
      side: '${side}',
      content: h.div([h.Class('space-y-1')], [
        h.h4([h.Class('font-semibold')], ['@foldkit']),
        h.p([h.Class('text-sm')], ['Typed functional web applications without a virtual DOM.']),
      ]),
    }, h),
  ]),
})`,
});

const preview = (model: State.Model, side: HoverCard.HoverCardSide, h: HtmlBuilder<State.Message>) => HoverCard.hoverCard({ model: model.hoverCard, toParentMessage: (message) => State.GotHoverCardMessage({ message }), trigger: '@foldkit', triggerClass: 'underline underline-offset-4', ariaLabel: 'Preview the Foldkit profile', side, content: card(h) }, h);

export const hoverCardPage = authoredPage({
  slug: 'hover-card', title: 'Hover Card', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'Reveals supplementary preview information when a pointer or keyboard focus rests on a trigger.',
    architecture: 'Hover Card keeps disclosure and a versioned close delay in a child Model. The delayed Command must be mapped back to the child so stale leave events cannot close a newly re-entered card.',
    apiHref: 'https://foldkit.dev/ui/hover-card',
    composition: 'Hover Card child state\n├── focusable trigger\n└── non-modal preview panel',
    styling: 'Use concise, read-only content and leave enough room around the anchor. Hover cards should enrich an existing target, never hide an action required to complete a task.',
    accessibility: 'The trigger is a real button and opens on focus as well as hover. The panel is supplemental rather than modal; users can continue through the page without interacting with it.',
    keyboard: [['Tab', 'Focusing the trigger reveals the card.'], ['Shift+Tab / Tab away', 'Schedules the card to close after its configured delay.'], ['Pointer hover', 'Keeps the card open while the pointer crosses from trigger to content.']],
    examples: [
      { title: 'Profile preview', description: 'Focus and hover share one child update path with a race-safe delayed close command.', preview: (model, h) => preview(model, 'bottom', h), code: source('Profile preview', 'bottom') },
      { title: 'Side placement', description: 'Move the preview without changing its state or command integration.', preview: (model, h) => preview(model, 'right', h), code: source('Side placement', 'right') },
    ],
  },
});

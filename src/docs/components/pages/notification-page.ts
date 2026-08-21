

import { foldkitApplication } from '@/docs/components/pages/authored-page';
import type { PageDefinition } from '@/docs/components/page-definition';
import type { ComponentKind } from '@/docs/components/page-definition';
import type * as Sonner from '@/ui/sonner';

type NotificationConfig = Readonly<{
  slug: 'sonner' | 'toast';
  title: 'Sonner' | 'Toast';
  namespace: 'Sonner' | 'Toast';
  description: string;
  kind: ComponentKind;
}>;

const application = (config: NotificationConfig, example: string, variant: Sonner.Variant, sticky: boolean): string => {
  const factory = variant.toLowerCase();
  return foldkitApplication({
    title: `${config.title} — ${example}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as ${config.namespace} from '@/ui/${config.slug}'`,
    model: `export const Model = S.Struct({ notifications: ${config.namespace}.Model, maybeLastDismissedTitle: S.Option(S.String) })
export type Model = typeof Model.Type`,
    messages: `export const ClickedShow = m('ClickedShow${config.title}${example.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const ClickedAction = m('Clicked${config.title}Action${example.replaceAll(/[^a-zA-Z0-9]/g, '')}', { id: S.String })
export const GotNotificationMessage = m('Got${config.title}Message${example.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: ${config.namespace}.Message })
export const Message = S.Union([ClickedShow, ClickedAction, GotNotificationMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { notifications: ${config.namespace}.init({ id: '${config.slug}-demo' }), maybeLastDismissedTitle: Option.none() },
  [],
]`,
    update: `const mapNotifications = (
  model: Model,
  result: ReturnType<typeof ${config.namespace}.update>,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [notifications, commands, maybeDismissed] = result
  return [
    {
      ...model,
      notifications,
      maybeLastDismissedTitle: Option.match(maybeDismissed, {
        onNone: () => model.maybeLastDismissedTitle,
        onSome: output => Option.some(output.entry.payload.title),
      }),
    },
    Command.mapMessages(commands, next => GotNotificationMessage({ message: next })),
  ]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedShow${config.title}${example.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapNotifications(model, ${config.namespace}.show(model.notifications, ${config.namespace}.${factory}({
        title: '${variant === 'Error' ? 'Could not save changes' : 'Event has been created'}',
        description: '${variant === 'Error' ? 'Try again in a moment.' : 'Sunday at 9:00 AM'}',
        actionLabel: 'Undo',
        sticky: ${String(sticky)},
        duration: '4 seconds',
      })))
    case 'Clicked${config.title}Action${example.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapNotifications(model, ${config.namespace}.dismiss(model.notifications, message.id))
    case 'Got${config.title}Message${example.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return mapNotifications(model, ${config.namespace}.update(model.notifications, message.message))
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: '${config.title} — ${example}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    Button.button({ onClick: ClickedShow(), children: ['Show ${config.title.toLowerCase()}'] }, h),
    ${config.namespace}.${config.slug}({
      model: model.notifications,
      toParentMessage: message => GotNotificationMessage({ message }),
      actionToMessage: entry => ClickedAction({ id: entry.id }),
      ariaLabel: '${config.title} notifications',
    }, h),
  ]),
})`,
  });
};

export const notificationDefinition = (config: NotificationConfig): PageDefinition => ({
  kind: config.kind, description: config.description,
  architecture: `${config.title} owns an ordered Entry collection and next id. show may return a delayed-dismiss Command; update/dismiss may emit DismissedToast output. The parent maps Commands and handles action clicks as domain Messages.`,
  apiHref: 'https://foldkit.dev/guide/effects',
  composition: `Parent Model\n└── ${config.title} Model\n    ├── stable keyed entries\n    ├── variant + payload + duration\n    ├── optional action → parent Message\n    └── dismiss/timer Message + OutMessage`,
  styling: 'The fixed viewport stacks keyed notifications. Prefer brief titles, useful descriptions, and one clear action; sticky notifications require an obvious dismissal route.',
  accessibility: 'The viewport is a named polite live region. Error entries use alert while other variants use status. Actions and dismiss controls are real, labeled buttons.',
  keyboard: [['Tab', 'Moves to an action or dismiss button in a visible notification.'], ['Enter / Space', 'Runs the focused action or dismisses the entry.']],
  examples: [
    { title: 'Timed notification', description: 'Showing a non-sticky entry returns a delay Command that is mapped through the parent Message.',  code: application(config, 'Timed notification', 'Success', false) },
    { title: 'Sticky error', description: 'A sticky error remains until its action or dismiss control emits a parent-handled Message.',  code: application(config, 'Sticky error', 'Error', true) },
  ],
});

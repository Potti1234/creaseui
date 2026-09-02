import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import { notificationDefinition } from '@/docs/components/pages/notification-page';
import * as Button from '@/ui/button';
import * as Sonner from '@/ui/sonner';

const ShowedSonnerPreview = m('ShowedSonnerPreview');
const GotSonnerPreviewMessage = m('GotSonnerPreviewMessage', { message: Sonner.Message });
const SonnerPreviewMessage = S.Union([ShowedSonnerPreview, GotSonnerPreviewMessage]);
type SonnerPreviewMessage = typeof SonnerPreviewMessage.Type;
const SonnerPreviewModel = S.Struct({ _docsPage: S.Literal('sonner'), exampleIndex: S.Number, notifications: Sonner.Model });
type SonnerPreviewModel = typeof SonnerPreviewModel.Type;
const previewProgram = definePreviewProgram<SonnerPreviewModel, SonnerPreviewMessage>({
  Model: SonnerPreviewModel, Message: SonnerPreviewMessage,
  init: index => ({ _docsPage: 'sonner', exampleIndex: index, notifications: Sonner.init({ id: `docs-sonner-${String(index)}` }) }),
  update: (model, message) => {
    const [notifications, commands] = message._tag === 'ShowedSonnerPreview' ? Sonner.show(model.notifications, model.exampleIndex === 0 ? Sonner.success({ title: 'Event has been created', description: 'Sunday at 9:00 AM', duration: '700 millis' }) : Sonner.error({ title: 'Could not save changes', description: 'Try again in a moment.', actionLabel: 'Retry', sticky: true })) : Sonner.update(model.notifications, message.message);
    return [{ ...model, notifications }, Command.mapMessages(commands, next => GotSonnerPreviewMessage({ message: next }))];
  },
  view: (_index, model, h) => h.div([], [Button.button({ onClick: ShowedSonnerPreview(), children: ['Show sonner'] }, h), Sonner.sonner({ model: model.notifications, toParentMessage: message => GotSonnerPreviewMessage({ message }), ariaLabel: 'Sonner notifications' }, h)]),
});

const asyncSource = foldkitApplication({
  title: 'Sonner — Async save migration',
  imports: `import { Effect, Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as Sonner from '@/ui/sonner'`,
  model: `export const Model = S.Struct({ notifications: Sonner.Model, activeToastId: S.Option(S.String) })
export type Model = typeof Model.Type`,
  messages: `export const ClickedSave = m('ClickedSave')
export const CompletedSave = m('CompletedSave')
export const GotSonnerMessage = m('GotSonnerMessage', { message: Sonner.Message })
export const Message = S.Union([ClickedSave, CompletedSave, GotSonnerMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { notifications: Sonner.init({ id: 'save-notifications' }), activeToastId: Option.none() },
  [],
]`,
  update: `const Save = Command.define('Save', {
  messages: [CompletedSave],
  execute: Effect.sleep('600 millis').pipe(Effect.as(CompletedSave())),
})

const mapNotifications = (model: Model, result: ReturnType<typeof Sonner.update>): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const [notifications, commands] = result
  return [{ ...model, notifications }, Command.mapMessages(commands, message => GotSonnerMessage({ message }))]
}

export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ClickedSave': {
      const result = Sonner.show(model.notifications, Sonner.info({ title: 'Saving changes…', sticky: true }))
      const [next, commands] = mapNotifications(model, result)
      const activeToastId = Option.fromNullishOr(next.notifications.entries.at(-1)?.id)
      return [{ ...next, activeToastId }, [...commands, Save()]]
    }
    case 'CompletedSave':
      return Option.match(model.activeToastId, {
        onNone: () => [model, []] as const,
        onSome: id => mapNotifications({ ...model, activeToastId: Option.none() }, Sonner.updateToast(model.notifications, id, {
          title: 'Changes saved', variant: 'Success', sticky: false, duration: '3 seconds',
        })),
      })
    case 'GotSonnerMessage': return mapNotifications(model, Sonner.update(model.notifications, message.message))
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Sonner — Async save migration',
  body: h.main([], [
    Button.button({ onClick: ClickedSave(), children: ['Save changes'] }, h),
    Sonner.sonner({ model: model.notifications, toParentMessage: message => GotSonnerMessage({ message }) }, h),
  ]),
})`,
});

const baseDefinition = notificationDefinition({ slug: 'sonner', title: 'Sonner', namespace: 'Sonner', kind: 'submodel', description: 'A compatibility skin over the canonical Toast notification Submodel, not a second state engine.' });

export const sonnerPage = authoredPage({
  slug: 'sonner', title: 'Sonner', kind: 'submodel',
  previewProgram,
  definition: {
    ...baseDefinition,
    architecture: `${baseDefinition.architecture} Sonner and Toast export the same Model, Message, update, timer, and OutMessage identities. The Sonner name changes only the compatibility surface and viewport skin.`,
    accessibility: `${baseDefinition.accessibility} The compatibility layer does not alter live-region priority or keyboard behavior.`,
    examples: [
      ...baseDefinition.examples,
      { title: 'Async save migration', description: 'Replace imperative toast.promise calls with a parent Command and updateToast on the stable keyed entry.', code: asyncSource },
      { title: 'Imperative API migration', description: 'Global toast(), dismiss(), and promise() calls are intentionally unsupported; keep notification state in the parent and call show, updateToast, or dismiss from update.', code: asyncSource },
    ],
  },
});

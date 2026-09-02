import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram } from '@/docs/components/pages/authored-page';
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

export const sonnerPage = authoredPage({
  slug: 'sonner', title: 'Sonner', kind: 'submodel',
  previewProgram,
  definition: notificationDefinition({ slug: 'sonner', title: 'Sonner', namespace: 'Sonner', kind: 'submodel', description: 'Queues transient or sticky application notifications with variants, actions, and deterministic dismissal effects.' }),
});

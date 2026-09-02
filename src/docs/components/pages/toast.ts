import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram } from '@/docs/components/pages/authored-page';
import { notificationDefinition } from '@/docs/components/pages/notification-page';
import * as Button from '@/ui/button';
import * as Toast from '@/ui/toast';

const ShowedToastPreview = m('ShowedToastPreview');
const GotToastPreviewMessage = m('GotToastPreviewMessage', { message: Toast.Message });
const ToastPreviewMessage = S.Union([ShowedToastPreview, GotToastPreviewMessage]);
type ToastPreviewMessage = typeof ToastPreviewMessage.Type;
const ToastPreviewModel = S.Struct({ _docsPage: S.Literal('toast'), exampleIndex: S.Number, notifications: Toast.Model });
type ToastPreviewModel = typeof ToastPreviewModel.Type;
const previewProgram = definePreviewProgram<ToastPreviewModel, ToastPreviewMessage>({
  Model: ToastPreviewModel, Message: ToastPreviewMessage,
  init: index => ({ _docsPage: 'toast', exampleIndex: index, notifications: Toast.init({ id: `docs-toast-${String(index)}` }) }),
  update: (model, message) => {
    const [notifications, commands] = message._tag === 'ShowedToastPreview' ? Toast.show(model.notifications, model.exampleIndex === 0 ? Toast.success({ title: 'Event has been created', description: 'Sunday at 9:00 AM', duration: '700 millis' }) : Toast.error({ title: 'Could not save changes', description: 'Try again in a moment.', actionLabel: 'Retry', sticky: true })) : Toast.update(model.notifications, message.message);
    return [{ ...model, notifications }, Command.mapMessages(commands, next => GotToastPreviewMessage({ message: next }))];
  },
  view: (_index, model, h) => h.div([], [Button.button({ onClick: ShowedToastPreview(), children: ['Show toast'] }, h), Toast.toast({ model: model.notifications, toParentMessage: message => GotToastPreviewMessage({ message }), ariaLabel: 'Toast notifications' }, h)]),
});

export const toastPage = authoredPage({
  slug: 'toast', title: 'Toast', kind: 'recipe',
  previewProgram,
  definition: notificationDefinition({ slug: 'toast', title: 'Toast', namespace: 'Toast', kind: 'recipe', description: 'Provides the shadcn Toast naming surface as a source-compatible recipe alias over Crease UI’s Sonner notification state engine.' }),
});

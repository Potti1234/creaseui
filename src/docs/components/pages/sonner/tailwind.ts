import { Effect, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  sonnerFixtures,
  toastTitle,
  type SonnerButtonSpec,
  type SonnerFixture,
} from '@/docs/components/pages/sonner/shared';
import * as Button from '@/ui/button';
import * as Sonner from '@/ui/sonner';

const GotSonnerPreviewMessage = defineMessageUnion({
  ClickedSonnerButton: { index: S.Number },
  CompletedPromiseToast: {},
  GotSonnerPreviewMessage: { message: Sonner.Message },
});
type PreviewMessage = typeof GotSonnerPreviewMessage.Type;

const PreviewModel = S.Struct({
  _docsPage: S.Literal('sonner'),
  notifications: Sonner.Model,
  pendingPromiseId: S.Option(S.String),
});
type PreviewModel = typeof PreviewModel.Type;

const variantFactory = (
  button: SonnerButtonSpec,
): ((input: Sonner.ToastInput) => Sonner.ShowInput) => {
  switch (button.variant) {
    case 'default':
      return Sonner.plain;
    case 'success':
      return Sonner.success;
    case 'info':
      return Sonner.info;
    case 'warning':
      return Sonner.warning;
    case 'error':
      return Sonner.error;
    case 'promise':
      return Sonner.info;
  }
};

const showInputFor = (button: SonnerButtonSpec): Sonner.ShowInput => {
  if (button.variant === 'promise') {
    return Sonner.info({ title: 'Loading...', sticky: true });
  }
  return variantFactory(button)({
    title: toastTitle(button.variant),
    ...(button.description === undefined
      ? {}
      : { description: button.description }),
    ...(button.actionLabel === undefined
      ? {}
      : { actionLabel: button.actionLabel }),
    ...(button.position === undefined
      ? {}
      : { position: button.position }),
  });
};

const ResolvePromise = Command.define('ResolveSonnerPromise', {
  messages: [GotSonnerPreviewMessage.CompletedPromiseToast],
  execute: Effect.sleep('1200 millis').pipe(
    Effect.as(GotSonnerPreviewMessage.CompletedPromiseToast()),
  ),
});

const mapSonner = (
  model: PreviewModel,
  result: ReturnType<typeof Sonner.update>,
): { model: PreviewModel; commands: ReadonlyArray<Command.Command<PreviewMessage>> } => ({
  model: { ...model, notifications: result.model },
  commands: Command.mapMessages(result.commands ?? [], next =>
    GotSonnerPreviewMessage.GotSonnerPreviewMessage({ message: next })),
});

const buttonView = (
  button: SonnerButtonSpec,
  index: number,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  Button.button({
    onClick: GotSonnerPreviewMessage.ClickedSonnerButton({ index }),
    variant: 'outline',
    children: [button.label],
  }, h);

const fixtureView = (
  fixture: SonnerFixture,
  fixtureIndex: number,
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html => {
  const offset = sonnerFixtures
    .slice(0, fixtureIndex)
    .reduce((total, candidate) => total + candidate.buttons.length, 0);
  return h.div(
    [
      h.Class(
        fixture.wrap === 'center'
          ? 'flex flex-wrap justify-center gap-2'
          : 'flex flex-wrap gap-2',
      ),
    ],
    fixture.buttons
      .map((button, index) => buttonView(button, offset + index, h))
      .concat([
        Sonner.sonner({
          model: model.notifications,
          toParentMessage: message =>
            GotSonnerPreviewMessage.GotSonnerPreviewMessage({ message }),
          ariaLabel: 'Sonner notifications',
        }, h),
      ]),
  );
};

export const sonnerTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: GotSonnerPreviewMessage,
  init: () => ({
    _docsPage: 'sonner',
    notifications: Sonner.init({ id: 'docs-sonner-preview' }),
    pendingPromiseId: Option.none(),
  }),
  update: (model, message) => {
    switch (message._tag) {
      case 'ClickedSonnerButton': {
        const button = sonnerFixtures
          .flatMap(fixture => fixture.buttons)
          .at(message.index);
        if (button === undefined) {
          return { model };
        }
        const result = Sonner.show(
          model.notifications,
          showInputFor(button),
        );
        const mapped = mapSonner(model, result);
        const commands = mapped.commands ?? [];
        if (button.variant !== 'promise') {
          return mapped;
        }
        const next = mapped.model;
        return {
          model: {
            ...next,
            pendingPromiseId: Option.fromNullishOr(
              next.notifications.entries.at(-1)?.id,
            ),
          },
          commands: [...commands, ResolvePromise()],
        };
      }
      case 'CompletedPromiseToast':
        return Option.match(model.pendingPromiseId, {
          onNone: () => ({ model }),
          onSome: id =>
            mapSonner(
              { ...model, pendingPromiseId: Option.none() },
              Sonner.updateToast(model.notifications, id, {
                title: 'Event has been created',
                variant: 'Success',
                sticky: false,
                duration: '4 seconds',
              }),
            ),
        });
      case 'GotSonnerPreviewMessage':
        return mapSonner(
          model,
          Sonner.update(model.notifications, message.message),
        );
    }
  },
  view: (index, model, h) =>
    fixtureView(sonnerFixtures[index] ?? sonnerFixtures[0], index, model, h),
});

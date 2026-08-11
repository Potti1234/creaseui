import type { Stream } from 'effect';
import { Effect, Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';
import * as Subscription from 'foldkit/subscription';

const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const Model = S.Struct({
  isOpen: S.Boolean,
  isMobileOpen: S.Boolean,
  storageKey: S.String,
});
export type Model = typeof Model.Type;

export const Toggled = m('Toggled');
export const ToggledMobile = m('ToggledMobile');
export const SetMobileOpen = m('SetMobileOpen', { isOpen: S.Boolean });
export const CompletedSidebarPersist = m('CompletedSidebarPersist');
export const Message = S.Union([
  Toggled,
  ToggledMobile,
  SetMobileOpen,
  CompletedSidebarPersist,
]);
export type Message = typeof Message.Type;

export const init = (
  config: Readonly<{ defaultOpen?: boolean; storageKey?: string }> = {},
): Model => ({
  isOpen: config.defaultOpen ?? true,
  isMobileOpen: false,
  storageKey: config.storageKey ?? 'sidebar_state',
});

const SidebarPersist = Command.define('SidebarPersist', {
  args: { key: S.String, isOpen: S.Boolean },
  messages: [CompletedSidebarPersist],
  execute: ({ key, isOpen }) =>
    Effect.sync(() => {
      document.cookie = `${key}=${String(isOpen)}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
    }).pipe(Effect.as(CompletedSidebarPersist())),
});

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>];

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'Toggled': {
      const isOpen = !model.isOpen;
      return [
        { ...model, isOpen },
        [SidebarPersist({ key: model.storageKey, isOpen })],
      ];
    }
    case 'ToggledMobile':
      return [{ ...model, isMobileOpen: !model.isMobileOpen }, []];
    case 'SetMobileOpen':
      return [{ ...model, isMobileOpen: message.isOpen }, []];
    case 'CompletedSidebarPersist':
      return [model, []];
  }
};

export const shortcut = <Msg>(
  toMessage: (message: Message) => Msg,
): Stream.Stream<Msg> =>
  Subscription.fromEventFilterMap<KeyboardEvent, Msg>({
    target: document,
    type: 'keydown',
    toMessage: (event) => {
      if (event.key.toLowerCase() !== 'b' || (!event.metaKey && !event.ctrlKey))
        return Option.none();
      event.preventDefault();
      return Option.some(toMessage(Toggled()));
    },
  });

import { Effect, Option, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Subscription from 'foldkit/subscription'
import { defineMessageUnion } from 'foldkit/message'
import * as Preference from './preference'
import type * as Storage from './storage'

export const System = Schema.Literals(['light', 'dark', 'unknown'])

/** Read a Sec-CH-Prefers-Color-Scheme request hint for the initial Model. */
export const colorSchemeOf = (hint?: string | null): typeof System.Type => {
  const value = hint?.trim().replace(/^"(light|dark)"$/, '$1')
  return value === 'light' || value === 'dark' ? value : 'unknown'
}

export const Model = Schema.Struct({
  value: Schema.Literals(['system', 'light', 'dark']),
  system: System,
})

export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  GotPreferenceMessage: { message: Preference.Message },
  ChangedSystem: { system: System },
  CompletedApply: {},
})

export type Message = typeof Message.Type

export const resolved = (model: Model): 'light' | 'dark' =>
  model.value === 'dark' ||
  (model.value === 'system' && model.system === 'dark')
    ? 'dark'
    : 'light'

export const Apply = Command.define('ApplyColorScheme', {
  args: { model: Model },
  messages: [Message.CompletedApply],
  execute: ({ model }) =>
    Effect.sync(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle(
          'dark',
          resolved(model) === 'dark',
        )
        document.documentElement.style.colorScheme = resolved(model)
      }
      return Message.CompletedApply()
    }),
})

export const create = (
  config: Readonly<{ storage?: Storage.Descriptor }> = {},
) => {
  const preference = Preference.create<'system' | 'light' | 'dark'>({
    ...config,
    values: ['system', 'light', 'dark'],
    defaultValue: 'system',
    attribute: 'data-color-scheme',
  })

  const init = (
    raw: Option.Option<string> = Option.none(),
    system: Model['system'] = 'unknown',
  ): Model => ({ ...preference.init(raw), system })

  const update = (
    model: Model,
    message: Message,
  ): Update.ReturnWithOutMessage<Model, Message, Preference.OutMessage> => {
    const apply = (next: Model) =>
      resolved(next) !== resolved(model) ? [Apply({ model: next })] : []

    switch (message._tag) {
      case 'GotPreferenceMessage': {
        const result = preference.update(model, message.message)
        const next = { value: result.model.value, system: model.system }
        return {
          ...result,
          model: next,
          commands: [
            ...Command.mapMessages(result.commands ?? [], message =>
              Message.GotPreferenceMessage({ message }),
            ),
            ...apply(next),
          ],
        }
      }
      case 'ChangedSystem': {
        const next = { ...model, system: message.system }
        return { model: next, commands: apply(next) }
      }
      case 'CompletedApply':
        return { model }
    }
  }

  const changes = (): Stream.Stream<Message> =>
    Stream.merge(
      preference
        .changes()
        .pipe(Stream.map(message => Message.GotPreferenceMessage({ message }))),
      Stream.suspend(() =>
        typeof window === 'undefined' || typeof window.matchMedia !== 'function'
          ? Stream.empty
          : Subscription.fromEvent({
              target: window.matchMedia('(prefers-color-scheme: dark)'),
              type: 'change',
              mapEvent: event =>
                Message.ChangedSystem({
                  system: event.matches ? 'dark' : 'light',
                }),
            }),
      ),
    )

  return { init, update, changes, preference }
}

/** Focus ownership and recovery policy adapted from ui-sdk core's focus-recovery. */
import { Effect, Option, Queue, Schema, Stream } from 'effect'
import type { Update } from 'foldkit'
import * as Command from 'foldkit/command'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'
import { afterCommit } from 'foldkit/render'

export const Model = Schema.Struct({
  maybeFocusedKey: Schema.Option(Schema.String),
  version: Schema.Number,
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({ CompletedRecoverFocus: {} })
export type Message = typeof Message.Type

export const RecoverFocus = Command.define('RecoverFocus', {
  args: { targetId: Schema.String, lostId: Schema.String },
  messages: [Message.CompletedRecoverFocus],
  execute: ({ targetId, lostId }) =>
    afterCommit.pipe(
      Effect.andThen(
        Effect.sync(() => {
          const active = document.activeElement
          const lost = document.getElementById(lostId)
          if (
            active &&
            active !== document.body &&
            active.isConnected &&
            !lost?.contains(active)
          )
            return
          document.getElementById(targetId)?.focus({ preventScroll: true })
        }),
      ),
      Effect.as(Message.CompletedRecoverFocus()),
    ),
})

export type Target<Key extends string> =
  | Readonly<{ type: 'Item'; key: Key }>
  | Readonly<{ type: 'Fallback' }>

export type RecoveryInput<Key extends string> = Readonly<{
  previousKeys: ReadonlyArray<Key>
  nextKeys: ReadonlyArray<Key>
  isDisabled?: (key: Key) => boolean
}>

export const create = <Key extends string = string>() => {
  const init = (): Model => ({ maybeFocusedKey: Option.none(), version: 0 })
  const focused = (model: Model, key: Key): Model => ({
    ...model,
    maybeFocusedKey: Option.some(key),
  })
  const blurred = (model: Model): Model => ({
    ...model,
    maybeFocusedKey: Option.none(),
  })
  const recover = (
    model: Model,
    { previousKeys, nextKeys, isDisabled = () => false }: RecoveryInput<Key>,
  ): Readonly<{
    model: Model
    maybeRecovery: Option.Option<
      Readonly<{ lostKey: Key; target: Target<Key> }>
    >
  }> => {
    const lostKey = previousKeys.find(key =>
      Option.contains(model.maybeFocusedKey, key),
    )
    const index = previousKeys.findIndex(key => key === lostKey)
    if (lostKey === undefined || nextKeys.includes(lostKey))
      return { model, maybeRecovery: Option.none() }
    const survives = (key: Key) => nextKeys.includes(key) && !isDisabled(key)
    const key =
      previousKeys.slice(index + 1).find(survives) ??
      previousKeys.slice(0, index).reverse().find(survives)
    return {
      model: { ...blurred(model), version: model.version + 1 },
      maybeRecovery: Option.some({
        lostKey,
        target:
          key === undefined ? { type: 'Fallback' } : { type: 'Item', key },
      }),
    }
  }
  return { init, focused, blurred, recover }
}

const recovery = create()

export const CollectionModel = Schema.Struct({
  keys: Schema.Array(Schema.String),
  recovery: Model,
})
export type CollectionModel = typeof CollectionModel.Type

export const CollectionMessage = defineMessageUnion({
  FocusedItem: { key: Schema.String },
  BlurredItems: {},
  ReconciledItems: {
    keys: Schema.Array(Schema.String),
    enabledKeys: Schema.Array(Schema.String),
  },
  CompletedRecoverFocus: {},
})
export type CollectionMessage = typeof CollectionMessage.Type

export const initCollection = (): CollectionModel => ({
  keys: [],
  recovery: recovery.init(),
})

export const updateCollection = (
  model: CollectionModel,
  message: CollectionMessage,
  config: Readonly<{ itemId: (key: string) => string; fallbackId: string }>,
): Update.Return<CollectionModel, CollectionMessage> => {
  switch (message._tag) {
    case 'FocusedItem':
      return {
        model: {
          ...model,
          recovery: recovery.focused(model.recovery, message.key),
        },
      }
    case 'BlurredItems':
      return { model: { ...model, recovery: recovery.blurred(model.recovery) } }
    case 'CompletedRecoverFocus':
      return { model }
    case 'ReconciledItems': {
      const result = recovery.recover(model.recovery, {
        previousKeys: model.keys,
        nextKeys: message.keys,
        isDisabled: key => !message.enabledKeys.includes(key),
      })
      return {
        model: { keys: message.keys, recovery: result.model },
        commands: Option.match(result.maybeRecovery, {
          onNone: () => [],
          onSome: ({ lostKey, target }) => [
            RecoverFocus({
              lostId: config.itemId(lostKey),
              targetId:
                target.type === 'Item'
                  ? config.itemId(target.key)
                  : config.fallbackId,
            }),
          ],
        }),
      }
    }
  }
}

const collectionArgs = {
  keyAttribute: Schema.String,
  actionSelector: Schema.String,
}

export const collectionChanges = (
  element: Element,
  config: Readonly<{ keyAttribute: string; actionSelector: string }>,
): Stream.Stream<CollectionMessage> =>
  Stream.callback(queue =>
    Effect.gen(function* () {
      yield* Effect.acquireRelease(
        Effect.sync(() => {
          const selector = `[${config.keyAttribute}]`
          const emit = (message: CollectionMessage) =>
            Queue.offerUnsafe(queue, message)
          let signature = ''
          const reconcile = () => {
            const items = [...element.querySelectorAll<HTMLElement>(selector)]
            const keys = items.map(
              item => item.getAttribute(config.keyAttribute) ?? '',
            )
            const enabledKeys = items
              .filter(item => item.querySelector(config.actionSelector))
              .map(item => item.getAttribute(config.keyAttribute) ?? '')
            const nextSignature = JSON.stringify([keys, enabledKeys])
            if (nextSignature === signature) return
            signature = nextSignature
            emit(CollectionMessage.ReconciledItems({ keys, enabledKeys }))
          }
          const focus = (event: Event) => {
            const item =
              event.target instanceof Element
                ? event.target.closest(selector)
                : null
            const key = item?.getAttribute(config.keyAttribute)
            emit(
              key === null || key === undefined
                ? CollectionMessage.BlurredItems()
                : CollectionMessage.FocusedItem({ key }),
            )
          }
          const blur = (event: Event) => {
            const target = event.target
            queueMicrotask(() => {
              if (
                target instanceof Element &&
                target.isConnected &&
                !element.contains(element.ownerDocument.activeElement)
              )
                emit(CollectionMessage.BlurredItems())
            })
          }
          const observer = new MutationObserver(reconcile)
          observer.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'aria-disabled', 'data-limited'],
          })
          element.addEventListener('focusin', focus)
          element.addEventListener('focusout', blur)
          reconcile()
          return () => {
            observer.disconnect()
            element.removeEventListener('focusin', focus)
            element.removeEventListener('focusout', blur)
          }
        }),
        cleanup => Effect.sync(cleanup),
      )
      return yield* Effect.never
    }),
  )

export const ObserveCollection = Mount.defineStream(
  'ObserveFocusRecoveryCollection',
  {
    args: collectionArgs,
    messages: [
      CollectionMessage.FocusedItem,
      CollectionMessage.BlurredItems,
      CollectionMessage.ReconciledItems,
    ],
    execute: ({ element, ...config }) => collectionChanges(element, config),
  },
)

export const collectionMount = <Msg>(
  config: Readonly<{ keyAttribute: string; actionSelector: string }>,
  send: (message: CollectionMessage) => Msg,
) => Mount.mapMessage(ObserveCollection(config), send)

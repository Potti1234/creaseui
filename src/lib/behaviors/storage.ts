import { Effect, Option, Schema, Stream } from 'effect'
import * as Subscription from 'foldkit/subscription'

export const Descriptor = Schema.Struct({
  kind: Schema.Literals(['local', 'session', 'cookie']),
  id: Schema.String,
  maxAge: Schema.optional(Schema.Number),
  path: Schema.optional(Schema.String),
  sameSite: Schema.optional(Schema.Literals(['Lax', 'Strict', 'None'])),
  secure: Schema.optional(Schema.Boolean),
})

export type Descriptor = typeof Descriptor.Type

const webStorage = (storage: Descriptor): Storage =>
  storage.kind === 'local' ? window.localStorage : window.sessionStorage

export const get = (storage: Descriptor): Effect.Effect<string | null> =>
  Effect.sync(() => {
    try {
      if (storage.kind !== 'cookie')
        return webStorage(storage).getItem(storage.id)
      const prefix = `${encodeURIComponent(storage.id)}=`
      const cookie = document.cookie
        .split(';')
        .map(value => value.trim())
        .find(value => value.startsWith(prefix))
      return cookie === undefined
        ? null
        : decodeURIComponent(cookie.slice(prefix.length))
    } catch {
      return null
    }
  })

const write = (
  storage: Descriptor,
  value: string | null,
): Effect.Effect<boolean> =>
  Effect.sync(() => {
    try {
      if (storage.kind === 'cookie') {
        const secure = storage.secure ?? location.protocol === 'https:'
        document.cookie = `${encodeURIComponent(storage.id)}=${encodeURIComponent(value ?? '')}; Max-Age=${value === null ? 0 : (storage.maxAge ?? 31536000)}; Path=${storage.path ?? '/'}; SameSite=${storage.sameSite ?? 'Lax'}${secure ? '; Secure' : ''}`
      } else if (value === null) webStorage(storage).removeItem(storage.id)
      else webStorage(storage).setItem(storage.id, value)
      return true
    } catch {
      return false
    }
  })

export const set = (
  storage: Descriptor,
  value: string,
): Effect.Effect<boolean> => write(storage, value)

export const remove = (storage: Descriptor): Effect.Effect<boolean> =>
  write(storage, null)

export const available = (storage: Descriptor): Effect.Effect<boolean> =>
  Effect.sync(() => {
    try {
      return storage.kind === 'cookie'
        ? typeof document !== 'undefined'
        : webStorage(storage) !== undefined
    } catch {
      return false
    }
  })

export const changes = (storage: Descriptor): Stream.Stream<string | null> =>
  Stream.suspend(() =>
    storage.kind === 'cookie' || typeof window === 'undefined'
      ? Stream.empty
      : Subscription.fromEventFilterMap({
          target: window,
          type: 'storage',
          filterMapEvent: event => {
            try {
              return event instanceof StorageEvent &&
                (event.key === storage.id || event.key === null) &&
                event.storageArea === webStorage(storage)
                ? Option.some(event.newValue)
                : Option.none()
            } catch {
              return Option.none()
            }
          },
        }),
  )

export const script = (
  storage: Descriptor,
  options: Readonly<{
    attribute: `data-${string}`
    values: ReadonlyArray<string>
  }>,
): string | undefined => {
  if (storage.kind === 'cookie') return undefined
  if (!/^data-[\w-]+$/u.test(options.attribute))
    throw new Error('Expected a data-* attribute')
  const literal = (value: unknown): string =>
    JSON.stringify(value).replace(/</gu, '\\u003c')
  return `(()=>{try{const v=${storage.kind === 'local' ? 'localStorage' : 'sessionStorage'}.getItem(${literal(storage.id)});if(${literal(options.values)}.includes(v))document.currentScript.previousElementSibling.setAttribute(${literal(options.attribute)},v)}catch{}})()`
}

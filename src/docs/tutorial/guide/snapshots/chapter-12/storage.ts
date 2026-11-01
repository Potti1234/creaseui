// @ts-nocheck: snapshot of creaseui-demo chapter-12:src/storage.ts
import { Effect, Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import * as KeyValueStore from 'effect/unstable/persistence/KeyValueStore'

import { Issue, SEED } from './domain'

/* The issues and the theme choice live in the browser, under one versioned
   key. Reading happens once, in the app's Flags; every change of an issue
   or of the theme is saved by a Command.
   Storage is the KeyValueStore service, so tests can provide one that fails. */

export const STORAGE_KEY = 'crease-tasks/v1'

export const Stored = S.Struct({
  version: S.Literal(1),
  issues: S.Array(Issue),
  nextNumber: S.Number,
  isDark: S.Boolean,
})
export type Stored = typeof Stored.Type

export const Flags = S.Struct({
  issues: S.Array(Issue),
  nextNumber: S.Number,
  isDark: S.Boolean,
  /** Set when saved data existed but could not be read. */
  notice: S.NullOr(S.String),
})
export type Flags = typeof Flags.Type

const SAMPLE: Flags = {
  issues: SEED,
  nextNumber: 143,
  isDark: false,
  notice: null,
}

export const loadFlags: Effect.Effect<
  Flags,
  never,
  KeyValueStore.KeyValueStore
> = Effect.gen(function* () {
  const store = KeyValueStore.toSchemaStore(
    yield* KeyValueStore.KeyValueStore,
    Stored,
  )
  const stored = yield* store.get(STORAGE_KEY)
  return Option.match(stored, {
    onNone: () => SAMPLE,
    onSome: ({ issues, nextNumber, isDark }): Flags => ({
      issues,
      nextNumber,
      isDark,
      notice: null,
    }),
  })
}).pipe(
  Effect.catch(() =>
    Effect.succeed<Flags>({
      ...SAMPLE,
      notice:
        'Saved issues could not be read, so the sample issues are shown. Your next change replaces the saved data.',
    }),
  ),
)

export const SaveMessage = defineMessageUnion({
  SucceededSave: {},
  FailedSave: { reason: S.String },
})

/** Writes the issues. A newer save interrupts an older one still running. */
export const SaveIssues = Command.define('SaveIssues', {
  args: { issues: S.Array(Issue), nextNumber: S.Number, isDark: S.Boolean },
  messages: [SaveMessage.SucceededSave, SaveMessage.FailedSave],
  interrupt: true,
  execute: ({ issues, nextNumber, isDark }) =>
    Effect.gen(function* () {
      const store = KeyValueStore.toSchemaStore(
        yield* KeyValueStore.KeyValueStore,
        Stored,
      )
      yield* store.set(STORAGE_KEY, { version: 1, issues, nextNumber, isDark })
      return SaveMessage.SucceededSave()
    }).pipe(
      Effect.catch(error =>
        Effect.succeed(SaveMessage.FailedSave({ reason: String(error) })),
      ),
    ),
})

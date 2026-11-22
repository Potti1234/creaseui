import { Schema, Struct } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import * as Observe from './observe'

export const Entry = Schema.Struct({
  ...Struct.omit(Observe.Change.fields, ['phase']),
  id: Schema.String,
  reverted: Schema.optionalKey(Schema.Boolean),
})
export type Entry = typeof Entry.Type

export const Model = Schema.Struct({
  entries: Schema.Array(Entry),
  position: Schema.Number,
  keys: Schema.Array(Schema.String),
  coalesce: Schema.Boolean,
})
export type Model = typeof Model.Type

const AppliedChange = Schema.Struct({
  ref: Schema.String,
  key: Schema.String,
  value: Schema.Unknown,
})
type AppliedChange = typeof AppliedChange.Type

export const Message = defineMessageUnion({
  Recorded: { change: Observe.Change },
  Sought: { to: Schema.Number },
  UndidSource: { source: Schema.String },
  Cleared: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Apply: {
    changes: Schema.Array(AppliedChange),
    failed: Schema.Array(AppliedChange),
  },
})
export type OutMessage = typeof OutMessage.Type

export const init = (
  config: Readonly<{ keys?: ReadonlyArray<string>; coalesce?: boolean }> = {},
): Model => ({
  entries: [],
  position: 0,
  keys: config.keys ?? ['value', 'checked', 'pressed'],
  coalesce: config.coalesce ?? true,
})

export const entries = (model: Model): ReadonlyArray<Entry> => model.entries
export const position = (model: Model): number => model.position

const sameControl = (a: AppliedChange, b: AppliedChange): boolean =>
  a.ref === b.ref && a.key === b.key

const valueAt = (
  entries: ReadonlyArray<Entry>,
  position: number,
  control: AppliedChange,
): unknown => {
  const first = entries.find(entry => sameControl(entry, control))
  return entries
    .slice(0, position)
    .reduce(
      (value, entry) =>
        sameControl(entry, control) && !entry.reverted ? entry.value : value,
      first?.previous,
    )
}

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

const restore = (model: Model, steps: ReadonlyArray<AppliedChange>) => {
  const failed = steps.filter(
    step =>
      step.value === undefined ||
      model.entries.some(entry => sameControl(entry, step) && entry.redacted),
  )
  const changes = steps.filter(step => !failed.includes(step))
  return { changes, failed }
}

export const update = (model: Model, message: Message): UpdateReturn =>
  Message.match<UpdateReturn>(message, {
    Recorded: ({ change }) => {
      if (!model.keys.includes(change.key)) return { model }
      const kept = model.entries.slice(0, model.position)
      const last = kept.at(-1)
      if (
        model.coalesce &&
        last &&
        !last.reverted &&
        sameControl(last, change) &&
        last.source === change.source &&
        last.reason === change.reason &&
        change.reason !== 'item-press' &&
        change.reason !== 'imperative'
      ) {
        return {
          model: {
            ...model,
            entries: [
              ...kept.slice(0, -1),
              {
                ...last,
                value:
                  last.redacted || change.redacted
                    ? '[redacted]'
                    : change.value,
                previous:
                  last.redacted || change.redacted
                    ? '[redacted]'
                    : last.previous,
                redacted: last.redacted || change.redacted,
              },
            ],
          },
        }
      }
      const { phase: _phase, ...fields } = change
      const count = model.entries.reduce(
        (count, entry) => Math.max(count, Number(entry.id.slice(1))),
        0,
      )
      return {
        model: {
          ...model,
          entries: [
            ...kept,
            {
              ...fields,
              label: change.label ?? change.component,
              id: `e${count + 1}`,
            },
          ],
          position: kept.length + 1,
        },
      }
    },
    Sought: ({ to }) => {
      const target = Number.isNaN(to)
        ? model.position
        : Math.max(0, Math.min(model.entries.length, Math.trunc(to)))
      if (target === model.position) return { model }
      const touched = model.entries
        .slice(
          Math.min(target, model.position),
          Math.max(target, model.position),
        )
        .filter(
          (entry, index, all) =>
            all.findIndex(other => sameControl(other, entry)) === index,
        )
      const result = restore(
        model,
        touched.map(entry => ({
          ref: entry.ref,
          key: entry.key,
          value: valueAt(model.entries, target, entry),
        })),
      )
      return {
        model:
          result.changes.length === 0 ? model : { ...model, position: target },
        outMessage: OutMessage.Apply(result),
      }
    },
    UndidSource: ({ source }) => {
      const applied = model.entries.slice(0, model.position)
      const undone = applied.filter(
        entry => !entry.reverted && entry.source === source,
      )
      if (undone.length === 0) return { model }
      const touched = undone.filter(
        (entry, index) =>
          undone.findIndex(other => sameControl(other, entry)) === index,
      )
      const result = restore(
        model,
        touched.map(entry => ({
          ref: entry.ref,
          key: entry.key,
          value: valueAt(
            model.entries.map(entry =>
              entry.source === source ? { ...entry, reverted: true } : entry,
            ),
            model.position,
            entry,
          ),
        })),
      )
      return {
        model: {
          ...model,
          entries: model.entries.map(entry =>
            undone.includes(entry) &&
            !result.failed.some(step => sameControl(step, entry))
              ? { ...entry, reverted: true }
              : entry,
          ),
        },
        outMessage: OutMessage.Apply(result),
      }
    },
    Cleared: () => ({ model: { ...model, entries: [], position: 0 } }),
  })

const round = (value: unknown): unknown =>
  typeof value === 'number'
    ? Math.round(value * 100) / 100
    : value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).map(([key, inner]) => [key, round(inner)]),
        )
      : value

const show = (value: unknown): string =>
  Array.isArray(value)
    ? value.join(', ') || 'none'
    : typeof value === 'object' && value
      ? JSON.stringify(round(value)).replace(/"/g, '')
      : String(round(value))

export const describeEntry = (entry: Entry): string =>
  `${entry.source === 'agent' ? 'Agent' : 'You'} set ${entry.label ?? entry.component} to ${show(entry.value)}`

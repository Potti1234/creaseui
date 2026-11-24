import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Schema } from 'effect'

import * as Demo from '@/docs/behavior-demo'

import * as History from '../src/lib/behaviors/history.ts'
import * as Observe from '../src/lib/behaviors/observe.ts'

const change = (input: Partial<Parameters<typeof Observe.change>[0]> = {}) =>
  Observe.change({
    ref: 'region',
    component: 'select',
    label: 'Region',
    key: 'value',
    value: 'Frankfurt',
    previous: 'London',
    reason: 'item-press',
    source: 'agent',
    phase: 'Commit',
    ...input,
  })
const record = (
  model: History.Model,
  input: Partial<Parameters<typeof Observe.change>[0]> = {},
) =>
  History.update(model, History.Message.Recorded({ change: change(input) }))
    .model
const seek = (model: History.Model, to: number) =>
  History.update(model, History.Message.Sought({ to }))

describe('History recording', () => {
  it('initializes Schema state and filters keys with configurable defaults', () => {
    const model = History.init()
    assert.equal(Schema.is(History.Model)(model), true)
    assert.deepEqual(History.entries(model), [])
    assert.equal(History.position(model), 0)
    assert.deepEqual(model.keys, ['value', 'checked', 'pressed'])
    assert.equal(model.coalesce, true)
    assert.deepEqual(record(model, { key: 'open' }), model)
    assert.equal(
      record(History.init({ keys: ['open'] }), { key: 'open' }).entries.length,
      1,
    )
    assert.equal(record(History.init({ keys: [] })).entries.length, 0)
    for (const key of model.keys)
      assert.equal(record(model, { key }).entries.length, 1)
  })

  it('coalesces matching steps and commits keeping the earliest previous and id', () => {
    const first = record(History.init(), {
      phase: 'Live',
      reason: 'drag',
      value: 2,
      previous: 1,
    })
    const second = record(first, {
      phase: 'Live',
      reason: 'drag',
      value: 3,
      previous: 2,
    })
    const final = record(second, { reason: 'drag', value: 3, previous: 1 })
    assert.equal(final.entries.length, 1)
    assert.equal(final.entries[0]?.previous, 1)
    assert.equal(final.entries[0]?.value, 3)
    assert.equal(final.entries[0]?.id, first.entries[0]?.id)
    assert.equal(final.position, 1)
    assert.equal('phase' in final.entries[0]!, false)
    assert.equal(Schema.is(History.Entry)(final.entries[0]), true)
    assert.equal(
      record(second, { reason: 'drag', source: 'keyboard' }).entries.length,
      2,
    )
    assert.equal(
      record(second, { reason: 'drag', ref: 'other' }).entries.length,
      2,
    )
    assert.equal(
      record(second, { reason: 'drag', key: 'checked' }).entries.length,
      2,
    )
    assert.equal(record(second, { reason: 'typing' }).entries.length, 2)
    const uncoalesced = record(History.init({ coalesce: false }), {
      reason: 'drag',
    })
    assert.equal(record(uncoalesced, { reason: 'drag' }).entries.length, 2)
    for (const reason of ['item-press', 'imperative']) {
      assert.equal(
        record(record(History.init(), { reason }), { reason }).entries.length,
        2,
      )
    }
  })

  it('truncates redo when recording after seeking back and clears without applying', () => {
    const model = record(record(History.init()), {
      value: 'Paris',
      previous: 'Frankfurt',
    })
    const back = seek(model, 1).model
    const next = record(back, { value: 'Berlin', previous: 'Frankfurt' })
    assert.deepEqual(
      next.entries.map(entry => entry.value),
      ['Frankfurt', 'Berlin'],
    )
    assert.notEqual(next.entries[1]?.id, model.entries[1]?.id)
    assert.equal(next.position, 2)
    assert.deepEqual(History.update(next, History.Message.Cleared()), {
      model: History.init(),
    })
    assert.deepEqual(
      model.entries.map(entry => entry.value),
      ['Frankfurt', 'Paris'],
    )
  })
})

describe('History restoration', () => {
  it('seeks backward and forward emitting one final value per control', () => {
    const model = record(
      record(record(History.init()), { value: 'Paris', previous: 'Frankfurt' }),
      { ref: 'enabled', key: 'checked', value: true, previous: false },
    )
    const back = seek(model, -5)
    assert.equal(back.model.position, 0)
    assert.deepEqual(
      back.outMessage,
      History.OutMessage.Apply({
        changes: [
          { ref: 'region', key: 'value', value: 'London' },
          { ref: 'enabled', key: 'checked', value: false },
        ],
        failed: [],
      }),
    )
    const forward = seek(back.model, 99)
    assert.equal(forward.model.position, 3)
    assert.deepEqual(
      forward.outMessage,
      History.OutMessage.Apply({
        changes: [
          { ref: 'region', key: 'value', value: 'Paris' },
          { ref: 'enabled', key: 'checked', value: true },
        ],
        failed: [],
      }),
    )
    assert.equal(Schema.is(History.OutMessage)(forward.outMessage), true)
    assert.deepEqual(seek(model, 3), { model })
    assert.deepEqual(seek(History.init(), 1), { model: History.init() })
    assert.deepEqual(seek(model, NaN), { model })
  })

  it('reports redacted and undefined restores and stays when nothing can go back', () => {
    const model = record(History.init(), { secret: true })
    const back = seek(model, 0)
    assert.deepEqual(back.model, model)
    assert.deepEqual(
      back.outMessage,
      History.OutMessage.Apply({
        changes: [],
        failed: [{ ref: 'region', key: 'value', value: '[redacted]' }],
      }),
    )
    const missing = record(History.init(), { previous: undefined })
    assert.equal(seek(missing, 0).model.position, 1)
    const mixed = record(model, { ref: 'other' })
    assert.equal(seek(mixed, 0).model.position, 0)
  })

  it('undoes only the applied source preserving other sources and failed entries', () => {
    const model = record(
      record(
        record(record(History.init()), {
          source: 'keyboard',
          previous: 'Frankfurt',
          value: 'Paris',
        }),
        { previous: 'Paris', value: 'Berlin' },
      ),
      { ref: 'secret', secret: true },
    )
    const undone = History.update(
      model,
      History.Message.UndidSource({ source: 'agent' }),
    )
    assert.deepEqual(
      undone.outMessage,
      History.OutMessage.Apply({
        changes: [{ ref: 'region', key: 'value', value: 'Paris' }],
        failed: [{ ref: 'secret', key: 'value', value: '[redacted]' }],
      }),
    )
    assert.deepEqual(
      undone.model.entries.map(entry => entry.reverted),
      [true, undefined, true, undefined],
    )
    assert.equal(undone.model.position, 4)
    assert.equal(seek(undone.model, 1).outMessage?.changes[0]?.value, 'London')
    assert.deepEqual(
      History.update(model, History.Message.UndidSource({ source: 'missing' })),
      { model },
    )
    const back = seek(
      record(record(History.init(), { source: 'keyboard' }), { ref: 'other' }),
      1,
    ).model
    assert.deepEqual(
      History.update(back, History.Message.UndidSource({ source: 'agent' })),
      { model: back },
    )
    const reverted = History.update(
      record(History.init(), { reason: 'drag' }),
      History.Message.UndidSource({ source: 'agent' }),
    ).model
    assert.equal(record(reverted, { reason: 'drag' }).entries.length, 2)
  })
})

describe('History descriptions', () => {
  it('uses ui-sdk wording, fallbacks, lists, rounding and object formatting', () => {
    const describeValue = (
      value: unknown,
      input: Partial<Parameters<typeof Observe.change>[0]> = {},
    ) =>
      History.describeEntry(
        record(History.init(), { value, ...input }).entries[0]!,
      )
    assert.equal(describeValue('Frankfurt'), 'Agent set Region to Frankfurt')
    assert.equal(
      describeValue(true, { source: 'keyboard' }),
      'You set Region to true',
    )
    const { label: _label, ...unlabelled } = record(History.init(), {
      value: [],
    }).entries[0]!
    assert.equal(History.describeEntry(unlabelled), 'Agent set select to none')
    assert.equal(describeValue(['a', 'b']), 'Agent set Region to a, b')
    assert.equal(describeValue(1.234), 'Agent set Region to 1.23')
    assert.equal(describeValue({ x: 1.234 }), 'Agent set Region to {x:1.23}')
    assert.equal(
      describeValue('secret', { secret: true }),
      'Agent set Region to [redacted]',
    )
  })
})

describe('History staging', () => {
  type Field = Readonly<{ value: unknown; revision: number }>
  type Settings = Readonly<{
    fields: Readonly<Record<string, Field>>
    locked?: boolean
  }>
  const init = (): Settings => ({
    fields: {
      'region/value': { value: 'London', revision: 1 },
      'workspace/checked': { value: false, revision: 1 },
      'workspace/value': { value: 'Private', revision: 1 },
    },
  })
  const access = {
    read: (model: Settings, { ref, key }: { ref: string; key: string }) =>
      model.fields[`${ref}/${key}`],
    write: (
      model: Settings,
      { ref, key, value }: { ref: string; key: string; value: unknown },
    ): Settings => {
      const id = `${ref}/${key}`
      const field = model.fields[id]
      if (!field || model.locked) return model
      return {
        ...model,
        fields: {
          ...model.fields,
          [id]: { value, revision: field.revision + 1 },
        },
      }
    },
  }
  const stage = (model: Settings) =>
    History.stageChanges(
      model,
      [
        { ref: 'region', value: 'Paris' },
        { ref: 'workspace', key: 'checked', value: true },
        { ref: 'region', value: 'Frankfurt' },
      ],
      access,
    )

  it('stages the last suggestion per field and restores only those fields in reverse order', () => {
    const result = stage(init())
    assert.equal(Schema.is(History.Stage)(result.stage), true)
    assert.deepEqual(result.failed, [])
    assert.deepEqual(
      result.stage.map(item => [item.ref, item.before, item.value]),
      [
        ['region', 'London', 'Frankfurt'],
        ['workspace', false, true],
      ],
    )
    const edited = access.write(result.model, {
      ref: 'workspace',
      key: 'value',
      value: 'Renamed',
    })
    const order: string[] = []
    const rolledBack = History.rollbackStage(edited, result.stage, {
      ...access,
      write: (model, change) => {
        order.push(change.ref)
        return access.write(model, change)
      },
    })
    assert.deepEqual(order, ['workspace', 'region'])
    assert.deepEqual(rolledBack.failed, [])
    assert.equal(rolledBack.model.fields['region/value']?.value, 'London')
    assert.equal(rolledBack.model.fields['workspace/checked']?.value, false)
    assert.equal(rolledBack.model.fields['workspace/value']?.value, 'Renamed')
  })

  it('preserves newer writes, even when the newer edit returns to the staged value', () => {
    const result = stage(init())
    const edited = ['Paris', 'Frankfurt'].reduce(
      (model, value) =>
        access.write(model, { ref: 'region', key: 'value', value }),
      result.model,
    )
    const rolledBack = History.rollbackStage(edited, result.stage, access)
    assert.deepEqual(rolledBack.failed, [{ ref: 'region', key: 'value' }])
    assert.equal(
      rolledBack.model.fields['region/value'],
      edited.fields['region/value'],
    )
    assert.equal(rolledBack.model.fields['workspace/checked']?.value, false)
    const repeated = History.rollbackStage(
      rolledBack.model,
      result.stage,
      access,
    )
    assert.equal(repeated.model, rolledBack.model)
  })

  it('skips unavailable, refused and unchanged suggestions and can report rollback refusal', () => {
    const result = History.stageChanges(
      init(),
      [
        { ref: 'missing', value: 'secret' },
        { ref: 'region', value: 'London' },
        { ref: 'workspace', key: 'checked', value: true },
      ],
      access,
    )
    assert.deepEqual(result.failed, [{ ref: 'missing', key: 'value' }])
    assert.equal(result.stage.length, 1)
    const locked = { ...result.model, locked: true }
    assert.deepEqual(stage(locked).failed, [{ ref: 'region', key: 'value' }])
    assert.deepEqual(History.rollbackStage(locked, result.stage, access), {
      model: locked,
      failed: [{ ref: 'workspace', key: 'checked' }],
    })
  })

  it('can restore an object value from a serialized parent stage', () => {
    const original = { city: 'London' }
    const model = access.write(init(), {
      ref: 'region',
      key: 'value',
      value: original,
    })
    const preview = History.stageChanges(
      model,
      [{ ref: 'region', value: { city: 'Paris' } }],
      access,
    )
    const stage = Schema.decodeUnknownSync(History.Stage)(
      JSON.parse(JSON.stringify(preview.stage)),
    )
    const rolledBack = History.rollbackStage(preview.model, stage, access)
    assert.deepEqual(rolledBack.failed, [])
    assert.deepEqual(rolledBack.model.fields['region/value']?.value, original)
  })
})

describe('History staging demo', () => {
  it('previews without recording, then records acceptance or restores on discard', () => {
    const initial = Demo.init()
    const preview = Demo.update(initial, Demo.Message.PreviewedRegion()).model
    assert.equal(preview.region, 'Berlin')
    assert.equal(preview.history.entries.length, 0)
    const accepted = Demo.update(
      preview,
      Demo.Message.AcceptedRegionPreview(),
    ).model
    assert.equal(accepted.region, 'Berlin')
    assert.deepEqual(accepted.regionStage, [])
    assert.equal(accepted.history.entries[0]?.previous, 'London')
    assert.equal(accepted.history.entries[0]?.value, 'Berlin')
    const reverted = Demo.update(
      preview,
      Demo.Message.RevertedRegionPreview(),
    ).model
    assert.equal(reverted.region, 'London')
    assert.equal(reverted.history.entries.length, 0)
  })

  it('keeps a manual edit after discarding its superseded preview', () => {
    const preview = Demo.update(
      Demo.init(),
      Demo.Message.PreviewedRegion(),
    ).model
    const edited = Demo.update(
      preview,
      Demo.Message.ChangedRegion({ value: 'Paris' }),
    ).model
    const reverted = Demo.update(
      edited,
      Demo.Message.RevertedRegionPreview(),
    ).model
    assert.equal(reverted.region, 'Paris')
    assert.equal(reverted.history.entries[0]?.previous, 'London')
    assert.deepEqual(reverted.regionStage, [])
  })
})

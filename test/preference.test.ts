import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option, Schema } from 'effect'
import * as Preference from '../src/lib/behaviors/preference.ts'

const preference = Preference.create<'a' | 'b'>({
  values: ['a', 'b'],
  defaultValue: 'a',
  attribute: 'data-choice',
  storage: { kind: 'local', id: 'choice' },
})
describe('Preference', () => {
  it('exposes a schema restricted to its configured values', () => {
    assert.deepEqual(
      Schema.decodeUnknownSync(preference.Model)({ value: 'b' }),
      { value: 'b' },
    )
    assert.throws(() =>
      Schema.decodeUnknownSync(preference.Model)({ value: 'invalid' }),
    )
  })
  it('decodes missing and invalid storage to the default', () => {
    for (const raw of [null, undefined, '', 'invalid'])
      assert.deepEqual(preference.init(Option.fromNullishOr(raw)), {
        value: 'a',
      })
    assert.equal(preference.decode(Option.some('b')), 'b')
    assert.deepEqual(preference.attributes(preference.init(Option.some('b'))), {
      'data-choice': 'b',
    })
  })
  it('persists changes only and ignores invalid requested values', () => {
    const model = preference.init()
    for (const value of ['a', 'invalid'])
      assert.deepEqual(
        preference.update(model, Preference.Message.RequestedValue({ value })),
        { model },
      )
    const result = preference.update(
      model,
      Preference.Message.RequestedValue({ value: 'b' }),
    )
    assert.equal(result.model.value, 'b')
    assert.equal(result.commands?.length, 1)
    assert.deepEqual(
      result.outMessage,
      Preference.OutMessage.ChangedValue({ value: 'b', reason: 'set' }),
    )
  })
  it('restores and syncs without writing back, including removal and invalid data', () => {
    const restored = preference.update(
      preference.init(),
      Preference.Message.RestoredValue({ raw: 'b' }),
    )
    assert.equal(restored.outMessage?.reason, 'restore')
    const synced = preference.update(
      preference.init(),
      Preference.Message.ReceivedStoredValue({ raw: 'b' }),
    )
    assert.equal(synced.outMessage?.reason, 'storage-sync')
    assert.deepEqual(synced.commands, [])
    for (const raw of [null, 'invalid'])
      assert.equal(
        preference.update(
          synced.model,
          Preference.Message.ReceivedStoredValue({ raw }),
        ).model.value,
        'a',
      )
    assert.deepEqual(
      preference.update(
        synced.model,
        Preference.Message.ReceivedStoredValue({ raw: 'b' }),
      ),
      { model: synced.model },
    )
  })
})

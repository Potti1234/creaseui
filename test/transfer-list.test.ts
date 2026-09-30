import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as TransferList from '../src/ui/transfer-list.ts'

const options: ReadonlyArray<TransferList.TransferListOption> = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
]

describe('TransferList', () => {
  it('moves an option into the value on add', () => {
    const model = TransferList.init({ id: 't', value: ['a'] })
    const next = TransferList.update(
      model,
      TransferList.Message.ClickedTransferListAdd({
        value: 'b',
        label: 'B',
        index: 1,
      }),
      options,
    )
    assert.deepEqual(next.model.value, ['a', 'b'])
    assert.equal(next.outMessage?._tag, 'ChangedTransferList')
  })

  it('moves an option out of the value on remove', () => {
    const model = TransferList.init({ id: 't', value: ['a', 'b'] })
    const next = TransferList.update(
      model,
      TransferList.Message.ClickedTransferListRemove({
        value: 'a',
        label: 'A',
        index: 0,
      }),
      options,
    )
    assert.deepEqual(next.model.value, ['b'])
  })

  it('clears the whole selection', () => {
    const model = TransferList.init({ id: 't', value: ['a', 'b', 'c'] })
    const next = TransferList.update(
      model,
      TransferList.Message.ClickedTransferListClear(),
      options,
    )
    assert.deepEqual(next.model.value, [])
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as LogStream from '../src/ui/log-stream.ts'

describe('LogStream', () => {
  it('starts not following with nothing expanded', () => {
    const model = LogStream.init({ id: 'l' })
    assert.equal(model.scroller.isFollowing, false)
    assert.deepEqual(model.expandedIds, [])
  })

  it('honours an initial follow', () => {
    const model = LogStream.init({ id: 'l', isFollowing: true })
    assert.equal(model.scroller.isFollowing, true)
  })

  it('toggles an entry expanded id', () => {
    const model = LogStream.init({ id: 'l' })
    const next = LogStream.update(
      model,
      LogStream.Message.ToggledLogStreamEntry({ id: 'e1' }),
    )
    assert.deepEqual(next.model.expandedIds, ['e1'])
    const back = LogStream.update(
      next.model,
      LogStream.Message.ToggledLogStreamEntry({ id: 'e1' }),
    )
    assert.deepEqual(back.model.expandedIds, [])
  })
})

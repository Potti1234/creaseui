import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as ChatReasoning from '../src/ui/chat-reasoning.ts'

describe('ChatReasoning', () => {
  it('starts collapsed by default', () => {
    const model = ChatReasoning.init({ id: 'r' })
    assert.equal(model.isExpanded, false)
  })

  it('toggles expansion and emits the change out message', () => {
    const model = ChatReasoning.init({ id: 'r', isExpanded: true })
    const next = ChatReasoning.update(
      model,
      ChatReasoning.Message.ToggledChatReasoning(),
    )
    assert.equal(next.model.isExpanded, false)
    assert.equal(next.outMessage?._tag, 'ChangedChatReasoningExpansion')
  })
})

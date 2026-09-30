import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as CodeBlock from '@/lib/code-block'

describe('CodeBlock submodel', () => {
  it('initializes expanded with empty copy feedback', () => {
    assert.deepEqual(CodeBlock.init(), {
      copiedCode: null,
      isCollapsed: false,
    })
    assert.deepEqual(CodeBlock.init({ isCollapsed: true }), {
      copiedCode: null,
      isCollapsed: true,
    })
  })

  it('toggles collapse state', () => {
    const model = CodeBlock.init()
    const next = CodeBlock.update(model, CodeBlock.Message.ToggledCollapse())
    assert.equal(next.model.isCollapsed, true)
    assert.equal(next.commands, undefined)
    const back = CodeBlock.update(next.model, CodeBlock.Message.ToggledCollapse())
    assert.equal(back.model.isCollapsed, false)
  })

  it('issues a clipboard command when copy is clicked', () => {
    const model = CodeBlock.init()
    const next = CodeBlock.update(
      model,
      CodeBlock.Message.ClickedCopyCode({ code: 'x = 1' }),
    )
    assert.equal(next.model.copiedCode, null)
    assert.equal(next.commands?.length, 1)
  })

  it('records copied code and schedules feedback cleanup', () => {
    const model = CodeBlock.init()
    const next = CodeBlock.update(
      model,
      CodeBlock.Message.CompletedCopyCode({ code: 'x = 1' }),
    )
    assert.equal(next.model.copiedCode, 'x = 1')
    assert.equal(next.commands?.length, 1)
  })

  it('clears copy feedback only for the matching code', () => {
    const model = { copiedCode: 'x = 1', isCollapsed: false }
    const stale = CodeBlock.update(
      model,
      CodeBlock.Message.CompletedWaitBeforeClearingCodeBlockCopyFeedback({
        code: 'other',
      }),
    )
    assert.equal(stale.model.copiedCode, 'x = 1')
    const cleared = CodeBlock.update(
      model,
      CodeBlock.Message.CompletedWaitBeforeClearingCodeBlockCopyFeedback({
        code: 'x = 1',
      }),
    )
    assert.equal(cleared.model.copiedCode, null)
  })
})

describe('CodeBlock tokenizer', () => {
  it('produces ordered tokens inside each source line', () => {
    const code = "const x = 'hi';\n// comment\nx = 2;"
    const lines = CodeBlock.tokenize(code, 'typescript')
    assert.equal(lines.length, 3)
    for (const [index, line] of code.split('\n').entries()) {
      const tokens = lines[index] ?? []
      assert.ok(tokens.length > 0)
      for (const [tokenIndex, token] of tokens.entries()) {
        assert.ok(token.start < token.end)
        assert.ok(token.end <= line.length)
        const previous = tokens[tokenIndex - 1]
        assert.ok(previous === undefined || previous.end <= token.start)
      }
    }
  })

  it('tags strings, comments, numbers, and keywords', () => {
    const [line] = CodeBlock.tokenize("const x = 'hi'; // ok", 'typescript')
    const types = new Set((line ?? []).map(token => token.type))
    assert.ok(types.has('keyword'))
    assert.ok(types.has('string'))
    assert.ok(types.has('comment'))
  })

  it('splits multi-line code into source lines', () => {
    assert.deepEqual(CodeBlock.codeLines('a\nb\nc'), ['a', 'b', 'c'])
  })
})

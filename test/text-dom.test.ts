import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Window } from 'happy-dom'

import * as Text from '../src/lib/behaviors/text-dom.ts'

it('resolves labels and language within the current DOM scope', async () => {
  const window = new Window()
  try {
    const { document } = window
    const host = document.createElement('div')
    host.lang = 'fr_ca'
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    root.innerHTML =
      '<button>Copy <kbd aria-hidden="true">Ctrl+C</kbd></button><button aria-label="Delete"><span hidden>Icon</span></button>'
    const [copy, remove] = root.querySelectorAll('button')
    assert.ok(copy && remove)
    assert.equal(Text.labelOf(copy), 'Copy')
    assert.equal(Text.labelOf(remove), 'Delete')
    assert.equal(Text.pageLocale(copy), 'fr-CA')
    assert.equal(Text.toLocale('malformed!'), undefined)
    assert.equal(
      Text.userLocale({ languages: ['invalid!', 'en_us'], language: 'en' }),
      'en-US',
    )
  } finally {
    await window.happyDOM.close()
  }
})

it('recognizes explicit and legacy IME keyboard events', () => {
  assert.equal(Text.isComposing({ isComposing: true, keyCode: 13 }), true)
  assert.equal(Text.isComposing({ isComposing: false, keyCode: 229 }), true)
  assert.equal(Text.isComposing({ isComposing: false, keyCode: 13 }), false)
})

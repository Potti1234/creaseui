import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as Shortcuts from '../src/lib/behaviors/shortcuts.ts'

const event = {
  key: 'k',
  code: 'KeyK',
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
}

describe('Shortcuts', () => {
  it('formats platform-specific ARIA names and isolated display hints', () => {
    assert.equal(
      Shortcuts.toAriaKeyshortcuts('mod+shift+k', 'apple'),
      'Meta+Shift+K',
    )
    assert.equal(
      Shortcuts.toAriaKeyshortcuts('mod+opt+esc', 'other'),
      'Control+Alt+Escape',
    )
    assert.equal(
      Shortcuts.toAriaKeyshortcuts('cmd+return+up', 'other'),
      'Meta+Enter+ArrowUp',
    )
    assert.equal(
      Shortcuts.formatShortcut('mod+shift+k', 'apple'),
      '\u2066⌘⇧K\u2069',
    )
    assert.equal(
      Shortcuts.formatShortcut('mod+shift+k', 'other'),
      '\u2066Ctrl+Shift+K\u2069',
    )
    assert.equal(Shortcuts.formatShortcut('', 'other'), '\u2066\u2069')
    assert.equal(Shortcuts.toAriaKeyshortcuts('', 'apple'), '')
  })

  it('matches exact modifiers and shifted physical keys without confusing letters', () => {
    assert.equal(
      Shortcuts.matchesShortcut({ ...event, metaKey: true }, 'mod+k', 'apple'),
      true,
    )
    assert.equal(
      Shortcuts.matchesShortcut({ ...event, ctrlKey: true }, 'mod+k', 'other'),
      true,
    )
    assert.equal(
      Shortcuts.matchesShortcut(
        { ...event, ctrlKey: true, shiftKey: true },
        'mod+k',
        'other',
      ),
      false,
    )
    assert.equal(
      Shortcuts.matchesShortcut(
        { ...event, key: '!', code: 'Digit1', shiftKey: true },
        'shift+1',
        'other',
      ),
      true,
    )
    assert.equal(
      Shortcuts.matchesShortcut(
        { ...event, key: 'K', altKey: true },
        'alt+k',
        'other',
      ),
      true,
    )
    assert.equal(
      Shortcuts.matchesShortcut({ ...event, key: 'x' }, 'k', 'other'),
      false,
    )
    assert.equal(
      Shortcuts.matchesShortcut({ ...event, key: ' ' }, 'space', 'other'),
      true,
    )
  })

  it('detects typing targets and command modifiers', () => {
    for (const target of [
      { tagName: 'INPUT', type: 'text' },
      { tagName: 'TEXTAREA' },
      { tagName: 'SELECT' },
      { tagName: 'DIV', isContentEditable: true },
    ])
      assert.equal(Shortcuts.isTypingTarget(target), true)
    for (const target of [
      null,
      {},
      { tagName: 'INPUT', type: 'checkbox' },
      { tagName: 'BUTTON' },
    ])
      assert.equal(Shortcuts.isTypingTarget(target), false)
    assert.equal(Shortcuts.hasCommandModifier('mod+k'), true)
    assert.equal(Shortcuts.hasCommandModifier('alt+k'), true)
    assert.equal(Shortcuts.hasCommandModifier('shift+k'), false)
  })

  it('resolves newest enabled matches and skips typing unless allowed', () => {
    const first = { keys: 'k' }
    const second = { keys: 'k', isEnabled: () => false }
    const latest = { keys: 'k', allowInInput: true }
    const context = { platform: 'other' as const }
    assert.equal(
      Shortcuts.resolveShortcut([first, second], event, context),
      first,
    )
    assert.equal(
      Shortcuts.resolveShortcut([first, latest], event, context),
      latest,
    )
    assert.equal(Shortcuts.resolveShortcut([], event, context), undefined)
    const typing = { ...context, target: { tagName: 'INPUT' } }
    assert.equal(Shortcuts.resolveShortcut([first], event, typing), undefined)
    assert.equal(
      Shortcuts.resolveShortcut([first, latest], event, typing),
      latest,
    )
    const command = { keys: 'mod+k' }
    assert.equal(
      Shortcuts.resolveShortcut([command], { ...event, ctrlKey: true }, typing),
      command,
    )
  })
})

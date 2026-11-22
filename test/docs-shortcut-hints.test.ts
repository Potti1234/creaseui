import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  currentPlatform,
  formatShortcut,
} from '../src/lib/behaviors/shortcuts.ts'
import { commandExamples } from '../src/docs/components/pages/command/shared.ts'
import {
  dropdownMenuExamples,
  dropdownMenuFixtures,
  resolveItemConfig,
  type DropdownMenuItemSpec,
} from '../src/docs/components/pages/dropdown-menu/shared.ts'
import { menubarExamples } from '../src/docs/components/pages/menubar/shared.ts'

describe('display-only documentation shortcut hints', () => {
  const state = { checkedValues: [], radioValue: undefined }

  it('preserves platform hints without advertising bindings, including submenus', () => {
    const verify = (spec: DropdownMenuItemSpec): void => {
      const config = resolveItemConfig(spec, state, name => name)
      assert.equal('keys' in config, false)
      assert.equal(
        config.shortcut,
        spec.shortcut ??
          (spec.keys === undefined
            ? undefined
            : formatShortcut(spec.keys, currentPlatform())),
      )
      spec.submenu?.forEach(child => {
        assert.deepEqual(
          config.submenu?.itemToConfig(child.value),
          resolveItemConfig(child, state, name => name),
        )
        verify(child)
      })
    }
    dropdownMenuFixtures.forEach(fixture => fixture.items.forEach(verify))
  })

  it('keeps absent hints absent and explicit legacy hints unchanged', () => {
    assert.equal(
      resolveItemConfig({ value: 'plain', label: 'Plain' }, state, String)
        .shortcut,
      undefined,
    )
    assert.equal(
      resolveItemConfig(
        {
          value: 'custom',
          label: 'Custom',
          keys: 'mod+p',
          shortcut: 'Custom hint',
        },
        state,
        String,
      ).shortcut,
      'Custom hint',
    )
  })

  for (const renderer of ['tailwind', 'stylex', 'pleat'] as const) {
    it(`emits display-only configs in copyable ${renderer} examples`, () => {
      for (const examples of [
        commandExamples(renderer),
        dropdownMenuExamples(renderer),
        menubarExamples(renderer),
      ]) {
        const hinted = examples.filter(example =>
          example.code.includes('shortcut: formatShortcut('),
        )
        assert.ok(hinted.length > 0)
        for (const example of hinted) {
          assert.match(
            example.code,
            /import \{ currentPlatform, formatShortcut \} from '@\/lib\/behaviors\/shortcuts'/u,
          )
          assert.doesNotMatch(example.code, /\{ keys: item\.keys \}/u)
        }
      }
    })
  }
})

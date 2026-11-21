import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, it } from 'node:test'
import { Schema } from 'effect'
import * as ColorScheme from '../src/lib/behaviors/color-scheme.ts'
import * as Preference from '../src/lib/behaviors/preference.ts'

const scheme = ColorScheme.create()
describe('ColorScheme', () => {
  it('restricts model choices to system, light or dark', () => {
    assert.throws(() =>
      Schema.decodeUnknownSync(ColorScheme.Model)({
        value: 'invalid',
        system: 'light',
      }),
    )
  })
  it('resolves explicit choices and defaults to system with a light unknown fallback', () => {
    assert.equal(ColorScheme.resolved(scheme.init()), 'light')
    assert.equal(ColorScheme.resolved(scheme.init(null, 'dark')), 'dark')
    assert.equal(ColorScheme.resolved(scheme.init('light', 'dark')), 'light')
    assert.equal(ColorScheme.resolved(scheme.init('dark', 'light')), 'dark')
    assert.equal(scheme.init('invalid').value, 'system')
  })
  it('applies live system changes only when the resolved choice changes', () => {
    const changed = scheme.update(
      scheme.init(),
      ColorScheme.Message.ChangedSystem({ system: 'dark' }),
    )
    assert.equal(ColorScheme.resolved(changed.model), 'dark')
    assert.equal(changed.commands?.length, 1)
    const explicit = scheme.update(
      scheme.init('light'),
      ColorScheme.Message.ChangedSystem({ system: 'dark' }),
    )
    assert.equal(explicit.model.system, 'dark')
    assert.equal(explicit.commands?.length, 0)
    const selected = scheme.update(
      changed.model,
      ColorScheme.Message.GotPreferenceMessage({
        message: Preference.Message.RequestedValue({ value: 'light' }),
      }),
    )
    assert.equal(selected.model.system, 'dark')
    assert.equal(ColorScheme.resolved(selected.model), 'light')
  })
  it('keeps the pre-paint script equivalent for valid, absent, invalid and blocked storage', () => {
    const script = readFileSync(
      new URL('../index.html', import.meta.url),
      'utf8',
    ).match(/<script>([\s\S]*?)<\/script>/u)?.[1]
    assert.ok(script)
    for (const raw of [null, 'invalid', 'system', 'light', 'dark', 'blocked'])
      for (const system of ['light', 'dark'] as const) {
        let dark = false
        const style = { colorScheme: '' }
        runInNewContext(script, {
          localStorage: {
            getItem: () => {
              if (raw === 'blocked') throw new Error('blocked')
              return raw
            },
          },
          window: { matchMedia: () => ({ matches: system === 'dark' }) },
          document: {
            documentElement: {
              classList: {
                toggle: (_name: string, value: boolean) => {
                  dark = value
                },
              },
              style,
            },
          },
        })
        const expected = ColorScheme.resolved(
          scheme.init(raw === 'blocked' ? null : raw, system),
        )
        assert.equal(dark, expected === 'dark')
        assert.equal(style.colorScheme, expected)
      }
  })
})

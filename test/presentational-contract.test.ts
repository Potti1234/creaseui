import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const skins = (name: string): ReadonlyArray<string> => [
  readFileSync(`src/ui/${name}.ts`, 'utf8'),
  readFileSync(`src/stylex/${name}.ts`, 'utf8'),
]

test('Wave 5 helpers remain render-only in both skins', () => {
  for (const name of ['card', 'badge', 'item', 'attachment', 'bubble', 'kbd', 'label', 'marker', 'native-select', 'separator', 'typography', 'button-group', 'input-group', 'input-otp', 'direction']) {
    for (const source of skins(name)) {
      assert.doesNotMatch(source, /export const Model\s*=/, `${name} must not own domain state`)
    }
  }
})

test('semantic and controlled policy is explicit across compound helpers', () => {
  for (const source of skins('card')) assert.match(source, /element\?: 'h2' \| 'h3' \| 'h4'/)
  for (const source of skins('label')) {
    assert.match(source, /isRequired\?: boolean/)
    assert.match(source, /isDisabled\?: boolean/)
  }
  for (const source of skins('marker')) assert.match(source, /'annotation' \| 'status' \| 'decorative'/)
  for (const source of skins('separator')) assert.match(source, /decorative\?: boolean/)
  for (const source of skins('input-otp')) {
    assert.match(source, /Autocomplete\('one-time-code'\)/)
    assert.match(source, /prefers-reduced-motion|motion-reduce/)
    assert.doesNotMatch(source, /console\.(?:log|debug)/)
  }
})

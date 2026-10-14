import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  FORBIDDEN_PROPS,
  isAppearanceSlot,
  isLayoutSlot,
  VARIANT_STYLE_FIELDS,
} from '../lib/strict/contracts.js'

const repo = fileURLToPath(new URL('../../..', import.meta.url))
const SLOT_FIELD =
  /^\s+(?:readonly\s+)?([a-z][A-Za-z]*(?:Class|ClassName|Classes|Attributes|Attrs|Style|Styles))\??:\s*([^\n]+)/gmu
const CSS_PROPERTY =
  /^(?:border\w*Style|outlineStyle|listStyle|fontStyle|textDecorationStyle|columnRuleStyle)$/u

test('every part-specific class/attribute/style prop in the renderers is classified', () => {
  const unclassified = []
  for (const dir of ['src/ui', 'src/stylex', 'src/pleat'])
    for (const file of readdirSync(path.join(repo, dir)))
      if (file.endsWith('.ts'))
        for (const [, field, type] of readFileSync(
          path.join(repo, dir, file),
          'utf8',
        ).matchAll(SLOT_FIELD)) {
          if (CSS_PROPERTY.test(field) || /^['"]/u.test(type.trim())) continue
          if (
            !isAppearanceSlot(field) &&
            !isLayoutSlot(field) &&
            !VARIANT_STYLE_FIELDS.has(field)
          )
            unclassified.push(`${dir}/${file}: ${field}`)
        }
  assert.deepEqual(unclassified, [])
})

test('part slots are appearance, layout slots and finite options are not', () => {
  for (const field of [
    'triggerClass',
    'triggerClassName',
    'contentClass',
    'itemsClassName',
    'closeButtonAttributes',
    'inputStyle',
    'triggerStyle',
  ])
    assert.ok(isAppearanceSlot(field), field)
  for (const field of [
    'layoutStyle',
    'triggerLayoutStyle',
    'citationStyle',
    'variant',
  ])
    assert.ok(!isAppearanceSlot(field), field)
  assert.ok(FORBIDDEN_PROPS.has('className'))
})

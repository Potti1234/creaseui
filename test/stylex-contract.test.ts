import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const componentFiles = ['badge.ts', 'button.ts', 'card.ts', 'input.ts'] as const
const componentSources = componentFiles.map(file => ({
  file,
  source: readFileSync(`src/stylex/${file}`, 'utf8'),
}))

describe('StyleX component authoring contract', () => {
  it('does not expose unrestricted styling escape hatches at call sites', () => {
    for (const { file, source } of componentSources) {
      assert.doesNotMatch(source, /\b(?:style|class|className|unsafeStyle)\??\s*:/u, file)
      assert.doesNotMatch(source, /props\.(?:style|class|className|unsafeStyle)\b/u, file)
      assert.match(source, /layoutStyle\?: ComponentLayoutStyle/u, file)
    }
  })

  it('keeps the Foldkit adapter static-only so inline styles cannot be lost', () => {
    const adapter = readFileSync('src/stylex/style.ts', 'utf8')
    const contract = readFileSync('src/stylex/contracts.ts', 'utf8')

    assert.match(adapter, /ReadonlyArray<StaticStyles>/u)
    assert.doesNotMatch(adapter, /StyleXStyles/u)
    assert.match(contract, /ComponentLayoutStyle = StaticStyles/u)
    assert.match(contract, /_InlineLayoutStyleIsRejected/u)
  })

  it('centralizes component color, border-color, and shadow values in tokens', () => {
    const directVisualLiteral =
      /\b(?:backgroundColor|borderColor|boxShadow|color):\s*(?:'[^']*'|`[^`]*`|"[^"]*")/u

    for (const { file, source } of componentSources) {
      assert.doesNotMatch(source, directVisualLiteral, file)
    }
  })

  it('keeps the public layout override deliberately narrow', () => {
    const contract = readFileSync('src/stylex/contracts.ts', 'utf8')
    const properties = [...contract.matchAll(/^  \| '([^']+)'$/gmu)].map(match => match[1])

    assert.deepEqual(properties, [
      'aspectRatio',
      'alignSelf',
      'flexBasis',
      'flexGrow',
      'flexShrink',
      'gridArea',
      'gridColumn',
      'gridColumnEnd',
      'gridColumnStart',
      'gridRow',
      'gridRowEnd',
      'gridRowStart',
      'height',
      'justifySelf',
      'margin',
      'marginBlock',
      'marginBlockEnd',
      'marginBlockStart',
      'marginBottom',
      'marginInline',
      'marginInlineEnd',
      'marginInlineStart',
      'marginLeft',
      'marginRight',
      'marginTop',
      'maxHeight',
      'maxWidth',
      'minHeight',
      'minWidth',
      'order',
      'width',
    ])
  })
})


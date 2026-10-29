import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

/* A0.13 regression: the theme names Inter but nothing loads it, so a fresh
   install renders in the system font. The font ships as a real dependency
   (@fontsource-variable/inter, imported by the theme CSS) and the stack
   names the loaded family first. */

const fontPackage = '@fontsource-variable/inter'

const themeItems = (): ReadonlyArray<{
  name: string
  dependencies?: ReadonlyArray<string>
  cssVars?: { theme?: Record<string, string> }
}> => JSON.parse(readFileSync('registry/theme/registry.json', 'utf8')).items

describe('base theme font', () => {
  it('declares the Inter package on both theme items', () => {
    for (const name of ['crease-theme', 'crease-theme-css']) {
      const item = themeItems().find(entry => entry.name === name)
      assert.ok(item, `${name} exists`)
      assert.ok(
        item.dependencies?.some(dependency =>
          dependency.startsWith(fontPackage),
        ),
        `${name} depends on ${fontPackage}`,
      )
    }
  })

  it('names Inter Variable first in every shipped font stack', () => {
    const stack = /^'Inter Variable'/u
    const theme = themeItems().find(entry => entry.name === 'crease-theme')
    assert.match(theme!.cssVars!.theme!['font-sans']!, stack)
    assert.match(
      readFileSync('registry/theme/crease-theme.css', 'utf8'),
      /--font-sans: 'Inter Variable'/u,
    )
    assert.match(
      readFileSync('src/styles.css', 'utf8'),
      /--font-sans: 'Inter Variable'/u,
    )
  })

  it('imports the font from the source and shipped stylesheets', () => {
    const statement = /@import '@fontsource-variable\/inter'/u
    // src/theme.css propagates to src/styles.css via @import './theme.css'
    // and into registry/theme/crease-theme.css via registry:generate.
    assert.match(readFileSync('src/theme.css', 'utf8'), statement)
    assert.match(
      readFileSync('registry/theme/crease-theme.css', 'utf8'),
      statement,
    )
  })
})

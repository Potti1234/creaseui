import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const read = (name: string): string =>
  readFileSync(`src/stylex/composition/${name}.ts`, 'utf8')

describe('constrained StyleX composition', () => {
  it('exports the five closed layout primitives', () => {
    const index = read('index')
    for (const primitive of ['box', 'grid', 'inline', 'stack', 'text']) {
      assert.match(index, new RegExp(`from './${primitive}'`, 'u'))
    }
  })

  it('does not expose arbitrary class or style escape hatches', () => {
    for (const file of [
      'box',
      'grid',
      'inline',
      'stack',
      'text',
      'semantic-layout',
      'recipes',
    ]) {
      const source = read(file)
      assert.doesNotMatch(
        source,
        /\b(?:class|className|layoutStyle|style|unsafeStyle|xstyle)\??\s*:/u,
        file,
      )
    }
  })

  it('keeps page recipes on semantic composition APIs', () => {
    const recipes = read('recipes')
    for (const recipe of [
      'dashboardShell',
      'settingsPage',
      'masterDetailPage',
      'dataExplorerPage',
      'commercePage',
    ]) {
      assert.match(recipes, new RegExp(`export const ${recipe}\\b`, 'u'))
    }
    assert.doesNotMatch(recipes, /@stylexjs\/stylex|h\.(?:Class|Style)\s*\(/u)
  })
})

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('ECharts Foldkit lifecycle adapter', () => {
  const adapter = readFileSync('src/lib/echarts.ts', 'utf8')
  const publicRecipe = readFileSync('src/ui/chart.ts', 'utf8')
  const stylexRecipe = readFileSync('src/stylex/integrations/echarts.ts', 'utf8')

  it('acquires and releases the imperative runtime through Mount', () => {
    assert.match(adapter, /Mount\.define/u)
    assert.match(adapter, /Effect\.acquireRelease/u)
    assert.match(adapter, /echarts\.init/u)
    assert.match(adapter, /chart\.dispose\(\)/u)
  })

  it('cleans up responsive observation and scheduled resize work', () => {
    assert.match(adapter, /new ResizeObserver/u)
    assert.match(adapter, /requestAnimationFrame\(\(\) => chart\.resize\(\)\)/u)
    assert.match(adapter, /resizeObserver\.disconnect\(\)/u)
    assert.match(adapter, /cancelAnimationFrame/u)
  })

  it('updates mounted charts only through an explicit finite Command', () => {
    assert.match(adapter, /Command\.define\('SyncChart'/u)
    assert.match(adapter, /chart\.setOption/u)
    assert.doesNotMatch(adapter.slice(adapter.indexOf('// VIEW')), /setOption/u)
  })

  it('requires an accessible alternative in both public skins and models finite states', () => {
    assert.match(publicRecipe, /accessibleAlternative: Html/u)
    assert.match(stylexRecipe, /accessibleAlternative: Html/u)
    for (const source of [adapter, stylexRecipe]) {
      assert.match(source, /'ready' \| 'loading' \| 'empty' \| 'error'/u)
      assert.match(source, /echart-accessible-alternative/u)
    }
  })
})
